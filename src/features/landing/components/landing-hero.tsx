"use client";

import { useRef, useState, useCallback } from "react";

/* ─── HeroButton ──────────────────────────────────────────────────────────── */
function HeroButton() {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  /* Magnet + glow: track cursor relative to button */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const btn = btnRef.current;
    const glow = glowRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    /* Magnet: lean toward cursor (max ±6px / ±3px) */
    const lx = (dx / (rect.width / 2)) * 6;
    const ly = (dy / (rect.height / 2)) * 3;
    btn.style.transform = `translate(${lx}px, ${ly}px) scale(${pressed ? 0.97 : 1})`;

    /* Glow: follow cursor inside button */
    if (glow) {
      glow.style.left = `${e.clientX - rect.left}px`;
      glow.style.top = `${e.clientY - rect.top}px`;
    }
  }, [pressed]);

  const handleMouseEnter = useCallback(() => setHovered(true), []);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    setPressed(false);
    const btn = btnRef.current;
    if (btn) btn.style.transform = "translate(0,0) scale(1)";
  }, []);

  const handleMouseDown = useCallback(() => {
    setPressed(true);
    const btn = btnRef.current;
    if (btn) {
      const cur = btn.style.transform.replace(/scale\([^)]*\)/, "").trim();
      btn.style.transform = `${cur} scale(0.97)`;
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    setPressed(false);
    const btn = btnRef.current;
    if (btn) {
      const cur = btn.style.transform.replace(/scale\([^)]*\)/, "").trim();
      btn.style.transform = `${cur} scale(1)`;
    }
  }, []);

  return (
    <a
      ref={btnRef}
      href="/signup"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{
        backgroundColor: "#121214",
        transition: "transform 180ms cubic-bezier(0.23,1,0.32,1), box-shadow 200ms ease",
      }}
      className="relative overflow-hidden inline-flex items-center justify-between gap-5 pl-6 pr-1.5 py-1.5 h-12 rounded-full text-white font-semibold text-sm shadow-[0px_8px_24px_0px_color-mix(in_srgb,var(--ploy-text-primary)_16%,transparent)] group select-none cursor-pointer"
    >
      {/* ── Cursor glow ── */}
      <span
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.22) 0%, transparent 70%)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 200ms ease",
        }}
      />

      {/* ── Label ── */}
      <span className="relative z-10 text-white tracking-tight">Start building</span>

      {/* ── Signal dot / Arrow badge (aligned as in reference image) ── */}
      <span
        aria-hidden="true"
        className="relative z-10 flex items-center justify-center w-9 h-9 rounded-full shrink-0"
        style={{
          backgroundColor: "#3b82f6",
          boxShadow: "0 0 12px rgba(59, 130, 246, 0.35)",
        }}
      >
        {/* diagonal ↗ arrow: initial position pointing up-corner right, turns on hover (350ms) */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            display: "block",
            transition: "transform 350ms cubic-bezier(0.34,1.56,0.64,1)",
            transform: hovered ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          <path
            d="M2.5 11.5L11.5 2.5M11.5 2.5H5M11.5 2.5V9"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </a>
  );
}

/* ─── LandingHero ─────────────────────────────────────────────────────────── */
export function LandingHero() {
  return (
    <section
      id="hero"
      className="w-full bg-ploy-background-primary relative min-h-screen overflow-x-hidden text-ploy-text-primary"
    >
      <div className="relative min-h-screen grid grid-rows-[48vh_auto] lg:grid-cols-[1.12fr_0.88fr] lg:grid-rows-1">
        <div className="order-2 relative z-10 flex items-end px-6 pb-12 pt-8 md:px-20 md:pb-16 lg:order-1 lg:min-h-screen lg:px-20 lg:pb-20 xl:px-28">
          <div className="max-w-[42rem]">
            <div className="flex items-center gap-3 mb-7 font-mono text-[0.6875rem] tracking-[0.14em] uppercase text-ploy-text-secondary">
              <span className="text-ploy-accent-primary font-medium" aria-hidden="true">
                /
              </span>
              Otogent - Automation &amp; agent infrastructure
            </div>

            <h1 className="font-otogent-display text-ploy-text-primary leading-[0.88] mb-7 text-[clamp(3.2rem,8vw,4.5rem)] lg:text-[clamp(3.8rem,4.4vw,5rem)]">
              <span className="block lg:whitespace-nowrap">Automation &amp; Agents</span>
              <span className="block font-medium">for Quant trading</span>
            </h1>

            <p className="text-ploy-text-secondary leading-relaxed text-base md:text-lg max-w-lg mb-8">
              Design the workflow, assign specialized agents, and track every handoff from product prompt to deployment.
            </p>

            <HeroButton />
          </div>
        </div>

        <div className="order-1 relative min-h-[48vh] lg:order-2 lg:min-h-screen">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4"
            className="absolute inset-0 w-full h-full object-cover object-[50%_42%] mix-blend-multiply video-gpu-accelerate"
          >
            <source
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4"
              type="video/mp4"
            />
          </video>
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-ploy-background-primary to-transparent lg:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-ploy-background-primary to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ploy-background-primary to-transparent lg:hidden" />
        </div>
      </div>
    </section>
  );
}
