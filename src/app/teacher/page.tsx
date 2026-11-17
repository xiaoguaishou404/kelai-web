"use client";

import Link from "next/link";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";
import { CLASSROOMS } from "@/lib/mock-data";
import { challengeRate, liveMinutes, pendingReviews, returnedSubmissions, sessionLimit, weakAbilities } from "@/lib/metrics";
import { formatMinutes } from "@/lib/utils";

export default function TeacherHomePage() {
  const { state } = useDemo();
  const timeout = state.environment.timeoutMinutes ?? 40;
  const rows = CLASSROOMS.map((classroom) => {
    const pending = pendingReviews(state, classroom).length;
    const returned = returnedSubmissions(state, classroom).length;
    const rates = state.publishedChallengeIds.map((challengeId) => challengeRate(state, challengeId, classroom));
    const passed = rates.reduce((sum, item) => sum + item.passed, 0);
    const total = rates.reduce((sum, item) => sum + item.total, 0);
    const reclaimed = new Set(
      state.submissions
        .filter((item) => classroom.studentIds.includes(item.studentId))
        .filter((item) => (item.status === "in_progress" || item.status === "returned") && item.desktopMinutes >= sessionLimit(timeout, item.grantedMinutes))
        .map((item) => item.studentId),
    ).size;
    return {
      classroom,
      pending,
      returned,
      passRate: total ? Math.round((passed / total) * 100) : 0,
      minutes: liveMinutes(state, classroom),
      weakest: weakAbilities(state, classroom)[0],
      reclaimed,
      rosterReady: state.rosterImportedByClass[classroom.id] ?? false,
    };
  });
  const totalStudents = rows.reduce((sum, item) => sum + item.classroom.studentIds.length, 0);
  const totalPending = rows.reduce((sum, item) => sum + item.pending, 0);
  const totalPassed = rows.reduce((sum, item) => sum + item.passRate * item.classroom.studentIds.length, 0);
  const totalMinutes = rows.reduce((sum, item) => sum + item.minutes, 0);
  const riskRows = rows.filter((item) => !item.rosterReady || item.pending > 0 || item.returned > 0 || item.reclaimed > 0);

  return (
    <>
      <PageHeader
        title="教学总览"
        action={<Link className={buttonVariants()} href="/teacher/classes">班级</Link>}
      />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="开课班级" value={`${rows.length} 个`} hint="均由当前教师负责" />
        <MetricCard label="覆盖学生" value={`${totalStudents} 人`} hint="名单按班独立维护" />
        <MetricCard label="待验收" value={`${totalPending} 项`} hint="进入对应班级处理" />
        <MetricCard label="整体通过" value={`${totalStudents ? Math.round(totalPassed / totalStudents) : 0}%`} hint="按班级学生数加权" />
        <MetricCard label="云桌面机时" value={formatMinutes(totalMinutes)} hint="当前开课班级合计" />
      </section>

      <section className="mt-6 overflow-x-auto rounded-xl border border-line bg-paper">
        <div className="border-b border-line p-5">
          <h2 className="section-title">班级</h2>
        </div>
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-line text-xs text-ink-soft"><tr><th className="px-5 py-3 font-medium">班级</th><th className="px-4 py-3 font-medium">学生</th><th className="px-4 py-3 font-medium">通过</th><th className="px-4 py-3 font-medium">待验收 / 退回</th><th className="px-4 py-3 font-medium">短板</th><th className="px-4 py-3 font-medium">机时</th></tr></thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.classroom.id} className="border-b border-line last:border-0">
                <td className="px-5 py-4"><Link href={`/teacher/classes/${item.classroom.id}`} className="font-medium hover:text-tide">{item.classroom.name}</Link><p className="mt-1 text-xs text-ink-muted">{item.classroom.major}</p></td>
                <td className="px-4 py-4">{item.classroom.studentIds.length}</td>
                <td className="px-4 py-4">{item.passRate}%</td>
                <td className="px-4 py-4">{item.pending} / {item.returned}</td>
                <td className="px-4 py-4">{item.weakest.name} {item.weakest.score}</td>
                <td className="px-4 py-4">{formatMinutes(item.minutes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-6">
        <h2 className="section-title">风险</h2>
        {riskRows.length === 0 ? <p className="mt-3 rounded-xl border border-line bg-paper p-4 text-sm text-ink-soft">当前没有名单、验收、退回或桌面回收风险。</p> : (
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {riskRows.map((item) => (
              <Link key={item.classroom.id} href={`/teacher/classes/${item.classroom.id}${item.pending ? "?view=reviews" : ""}`} className="rounded-xl border border-warning-border bg-warning-mist p-4">
                <p className="font-medium text-warning-deep">{item.classroom.name}</p>
                <p className="mt-1 text-sm leading-6 text-ink-soft">
                  {!item.rosterReady ? "名单待确认 · " : ""}{item.pending} 项待验收 · {item.returned} 项退回 · {item.reclaimed} 名学生桌面达到回收线
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
