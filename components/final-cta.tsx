"use client";

import { Sparkles } from "lucide-react";
import { Reveal } from "@/components/scroll-reveal";
import { CornerPlusMarks } from "@/components/corner-plus-marks";
import { MarketingSignInButton } from "@/components/marketing-sign-in-button";
import { handleSpotlightMove } from "@/lib/spotlight";

/**
 * The page's closing moment gets the same visual language it opened
 * with instead of staying a flat, static card while every other section
 * picked up its own bit of motion/texture — the plus-corner marks bookend
 * the hero's blueprint texture, and the edge-glow spotlight (.mkt-spot,
 * shared with the feature/flow cards) makes the card itself feel alive
 * right at the one moment on the page that's actually asking for a click.
 */
export function FinalCta() {
  return (
    <Reveal>
      <div className="mkt-teaser mkt-spot" onMouseMove={handleSpotlightMove}>
        <CornerPlusMarks />
        <div>
          <div className="mkt-eyebrow">Ready when you are</div>
          <h3>Sign in and drop in a resume.</h3>
          <p>Your first matches are usually ready in under a minute.</p>
        </div>
        <MarketingSignInButton className="btn btn-primary btn-lg">
          <Sparkles size={15} />
          Sign In
        </MarketingSignInButton>
      </div>
    </Reveal>
  );
}
