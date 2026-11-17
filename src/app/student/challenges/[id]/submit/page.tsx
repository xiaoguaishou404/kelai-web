"use client";

import { StudentIllustration } from "@/components/student-illustration";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { careerById } from "@/lib/career-market-data";
import { useDemo } from "@/lib/demo-store";
import { DEMO_STUDENT_ID } from "@/lib/mock-data";
import { challengeForState, isChallengeOpen, isModuleHeld, practiceBlockers, submissionOf } from "@/lib/metrics";

export default function SubmitPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { state, saveDraft, submitWork } = useDemo();
  const releasedChallenge = challengeForState(state, params.id);
  const submission = releasedChallenge ? submissionOf(state, DEMO_STUDENT_ID, releasedChallenge.id) : undefined;
  const challenge = submission?.challengeSnapshot ?? releasedChallenge;
  const [deliverable, setDeliverable] = useState(submission?.deliverable ?? "");
  const [explanation, setExplanation] = useState(submission?.explanation ?? "");
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [ackReturn, setAckReturn] = useState(false);
  const [defenseLine, setDefenseLine] = useState("");
  const careerId = searchParams.get("career");
  const sceneId = searchParams.get("scene");
  const routeQuery = careerId ? `?career=${encodeURIComponent(careerId)}${sceneId ? `&scene=${encodeURIComponent(sceneId)}` : ""}${searchParams.get("from") === "recruitment" ? `&from=recruitment&company=${encodeURIComponent(searchParams.get("company") ?? "")}` : ""}` : "";
  const sourceCareer = careerById(careerId ?? "");
  const sourceScene = sourceCareer?.learningScenes.find((scene) => scene.id === sceneId && scene.challengeId === challenge?.id);

  useEffect(() => {
    setDeliverable(submission?.deliverable ?? "");
    setExplanation(submission?.explanation ?? "");
  }, [submission?.id, submission?.deliverable, submission?.explanation]);

  if (!challenge || !submission || !isChallengeOpen(state, challenge)) {
    return <EmptyState title="没有可提交的成果" body="任务尚未发布，或当前学生没有这条实训记录。" />;
  }

  const locked = submission.status === "submitted" || submission.status === "passed";
  const held = isModuleHeld(state, DEMO_STUDENT_ID, challenge.id);
  const needsDefense = challenge.abilities.includes("report");
  const defenseQuestion = challenge.id === "c6" ? "为什么不是带宽问题" : "哪些证据支持结论，还有哪些不可见边界";
  const mustAck = submission.status === "returned" && !ackReturn;
  const locatePassed = submissionOf(state, DEMO_STUDENT_ID, "c4")?.status === "passed";
  const inheritedEvidence = challenge.id === "c6" && locatePassed;
  const blockers = practiceBlockers(challenge, submission, locatePassed);
  const stageReady = challenge.stages.every((stage) => submission.completedStageIds.includes(stage.id));
  const pinned = challenge.evidence.filter((item) => submission.evidenceIds.includes(item.id));

  function validate() {
    if (held) return "故障定位通过后才能提交汇报。";
    if (blockers.length > 0) return blockers.join("；");
    if (deliverable.trim().length < 12 || explanation.trim().length < 12) {
      return "交付物和“为什么”都至少写 12 个字。";
    }
    if (needsDefense && defenseLine.trim().length < 12) return `请用至少 12 个字回答：${defenseQuestion}。`;
    if (mustAck) return "请先确认已经看过教师的退回原因。";
    return "";
  }

  return (
    <>
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs text-ink-muted" aria-label="面包屑">
        {sourceCareer ? (
          <>
            <Link href="/student/careers" className="hover:text-tide">岗位地图</Link>
            <span>/</span>
            <Link href={`/student/careers/${sourceCareer.id}`} className="hover:text-tide">{sourceCareer.title}</Link>
            {sourceScene ? <><span>/</span><span>{sourceScene.title}</span></> : null}
            <span>/</span>
          </>
        ) : (
          <>
            <Link href="/student/challenges" className="hover:text-tide">任务学习中心</Link>
            <span>/</span>
          </>
        )}
        <Link href={`/student/challenges/${challenge.id}${routeQuery}`} className="hover:text-tide">任务详情</Link>
        <span>/</span>
        <span className="text-ink">提交成果</span>
      </nav>
      <PageHeader art={<StudentIllustration scene="report" />}
        eyebrow="成果提交"
        title={challenge.title}
        description="教师看的是交付物、证据和你对判断过程的解释。范本可以参考，但不能代替自己的理由。"
        action={<StatusBadge status={submission.status} />}
      />
      {submission.review ? (
        <section className="mb-4 rounded-xl border border-line bg-paper p-5">
          <h2 className="text-sm font-medium">最近一次教师反馈 · {submission.review.score} 分</h2>
          <p className="mt-2 text-sm leading-6">{submission.review.comment}</p>
          <p className="mt-2 text-xs text-ink-soft">答辩记录：{submission.review.defenseNote}</p>
        </section>
      ) : null}
      <section className="mb-4 rounded-xl border border-line bg-paper p-5">
        <h2 className="text-sm font-medium">将随成果提交的证据</h2>
        {pinned.length === 0 && inheritedEvidence ? (
          <p className="mt-2 text-sm leading-6 text-ink-soft">这份汇报沿用已通过的定位证据，不必在复盘桌面里重新点选。</p>
        ) : pinned.length === 0 ? (
          <p className="mt-2 text-sm leading-6 text-ink-soft">仿真桌面里还没有收录证据。先回到桌面完成取证，教师才能对照结论。</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm leading-6">
            {pinned.map((item) => <li key={item.id}>{item.time} · {item.title}：{item.detail}</li>)}
          </ul>
        )}
      </section>
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const error = validate();
          if (error) {
            setMessage({ tone: "error", text: error });
            return;
          }
          const defense = needsDefense ? `\n答辩：${defenseLine.trim()}` : "";
          submitWork(submission.id, deliverable.trim(), `${explanation.trim()}${defense}`);
          setMessage({ tone: "ok", text: "已提交，状态变为待验收。可在任务学习记录中查看，教师成果验收会同步出现。" });
        }}
      >
        <label className="block rounded-xl border border-line bg-paper p-5">
          <span className="text-sm font-medium">交付物</span>
          <textarea
            value={deliverable}
            disabled={locked}
            onChange={(event) => setDeliverable(event.target.value)}
            className="mt-3 min-h-32 w-full resize-y rounded-md border border-line bg-canvas p-3 text-sm leading-6 outline-none focus:border-tide"
            placeholder="写出结论、证据和不可见边界。"
          />
        </label>
        <label className="block rounded-xl border border-line bg-paper p-5">
          <span className="text-sm font-medium">为什么这样判断</span>
          <textarea
            value={explanation}
            disabled={locked}
            onChange={(event) => setExplanation(event.target.value)}
            className="mt-3 min-h-28 w-full resize-y rounded-md border border-line bg-canvas p-3 text-sm leading-6 outline-none focus:border-tide"
            placeholder="说明排除了什么，保留了什么。"
          />
        </label>
        {stageReady && challenge.id === "c6" ? (
          <p className="text-sm leading-6 text-tide-deep">五段已齐。提交前仍要写清为什么不是带宽问题。</p>
        ) : null}
        {stageReady && challenge.abilities.includes("locate") && isModuleHeld(state, DEMO_STUDENT_ID, "c6") ? (
          <p className="text-sm leading-6 text-tide-deep">定位阶段已齐。提交并通过后，汇报任务才会解锁。</p>
        ) : null}
        {held ? <p className="text-sm leading-6 text-warning-deep">故障定位还没通过，汇报成果先不能提交。</p> : blockers.length > 0 && !locked ? <p className="text-sm leading-6 text-warning-deep">还不能提交：{blockers.join("；")}</p> : null}
        {challenge.id === "c6" && submissionOf(state, DEMO_STUDENT_ID, "c4")?.status === "passed" ? (
          <Button
            variant="secondary"
            disabled={locked || held}
            onClick={() => {
              const locate = submissionOf(state, DEMO_STUDENT_ID, "c4");
              const deliverableText = `沿用已通过的定位结论：${locate?.deliverable || "慢在业务返回，不在专线重传。"}`;
              const defenseText = "不是带宽问题，因为已通过的定位证据指向业务返回，而不是链路重传。";
              setDeliverable(deliverableText);
              setDefenseLine(defenseText);
              saveDraft(submission.id, deliverableText, defenseText);
              setMessage({ tone: "ok", text: "已沿用定位结论，答辩句还可以改。" });
            }}
          >
            沿用定位结论
          </Button>
        ) : null}
        {needsDefense ? (
          <label className="block rounded-xl border border-line bg-paper p-5">
            <span className="text-sm font-medium">口头答辩：{defenseQuestion}</span>
            <textarea
              value={defenseLine}
              disabled={locked || held}
              onChange={(event) => setDefenseLine(event.target.value)}
              className="mt-3 min-h-24 w-full resize-y rounded-md border border-line bg-canvas p-3 text-sm leading-6 outline-none focus:border-tide"
              placeholder="写出排除拥塞的证据，不要只重复结论。"
            />
          </label>
        ) : null}
        {submission.status === "returned" ? (
          <label className="flex items-start gap-2 text-sm leading-6">
            <input type="checkbox" className="mt-1" checked={ackReturn} onChange={(event) => setAckReturn(event.target.checked)} />
            <span>我已看过退回原因，会按评语重做，而不是原样再交一次。</span>
          </label>
        ) : null}
        {message ? <p className={message.tone === "error" ? "text-sm text-clay" : "text-sm text-tide-deep"} role="status">{message.text}</p> : null}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            disabled={locked || held || pinned.length === 0}
            onClick={() => {
              setDeliverable(`结论基于已收录证据：${pinned.map((item) => `${item.title}，${item.detail}`).join("；")}。看不见的部分不写入结论。`);
              setExplanation("用这些证据区分链路重传和应用等待，不把客户的猜测写成事实。");
              setMessage({ tone: "ok", text: "已按证据填入草稿，提交前还可以改。" });
            }}
          >
            按证据填入草稿
          </Button>
          <Button type="submit" disabled={locked || mustAck || held || blockers.length > 0}>提交验收</Button>
          <Button
            variant="secondary"
            disabled={locked}
            onClick={() => {
              saveDraft(submission.id, deliverable.trim(), explanation.trim());
              setMessage({ tone: "ok", text: "草稿已保存，任务仍可继续修改。" });
            }}
          >
            保存草稿
          </Button>
          <Link className={buttonVariants({ variant: "ghost" })} href={`/student/challenges/${challenge.id}/desktop${routeQuery}`}>返回仿真桌面</Link>
          {message?.tone === "ok" && submission.status === "submitted" ? <Link className={buttonVariants({ variant: "secondary" })} href="/student/records">查看任务学习记录</Link> : null}
        </div>
      </form>
    </>
  );
}
