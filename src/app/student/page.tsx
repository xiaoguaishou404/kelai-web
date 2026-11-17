"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import StudentPortrait from "@/components/student-portrait";
import { MetricCard } from "@/components/metric-card";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";
import { ABILITIES, CLASSROOM, DEMO_STUDENT_ID, PEOPLE } from "@/lib/mock-data";
import { abilityScores, challengeForState, classAbilityScores, desktopClock, modulePace, practiceBlockers, ranking, studentSummary } from "@/lib/metrics";
import { formatMinutes } from "@/lib/utils";

function ProfileOverview() {
  const { state } = useDemo();
  const student = PEOPLE.find((item) => item.id === DEMO_STUDENT_ID);
  const summary = studentSummary(state, DEMO_STUDENT_ID);
  const scores = abilityScores(state, DEMO_STUDENT_ID);
  const classScores = classAbilityScores(state);
  const pace = modulePace(state, DEMO_STUDENT_ID);
  const locateStep = pace.steps.find((step) => step.challenge.required && step.challenge.abilities.includes("locate"));
  const reportStep = pace.steps.find((step) => step.challenge.required && step.challenge.abilities.includes("report"));
  const current = locateStep?.submission;
  const challenge = locateStep?.challenge;
  const report = reportStep?.submission;
  const reportChallenge = reportStep?.challenge;
  const board = ranking(state);
  const place = board.findIndex((item) => item.studentId === DEMO_STUDENT_ID) + 1;
  const ahead = place > 1 ? board[place - 2] : null;
  const self = board[place - 1];
  const behind = place < board.length ? board[place] : null;
  const clock = desktopClock(state.environment.timeoutMinutes, current);
  const updateOpen = state.publishedChallengeIds.includes("c7");
  const update = challengeForState(state, "c7");
  const locatePassed = current?.status === "passed";
  const blockers = challenge && current ? practiceBlockers(challenge, current, locatePassed) : [];
  const stagesDone = blockers.length === 0 && Boolean(current && current.status !== "not_started");
  const reportReady = Boolean(
    report && reportChallenge && report.status === "in_progress" && reportChallenge.stages.every((stage) => report.completedStageIds.includes(stage.id)),
  );
  const requiredDone = current?.status === "passed" && report?.status === "passed";
  const locatePath = challenge ? `/student/challenges/${challenge.id}` : "/student/challenges";
  const nextAction = requiredDone
    ? { href: "/student/report", label: "查看完成证明" }
    : report?.status === "submitted"
      ? { href: reportChallenge ? `/student/challenges/${reportChallenge.id}` : "/student/challenges", label: "复盘待教师验收" }
      : reportReady
        ? { href: reportChallenge ? `/student/challenges/${reportChallenge.id}/submit` : "/student/challenges", label: "提交复盘成果" }
        : locatePassed
          ? { href: reportChallenge ? `/student/challenges/${reportChallenge.id}` : "/student/challenges", label: "开始 PoC 复盘" }
          : current?.status === "submitted"
            ? { href: locatePath, label: "定位待教师验收" }
            : stagesDone
              ? { href: `${locatePath}/submit`, label: "提交定位成果" }
              : { href: `${locatePath}/desktop`, label: "继续故障定位" };
  const feed = [...pace.steps]
    .filter((step) => step.submission && step.submission.status !== "not_started")
    .sort((a, b) => (b.submission?.updatedAt ?? "").localeCompare(a.submission?.updatedAt ?? ""));
  const teachingDay = feed[0]?.submission?.updatedAt.slice(0, 10) ?? "2026-03-25";
  const todaySessions = pace.steps.flatMap((step) =>
    (step.submission?.desktopSessions ?? [])
      .filter((session) => session.endedAt.startsWith(teachingDay))
      .map((session) => ({ ...session, title: step.challenge.title })),
  );
  const todos = pace.steps.flatMap((step) => {
    const status = step.submission?.status;
    if (step.held) return [{ href: locatePath, title: step.challenge.title, detail: "未解锁" }];
    if (status === "returned") return [{ href: `/student/challenges/${step.challenge.id}/desktop`, title: step.challenge.title, detail: step.submission?.review?.comment ?? "退回" }];
    if (status === "submitted") return [{ href: `/student/challenges/${step.challenge.id}`, title: step.challenge.title, detail: step.submission?.updatedAt ?? "" }];
    if (status === "in_progress" && step.submission) {
      const gaps = practiceBlockers(step.challenge, step.submission, locatePassed);
      return [{ href: `/student/challenges/${step.challenge.id}/desktop`, title: step.challenge.title, detail: gaps[0] ?? "可以提交" }];
    }
    return [];
  });

  return (
    <>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-semibold leading-none tracking-tight">{student?.name}</h1>
          <p className="mt-2 text-sm text-ink-muted">{CLASSROOM.name} · 第 {place} / {board.length}</p>
        </div>
        <Link href={nextAction.href} className={buttonVariants()}>{nextAction.label}</Link>
      </header>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="已通过" value={`${summary.passed}/${summary.total}`} />
        <MetricCard label="待验收" value={String(summary.pending)} />
        <MetricCard label="机时" value={formatMinutes(summary.minutes)} />
        <MetricCard label="综合分" value={String(summary.average)} />
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-xl border border-line bg-paper p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-lg font-medium">{challenge?.title}</h2>
            {current ? <StatusBadge status={current.status} /> : null}
          </div>
          <div className="mt-5 flex items-end justify-between gap-3 text-sm">
            <span className="numeric text-ink">{clock.used}<span className="text-ink-muted"> / {clock.limit} 分钟</span></span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-canvas">
            <div className={`h-full ${clock.reclaimed ? "bg-warning" : "bg-tide"}`} style={{ width: `${Math.min(100, Math.round((clock.used / Math.max(1, clock.limit)) * 100))}%` }} />
          </div>
          <ol className="mt-5 divide-y divide-line-soft">
            {challenge?.stages.map((stage, index) => {
              const done = current?.completedStageIds.includes(stage.id);
              return (
                <li key={stage.id} className="flex items-center gap-3 py-2 text-sm">
                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] ${done ? "bg-tide text-white" : "bg-canvas text-ink-muted"}`}>{index + 1}</span>
                  <span className={done ? "text-ink" : "text-ink-soft"}>{stage.title}</span>
                </li>
              );
            })}
          </ol>
          <Link href={`${locatePath}/desktop`} className={`${buttonVariants({ variant: "secondary" })} mt-4`}>打开云桌面</Link>
          {updateOpen && update ? <Link className="mt-4 block text-sm text-ink-muted hover:text-ink" href="/student/challenges/c7">选做 · {update.title}</Link> : null}
        </article>
        <div className="grid gap-4">
          <article className="rounded-xl border border-line bg-paper p-5">
            <h2 className="text-sm font-medium">待办</h2>
            <ul className="mt-3 divide-y divide-line-soft">
              {todos.map((item) => (
                <li key={item.title}>
                  <Link href={item.href} className="block py-2.5">
                    <p className="text-sm">{item.title}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">{item.detail}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-xl border border-line bg-paper p-5">
            <h2 className="text-sm font-medium">今日</h2>
            {todaySessions.length === 0 ? <p className="mt-3 text-sm text-ink-muted">没有会话</p> : (
              <ul className="mt-3 space-y-2">
                {todaySessions.map((session) => (
                  <li key={session.endedAt} className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate">{session.title}</span>
                    <span className="numeric shrink-0 text-xs text-ink-muted">{session.minutes} 分钟</span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-line bg-paper p-5">
          <h2 className="text-sm font-medium">任务</h2>
          <ol className="mt-3 divide-y divide-line-soft">
            {pace.steps.map((step) => {
              const status = step.submission?.status ?? "not_started";
              return (
                <li key={step.challenge.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={`/student/challenges/${step.challenge.id}`} className="min-w-0 truncate text-sm hover:text-tide">{step.challenge.title}</Link>
                  {step.held ? <span className="shrink-0 text-xs text-ink-muted">未解锁</span> : <StatusBadge status={status} />}
                </li>
              );
            })}
          </ol>
        </article>
        <article className="rounded-xl border border-line bg-paper p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium">能力</h2>
            <Link href="/student?view=portrait" className="text-xs text-ink-muted hover:text-ink">画像</Link>
          </div>
          <ul className="mt-4 space-y-3">
            {ABILITIES.map((ability) => {
              const score = scores[ability.key];
              return (
                <li key={ability.key}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-ink-soft">{ability.name}</span>
                    <span className="numeric text-xs">{score}<span className="text-ink-muted"> / {classScores[ability.key]}</span></span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-canvas">
                    <div className="h-full bg-ink" style={{ width: `${score}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
          <ul className="mt-5 divide-y divide-line-soft border-t border-line-soft">
            {[ahead, self, behind].filter((item): item is NonNullable<typeof self> => Boolean(item)).map((item) => (
              <li key={item.studentId} className="flex items-center justify-between py-2 text-sm">
                <span className={item.studentId === DEMO_STUDENT_ID ? "font-medium" : "text-ink-soft"}>{item.studentId === DEMO_STUDENT_ID ? "我" : item.name}</span>
                <span className="numeric text-xs text-ink-muted">{item.score}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </>
  );
}


export default function PersonalCenterPage() {
  const portrait = useSearchParams().get("view") === "portrait";
  return <>
    <nav aria-label="个人中心" className="no-print mb-6 inline-flex rounded-lg border border-line bg-white p-1">
      <Link href="/student" aria-current={!portrait ? "page" : undefined} className={`rounded-md px-3 py-1.5 text-sm ${portrait ? "text-ink-muted" : "bg-[#eef0f3] font-medium text-ink"}`}>概览</Link>
      <Link href="/student?view=portrait" aria-current={portrait ? "page" : undefined} className={`rounded-md px-3 py-1.5 text-sm ${portrait ? "bg-[#eef0f3] font-medium text-ink" : "text-ink-muted"}`}>能力画像</Link>
    </nav>
    {portrait ? <StudentPortrait /> : <ProfileOverview />}
  </>;
}
