"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";
import { isModuleHeld, practiceBlockers, sessionLimit } from "@/lib/metrics";
import { DEMO_STUDENT_ID } from "@/lib/mock-data";
import type { Challenge, Submission } from "@/lib/types";
import { cn } from "@/lib/utils";

const LOCATE_NODES = [
  { id: "term", label: "柜面终端", ok: false, hint: "这一跳在镜像范围内，但还不是最后一跳。" },
  { id: "front", label: "网点前置", ok: false, hint: "前置可见，镜像终点还在后面。" },
  { id: "switch", label: "网点核心交换", ok: true, hint: "镜像覆盖停在这里。请求之后还能确认到达总行接入区，但那不是镜像终点。" },
  { id: "mpls", label: "MPLS 专线", ok: false, hint: "专线对端没有镜像，不能当成已覆盖。" },
  { id: "access", label: "总行接入区", ok: false, hint: "能确认请求到达，但镜像本身停在网点核心交换。" },
  { id: "app", label: "核心交易", ok: false, hint: "核心内部没有旁路，不能写成已定位。" },
];

export function CloudDesktop({
  challenge,
  submission,
  routeQuery = "",
}: {
  challenge: Challenge;
  submission: Submission;
  routeQuery?: string;
}) {
  const { state, markPractice, addDesktopMinutes, resetDesktop } = useDemo();
  const [running, setRunning] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [compared, setCompared] = useState(false);
  const [activeId, setActiveId] = useState(challenge.stages.find((stage) => !submission.completedStageIds.includes(stage.id))?.id ?? challenge.stages[0]?.id ?? "");
  const [workspaceKey, setWorkspaceKey] = useState(challenge.id);
  if (workspaceKey !== challenge.id) {
    const firstOpen = challenge.stages.find((stage) => !submission.completedStageIds.includes(stage.id))?.id ?? challenge.stages[0]?.id ?? "";
    setWorkspaceKey(challenge.id);
    setActiveId(firstOpen);
    setFeedback("");
    setPicked({});
    setCompared(false);
  }
  const timeout = sessionLimit(state.environment.timeoutMinutes, submission.grantedMinutes);
  const blocked = state.environment.maintenance;
  const locked = submission.status === "submitted" || submission.status === "passed";
  const reclaimed = !locked && submission.desktopMinutes >= timeout;
  const disabled = blocked || locked || reclaimed;
  const locatePassed = state.submissions.some((item) => item.studentId === DEMO_STUDENT_ID && item.challengeId === "c4" && item.status === "passed");
  const blockers = practiceBlockers(challenge, submission, locatePassed);
  const active = challenge.stages.find((stage) => stage.id === activeId) ?? challenge.stages[0];
  const unlocksReport = challenge.abilities.includes("locate") && isModuleHeld(state, DEMO_STUDENT_ID, "c6");

  useEffect(() => {
    if (reclaimed) setRunning(false);
  }, [reclaimed]);

  useEffect(() => {
    if (!running || blocked || locked || reclaimed) return;
    const timer = window.setInterval(() => addDesktopMinutes(submission.id, 1), 5000);
    return () => window.clearInterval(timer);
  }, [addDesktopMinutes, blocked, locked, reclaimed, running, submission.id]);

  function save(change: { stageId?: string; evidenceId?: string }, message: string) {
    if (disabled) return;
    markPractice(submission.id, change);
    setFeedback(message);
    if (change.stageId) {
      const next = challenge.stages.find((stage) => stage.id !== change.stageId && !submission.completedStageIds.includes(stage.id));
      if (next) setActiveId(next.id);
    }
  }

  function choose(stageId: string, text: string, right: boolean, success: string) {
    setPicked((current) => ({ ...current, [stageId]: text }));
    if (!right) {
      setFeedback("这是常见误区。先回到样本里的现象或证据，再做判断。");
      return;
    }
    save({ stageId }, success);
  }

  const stageDone = active ? submission.completedStageIds.includes(active.id) : false;
  const lossPinned = submission.evidenceIds.includes("ev-loss");
  const appPinned = submission.evidenceIds.includes("ev-app");

  return (
    <section className="cloud-lab overflow-hidden rounded-xl border border-ink bg-[#101923] text-[#d7e2ea] shadow-card">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs text-[#8ea2b3]">前端仿真 · 不是真实虚拟机，不提供镜像下载或远程控制</p>
          <h2 className="text-sm">{state.environment.version} · {challenge.sample}</h2>
          <p className="mt-1 text-[11px] leading-5 text-[#8ea2b3]">{challenge.summary}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-white/10 px-2 py-1">机时 {submission.desktopMinutes}/{timeout} 分钟</span>
          <span className="rounded-full bg-white/10 px-2 py-1">阶段 {submission.completedStageIds.length}/{challenge.stages.length}</span>
          <Button size="sm" variant="secondary" disabled={!running || disabled} onClick={() => setRunning(false)}>暂停</Button>
          <Button size="sm" disabled={disabled} onClick={() => { setRunning(true); setFeedback("仿真分析台已开始计时。离开或暂停后不再累计。"); }}>
            {running ? "计时中" : "开始实操"}
          </Button>
        </div>
      </header>
      <div className="border-b border-white/10 px-4 py-3 text-xs leading-5 text-[#b7c6d2]">
        <p><span className="text-[#8ea2b3]">场景 · </span>{challenge.scene}</p>
        <p className="mt-1"><span className="text-[#8ea2b3]">完成条件 · </span>{challenge.criteria.join("；")}</p>
      </div>
      {blocked ? <p className="bg-[#8d3b32] px-4 py-2 text-sm text-white">云端环境维护中，计时与取证已暂停。</p> : null}
      {reclaimed ? <p className="bg-[#8a5a12] px-4 py-2 text-sm text-white">本次桌面已到 {timeout} 分钟回收线，实操已暂停。已收录的证据还在。</p> : null}
      {locked ? <p className="bg-[#145e5b] px-4 py-2 text-sm text-white">{submission.status === "passed" ? `教师已通过${submission.review ? `，${submission.review.score} 分` : ""}。${submission.review?.comment ?? ""}` : "成果已提交，等待教师验收。记录已写入任务学习记录。"}</p> : null}
      {submission.status === "returned" && submission.review ? <p className="bg-[#8a5a12] px-4 py-2 text-sm text-white">已退回：{submission.review.comment} 可以补充证据后再次提交。</p> : null}
      {unlocksReport ? <p className="bg-[#145e5b] px-4 py-2 text-sm text-white">通过这次故障定位后，才会解锁「十五分钟 PoC 复盘」。</p> : null}
      {feedback ? <p className="bg-tide px-4 py-2 text-sm text-white" role="status">{feedback}</p> : null}
      <div className="grid min-w-0 lg:grid-cols-[220px_minmax(0,1fr)_240px]">
        <div className="border-b border-white/10 p-4 lg:border-b-0 lg:border-r">
          <h3 className="text-sm text-white">阶段任务</h3>
          <ul className="mt-3 space-y-2">
            {challenge.stages.map((stage, index) => {
              const done = submission.completedStageIds.includes(stage.id);
              return (
                <li key={stage.id}>
                  <button type="button" className={cn("w-full rounded-md border p-2 text-left", active?.id === stage.id ? "border-[#9ddecf] bg-white/5" : "border-white/10 hover:bg-white/5")} onClick={() => setActiveId(stage.id)}>
                    <span className={cn("text-sm", done && "text-[#9ddecf]")}>{done ? "已核对" : "待完成"} · 0{index + 1} {stage.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-[#8ea2b3]">{stage.prompt}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="min-w-0 p-4">
          {active ? (
            <div className="rounded-lg border border-white/10 bg-[#0c141b] p-4">
              <p className="text-xs text-[#8ea2b3]">{challenge.tools[0]} · {state.environment.samplePack}</p>
              <h3 className="mt-2 text-sm text-white">{active.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#b7c6d2]">{active.prompt}</p>
              {challenge.id === "c4" && active.id === "c4-s2" ? (
                <div className="mt-4">
                  <p className="text-xs text-[#8ea2b3]">点出这次镜像能覆盖的最后一跳。</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {LOCATE_NODES.map((node) => (
                      <button key={node.id} type="button" disabled={disabled || stageDone} className="rounded-md border border-white/10 px-3 py-2 text-left text-xs hover:bg-white/5 disabled:opacity-50" onClick={() => {
                        if (!node.ok) {
                          setFeedback(node.hint);
                          return;
                        }
                        save({ stageId: active.id, evidenceId: "ev-arrive" }, "已核对可见终点，并收录「前置请求已到总行」。");
                      }}>
                        {node.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {challenge.id === "c4" && active.id === "c4-s3" ? (
                <div className="mt-4">
                  {!compared && !lossPinned && !appPinned ? (
                    <Button size="sm" disabled={disabled} onClick={() => { setCompared(true); setFeedback("已载入 15:02–15:04 的柜面转账会话。请分别收录重传和应用等待。"); }}>运行时延对照</Button>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <button type="button" disabled={disabled || lossPinned} className="rounded-md border border-white/10 p-3 text-left disabled:opacity-60" onClick={() => save({ evidenceId: "ev-loss" }, "已收录重传占比 1.2%。它解释不了 47 秒，还要确认等待落点。")}>
                        <span className="text-xs text-[#8ea2b3]">15:04:03 · {lossPinned ? "已收录" : "收录"}</span>
                        <span className="mt-1 block text-sm text-white">重传占比 1.2%</span>
                      </button>
                      <button type="button" disabled={disabled || appPinned} className="rounded-md border border-white/10 p-3 text-left disabled:opacity-60" onClick={() => save({ evidenceId: "ev-app" }, "已收录核心响应等待 47 秒。两条证据齐了就可以确认判断。")}>
                        <span className="text-xs text-[#8ea2b3]">15:04:02 · {appPinned ? "已收录" : "收录"}</span>
                        <span className="mt-1 block text-sm text-white">核心响应等待 47 秒</span>
                      </button>
                    </div>
                  )}
                  {lossPinned && appPinned && !stageDone ? (
                    <Button className="mt-3" size="sm" disabled={disabled} onClick={() => save({ stageId: active.id }, "判断已保存：慢在应用响应，不是专线重传。")}>确认：慢在应用响应，不是重传</Button>
                  ) : null}
                </div>
              ) : null}
              {!(challenge.id === "c4" && (active.id === "c4-s2" || active.id === "c4-s3")) ? (
                <div className="mt-4">
                  <p className="text-sm text-white">{active.drill?.ask ?? "这一阶段怎样才算核对完成？"}</p>
                  <div className="mt-2 flex flex-col gap-2">
                    {(active.drill?.choices ?? [
                      { text: active.prompt, right: true },
                      { text: challenge.pitfalls[0] ?? "先写结论，再回头找证据", right: false },
                    ]).map((choice) => {
                      const selected = stageDone ? choice.right : picked[active.id] === choice.text;
                      return (
                        <button key={choice.text} type="button" disabled={disabled || stageDone} aria-pressed={selected} className={cn("rounded-md px-3 py-2 text-left text-sm disabled:opacity-70", selected ? choice.right ? "bg-[#145e5b] text-white" : "bg-[#8d3b32] text-white" : "bg-white/5 hover:bg-white/10")} onClick={() => choose(active.id, choice.text, choice.right, `「${active.title}」已核对，并写入本机学习记录。`)}>
                          {choice.text}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              {stageDone ? <p className="mt-3 text-xs text-[#9ddecf]">这一阶段已核对，结果已保存。</p> : null}
            </div>
          ) : null}
          {challenge.id !== "c4" ? (
            <div className="mt-3 grid gap-2">
              {challenge.evidence.map((item) => {
                const pinned = submission.evidenceIds.includes(item.id);
                return (
                  <button key={item.id} type="button" disabled={disabled || pinned} className={cn("rounded-md border px-3 py-2 text-left", pinned ? "border-[#9ddecf] bg-[#14302e]" : "border-white/10 hover:bg-white/5")} onClick={() => save({ evidenceId: item.id }, `已收录「${item.title}」，提交时会附在成果里。`)}>
                    <span className="text-xs text-[#8ea2b3]">{item.time} · {pinned ? "已收录" : "收录这条证据"}</span>
                    <span className="mt-1 block text-sm text-white">{item.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-[#b7c6d2]">{item.detail}</span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
        <aside className="min-w-0 border-t border-white/10 p-4 lg:border-l lg:border-t-0">
          <h3 className="text-sm text-white">证据栏</h3>
          <ul className="mt-3 space-y-2">
            {challenge.evidence.map((item) => {
              const pinned = submission.evidenceIds.includes(item.id);
              return <li key={item.id} className="text-xs leading-5 text-[#b7c6d2]">{pinned ? "已收录" : "待收录"} · {item.title}</li>;
            })}
          </ul>
          {blockers.length > 0 && !locked ? (
            <div className="mt-4 rounded-md border border-[#8a5a12] p-3 text-xs leading-5 text-[#e7c98a]">
              还不能提交：{blockers.join("；")}
            </div>
          ) : locked ? (
            <Link href="/student/records" className={cn(buttonVariants(), "mt-4 w-full")}>查看任务学习记录</Link>
          ) : (
            <Link href={`/student/challenges/${challenge.id}/submit${routeQuery}`} className={cn(buttonVariants(), "mt-4 w-full")}>提交成果</Link>
          )}
          <details className="mt-4 rounded-md border border-white/10 p-3">
            <summary className="cursor-pointer text-sm text-white">专家参考范本</summary>
            <p className="mt-2 text-xs leading-5 text-[#b7c6d2]">{challenge.expertAnswer}</p>
          </details>
          <Button variant="secondary" className="mt-4 w-full" disabled={disabled} onClick={() => { resetDesktop(submission.id); setRunning(false); setFeedback("证据已清空。已核对的阶段还在，补回必做证据后才能提交。"); }}>
            清空已收录证据
          </Button>
        </aside>
      </div>
    </section>
  );
}
