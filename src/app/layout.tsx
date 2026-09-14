import type { Metadata } from "next";
import { APP_NAME, APP_TAGLINE } from "@/lib/appConfig";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`
  },
  description: APP_TAGLINE,
  icons: { icon: "/icon.svg" }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  );
}
