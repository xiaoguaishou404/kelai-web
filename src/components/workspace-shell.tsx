"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Menu, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";
import { NAV_ITEMS, PEOPLE, ROLE_HOME } from "@/lib/mock-data";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<Role, string> = {
  student: "学生",
  teacher: "教师",
  leader: "校领导",
  operator: "科来运营",
};

export function WorkspaceShell({ role, children }: { role: Role; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setRole, resetDemo } = useDemo();
  const [open, setOpen] = useState(false);
  const person = PEOPLE.find((item) => item.role === role);
  const items = NAV_ITEMS[role];

  function switchRole(next: Role) {
    setRole(next);
    setOpen(false);
    router.push(ROLE_HOME[next]);
  }

  return (
    <div className={cn("workspace-app min-h-screen", role === "student" && "student-workspace")}>
      <header className="no-print sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1760px] items-center gap-3 px-4 lg:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <BrandLogo />
          <span className="brand-divider" />
          <span className="hidden text-sm font-medium tracking-wide text-ink-soft sm:block">教学实训平台</span>
        </Link>
        <nav className="ml-4 hidden min-w-0 flex-1 items-center gap-1 lg:flex" aria-label="工作台导航">
          {items.map((item) => {
            const active = item.href.split("/").length === 2 ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] transition-colors",
                  active ? "bg-[#eef0f3] font-medium text-ink" : "text-ink-muted hover:text-ink",
                )}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto hidden shrink-0 items-center gap-2 lg:flex">
          <label className="sr-only" htmlFor="role-switch-desktop">演示角色</label>
          <select
            id="role-switch-desktop"
            className="field-control max-w-[104px] py-0"
            value={role}
            onChange={(event) => switchRole(event.target.value as Role)}
          >
            {(Object.keys(ROLE_LABEL) as Role[]).map((item) => (
              <option key={item} value={item}>{ROLE_LABEL[item]}</option>
            ))}
          </select>
          <span className="max-w-[120px] truncate px-1 text-[13px] text-ink">{person?.name}</span>
          <Button
            variant="ghost"
            size="sm"
            className="px-2 text-ink-soft"
            title="恢复演示数据"
            aria-label="恢复演示数据"
            onClick={() => {
              resetDemo(role);
              router.push(ROLE_HOME[role]);
            }}
          >
            <RotateCcw size={15} />
          </Button>
        </div>
        <button
          type="button"
          className="ml-auto grid h-9 w-9 place-items-center rounded-md border border-line-control bg-white text-ink lg:hidden"
          aria-expanded={open}
          aria-label={open ? "收起菜单" : "展开菜单"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
        </div>
      <div
        className={cn(
          "border-t border-line bg-white px-4 py-4 shadow-float lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        <div className="mx-auto max-w-lg">
          <div className="px-2">
            <label className="sr-only" htmlFor="role-switch-mobile">
              角色
            </label>
            <select
              id="role-switch-mobile"
              className="field-control mt-1 w-full"
              value={role}
              onChange={(event) => switchRole(event.target.value as Role)}
            >
              {(Object.keys(ROLE_LABEL) as Role[]).map((item) => (
                <option key={item} value={item}>
                  {ROLE_LABEL[item]}
                </option>
              ))}
            </select>
          </div>
          <nav className="mt-5 grid gap-1" aria-label="工作台导航">
            {items.map((item) => {
              const active = item.href.split("/").length === 2 ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-[13px] transition-colors",
                    active ? "bg-[#eef0f3] font-medium text-ink" : "text-ink-soft hover:bg-[#f6f7f8]",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-6 rounded-lg border border-line bg-[#F8FAFC] p-3 text-xs leading-5 text-ink-soft">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-tide-mist font-medium text-tide">
                {person?.name.slice(0, 1)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-ink">{person?.name}</p>
                <p className="truncate text-[11px] text-ink-muted">{person?.title}</p>
              </div>
            </div>
            <p className="mt-2 truncate text-[11px] text-ink-muted">{person?.org}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 w-full text-ink-soft"
            onClick={() => {
              resetDemo(role);
              router.push(ROLE_HOME[role]);
            }}
          >
            <RotateCcw size={14} />
            恢复演示数据
          </Button>
        </div>
      </div>
      </header>
      <main className="min-w-0">
        <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
