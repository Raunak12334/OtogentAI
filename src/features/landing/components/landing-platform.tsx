import {
  Zap,
  Users,
  Code,
  ShieldCheck,
  MessageSquareCode,
  DollarSign,
} from "lucide-react";
import type { ReactNode } from "react";

interface PlatformCardProps {
  title: string;
  description: string;
  tagline: string;
  iconBg: string;
  iconColor: string;
  icon: ReactNode;
}

const cards: PlatformCardProps[] = [
  {
    title: "Agent orchestration",
    description:
      "Coordinate specialized agents around a shared goal, ordered steps, and explicit handoffs.",
    tagline: "Plan → delegate → complete",
    iconBg: "bg-ploy-accent-primary/10",
    iconColor: "text-ploy-accent-primary-700",
    icon: <Zap className="w-5 h-5 stroke-[2px]" />,
  },
  {
    title: "Workflow automation",
    description:
      "Turn repeatable work into a clear execution path that can run the same way every time.",
    tagline: "Reusable operating logic",
    iconBg: "bg-ploy-accent-secondary/25",
    iconColor: "text-ploy-accent-primary-800",
    icon: <Users className="w-5 h-5 stroke-[2px]" />,
  },
  {
    title: "Shared context",
    description:
      "Give every step the instructions and working information it needs to move the task forward.",
    tagline: "Context across handoffs",
    iconBg: "bg-ploy-accent-tertiary/12",
    iconColor: "text-ploy-accent-tertiary-700",
    icon: <Code className="w-5 h-5 stroke-[2px]" />,
  },
  {
    title: "Controls and approvals",
    description:
      "Place review points around sensitive actions and keep people in control of consequential work.",
    tagline: "Human review when it matters",
    iconBg: "bg-ploy-accent-primary/10",
    iconColor: "text-ploy-accent-primary-700",
    icon: <ShieldCheck className="w-5 h-5 stroke-[2px]" />,
  },
  {
    title: "Execution visibility",
    description:
      "See what is running, what is waiting, and where an agent needs attention before work stalls.",
    tagline: "One view of every run",
    iconBg: "bg-ploy-accent-secondary/25",
    iconColor: "text-ploy-accent-primary-800",
    icon: <MessageSquareCode className="w-5 h-5 stroke-[2px]" />,
  },
  {
    title: "Code ownership",
    description:
      "Keep the application code and infrastructure Otogent helps create, without a proprietary runtime lock-in.",
    tagline: "Built to move with you",
    iconBg: "bg-ploy-accent-tertiary/12",
    iconColor: "text-ploy-accent-tertiary-700",
    icon: <DollarSign className="w-5 h-5 stroke-[2px]" />,
  },
];

export function LandingPlatform() {
  return (
    <section
      id="platform"
      className="font-heading border-solid border-ploy-border-primary/50 bg-ploy-background-secondary border-t px-6 py-24 md:px-20 md:py-32 lg:px-28"
    >
      <div className="max-w-screen-xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="border-solid border-ploy-accent-primary/20 bg-ploy-accent-primary/8 text-ploy-accent-primary-800 font-semibold text-xs tracking-tight inline-flex items-center mb-4 px-3.5 py-1 rounded-full border">
            The Otogent platform
          </div>
          <h2 className="text-ploy-text-primary leading-[1.06] font-bold mb-5 text-4xl tracking-[-0.04em] md:text-6xl">
            Infrastructure for agents that need to ship real work.
          </h2>
          <p className="text-ploy-text-secondary leading-relaxed text-base md:text-lg max-w-2xl mx-auto">
            Define the work once, give each agent a clear role, and operate the
            full run from one system.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {cards.map((c, i) => (
            <article
              key={i}
              className="border-solid border-ploy-border-primary/60 bg-ploy-neutral-primary-s0/80 flex min-h-[18rem] flex-col justify-between shadow-[0px_4px_20px_-2px_color-mix(in_srgb,var(--ploy-text-primary)_3%,transparent)] transition-all p-7 rounded-3xl hover:-translate-y-1 hover:shadow-[0px_16px_36px_-8px_color-mix(in_srgb,var(--ploy-text-primary)_10%,transparent)] border"
            >
              <div>
                <div
                  className={`${c.iconBg} ${c.iconColor} w-12 h-12 flex justify-center items-center mb-7 rounded-2xl`}
                >
                  {c.icon}
                </div>
                <h3 className="text-ploy-text-primary leading-snug font-bold text-xl tracking-tight mb-3">
                  {c.title}
                </h3>
                <p className="text-ploy-text-secondary leading-relaxed text-sm">
                  {c.description}
                </p>
              </div>
              <div className="border-solid border-ploy-border-primary/40 text-ploy-text-secondary font-mono text-xs tracking-wide mt-7 pt-4 border-t">
                {c.tagline}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
