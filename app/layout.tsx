import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import { NavDock } from "@/components/nav-dock";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Match - AI-Powered Career Management",
  description: "Automated job search, application tracking, and interview preparation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <div className="min-h-screen bg-gray-50">
            <main className="pb-28">
              {children}
            </main>
            <NavDock />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
