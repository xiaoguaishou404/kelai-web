import type { ReactNode } from "react";

export function PageHeader({
  title,
  meta,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: ReactNode;
  action?: ReactNode;
  art?: ReactNode;
}) {
  return (
    <header className="page-header mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-[26px] font-semibold leading-none tracking-tight text-ink">{title}</h1>
        {meta ? <p className="mt-2 text-sm text-ink-muted">{meta}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap items-center gap-2">{action}</div> : null}
    </header>
  );
}
