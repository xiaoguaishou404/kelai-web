"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { platformDefinitions } from "@/lib/platform-admin/definitions";

const platformOrder = ["career", "scene", "course", "ability", "resource", "affairs", "alliance", "system"];

export function ConsoleSidebar({ path }: { path: string[] }) {
  const platformId = path[0] === "admin" ? path[1] : undefined;
  const currentPlatform = platformDefinitions.find((item) => item.id === platformId)
    ?? (path[0] === "admin" ? platformDefinitions.find((item) => item.id === "career") : undefined);
  const currentPageId = path[0] === "admin" && path[2]
    ? path[2]
    : currentPlatform?.groups[0]?.pages[0]?.id;

  return (
    <div className="ep-console-tree">
      <small>业务平台</small>
      <Link className={path[0] === "manage" ? "active" : ""} href="/platform/manage">企业看板</Link>
      {platformOrder
        .map((id) => platformDefinitions.find((item) => item.id === id))
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .map((platform) => {
          const firstPage = platform.groups[0]?.pages[0];
          if (!firstPage) return null;
          const open = platform.id === currentPlatform?.id;
          return (
            <div className={"ep-console-tree-group" + (open ? " is-open" : "")} key={platform.id}>
              <Link
                className={"ep-console-tree-head" + (open ? " is-current" : "")}
                href={`/platform/admin/${platform.id}/${firstPage.id}`}
                title={platform.label}
              >
                <span>{platform.short}</span>
                <ChevronRight size={14} />
              </Link>
              {open && (
                <div className="ep-console-tree-pages">
                  {platform.groups.map((group) => (
                    <div className="ep-console-tree-section" key={group.id}>
                      <small>{group.label}</small>
                      {group.pages.map((page) => (
                        <Link
                          className={page.id === currentPageId ? "active" : ""}
                          href={`/platform/admin/${platform.id}/${page.id}`}
                          key={page.id}
                        >
                          {page.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}
