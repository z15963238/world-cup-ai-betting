import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DecisionSupportDisclaimer } from "@/components/decision-support-disclaimer";
import { Navigation } from "@/components/navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "\u4e16\u754c\u76c3 AI \u8cfd\u524d\u5efa\u8b70",
  description: "\u4e16\u754c\u76c3\u8db3\u7403\u8cfd\u4e0b\u6ce8\u5206\u6790\u8207\u6c7a\u7b56\u8f14\u52a9\u5de5\u5177"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>
        <Navigation />
        <DecisionSupportDisclaimer />
        <main className="container-page py-8 md:py-10">{children}</main>
      </body>
    </html>
  );
}
