import React from "react";

function Hero() {
  return (
    <section className="p-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-col gap-4 items-stretch">
        {/* Layer 1: phishing stats */}
        <article className="flex-1 min-h-screen md:min-h-screen bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-8 shadow-sm overflow-auto">
          <header className="mb-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-red-800">
              Phishing attacks: prevalence & impact
            </h2>
            <p className="text-sm md:text-base text-red-700 mt-2 max-w-prose">
              Phishing remains one of the most common online threats. It targets
              individuals and organizations, leading to credential theft,
              financial loss and account takeover when successful.
            </p>
          </header>

          <section className="grid gap-4 md:grid-cols-2 mb-6">
            <div className="bg-red-100/60 p-4 rounded">
              <p className="text-xs text-red-700">Estimated scale</p>
              <p className="text-2xl font-bold text-red-800">
                Millions of attempts yearly
              </p>
              <p className="text-sm text-red-600 mt-1">
                Global reporting and telemetry show large volumes of
                social-engineering based attacks.
              </p>
            </div>

            <div className="bg-red-100/60 p-4 rounded">
              <p className="text-xs text-red-700">Common impact</p>
              <p className="text-2xl font-bold text-red-800">
                Credential & financial loss
              </p>
              <p className="text-sm text-red-600 mt-1">
                Victims often face account takeover, fraud, and privacy
                breaches.
              </p>
            </div>
          </section>

          <ul className="text-sm text-red-600 mb-6 list-disc list-inside space-y-1 max-w-prose">
            <li>
              Most breaches begin with social engineering or deceptive links.
            </li>
            <li>Phishing evolves quickly — staying informed reduces risk.</li>
            <li>
              Collective reporting helps platforms and defenders respond faster.
            </li>
          </ul>

          <a
            href="/stats"
            className="inline-block bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
            aria-label="View phishing statistics"
          >
            View detailed stats
          </a>
        </article>

        {/* Layer 2: reporting awareness */}
        <article className="flex-1 min-h-screen md:min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-8 shadow-sm overflow-auto">
          <header className="mb-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-blue-800">
              Report malicious sites — help protect others
            </h2>
            <p className="text-sm md:text-base text-blue-700 mt-2 max-w-prose">
              Use this platform to quickly report suspicious or confirmed
              phishing sites. Timely reports help takedown, blocklists and
              automated detection improve.
            </p>
          </header>

          <section className="grid gap-4 md:grid-cols-2 mb-6">
            <div className="bg-blue-100/60 p-4 rounded">
              <p className="text-xs text-blue-700">What to report</p>
              <p className="text-2xl font-bold text-blue-800">
                Suspicious URLs & pages
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Provide the URL, a short description and any attachments if
                available.
              </p>
            </div>

            <div className="bg-blue-100/60 p-4 rounded">
              <p className="text-xs text-blue-700">Reporter options</p>
              <p className="text-2xl font-bold text-blue-800">
                Anonymous or attributed
              </p>
              <p className="text-sm text-blue-600 mt-1">
                You can stay anonymous; providing contact info helps follow-up
                if needed.
              </p>
            </div>
          </section>

          <ul className="text-sm text-blue-600 mb-6 list-disc list-inside space-y-1 max-w-prose">
            <li>
              Fast, structured reports speed up takedowns and protect others.
            </li>
            <li>
              Your submissions feed threat intelligence used by defenders.
            </li>
            <li>
              We prioritize verified threats and respect reporter privacy.
            </li>
          </ul>

          <a
            href="/report"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Go to reporting page"
          >
            Report a site
          </a>
        </article>
      </div>
    </section>
  );
}

export default Hero;
