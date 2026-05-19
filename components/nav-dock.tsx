"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { UserButton, SignInButton } from "@clerk/nextjs";
import { Dock, DockIcon } from "@/components/ui/dock";
import {
  LayoutDashboard,
  Target,
  FileText,
  Calendar,
  Mail,
  Settings,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Job Matches", href: "/jobs", icon: Target },
  { name: "Applications", href: "/applications", icon: FileText },
  { name: "Interviews", href: "/interviews", icon: Calendar },
  { name: "Follow-ups", href: "/followups", icon: Mail },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function NavDock() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto">
        <Dock
          iconSize={44}
          iconMagnification={68}
          iconDistance={120}
          className="bg-[rgba(16,18,26,0.55)] border-white/10 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.6),0_8px_16px_-4px_rgba(0,0,0,0.4)] backdrop-blur-xl"
        >
          {isSignedIn ? (
            <>
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <DockIcon key={item.name}>
                    <Link
                      href={item.href}
                      title={item.name}
                      className={cn(
                        "flex h-full w-full items-center justify-center rounded-full transition-colors",
                        isActive
                          ? ""
                          : "text-white/65 hover:bg-white/10 hover:text-white",
                      )}
                      style={isActive ? { background: 'var(--primary-soft)', color: 'var(--primary-ink)' } : undefined}
                    >
                      <item.icon className="h-5 w-5" />
                    </Link>
                  </DockIcon>
                );
              })}

              <div className="mx-1 w-px self-center bg-white/10 h-8" />

              <DockIcon>
                <div className="flex h-full w-full items-center justify-center rounded-full">
                  <UserButton
                    appearance={{ elements: { avatarBox: "h-8 w-8" } }}
                  />
                </div>
              </DockIcon>
            </>
          ) : (
            <>
              <DockIcon>
                <div className="flex h-full w-full items-center justify-center rounded-full text-indigo-400">
                  <Briefcase className="h-5 w-5" />
                </div>
              </DockIcon>

              <div className="mx-1 w-px self-center bg-white/10 h-8" />

              <DockIcon>
                <SignInButton mode="modal">
                  <button
                    title="Sign In"
                    className="flex h-full w-full items-center justify-center rounded-full bg-indigo-500 text-white hover:bg-indigo-400 transition-colors text-xs font-semibold px-2"
                  >
                    Sign In
                  </button>
                </SignInButton>
              </DockIcon>
            </>
          )}
        </Dock>
      </div>
    </div>
  );
}
