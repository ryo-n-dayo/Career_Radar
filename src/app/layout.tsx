import type { Metadata } from "next";
import "./globals.css";

const SITE_NAME = "Event Radar";
const SITE_DESCRIPTION =
  "ハッカソン・ビジネスコンテスト・企業主催イベントの募集情報を一箇所にまとめて、締切から逆算して探せるサイト。";

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: "ja_JP"
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <div className="yui-blob yui-blob--a" aria-hidden />
        <div className="yui-blob yui-blob--b" aria-hidden />
        <div className="yui-load-view" aria-hidden>
          <span className="yui-load-view__logo">EVENT · RADAR</span>
        </div>
        {children}
      </body>
    </html>
  );
}
