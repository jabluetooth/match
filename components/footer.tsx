import Link from "next/link";
import { Github, Linkedin, Instagram, Globe } from "lucide-react";

interface FooterLink {
  label: string;
  href: string;
}

const SITE_LINKS: FooterLink[] = [
  { label: "Dashboard", href: "/" },
  { label: "Job matches", href: "/jobs" },
  { label: "Applications", href: "/applications" },
  { label: "Settings", href: "/settings" },
];

const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/jabluetooth", Icon: Github },
  { label: "LinkedIn", href: "https://ph.linkedin.com/in/filheinzrelatorre", Icon: Linkedin },
  { label: "Instagram", href: "https://www.instagram.com/fil.tower", Icon: Instagram },
  { label: "Portfolio", href: "https://www.filheinzrelatorre.com/", Icon: Globe },
];

/**
 * Same two-panel format as this account's other portfolio projects
 * (Insight, Bonny AI, Mimo): an accent brand panel + a glass links panel,
 * rounded on the top corners only and flush at the bottom. Given generous
 * bottom clearance (see .site-footer padding-bottom) so its content never
 * sits under the fixed NavDock, the same way `main`'s own pb-24 already
 * clears the dock for regular dashboard content.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand-panel">
          <span className="footer-wordmark">match</span>

          <div className="footer-brand-foot">
            <p className="footer-tagline">Automated job search, from match to offer.</p>

            <div className="footer-icon-row">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="footer-icon-link"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>

            <p className="footer-copyright">&copy; {year} Match by Fil Heinz Re La Torre</p>
          </div>
        </div>

        <nav aria-label="Footer" className="footer-links-panel">
          <h2 className="footer-col-title">Site</h2>
          <ul className="footer-col-list">
            {SITE_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
