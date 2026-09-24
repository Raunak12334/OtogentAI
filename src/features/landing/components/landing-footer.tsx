export function LandingFooter() {
  return (
    <footer className="font-heading border-solid border-ploy-neutral-primary-s0 bg-ploy-neutral-primary-s0 text-ploy-accent-primary-950 border-t pt-16 md:pt-20">
      <div className="px-6 md:px-20 lg:px-28">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid pb-16 grid-cols-1 lg:grid-cols-12 max-lg:gap-12 lg:gap-8">
            <div className="flex flex-col items-start lg:col-span-4 lg:pr-8">
              <div
                className="relative aspect-[3.7/1] w-28 md:w-32 self-start overflow-hidden"
                aria-label="Otogent"
              >
                <img
                  src="https://cdn.ploy.ai/327c9674-bb1e-41d1-b8b0-baa118c3c9c2/user/f7a17419-chatgpt-image-sep-12-2026-09-46-50-pm.webp"
                  alt="Otogent"
                  width="2170"
                  height="725"
                  className="absolute left-[-28.1%] top-[-44%] h-auto w-[156.25%] max-w-none mix-blend-multiply"
                />
              </div>
              <p className="text-gray-500 leading-relaxed max-w-sm mt-4 text-sm">
                Build repeatable automations and agent-run systems. Coordinate
                the work, keep every handoff visible, and own the code Otogent
                helps create.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 max-md:gap-8 md:gap-6 lg:col-span-8">
              <div>
                <h3 className="text-ploy-accent-primary-950 font-semibold text-sm tracking-tight mb-4">
                  Product
                </h3>
                <ul className="text-gray-500 text-xs my-0 pl-0 space-y-2.5 list-none">
                  <li>
                    <a href="#platform" className="hover:text-ploy-accent-primary-950 transition-colors">Platform</a>
                  </li>
                  <li>
                    <a href="#workflow" className="hover:text-ploy-accent-primary-950 transition-colors">How it works</a>
                  </li>
                  <li>
                    <a href="#use-cases" className="hover:text-ploy-accent-primary-950 transition-colors">Use cases</a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-ploy-accent-primary-950 font-semibold text-sm tracking-tight mb-4">
                  Solutions
                </h3>
                <ul className="text-gray-500 text-xs my-0 pl-0 space-y-2.5 list-none">
                  <li>
                    <a href="#use-cases" className="hover:text-ploy-accent-primary-950 transition-colors">Technical founders</a>
                  </li>
                  <li>
                    <a href="#use-cases" className="hover:text-ploy-accent-primary-950 transition-colors">Engineering teams</a>
                  </li>
                  <li>
                    <a href="#use-cases" className="hover:text-ploy-accent-primary-950 transition-colors">Operations teams</a>
                  </li>
                  <li>
                    <a href="#use-cases" className="hover:text-ploy-accent-primary-950 transition-colors">Agencies</a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-ploy-accent-primary-950 font-semibold text-sm tracking-tight mb-4">
                  Resources
                </h3>
                <ul className="text-gray-500 text-xs my-0 pl-0 space-y-2.5 list-none">
                  <li>
                    <a href="#faq" className="hover:text-ploy-accent-primary-950 transition-colors">Docs</a>
                  </li>
                  <li>
                    <a href="#faq" className="hover:text-ploy-accent-primary-950 transition-colors">Tutorials</a>
                  </li>
                  <li>
                    <a href="#demo" className="hover:text-ploy-accent-primary-950 transition-colors">Case Studies</a>
                  </li>
                  <li>
                    <a href="#demo" className="hover:text-ploy-accent-primary-950 transition-colors">Blog</a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-ploy-accent-primary-950 font-semibold text-sm tracking-tight mb-4">
                  Company
                </h3>
                <ul className="text-gray-500 text-xs my-0 pl-0 space-y-2.5 list-none">
                  <li>
                    <a href="#cta" className="hover:text-ploy-accent-primary-950 transition-colors">Affiliates</a>
                  </li>
                  <li>
                    <a href="#cta" className="hover:text-ploy-accent-primary-950 transition-colors">Careers</a>
                  </li>
                  <li>
                    <a href="#hero" className="hover:text-ploy-accent-primary-950 transition-colors">Company Info</a>
                  </li>
                  <li>
                    <a href="/terms" className="hover:text-ploy-accent-primary-950 transition-colors">Terms of Service</a>
                  </li>
                  <li>
                    <a href="/privacy" className="hover:text-ploy-accent-primary-950 transition-colors">Privacy Policy</a>
                  </li>
                  <li>
                    <a href="/cookies" className="hover:text-ploy-accent-primary-950 transition-colors">Cookie Policy</a>
                  </li>
                  <li>
                    <a href="/privacy#eea-uk" className="hover:text-ploy-accent-primary-950 transition-colors">Data Processing</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-ploy-background-inverse text-ploy-text-inverse-secondary px-6 py-6 md:px-20 lg:px-28">
        <div
          style={{ fontFamily: "'Geist Mono', monospace" }}
          className="max-w-screen-xl mx-auto text-xs tracking-wide uppercase flex justify-between items-center gap-4 max-md:text-center max-md:flex-col md:text-left md:flex-row"
        >
          <div>COPYRIGHT © OTOGENT 2026</div>

          <div className="flex justify-center items-center gap-1.5">
            <span>DESIGNED AND BUILT BY THE AWESOME PEOPLE OF OTOGENT AI</span>
            <span className="text-ploy-accent-secondary">🩵</span>
          </div>

          <div className="text-ploy-text-inverse flex items-center gap-4 drop-shadow-[0_0_5px_color-mix(in_srgb,var(--ploy-text-inverse)_28%,transparent)]">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hover:text-ploy-accent-secondary transition-colors"
            >
              <svg role="img" aria-label="LinkedIn icon" viewBox="0 0 24 24" className="w-4 h-4 fill-current overflow-hidden">
                <title>LinkedIn</title>
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.39 9.74v-8.37H5.07v8.37h2.78z" />
              </svg>
            </a>

            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="hover:text-ploy-accent-secondary transition-colors"
            >
              <svg role="img" aria-label="X icon" viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current overflow-hidden">
                <title>X</title>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="hover:text-ploy-accent-secondary transition-colors"
            >
              <svg role="img" aria-label="YouTube icon" viewBox="0 0 24 24" className="w-4 h-4 fill-current overflow-hidden">
                <title>YouTube</title>
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-ploy-accent-secondary transition-colors"
            >
              <svg role="img" aria-label="Instagram icon" viewBox="0 0 24 24" className="w-4 h-4 fill-current overflow-hidden">
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
