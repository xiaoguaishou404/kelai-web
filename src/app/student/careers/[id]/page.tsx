"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Clock3, MapPin, Route } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { CAREER_SOURCES, careerById, careerDetailOf } from "@/lib/career-market-data";
import { useDemo } from "@/lib/demo-store";
import { ABILITIES, DEMO_STUDENT_ID } from "@/lib/mock-data";
import {
  abilityScores,
  challengeForState,
  isChallengeOpen,
  isModuleHeld,
  jobFit,
  submissionOf,
} from "@/lib/metrics";
import { cn } from "@/lib/utils";

export default function CareerDetailPage() {
  const params = useParams<{ id: string }>();
  const { state } = useDemo();
  const career = careerById(params.id);

  if (!career) {
    return <EmptyState title="没有找到这个岗位" body="岗位样本可能已调整，请返回岗位地图重新选择。" />;
  }

  const detail = careerDetailOf(career);
  const scores = abilityScores(state, DEMO_STUDENT_ID);
  const fit = jobFit(state, DEMO_STUDENT_ID).find((item) => item.id === career.careerId);
  const sources = CAREER_SOURCES.filter((source) => career.sourceIds.includes(source.id));

  return (
    <>
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs text-ink-muted" aria-label="面包屑">
        <Link href="/student/careers" className="hover:text-tide">岗位地图</Link>
        <span>/</span>
        <span className="text-ink">{career.title}</span>
      </nav>

      <PageHeader
        title={career.title}
        meta={`${career.company} · ${career.track}`}
        action={
          <Link href="/student/careers" className={buttonVariants({ variant: "secondary" })}>
            <ArrowLeft size={15} /> 返回
          </Link>
        }
      />

      <Link href={`/student/careers/${career.id}/recruitment`} className="mb-6 flex items-center justify-between rounded-xl border border-line bg-paper px-4 py-3 text-sm hover:border-[#cfd3dc]">
        <span>招聘参考</span>
        <ArrowRight size={15} className="text-ink-muted" />
      </Link>
      <section className="mb-5 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <article className="surface-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-tide">岗位概览</p>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-ink-soft">{career.summary}</p>
            </div>
            {fit ? (
              <div className="rounded-lg bg-tide-mist px-4 py-3 text-center">
                <b className="numeric block text-2xl text-tide">{fit.fit}</b>
              <p className="text-xs text-ink-muted">契合</p>
              </div>
            ) : null}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-ink-soft">
            <span className="flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1.5"><Building2 size={13} />{career.company}</span>
            <span className="flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1.5"><MapPin size={13} />{career.locations.join(" / ")}</span>
            {career.skills.map((skill) => <span key={skill} className="rounded-full bg-canvas px-3 py-1.5">{skill}</span>)}
          </div>
          <div className="mt-5 rounded-lg border border-line bg-canvas p-4">
            <h2 className="text-sm font-medium">典型工作现场</h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{career.scenario}</p>
          </div>
        </article>

        <article className="surface-card p-5">
          <h2 className="section-title">能力匹配</h2>
          <div className="mt-4 space-y-3">
            {career.abilities.map((key) => {
              const ability = ABILITIES.find((item) => item.key === key);
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs"><span>{ability?.name}</span><span className="numeric">{scores[key]}</span></div>
                  <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-canvas">
                    <span className="block h-full rounded-full bg-tide" style={{ width: `${scores[key]}%` }} />
                  </span>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="mb-5 surface-card p-5">
        <div className="flex items-start gap-3">
          <Route className="mt-0.5 shrink-0 text-tide" size={20} />
          <div>
            <h2 className="section-title">学习路线</h2>
          </div>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {career.learningScenes.map((scene, index) => {
            const challenge = challengeForState(state, scene.challengeId);
            if (!challenge) return null;
            const submission = submissionOf(state, DEMO_STUDENT_ID, challenge.id);
            const held = isModuleHeld(state, DEMO_STUDENT_ID, challenge.id);
            const open = isChallengeOpen(state, challenge);
            const label = held
              ? "查看解锁条件"
              : submission?.status === "in_progress" || submission?.status === "returned"
                ? "继续任务"
                : submission?.status === "not_started"
                  ? "开始学习"
                  : "查看任务";
            return (
              <article key={scene.id} className="flex flex-col rounded-xl border border-line bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="numeric text-xs text-tide">场景 0{index + 1}</span>
                  {submission ? <StatusBadge status={submission.status} /> : null}
                </div>
                <h3 className="mt-3 font-medium">{scene.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{scene.summary}</p>
                <p className="mt-3 rounded-md bg-canvas px-3 py-2 text-xs leading-5 text-ink-soft">{scene.perspective}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-ink-muted">
                  <Clock3 size={13} />{challenge.minutes} 分钟 · {challenge.difficulty} · {challenge.required ? "必选" : "选配"}
                </div>
                <Link
                  href={`/student/challenges/${challenge.id}?career=${career.id}&scene=${scene.id}`}
                  aria-disabled={!open}
                  className={cn(buttonVariants(), "mt-4", !open && "pointer-events-none opacity-50")}
                >
                  {label} <ArrowRight size={15} />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "工作对象", items: detail.workObjects },
          { title: "典型一天", items: detail.typicalDay },
          { title: "核心职责", items: detail.responsibilities },
          { title: "能力要求", items: detail.requirements },
        ].map((group) => (
          <article key={group.title} className="surface-card p-5">
            <h2 className="text-sm font-medium">{group.title}</h2>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-ink-soft">
              {group.items.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 shrink-0 text-tide" size={14} />{item}</li>)}
            </ul>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <article className="surface-card p-5">
          <h2 className="section-title">成长路径</h2>
          <ol className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            {detail.growthPath.map((step, index) => (
              <li key={step} className="flex items-center gap-2 text-sm">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-tide-mist text-xs text-tide">{index + 1}</span>
                <span>{step}</span>
                {index < detail.growthPath.length - 1 ? <ArrowRight className="hidden text-ink-muted sm:block" size={14} /> : null}
              </li>
            ))}
          </ol>
        </article>
        <article className="surface-card p-5">
          <h2 className="section-title">信息边界与参考</h2>
          <p className="mt-2 text-xs leading-5 text-ink-soft">
            本页是基于公开产品能力与行业场景整理的教学 Mock，不是 {career.company} 的实时招聘启事；地点、岗位名称和学习路线仅用于岗位认知与能力训练。
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sources.map((source) => (
              <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                {source.label}
              </a>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
