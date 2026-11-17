import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { desktopClock } from "@/lib/metrics";
import { ABILITIES } from "@/lib/mock-data";
import type { Challenge, Submission } from "@/lib/types";

export function ChallengeCard({
  challenge,
  submission,
  timeoutMinutes,
  note,
  badge,
}: {
  challenge: Challenge;
  submission?: Submission;
  timeoutMinutes: number;
  note?: string;
  badge?: string;
}) {
  const ability = ABILITIES.find((item) => item.key === challenge.abilities[0])?.name;
  const clock = desktopClock(timeoutMinutes, submission);
  const done = submission?.completedStageIds.length ?? 0;
  const total = Math.max(1, challenge.stages.length);
  const active = submission && submission.status !== "not_started" && submission.status !== "passed";

  return (
    <Link
      href={`/student/challenges/${challenge.id}`}
      className="flex h-full flex-col rounded-xl border border-line bg-paper p-4 transition-colors hover:border-[#cfd3dc]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-ink-muted">{badge ?? (challenge.required ? "必选" : "选配")}{ability ? ` · ${ability}` : ""}</span>
        <StatusBadge status={submission?.status ?? "not_started"} />
      </div>
      <h2 className="mt-3 text-[15px] font-medium leading-snug text-ink">{challenge.title}</h2>
      <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-ink-soft">{challenge.summary}</p>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-canvas">
        <span className="block h-full bg-ink" style={{ width: `${Math.round((done / total) * 100)}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-ink-muted">
        <span className="numeric">{done}/{challenge.stages.length}</span>
        {active ? <span>{clock.reclaimed ? "已暂停" : `${clock.used}/${clock.limit} 分钟`}</span> : <span>{challenge.difficulty}</span>}
      </div>
      {note ? <p className="mt-2 text-xs text-ink-soft">{note}</p> : null}
    </Link>
  );
}
