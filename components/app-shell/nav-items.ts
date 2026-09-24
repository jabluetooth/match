import { Briefcase, CalendarDays, LayoutGrid, Mail, Settings2, Target, type LucideIcon } from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  /** Second key of the "g then …" shortcut. */
  key: string;
}

export const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutGrid, key: "d" },
  { name: "Job matches", href: "/jobs", icon: Target, key: "j" },
  { name: "Applications", href: "/applications", icon: Briefcase, key: "a" },
  { name: "Interviews", href: "/interviews", icon: CalendarDays, key: "i" },
  { name: "Follow-ups", href: "/followups", icon: Mail, key: "f" },
  { name: "Settings", href: "/settings", icon: Settings2, key: "s" },
];

/** Deep pages (research, prep) highlight the section they belong to. */
const PARENT: Record<string, string> = {
  "/research": "/jobs",
  "/interview-prep": "/interviews",
};

export function activeHref(pathname: string): string | undefined {
  const direct = NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(item.href + "/"));
  if (direct) return direct.href;
  const parent = Object.keys(PARENT).find((p) => pathname.startsWith(p));
  return parent ? PARENT[parent] : undefined;
}
