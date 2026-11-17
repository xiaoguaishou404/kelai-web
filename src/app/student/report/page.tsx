"use client";

import { StudentIllustration } from "@/components/student-illustration";

import { BrandLogo } from "@/components/brand-logo";

import { useState } from "react";
import { AbilityRadar } from "@/components/ability-radar";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";
import { ABILITIES, CLASSROOM, DEMO_STUDENT_ID, PEOPLE, SCHOOL } from "@/lib/mock-data";
import { STATUS_LABEL, abilityScores, isModuleHeld, jobFit, medals, studentSummary, submissionOf, visibleChallenges } from "@/lib/metrics";
import { formatMinutes } from "@/lib/utils";

export default function StudentReportPage() {
  const { state } = useDemo();
  const [proof, setProof] = useState(false);
  const student = PEOPLE.find((item) => item.id === DEMO_STUDENT_ID);
  const scores = abilityScores(state, DEMO_STUDENT_ID);
  const summary = studentSummary(state, DEMO_STUDENT_ID);
  const best = jobFit(state, DEMO_STUDENT_ID)[0];
  const challenges = visibleChallenges(state);
  const required = challenges.filter((item) => item.required).map((challenge) => ({
    challenge,
    submission: submissionOf(state, DEMO_STUDENT_ID, challenge.id),
  }));
  const ready = required.every((item) => item.submission?.status === "passed");
  const passed = challenges.filter((item) => submissionOf(state, DEMO_STUDENT_ID, item.id)?.status === "passed");
  const defenses = challenges.flatMap((challenge) => {
    const review = submissionOf(state, DEMO_STUDENT_ID, challenge.id)?.review;
    return review ? [{ challenge, review }] : [];
  });

  return (
    <>
      <PageHeader art={<StudentIllustration scene="report" />}
        eyebrow="报告预览"
        title="岗位实践能力画像报告"
        description="浏览器打印即可得到一页样张。正式导出服务不在本次原型范围内。"
        action={<Button className="no-print" onClick={() => window.print()}>打印 / 导出</Button>}
      />
      <section className="no-print mb-4 rounded-xl border border-line bg-paper p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl">学校完成证明</h2>
            <p className="mt-1 text-sm leading-6 text-ink-soft">印上本校名称。必选块没齐时只能出阶段证明，不能当作结业证明。</p>
          </div>
          <Button variant="secondary" aria-pressed={proof} onClick={() => setProof((value) => !value)}>
            {proof ? "收起完成证明" : "印制学校完成证明"}
          </Button>
        </div>
        {proof ? (
          <article className="mt-4 rounded-lg border border-tide bg-white p-5">
            <p className="text-xs tracking-[0.14em] text-tide">{SCHOOL.name} · {SCHOOL.college}</p>
            <h3 className="mt-2 font-display text-3xl">{ready ? "岗位实践完成证明" : "岗位实践阶段证明"}</h3>
            <p className="mt-2 text-sm">学员 {student?.name} · {CLASSROOM.name}</p>
            <p className="mt-3 text-sm leading-6">
              {ready
                ? "必选块已通过，学校可以印制完成证明。证明留在本校，不交给科来筛选。"
                : "必选块未齐，这次只能印制阶段证明，不能当作结业证明。"}
            </p>
            <p className="mt-3 text-sm">已通过 {passed.length} 项：{passed.map((item) => item.title).join("、") || "还没有"}</p>
            <p className="mt-3 text-xs leading-5 text-ink-soft">此证明不构成就业承诺，也不替代 CSNA 等外部证书。</p>
          </article>
        ) : null}
      </section>
      <article className="print-sheet rounded-xl border border-line bg-white p-6 shadow-card">
        <div className="report-brand"><BrandLogo/><span>COLASOFT · 岗位实训与能力成长</span></div>
        <p className="text-xs tracking-[0.14em] text-tide">{SCHOOL.name} · {SCHOOL.college}</p>
        <h2 className="mt-2 font-display text-4xl">{student?.name}</h2>
        <p className="mt-1 text-sm text-ink-soft">{CLASSROOM.name} · {CLASSROOM.termLabel}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-[280px_1fr]">
          <AbilityRadar scores={scores} />
          <div>
            <p className="text-sm leading-7">综合能力 {summary.average} 分，已通过 {summary.passed}/{summary.total} 项学习任务。当前最接近的岗位是{best.title}（{best.level}，契合 {best.fit}）。</p>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {ABILITIES.map((ability) => (
                <li key={ability.key}>{ability.name} {ability.key === "report" && isModuleHeld(state, DEMO_STUDENT_ID, "c6") ? "未解锁" : ability.key === "report" && submissionOf(state, DEMO_STUDENT_ID, "c6")?.status === "not_started" ? "已解锁" : scores[ability.key]}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm">勋章：{medals(state, DEMO_STUDENT_ID).join("、") || "尚未获得"} · 云桌面 {formatMinutes(summary.minutes)}</p>
            <p className="mt-4 text-sm leading-6">{ready ? "必选块已通过，可以拿这份报告对照岗位。" : "必选块还没齐，这份报告不能当作岗位就绪。"}</p>
            <ul className="mt-2 space-y-1 text-sm">
              {required.map(({ challenge, submission }) => (
                <li key={challenge.id}>{challenge.title} · {isModuleHeld(state, DEMO_STUDENT_ID, challenge.id) ? "尚未解锁" : challenge.abilities.includes("report") && submission?.status === "not_started" ? "已解锁" : STATUS_LABEL[submission?.status ?? "not_started"]}</li>
              ))}
            </ul>
            <h3 className="mt-4 text-sm font-medium">云桌面机时足迹</h3>
            <ul className="mt-2 space-y-1 text-sm text-ink-soft">
              {challenges.filter((item) => (submissionOf(state, DEMO_STUDENT_ID, item.id)?.desktopMinutes ?? 0) > 0).map((item) => (
                <li key={item.id}>{item.title} · {formatMinutes(submissionOf(state, DEMO_STUDENT_ID, item.id)?.desktopMinutes ?? 0)}</li>
              ))}
            </ul>
            <h3 className="mt-4 text-sm font-medium">答辩摘录</h3>
            {defenses.length === 0 ? <p className="mt-2 text-sm text-ink-soft">还没有答辩记录。</p> : (
              <ul className="mt-2 space-y-2 text-sm leading-6">
                {defenses.map(({ challenge, review }) => (
                  <li key={challenge.id}>{challenge.title}：{review.defenseNote}</li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-xs leading-5 text-ink-soft">本报告只证明学校实训中的实践表现，不构成就业承诺，也不能替代外部证书。</p>
          </div>
        </div>
      </article>
    </>
  );
}
