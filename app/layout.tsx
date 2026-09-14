import type { Metadata } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";

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
  title: "Match",
  description: "Automated job search, application tracking, and interview preparation",
};

export const viewport = {
  themeColor: "#0b0b0d",
  colorScheme: "dark" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" style={{ colorScheme: "dark" }} data-scroll-behavior="smooth">
        <body className={`${instrumentSerif.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
