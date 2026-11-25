import type { Role } from "@/lib/enterprise-workspace/types";

export type ModuleOwner = "platform" | "school";

export function moduleOwner(platformId: string, pageId: string): ModuleOwner {
  if (platformId === "affairs") return "school";
  if (platformId === "ability" && pageId === "lesson-results") return "school";
  if (platformId === "system" && pageId === "tenant") return "school";
  return "platform";
}

export function roleOwner(role: Role | null): ModuleOwner | null {
  if (role === "manage") return "platform";
  if (role === "schoolAdmin") return "school";
  return null;
}

export function isReadOnlyFor(role: Role | null, platformId: string, pageId: string) {
  if (!roleOwner(role)) return true;
  if (platformId === "career" || platformId === "scene") return false;
  return roleOwner(role) !== moduleOwner(platformId, pageId);
}

export function canEnterAdmin(role: Role | null) {
  return role === "manage" || role === "schoolAdmin";
}

export function ownerLabel(owner: ModuleOwner) {
  return owner === "platform" ? "科来平台方" : "院校管理方";
}
