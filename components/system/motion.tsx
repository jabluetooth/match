"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";

// One easing for the whole product: fast out, long settle. Never linear.
export const EASE = [0.16, 1, 0.3, 1] as const;

const VIEWPORT = { once: true, margin: "-8% 0px" } as const;

interface LineRevealProps {
  lines: ReactNode[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  /** true → play when scrolled into view; false → play on mount (above the fold). */
  inView?: boolean;
}

/**
 * Headline reveal: each line rises from behind its own baseline mask, one
 * after another. Serif display lines have long descenders, so the mask gets
 * a little extra bottom room.
 */
export function LineReveal({ lines, as: Tag = "h2", className = "", delay = 0, inView = true }: LineRevealProps) {
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span key={i} className="-mb-[0.14em] block overflow-hidden pb-[0.14em]">
          <motion.span
            className="block"
            initial={{ y: "110%" }}
            {...(inView ? { whileInView: { y: 0 }, viewport: VIEWPORT } : { animate: { y: 0 } })}
            transition={{ duration: 0.8, ease: EASE, delay: delay + i * 0.09 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

interface RiseProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  inView?: boolean;
}

export function Rise({ children, className, delay = 0, y = 14, inView = true }: RiseProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      {...(inView ? { whileInView: { opacity: 1, y: 0 }, viewport: VIEWPORT } : { animate: { opacity: 1, y: 0 } })}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** A hairline that draws itself left to right as it arrives. */
export function DrawLine({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      aria-hidden="true"
      className={"h-px origin-left bg-line " + className}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: 1, ease: EASE, delay }}
    />
  );
}

/**
 * A number that counts up from zero the first time it scrolls into view.
 * Server-rendered and reduced-motion readers get the final value straight
 * away; the count is decoration, the number is the content.
 */
export function CountUp({ value, className, duration = 1.1 }: { value: number; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);
  const started = useRef(false);

  // Drop to zero before first paint so the count doesn't flash the final
  // number, then zero, then count. Runs only on the client.
  useLayoutEffect(() => {
    if (!reduce && !started.current) setShown(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (reduce || !inView || started.current) return;
    started.current = true;
    const controls = animate(0, value, {
      duration,
      ease: EASE,
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, value, duration]);

  // If the value changes after the first count (router.refresh), show it as-is.
  useEffect(() => {
    if (started.current || reduce) setShown(value);
  }, [value, reduce]);

  return (
    <span ref={ref} className={className}>
      {shown}
    </span>
  );
}
