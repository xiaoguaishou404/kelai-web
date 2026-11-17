import { Suspense } from "react";
import type { Metadata } from "next";
import { DemoProvider } from "@/lib/demo-store";
import "./globals.css";

export const metadata: Metadata = {
  title: "科来 - 知与 | 场景化产教融合平台",
  icons: { icon: "/brand/colasoft-logo.png", apple: "/brand/colasoft-logo.png" },
  description: "场景化产教融合平台，连接岗位标准、场景实训、产业项目与人才培养。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="page-enter">
        <DemoProvider>
          <Suspense fallback={<div className="p-8 text-center text-ink-muted">正在加载科来工作空间…</div>}>{children}</Suspense>
        </DemoProvider>
      </body>
    </html>
  );
}
