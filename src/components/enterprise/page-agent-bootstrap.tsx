import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function PageAgentBootstrap() {
  const { pathname } = useLocation();

  useEffect(() => {
    let active = true;
    const existing = window.__ZJKG_PAGE_AGENT_RUNTIME__;
    if (existing) {
      existing.syncPath(pathname);
      return;
    }

    void import("@/lib/page-agent-runtime").then(({ ensurePageAgentRuntime }) => {
      if (active) void ensurePageAgentRuntime(pathname);
    });
    return () => {
      active = false;
    };
  }, [pathname]);

  return null;
}
