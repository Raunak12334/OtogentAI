import {
  Code2,
  DollarSign,
  MessageSquareCode,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import type React from "react";

interface BenefitItem {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  tagLeft: string;
  tagRight: string;
  accentColor: string;
}

const benefits: BenefitItem[] = [
  {
    icon: <Zap className="w-5 h-5" />,
    iconBg:
      "bg-blue-500/10 text-blue-600 dark:bg-blue-400/20 dark:text-blue-400",
    title: "10x Launch Velocity",
    description:
      "Skip traditional 6-month development cycles. Go from initial prompt to full-stack, deployed web and mobile applications in minutes.",
    tagLeft: "Instant Production MVP",
    tagRight: "⚡ 100x Faster",
    accentColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: <Users className="w-5 h-5" />,
    iconBg:
      "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-400",
    title: "Autonomous AI Team",
    description:
      "Orchestrate specialized AI agents for backend architecture, pixel-perfect frontend, automated QA testing, and DevOps scaling.",
    tagLeft: "1 Founder = 50 Engineers",
    tagRight: "🤝 Zero Overhead",
    accentColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    icon: <Code2 className="w-5 h-5" />,
    iconBg:
      "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-400",
    title: "100% Code Ownership",
    description:
      "No proprietary runtime lock-in. Export clean, production-grade TypeScript, React, Next.js, and Python repositories directly to GitHub.",
    tagLeft: "Full IP Rights",
    tagRight: "📦 Git & Docker Ready",
    accentColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    iconBg:
      "bg-violet-500/10 text-violet-600 dark:bg-violet-400/20 dark:text-violet-400",
    title: "Enterprise Grade Security",
    description:
      "Automated SOC2-grade security compliance, isolated environments, data encryption at rest and in transit, and automatic zero-downtime scaling.",
    tagLeft: "99.99% Uptime SLA",
    tagRight: "🛡️ Automated Audits",
    accentColor: "text-violet-600 dark:text-violet-400",
  },
  {
    icon: <MessageSquareCode className="w-5 h-5" />,
    iconBg:
      "bg-amber-500/10 text-amber-600 dark:bg-amber-400/20 dark:text-amber-400",
    title: "Conversational Iterations",
    description:
      "Refine designs, add complex features, change styling, and wire third-party APIs on the fly simply by describing what you need in plain English.",
    tagLeft: "Live Instant Previews",
    tagRight: "💬 Natural Language",
    accentColor: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: <DollarSign className="w-5 h-5" />,
    iconBg:
      "bg-rose-500/10 text-rose-600 dark:bg-rose-400/20 dark:text-rose-400",
    title: "Monetization Built-In",
    description:
      "Pre-integrated authentication, billing (Stripe, Polar), customer analytics, and SEO optimization to start monetizing from day one.",
    tagLeft: "Payment-Ready",
    tagRight: "🚀 Day-1 Revenue",
    accentColor: "text-rose-600 dark:text-rose-400",
  },
];

export function LandingBenefits() {
  return (
    <section
      id="benefits"
      className="py-24 sm:py-32 px-6 sm:px-12 md:px-20 lg:px-28 bg-[#f6f6f4] dark:bg-[#161616] border-t border-neutral-200/60 dark:border-neutral-800/60 font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text','SF_Pro_Display',system-ui,sans-serif]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-[12px] font-semibold mb-4 tracking-tight">
            <span>Why Otogent AI</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 leading-[1.15] mb-5">
            Everything you need to launch at lightspeed.
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-[16px] sm:text-[17.5px] leading-relaxed">
            Replace months of costly development, design, and operations with an
            autonomous launchpad built for solo founders.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="bento-card rounded-3xl p-8 flex flex-col justify-between"
            >
              <div>
                <div
                  className={`w-12 h-12 rounded-2xl ${b.iconBg} flex items-center justify-center mb-6 shadow-sm`}
                >
                  {b.icon}
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight mb-2.5">
                  {b.title}
                </h3>
                <p className="text-[14.5px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                  {b.description}
                </p>
              </div>
              <div
                className={`mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[12.5px] font-semibold ${b.accentColor}`}
              >
                <span>{b.tagLeft}</span>
                <span>{b.tagRight}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
