"use client";

import React, { useId } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface GooeySelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  containerClassName?: string;
}

export function GooeySelect({
  className,
  containerClassName,
  onFocus,
  onBlur,
  children,
  ...props
}: GooeySelectProps) {
  const safeId = useId().replace(/:/g, "");
  const filterId = `gooey-select-filter-${safeId}`;
  const [focused, setFocused] = React.useState(false);

  return (
    <div className={cn("relative", containerClassName)}>
      <svg className="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <motion.div
        animate={{ scaleX: focused ? 1.04 : 1, scaleY: focused ? 1.08 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 24, duration: 0.4, bounce: 0.25 }}
        className="absolute inset-0 rounded-full bg-foreground shadow-sm ring-1 ring-border/60"
        style={{ filter: `url(#${filterId})`, transformOrigin: "center" }}
      />

      <select
        className={cn(
          "relative z-10 h-10 w-full appearance-none bg-transparent px-4 pr-9 text-sm font-medium text-background outline-none cursor-pointer",
          className,
        )}
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        {...props}
      >
        {children}
      </select>

      <div className="pointer-events-none absolute right-3 top-1/2 z-10 -translate-y-1/2 text-background/70">
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}
