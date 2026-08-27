"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { LandingNavbar } from "./landing-navbar";

export function LandingHero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.defaultMuted = true;
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          video.addEventListener(
            "loadeddata",
            () => video.play().catch(() => {}),
            { once: true },
          );
        });
      }
    }
  }, []);

  return (
    <div
      id="hero"
      className="relative min-h-screen overflow-hidden bg-[#f0f0ee] dark:bg-[#121212] font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text','SF_Pro_Display',system-ui,sans-serif]"
    >
      {/* Background Video with zero-latency attributes and GPU acceleration */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        webkit-playsinline="true"
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4"
        className="video-gpu-accelerate absolute inset-0 w-full h-full object-cover"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4"
          type="video/mp4"
        />
      </video>

      {/* Floating Pill Navbar */}
      <LandingNavbar />

      {/* Foreground Hero Content (bottom-left aligned) */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex-1 flex items-end pb-12 sm:pb-16 lg:pb-20 px-6 sm:px-12 md:px-20 lg:px-28">
          <div className="max-w-md">
            {/* Headline */}
            <h1
              className="text-[1.85rem] sm:text-[2.25rem] leading-[1.12] font-bold text-gray-900 dark:text-white mb-3.5 tracking-tight"
              style={{
                fontFamily:
                  "'BubbledotICG-FinePos', 'Geist Pixel Circle', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              Launchpad for Startup
            </h1>

            {/* Subtext */}
            <p
              className="text-gray-500 dark:text-gray-400 mb-4 font-normal leading-relaxed"
              style={{
                fontSize:
                  "clamp(calc(13.5px + 2pt), calc(1.55vw + 2pt), calc(16px + 2pt))",
              }}
            >
              Let your startup get off the ground. Build a one-person
              billion-dollar company with Otogent AI.
            </p>

            {/* CTA anchor */}
            <Link
              href="/signup"
              className="apple-press inline-flex items-center gap-2 text-[13.5px] font-semibold text-blue-600 dark:text-blue-400 bg-white/70 dark:bg-black/50 backdrop-blur-md border border-blue-400/80 rounded-full px-5 py-2.5 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white hover:border-blue-600 transition-all duration-200 group mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
            >
              <span>Take-Off your Startup</span>
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
