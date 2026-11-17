import { Inbox } from "lucide-react";

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line-control bg-paper px-6 py-12 text-center shadow-card">
      <span className="mx-auto grid h-11 w-11 place-items-center rounded-lg bg-tide-mist text-tide">
        <Inbox size={20} strokeWidth={1.5} />
      </span>
      <h2 className="mt-4 font-display text-base font-medium text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-ink-soft">{body}</p>
    </div>
  );
}
