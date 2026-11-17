"use client";

import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { useDemo } from "@/lib/demo-store";
import { DEMO_STUDENT_ID } from "@/lib/mock-data";
import { isModuleHeld, submissionOf, contentCatalog } from "@/lib/metrics";
import { formatMinutes } from "@/lib/utils";

export default function RecordsPage() {
  const { state } = useDemo();
  const rows = contentCatalog(state)
    .map((challenge) => ({ challenge: submissionOf(state, DEMO_STUDENT_ID, challenge.id)?.challengeSnapshot ?? challenge, submission: submissionOf(state, DEMO_STUDENT_ID, challenge.id) }))
    .filter((item) => {
    if (!item.submission) return false;
    const held = isModuleHeld(state, DEMO_STUDENT_ID, item.challenge.id);
    const unlocked = item.challenge.abilities.includes("report") && !held && item.submission.status === "not_started";
    return item.submission.status !== "not_started" || held || unlocked;
  });

  return (
    <>
      <PageHeader title="记录" action={<Link href="/student/challenges" className="text-sm text-ink-muted hover:text-ink">任务</Link>} />
      {rows.length === 0 ? (
        <EmptyState title="还没有开始的任务" body="从任务学习中心或岗位场景进入。开始核对阶段后，这里会出现记录。" />
      ) : (
        <ol className="space-y-3">
          {rows.map(({ challenge, submission }) => {
            const held = isModuleHeld(state, DEMO_STUDENT_ID, challenge.id);
            const unlocked = challenge.abilities.includes("report") && !held && submission!.status === "not_started";
            return (
            <li key={submission!.id} className="rounded-xl border border-line bg-paper px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-ink-soft">{held || unlocked ? "尚未开始" : `${submission!.updatedAt} · ${formatMinutes(submission!.desktopMinutes)}`}</p>
                  <h2 className="mt-1 font-display text-base font-medium">{challenge.title}</h2>
                </div>
                {held ? <span className="rounded-full border border-warning-border bg-warning-mist px-2.5 py-1 text-xs text-warning-deep">尚未解锁</span> : unlocked ? <span className="rounded-full border border-success-border bg-success-mist px-2.5 py-1 text-xs text-success-deep">已解锁</span> : <StatusBadge status={submission!.status} />}
              </div>
              {submission!.review && !held ? <p className="mt-2 text-sm text-ink-soft">{submission!.review.comment}</p> : null}
              <Link className="mt-3 inline-block text-sm text-ink" href={held ? "/student/challenges/c4" : `/student/challenges/${challenge.id}${submission!.status === "returned" ? "/submit" : ""}`}>
                {held ? "去定位" : "打开"}
              </Link>
            </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
