import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function LandingCTA() {
  return (
    <section
      id="cta"
      className="relative py-24 sm:py-32 px-6 sm:px-12 md:px-20 lg:px-28 bg-[#f5f5f3] dark:bg-[#121212] overflow-hidden font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text','SF_Pro_Display',system-ui,sans-serif]"
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[350px] bg-gradient-to-r from-blue-400/15 via-sky-300/20 to-indigo-400/15 dark:from-blue-600/10 dark:via-sky-500/10 dark:to-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-700/80 text-neutral-800 dark:text-neutral-200 text-[12.5px] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span>Start Building for Free</span>
        </div>

        {/* Main Headline */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 leading-[1.1] mb-6">
          Ready to take off your startup with Otogent AI?
        </h2>

        {/* Subtext */}
        <p className="text-neutral-600 dark:text-neutral-400 text-[16px] sm:text-[18px] leading-relaxed max-w-2xl mx-auto mb-10">
          Turn your idea into a production-ready, revenue-generating startup.
          Join founders scaling one-person billion-dollar companies today.
        </p>

        {/* CTA Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="apple-press inline-flex items-center justify-center gap-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 text-white font-semibold px-8 py-4 rounded-full text-[15px] sm:text-[16px] tracking-tight shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.25)] transition-all duration-200 group"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>

          <a
            href="#benefits"
            className="apple-press inline-flex items-center justify-center px-7 py-4 rounded-full text-[15px] font-medium text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-700/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:bg-white dark:hover:bg-neutral-800 transition-all duration-200"
          >
            Explore Features
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-[13px] text-neutral-500 dark:text-neutral-400 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Full code ownership</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Deploy in minutes</span>
          </div>
        </div>
      </div>
    </section>
  );
}
