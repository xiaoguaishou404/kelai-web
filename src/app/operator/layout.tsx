"use client";

import { useEffect, type ReactNode } from "react";
import { WorkspaceShell } from "@/components/workspace-shell";
import { useDemo } from "@/lib/demo-store";

export default function OperatorLayout({ children }: { children: ReactNode }) {
  const { setRole } = useDemo();
  useEffect(() => setRole("operator"), [setRole]);
  return <WorkspaceShell role="operator">{children}</WorkspaceShell>;
}