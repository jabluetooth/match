"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  animate,
  useInView,
} from "framer-motion";

interface StatTile {
  label: string;
  value: number;
  tone: "peach" | "sky";
}

interface FunnelStage {
  label: string;
  value: number;
}

const TILES: StatTile[] = [
  { label: "Active Applications", value: 12, tone: "peach" },
  { label: "Upcoming Interviews", value: 3, tone: "sky" },
];

const FUNNEL: FunnelStage[] = [
  { label: "Applied", value: 18 },
  { label: "Interview", value: 5 },
  { label: "Offer", value: 1 },
];

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Counts 0 → target once the panel scrolls into view. Writes straight to
 * the DOM via a ref instead of React state, so a 1.1s count doesn't put
 * ~5 counters through a React re-render on every animation frame — the
 * motion value's onChange callback bypasses React's render path entirely,
 * which is the whole point of using a motion value here instead of
 * useState. Static under reduced-motion.
 */
function Counter({ target, start }: { target: number; start: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(0);

  useEffect(() => {
    if (reduce) {
      if (ref.current) ref.current.textContent = String(target);
      return;
    }
    if (!start) return;
    const controls = animate(motionValue, target, {
      duration: 1.1,
      ease: EASE,
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [start, target, reduce, motionValue]);

  return <span ref={ref}>0</span>;
}

/**
 * The hero's live-preview card, tilting in real 3D as the cursor moves
 * (perspective + spring-eased rotateX/rotateY) with each child popped to
 * its own translateZ, plus a slow always-on idle drift so the effect still
 * reads on touch devices that never fire mousemove. Numbers count up once
 * the card enters view. Everything collapses to a static, motionless card
 * under prefers-reduced-motion.
 */
export function HeroPreview3D() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(wrapRef, { once: true, margin: "-80px" });

  const rotateX = useSpring(0, { stiffness: 150, damping: 18, mass: 0.5 });
  const rotateY = useSpring(0, { stiffness: 150, damping: 18, mass: 0.5 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 16);
    rotateX.set(-py * 16);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      ref={wrapRef}
      className="mkt-preview-wrap"
      animate={
        reduce
          ? undefined
          : { y: [0, -7, 0], rotateZ: [0, 0.5, 0] }
      }
      transition={reduce ? undefined : { duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        className="mkt-preview"
        style={{ rotateX, rotateY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="mkt-preview-tiles">
          {TILES.map((tile, i) => (
            <div
              key={tile.label}
              className={`mkt-preview-tile tile-${tile.tone}`}
              style={{ transform: `translateZ(${28 - i * 10}px)` }}
            >
              <p className="tile-lbl">{tile.label}</p>
              <p className="tile-num">
                <Counter target={tile.value} start={inView} />
              </p>
            </div>
          ))}
        </div>
        <div className="mkt-preview-funnel" style={{ transform: "translateZ(12px)" }}>
          {FUNNEL.map((stage) => (
            <div className="mkt-preview-stage" key={stage.label}>
              <span>{stage.label}</span>
              <b>
                <Counter target={stage.value} start={inView} />
              </b>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
