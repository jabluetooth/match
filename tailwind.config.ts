import type { Config } from "tailwindcss";

// Every colour is a CSS variable holding bare RGB channels (see
// app/globals.css), so Tailwind's /opacity modifiers work on all of them.
const rgb = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config = {
  darkMode: ["class"],
  content: ["./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: rgb("bg"),
        surface: rgb("surface"),
        raised: rgb("raised"),
        line: rgb("line"),
        "line-strong": rgb("line-strong"),
        ink: {
          DEFAULT: rgb("ink"),
          2: rgb("ink-2"),
          3: rgb("ink-3"),
        },
        accent: {
          DEFAULT: rgb("accent"),
          strong: rgb("accent-strong"),
          deep: rgb("accent-deep"),
          ink: rgb("accent-ink"),
          fg: rgb("accent-fg"),
        },
        interview: {
          DEFAULT: rgb("interview"),
          ink: rgb("interview-ink"),
        },
        success: rgb("success"),
        warning: rgb("warning"),
        danger: rgb("danger"),
        info: rgb("info"),
      },
      fontFamily: {
        display: ["var(--font-instrument)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
      },
      keyframes: {
        "stage-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "stage-pulse": "stage-pulse 1.6s ease-in-out infinite",
        shimmer: "shimmer 1.8s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
