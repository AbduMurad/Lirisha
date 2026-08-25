import type { Metadata, Viewport } from "next";
import { Reem_Kufi, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const reemKufi = Reem_Kufi({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-reem-kufi",
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500"],
  variable: "--font-plex-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "ليريشيا — عبايات وبشوت | Lirisha",
    template: "%s | ليريشيا",
  },
  description:
    "ليريشيا — براند عبايات ليبي بلمسة فاخرة. عبايات راقية وبشوت وتفصيل خاص يعبّر عن ذوقك. أناقة بتفاصيلها.",
  openGraph: {
    title: "ليريشيا — عبايات وبشوت",
    description: "فخامة التصميم العربي بروح عصرية. تفصيل خاص وتطريز يدوي.",
    locale: "ar_LY",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#FBF9F5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${reemKufi.variable} ${plexArabic.variable}`}>
      <body>{children}</body>
    </html>
  );
}
