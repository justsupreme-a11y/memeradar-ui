import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "밈레이더",
  description: "국내·해외 밈 트렌드 실시간 대시보드",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
