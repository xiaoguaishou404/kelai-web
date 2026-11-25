"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ModuleOwner } from "@/lib/platform-admin/permissions";

interface ConsoleAccess {
  readOnly: boolean;
  owner: ModuleOwner | null;
  pageTitle: string;
}

const ConsoleAccessContext = createContext<ConsoleAccess>({ readOnly: false, owner: null, pageTitle: "" });

export function ConsoleAccessProvider({ value, children }: { value: ConsoleAccess; children: ReactNode }) {
  return <ConsoleAccessContext.Provider value={value}>{children}</ConsoleAccessContext.Provider>;
}

export function useConsoleAccess() {
  return useContext(ConsoleAccessContext);
}
