import type { Metadata } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { Providers } from "@/components/system/providers";
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

// Clerk's hosted sign-in and account modals, in Match's colours. Both the
// current and the older variable names are set so either Clerk UI reads them.
const CLERK_APPEARANCE = {
  variables: {
    colorPrimary: "#d9a441",
    colorPrimaryForeground: "#1a1206",
    colorBackground: "#131315",
    colorForeground: "#eeeef0",
    colorText: "#eeeef0",
    colorMutedForeground: "#a6a6af",
    colorTextSecondary: "#a6a6af",
    colorInput: "#1b1b1e",
    colorInputBackground: "#1b1b1e",
    colorInputForeground: "#eeeef0",
    colorInputText: "#eeeef0",
    colorNeutral: "#eeeef0",
    colorDanger: "#ef4444",
    colorSuccess: "#22c55e",
    colorWarning: "#f59e0b",
    colorBorder: "#34343a",
    fontFamily: "var(--font-inter)",
    borderRadius: "6px",
  },
};

export const metadata: Metadata = {
  title: { default: "Match — job hunting, automated", template: "%s · Match" },
  description:
    "Match scores open roles against your profile, tailors your resume to each one, researches the company, preps the interview and tracks every application.",
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
    <ClerkProvider appearance={CLERK_APPEARANCE}>
      <html lang="en" className="dark" style={{ colorScheme: "dark" }} data-scroll-behavior="smooth">
        <body className={`${instrumentSerif.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
