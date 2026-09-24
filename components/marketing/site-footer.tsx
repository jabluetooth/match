import { GITHUB_URL, SECTIONS } from "@/lib/marketing";

const SOCIAL = [
  { label: "GitHub", href: "https://github.com/jabluetooth" },
  { label: "LinkedIn", href: "https://ph.linkedin.com/in/filheinzrelatorre" },
  { label: "Instagram", href: "https://www.instagram.com/fil.tower" },
  { label: "Portfolio", href: "https://www.filheinzrelatorre.com/" },
] as const;

/** Link columns over an oversized wordmark cropped by the page's bottom edge. */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-[clamp(6rem,12vw,12rem)] overflow-hidden border-t border-line">
      <div className="grid gap-10 px-[5vw] pt-12 sm:grid-cols-3">
        <div>
          <p className="eyebrow">Match</p>
          <p className="mt-3 max-w-[30ch] text-sm leading-relaxed text-ink-2">
            Job hunting, automated. An open-source personal project.
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="eyebrow">Site</p>
          <ul className="mt-3 space-y-2 text-sm">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-ink-2 hover:text-ink">{s.label}</a>
              </li>
            ))}
            <li>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-ink-2 hover:text-ink">Source on GitHub</a>
            </li>
          </ul>
        </nav>
        <div>
          <p className="eyebrow">Elsewhere</p>
          <ul className="mt-3 space-y-2 text-sm">
            {SOCIAL.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-ink-2 hover:text-ink">{s.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="px-[5vw] pt-10 font-mono text-[11px] text-ink-3">&copy; {year} Match by Fil Heinz Re La Torre</p>
      <div aria-hidden="true" className="-mb-[0.26em] mt-6 select-none whitespace-nowrap px-[3vw] font-display text-[clamp(8rem,31vw,30rem)] leading-[0.8] tracking-[-0.03em] text-raised">
        match<span className="font-mono text-[0.5em] text-accent/25">%</span>
      </div>
    </footer>
  );
}
