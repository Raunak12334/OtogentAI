export function LandingProductDemo() {
  return (
    <section
      id="demo"
      className="font-heading border-solid border-ploy-border-primary/50 bg-ploy-background-inverse text-ploy-text-inverse border-t px-6 py-24 md:px-20 md:py-32 lg:px-28"
    >
      <div className="max-w-screen-xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-20">
          <div className="border-solid border-ploy-border-inverse bg-ploy-neutral-inverse-s2 text-ploy-text-inverse-secondary font-semibold text-xs tracking-tight inline-flex items-center gap-2 mb-4 px-3.5 py-1 rounded-full border">
            <span className="bg-ploy-accent-secondary w-2 h-2 rounded-full" />
            Otogent product demo
          </div>
          <h2 className="text-ploy-text-inverse leading-[1.06] font-bold mb-5 text-4xl tracking-[-0.04em] md:text-6xl">
            From product prompt to deployed application.
          </h2>
          <p className="text-ploy-text-inverse-secondary leading-relaxed text-base md:text-lg max-w-2xl mx-auto">
            Watch how Otogent coordinates specialized agents for architecture,
            implementation, QA, code export, and deployment.
          </p>
        </div>

        <div className="border-solid border-ploy-border-inverse bg-ploy-neutral-inverse-s2 overflow-hidden rounded-[2rem] border shadow-[0px_28px_90px_-40px_color-mix(in_srgb,var(--ploy-neutral-primary)_34%,transparent)]">
          <div className="border-solid border-ploy-border-inverse flex flex-wrap justify-between items-center gap-4 px-5 py-4 md:px-7 border-b">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="bg-ploy-neutral-inverse-s4 w-2.5 h-2.5 rounded-full" />
                <span className="bg-ploy-neutral-inverse-s4 w-2.5 h-2.5 rounded-full" />
                <span className="bg-ploy-accent-secondary w-2.5 h-2.5 rounded-full" />
              </div>
              <span className="text-ploy-text-inverse-secondary font-mono text-xs tracking-[0.12em]">
                OTOGENT PRODUCT DEMO
              </span>
            </div>
            <span className="border-solid border-ploy-border-inverse bg-ploy-neutral-inverse-s3 text-ploy-text-inverse-secondary px-3 py-1.5 rounded-full font-mono text-xs border">
              Product walkthrough
            </span>
          </div>

          <div className="aspect-video bg-ploy-neutral-inverse-s0">
            <video
              aria-label="Otogent product demo"
              controls
              playsInline
              preload="metadata"
              className="h-full w-full bg-ploy-background-inverse object-contain"
            >
              <source
                src="https://cdn.ploy.ai/327c9674-bb1e-41d1-b8b0-baa118c3c9c2/user/51658ce5-otogent-product-demo.mp4"
                type="video/mp4"
              />
              Your browser does not support embedded video playback.
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
