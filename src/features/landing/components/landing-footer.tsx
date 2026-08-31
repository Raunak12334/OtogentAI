import Link from "next/link";

export function LandingFooter() {
  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "Build", href: "#benefits" },
        { label: "Pricing", href: "#cta" },
        { label: "Integrations", href: "#benefits" },
      ],
    },
    {
      title: "Solutions",
      links: [
        { label: "Enterprise", href: "#benefits" },
        { label: "SMB Owners", href: "#benefits" },
        { label: "IT Agencies", href: "#benefits" },
        { label: "Product Managers", href: "#benefits" },
        { label: "Operations Team", href: "#benefits" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Docs", href: "#faq" },
        { label: "Tutorials", href: "#faq" },
        { label: "Case Studies", href: "#benefits" },
        { label: "Blog", href: "#benefits" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "Affiliates", href: "#cta" },
        { label: "Careers", href: "#cta" },
        { label: "Company Info", href: "#hero" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Cookie Policy", href: "/cookies" },
        { label: "Data Processing Agreement", href: "/privacy#eea-uk" },
      ],
    },
  ];

  return (
    <footer className="bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100 border-t border-gray-100 dark:border-neutral-800 pt-16 sm:pt-20 pb-10 sm:pb-12 px-6 sm:px-12 md:px-20 lg:px-28 font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text','SF_Pro_Display',system-ui,sans-serif]">
      <div className="max-w-7xl mx-auto">
        {/* Top Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-gray-100 dark:border-neutral-800">
          {/* Left Brand Section: OTOGENT AI Wordmark in Quattrocento (no logo) */}
          <div className="lg:col-span-4 flex flex-col items-start pr-0 lg:pr-8">
            <span className="font-quattrocento text-[26px] sm:text-[30px] font-bold tracking-[0.04em] text-black dark:text-white">
              OTOGENT AI
            </span>
            <p className="mt-4 text-[13.5px] sm:text-[14px] leading-relaxed text-gray-500 dark:text-gray-400 max-w-sm">
              Build production-ready apps through conversation. Chat with AI
              agents that design, code, and deploy your startup from start to
              finish.
            </p>
          </div>

          {/* Right 4 Nav Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-[13.5px] font-semibold text-gray-900 dark:text-gray-100 mb-4 tracking-tight">
                  {section.title}
                </h3>
                <ul className="space-y-2.5 text-[13px] text-gray-500 dark:text-gray-400">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith("/") ? (
                        <Link
                          href={link.href}
                          className="hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className="hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left font-mono text-[10.5px] tracking-wider text-gray-400 dark:text-gray-500 uppercase">
          <div>COPYRIGHT &copy; OTOGENTLABS {new Date().getFullYear()}</div>

          <div className="flex items-center justify-center gap-1.5">
            <span>DESIGNED AND BUILT BY THE AWESOME PEOPLE OF OTOGENT AI</span>
            <span className="text-sky-400">🩵</span>
          </div>

          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hover:text-black dark:hover:text-white transition-colors"
            >
              <svg
                role="img"
                aria-label="LinkedIn icon"
                className="w-4 h-4 fill-current"
                viewBox="0 0 24 24"
              >
                <title>LinkedIn</title>
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.39 9.74v-8.37H5.07v8.37h2.78z" />
              </svg>
            </a>
            {/* X (Twitter) */}
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="hover:text-black dark:hover:text-white transition-colors"
            >
              <svg
                role="img"
                aria-label="X icon"
                className="w-3.5 h-3.5 fill-current"
                viewBox="0 0 24 24"
              >
                <title>X</title>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="hover:text-black dark:hover:text-white transition-colors"
            >
              <svg
                role="img"
                aria-label="YouTube icon"
                className="w-4 h-4 fill-current"
                viewBox="0 0 24 24"
              >
                <title>YouTube</title>
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-black dark:hover:text-white transition-colors"
            >
              <svg
                role="img"
                aria-label="Instagram icon"
                className="w-4 h-4 fill-current"
                viewBox="0 0 24 24"
              >
                <title>Instagram</title>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
