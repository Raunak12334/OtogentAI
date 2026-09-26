"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const faqItems = [
  {
    q: "What is Otogent AI?",
    a: "Otogent AI is an automation and agent infrastructure platform. It helps teams define repeatable work, coordinate specialized agents, and keep each run visible from request to result.",
  },
  {
    q: "Is Otogent a workflow builder or an agent platform?",
    a: "It brings both parts together. Workflows define how a task moves, while agents handle the reasoning and actions assigned to each step.",
  },
  {
    q: "Who is Otogent built for?",
    a: "Otogent is designed for technical founders, engineering teams, operations teams, and agencies that want to run repeatable work with agents without losing oversight.",
  },
  {
    q: "Can I keep the code Otogent helps create?",
    a: "Otogent is designed around code ownership. The application code and infrastructure it helps create can move with your product and team.",
  },
  {
    q: "What should I automate first?",
    a: "Start with one frequent process that has a clear input, a known outcome, and reviewable steps. That gives you a strong baseline before expanding into more complex agent runs.",
  },
];

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section
      id="faq"
      className="font-heading border-solid border-ploy-border-primary/50 bg-ploy-background-primary border-t px-6 py-24 md:px-20 md:py-32 lg:px-28"
    >
      <div className="max-w-screen-md mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <div className="border-solid border-ploy-accent-primary/20 bg-ploy-neutral-primary-s0/70 text-ploy-accent-primary-800 font-semibold text-xs tracking-tight inline-flex items-center mb-4 px-3.5 py-1 rounded-full border">
            Frequently asked questions
          </div>
          <h2 className="text-ploy-text-primary font-bold mb-4 text-4xl tracking-[-0.04em] md:text-5xl">
            What teams need to know.
          </h2>
          <p className="text-ploy-text-secondary max-w-xl mx-auto text-base leading-relaxed">
            The operating model, ownership, and best place to begin.
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border-solid border-ploy-border-primary/60 bg-ploy-neutral-primary-s0 shadow-[0px_2px_8px_0px_color-mix(in_srgb,var(--ploy-text-primary)_3%,transparent)] rounded-2xl p-5 md:p-6 border transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full text-left text-ploy-text-primary font-semibold cursor-pointer list-none flex justify-between items-center gap-5 text-sm md:text-base"
                >
                  <span>{item.q}</span>
                  <span
                    className={`bg-ploy-background-secondary text-ploy-text-secondary w-8 h-8 flex shrink-0 justify-center items-center transition-transform duration-200 rounded-full ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    <Plus className="w-4 h-4 stroke-[2px]" />
                  </span>
                </button>
                {isOpen && (
                  <p className="text-ploy-text-secondary leading-relaxed text-sm md:text-base pt-4 pr-12">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
