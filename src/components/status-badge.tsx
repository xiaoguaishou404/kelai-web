import { STATUS_LABEL } from "@/lib/metrics";
import type { SubmissionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<SubmissionStatus, string> = {
  not_started: "border-line bg-[#F1F5F9] text-ink-soft",
  in_progress: "border-tide-border bg-tide-mist text-tide-deep",
  submitted: "border-warning-border bg-warning-mist text-warning-deep",
  returned: "border-danger/15 bg-danger-mist text-danger-deep",
  passed: "border-success-border bg-success-mist text-success-deep",
};

export function StatusBadge({ status, className }: { status: SubmissionStatus; className?: string }) {
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-normal leading-none", STYLES[status], className)}>
      {STATUS_LABEL[status]}
    </span>
  );
}
