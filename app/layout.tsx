import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

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
    default: "SUBSCOPE｜価値あるサブスクリプションを届けるメディア",
    template: "%s | SUBSCOPE",
  },
  description:
    "Subscope（サブスコープ）は、サブスクリプションサービスの使い心地や魅力を実体験をもとに発信し、サービスの価値が伝わる記事を届けるメディアです。",
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
    <html lang="ja" className={notoSansJP.variable}>
      <body style={{ fontFamily: "var(--font-noto), -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
