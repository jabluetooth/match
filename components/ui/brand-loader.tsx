"use client";

import type { CSSProperties } from "react";

interface BrandLoaderProps {
  /** Fullscreen overlay that covers header + content + dock. Default true. */
  fullScreen?: boolean;
  /** Show the floating orb above the text. Default false. */
  withOrb?: boolean;
  /** Optional secondary headline below "Match…" */
  label?: string;
  /** Optional supporting message below the label */
  message?: string;
  /** Whether the secondary message is fading in (for cross-fade callers) */
  messageVisible?: boolean;
  /** Extra style for the overlay/root */
  style?: CSSProperties;
}

export function BrandLoader({
  fullScreen = true,
  withOrb = false,
  label,
  message,
  messageVisible = true,
  style,
}: BrandLoaderProps) {
  const root: CSSProperties = fullScreen
    ? {
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        background: "color-mix(in oklab, var(--bg) 86%, transparent)",
        backdropFilter: "blur(18px) saturate(1.2)",
        WebkitBackdropFilter: "blur(18px) saturate(1.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: withOrb ? 28 : 0,
        ...style,
      }
    : {
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        ...style,
      };

  return (
    <div role="status" aria-live="polite" style={root}>
      {withOrb && (
        <div className="orb-wrap" style={{ width: 180, height: 180 }}>
          <div className="orb" style={{ width: 110, height: 110 }} />
          <div className="orb-ring" />
          <div className="orb-ring r2" />
        </div>
      )}

      <div style={{ textAlign: "center", paddingInline: 24 }}>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: withOrb ? 38 : 42,
            fontWeight: 400,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
            margin: 0,
            lineHeight: 1,
            display: "inline-flex",
            alignItems: "baseline",
          }}
        >
          <span>Match</span>
          <span aria-hidden style={{ display: "inline-flex", marginLeft: 2 }}>
            <span className="match-loader-dot" style={{ animationDelay: "0s" }}>.</span>
            <span className="match-loader-dot" style={{ animationDelay: ".18s" }}>.</span>
            <span className="match-loader-dot" style={{ animationDelay: ".36s" }}>.</span>
          </span>
        </p>

        {label && (
          <p
            style={{
              fontSize: 14,
              color: "var(--ink-2)",
              margin: "14px 0 0",
              fontWeight: 500,
              letterSpacing: "-0.005em",
            }}
          >
            {label}
          </p>
        )}

        {message && (
          <p
            style={{
              fontSize: 12.5,
              color: "var(--ink-3)",
              margin: "6px auto 0",
              maxWidth: "38ch",
              lineHeight: 1.5,
              opacity: messageVisible ? 1 : 0,
              transform: messageVisible ? "translateY(0)" : "translateY(6px)",
              transition: "opacity .4s ease, transform .4s ease",
            }}
          >
            {message}
          </p>
        )}
      </div>

      <style>{`
        @keyframes match-loader-dot {
          0%, 60%, 100% { opacity: 0.18; transform: translateY(0); }
          20% { opacity: 1; transform: translateY(-4px); }
          40% { opacity: 1; transform: translateY(0); }
        }
        .match-loader-dot {
          display: inline-block;
          color: var(--accent-strong);
          font-family: var(--font-display);
          animation: match-loader-dot 1.2s ease-in-out infinite;
          will-change: transform, opacity;
        }
      `}</style>
    </div>
  );
}
