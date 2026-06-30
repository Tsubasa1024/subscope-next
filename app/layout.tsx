import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Noto_Sans_JP } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth-context";
import Toast from "@/components/Toast";
import PullToRefresh from "@/components/PullToRefresh";
import PageTransition from "@/components/PageTransition";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

// next/font で Noto Sans JP を自己ホスティング（Render Blocking 解消）
const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.subscope.jp"),
  title: {
    default: "SUBSCOPE｜AIニュース・ツール活用メディア",
    template: "%s | SUBSCOPE",
  },
  description:
    "ChatGPT・Claude・Gemini・Grokなど、主要AIの最新ニュースを毎日更新。初心者向けの使い方から徹底比較まで、AI活用に役立つ情報を発信するメディアです。",
  openGraph: {
    type: "website",
    siteName: "SUBSCOPE",
    locale: "ja_JP",
    title: "SUBSCOPE｜AIニュース・ツール活用メディア",
    description:
      "ChatGPT・Claude・Gemini・Grokなど、主要AIの最新ニュースを毎日更新。初心者向けの使い方から徹底比較まで、AI活用に役立つ情報を発信するメディアです。",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SUBSCOPE｜AIニュース・ツール活用メディア",
    description:
      "ChatGPT・Claude・Gemini・Grokなど、主要AIの最新ニュースを毎日更新。初心者向けの使い方から徹底比較まで、AI活用に役立つ情報を発信するメディアです。",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/icon-180.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${inter.variable} ${notoSansJP.variable}`}>
      <body style={{ fontFamily: "var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, sans-serif" }}>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
        <AuthProvider>
          <PullToRefresh />
          <PageTransition>{children}</PageTransition>
          <Suspense>
            <Toast />
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
