"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

export function InteractiveHoverButton({
  text = "Button",
  className,
  children,
  ...props
}: InteractiveHoverButtonProps) {
  const label = children ?? text;

  return (
    <button
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-full border border-blue-600 bg-white px-6 py-2.5 font-semibold text-blue-600 transition-colors whitespace-nowrap",
        className,
      )}
      {...props}
    >
      {/* Default text — slides right and fades out on hover */}
      <span className="relative z-10 flex items-center gap-2 transition-all duration-300 group-hover:translate-x-10 group-hover:opacity-0">
        {label}
      </span>

      {/* Hover text + arrow — slides in from the left */}
      <div className="absolute inset-0 z-10 flex translate-x-[-100%] items-center justify-center gap-2 text-white transition-all duration-300 group-hover:translate-x-0">
        <span>{label}</span>
        <ArrowRight className="h-4 w-4" />
      </div>

      {/* Fill background */}
      <div className="absolute inset-0 translate-x-[-100%] bg-blue-600 transition-all duration-300 group-hover:translate-x-0 rounded-full" />
    </button>
  );
}
