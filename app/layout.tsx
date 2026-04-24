import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import { NavDock } from "@/components/nav-dock";
import { Header } from "@/components/header";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" data-accent="peach" data-cardstyle="soft" data-density="regular" data-font="modern">
        <body className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
          <Header />
          <main className="pb-28">
            {children}
          </main>
          <NavDock />
        </body>
      </html>
    </ClerkProvider>
  );
}
