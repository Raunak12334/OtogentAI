export function LandingNavbar() {
  return (
    <header className="pointer-events-none fixed z-50 flex justify-center items-center px-4 top-0 inset-x-0 pt-4 md:pt-6">
      <nav
        aria-label="Primary navigation"
        className="border-solid border-ploy-border-primary/50 bg-ploy-neutral-primary-s0/80 max-w-full flex items-center shadow-[0px_4px_24px_-1px_color-mix(in_srgb,var(--ploy-text-primary)_7%,transparent),0px_2px_6px_-1px_color-mix(in_srgb,var(--ploy-text-primary)_4%,transparent)] pointer-events-auto backdrop-blur-xl rounded-full gap-1.5 px-2.5 py-1.5 md:gap-2 md:px-3.5 md:py-2 border"
      >
        <a
          aria-label="Otogent AI home"
          href="#hero"
          className="[color:inherit] flex shrink-0 items-center gap-2 pl-1 pr-2 py-0.5 rounded-full"
        >
          <img
            alt="Otogent Logo"
            width="32"
            height="32"
            src="/logo.svg"
            className="w-7 h-7 md:w-8 md:h-8 object-contain rounded-md overflow-clip"
          />
          <span className="font-sans hidden text-[1.0625rem] font-medium leading-none tracking-[-0.045em] text-ploy-text-primary sm:block">
            Otogent
          </span>
        </a>

        <div className="bg-ploy-border-primary/70 w-px h-3.5 shrink-0 rounded-full" />

        <div className="hidden md:flex shrink-0 items-center">
          <a
            href="#platform"
            className="text-ploy-text-secondary font-medium block transition-colors py-1.5 rounded-full hover:bg-ploy-neutral-primary-s2 hover:text-ploy-text-primary text-sm tracking-tight px-3"
          >
            Platform
          </a>
          <a
            href="#workflow"
            className="text-ploy-text-secondary font-medium block transition-colors py-1.5 rounded-full hover:bg-ploy-neutral-primary-s2 hover:text-ploy-text-primary text-sm tracking-tight px-3"
          >
            Workflow
          </a>
          <a
            href="#demo"
            className="text-ploy-text-secondary font-medium block transition-colors py-1.5 rounded-full hover:bg-ploy-neutral-primary-s2 hover:text-ploy-text-primary text-sm tracking-tight px-3"
          >
            Demo
          </a>
          <a
            href="#use-cases"
            className="text-ploy-text-secondary font-medium block transition-colors py-1.5 rounded-full hover:bg-ploy-neutral-primary-s2 hover:text-ploy-text-primary text-sm tracking-tight px-3"
          >
            Use cases
          </a>
          <a
            href="#faq"
            className="text-ploy-text-secondary font-medium block transition-colors py-1.5 rounded-full hover:bg-ploy-neutral-primary-s2 hover:text-ploy-text-primary text-sm tracking-tight px-3"
          >
            FAQ
          </a>
        </div>

        <div className="hidden md:block bg-ploy-border-primary/70 w-px h-3.5 shrink-0 rounded-full" />

        <div className="flex shrink-0 items-center gap-1">
          <a
            href="/login"
            className="hidden sm:block text-ploy-text-secondary font-medium transition-colors py-1.5 rounded-full hover:text-ploy-text-primary text-xs tracking-tight px-3"
          >
            Log in
          </a>
          <a
            href="/signup"
            className="bg-ploy-background-inverse text-ploy-text-inverse font-medium block shadow-[0px_2px_8px_0px_color-mix(in_srgb,var(--ploy-text-primary)_12%,transparent)] transition-opacity py-2 rounded-full hover:opacity-85 text-xs tracking-tight px-4"
          >
            Sign up
          </a>
        </div>
      </nav>
    </header>
  );
}
