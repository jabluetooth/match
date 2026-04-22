import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import { NavDock } from "@/components/nav-dock";
import { Header } from "@/components/header";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

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
        <body className={`${inter.variable} ${outfit.variable} font-sans`}>
          <div className="min-h-screen bg-gray-50">
            <Header />
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
