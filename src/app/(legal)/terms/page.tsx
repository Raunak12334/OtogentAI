import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Otogent AI",
  description:
    "Read the Otogent AI Terms of Service — acceptable use, AI output ownership, billing, and governing law.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://otogent.ai/terms" },
};

const LAST_UPDATED = "August 31, 2026";

export default function TermsOfServicePage() {
  return (
    <article className="max-w-4xl mx-auto px-6 sm:px-8 py-14 sm:py-20">
      {/* Header */}
      <header className="mb-12 border-b border-gray-100 dark:border-neutral-800 pb-10">
        <p className="text-[12px] font-mono uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
          Legal
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
          Terms of Service
        </h1>
        <p className="text-[13.5px] text-gray-500 dark:text-gray-400">
          Last updated: {LAST_UPDATED}
        </p>
        <p className="mt-4 text-[14.5px] leading-relaxed text-gray-600 dark:text-gray-300 max-w-2xl">
          These terms govern your use of Otogent AI. Please read them — by
          using the platform you agree to be bound by them.
        </p>

        {/* Quick-nav */}
        <nav
          aria-label="Page sections"
          className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[12.5px]"
        >
          {[
            ["#agreement", "1. Agreement"],
            ["#the-service", "2. The Service"],
            ["#eligibility", "3. Eligibility"],
            ["#accounts", "4. Accounts"],
            ["#acceptable-use", "5. Acceptable Use"],
            ["#your-content", "6. Your Content"],
            ["#generated-output", "7. Generated Output"],
            ["#ai-disclaimer", "8. AI Disclaimer"],
            ["#third-party-services", "9. Third-Party Services"],
            ["#billing", "10. Billing & Plans"],
            ["#intellectual-property", "11. Intellectual Property"],
            ["#termination", "12. Termination"],
            ["#disclaimer", "13. Disclaimer of Warranties"],
            ["#liability", "14. Limitation of Liability"],
            ["#indemnity", "15. Indemnity"],
            ["#governing-law", "16. Governing Law & Venue"],
            ["#changes", "17. Changes"],
            ["#contact", "18. Contact"],
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
        <h2 id="agreement">1. Agreement</h2>
        <p>
          By accessing or using{" "}
          <a href="https://otogent.ai">otogent.ai</a> or any Otogent AI
          service, you agree to be bound by these Terms of Service ("Terms"),
          our{" "}
          <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
            Privacy Policy
          </Link>
          , and our{" "}
          <Link href="/cookies" className="text-blue-600 dark:text-blue-400 hover:underline">
            Cookie Policy
          </Link>
          . If you do not agree, please do not use the service.
        </p>
        <p>
          "Otogent AI," "we," "us," and "our" refer to OtogentLabs. "You" and
          "user" refer to any individual or entity accessing the platform.
        </p>

        {/* 2 */}
        <h2 id="the-service">2. The Service</h2>
        <p>
          Otogent AI is an AI-powered launchpad that lets founders, engineers,
          and operators build, code, and scale products by conversing with
          autonomous AI agents. Agents can design software, write and review
          code, create assets, and assist with deployment.
        </p>
        <p>
          <strong>Fair-use limits:</strong> To keep the service fair and
          available for all users, the free tier is subject to daily and monthly
          usage quotas (displayed in your dashboard). Quotas may be changed with
          reasonable notice. Paid plans have higher or unlimited quotas as
          specified on the pricing page.
        </p>

        {/* 3 */}
        <h2 id="eligibility">3. Eligibility</h2>
        <p>
          You must be at least <strong>13 years old</strong> (or 16 years old
          if you are located in the EEA or UK) to use Otogent AI. By using the
          platform, you represent and warrant that you meet this age requirement.
          If you are using Otogent AI on behalf of a business entity, you
          represent that you have authority to bind that entity to these Terms.
        </p>

        {/* 4 */}
        <h2 id="accounts">4. Accounts</h2>
        <p>
          An account is required to use Otogent AI. You are responsible for:
        </p>
        <ul>
          <li>
            Keeping your login credentials confidential and not sharing them
            with others
          </li>
          <li>
            All activity that occurs under your account, whether authorized by
            you or not
          </li>
          <li>
            Providing accurate and truthful registration information and keeping
            it up to date
          </li>
          <li>
            Notifying us immediately at{" "}
            <a href="mailto:security@otogent.ai">security@otogent.ai</a> if you
            suspect unauthorized access
          </li>
        </ul>
        <p>
          We reserve the right to suspend or terminate accounts that provide
          false information or that we believe have been compromised.
        </p>

        {/* 5 */}
        <h2 id="acceptable-use">5. Acceptable Use</h2>
        <p>
          You agree not to use Otogent AI to create, submit, or process:
        </p>
        <h3>Prohibited Content</h3>
        <ul>
          <li>Content that is illegal under any applicable law</li>
          <li>
            Child sexual abuse material (CSAM) or any content that exploits,
            harms, or endangers minors
          </li>
          <li>
            Content that infringes intellectual property, privacy, or publicity
            rights of any third party
          </li>
          <li>
            Content that promotes, glorifies, or incites violence, terrorism,
            harassment, or hate based on protected characteristics
          </li>
          <li>
            Malware, ransomware, exploit code, or other malicious software
          </li>
        </ul>
        <h3>Prohibited Behaviors</h3>
        <ul>
          <li>
            Scraping, crawling, or automating requests beyond normal browser use
            without our written permission
          </li>
          <li>
            Attempting to bypass quotas, rate limits, paywalls, or security
            measures
          </li>
          <li>
            Reverse engineering, decompiling, disassembling, or attempting to
            extract the source code of the service
          </li>
          <li>
            Using the service for high-stakes automated decisions that affect
            individuals without human review (e.g., credit scoring, hiring,
            medical decisions)
          </li>
          <li>
            Reselling access to the service without our express written
            agreement
          </li>
          <li>
            Submitting content you do not have the legal right to process or
            reproduce
          </li>
        </ul>
        <p>
          We reserve the right to investigate suspected violations, block
          sessions or accounts without notice, and pursue legal action where
          appropriate.
        </p>

        {/* 6 */}
        <h2 id="your-content">6. Your Content</h2>
        <p>
          You retain all ownership rights in the content you submit to Otogent
          AI — including prompts, code, files, and any other inputs ("Your
          Content").
        </p>
        <p>
          By submitting Your Content, you grant OtogentLabs a{" "}
          <strong>
            limited, non-exclusive, worldwide, royalty-free license
          </strong>{" "}
          to process Your Content solely to deliver the requested output and
          return it to you. This license is scoped to the request and does not
          extend to other purposes.
        </p>
        <p>
          <strong>
            We do not store Your Content after the request completes, beyond
            what is necessary to deliver and display your output in your
            workspace.
          </strong>
        </p>
        <p>
          <strong>
            We do not use Your Content to train, fine-tune, or evaluate any AI
            model.
          </strong>
        </p>
        <p>
          You warrant that: (a) you have all rights necessary to submit Your
          Content; (b) Your Content does not infringe any third-party rights;
          and (c) your use complies with these Terms.
        </p>

        {/* 7 */}
        <h2 id="generated-output">7. Generated Output</h2>
        <p>
          You own the output generated by Otogent AI in response to your
          requests and may use it for any lawful purpose, including commercial
          use.
        </p>
        <p>You are solely responsible for:</p>
        <ul>
          <li>
            Verifying the accuracy, quality, and appropriateness of AI-generated
            output before publishing or relying on it
          </li>
          <li>
            Ensuring output does not infringe third-party trademarks, copyrighted
            works, or rights of publicity or privacy
          </li>
          <li>
            Complying with the terms of service of any website, platform, or API
            whose content you submitted for processing
          </li>
        </ul>
        <p>
          <strong>Copyright note:</strong> AI-generated content may not qualify
          for copyright protection in all jurisdictions. Consult a lawyer if
          copyright ownership of generated content is important to your use case.
        </p>
        <p>
          <strong>Image disclaimer:</strong> AI-generated images are not
          photographs of real individuals, places, or events. Any resemblance
          to actual persons or locations is coincidental.
        </p>

        {/* 8 */}
        <h2 id="ai-disclaimer">8. AI Disclaimer</h2>
        <p>
          Otogent AI uses probabilistic AI models to generate output. By their
          nature, these models may produce:
        </p>
        <ul>
          <li>Inaccurate, incomplete, or outdated information ("hallucinations")</li>
          <li>Unexpected visual artifacts in images or rendered content</li>
          <li>Mis-rendered code, syntax errors, or logically incorrect logic</li>
          <li>Content that inadvertently resembles copyrighted training data</li>
        </ul>
        <p>
          <strong>
            Otogent AI is a creative and development tool, not a source of
            factual truth.
          </strong>{" "}
          Always verify output before publishing, deploying, or making decisions
          based on it. We are not liable for damages resulting from your use of
          AI-generated output without verification.
        </p>

        {/* 9 */}
        <h2 id="third-party-services">9. Third-Party Services</h2>
        <p>
          Otogent AI uses AI models provided by third parties, including:
        </p>
        <ul>
          <li>
            <a
              href="https://ai.google.dev/gemini-api/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Google Gemini API ↗
            </a>
          </li>
          <li>
            <a
              href="https://openai.com/policies/terms-of-use"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              OpenAI API ↗
            </a>
          </li>
        </ul>
        <p>
          When your inputs are processed by these providers, their terms of
          service and privacy policies also apply to that processing. By using
          Otogent AI, you acknowledge and agree to the applicable terms of each
          underlying model provider. We recommend reviewing their policies.
        </p>
        <p>
          We are not responsible for the availability, performance, or output
          quality of third-party model providers, or for any changes they make
          to their services or terms.
        </p>

        {/* 10 */}
        <h2 id="billing">10. Billing & Plans</h2>
        <p>
          Otogent AI offers a free tier and paid subscription plans. The free
          tier is provided on a best-effort basis with no guarantees of
          availability, feature access, or output quality. Paid plans include
          the additional commitments described on the pricing page at the time
          of purchase.
        </p>
        <h3>Paid Plans</h3>
        <ul>
          <li>
            Subscriptions are billed in advance on a recurring basis (monthly or
            annually, as selected)
          </li>
          <li>
            Payments are processed by{" "}
            <a
              href="https://polar.sh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Polar
            </a>
            . By subscribing, you authorize us to charge your payment method on
            each billing cycle
          </li>
          <li>
            <strong>Auto-renewal:</strong> Subscriptions renew automatically
            unless cancelled before the renewal date. You can cancel at any time
            from your account settings
          </li>
          <li>
            <strong>Refunds:</strong> We do not offer refunds on subscription
            fees except where required by applicable law. If you cancel, your
            access continues until the end of the current billing period
          </li>
          <li>
            We reserve the right to change pricing with at least 30 days' notice
            to current subscribers
          </li>
        </ul>
        <h3>Free Tier</h3>
        <p>
          The free tier is provided "as is" with no SLA. We may rate-limit,
          suspend, or discontinue free-tier features at any time without prior
          notice. We are not liable for any interruption to the free tier.
        </p>

        {/* 11 */}
        <h2 id="intellectual-property">11. Intellectual Property</h2>
        <p>
          OtogentLabs owns all rights in: the Otogent AI name and logo,
          platform design and UI, underlying source code, proprietary
          infrastructure, models, templates, and curated reference content. No
          license to copy, modify, sublicense, or distribute any of the
          foregoing is granted by these Terms.
        </p>
        <p>
          Excluded from the above: Your Content (which you own per §6) and
          Generated Output (which you own per §7).
        </p>

        {/* 12 */}
        <h2 id="termination">12. Termination</h2>
        <p>
          <strong>By you:</strong> You may delete your account at any time from
          account settings. Deletion takes effect immediately; your workspace
          data will be purged within 30 days.
        </p>
        <p>
          <strong>By us:</strong> We may suspend or terminate your account at
          our discretion if you violate §5 (Acceptable Use) or any other
          material provision of these Terms, with or without prior notice.
          Termination for cause does not entitle you to a refund.
        </p>
        <p>
          Provisions that by their nature survive termination will remain in
          effect, including §7 (Generated Output), §8 (AI Disclaimer), §13
          (Disclaimer of Warranties), §14 (Limitation of Liability), §15
          (Indemnity), and §16 (Governing Law).
        </p>

        {/* 13 */}
        <h2 id="disclaimer">13. Disclaimer of Warranties</h2>
        <p className="uppercase font-medium tracking-wide text-[13px]">
          THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS,
          WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
          LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
          PURPOSE, TITLE, AND NON-INFRINGEMENT. OTOGENT AI DOES NOT WARRANT
          THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE, OR
          THAT AI-GENERATED OUTPUT WILL BE ACCURATE, APPROPRIATE, COMPLETE, OR
          FREE OF INFRINGING CONTENT. YOUR USE OF THE SERVICE IS AT YOUR SOLE
          RISK.
        </p>

        {/* 14 */}
        <h2 id="liability">14. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by applicable law, OtogentLabs and
          its officers, directors, employees, agents, and affiliates shall not
          be liable for any indirect, incidental, special, consequential,
          punitive, or exemplary damages — including loss of profits, data,
          goodwill, or business opportunities — arising out of or related to
          your use of the service.
        </p>
        <p>
          Our total liability to you for any claim arising out of or related to
          these Terms or the service shall not exceed{" "}
          <strong>
            the total amount you paid to us in the 12 months immediately
            preceding the event giving rise to the claim, or zero (0) if no
            amounts were paid (i.e., you are on a free plan).
          </strong>
        </p>
        <p>
          <strong>Jurisdictional carve-out:</strong> Some jurisdictions do not
          allow the exclusion or limitation of implied warranties, consequential
          damages, or liability caps. In those jurisdictions, our liability is
          limited to the maximum extent permitted by law, and the above
          limitations may not apply to you in full.
        </p>

        {/* 15 */}
        <h2 id="indemnity">15. Indemnity</h2>
        <p>
          You agree to indemnify, defend, and hold harmless OtogentLabs and its
          officers, directors, employees, agents, and affiliates from and
          against any claims, liabilities, damages, judgments, losses, costs,
          and expenses (including reasonable attorneys' fees) arising out of or
          relating to:
        </p>
        <ul>
          <li>Your Content or your use of Generated Output</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of any third-party right (including IP, privacy, or publicity rights)</li>
          <li>Your violation of any applicable law or regulation</li>
        </ul>

        {/* 16 */}
        <h2 id="governing-law">16. Governing Law & Venue</h2>
        <p>
          These Terms are governed by the laws applicable to the operator,
          without regard to conflict-of-law principles. As the operator's place
          of establishment is not yet determined, disputes arising out of or
          related to these Terms shall be brought in a court of competent
          jurisdiction mutually agreed upon by the parties, or failing agreement,
          in a court of competent jurisdiction in the country where the operator
          is principally established at the time the dispute arises.
        </p>
        <p>
          Nothing in this section prevents either party from seeking injunctive
          or other equitable relief in any court of competent jurisdiction.
        </p>

        {/* 17 */}
        <h2 id="changes">17. Changes</h2>
        <p>
          We may update these Terms from time to time. Material changes (for
          example, changes to acceptable use, billing, or liability) will be
          posted at this URL with a new "Last updated" date, and — for
          account holders — notified by email at least 14 days in advance.
        </p>
        <p>
          <strong>
            Your continued use of Otogent AI after changes are posted
            constitutes your acceptance of the revised Terms.
          </strong>{" "}
          If you do not agree to the revised Terms, please stop using the service
          and delete your account.
        </p>

        {/* 18 */}
        <h2 id="contact">18. Contact</h2>
        <p>For Terms-related questions or legal notices:</p>
        <ul>
          <li>
            Email:{" "}
            <a href="mailto:legal@otogent.ai">legal@otogent.ai</a>
          </li>
          <li>Response time: within 30 business days</li>
        </ul>
        <p>
          <strong>DMCA / Copyright Complaint:</strong> If you believe content
          on Otogent AI infringes your copyright, please send a takedown notice
          to{" "}
          <a href="mailto:dmca@otogent.ai">dmca@otogent.ai</a> with: (1) a
          description of the copyrighted work; (2) the URL where the infringing
          content appears; (3) your contact information; (4) a statement of good
          faith belief; and (5) your signature. We will respond and, where
          appropriate, remove the content.
        </p>

        {/* Disclaimer */}
        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-neutral-800 text-[12.5px] text-gray-400 dark:text-gray-500">
          <p>
            <strong>Legal disclaimer:</strong> These Terms of Service are
            provided for informational purposes. While we have made every effort
            to ensure accuracy and enforceability, this document does not
            constitute legal advice. We recommend having a qualified attorney
            review these Terms for your specific jurisdiction before relying on
            them.
          </p>
        </div>
      </div>
    </article>
  );
}
