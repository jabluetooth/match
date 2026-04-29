"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, useUser } from '@clerk/nextjs';
import { SignInButton } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Calendar,
  Settings,
  Target,
  Mail
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Job Matches", href: "/jobs", icon: Target },
  { name: "Applications", href: "/applications", icon: FileText },
  { name: "Interviews", href: "/interviews", icon: Calendar },
  { name: "Follow-ups", href: "/followups", icon: Mail },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <Briefcase className="h-8 w-8 text-blue-600" />
        <span className="ml-2 text-xl font-bold text-gray-900">Match</span>
      </div>

      {/* Navigation - Only shown when signed in */}
      {isSignedIn ? (
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5",
                    isActive ? "text-blue-700" : "text-gray-400"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      ) : (
        <div className="flex-1 px-4 py-6 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">Sign in to access your dashboard</p>
            <SignInButton mode="modal">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      )}

      {/* User profile - Only shown when signed in */}
      <div className="p-4 border-t border-gray-200">
        {isSignedIn && (
          <div className="flex items-center gap-3">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-10 w-10"
                }
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.fullName || user?.firstName || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
