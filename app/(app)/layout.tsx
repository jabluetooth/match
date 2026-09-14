import { Suspense } from "react";
import { NavDock } from "@/components/nav-dock";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/toast";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Suspense fallback={<div style={{ height: 65 }} />}>
        <Header />
      </Suspense>
      <main className="pb-24">
        {children}
      </main>
      <Toaster />
      <NavDock />
    </>
  );
}
