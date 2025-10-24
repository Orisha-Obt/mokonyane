# Makonyane — Browser Extension + Reporting App
# REMEMBER OWASP TOP TEN TO PROTECT THE SOLUTION

Overview
--------
Makonyane is a two-part project that helps protect users from malicious or unwanted websites using a browser extension with an attached AI decision model, and a reporting web application that collects user reports to improve that model.

- Extension: A Chrome browser extension that uses an AI model to decide whether to allow or block navigation to a URL.
- Report: A React application that allows users to report malicious URLs and view/report history. Reports are used to label and improve the AI model used by the extension.

Repository structure
--------------------
- Extension/
  - Browser extension source (Chrome manifest, background/content scripts, UI, model integration)
  - Build artifacts for installation (e.g., a `dist/` or `build/` folder after bundling)
- report/
  - React application source
  - Frontend UI for submitting reports and viewing reported URLs
  - Build scripts (create-react-app, Vite, or similar)

High-level design
-----------------
1. URL protection in the browser extension
   - When the user navigates to a URL, the extension queries an AI model (locally or via a secure inference API) to evaluate the URL and context.
   - The AI model returns a decision (allow / block / warn) and optionally a confidence score and explanation.
   - The extension enforces the decision (block navigation, show warning UI, or allow) and logs the event for telemetry/reporting if enabled.

2. Reporting & training pipeline
   - The report React app collects user-submitted reports (malicious, suspicious, safe, context notes).
   - Submitted reports are stored in a backend or exported to a labeled dataset used for model training.
   - Periodic training (or continuous retraining) uses the aggregated, labeled data to update the AI model.
   - Updated model artifacts are published to the inference endpoint or packaged for local use in the extension.

Model integration options
-------------------------
- Remote inference
  - Extension calls a secure inference API (recommended for complex models or frequent updates).
  - Pros: easier updates and heavier models supported.
  - Cons: requires a hosted backend, network latency, and privacy considerations.

- Local model in the extension
  - Use ONNX, TensorFlow.js, or WebAssembly-based inference to run a small model inside the extension.
  - Pros: lower latency, better privacy, offline capability.
  - Cons: limited model size and complexity.

Security & privacy considerations
-------------------------------
- Minimize sensitive data sent off-device; consider hashing or tokenizing URL parts.
- When using remote inference, HTTPS + authentication is required.
- Provide transparent UI and settings so users can control telemetry and data sharing.
- Ensure stored reports are protected and comply with privacy policies and regulations.

Setup & development
-------------------
Prerequisites (examples)
- Node.js (LTS)
- npm or yarn
- Chrome (for extension testing)

Report app (React)
1. cd report
2. npm install
3. npm start
4. npm run build (to produce a production bundle)

Browser extension
1. cd Extension
2. Install dependencies (if using a bundler): npm install
3. Build: npm run build (or your chosen build command)
4. Load unpacked extension in Chrome:
   - Open chrome://extensions
   - Toggle Developer mode
   - Click "Load unpacked" and select the extension build folder (e.g., Extension/dist)

Running with model
- If using a remote inference server, configure the extension's API endpoint and API key in the extension settings (preferably via a secure config mechanism).
- If running a local model, ensure the built model files are included in the extension bundle and that the extension properly initializes the local runtime (TF.js, ONNX.js).

Data storage & backend
----------------------
This repo currently separates the frontend reporting UI from any backend. Suggested options:
- Lightweight backend (Node/Express, Flask, etc.) with a database (Postgres, MongoDB) to store reports and labels.
- Serverless functions + object storage for a low-maintenance setup.
- An export endpoint to download labeled data for offline model training.

Training & deployment
---------------------
- Maintain a labeled dataset (CSV/JSON/Parquet) derived from user reports and expert labels.
- Create a training pipeline (e.g., Python + PyTorch/TensorFlow) that:
  - Preprocesses URLs and contextual features,
  - Trains and validates the classifier,
  - Produces model artifacts for either remote inference or for conversion to a browser-friendly runtime (TF.js/ONNX).
- Version models and roll out updates carefully (A/B testing, canary rollout).

Contributing
------------
- Use issues for feature requests and bug reports.
- Add tests for any core logic (URL parsing, decision logic, reporting flows).
- Follow coding standards used in each folder (ESLint, Prettier, etc.).
- When adding model changes, include reproducible training scripts and dataset versioning.

Future improvements
-------------------
- Feedback loop: let users confirm or override decisions and surface that data to retraining.
- Heuristic + ML hybrid rules for explainability and immediate mitigations.
- Admin dashboard in the report app to review flagged URLs and manage model versions.

License and contact
-------------------
Specify your license here (e.g., MIT) and maintainer contact info.
