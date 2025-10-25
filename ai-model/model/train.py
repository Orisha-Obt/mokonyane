import json
import os
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import FeatureUnion, Pipeline
from sklearn.preprocessing import FunctionTransformer
from sklearn.preprocessing import MinMaxScaler

# Add project root to path
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

# Import from shared utils
from model.utils import get_url_values, numeric_features, NUMERIC_FEATURE_NAMES, COMMON_TLDS

# ---------- Config ----------
CSV_FILE = ROOT / "data" / "urls_and_labels.csv"
MODEL_FILE = Path(__file__).resolve().parent / "url_pipeline.joblib"
RANDOM_STATE = 42
TEST_SIZE = 0.15
# ----------------------------

def validate_csv(filepath):
    try:
        # Read with error_bad_lines=False to skip problematic rows
        df = pd.read_csv(filepath, on_bad_lines='skip')
        
        # Check required columns
        if not {'url', 'label'}.issubset(df.columns):
            print("Error: CSV must contain 'url' and 'label' columns")
            sys.exit(1)
            
        # Check for any non-numeric values in label column
        if not pd.to_numeric(df['label'], errors='coerce').notnull().all():
            print("Error: 'label' column contains non-numeric values")
            sys.exit(1)
            
        return df
        
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        print("\nPlease ensure:")
        print("1. The CSV file contains exactly two columns: url,label")
        print("2. Each row has exactly one comma (no commas in URLs)")
        print("3. The label column contains only 0s and 1s")
        print("4. There are no empty rows or malformed data")
        sys.exit(1)

print(f"Loading data from {CSV_FILE}...")
df = validate_csv(CSV_FILE)
df = df.dropna(subset=['url', 'label'])
df['label'] = df['label'].astype(int)

print("Class distribution:")
print("0 (Benign):", (df['label'] == 0).sum())
print("1 (Malicious):", (df['label'] == 1).sum())

# Wrappers to be used in FeatureUnion
num_feat = FunctionTransformer(func=numeric_features, validate=False)

# Character n-gram TF-IDF
char_vec = TfidfVectorizer(analyzer='char_wb', ngram_range=(3,5), max_features=20000)

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
    ('clf', LogisticRegression(
        max_iter=2000,
        solver='saga',
        class_weight='balanced',  # Important for imbalanced malicious/benign data
        random_state=RANDOM_STATE,
        verbose=1
    ))
])

# Expand parameter grid for better tuning
param_grid = {
    'clf__C': [0.01, 0.05, 0.1, 0.2, 1.0],
    'clf__penalty': ['l1', 'l2']
}

# Update GridSearchCV to use multiple metrics
grid = GridSearchCV(
    pipeline, 
    param_grid, 
    cv=3, 
    scoring={
        'f1': 'f1',
        'precision': 'precision',
        'recall': 'recall',
        'accuracy': 'accuracy'
    },
    refit='f1',  # Still use f1 as primary metric
    n_jobs=-1, 
    verbose=1
)
print("Starting GridSearchCV ...")
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

print("\nDetailed Performance Analysis:")
print(f"Benign URLs (0) correctly identified: {cm[0][0]}")
print(f"Malicious URLs (1) correctly identified: {cm[1][1]}")
print(f"False positives (benign marked as malicious): {cm[0][1]}")
print(f"False negatives (malicious marked as benign): {cm[1][0]}")

# Calculate and print additional metrics
precision_malicious = cm[1][1] / (cm[1][1] + cm[0][1])
recall_malicious = cm[1][1] / (cm[1][1] + cm[1][0])
print(f"\nMalicious URL Detection:")
print(f"Precision: {precision_malicious:.4f}")
print(f"Recall: {recall_malicious:.4f}")