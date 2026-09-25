import { ArrowRight } from "lucide-react";

export function LandingCTA() {
  return (
    <section
      id="cta"
      className="font-heading bg-ploy-background-secondary relative px-6 py-24 md:px-20 md:py-32 lg:px-28 overflow-hidden"
    >
      <div className="border-solid border-ploy-border-primary/60 bg-ploy-neutral-primary-s0 text-center max-w-5xl relative z-10 mx-auto px-6 py-16 md:px-12 md:py-24 rounded-[2rem] shadow-[0px_24px_70px_-28px_color-mix(in_srgb,var(--ploy-text-primary)_20%,transparent)] border">
        <div className="border-solid border-ploy-accent-primary/20 bg-ploy-accent-primary/8 text-ploy-accent-primary-800 font-medium text-xs inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full border">
          <span className="bg-ploy-accent-primary w-2 h-2 block rounded-full" />
          Start with one workflow
        </div>

        <h2 className="text-ploy-text-primary leading-[1.02] font-bold mb-6 text-4xl tracking-[-0.04em] md:text-6xl lg:text-7xl">
          Put your agents to work with Otogent.
        </h2>

        <p className="text-ploy-text-secondary leading-relaxed text-base md:text-lg max-w-2xl mb-9 mx-auto">
          Define the process, assign the work, and keep every run visible. Start
          small, then expand the system as your operating model grows.
        </p>

        <a
          href="/signup"
          className="bg-ploy-background-inverse text-ploy-text-inverse font-semibold inline-flex justify-center items-center gap-2.5 shadow-[0px_8px_24px_0px_color-mix(in_srgb,var(--ploy-text-primary)_18%,transparent)] transition-opacity px-8 py-4 rounded-full group hover:opacity-85 text-sm md:text-base"
        >
          <span>Start building</span>
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">
            <ArrowRight className="w-4 h-4 stroke-[2px]" />
          </span>
        </a>

        <div className="text-ploy-text-secondary font-mono text-xs flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-8">
          <span>Clear ownership</span>
          <span>Visible handoffs</span>
          <span>Deployable code</span>
        </div>
      </div>
    </section>
  );
}
