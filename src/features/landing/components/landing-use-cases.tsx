const cases = [
  {
    num: "01",
    title: "Operations automation",
    desc: "Turn repeatable procedures into agent-run workflows with clear inputs, checkpoints, and outputs.",
    tags: ["Research", "Routing", "Reporting"],
  },
  {
    num: "02",
    title: "Software delivery",
    desc: "Coordinate planning, implementation, testing, and release work across specialized agents.",
    tags: ["Plan", "Build", "Verify"],
  },
  {
    num: "03",
    title: "Internal tools",
    desc: "Build task-specific copilots and services around the processes your team already runs.",
    tags: ["Support", "Data", "Approvals"],
  },
];

export function LandingUseCases() {
  return (
    <section
      id="use-cases"
      className="font-heading border-solid border-ploy-border-primary/50 bg-ploy-background-secondary border-t px-6 py-24 md:px-20 md:py-32 lg:px-28"
    >
      <div className="max-w-screen-xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-20">
          <div className="border-solid border-ploy-accent-primary/20 bg-ploy-accent-primary/8 text-ploy-accent-primary-800 font-semibold text-xs tracking-tight inline-flex items-center mb-4 px-3.5 py-1 rounded-full border">
            Built for production work
          </div>
          <h2 className="text-ploy-text-primary leading-[1.06] font-bold mb-5 text-4xl tracking-[-0.04em] md:text-6xl">
            Use agents where work already moves.
          </h2>
          <p className="text-ploy-text-secondary leading-relaxed text-base md:text-lg max-w-2xl mx-auto">
            Start with one process that already has a clear input and outcome.
            Otogent gives the work a repeatable path and an accountable owner at
            every step.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 md:gap-8">
          {cases.map((c, i) => (
            <article
              key={i}
              className="border-solid border-ploy-border-primary/60 bg-ploy-neutral-primary-s0 min-h-[22rem] p-7 md:p-8 rounded-3xl flex flex-col justify-between shadow-[0px_4px_20px_-2px_color-mix(in_srgb,var(--ploy-text-primary)_3%,transparent)] border"
            >
              <div className="flex justify-between items-start gap-6">
                <span className="text-ploy-accent-primary font-mono text-xs tracking-[0.16em]">
                  USE CASE {c.num}
                </span>
                <span className="bg-ploy-accent-primary/10 text-ploy-accent-primary w-10 h-10 flex items-center justify-center rounded-full font-mono text-xs">
                  {c.num}
                </span>
              </div>

              <div>
                <h3 className="text-ploy-text-primary leading-tight font-bold text-2xl tracking-tight mb-4">
                  {c.title}
                </h3>
                <p className="text-ploy-text-secondary leading-relaxed text-sm mb-7">
                  {c.desc}
                </p>
                <div className="flex flex-wrap gap-2">
                  {c.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="border-solid border-ploy-border-primary/60 bg-ploy-background-secondary text-ploy-text-secondary px-3 py-1.5 rounded-full text-xs border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
