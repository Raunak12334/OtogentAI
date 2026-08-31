import Link from "next/link";
import { LandingFooter } from "@/features/landing/components/landing-footer";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#111111]">
      {/* Minimal top bar */}
      <header className="border-b border-gray-100 dark:border-neutral-800 sticky top-0 z-40 bg-white/90 dark:bg-[#111111]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-quattrocento text-[17px] font-bold tracking-[0.04em] text-black dark:text-white hover:opacity-70 transition-opacity"
          >
            OTOGENT AI
          </Link>
          <Link
            href="/"
            className="text-[13px] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      <LandingFooter />
    </div>
  );
}
