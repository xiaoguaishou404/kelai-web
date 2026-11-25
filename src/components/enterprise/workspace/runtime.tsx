import { createContext, useContext, type ReactNode } from "react";

export interface WorkspaceRuntime {
  notify: (message: string) => void;
  go: (target: string) => void;
  switchRole: (role: import("@/lib/enterprise-workspace").Role, target: string) => void;
}

const WorkspaceRuntimeContext = createContext<WorkspaceRuntime | null>(null);

export function WorkspaceRuntimeProvider({
  value,
  children,
}: {
  value: WorkspaceRuntime;
  children: ReactNode;
}) {
  return <WorkspaceRuntimeContext.Provider value={value}>{children}</WorkspaceRuntimeContext.Provider>;
}

export function useWorkspaceRuntime() {
  const value = useContext(WorkspaceRuntimeContext);
  if (!value) throw new Error("useWorkspaceRuntime must be used inside WorkspaceRuntimeProvider");
  return value;
}
