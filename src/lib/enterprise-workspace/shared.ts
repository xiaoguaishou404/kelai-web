import { AuditEvent } from "./types";

export function nowLabel() {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function createAudit(actor: string, action: string, target: string, note: string): AuditEvent {
  return { id: crypto.randomUUID(), at: nowLabel(), actor, action, target, note };
}
