# ...existing code...
import json
import os
import sys
from pathlib import Path
from urllib.parse import urlparse
from collections import Counter
import re

import joblib
import numpy as np
import pandas as pd
import tldextract
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import FeatureUnion, Pipeline
from sklearn.preprocessing import FunctionTransformer
from sklearn.preprocessing import MinMaxScaler

# ---------- Config ----------
ROOT = Path(__file__).resolve().parent.parent
CSV_FILE = ROOT / "data" / "urls_and_labels.csv"
MODEL_FILE = Path(__file__).resolve().parent / "url_pipeline.joblib"
RANDOM_STATE = 42
TEST_SIZE = 0.15
# ----------------------------

if not CSV_FILE.exists():
    print(f"{CSV_FILE} not found. Create a CSV with header: url,label")
    sys.exit(1)

df = pd.read_csv(CSV_FILE)
df = df.dropna(subset=['url', 'label'])
df['label'] = df['label'].astype(int)

# Predefine common TLDs for one-hot/frequency-like encoding
COMMON_TLDS = [
    "com", "net", "org", "info", "co", "ru", "cn", "xyz", "top", "io", "biz",
    "us", "uk", "de", "jp", "in", "gov", "edu"
]

def numeric_features(urls):
    """
    Returns numeric/domain/TLD features for an iterable of url strings.
    """
    out = []
    for u in urls:
        s = str(u)
        lower = s.lower()
        length = len(s)
        digits = sum(c.isdigit() for c in s)
        dots = s.count('.')
        hyphens = s.count('-')
        at = s.count('@')
        has_ip = int(bool(re.search(r'\b\d{1,3}(?:\.\d{1,3}){3}\b', s)))
        has_https = int(lower.startswith('https'))

        # Domain parsing
        parsed = urlparse(s)
        ext = tldextract.extract(s)
        domain = ext.domain or (parsed.hostname or "")
        tld = ext.suffix or ""
        subdomain = ext.subdomain or ""
        hostname = ".".join([p for p in [subdomain, domain, tld] if p])

        domain_length = len(domain)
        hostname_length = len(hostname)
        num_subdomains = subdomain.count('.') + (1 if subdomain else 0)

        # entropy
        entropy = 0.0
        if hostname:
            probs = np.array(list(Counter(hostname).values())) / len(hostname)
            entropy = -(probs * np.log2(probs)).sum()

        suspicious_tokens = sum(1 for t in [
            'login','secure','account','verify','bank','confirm','signin',
            'admin','paypal','ebay','invoice'
        ] if t in lower)

        chunks = len([c for c in re.split(r'[^a-zA-Z0-9]+', s) if c])

        # TLD one-hot vector
        tld_vec = [1 if tld == t else 0 for t in COMMON_TLDS]
        tld_other = 0 if tld in COMMON_TLDS else 1
        tld_vec.append(tld_other)

        row = [
            length, digits, dots, hyphens, at, has_ip, has_https,
            domain_length, hostname_length, num_subdomains, entropy,
            suspicious_tokens, chunks
        ] + tld_vec

        out.append(row)

    return np.array(out)

# Names for numeric features (useful for interpreting coefficients)
NUMERIC_FEATURE_NAMES = [
    "length", "digits", "dots", "hyphens", "at_sign", "has_ip", "has_https",
    "domain_length", "hostname_length", "num_subdomains", "hostname_entropy",
    "suspicious_tokens", "chunks"
] + [f"tld_{t}" for t in COMMON_TLDS] + ["tld_other"]

# Wrappers to be used in FeatureUnion
num_feat = FunctionTransformer(func=numeric_features, validate=False)

# Character n-gram TF-IDF
char_vec = TfidfVectorizer(analyzer='char_wb', ngram_range=(3,5), max_features=20000)

def get_url_values(x):
    """Extract URL values from DataFrame"""
    return x['url'].values

# Replace lambda functions with named functions in FeatureUnion
union = FeatureUnion([
    ('tfidf', Pipeline([
        ('selector', FunctionTransformer(func=get_url_values, validate=False)),
        ('tfidf', char_vec)
    ])),
    ('numeric', Pipeline([
        ('selector', FunctionTransformer(func=get_url_values, validate=False)),
        ('nums', num_feat)
    ]))
])

X = df[['url']]
y = df['label'].values

# train/test split (guard: stratify requires multiple classes)
if len(np.unique(y)) > 1:
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )
else:
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )

pipeline = Pipeline([
    ('features', union),
    ('clf', LogisticRegression(max_iter=2000, solver='saga', class_weight='balanced', random_state=RANDOM_STATE))
])

param_grid = {'clf__C': [0.05, 0.2, 1.0]}
print("Starting GridSearchCV ...")
grid = GridSearchCV(pipeline, param_grid, cv=3, scoring='f1', n_jobs=-1, verbose=1)
grid.fit(X_train, y_train)

best = grid.best_estimator_
print("Best params:", grid.best_params_)

# Evaluate
y_pred = best.predict(X_test)
y_proba = None
clf = best.named_steps['clf']
if hasattr(clf, "predict_proba"):
    y_proba = best.predict_proba(X_test)[:, 1]
elif hasattr(clf, "decision_function"):
    df_dec = best.decision_function(X_test)
    mm = MinMaxScaler()
    y_proba = mm.fit_transform(df_dec.reshape(-1, 1)).ravel()

print("\nClassification report (test set):")
print(classification_report(y_test, y_pred, digits=4))

try:
    auc = roc_auc_score(y_test, y_proba)
    print(f"ROC AUC: {auc:.4f}")
except Exception:
    pass

cm = confusion_matrix(y_test, y_pred)
print("Confusion matrix:\n", cm)

# Save the fitted pipeline
joblib.dump(best, MODEL_FILE)
print(f"Saved pipeline to {MODEL_FILE}")

# --- Feature importance / interpretability ---
# Build feature name list for TF-IDF + numeric features
tfidf_vec = best.named_steps['features'].transformer_list[0][1].named_steps['tfidf']
try:
    tfidf_names = list(tfidf_vec.get_feature_names_out())
except Exception:
    tfidf_names = list(tfidf_vec.get_feature_names())

feature_names = tfidf_names + NUMERIC_FEATURE_NAMES

coef = clf.coef_[0]
abs_idx = np.argsort(-np.abs(coef))[:20]
print("Top weighted features (name, coef):")
for i in abs_idx:
    name = feature_names[i] if i < len(feature_names) else f"f{i}"
    print(f"{i:4d} {name:20s} {coef[i]:+.4f}")