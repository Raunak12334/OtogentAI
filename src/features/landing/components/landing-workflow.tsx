const steps = [
  {
    num: "01",
    title: "Define the request",
    desc: "Set the event, instruction, or recurring task that starts the workflow.",
  },
  {
    num: "02",
    title: "Route the work",
    desc: "Assign each part to the agent, tool, or person best suited to handle it.",
  },
  {
    num: "03",
    title: "Run with guardrails",
    desc: "Keep the workflow inside clear instructions, checkpoints, and approval rules.",
  },
  {
    num: "04",
    title: "Inspect the outcome",
    desc: "Review the result, trace the handoffs, and improve the next run from what happened.",
  },
];

const railSteps = ["Request", "Plan", "Delegate", "Act", "Review"];

export function LandingWorkflow() {
  return (
    <section
      id="workflow"
      className="font-heading border-solid border-ploy-border-primary/50 bg-ploy-background-primary border-t px-6 py-24 md:px-20 md:py-32 lg:px-28"
    >
      <div className="max-w-screen-xl mx-auto">
        <div className="grid gap-8 items-end mb-14 md:grid-cols-2 md:mb-20">
          <div>
            <div className="border-solid border-ploy-accent-primary/20 bg-ploy-neutral-primary-s0/70 text-ploy-accent-primary-800 font-semibold text-xs tracking-tight inline-flex items-center mb-4 px-3.5 py-1 rounded-full border">
              How Otogent works
            </div>
            <h2 className="text-ploy-text-primary leading-[1.06] font-bold text-4xl tracking-[-0.04em] md:text-6xl max-w-2xl">
              One operating loop for every agent.
            </h2>
          </div>
          <p className="text-ploy-text-secondary leading-relaxed text-base md:text-lg max-w-xl md:justify-self-end">
            Otogent connects the request, the reasoning, the action, and the
            review. Each step has an owner and every handoff stays visible.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <article
              key={i}
              className="border-solid border-ploy-border-primary/60 bg-ploy-neutral-primary-s0/70 min-h-[16rem] p-6 rounded-3xl flex flex-col justify-between border"
            >
              <div className="text-ploy-accent-primary font-mono text-xs tracking-[0.16em]">
                STEP {s.num}
              </div>
              <div>
                <div className="bg-ploy-accent-primary/12 w-10 h-1 mb-6 rounded-full" />
                <h3 className="text-ploy-text-primary font-bold text-xl tracking-tight mb-3">
                  {s.title}
                </h3>
                <p className="text-ploy-text-secondary leading-relaxed text-sm">
                  {s.desc}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="border-solid border-ploy-border-primary/60 bg-ploy-background-inverse text-ploy-text-inverse mt-8 rounded-3xl px-6 py-6 md:px-8 md:py-7 border">
          <div className="grid gap-5 items-center md:grid-cols-[auto_1fr]">
            <div className="font-mono text-xs tracking-[0.16em] text-ploy-text-inverse-secondary">
              AGENT RUN
            </div>
            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              {railSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="border-solid border-ploy-border-inverse bg-ploy-neutral-inverse-s2 px-3 py-1.5 rounded-full text-xs border">
                    {step}
                  </span>
                  {idx < railSteps.length - 1 && (
                    <span className="text-ploy-text-inverse-secondary">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
