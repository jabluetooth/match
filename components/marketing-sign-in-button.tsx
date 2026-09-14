"use client";

import { SignInButton } from "@clerk/nextjs";
import type { ReactNode } from "react";

interface MarketingSignInButtonProps {
  className: string;
  children: ReactNode;
}

/**
 * Clerk's <SignInButton> must be rendered from a Client Component — passing
 * it JSX children directly from a Server Component (app/page.tsx has no
 * "use client") trips its internal Children.only check across the RSC
 * boundary. This wrapper isolates that client boundary to just the button.
 */
export function MarketingSignInButton({ className, children }: MarketingSignInButtonProps) {
  return (
    <SignInButton mode="modal" forceRedirectUrl="/dashboard">
      <button className={className} type="button">
        {children}
      </button>
    </SignInButton>
  );
}
