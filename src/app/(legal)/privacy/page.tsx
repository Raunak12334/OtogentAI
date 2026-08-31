import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Otogent AI",
  description:
    "Learn how Otogent AI collects, uses, and protects your data. Full privacy policy with GDPR and CCPA compliance.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://otogent.ai/privacy" },
};

const LAST_UPDATED = "August 31, 2026";

export default function PrivacyPolicyPage() {
  return (
    <article className="max-w-4xl mx-auto px-6 sm:px-8 py-14 sm:py-20">
      {/* Header */}
      <header className="mb-12 border-b border-gray-100 dark:border-neutral-800 pb-10">
        <p className="text-[12px] font-mono uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
          Legal
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-[13.5px] text-gray-500 dark:text-gray-400">
          Last updated: {LAST_UPDATED}
        </p>
        <p className="mt-4 text-[14.5px] leading-relaxed text-gray-600 dark:text-gray-300 max-w-2xl">
          This policy explains what data Otogent AI collects, why we collect it,
          how we use it, and what rights you have over it. We have written it in
          plain language on purpose — if anything is unclear, email us.
        </p>

        {/* Quick-nav */}
        <nav
          aria-label="Page sections"
          className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[12.5px]"
        >
          {[
            ["#who-we-are", "1. Who We Are"],
            ["#what-we-do", "2. What Otogent AI Does"],
            ["#information-we-collect", "3. Information We Collect"],
            ["#how-we-use", "4. How We Use Information"],
            ["#cookies", "5. Cookies"],
            ["#third-party-processors", "6. Third-Party Processors"],
            ["#data-retention", "7. Data Retention"],
            ["#your-rights", "8. Your Rights"],
            ["#international-transfers", "9. International Transfers"],
            ["#children", "10. Children"],
            ["#security", "11. Security"],
            ["#changes", "12. Changes"],
            ["#contact", "13. Contact"],
            ["#regional-supplements", "14. Regional Supplements"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="text-blue-600 dark:text-blue-400 hover:underline truncate"
            >
              {label}
            </a>
          ))}
        </nav>
      </header>

      <div className="prose prose-gray dark:prose-invert prose-sm sm:prose-base max-w-none [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:scroll-mt-20 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:leading-relaxed [&_p]:text-gray-600 dark:[&_p]:text-gray-300 [&_li]:text-gray-600 dark:[&_li]:text-gray-300 [&_table]:text-[13px] [&_th]:font-semibold [&_th]:text-gray-900 dark:[&_th]:text-white [&_td]:align-top [&_td]:py-2 [&_th]:py-2">

        {/* 1 */}
        <h2 id="who-we-are">1. Who We Are</h2>
        <p>
          Otogent AI is operated by <strong>OtogentLabs</strong> ("we," "us,"
          "our"). Our platform lets founders, engineers, and operators build,
          code, and scale products using autonomous AI agents.
        </p>
        <p>
          Contact:{" "}
          <a href="mailto:privacy@otogent.ai">privacy@otogent.ai</a> — we
          respond within 30 days.
        </p>

        {/* 2 */}
        <h2 id="what-we-do">2. What Otogent AI Does</h2>
        <p>
          Otogent AI is an AI-powered launchpad: you describe what you want to
          build, and our autonomous agents design, code, and help deploy it.
          Using the platform requires creating an account. A freemium tier is
          available; paid plans unlock higher usage and advanced features.
        </p>

        {/* 3 */}
        <h2 id="information-we-collect">3. Information We Collect</h2>

        <h3>What We Do NOT Collect</h3>
        <p>
          We want to be upfront. Otogent AI does <strong>not</strong> collect:
        </p>
        <ul>
          <li>Government-issued IDs, social security numbers, or tax IDs</li>
          <li>Contact lists, address books, or social graphs</li>
          <li>Precise GPS location data</li>
          <li>
            Biometric data, health data, or any special-category personal data
            under GDPR Art. 9
          </li>
          <li>
            Payment card numbers — these are processed entirely by our payment
            processor (Stripe) and never touch our servers
          </li>
        </ul>

        <h3>Account Data</h3>
        <p>
          When you sign up: email address, username or display name, and (if
          you use OAuth) the public profile data the provider shares (name,
          avatar URL). We use this to identify your account and deliver the
          service.
        </p>

        <h3>Data You Submit (Prompts, Uploads, Inputs)</h3>
        <p>
          Any text, code, files, or URLs you send to our agents are processed
          to generate output and return it to you.{" "}
          <strong>
            Your submitted data is not used to train, fine-tune, or improve AI
            models
          </strong>{" "}
          — by us or by the underlying model providers we use via API (see
          §6 and §4).
        </p>

        <h3>Generated Output</h3>
        <p>
          AI-generated content (code, text, assets) is returned to your
          browser/dashboard. Output may be stored in your account workspace so
          you can access it later. We do not use your generated output to train
          AI models.
        </p>

        <h3>Analytics Data</h3>
        <p>
          We use Google Analytics 4 (GA4) to understand aggregate usage
          patterns — page views, feature usage, device/browser type,
          country-level location, session duration. Analytics data does not
          identify you individually. GA4 sets cookies listed in §5.
        </p>

        <h3>Usage and Log Data</h3>
        <p>
          Our servers automatically collect standard access logs: IP address,
          request path, HTTP method, response status code, and timestamp. These
          are used for security monitoring, debugging, and abuse prevention.
          Logs are retained for 30 days.
        </p>

        <h3>Payment Data</h3>
        <p>
          If you subscribe to a paid plan, Stripe processes your payment. We
          receive only the last 4 digits of your card, card type, expiry, and
          billing country — enough to display your subscription status. We never
          receive or store full card numbers.
        </p>

        {/* 4 */}
        <h2 id="how-we-use">4. How We Use Information</h2>
        <ul>
          <li>
            <strong>Service delivery</strong>: processing your requests,
            generating output, maintaining your workspace
          </li>
          <li>
            <strong>Account management</strong>: authentication, billing,
            plan limits
          </li>
          <li>
            <strong>Security and abuse prevention</strong>: detecting fraud,
            misuse, and unauthorized access
          </li>
          <li>
            <strong>Product improvement</strong>: aggregate analytics to
            understand which features work and which don't
          </li>
          <li>
            <strong>Legal compliance</strong>: responding to lawful requests,
            enforcing our Terms
          </li>
          <li>
            <strong>Communications</strong>: transactional emails (account
            confirmation, billing receipts, security alerts), and — with your
            consent — product updates
          </li>
        </ul>

        <h3>AI Model Training — Explicit Disclosure</h3>
        <p>
          <strong>
            Otogent AI does not use your submitted data or generated output to
            train, fine-tune, retrain, or evaluate any AI model.
          </strong>{" "}
          We access foundation model providers (e.g., Google Gemini, OpenAI)
          exclusively via their API. Under both providers' API terms, data
          submitted via API is not used for model training by default. We have
          not opted in to any data-sharing arrangement that would allow this.
        </p>

        {/* 5 */}
        <h2 id="cookies">5. Cookies</h2>
        <p>
          Otogent AI uses a small number of cookies. We do not use advertising
          cookies or third-party tracking pixels.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-neutral-800/50">
              <tr>
                <th className="border border-gray-200 dark:border-neutral-700 px-3 text-left">Cookie</th>
                <th className="border border-gray-200 dark:border-neutral-700 px-3 text-left">Type</th>
                <th className="border border-gray-200 dark:border-neutral-700 px-3 text-left">Purpose</th>
                <th className="border border-gray-200 dark:border-neutral-700 px-3 text-left">Duration</th>
                <th className="border border-gray-200 dark:border-neutral-700 px-3 text-left">How to Opt Out</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  name: "_ga",
                  type: "Analytics",
                  purpose: "Distinguishes users for aggregate Google Analytics measurement",
                  duration: "2 years",
                  optOut: "GA opt-out browser add-on or block third-party cookies",
                },
                {
                  name: "_ga_<container-id>",
                  type: "Analytics",
                  purpose: "Persists GA4 session state; used with _ga for session metrics",
                  duration: "2 years",
                  optOut: "Same as _ga",
                },
                {
                  name: "session",
                  type: "Essential",
                  purpose: "Authenticates your session across page loads",
                  duration: "Session / 7 days (remember me)",
                  optOut: "Required for the service; cannot be disabled",
                },
                {
                  name: "csrf",
                  type: "Essential",
                  purpose: "Prevents cross-site request forgery attacks",
                  duration: "Session",
                  optOut: "Required for security; cannot be disabled",
                },
                {
                  name: "quota",
                  type: "Functional",
                  purpose: "Tracks your free-tier usage quota per day",
                  duration: "24 hours",
                  optOut: "Clear browser data; resets on next visit",
                },
              ].map((row) => (
                <tr key={row.name} className="border-b border-gray-100 dark:border-neutral-800">
                  <td className="border border-gray-200 dark:border-neutral-700 px-3 font-mono text-[12px]">{row.name}</td>
                  <td className="border border-gray-200 dark:border-neutral-700 px-3">{row.type}</td>
                  <td className="border border-gray-200 dark:border-neutral-700 px-3">{row.purpose}</td>
                  <td className="border border-gray-200 dark:border-neutral-700 px-3 whitespace-nowrap">{row.duration}</td>
                  <td className="border border-gray-200 dark:border-neutral-700 px-3">{row.optOut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3">
          We use a cookie <strong>notice</strong> (not a consent banner) because
          we only use essential and analytics cookies — no advertising pixels or
          cross-site tracking. See our{" "}
          <Link href="/cookies" className="text-blue-600 dark:text-blue-400 hover:underline">
            Cookie Policy
          </Link>{" "}
          for full details and browser-level opt-out instructions.
        </p>
        <p>
          Otogent AI does not currently respond to Do Not Track (DNT) browser
          signals because no uniform DNT standard exists.
        </p>

        {/* 6 */}
        <h2 id="third-party-processors">6. Third-Party Processors</h2>
        <p>
          We share data with the following processors only to the extent
          necessary to operate the service:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-neutral-800/50">
              <tr>
                <th className="border border-gray-200 dark:border-neutral-700 px-3 text-left">Provider</th>
                <th className="border border-gray-200 dark:border-neutral-700 px-3 text-left">Purpose</th>
                <th className="border border-gray-200 dark:border-neutral-700 px-3 text-left">Privacy Policy</th>
              </tr>
            </thead>
            <tbody>
              {[
                { provider: "Vercel", purpose: "Hosting and edge delivery", url: "https://vercel.com/legal/privacy-policy" },
                { provider: "Neon (PostgreSQL)", purpose: "Serverless database — stores account data, sessions, workflows, and credentials", url: "https://neon.tech/privacy-policy" },
                { provider: "Google Analytics", purpose: "Aggregate usage analytics", url: "https://policies.google.com/privacy" },
                { provider: "Google (Gemini API)", purpose: "AI model processing (Gemini nodes in workflows)", url: "https://policies.google.com/privacy" },
                { provider: "Google OAuth", purpose: "Sign-in via Google account", url: "https://policies.google.com/privacy" },
                { provider: "OpenAI", purpose: "AI model processing (OpenAI nodes in workflows)", url: "https://openai.com/policies/privacy-policy" },
                { provider: "Anthropic", purpose: "AI model processing (Claude nodes in workflows)", url: "https://www.anthropic.com/privacy" },
                { provider: "Composio", purpose: "Third-party tool and API integrations for workflow actions", url: "https://composio.dev/privacy-policy" },
                { provider: "Inngest", purpose: "Background job orchestration and workflow execution", url: "https://www.inngest.com/privacy" },
                { provider: "Polar", purpose: "Subscription billing and payment processing", url: "https://polar.sh/legal/privacy" },
                { provider: "GitHub OAuth", purpose: "Sign-in via GitHub account", url: "https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" },
                { provider: "Sentry", purpose: "Error monitoring and performance tracing", url: "https://sentry.io/privacy/" },
                { provider: "PostHog (planned)", purpose: "Product analytics — we may integrate PostHog for deeper usage insights. This policy will be updated before activation.", url: "https://posthog.com/privacy" },
              ].map((row) => (
                <tr key={row.provider} className="border-b border-gray-100 dark:border-neutral-800">
                  <td className="border border-gray-200 dark:border-neutral-700 px-3 font-medium">{row.provider}</td>
                  <td className="border border-gray-200 dark:border-neutral-700 px-3">{row.purpose}</td>
                  <td className="border border-gray-200 dark:border-neutral-700 px-3">
                    <a href={row.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-[12px]">
                      Privacy Policy ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] text-gray-500 dark:text-gray-400">
          <strong>Analytics tools:</strong> We currently use Google Analytics 4
          for aggregate usage measurement. We may in the future integrate
          additional product analytics tools (such as PostHog) to better
          understand how features are used. Any new analytics integration will
          be reflected in an updated version of this policy before activation,
          with appropriate notice.
        </p>

        {/* 7 */}
        <h2 id="data-retention">7. Data Retention</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-neutral-800/50">
              <tr>
                <th className="border border-gray-200 dark:border-neutral-700 px-3 text-left">Data Category</th>
                <th className="border border-gray-200 dark:border-neutral-700 px-3 text-left">Retention</th>
              </tr>
            </thead>
            <tbody>
              {[
                { cat: "Submitted prompts and inputs", ret: "Not stored beyond the duration of the request" },
                { cat: "Generated output (workspace)", ret: "Until you delete it, or 90 days after account deletion" },
                { cat: "Account data", ret: "Until you delete your account; then purged within 30 days" },
                { cat: "Analytics aggregates (GA4)", ret: "14 months (Google Analytics default)" },
                { cat: "Server access logs", ret: "30 days" },
                { cat: "Payment records", ret: "7 years (legal/tax obligation)" },
                { cat: "Security event logs", ret: "90 days" },
              ].map((row) => (
                <tr key={row.cat} className="border-b border-gray-100 dark:border-neutral-800">
                  <td className="border border-gray-200 dark:border-neutral-700 px-3 font-medium">{row.cat}</td>
                  <td className="border border-gray-200 dark:border-neutral-700 px-3">{row.ret}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 8 */}
        <h2 id="your-rights">8. Your Rights</h2>

        <h3>GDPR (EEA/UK Residents)</h3>
        <p>You have the right to:</p>
        <ul>
          <li><strong>Access</strong> — request a copy of personal data we hold about you (Art. 15)</li>
          <li><strong>Rectification</strong> — correct inaccurate data (Art. 16)</li>
          <li><strong>Erasure</strong> — request deletion ("right to be forgotten") (Art. 17)</li>
          <li><strong>Restriction</strong> — limit how we process your data (Art. 18)</li>
          <li><strong>Portability</strong> — receive your data in a machine-readable format (Art. 20)</li>
          <li><strong>Objection</strong> — object to processing based on legitimate interest (Art. 21)</li>
          <li><strong>Withdraw consent</strong> — where processing is consent-based</li>
        </ul>

        <h3>CCPA (California Residents)</h3>
        <p>You have the right to:</p>
        <ul>
          <li>Know what personal information is collected, used, disclosed, or sold</li>
          <li>Delete personal information</li>
          <li>Correct inaccurate personal information</li>
          <li>Opt out of the sale or sharing of personal information</li>
        </ul>
        <p>
          <strong>Otogent AI does not sell or share personal information</strong>{" "}
          as defined by the CCPA/CPRA.
        </p>

        <h3>How to Exercise Your Rights</h3>
        <p>
          Email{" "}
          <a href="mailto:privacy@otogent.ai">privacy@otogent.ai</a> with
          subject line "Privacy Rights Request." We will respond within 30
          days. For account deletion, you can also use the account settings page
          directly. We may ask for identity verification before processing
          sensitive requests.
        </p>

        {/* 9 */}
        <h2 id="international-transfers">9. International Transfers</h2>
        <p>
          OtogentLabs operates primarily in the United States. If you access the
          platform from the EEA, UK, or elsewhere, your data may be transferred
          to and processed in the US and other countries where our processors
          operate.
        </p>
        <p>
          For transfers of EEA/UK data to the US, we rely on the European
          Commission's Standard Contractual Clauses (SCCs) and, where applicable,
          the UK International Data Transfer Agreement (IDTA). Our processors
          listed in §6 maintain their own transfer mechanisms.
        </p>

        {/* 10 */}
        <h2 id="children">10. Children</h2>
        <p>
          Otogent AI is not directed to children under 13 (US/COPPA) or under 16
          (EEA/GDPR). We do not knowingly collect personal information from
          children under these thresholds. If you believe a child has submitted
          data to our platform, contact us at{" "}
          <a href="mailto:privacy@otogent.ai">privacy@otogent.ai</a> and we will
          delete it promptly.
        </p>

        {/* 11 */}
        <h2 id="security">11. Security</h2>
        <p>
          We use industry-standard measures to protect your data:
        </p>
        <ul>
          <li>All data in transit is encrypted via TLS 1.2+ (HTTPS enforced)</li>
          <li>Data at rest is encrypted by our hosting provider (Vercel / cloud infrastructure)</li>
          <li>We do not store payment card data — Stripe handles all card processing</li>
          <li>Access to production systems is restricted to authorized personnel with MFA</li>
          <li>We monitor for suspicious activity and security events continuously</li>
        </ul>
        <p>
          No system is 100% secure. In the event of a data breach affecting your
          rights, we will notify you and relevant authorities as required by
          applicable law (GDPR: within 72 hours of discovery).
        </p>

        {/* 12 */}
        <h2 id="changes">12. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes
          will be posted at this URL with a new "Last updated" date. For
          significant changes — for example, new data collection categories or
          new third-party processors — we will notify you by email (if you have
          an account) or by a banner on the site. We encourage you to review
          this policy periodically.
        </p>

        {/* 13 */}
        <h2 id="contact">13. Contact</h2>
        <p>
          For privacy questions, data access requests, or complaints:
        </p>
        <ul>
          <li>
            Email:{" "}
            <a href="mailto:privacy@otogent.ai">privacy@otogent.ai</a>
          </li>
          <li>Response time: within 30 days</li>
          <li>
            EEA/UK supervisory authority complaint:{" "}
            <a
              href="https://edpb.europa.eu/about-edpb/about-edpb/members_en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Find your national DPA ↗
            </a>
          </li>
        </ul>

        {/* 14 */}
        <h2 id="regional-supplements">14. Regional Supplements</h2>

        <h3 id="eea-uk">EEA / UK Supplement (GDPR)</h3>
        <p>
          <strong>Legal bases for processing (GDPR Art. 6):</strong>
        </p>
        <ul>
          <li>
            <strong>Contract (Art. 6(1)(b))</strong>: processing necessary to
            deliver the service you signed up for — account management, AI
            generation, workspace storage
          </li>
          <li>
            <strong>Legitimate interest (Art. 6(1)(f))</strong>: security
            monitoring, fraud prevention, aggregate analytics
          </li>
          <li>
            <strong>Legal obligation (Art. 6(1)(c))</strong>: payment records
            retention, law enforcement requests
          </li>
          <li>
            <strong>Consent (Art. 6(1)(a))</strong>: marketing emails (you can
            withdraw at any time)
          </li>
        </ul>
        <p>
          <strong>Data Subject Rights (Art. 15–22):</strong> See §8. To
          exercise any right, email{" "}
          <a href="mailto:privacy@otogent.ai">privacy@otogent.ai</a>. Response
          within 30 days; may be extended to 90 days for complex requests (we
          will inform you).
        </p>
        <p>
          <strong>International transfers:</strong> We rely on Standard
          Contractual Clauses (Module 2: Controller-to-Processor) for transfers
          to the US, incorporated by reference into our processor agreements.
        </p>
        <p>
          <strong>Right to lodge a complaint:</strong> You have the right to
          lodge a complaint with your national Data Protection Authority (DPA).
          Find your DPA at{" "}
          <a
            href="https://edpb.europa.eu/about-edpb/about-edpb/members_en"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            edpb.europa.eu ↗
          </a>
          .
        </p>

        <h3>California Supplement (CCPA / CPRA)</h3>
        <p>
          The following table describes the categories of personal information
          we have collected in the past 12 months, their business purposes, and
          whether we have sold or shared them:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-neutral-800/50">
              <tr>
                <th className="border border-gray-200 dark:border-neutral-700 px-3 text-left">Category (Cal. Civ. Code §1798.140)</th>
                <th className="border border-gray-200 dark:border-neutral-700 px-3 text-left">Collected?</th>
                <th className="border border-gray-200 dark:border-neutral-700 px-3 text-left">Business Purpose</th>
                <th className="border border-gray-200 dark:border-neutral-700 px-3 text-left">Sold/Shared?</th>
              </tr>
            </thead>
            <tbody>
              {[
                { cat: "Identifiers (name, email, user ID)", col: "Yes", purpose: "Account management, authentication", sold: "No" },
                { cat: "Commercial information (subscription, billing)", col: "Yes", purpose: "Billing, plan management", sold: "No" },
                { cat: "Internet activity (logs, feature usage)", col: "Yes", purpose: "Security, analytics", sold: "No" },
                { cat: "Geolocation (country-level only via analytics)", col: "Yes (aggregate)", purpose: "Product analytics", sold: "No" },
                { cat: "Professional/employment info", col: "No", purpose: "—", sold: "No" },
                { cat: "Sensitive personal info (financial, biometric, etc.)", col: "No", purpose: "—", sold: "No" },
              ].map((row) => (
                <tr key={row.cat} className="border-b border-gray-100 dark:border-neutral-800">
                  <td className="border border-gray-200 dark:border-neutral-700 px-3">{row.cat}</td>
                  <td className="border border-gray-200 dark:border-neutral-700 px-3">{row.col}</td>
                  <td className="border border-gray-200 dark:border-neutral-700 px-3">{row.purpose}</td>
                  <td className="border border-gray-200 dark:border-neutral-700 px-3 font-medium">{row.sold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3">
          <strong>Do Not Sell or Share My Personal Information:</strong>{" "}
          Otogent AI does not sell or share personal information as defined
          under CCPA/CPRA. No opt-out mechanism is required; however, you may
          contact us at{" "}
          <a href="mailto:privacy@otogent.ai">privacy@otogent.ai</a> to
          confirm.
        </p>
        <p>
          <strong>Authorized agents:</strong> California residents may designate
          an authorized agent to submit a request on their behalf. We will
          require written proof of authorization.
        </p>

        {/* Disclaimer */}
        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-neutral-800 text-[12.5px] text-gray-400 dark:text-gray-500">
          <p>
            <strong>Legal disclaimer:</strong> This Privacy Policy is provided
            for informational purposes. While we have made every effort to
            ensure accuracy and compliance, this document does not constitute
            legal advice. We recommend having a qualified attorney review this
            policy for your specific jurisdiction before relying on it.
          </p>
        </div>
      </div>
    </article>
  );
}
