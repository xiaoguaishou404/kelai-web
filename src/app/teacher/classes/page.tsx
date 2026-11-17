"use client";

import Link from "next/link";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";
import { CLASSROOMS } from "@/lib/mock-data";
import { liveMinutes, pendingReviews, returnedSubmissions, studentSummary, weakAbilities } from "@/lib/metrics";
import { formatMinutes } from "@/lib/utils";

export default function TeacherClassesPage() {
  const { state } = useDemo();
  const rows = CLASSROOMS.map((classroom) => {
    const summaries = classroom.studentIds.map((studentId) => studentSummary(state, studentId));
    const passed = summaries.reduce((sum, item) => sum + item.passed, 0);
    const total = summaries.reduce((sum, item) => sum + item.total, 0);
    const pending = pendingReviews(state, classroom);
    const returned = returnedSubmissions(state, classroom);
    const weak = weakAbilities(state, classroom)[0];
    const imported = state.rosterImportedByClass[classroom.id] ?? false;
    return {
      classroom,
      pending: pending.length,
      returned: returned.length,
      progress: total ? Math.round((passed / total) * 100) : 0,
      minutes: liveMinutes(state, classroom),
      weak,
      imported,
    };
  });

  return (
    <>
      <PageHeader title="班级" />
      <section className="mb-5 grid gap-3 sm:grid-cols-3">
        <MetricCard label="负责班级" value={`${rows.length} 个`} hint="进入班级后处理学生级事务" />
        <MetricCard label="覆盖学生" value={`${rows.reduce((sum, item) => sum + item.classroom.studentIds.length, 0)} 人`} hint="名单和状态按班隔离" />
        <MetricCard label="待验收" value={`${rows.reduce((sum, item) => sum + item.pending, 0)} 项`} hint="验收入口位于对应班级内" />
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        {rows.map((row) => {
          const hasRisk = !row.imported || row.returned > 0 || row.pending > 0;
          return (
            <article key={row.classroom.id} className="rounded-xl border border-line bg-paper p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-ink-muted">{row.classroom.termLabel}</p>
                  <h2 className="mt-1 text-lg font-semibold">{row.classroom.name}</h2>
                  <p className="mt-1 text-sm text-ink-soft">{row.classroom.major} · {row.classroom.studentIds.length} 名学生</p>
                </div>
                <span className={hasRisk ? "text-xs text-warning-deep" : "text-xs text-tide-deep"}>
                  {!row.imported ? "名单待确认" : row.pending > 0 ? `${row.pending} 项待验收` : row.returned > 0 ? `${row.returned} 项已退回` : "进展正常"}
                </span>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div><dt className="text-xs text-ink-muted">通过进度</dt><dd className="mt-1 font-medium">{row.progress}%</dd></div>
                <div><dt className="text-xs text-ink-muted">待验收 / 退回</dt><dd className="mt-1 font-medium">{row.pending} / {row.returned}</dd></div>
                <div><dt className="text-xs text-ink-muted">云桌面机时</dt><dd className="mt-1 font-medium">{formatMinutes(row.minutes)}</dd></div>
                <div><dt className="text-xs text-ink-muted">当前短板</dt><dd className="mt-1 font-medium">{row.weak.name} {row.weak.score}</dd></div>
              </dl>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href={`/teacher/classes/${row.classroom.id}`} className={buttonVariants()}>进入班级</Link>
                <Link href={`/teacher/classes/${row.classroom.id}?view=reviews`} className={buttonVariants({ variant: "secondary" })}>成果验收</Link>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
