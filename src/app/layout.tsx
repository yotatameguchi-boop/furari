import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ふらり — なんとなくから、旅が決まる",
  description:
    "行き先も目的も先に聞かない。雑談から性格と日数と予算を拾い、乗り継ぎまで含めた旅を提案する。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
