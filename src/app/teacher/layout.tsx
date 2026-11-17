"use client";

import { useEffect, type ReactNode } from "react";
import { WorkspaceShell } from "@/components/workspace-shell";
import { useDemo } from "@/lib/demo-store";

export default function TeacherLayout({ children }: { children: ReactNode }) {
  const { setRole } = useDemo();
  useEffect(() => setRole("teacher"), [setRole]);
  return <WorkspaceShell role="teacher">{children}</WorkspaceShell>;
}
