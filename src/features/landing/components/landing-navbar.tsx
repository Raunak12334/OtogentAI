"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { authClient } from "@/lib/auth-client";

export function LandingNavbar() {
  const { data: session, isPending } = authClient.useSession();

  const navLinks = [
    { label: "Benefits", href: "#benefits" },
    { label: "Products", href: "#benefits" },
    { label: "FAQ", href: "#faq" },
    { label: "Support", href: "#cta" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pt-4 sm:pt-6 px-4 pointer-events-none">
      <nav className="apple-glass flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full max-w-full overflow-x-auto no-scrollbar transition-all duration-300 pointer-events-auto">
        {/* Logo */}
        <Link
          href="#hero"
          aria-label="OtogentAI Home"
          className="apple-press flex items-center justify-center pl-1 pr-1.5 py-0.5 rounded-full shrink-0 group"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg drop-shadow-sm transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/logo.svg"
              alt="OtogentAI"
              width={32}
              height={32}
              className="w-full h-full object-contain rounded-md"
              priority
            />
          </div>
        </Link>

        {/* Subtle partition */}
        <div className="h-3.5 w-[1px] bg-black/15 dark:bg-white/20 rounded-full mx-0.5 shrink-0" />

        {/* Navigation Links */}
        <div className="flex items-center shrink-0">
          {navLinks.map((link, index) => (
            <React.Fragment key={link.label}>
              <a
                href={link.href}
                className="apple-press px-2 sm:px-3 py-1.5 text-[12px] sm:text-[13.5px] font-medium tracking-tight text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.08]"
              >
                {link.label}
              </a>
              {index < navLinks.length - 1 && (
                <div className="h-3 w-[1px] bg-black/10 dark:bg-white/15 rounded-full mx-0.5 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Subtle partition before Auth */}
        <div className="h-3.5 w-[1px] bg-black/15 dark:bg-white/20 rounded-full mx-0.5 shrink-0" />

        {/* Auth State Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {!isPending && session?.user ? (
            <Link
              href="/workflows"
              className="apple-press px-3.5 sm:px-4 py-1.5 text-[12px] sm:text-[13px] font-semibold tracking-tight text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:shadow-[0_3px_12px_rgba(0,0,0,0.18)]"
            >
              Dashboard →
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="apple-press px-2.5 sm:px-3 py-1.5 text-[12px] sm:text-[13px] font-medium tracking-tight text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.08]"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="apple-press px-3 sm:px-4 py-1.5 text-[12px] sm:text-[13px] font-medium tracking-tight text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:shadow-[0_3px_12px_rgba(0,0,0,0.18)]"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
