import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./pages.css";
import { SITE } from "@/lib/site";

// Self-hosted (latin subset) — no runtime request to Google Fonts, no render-blocking @import.
const serif = localFont({
  src: [
    { path: "../fonts/instrument-serif-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/instrument-serif-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-instrument-serif",
  display: "swap",
});
const sans = localFont({
  src: [
    { path: "../fonts/manrope-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "../fonts/manrope-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/manrope-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/manrope-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/manrope-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "EcoKit Admin", template: "%s | EcoKit Admin" },
  description: "EcoKit Administration Panel",
  applicationName: "EcoKit Admin",
  
  openGraph: {
    type: "website",
    siteName: "EcoKit Admin",
    locale: "en_IN",
    title: "EcoKit Admin",
    description: "EcoKit Administration Panel",
    images: [{ url: "/images/hero-bathroom.png", alt: "EcoKit bamboo amenities in a hotel bathroom" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#F4A300", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
