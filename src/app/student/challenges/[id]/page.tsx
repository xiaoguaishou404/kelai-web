"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { careerById, careerRelationsForChallenge } from "@/lib/career-market-data";
import { useDemo } from "@/lib/demo-store";
import { ABILITIES, DEMO_STUDENT_ID } from "@/lib/mock-data";
import { challengeForState, isChallengeOpen, isModuleHeld, practiceBlockers, submissionOf } from "@/lib/metrics";
import { cn } from "@/lib/utils";

export default function ChallengeDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { state, toggleStage } = useDemo();
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [reportParts, setReportParts] = useState<string[]>([]);
  const reportOutline = ["需求", "链路", "结论", "证据", "下一步建议"];
  const releasedChallenge = challengeForState(state, params.id);
  const submission = releasedChallenge ? submissionOf(state, DEMO_STUDENT_ID, releasedChallenge.id) : undefined;
  const challenge = submission?.challengeSnapshot ?? releasedChallenge;
  useEffect(() => {
    if (!challenge || challenge.id !== "c6" || !submission || reportParts.length < reportOutline.length) return;
    challenge.stages.forEach((stage) => {
      if (!submission.completedStageIds.includes(stage.id)) toggleStage(submission.id, stage.id);
    });
  }, [challenge, reportOutline.length, reportParts.length, submission, toggleStage]);
  if (!challenge || !isChallengeOpen(state, challenge)) {
    return <EmptyState title="任务当前不可用" body="它可能尚未发布。可从任务学习中心返回。" />;
  }
  const ability = challenge.abilities
    .map((key) => ABILITIES.find((item) => item.key === key)?.name)
    .join("、");
  const drills = challenge.stages.filter((stage) => stage.drill);
  const checkedDrills = drills.filter((stage) => submission?.completedStageIds.includes(stage.id)).length;
  const sourceCareer = careerById(searchParams.get("career") ?? "");
  const sourceScene = sourceCareer?.learningScenes.find(
    (scene) => scene.id === searchParams.get("scene") && scene.challengeId === challenge.id,
  );
  const relations = careerRelationsForChallenge(challenge.id);
  const relatedCareers = [...new Map(relations.map(({ career }) => [career.id, career])).values()];
  const routeQuery = sourceCareer
    ? `?career=${sourceCareer.id}${sourceScene ? `&scene=${sourceScene.id}` : ""}${searchParams.get("from") === "recruitment" ? `&from=recruitment&company=${encodeURIComponent(searchParams.get("company") ?? "")}` : ""}`
    : "";
  const locatePassed = submissionOf(state, DEMO_STUDENT_ID, "c4")?.status === "passed";
  const blockers = challenge && submission ? practiceBlockers(challenge, submission, locatePassed) : [];

  return (
    <>
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs text-ink-muted" aria-label="面包屑">
        {sourceCareer ? (
          <>
            <Link href="/student/careers" className="hover:text-tide">岗位地图</Link>
            <span>/</span>
            <Link href={`/student/careers/${sourceCareer.id}`} className="hover:text-tide">{sourceCareer.title}</Link>
          </>
        ) : (
          <Link href="/student/challenges" className="hover:text-tide">任务学习中心</Link>
        )}
        <span>/</span>
        <span className="text-ink">{challenge.title}</span>
      </nav>
      <PageHeader
        title={challenge.title}
        meta={`${challenge.code} · ${ability} · ${challenge.required ? "必选" : "选配"}`}
        action={submission ? <StatusBadge status={submission.status} /> : null}
      />
      {submission?.review ? (
        <section className="mb-4 rounded-xl border border-line bg-paper p-5">
          <h2 className="text-sm font-medium">{submission.review.score}</h2>
          <p className="mt-2 text-sm leading-6">{submission.review.comment}</p>
        </section>
      ) : null}
      {sourceCareer && sourceScene ? (
        <section className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-paper px-4 py-3">
          <p className="text-sm">{sourceCareer.title} · {sourceScene.title}</p>
          <Link href={`/student/careers/${sourceCareer.id}`} className="text-sm text-ink-muted hover:text-ink">返回</Link>
        </section>
      ) : (
        <div className="mb-4 flex flex-wrap gap-2">
          {relatedCareers.slice(0, 6).map((career) => (
            <Link key={career.id} href={`/student/careers/${career.id}`} className="rounded-full border border-line bg-paper px-3 py-1 text-xs text-ink-soft hover:text-ink">
              {career.title}
            </Link>
          ))}
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-xl border border-line bg-paper p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="section-title">业务现场</h2>
            {drills.length > 0 ? <p className="text-sm text-ink-soft">基础问答 {checkedDrills}/{drills.length} 已核对</p> : null}
          </div>
          <p className="mt-2 text-sm leading-7 text-ink-soft">{challenge.summary}</p>
          <p className="mt-2 text-sm leading-7 text-ink-soft">{challenge.scene}</p>
          {challenge.labContext ? (
            <div className="mt-4 grid gap-3 rounded-lg border border-line bg-[#F8FAFC] p-4 sm:grid-cols-2">
              <div>
                <h3 className="text-xs font-medium text-ink">业务链路</h3>
                <p className="mt-1 text-xs leading-5 text-ink-soft">{challenge.labContext.businessChain.join(" → ")}</p>
              </div>
              <div>
                <h3 className="text-xs font-medium text-ink">协议 / 观测信号</h3>
                <p className="mt-1 text-xs leading-5 text-ink-soft">{challenge.labContext.protocols.join(" · ")}</p>
              </div>
              <div>
                <h3 className="text-xs font-medium text-ink">关键指标</h3>
                <p className="mt-1 text-xs leading-5 text-ink-soft">{challenge.labContext.indicators.join(" · ")}</p>
              </div>
              <div>
                <h3 className="text-xs font-medium text-ink">证据可见边界</h3>
                <p className="mt-1 text-xs leading-5 text-ink-soft">{challenge.labContext.visibility}</p>
              </div>
            </div>
          ) : null}
          {challenge.id === "c6" && !isModuleHeld(state, DEMO_STUDENT_ID, "c6") ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {reportOutline.map((part) => {
                const active = reportParts.includes(part);
                return (
                  <button
                    key={part}
                    type="button"
                    aria-pressed={active}
                    className={cn("rounded-full border border-line px-3 py-1 text-xs", active ? "border-ink bg-ink text-white" : "bg-white text-ink-soft")}
                    onClick={() => setReportParts((current) => active ? current.filter((item) => item !== part) : [...current, part])}
                  >
                    {part}
                  </button>
                );
              })}
            </div>
          ) : null}
          <ol className="mt-5 space-y-3">
            {challenge.stages.map((stage, index) => {
              const done = Boolean(submission?.completedStageIds.includes(stage.id));
              const picked = picks[stage.id];
              const choice = stage.drill?.choices.find((item) => item.text === picked);
              return (
                <li key={stage.id} className="rounded-lg bg-canvas p-3">
                  <p className="text-sm font-medium">0{index + 1} {stage.title}</p>
                  <p className="mt-1 text-sm leading-6 text-ink-soft">{stage.prompt}</p>
                  {stage.drill ? (
                    <div className="mt-3">
                      <p className="text-sm font-medium">{stage.drill.ask}</p>
                      <div className="mt-2 flex flex-col gap-2">
                        {stage.drill.choices.map((item) => (
                          <button
                            key={item.text}
                            type="button"
                            disabled={done}
                            aria-pressed={done ? item.right : picked === item.text}
                            className={cn(
                              "rounded-md px-3 py-2 text-left text-sm",
                              (done ? item.right : picked === item.text)
                                ? item.right ? "bg-success text-white" : "bg-warning text-white"
                                : "bg-white text-ink",
                            )}
                            onClick={() => {
                              setPicks((current) => ({ ...current, [stage.id]: item.text }));
                              if (item.right && submission && !done) toggleStage(submission.id, stage.id);
                            }}
                          >
                            {item.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </article>
        <aside className="space-y-4">
          <article className="rounded-xl border border-line bg-paper p-5">
            <h2 className="text-sm font-medium">完成指标</h2>
            <ul className="mt-3 list-disc space-y-2 pl-4 text-sm leading-6 text-ink-soft">
              {challenge.criteria.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <div className="mt-5 flex flex-col gap-2">
              <Link className={buttonVariants()} href={`/student/challenges/${challenge.id}/desktop${routeQuery}`}>进入仿真桌面</Link>
              {submission && (submission.status === "submitted" || submission.status === "passed") ? (
                <Link className={buttonVariants({ variant: "secondary" })} href="/student/records">查看任务学习记录</Link>
              ) : blockers.length > 0 ? (
                <p className="rounded-lg bg-warning-mist px-3 py-2 text-xs leading-5 text-warning-deep">还不能提交：{blockers.join("；")}</p>
              ) : (
                <Link className={buttonVariants({ variant: "secondary" })} href={`/student/challenges/${challenge.id}/submit${routeQuery}`}>提交成果</Link>
              )}
            </div>
          </article>
          <article className="rounded-xl border border-line bg-paper p-5">
            <h2 className="text-sm font-medium">常见误区</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-ink-soft">
              {challenge.pitfalls.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        </aside>
      </div>
    </>
  );
}
