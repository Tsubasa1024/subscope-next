import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Noto_Sans_JP } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import Toast from "@/components/Toast";
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
    default: "SUBSCOPE｜サブスクリプションのリアルなレビューメディア",
    template: "%s | SUBSCOPE",
  },
  description:
    "SUBSCOPE（サブスコープ）は、動画・音楽・読書・学習などあらゆるサブスクサービスを実体験レビューで比較・紹介するレビューメディアです。あなたに合ったサブスクが見つかります。",
  openGraph: {
    type: "website",
    siteName: "SUBSCOPE",
    locale: "ja_JP",
    images: [
      {
        url: "/ogp-default-v3.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${inter.variable} ${notoSansJP.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body style={{ fontFamily: "var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <AuthProvider>
          {children}
          <Suspense>
            <Toast />
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
