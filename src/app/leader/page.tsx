"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AbilityRadar } from "@/components/ability-radar";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";
import { CLASSROOM, CLASSROOMS, PEOPLE, SCHOOL, TENANTS } from "@/lib/mock-data";
import { challengeRate, classAbilityScores, classEvidenceSummary, liveMinutes, pendingReviews, returnedSubmissions, sessionLimit, usedMinutes, visibleChallenges, weakAbilities } from "@/lib/metrics";
import { formatMinutes } from "@/lib/utils";

export default function LeaderHomePage() {
  const { state } = useDemo();
  const leader = PEOPLE.find((item) => item.role === "leader");
  const studentIds = CLASSROOMS.flatMap((item) => item.studentIds);
  const schoolClassroom = { ...CLASSROOM, name: "全院实训班级", studentIds };
  const scores = classAbilityScores(state, schoolClassroom);
  const weak = weakAbilities(state, schoolClassroom);
  const weakest = weak[0];
  const evidence = classEvidenceSummary(state, schoolClassroom);
  const reviewed = state.submissions.filter((item) => studentIds.includes(item.studentId) && item.review);
  const returnRate = reviewed.length ? Math.round((reviewed.filter((item) => item.review?.decision === "returned").length / reviewed.length) * 100) : 0;
  const abilityAverage = Math.round(Object.values(scores).reduce((sum, value) => sum + value, 0) / Object.values(scores).length);
  const quotaRatio = Math.round((usedMinutes(state) / (state.tenantQuotaHours * 60)) * 100);
  const timeout = state.environment.timeoutMinutes ?? 40;
  const reclaimed = state.submissions.filter(
    (item) =>
      studentIds.includes(item.studentId) &&
      (item.status === "in_progress" || item.status === "returned") &&
      item.desktopMinutes >= sessionLimit(timeout, item.grantedMinutes),
  ).length;
  const granted = state.submissions.filter((item) => studentIds.includes(item.studentId) && (item.grantedMinutes ?? 0) > 0).length;
  const seats = (TENANTS.find((item) => item.primary)?.concurrent ?? 0) + (state.seatsConfirmed ? state.seatRequest : 0);
  const chart = visibleChallenges(state).map((challenge) => ({
    name: challenge.code,
    rate: Math.round(challengeRate(state, challenge.id, schoolClassroom).rate * 100),
  }));

  return (
    <>
      <div className="no-print">
        <PageHeader
        title="院校总览"
          action={<Link className={buttonVariants()} href="#acceptance-report">查看验收摘要</Link>}
        />
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Link href="/leader/classes"><MetricCard label="开课班级 / 覆盖" value={`${CLASSROOMS.length} / ${studentIds.length} 人`} hint="全院当前实训班级" /></Link>
        <Link href="/leader/classes"><MetricCard label="挑战达成" value={`${evidence.requiredPassed}/${studentIds.length}`} hint="必选核心全部通过人数" /></Link>
        <Link href="/leader/classes"><MetricCard label="能力均分" value={String(abilityAverage)} hint={`最弱维度 ${weakest.name} ${weakest.score}`} /></Link>
        <Link href="/leader/classes"><MetricCard label="待验收 / 退回率" value={`${pendingReviews(state, schoolClassroom).length} / ${returnRate}%`} hint="随教师验收即时变化" /></Link>
        <Link href="/leader/usage"><MetricCard label="云桌面机时 / 额度" value={formatMinutes(liveMinutes(state, schoolClassroom))} hint={`租户额度利用 ${quotaRatio}%`} /></Link>
        <Link href="/leader/usage"><MetricCard label="环境异常" value={state.environment.maintenance || state.environment.health !== "healthy" ? "1" : "0"} hint={state.environment.maintenance ? "当前维护中" : `${returnedSubmissions(state, schoolClassroom).length} 项学习退回，环境健康`} /></Link>
        </section>
        <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-line bg-paper p-5 shadow-card">
          <h2 className="section-title">六维均分</h2>
          <AbilityRadar scores={scores} />
        </article>
        <article className="rounded-xl border border-line bg-paper p-5 shadow-card">
          <h2 className="section-title">挑战通过率</h2>
          <div className="mt-4 h-72">
            {chart.length === 0 ? <p className="text-sm text-ink-soft">本班还没有已发布挑战。</p> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart}>
                  <CartesianGrid vertical={false} stroke="#EEF0F6" strokeDasharray="4 4" />
                  <XAxis dataKey="name" axisLine={{ stroke: "#E3E9F3" }} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
                  <Tooltip contentStyle={{ border: "1px solid #E8EDF5", borderRadius: 8, boxShadow: "0 8px 24px rgba(15,23,42,.07)" }} />
                  <Bar dataKey="rate" fill="#3361E8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>
        </section>
        <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <article className="surface-card p-5">
          <h2 className="section-title">实训质量卡点</h2>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-canvas p-3"><b className="numeric block text-xl">{evidence.evidenceRate}%</b><span className="mt-1 block text-[11px] text-ink-muted">已开始成果含证据</span></div>
            <div className="rounded-lg bg-canvas p-3"><b className="numeric block text-xl">{evidence.requiredPassed}/{studentIds.length}</b><span className="mt-1 block text-[11px] text-ink-muted">必选核心达成</span></div>
            <div className="rounded-lg bg-canvas p-3"><b className="numeric block text-xl">{evidence.returnedForEvidence}</b><span className="mt-1 block text-[11px] text-ink-muted">证据/边界退回</span></div>
          </div>
          <p className="mt-3 text-xs leading-5 text-ink-soft">达成率由提交与教师验收联动计算；“含证据”只表示收录过证据点，不等于结论已通过。</p>
        </article>
        </section>
      </div>
      <section id="acceptance-report" className="print-sheet mt-8 scroll-mt-20 rounded-xl border border-line bg-white p-6 shadow-card">
        <div className="report-brand"><BrandLogo/><span>COLASOFT · 岗位实训与能力成长</span></div>
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line-soft pb-4">
          <div>
            <p className="text-xs tracking-[0.14em] text-tide">{SCHOOL.name} · {SCHOOL.college}</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink">项目运行与验收摘要</h2>
            <p className="mt-2 text-sm text-ink-soft">2026 春季 · {CLASSROOMS.length} 个实训班 · {studentIds.length} 名学员</p>
          </div>
          <Button className="no-print" onClick={() => window.print()}>打印 / 导出</Button>
        </div>
        <div className="mt-5 grid gap-4 text-sm leading-6 md:grid-cols-2">
          <article className="rounded-lg bg-canvas p-4">
            <h3 className="font-medium text-ink">项目范围</h3>
            <p className="mt-2 text-ink-soft">覆盖环境部署、需求转译、链路分析、故障定位、告警取舍与 PoC 汇报，面向 {SCHOOL.college} 当前实训班级。</p>
          </article>
          <article className="rounded-lg bg-canvas p-4">
            <h3 className="font-medium text-ink">成果摘要</h3>
            <p className="mt-2 text-ink-soft">必选核心达成 {evidence.requiredPassed}/{studentIds.length} 人；已开始成果含证据 {evidence.evidenceRate}%；待验收 {pendingReviews(state, schoolClassroom).length} 项，退回待重交 {returnedSubmissions(state, schoolClassroom).length} 项。</p>
          </article>
          <article className="rounded-lg bg-canvas p-4">
            <h3 className="font-medium text-ink">资源与环境</h3>
            <p className="mt-2 text-ink-soft">云桌面使用 {formatMinutes(liveMinutes(state, schoolClassroom))}，租户额度利用 {quotaRatio}%；并发 {seats} 席；{reclaimed} 条实操达到 {timeout} 分钟回收线，{granted} 条已获延时；环境{state.environment.maintenance ? "维护中" : "健康可用"}。</p>
          </article>
          <article className="rounded-lg bg-canvas p-4">
            <h3 className="font-medium text-ink">边界与建议</h3>
            <p className="mt-2 text-ink-soft">当前短板为{weak.slice(0, 2).map((item) => item.name).join("、")}。建议优先追问证据来源和不可见边界；平台不提供镜像下载，学生个人记录留校，本摘要不用于招聘筛选。</p>
          </article>
        </div>
        <div className="mt-4 border-t border-line pt-4 text-xs text-ink-muted">
          <p>更新包{state.updatePackConfirmed ? "已确认" : "未确认"} · 本地案例{state.localCaseAccepted ? "已确认" : "未进入"}</p>
        </div>
      </section>
    </>
  );
}
