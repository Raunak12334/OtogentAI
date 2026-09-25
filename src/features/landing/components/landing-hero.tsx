export function LandingHero() {
  return (
    <section
      id="hero"
      className="w-full bg-ploy-background-primary relative min-h-screen overflow-x-hidden text-ploy-text-primary"
    >
      <div className="relative min-h-screen grid grid-rows-[48vh_auto] lg:grid-cols-[1.12fr_0.88fr] lg:grid-rows-1">
        <div className="order-2 relative z-10 flex items-end px-6 pb-12 pt-8 md:px-20 md:pb-16 lg:order-1 lg:min-h-screen lg:px-20 lg:pb-20 xl:px-28">
          <div className="max-w-[42rem]">
            <div className="flex items-center gap-3 mb-7 font-mono text-[0.6875rem] tracking-[0.14em] uppercase text-ploy-text-secondary">
              <span className="text-ploy-accent-primary font-medium" aria-hidden="true">
                /
              </span>
              Otogent - Automation &amp; agent infrastructure
            </div>

            <h1 className="font-otogent-display text-ploy-text-primary leading-[0.88] mb-7 text-[clamp(3.2rem,8vw,4.5rem)] lg:text-[clamp(3.8rem,4.4vw,5rem)]">
              <span className="block lg:whitespace-nowrap">Without automation,</span>
              <span className="block lg:whitespace-nowrap">you can&apos;t grow</span>
              <span className="block font-medium">efficiently.</span>
            </h1>

            <p className="text-ploy-text-secondary leading-relaxed text-base md:text-lg max-w-lg mb-8">
              Design the workflow, assign specialized agents, and track every handoff from product prompt to deployment.
            </p>

            <a
              href="/signup"
              className="bg-ploy-background-inverse text-ploy-text-inverse font-semibold text-sm inline-flex items-center gap-2.5 shadow-[0px_8px_24px_0px_color-mix(in_srgb,var(--ploy-text-primary)_16%,transparent)] transition-opacity px-6 py-3.5 rounded-full group hover:opacity-85"
            >
              <span>Start building</span>
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </a>
          </div>
        </div>

        <div className="order-1 relative min-h-[48vh] lg:order-2 lg:min-h-screen">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4"
            className="absolute inset-0 w-full h-full object-cover object-[50%_42%] mix-blend-multiply video-gpu-accelerate"
          >
            <source
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4"
              type="video/mp4"
            />
          </video>
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-ploy-background-primary to-transparent lg:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-ploy-background-primary to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ploy-background-primary to-transparent lg:hidden" />
        </div>
      </div>
    </section>
  );
}
