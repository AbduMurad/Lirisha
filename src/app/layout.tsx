import type { Metadata, Viewport } from "next";
import { Aref_Ruqaa, Amiri, Tajawal } from "next/font/google";
import "./globals.css";

/**
 * Three faces, and the rule for each is a size rule.
 *
 * Aref Ruqaa is a Ruqaa calligraphic face — beautiful at 70px over a
 * photograph, illegible at 20px, where its strokes collide. So it is reserved
 * for the one or two display moments per page and never used for anything a
 * customer has to scan. Amiri, a classical Naskh, carries headings and product
 * names: it keeps the high-contrast, hand-cut feeling a step down in scale.
 * Tajawal takes body, labels, prices and every piece of interface furniture.
 */
const arefRuqaa = Aref_Ruqaa({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-aref",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500"],
  variable: "--font-tajawal",
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
    <html
      lang="ar"
      dir="rtl"
      className={`${arefRuqaa.variable} ${amiri.variable} ${tajawal.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
