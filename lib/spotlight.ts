import type { MouseEvent } from "react";

/**
 * Sets --spot-x/--spot-y directly on the element via the DOM instead of
 * React state, so the cursor-tracking edge glow (.mkt-spot in
 * app/globals.css) doesn't trigger a re-render on every mousemove. Shared
 * by every card that uses the .mkt-spot treatment (feature cards, flow
 * step cards) instead of each one redefining the same handler.
 */
export function handleSpotlightMove(e: MouseEvent<HTMLElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
}
