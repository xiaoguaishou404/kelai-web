"use client";

import { PageHeader } from "@/components/page-header";
import { useDemo } from "@/lib/demo-store";
import { ABILITIES, CLASSROOM } from "@/lib/mock-data";
import { abilityScores, challengeRate, isModuleHeld, personById, ranking, returnedSubmissions, sessionLimit, studentSummary, visibleChallenges, challengeForState } from "@/lib/metrics";

export default function LeaderClassesPage() {
  const { state } = useDemo();
  const challenges = visibleChallenges(state);
  const returned = returnedSubmissions(state);
  const timeout = state.environment.timeoutMinutes ?? 40;
  const board = ranking(state);
  const heldNames = CLASSROOM.studentIds.filter((id) => isModuleHeld(state, id, "c6")).map((id) => personById(id)?.name);
  const reclaimed = state.submissions.filter(
    (item) =>
      (item.status === "in_progress" || item.status === "returned") &&
      item.desktopMinutes >= sessionLimit(timeout, item.grantedMinutes),
  );

  return (
    <>
      <PageHeader title="班级分析" />
      <section className="mb-4 grid gap-3 md:grid-cols-3">
        {[
          { name: CLASSROOM.name, students: CLASSROOM.studentIds.length, ability: Math.round(board.reduce((sum, item) => sum + item.score, 0) / board.length), pass: Math.round(challenges.reduce((sum, item) => sum + challengeRate(state, item.id).rate, 0) / Math.max(1, challenges.length) * 100), sla: "18 小时", live: true },
          { name: "2024 级网络分析 2 班", students: 32, ability: 68, pass: 63, sla: "26 小时", live: false },
          { name: "2023 级安全运维 1 班", students: 28, ability: 74, pass: 71, sla: "15 小时", live: false },
        ].map((item, index) => (
          <article key={item.name} className={`rounded-xl border p-4 ${item.live ? "border-tide-border bg-tide-mist/40" : "border-line bg-paper"}`}>
            <h2 className="mt-1 font-medium">{item.name}</h2>
            <p className="mt-3 text-sm text-ink-soft">{item.students} 人 · 能力均分 {item.ability} · 挑战通过 {item.pass}%</p>
            <p className="mt-1 text-xs text-ink-muted">教师验收时效 {item.sla} · 排名 {index + 1}/3</p>
          </article>
        ))}
      </section>
      <p className="mb-4 rounded-xl border border-line bg-paper px-4 py-3 text-sm leading-6">
        汇报未解锁 {heldNames.length} 人：{heldNames.join("、") || "没有"}。故障定位通过后才会进入 PoC 复盘。
      </p>
      <section className="overflow-x-auto rounded-xl border border-line bg-paper">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-line-soft bg-[#F8FAFC] text-xs text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">排名</th>
              <th className="px-4 py-3 font-medium">学生</th>
              <th className="px-4 py-3 font-medium">通过</th>
              {ABILITIES.map((ability) => <th key={ability.key} className="px-4 py-3 font-medium">{ability.name === "装机与环境部署" ? "环境部署" : ability.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {CLASSROOM.studentIds.map((studentId) => {
              const scores = abilityScores(state, studentId);
              const summary = studentSummary(state, studentId);
              return (
                <tr key={studentId} className="border-b border-line-soft last:border-0">
                  <td className="numeric px-4 py-3">{board.findIndex((item) => item.studentId === studentId) + 1}</td>
                  <td className="px-4 py-3">{personById(studentId)?.name}</td>
                  <td className="numeric px-4 py-3">{summary.passed}/{summary.total}</td>
                  {ABILITIES.map((ability) => <td key={ability.key} className="numeric px-4 py-3">{scores[ability.key]}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
      <section className="mt-4 grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-line bg-paper p-5">
          <h2 className="section-title">挑战达成</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {challenges.map((challenge) => {
              const rate = challengeRate(state, challenge.id);
              return <li key={challenge.id} className="flex justify-between gap-3"><span>{challenge.title}</span><span>{rate.passed}/{rate.total}</span></li>;
            })}
          </ul>
        </article>
        <article className="rounded-xl border border-line bg-paper p-5">
          <h2 className="section-title">退回卡点</h2>
          {returned.length === 0 ? <p className="mt-3 text-sm text-ink-soft">当前没有被退回的成果。</p> : (
            <ul className="mt-3 space-y-3 text-sm leading-6">
              {returned.map((item) => (
                <li key={item.id}>
                  {personById(item.studentId)?.name} · {challengeForState(state, item.challengeId)?.title}
                  <span className="mt-1 block text-ink-soft">{item.review?.comment}</span>
                </li>
              ))}
            </ul>
          )}
        </article>
        <article className="rounded-xl border border-line bg-paper p-5">
          <h2 className="section-title">桌面回收</h2>
          {reclaimed.length === 0 ? <p className="mt-3 text-sm text-ink-soft">当前没有进行中的云桌面达到回收线。</p> : (
            <ul className="mt-3 space-y-3 text-sm leading-6">
              {reclaimed.map((item) => (
                <li key={item.id}>
                  {personById(item.studentId)?.name} · {challengeForState(state, item.challengeId)?.title}
                  <span className="mt-1 block text-ink-soft">{item.desktopMinutes}/{sessionLimit(timeout, item.grantedMinutes)} 分钟</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
      <section className="mt-4 grid gap-4 md:grid-cols-3">
        <article className="surface-card p-5"><h2 className="section-title">学生分层</h2><p className="mt-3 text-sm leading-6">领先层 {board.filter((item) => item.score >= 70).length} 人 · 稳定层 {board.filter((item) => item.score >= 40 && item.score < 70).length} 人 · 需支持 {board.filter((item) => item.score < 40).length} 人</p></article>
        <article className="surface-card p-5"><h2 className="section-title">主要退回原因</h2><p className="mt-3 text-sm leading-6">证据不足 {returned.filter((item) => item.review?.tags.includes("未说明依据")).length} · 边界不清 {returned.filter((item) => item.review?.tags.includes("建议补充盲区")).length} · 结论含糊 {returned.filter((item) => item.review?.tags.includes("结论含糊")).length}</p></article>
        <article className="surface-card p-5"><h2 className="section-title">管理建议</h2><p className="mt-3 text-sm leading-6">优先补强证据与可见边界表达；对超过 24 小时的待验收建立提醒。验收时效为演示口径。</p></article>
      </section>
    </>
  );
}
