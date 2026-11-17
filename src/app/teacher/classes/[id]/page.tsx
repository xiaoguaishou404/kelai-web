"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";
import {
  challengeForState,
  classroomById,
  isModuleHeld,
  pendingReviews,
  personById,
  returnedSubmissions,
  sessionLimit,
  studentSummary,
  submissionOf,
  visibleChallenges,
  weakAbilities,
} from "@/lib/metrics";
import type { SubmissionStatus } from "@/lib/types";
import { formatMinutes } from "@/lib/utils";

type StudentFilter = "all" | "submitted" | "returned" | "reclaimed" | "not_started";
type ReviewFilter = "submitted" | "returned" | "passed" | "all";

const STUDENT_FILTERS: { value: StudentFilter; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "submitted", label: "待验收" },
  { value: "returned", label: "已退回" },
  { value: "reclaimed", label: "桌面已回收" },
  { value: "not_started", label: "未开始" },
];

const REVIEW_FILTERS: { value: ReviewFilter; label: string }[] = [
  { value: "submitted", label: "待验收" },
  { value: "returned", label: "已退回" },
  { value: "passed", label: "已通过" },
  { value: "all", label: "全部已开始" },
];

export default function ClassDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const classroom = classroomById(params.id);
  const { state, confirmRoster, grantExtension } = useDemo();
  const [query, setQuery] = useState("");
  const [studentFilter, setStudentFilter] = useState<StudentFilter>("all");
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("submitted");
  const [notice, setNotice] = useState("");

  if (!classroom) return <EmptyState title="没有这个班级" body="请从班级管理返回并选择当前教师负责的班级。" />;

  const view = searchParams.get("view") === "reviews" ? "reviews" : "students";
  const challenges = visibleChallenges(state);
  const pending = pendingReviews(state, classroom);
  const returned = returnedSubmissions(state, classroom);
  const weak = weakAbilities(state, classroom)[0];
  const classSubmissions = state.submissions.filter((item) => classroom.studentIds.includes(item.studentId));
  const activeDesktops = classSubmissions.filter((item) => item.status === "in_progress");
  const canEdit = (status: SubmissionStatus) => status === "not_started" || status === "in_progress" || status === "returned";
  const isReclaimed = (item: (typeof state.submissions)[number]) =>
    canEdit(item.status) && item.desktopMinutes >= sessionLimit(state.environment.timeoutMinutes, item.grantedMinutes);
  const reclaimed = classSubmissions.filter(isReclaimed);
  const extendable = reclaimed.filter((item) => (item.grantedMinutes ?? 0) < 60);
  const rosterImported = state.rosterImportedByClass[classroom.id] ?? false;

  const studentRows = classroom.studentIds.map((studentId) => {
    const submissions = challenges
      .map((challenge) => submissionOf(state, studentId, challenge.id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
    return {
      studentId,
      name: personById(studentId)?.name ?? "未知学生",
      summary: studentSummary(state, studentId),
      submitted: submissions.find((item) => item.status === "submitted"),
      returned: submissions.find((item) => item.status === "returned"),
      reclaimed: submissions.find(isReclaimed),
      extendable: submissions.find((item) => isReclaimed(item) && (item.grantedMinutes ?? 0) < 60),
      notStarted: submissions.every((item) => item.status === "not_started"),
    };
  });
  const searchedRows = studentRows.filter((item) => item.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const matchesStudentFilter = (item: (typeof studentRows)[number], value: StudentFilter) => {
    if (value === "submitted") return Boolean(item.submitted);
    if (value === "returned") return Boolean(item.returned);
    if (value === "reclaimed") return Boolean(item.reclaimed);
    if (value === "not_started") return item.notStarted;
    return true;
  };
  const filteredRows = searchedRows.filter((item) => matchesStudentFilter(item, studentFilter));
  const filterCounts = Object.fromEntries(
    STUDENT_FILTERS.map((option) => [option.value, searchedRows.filter((item) => matchesStudentFilter(item, option.value)).length]),
  ) as Record<StudentFilter, number>;
  const reviewRows = classSubmissions
    .filter((item) => reviewFilter === "all" ? item.status !== "not_started" : item.status === reviewFilter)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const extendOne = (submissionId: string, studentName: string) => {
    grantExtension(submissionId);
    setNotice(`已为 ${studentName} 的回收桌面延时 15 分钟。`);
  };
  const extendAll = () => {
    extendable.forEach((item) => grantExtension(item.id));
    setNotice(`已为 ${extendable.length} 条达到回收线的桌面各延时 15 分钟。`);
  };

  return (
    <>
      <PageHeader eyebrow="班级详情" title={classroom.name} description={`${classroom.major} · ${classroom.termLabel}。进度由学生达成情况决定，不在这里编排课表。`} />
      <nav className="no-print mb-4 flex flex-wrap gap-2" aria-label="班级视图">
        <Link href={`/teacher/classes/${classroom.id}`} className={buttonVariants({ variant: view === "students" ? "primary" : "secondary" })}>学生进度</Link>
        <Link href={`/teacher/classes/${classroom.id}?view=reviews`} className={buttonVariants({ variant: view === "reviews" ? "primary" : "secondary" })}>成果验收 {pending.length}</Link>
        <Link href="/teacher/classes" className={buttonVariants({ variant: "ghost" })}>返回班级管理</Link>
      </nav>
      <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["待验收", `${pending.length}`, "进入成果逐项处理"],
          ["退回待重交", `${returned.length}`, "按学生与挑战追踪"],
          ["能力短板", `${weak.name} ${weak.score}`, "本班六维均分"],
          ["云桌面", state.environment.maintenance ? "维护中" : `${activeDesktops.length} 活跃`, `${reclaimed.length} 条达到回收线`],
        ].map(([label, value, note]) => <div key={label} className="rounded-xl border border-line bg-paper p-4"><p className="text-xs text-ink-muted">{label}</p><p className="numeric mt-1 text-xl font-semibold">{value}</p><p className="mt-1 text-xs text-ink-soft">{note}</p></div>)}
      </section>

      {view === "students" ? (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button className="no-print" variant="secondary" onClick={() => window.print()}>打印 / 导出班级进度</Button>
            <Link href="/teacher" className={buttonVariants({ variant: "ghost" })}>回到教学总览</Link>
          </div>
          <section className="mb-4 rounded-xl border border-line bg-paper p-4">
            <h2 className="text-sm font-medium">已发布挑战</h2>
            <p className="mt-1 text-xs leading-5 text-ink-soft">科来发布的课程包直接用于本班，教师端只读展示，不能改写发布内容。</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {challenges.map((challenge) => (
                <li key={challenge.id} className="rounded-lg border border-line px-3 py-2">
                  <p className="text-sm font-medium">{challenge.title}</p>
                  <p className="mt-1 text-xs text-ink-soft">{challenge.code} · {challenge.required ? "必选" : "课程包内容"}</p>
                </li>
              ))}
            </ul>
          </section>
          <section className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-paper p-4">
            <p className="text-sm leading-6">
              {rosterImported
                ? `已导入 ${classroom.studentIds.length} 人：${classroom.studentIds.map((id) => personById(id)?.name).join("、")}`
                : "名单还在待确认。导入后才作为本班实训对象，平台不接管学籍。"}
            </p>
            <Button disabled={rosterImported} onClick={() => confirmRoster(classroom.id)}>{rosterImported ? "名单已导入" : "确认导入名单"}</Button>
          </section>
          <section className="no-print mb-4 rounded-xl border border-line bg-paper p-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <label className="text-sm"><span className="mb-1 block text-xs text-ink-soft">搜索学生</span><input className="field-control w-64 max-w-full" type="search" value={query} placeholder="输入学生姓名" onChange={(event) => setQuery(event.target.value)} /></label>
              <Button variant="secondary" disabled={extendable.length === 0} onClick={extendAll}>批量延时 15 分钟（{extendable.length}）</Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2" aria-label="学生状态筛选">
              {STUDENT_FILTERS.map((option) => <Button key={option.value} size="sm" variant={studentFilter === option.value ? "primary" : "secondary"} aria-pressed={studentFilter === option.value} onClick={() => setStudentFilter(option.value)}>{option.label} {filterCounts[option.value]}</Button>)}
            </div>
            <p className="mt-3 text-xs text-ink-muted" aria-live="polite">当前显示 {filteredRows.length} / {classroom.studentIds.length} 名学生</p>
            {notice ? <p className="notice-info mt-3" role="status">{notice}</p> : null}
          </section>
          <div className="print-sheet overflow-x-auto rounded-xl border border-line bg-paper">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="border-b border-line text-xs text-ink-soft"><tr><th className="px-4 py-3 font-medium">学生</th><th className="px-4 py-3 font-medium">通过</th><th className="px-4 py-3 font-medium">机时</th>{challenges.map((challenge) => <th key={challenge.id} className="px-4 py-3 font-medium">{challenge.code}</th>)}<th className="no-print px-4 py-3 font-medium">管理操作</th></tr></thead>
              <tbody>
                {filteredRows.map((row) => {
                  const prioritySubmission = row.extendable ?? row.submitted ?? row.returned;
                  return (
                    <tr key={row.studentId} className="border-b border-line last:border-0">
                      <td className="px-4 py-3">{row.name}</td><td className="px-4 py-3">{row.summary.passed}/{row.summary.total}</td><td className="px-4 py-3">{formatMinutes(row.summary.minutes)}</td>
                      {challenges.map((challenge) => {
                        const submission = submissionOf(state, row.studentId, challenge.id);
                        return <td key={challenge.id} className="px-4 py-3">{isModuleHeld(state, row.studentId, challenge.id) ? <span className="text-xs text-warning-deep">未解锁</span> : submission ? <Link href={`/teacher/reviews/${submission.id}`}><StatusBadge status={submission.status} /></Link> : "—"}</td>;
                      })}
                      <td className="no-print px-4 py-3">
                        {row.extendable && prioritySubmission ? <Button size="sm" variant="secondary" onClick={() => extendOne(prioritySubmission.id, row.name)}>延时 15 分钟</Button>
                          : row.submitted && prioritySubmission ? <Link href={`/teacher/reviews/${prioritySubmission.id}`} className={buttonVariants({ size: "sm" })}>立即验收</Link>
                            : row.returned && prioritySubmission ? <Link href={`/teacher/reviews/${prioritySubmission.id}`} className={buttonVariants({ variant: "secondary", size: "sm" })}>查看退回项</Link>
                              : row.reclaimed ? <span className="text-xs text-ink-muted">延时已达上限</span> : <span className="text-xs text-ink-muted">暂无待处理项</span>}
                      </td>
                    </tr>
                  );
                })}
                {filteredRows.length === 0 ? <tr><td className="px-4 py-8 text-center text-sm text-ink-muted" colSpan={challenges.length + 4}>没有符合当前条件的学生。</td></tr> : null}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <section className="no-print mb-4 flex flex-wrap gap-2" aria-label="成果状态筛选">
            {REVIEW_FILTERS.map((option) => <Button key={option.value} size="sm" variant={reviewFilter === option.value ? "primary" : "secondary"} aria-pressed={reviewFilter === option.value} onClick={() => setReviewFilter(option.value)}>{option.label}</Button>)}
          </section>
          {reviewRows.length === 0 ? <EmptyState title="这里暂时是空的" body="换一个状态看看，或等待本班学生提交成果。" /> : (
            <ul className="space-y-3">
              {reviewRows.map((item) => (
                <li key={item.id}>
                  <Link className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-paper p-4 hover:border-tide" href={`/teacher/reviews/${item.id}`}>
                    <span><span className="block text-sm font-medium">{personById(item.studentId)?.name} · {challengeForState(state, item.challengeId)?.title}</span><span className="mt-1 block text-xs text-ink-soft">{item.updatedAt}</span></span>
                    <StatusBadge status={item.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}
