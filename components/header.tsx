"use client";

import { GooeyInput } from "@/components/ui/gooey-input";

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-6 border-b border-gray-200/80 bg-white/80 px-6 backdrop-blur-md">
      {/* Left — brand name (fixed width keeps search centred) */}
      <span
        className="w-[130px] shrink-0 select-none text-2xl font-black text-gray-900"
        style={{ fontFamily: "var(--font-outfit), 'Inter', sans-serif", letterSpacing: "-0.04em" }}
      >
        match
      </span>

      {/* Centre — search expands freely, overflow visible so bubble isn't clipped */}
      <div className="flex flex-1 items-center justify-center overflow-visible">
        <GooeyInput
          placeholder="Search jobs, companies..."
          collapsedWidth={150}
          expandedWidth={440}
          expandedOffset={48.5}
          gooeyBlur={5}
        />
      </div>

      {/* Right spacer — mirrors the left brand width to keep search truly centred */}
      <div className="w-[130px] shrink-0" />
    </header>
  );
}
