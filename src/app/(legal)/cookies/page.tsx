import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy — Otogent AI",
  description:
    "Understand how Otogent AI uses cookies — what they are, which ones we set, and how to manage or disable them.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://otogent.ai/cookies" },
};

const LAST_UPDATED = "August 31, 2026";

export default function CookiePolicyPage() {
  return (
    <article className="max-w-4xl mx-auto px-6 sm:px-8 py-14 sm:py-20">
      {/* Header */}
      <header className="mb-12 border-b border-gray-100 dark:border-neutral-800 pb-10">
        <p className="text-[12px] font-mono uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
          Legal
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
          Cookie Policy
        </h1>
        <p className="text-[13.5px] text-gray-500 dark:text-gray-400">
          Last updated: {LAST_UPDATED}
        </p>
        <p className="mt-4 text-[14.5px] leading-relaxed text-gray-600 dark:text-gray-300 max-w-2xl">
          This page explains what cookies Otogent AI sets, why we use them, and
          exactly how you can control or remove them. We keep it short and
          practical.
        </p>
      </header>

      <div className="prose prose-gray dark:prose-invert prose-sm sm:prose-base max-w-none [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:scroll-mt-20 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:leading-relaxed [&_p]:text-gray-600 dark:[&_p]:text-gray-300 [&_li]:text-gray-600 dark:[&_li]:text-gray-300 [&_table]:text-[13px] [&_th]:font-semibold [&_th]:text-gray-900 dark:[&_th]:text-white [&_td]:align-top [&_td]:py-2 [&_th]:py-2">

        {/* 1 */}
        <h2 id="what-are-cookies">1. What Are Cookies?</h2>
        <p>
          Cookies are small text files that a website stores in your browser
          when you visit. They help the site remember things — like whether
          you're logged in, or how many requests you've made today. They are not
          programs and cannot carry viruses or malware.
        </p>
        <p>
          Cookies can be <strong>first-party</strong> (set by otogent.ai
          directly) or <strong>third-party</strong> (set by services we embed,
          like Google Analytics). They can be <strong>session cookies</strong>{" "}
          (deleted when you close your browser) or{" "}
          <strong>persistent cookies</strong> (stored for a set duration).
        </p>

        {/* 2 — Notice vs Consent */}
        <h2 id="notice-vs-consent">2. Notice or Consent Banner?</h2>
        <p>
          Otogent AI uses <strong>essential</strong> and{" "}
          <strong>analytics</strong> cookies only — no advertising pixels, no
          cross-site tracking, no social media retargeting. Under GDPR and
          ePrivacy rules, analytics-only cookies require a{" "}
          <strong>cookie notice</strong> (informing you that cookies exist), not
          a full consent banner with accept/reject toggles. That is why you see
          a notice rather than a pop-up asking for consent.
        </p>
        <p>
          If we ever add advertising or tracking cookies in the future, we will
          update this policy and implement a proper consent banner before doing
          so.
        </p>

        {/* 3 — Full table */}
        <h2 id="cookies-we-use">3. Cookies We Use</h2>

        <h3>Essential Cookies</h3>
        <p>
          These are required for the service to function. They cannot be
          disabled without breaking the platform.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-neutral-800/50">
              <tr>
                <th className="border border-gray-200 dark:border-neutral-700 px-3 text-left">Cookie</th>
                <th className="border border-gray-200 dark:border-neutral-700 px-3 text-left">Purpose</th>
                <th className="border border-gray-200 dark:border-neutral-700 px-3 text-left">Duration</th>
                <th className="border border-gray-200 dark:border-neutral-700 px-3 text-left">Opt Out</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-neutral-800">
                <td className="border border-gray-200 dark:border-neutral-700 px-3 font-mono text-[12px]">session</td>
                <td className="border border-gray-200 dark:border-neutral-700 px-3">Authenticates your login session across page loads</td>
                <td className="border border-gray-200 dark:border-neutral-700 px-3 whitespace-nowrap">Session / 7 days</td>
                <td className="border border-gray-200 dark:border-neutral-700 px-3">Required — disabling breaks sign-in</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-neutral-800">
                <td className="border border-gray-200 dark:border-neutral-700 px-3 font-mono text-[12px]">csrf</td>
                <td className="border border-gray-200 dark:border-neutral-700 px-3">Prevents cross-site request forgery attacks on form submissions</td>
                <td className="border border-gray-200 dark:border-neutral-700 px-3 whitespace-nowrap">Session</td>
                <td className="border border-gray-200 dark:border-neutral-700 px-3">Required — disabling breaks form submissions</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Functional Cookies</h3>
        <p>
          These improve your experience but are not strictly required. Disabling
          them may affect some features.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-neutral-800/50">
              <tr>
                <th className="border border-gray-200 dark:border-neutral-700 px-3 text-left">Cookie</th>
                <th className="border border-gray-200 dark:border-neutral-700 px-3 text-left">Purpose</th>
                <th className="border border-gray-200 dark:border-neutral-700 px-3 text-left">Duration</th>
                <th className="border border-gray-200 dark:border-neutral-700 px-3 text-left">Opt Out</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-neutral-800">
                <td className="border border-gray-200 dark:border-neutral-700 px-3 font-mono text-[12px]">quota</td>
                <td className="border border-gray-200 dark:border-neutral-700 px-3">Counts your daily free-tier usage to enforce fair-use quotas</td>
                <td className="border border-gray-200 dark:border-neutral-700 px-3 whitespace-nowrap">24 hours</td>
                <td className="border border-gray-200 dark:border-neutral-700 px-3">Clear browser cookies — quota resets on next visit</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Analytics Cookies</h3>
        <p>
          Set by Google Analytics 4 to help us understand how users interact
          with the platform in aggregate. These cookies do not identify you
          personally.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-neutral-800/50">
              <tr>
                <th className="border border-gray-200 dark:border-neutral-700 px-3 text-left">Cookie</th>
                <th className="border border-gray-200 dark:border-neutral-700 px-3 text-left">Purpose</th>
                <th className="border border-gray-200 dark:border-neutral-700 px-3 text-left">Duration</th>
                <th className="border border-gray-200 dark:border-neutral-700 px-3 text-left">Opt Out</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-neutral-800">
                <td className="border border-gray-200 dark:border-neutral-700 px-3 font-mono text-[12px]">_ga</td>
                <td className="border border-gray-200 dark:border-neutral-700 px-3">Distinguishes unique visitors for aggregate usage measurement</td>
                <td className="border border-gray-200 dark:border-neutral-700 px-3 whitespace-nowrap">2 years</td>
                <td className="border border-gray-200 dark:border-neutral-700 px-3">
                  <a
                    href="https://tools.google.com/dlpage/gaoptout"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    GA opt-out add-on ↗
                  </a>{" "}
                  or block third-party cookies
                </td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-neutral-800">
                <td className="border border-gray-200 dark:border-neutral-700 px-3 font-mono text-[12px]">_ga_&lt;id&gt;</td>
                <td className="border border-gray-200 dark:border-neutral-700 px-3">Persists GA4 session state; used alongside _ga for session-level metrics</td>
                <td className="border border-gray-200 dark:border-neutral-700 px-3 whitespace-nowrap">2 years</td>
                <td className="border border-gray-200 dark:border-neutral-700 px-3">Same as _ga above</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 px-5 py-4 text-[13px] text-amber-800 dark:text-amber-300">
          <strong>Planned: PostHog analytics.</strong> We may integrate PostHog
          in the future as an additional product analytics tool. Any such
          integration will be listed here and in our{" "}
          <Link
            href="/privacy"
            className="underline hover:no-underline"
          >
            Privacy Policy
          </Link>{" "}
          before it is activated.
        </div>

        {/* 4 — Third-party */}
        <h2 id="third-party-cookies">4. Third-Party Cookies</h2>
        <p>
          The only third-party cookies currently set on Otogent AI come from{" "}
          <strong>Google Analytics 4</strong>. Google may use the data it
          collects through these cookies for its own purposes under its privacy
          policy. You can review{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Google's Privacy Policy ↗
          </a>{" "}
          for details.
        </p>
        <p>
          We do not use Meta Pixel, Google Ads conversion tracking, TikTok
          pixel, LinkedIn Insight Tag, or any other advertising or retargeting
          cookies.
        </p>

        {/* 5 — Managing */}
        <h2 id="managing-cookies">5. How to Manage Cookies</h2>

        <h3>Browser Settings</h3>
        <p>
          You can block or delete cookies at any time through your browser
          settings. Note that blocking essential cookies will prevent you from
          signing in to Otogent AI.
        </p>
        <ul>
          <li>
            <a
              href="https://support.google.com/chrome/answer/95647"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Chrome ↗
            </a>
          </li>
          <li>
            <a
              href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Firefox ↗
            </a>
          </li>
          <li>
            <a
              href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Safari ↗
            </a>
          </li>
          <li>
            <a
              href="https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge-168dab11-0753-043d-7c16-ede5947fc64d"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Microsoft Edge ↗
            </a>
          </li>
        </ul>

        <h3>Google Analytics Opt-Out</h3>
        <p>
          To opt out of Google Analytics tracking across all websites (not just
          Otogent AI), install the official{" "}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Google Analytics Opt-out Browser Add-on ↗
          </a>
          . Alternatively, enabling Enhanced Tracking Protection in Firefox or
          using Safari's Intelligent Tracking Prevention will block GA4 cookies
          automatically.
        </p>

        <h3>Mobile Devices</h3>
        <p>
          On iOS (Safari): Settings → Safari → Privacy & Security → Block All
          Cookies.
          <br />
          On Android (Chrome): Settings → Privacy and security → Cookies → Block
          third-party cookies.
        </p>

        {/* 6 — DNT */}
        <h2 id="do-not-track">6. Do Not Track</h2>
        <p>
          Otogent AI does not currently respond to browser Do Not Track (DNT)
          signals. This is because no uniform DNT standard has been adopted
          across browsers and web services. We disclose this as required by
          California law. You can still opt out of analytics tracking using the
          methods described in §5.
        </p>

        {/* 7 — Updates */}
        <h2 id="updates">7. Updates to This Policy</h2>
        <p>
          We will update this Cookie Policy if we add, change, or remove any
          cookies. The "Last updated" date at the top will reflect the most
          recent revision. For material changes — for example, adding
          advertising cookies — we will notify you via the site and update our{" "}
          <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
            Privacy Policy
          </Link>{" "}
          accordingly.
        </p>

        {/* 8 — Contact */}
        <h2 id="contact">8. Questions</h2>
        <p>
          Questions about our use of cookies? Email{" "}
          <a href="mailto:privacy@otogent.ai">privacy@otogent.ai</a>. We
          respond within 30 days.
        </p>

        {/* Disclaimer */}
        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-neutral-800 text-[12.5px] text-gray-400 dark:text-gray-500">
          <p>
            <strong>Legal disclaimer:</strong> This Cookie Policy is provided
            for informational purposes. We recommend having a qualified attorney
            review it for jurisdiction-specific compliance before relying on it.
          </p>
        </div>
      </div>
    </article>
  );
}
