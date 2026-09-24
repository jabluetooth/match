"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";

/** Every framer-motion transform in the app honours prefers-reduced-motion. */
export function Providers({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
