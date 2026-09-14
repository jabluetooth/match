import { Cpu, BarChart3, type LucideIcon } from "lucide-react";
import type { IconType } from "react-icons";
import {
  SiNextdotjs,
  SiReact,
  SiTypescript,
  SiTailwindcss,
  SiPrisma,
  SiPostgresql,
  SiClerk,
  SiN8N,
  SiVercel,
} from "react-icons/si";
import { CornerPlusMarks } from "@/components/corner-plus-marks";

/* Groq and Recharts have no Simple Icons entry (verified against the
   installed package, not guessed) — Cpu and BarChart3 stand in as honest
   generic icons rather than a fabricated brand mark. */
const TECH_STACK: { name: string; Icon: IconType | LucideIcon }[] = [
  { name: "Next.js 16", Icon: SiNextdotjs },
  { name: "React 19", Icon: SiReact },
  { name: "TypeScript", Icon: SiTypescript },
  { name: "Tailwind CSS", Icon: SiTailwindcss },
  { name: "Prisma 7", Icon: SiPrisma },
  { name: "PostgreSQL (Neon)", Icon: SiPostgresql },
  { name: "Clerk", Icon: SiClerk },
  { name: "n8n", Icon: SiN8N },
  { name: "Groq", Icon: Cpu },
  { name: "Recharts", Icon: BarChart3 },
  { name: "Vercel", Icon: SiVercel },
];

const SHADE_COUNT = 4;

/**
 * A bordered grid with plus-icon corner marks instead of a row of pill
 * chips — sharp edges, no radius, echoing the same blueprint/schematic
 * register as the hero's dot-grid texture rather than introducing a new
 * decorative motif. Each cell only draws its own right + bottom border, so
 * the grid lines never double up at shared edges. Cells cycle through a
 * few neutral tonal shades (index-based, not CSS nth-child — the corner
 * Plus icons are siblings too and would throw off nth-child counting).
 */
export function TechStackGrid() {
  return (
    <div className="mkt-stack-grid">
      <CornerPlusMarks />
      {TECH_STACK.map(({ name, Icon }, i) => (
        <div className={`mkt-stack-cell shade-${i % SHADE_COUNT}`} key={name}>
          <Icon className="mkt-stack-icon" size={20} aria-hidden="true" />
          <span>{name}</span>
        </div>
      ))}
    </div>
  );
}
