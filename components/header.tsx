"use client";

import { Bell } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="topbar">
      <Link href="/" className="logo">match</Link>

      <div className="topbar-right">
        <button className="icon-btn" aria-label="Notifications" type="button">
          <Bell size={16} />
        </button>
      </div>
    </header>
  );
}
