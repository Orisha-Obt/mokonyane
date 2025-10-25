import React from "react";

function Hero() {
  return (
    <section className="p-4">
      <div className="max-w-6xl mx-auto flex flex-col gap-6 items-stretch">
        {/* Layer 1: phishing stats */}
        <article className="flex-1 min-h-screen bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg shadow-sm overflow-hidden">
          <div className="max-w-3xl mx-auto h-full flex flex-col justify-center items-center text-center p-8">
            <header className="mb-6">
              <h2 className="text-3xl md:text-4xl font-semibold text-red-800">
                Phishing attacks: prevalence & impact
              </h2>
              <p className="text-sm md:text-base text-red-700 mt-3">
                Phishing remains one of the most common online threats. It
                targets individuals and organizations, causing credential theft,
                financial loss, and account takeover.
              </p>
            </header>

            <section className="w-full grid gap-4 md:grid-cols-2 mb-6">
              <div className="bg-red-100/70 p-5 rounded text-left">
                <p className="text-xs text-red-700">Estimated scale</p>
                <p className="text-2xl font-bold text-red-800">
                  Millions of attempts yearly
                </p>
                <p className="text-sm text-red-600 mt-1">
                  Telemetry and reports indicate persistent, large-scale
                  social-engineering campaigns targeting users worldwide.
                </p>
              </div>

              <div className="bg-red-100/70 p-5 rounded text-left">
                <p className="text-xs text-red-700">Common impact</p>
                <p className="text-2xl font-bold text-red-800">
                  Credential & financial loss
                </p>
                <p className="text-sm text-red-600 mt-1">
                  Successful attacks often result in fraud, account takeover and
                  privacy breaches affecting individuals and businesses.
                </p>
              </div>
            </section>

            <ul className="text-sm text-red-600 mb-6 list-disc list-inside space-y-2 text-left w-full max-w-prose mx-auto">
              <li>Many breaches begin with deceptive emails or links.</li>
              <li>
                Attack techniques evolve quickly — awareness reduces risk.
              </li>
              <li>
                Shared reporting improves detection and response for everyone.
              </li>
            </ul>

            <div className="mt-4 flex justify-center w-full">
              <a
                href="/stats"
                className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-3 px-6 rounded shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label="View phishing statistics"
              >
                View detailed stats
              </a>
            </div>
          </div>
        </article>

        {/* Layer 2: reporting awareness */}
        <article className="flex-1 min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg shadow-sm overflow-hidden">
          <div className="max-w-3xl mx-auto h-full flex flex-col justify-center items-center text-center p-8">
            <header className="mb-6">
              <h2 className="text-3xl md:text-4xl font-semibold text-blue-800">
                Report malicious sites — help protect others
              </h2>
              <p className="text-sm md:text-base text-blue-700 mt-3">
                Use this platform to quickly report suspicious or confirmed
                phishing sites. Timely reports help removal, blocklisting and
                automated defenses improve.
              </p>
            </header>

            <section className="w-full grid gap-4 md:grid-cols-2 mb-6">
              <div className="bg-blue-100/70 p-5 rounded text-left">
                <p className="text-xs text-blue-700">What to report</p>
                <p className="text-2xl font-bold text-blue-800">
                  Suspicious URLs & pages
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Include the URL, a short description and any screenshots or
                  headers if available to speed verification.
                </p>
              </div>

              <div className="bg-blue-100/70 p-5 rounded text-left">
                <p className="text-xs text-blue-700">Reporter options</p>
                <p className="text-2xl font-bold text-blue-800">
                  Anonymous or attributed
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  You can report anonymously; providing contact info helps
                  follow-up when necessary.
                </p>
              </div>
            </section>

            <ul className="text-sm text-blue-600 mb-6 list-disc list-inside space-y-2 text-left w-full max-w-prose mx-auto">
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

            <div className="mt-4 flex justify-center w-full">
              <a
                href="/report"
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 px-6 rounded shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Go to reporting page"
              >
                Report a site
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default Hero;
