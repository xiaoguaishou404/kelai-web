"use client";

import Link from "next/link";
import { ArrowRight, Award } from "lucide-react";
import { AbilityRadar } from "@/components/ability-radar";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { CAREER_MARKET_ITEMS } from "@/lib/career-market-data";
import { useDemo } from "@/lib/demo-store";
import { ABILITIES, DEMO_STUDENT_ID, PEOPLE } from "@/lib/mock-data";
import {
  abilityScores,
  classAbilityScores,
  isModuleHeld,
  jobFit,
  medals,
  ranking,
  studentSummary,
  submissionOf,
  visibleChallenges,
} from "@/lib/metrics";
import { cn, formatMinutes } from "@/lib/utils";

export default function PortraitPage() {
  const { state } = useDemo();
  const student = PEOPLE.find((item) => item.id === DEMO_STUDENT_ID);
  const scores = abilityScores(state, DEMO_STUDENT_ID);
  const classScores = classAbilityScores(state);
  const summary = studentSummary(state, DEMO_STUDENT_ID);
  const jobs = jobFit(state, DEMO_STUDENT_ID);
  const board = ranking(state);
  const place = board.findIndex((item) => item.studentId === DEMO_STUDENT_ID) + 1;
  const bestJob = jobs[0];
  const visible = visibleChallenges(state);
  const rows = visible.map((challenge) => ({
    challenge,
    submission: submissionOf(state, DEMO_STUDENT_ID, challenge.id),
  }));
  const timeline = rows
    .filter((item) => item.submission && item.submission.status !== "not_started")
    .sort((a, b) => (a.submission?.updatedAt ?? "").localeCompare(b.submission?.updatedAt ?? ""))
    .slice(-5);
  const evidenceRows = rows
    .filter((item) => item.submission?.status === "passed" && item.submission.review)
    .slice(0, 3);
  const recommendations = rows
    .filter((item) => item.submission && item.submission.status !== "passed" && item.submission.status !== "submitted" && !isModuleHeld(state, DEMO_STUDENT_ID, item.challenge.id))
    .sort((a, b) => {
      const order = { returned: 0, in_progress: 1, not_started: 2, submitted: 3, passed: 4 };
      return order[a.submission!.status] - order[b.submission!.status];
    })
    .slice(0, 2);
  const topCareers = jobs.slice(0, 3).map((job) => ({
    job,
    market: CAREER_MARKET_ITEMS.find((item) => item.careerId === job.id),
  })).filter((item) => item.market);
  const weakest = ABILITIES.reduce((current, ability) => scores[ability.key] < scores[current.key] ? ability : current);
  const earnedMedals = medals(state, DEMO_STUDENT_ID);

  return (
    <>
      <PageHeader
        title="能力画像"
        meta={`${student?.name} · ${summary.average}`}
        action={<Link className={buttonVariants({ variant: "secondary" })} href="/student/report">报告</Link>}
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-line bg-paper px-4 py-4"><p className="text-xs text-ink-muted">最接近</p><p className="mt-2 text-sm font-medium">{bestJob.title}</p><p className="numeric mt-1 text-lg">{bestJob.fit}</p></article>
        <article className="rounded-xl border border-line bg-paper px-4 py-4"><p className="text-xs text-ink-muted">排名</p><p className="numeric mt-2 text-[26px] font-semibold leading-none">{place}<span className="text-base text-ink-muted">/{board.length}</span></p></article>
        <article className="rounded-xl border border-line bg-paper px-4 py-4"><p className="text-xs text-ink-muted">已通过</p><p className="numeric mt-2 text-[26px] font-semibold leading-none">{summary.passed}<span className="text-base text-ink-muted">/{summary.total}</span></p></article>
        <article className="rounded-xl border border-line bg-paper px-4 py-4"><p className="text-xs text-ink-muted">机时</p><p className="numeric mt-2 text-[26px] font-semibold leading-none">{formatMinutes(summary.minutes)}</p></article>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="surface-card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="section-title">六维</h2>
            <span className="text-xs text-ink-muted">{weakest.name} {scores[weakest.key]}</span>
          </div>
          <div className="mt-2 grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="rounded-xl bg-gradient-to-b from-canvas to-white p-2">
              <AbilityRadar scores={scores} benchmark={classScores} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {ABILITIES.map((ability) => {
                const score = scores[ability.key];
                return (
                  <div key={ability.key} className="rounded-lg border border-line-soft p-3">
                    <div><p className="text-xs text-ink-soft">{ability.name}</p><p className="numeric mt-1 text-xl font-semibold">{score}</p></div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-canvas"><div className="h-full rounded-full bg-tide" style={{ width: `${score}%` }} /></div>
                    <p className="mt-2 text-[11px] text-ink-muted">班 {classScores[ability.key]}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </article>

        <article className="surface-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="section-title">岗位</h2>
            <Link href="/student/careers" className="text-xs text-tide">查看岗位地图</Link>
          </div>
          <div className="mt-4 space-y-3">
            {topCareers.map(({ job, market }, index) => {
              const gapKey = job.abilities.reduce((lowest, key) => scores[key] < scores[lowest] ? key : lowest);
              const gap = ABILITIES.find((ability) => ability.key === gapKey);
              return (
                <Link key={job.id} href={`/student/careers/${market!.id}`} className="group block rounded-xl border border-line p-4 hover:border-tide-border hover:bg-tide-mist/30">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="text-xs text-tide">0{index + 1} · {market!.company}</p><h3 className="mt-1 font-medium">{market!.title}</h3></div>
                    <span className="numeric text-2xl text-tide">{job.fit}</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-canvas"><div className="h-full rounded-full bg-gradient-to-r from-tide to-tide-light" style={{ width: `${job.fit}%` }} /></div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-ink-soft">
                    <span>{gap?.name} {scores[gapKey]}</span>
                    <ArrowRight size={14} className="text-ink-muted" />
                  </div>
                </Link>
              );
            })}
          </div>
        </article>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="surface-card p-5 sm:p-6">
          <h2 className="section-title">轨迹</h2>
          <ol className="relative mt-5 space-y-4 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-line">
            {timeline.map(({ challenge, submission }) => (
              <li key={challenge.id} className="relative flex gap-3 pl-0">
                <span className={cn("relative z-10 mt-1 h-[15px] w-[15px] shrink-0 rounded-full border-2 border-white", submission?.status === "passed" ? "bg-success" : "bg-tide")} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link href={`/student/challenges/${challenge.id}`} className="text-sm font-medium hover:text-tide">{challenge.title}</Link>
                    {submission ? <StatusBadge status={submission.status} /> : null}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-ink-soft">{submission?.updatedAt} · 实操 {submission?.desktopMinutes} 分钟{submission?.review ? ` · 验收 ${submission.review.score} 分` : ""}</p>
                </div>
              </li>
            ))}
          </ol>
        </article>

        <article className="surface-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="section-title">验收</h2>
            <div className="flex flex-wrap gap-1.5">
              {earnedMedals.map((medal) => <span key={medal} className="flex items-center gap-1 rounded-full bg-tide-mist px-2.5 py-1 text-xs text-tide-deep"><Award size={12} />{medal}</span>)}
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {evidenceRows.map(({ challenge, submission }) => {
              const evidence = challenge.evidence.filter((item) => submission?.evidenceIds.includes(item.id));
              return (
                <div key={challenge.id} className="rounded-xl border border-line p-4">
                  <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-medium">{challenge.title}</h3><span className="numeric text-tide">{submission?.review?.score}</span></div>
                  <div className="mt-2 flex flex-wrap gap-1.5">{submission?.review?.tags.map((tag) => <span key={tag} className="rounded bg-canvas px-2 py-1 text-[10px] text-ink-soft">{tag}</span>)}</div>
                  <p className="mt-3 text-xs leading-5 text-ink-soft">答辩：{submission?.review?.defenseNote}</p>
                  {evidence.length > 0 ? <p className="mt-2 text-xs leading-5 text-tide-deep">关键证据：{evidence.map((item) => item.title).join("、")}</p> : null}
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="mt-5 rounded-xl border border-tide-border bg-gradient-to-r from-white to-tide-mist p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-medium">接着做</h2>
          <Link href="/student/challenges" className="text-xs text-ink-muted hover:text-ink">全部任务</Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {recommendations.map(({ challenge }) => (
              <Link key={challenge.id} href={`/student/challenges/${challenge.id}`} className="flex items-center justify-between gap-4 rounded-xl border border-line bg-white p-4 hover:border-tide-border">
                <div>
                  <h3 className="font-medium">{challenge.title}</h3>
                  <p className="mt-1 text-xs text-ink-muted">{challenge.abilities.map((key) => ABILITIES.find((item) => item.key === key)?.name).join("、")}</p>
                </div>
                <ArrowRight className="shrink-0 text-ink-muted" size={16} />
              </Link>
          ))}
        </div>
      </section>

    </>
  );
}
