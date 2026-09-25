"use client";

import { ReactLenis, useLenis } from "lenis/react";
import type { ReactNode } from "react";
import "lenis/dist/lenis.css";

interface LandingSmoothScrollProps {
  children: ReactNode;
}

export function LandingSmoothScroll({ children }: LandingSmoothScrollProps) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        anchors: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}

export { useLenis };
