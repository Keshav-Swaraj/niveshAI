import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "NiveshAI — Signal Intelligence for Indian Markets",
  description: "AI that monitors 1,800+ NSE stocks, detects bulk deals and insider trades — and tells you what they mean before you miss the move.",
  keywords: "NSE, BSE, India stocks, bulk deals, insider trading, AI market analysis, NiveshAI",
  openGraph: {
    title: "NiveshAI — Signal Intelligence for Indian Markets",
    description: "AI-powered stock market signal intelligence for Indian retail investors",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col" style={{ background: '#131722', color: '#d1d4dc', fontFamily: 'Inter, system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
