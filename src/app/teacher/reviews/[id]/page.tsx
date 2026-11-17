"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";
import { REVIEW_TAGS } from "@/lib/mock-data";
import { challengeForState, classroomOfStudent, isModuleHeld, pendingReviews, personById } from "@/lib/metrics";
import { cn } from "@/lib/utils";

function nowLabel() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export default function ReviewDetailPage() {
  const params = useParams<{ id: string }>();
  const { state, reviewWork } = useDemo();
  const submission = state.submissions.find((item) => item.id === params.id);
  const challenge = submission ? submission.challengeSnapshot ?? challengeForState(state, submission.challengeId) : undefined;
  const classroom = submission ? classroomOfStudent(submission.studentId) : undefined;
  const [score, setScore] = useState(submission?.review?.score ?? 80);
  const [tags, setTags] = useState<string[]>(submission?.review?.tags ?? []);
  const [defenseNote, setDefenseNote] = useState(submission?.review?.defenseNote ?? "");
  const [comment, setComment] = useState(submission?.review?.comment ?? "");
  const [marks, setMarks] = useState<Record<string, "supported" | "weak">>({});
  const [message, setMessage] = useState("");
  const [heardDefense, setHeardDefense] = useState(false);

  useEffect(() => {
    setScore(submission?.review?.score ?? 80);
    setTags(submission?.review?.tags ?? []);
    setDefenseNote(submission?.review?.defenseNote ?? "");
    setComment(submission?.review?.comment ?? "");
    const saved: Record<string, "supported" | "weak"> = {};
    submission?.review?.criteriaMarks?.forEach((item) => {
      saved[item.text] = item.mark;
    });
    setMarks(saved);
  }, [
    submission?.id,
    submission?.review?.score,
    submission?.review?.defenseNote,
    submission?.review?.comment,
    submission?.review?.tags,
    submission?.review?.criteriaMarks,
  ]);

  if (!submission || !challenge || !classroom) return <EmptyState title="找不到这份成果" body="记录可能已随演示数据重置。请从班级管理重新进入。" />;

  const ready = submission.status === "submitted" || submission.status === "passed" || submission.status === "returned";
  const evidence = challenge.evidence.filter((item) => submission.evidenceIds.includes(item.id));
  const judged = challenge.criteria.filter((item) => marks[item]).length;
  const weakCount = challenge.criteria.filter((item) => marks[item] === "weak").length;

  function decide(decision: "passed" | "returned") {
    if (defenseNote.trim().length < 4 || comment.trim().length < 4) {
      setMessage("请写上答辩记录和评语，方便学生知道下一步。");
      return;
    }
    reviewWork(submission!.id, {
      score,
      tags,
      defenseNote: defenseNote.trim(),
      comment: comment.trim(),
      decision,
      reviewedAt: nowLabel(),
      criteriaMarks: challenge!.criteria
        .filter((text) => marks[text])
        .map((text) => ({ text, mark: marks[text] })),
    });
    const unlocksReport = decision === "passed" && challenge!.abilities.includes("locate") && isModuleHeld(state, submission!.studentId, "c6");
    const finishesReport = decision === "passed" && challenge!.abilities.includes("report");
    setMessage(unlocksReport ? "已通过。该生的汇报挑战已解锁。" : finishesReport ? "已通过。复盘通过勋章会回到学生画像。" : decision === "passed" ? "已通过。学生画像和班级均分会立即变化。" : "已退回。学生可以修改后再次提交。");
  }

  return (
    <>
      <PageHeader
        eyebrow="验收详情"
        title={`${personById(submission.studentId)?.name} · ${challenge.title}`}
        description={challenge.teacherGuide}
        action={<StatusBadge status={submission.status} />}
      />
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs text-ink-soft" aria-label="验收上下文">
        <Link className="hover:text-tide" href="/teacher">教学总览</Link><span>/</span>
        <Link className="hover:text-tide" href="/teacher/classes">班级管理</Link><span>/</span>
        <Link className="hover:text-tide" href={`/teacher/classes/${classroom.id}`}>{classroom.name}</Link><span>/</span>
        <Link className="hover:text-tide" href={`/teacher/classes/${classroom.id}?view=reviews`}>成果验收（待办 {pendingReviews(state, classroom).length}）</Link><span>/</span>
        <span>{personById(submission.studentId)?.name}</span>
      </nav>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <article className="rounded-xl border border-line bg-paper p-5">
            <h2 className="text-sm font-medium">子环节基础问答</h2>
            {challenge.stages.some((stage) => stage.drill) ? (
              <>
                <p className="mt-2 text-sm leading-6 text-ink-soft">
                  已核对 {challenge.stages.filter((stage) => stage.drill && submission.completedStageIds.includes(stage.id)).length}/{challenge.stages.filter((stage) => stage.drill).length} 题。问答只防止跳步，不能代替成果和答辩。
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {challenge.stages.filter((stage) => stage.drill).map((stage) => (
                    <li key={stage.id}>
                      {submission.completedStageIds.includes(stage.id) ? "已核对" : "未核对"} · {stage.drill?.ask}
                    </li>
                  ))}
                </ul>
              </>
            ) : <p className="mt-2 text-sm text-ink-soft">这个挑战没有基础问答，只看交付物、证据和口头答辩。</p>}
          </article>
          {challenge.labContext ? (
            <article className="rounded-xl border border-line bg-paper p-5">
              <h2 className="text-sm font-medium">实训证据验收依据</h2>
              <p className="mt-2 text-xs leading-5 text-ink-muted">先核对数据与可见边界，再评价结论；术语出现不等于证据充分。</p>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-lg bg-canvas p-3"><dt className="text-xs text-ink-muted">应出现的协议 / 信号</dt><dd className="mt-1 leading-6">{challenge.labContext.protocols.join("、")}</dd></div>
                <div className="rounded-lg bg-canvas p-3"><dt className="text-xs text-ink-muted">应比较的指标</dt><dd className="mt-1 leading-6">{challenge.labContext.indicators.join("、")}</dd></div>
                <div className="rounded-lg bg-canvas p-3 sm:col-span-2"><dt className="text-xs text-ink-muted">不得越过的证据边界</dt><dd className="mt-1 leading-6">{challenge.labContext.visibility}</dd></div>
              </dl>
            </article>
          ) : null}
          <article className="rounded-xl border border-line bg-paper p-5">
            <h2 className="text-sm font-medium">学生交付物</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{submission.deliverable || "学生还没有填写交付物。"}</p>
            <h2 className="mt-4 text-sm font-medium">为什么</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{submission.explanation || "尚未说明判断过程。"}</p>
            {submission.explanation.includes("答辩：") ? (
              <p className="mt-3 rounded-lg bg-canvas px-3 py-2 text-sm leading-6">要听的答辩：{submission.explanation.split("答辩：").slice(1).join("答辩：")}</p>
            ) : null}
          </article>
          <article className="rounded-xl border border-line bg-paper p-5">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-sm font-medium">完成指标对照学生证据</h2>
              <p className="text-xs text-ink-soft">{challenge.criteria.length} 项指标里已点选 {judged} 项，证据不足 {weakCount} 项</p>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <ol className="space-y-3">
                {challenge.criteria.map((item) => (
                  <li key={item} className="rounded-lg bg-canvas p-3">
                    <p className="text-sm font-medium">{item}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        aria-pressed={marks[item] === "supported"}
                        className={cn("rounded-full px-2 py-1 text-xs", marks[item] === "supported" ? "bg-tide text-white" : "bg-white text-ink-soft")}
                        onClick={() => setMarks((current) => ({ ...current, [item]: "supported" }))}
                      >
                        证据能支撑
                      </button>
                      <button
                        type="button"
                        aria-pressed={marks[item] === "weak"}
                        className={cn("rounded-full px-2 py-1 text-xs", marks[item] === "weak" ? "bg-warning text-white" : "bg-white text-ink-soft")}
                        onClick={() => setMarks((current) => ({ ...current, [item]: "weak" }))}
                      >
                        证据不足
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="rounded-lg border border-line bg-white p-3">
                <h3 className="text-sm font-medium">学生已收录证据</h3>
                {evidence.length === 0 ? <p className="mt-2 text-sm text-ink-soft">云桌面里还没有收录证据，指标暂时无法对照。</p> : (
                  <ul className="mt-2 space-y-2 text-sm leading-6">
                    {evidence.map((item) => <li key={item.id}>{item.time} · {item.title}：{item.detail}</li>)}
                  </ul>
                )}
                <h3 className="mt-4 text-sm font-medium">交付物里怎么写</h3>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{submission.deliverable || "学生还没有填写交付物。"}</p>
              </div>
            </div>
          </article>
          <article className="rounded-xl border border-warning-border bg-[#FDFAF3] p-5">
            <h2 className="text-sm font-medium">专家范本，仅供对照</h2>
            <p className="mt-2 text-sm leading-7 text-ink-soft">{challenge.expertAnswer}</p>
          </article>
        </div>
        <form className="h-fit rounded-xl border border-line bg-paper p-5 shadow-card lg:sticky lg:top-20" onSubmit={(event) => event.preventDefault()}>
          <label className="block text-sm font-medium" htmlFor="score">主观评分 {score}</label>
          <input id="score" className="mt-3 w-full" type="range" min={0} max={100} value={score} onChange={(event) => setScore(Number(event.target.value))} />
          <fieldset className="mt-4">
            <legend className="text-sm font-medium">评价标签</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {REVIEW_TAGS.map((tag) => {
                const active = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={active}
                    className={cn("rounded-full px-2 py-1 text-xs", active ? "bg-tide text-white" : "bg-canvas text-ink-soft")}
                    onClick={() => setTags((current) => active ? current.filter((item) => item !== tag) : [...current, tag])}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <label className="mt-4 block text-sm font-medium" htmlFor="defense">口头答辩记录</label>
          <textarea id="defense" value={defenseNote} onChange={(event) => setDefenseNote(event.target.value)} className="mt-2 min-h-24 w-full rounded-md border border-line p-3 text-sm outline-none focus:border-tide" />
          <label className="mt-4 block text-sm font-medium" htmlFor="comment">评语</label>
          <textarea id="comment" value={comment} onChange={(event) => setComment(event.target.value)} className="mt-2 min-h-24 w-full rounded-md border border-line p-3 text-sm outline-none focus:border-tide" />
          {message ? <p className="mt-3 text-sm text-tide-deep" role="status">{message}</p> : null}
          {!ready ? <p className="mt-3 text-sm text-amberline">学生尚未提交，暂时不能给出通过或退回。</p> : null}
          {challenge.abilities.includes("locate") && isModuleHeld(state, submission.studentId, "c6") ? (
            <p className="mt-3 text-sm leading-6 text-ink-soft">这名学生的汇报挑战还锁着。通过故障定位后，「十五分钟 PoC 复盘」会解锁。</p>
          ) : null}
          {challenge.abilities.includes("report") ? (
            <label className="mt-4 flex items-start gap-2 text-sm leading-6">
              <input type="checkbox" className="mt-1" checked={heardDefense} onChange={(event) => setHeardDefense(event.target.checked)} />
              <span>已听取证据依据、替代原因与不可见边界的说明，可以判定通过。</span>
            </label>
          ) : null}
          <div className="mt-4 flex gap-2">
            <Button disabled={!ready || (challenge.abilities.includes("report") && !heardDefense)} onClick={() => decide("passed")}>通过</Button>
            <Button variant="danger" disabled={!ready} onClick={() => decide("returned")}>退回修改</Button>
          </div>
          {message ? <div className="mt-4 flex flex-wrap gap-3 text-xs"><Link className="text-tide" href={`/teacher/classes/${classroom.id}?view=reviews`}>返回本班验收</Link><Link className="text-tide" href={`/teacher/classes/${classroom.id}`}>回到学生进度</Link><Link className="text-tide" href="/student?view=portrait">查看画像联动</Link></div> : null}
        </form>
      </div>
    </>
  );
}
