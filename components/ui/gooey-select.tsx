"use client";

import React, { useId } from "react";
import { motion } from "framer-motion";
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
  const filterId = useId();
  const [focused, setFocused] = React.useState(false);

  return (
    <div className={cn("relative", containerClassName)}>
      <svg className="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -11"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      <motion.div
        animate={{ scaleX: focused ? 1.05 : 1, scaleY: focused ? 1.10 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="absolute inset-0 rounded-full bg-white shadow-sm ring-1 ring-gray-200"
        style={{ filter: `url(#${filterId})`, transformOrigin: "center" }}
      />

      {focused && (
        <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-blue-500" />
      )}

      <select
        className={cn(
          "relative z-10 w-full appearance-none bg-transparent px-5 py-2.5 pr-10 text-sm text-gray-700 outline-none cursor-pointer",
          className,
        )}
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        {...props}
      >
        {children}
      </select>

      <div className="pointer-events-none absolute right-4 top-1/2 z-10 -translate-y-1/2 text-gray-400">
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
