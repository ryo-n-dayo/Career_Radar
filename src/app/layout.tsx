import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js App",
  description: "Generated starter"
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
          <span className="yui-load-view__logo">CAREER · RADAR</span>
        </div>
        {children}
      </body>
    </html>
  );
}
