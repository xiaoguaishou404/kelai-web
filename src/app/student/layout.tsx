"use client";

import { useEffect, type ReactNode } from "react";
import { WorkspaceShell } from "@/components/workspace-shell";
import { useDemo } from "@/lib/demo-store";

export default function StudentLayout({ children }: { children: ReactNode }) {
  const { setRole } = useDemo();
  useEffect(() => setRole("student"), [setRole]);
  return <WorkspaceShell role="student">{children}</WorkspaceShell>;
}
