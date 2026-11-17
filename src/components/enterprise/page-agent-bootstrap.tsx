"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function PageAgentBootstrap() {
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    let active = true;
    const existing = window.__COLASOFT_PAGE_AGENT_RUNTIME__;
    if (existing) {
      existing.syncPath(pathname);
      return;
    }
    if (!pathname.startsWith("/platform") || pathname === "/platform/login") return;

    void import("@/lib/page-agent-runtime").then(({ ensurePageAgentRuntime }) => {
      if (active) void ensurePageAgentRuntime(pathname);
    });
    return () => {
      active = false;
    };
  }, [pathname]);

  return null;
}
