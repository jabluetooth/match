import { Plus } from "lucide-react";

/**
 * Four small plus-icon marks at the corners of a `position: relative`
 * parent — the blueprint/schematic corner-frame motif shared by the tech
 * stack grid and the closing CTA card, instead of each defining its own
 * copy of the same four lines.
 */
export function CornerPlusMarks() {
  return (
    <>
      <Plus className="mkt-corner-plus tl" size={12} strokeWidth={1.5} aria-hidden="true" />
      <Plus className="mkt-corner-plus tr" size={12} strokeWidth={1.5} aria-hidden="true" />
      <Plus className="mkt-corner-plus bl" size={12} strokeWidth={1.5} aria-hidden="true" />
      <Plus className="mkt-corner-plus br" size={12} strokeWidth={1.5} aria-hidden="true" />
    </>
  );
}
