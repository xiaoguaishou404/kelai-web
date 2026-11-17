"use client";

import { useEffect, type ReactNode } from "react";
import { WorkspaceShell } from "@/components/workspace-shell";
import { useDemo } from "@/lib/demo-store";

export default function LeaderLayout({ children }: { children: ReactNode }) {
  const { setRole } = useDemo();
  useEffect(() => setRole("leader"), [setRole]);
  return <WorkspaceShell role="leader">{children}</WorkspaceShell>;
}
