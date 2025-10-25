import React, { useState, useRef } from "react";

function Report() {
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [headers, setHeaders] = useState("");
  const [severity, setSeverity] = useState("low");
  const [files, setFiles] = useState([]);
  const [anonymous, setAnonymous] = useState(true);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  function validateUrl(value) {
    try {
      /* eslint-disable no-new */
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  function onFilesChange(e) {
    const list = Array.from(e.target.files).slice(0, 5); // limit to 5 files
    setFiles(list);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    if (!url || !validateUrl(url)) {
      setMessage({ type: "error", text: "Please provide a valid URL." });
      return;
    }

    if (!description.trim()) {
      setMessage({ type: "error", text: "Please add a short description." });
      return;
    }

    setSubmitting(true);

    try {
      const form = new FormData();
      form.append("url", url.trim());
      form.append("description", description.trim());
      form.append("headers", headers.trim());
      form.append("severity", severity);
      form.append("anonymous", anonymous ? "true" : "false");
      if (!anonymous) {
        form.append("reporter_name", name.trim());
        form.append("reporter_contact", contact.trim());
      }
      files.forEach((f, i) => form.append("attachment_" + i, f));

      // Replace /api/report with your real endpoint
      const resp = await fetch("/api/report", {
        method: "POST",
        body: form,
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.message || "Submission failed");
      }

      setUrl("");
      setDescription("");
      setHeaders("");
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setName("");
      setContact("");
      setAnonymous(true);
      setMessage({ type: "success", text: "Report submitted. Thank you." });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Network error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden">
        <header className="px-6 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <h1 className="text-2xl font-semibold">Report a Malicious Website</h1>
          <p className="mt-1 text-sm opacity-90">
            Provide the URL and supporting details. You can report anonymously.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="p-6 grid gap-6"
          encType="multipart/form-data"
        >
          {message && (
            <div
              role="status"
              className={`px-4 py-3 rounded ${
                message.type === "error"
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="grid gap-2">
            <label className="text-sm font-medium">
              Malicious URL (required)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/phish"
              required
              className="w-full px-4 py-3 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              aria-label="Malicious URL"
            />
            <p className="text-xs text-gray-500">
              Provide the full URL. Example: https://...
            </p>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">
              Short description (required)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
              placeholder="Describe why this is suspicious, what happened, or any indicators."
              className="w-full px-4 py-3 rounded border border-gray-200 resize-vertical focus:outline-none focus:ring-2 focus:ring-indigo-300"
              aria-label="Description"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Request headers (optional)
              </label>
              <textarea
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                rows={4}
                placeholder="Paste relevant request/response headers (copy-paste)."
                className="w-full px-4 py-3 rounded border border-gray-200 resize-vertical focus:outline-none focus:ring-2 focus:ring-indigo-300"
                aria-label="Headers"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Attachments (screenshots, HTML) — optional
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.html,.txt,.zip"
                multiple
                onChange={onFilesChange}
                className="block w-full text-sm text-gray-700"
                aria-label="Attachments"
              />
              <p className="text-xs text-gray-500">
                Up to 5 files. Screenshots help verification.
              </p>

              {files.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {files.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-xs"
                    >
                      <span className="font-medium">{f.name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFiles((prev) => prev.filter((_, idx) => idx !== i))
                        }
                        className="text-red-600 hover:underline ml-2"
                        aria-label={`Remove ${f.name}`}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="w-4 h-4"
                  aria-label="Report anonymously"
                />
                <span>Report anonymously</span>
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="px-3 py-2 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                aria-label="Severity"
              >
                <option value="low">Low — suspicious</option>
                <option value="medium">Medium — likely phishing</option>
                <option value="high">
                  High — credential capture / active fraud
                </option>
              </select>
            </div>

            <div className="text-right text-xs text-gray-500">
              <div>
                We respect your privacy. Verified reports help removals.
              </div>
            </div>
          </div>

          {!anonymous && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  Your name (optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  aria-label="Reporter name"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  Contact (email or phone) — optional
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-4 py-3 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder="you@example.com"
                  aria-label="Reporter contact"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded shadow transition disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit report"}
            </button>

            <button
              type="button"
              onClick={() => {
                setUrl("");
                setDescription("");
                setHeaders("");
                setFiles([]);
                if (fileInputRef.current) fileInputRef.current.value = "";
                setName("");
                setContact("");
                setAnonymous(true);
                setMessage(null);
              }}
              className="px-4 py-2 rounded border border-gray-200 text-sm"
            >
              Reset
            </button>
          </div>

          <footer className="pt-4 text-xs text-gray-500">
            By submitting you confirm this is a legitimate report. Do not submit
            private content unless necessary.
          </footer>
        </form>
      </div>
    </main>
  );
}

export default Report;
