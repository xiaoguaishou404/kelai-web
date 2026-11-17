"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { CloudDesktop } from "@/components/cloud-desktop";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { careerById } from "@/lib/career-market-data";
import { useDemo } from "@/lib/demo-store";
import { DEMO_STUDENT_ID } from "@/lib/mock-data";
import { challengeForState, isChallengeOpen, isModuleHeld, practiceBlockers, submissionOf } from "@/lib/metrics";

export default function DesktopPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { state } = useDemo();
  const releasedChallenge = challengeForState(state, params.id);
  const submission = releasedChallenge ? submissionOf(state, DEMO_STUDENT_ID, releasedChallenge.id) : undefined;
  const challenge = submission?.challengeSnapshot ?? releasedChallenge;
  const careerId = searchParams.get("career");
  const sceneId = searchParams.get("scene");
  const routeQuery = careerId ? `?career=${encodeURIComponent(careerId)}${sceneId ? `&scene=${encodeURIComponent(sceneId)}` : ""}${searchParams.get("from") === "recruitment" ? `&from=recruitment&company=${encodeURIComponent(searchParams.get("company") ?? "")}` : ""}` : "";
  const sourceCareer = careerById(careerId ?? "");
  const sourceScene = sourceCareer?.learningScenes.find((scene) => scene.id === sceneId && scene.challengeId === challenge?.id);
  if (!challenge || !submission || !isChallengeOpen(state, challenge)) {
    return <EmptyState title="仿真桌面没有对应任务" body="请从任务学习中心或岗位场景进入。这里是前端仿真，不提供真实虚拟机、镜像下载或远程控制。" />;
  }
  if (isModuleHeld(state, DEMO_STUDENT_ID, challenge.id)) {
    return (
      <>
        <PageHeader title={challenge.title} meta="未解锁" />
        <Link className={`${buttonVariants()} mt-4`} href="/student/challenges/c4">去完成定位</Link>
      </>
    );
  }
  const locatePassed = submissionOf(state, DEMO_STUDENT_ID, "c4")?.status === "passed";
  const blockers = practiceBlockers(challenge, submission, locatePassed);
  const locked = submission.status === "submitted" || submission.status === "passed";
  const done = challenge.stages.filter((stage) => submission.completedStageIds.includes(stage.id)).length;
  const backHref = sourceCareer ? `/student/careers/${sourceCareer.id}` : "/student/challenges";

  return (
    <>
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs text-ink-muted" aria-label="面包屑">
        {sourceCareer ? (
          <>
            <Link href="/student/careers" className="hover:text-tide">岗位地图</Link>
            <span>/</span>
            <Link href={`/student/careers/${sourceCareer.id}`} className="hover:text-tide">{sourceCareer.title}</Link>
            {sourceScene ? <><span>/</span><span>{sourceScene.title}</span></> : null}
          </>
        ) : (
          <Link href="/student/challenges" className="hover:text-tide">任务学习中心</Link>
        )}
        <span>/</span>
        <Link href={`/student/challenges/${challenge.id}${routeQuery}`} className="hover:text-tide">任务详情</Link>
        <span>/</span>
        <span className="text-ink">仿真桌面</span>
      </nav>
        <PageHeader
          title={challenge.title}
          meta={`${done}/${challenge.stages.length}`}
          action={
            <>
              <Link href={backHref} className={buttonVariants({ variant: "secondary" })}>{sourceCareer ? "返回岗位" : "返回"}</Link>
              {locked ? (
                <Link href="/student/records" className={buttonVariants()}>记录</Link>
              ) : blockers.length > 0 ? (
                <button type="button" disabled className={buttonVariants({ variant: "secondary" })}>提交</button>
              ) : (
                <Link href={`/student/challenges/${challenge.id}/submit${routeQuery}`} className={buttonVariants()}>提交</Link>
              )}
            </>
          }
        />
      <CloudDesktop challenge={challenge} submission={submission} routeQuery={routeQuery} />
    </>
  );
}
