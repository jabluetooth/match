import type { Metadata } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { Suspense } from "react";
import "./globals.css";
import { NavDock } from "@/components/nav-dock";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/toast";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument",
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Match - AI-Powered Career Management",
  description: "Automated job search, application tracking, and interview preparation",
};

export const viewport = {
  themeColor: "#08090f",
  colorScheme: "dark" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
        <body className={`${instrumentSerif.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
          <Suspense fallback={<div style={{ height: 65 }} />}>
            <Header />
          </Suspense>
          <main className="pb-24">
            {children}
          </main>
          <Toaster />
          <NavDock />
        </body>
      </html>
    </ClerkProvider>
  );
}
