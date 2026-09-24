import { Suspense, type ReactNode } from "react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/app-shell/sidebar";
import { Toaster } from "@/components/ui/toast";

export default function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Sidebar />
      <div className="lg:pl-[var(--sidebar-w)]">
        <Suspense fallback={<div className="h-[var(--topbar-h)] border-b border-line" />}>
          <Header />
        </Suspense>
        <main className="mx-auto w-full max-w-[1240px] px-4 pb-20 pt-8 sm:px-6 lg:px-10 lg:pt-10">{children}</main>
      </div>
      <Toaster />
    </>
  );
}
