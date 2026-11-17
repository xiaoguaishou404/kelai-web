"use client";

import Link from "next/link";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";
import { CLASSROOM, TENANTS } from "@/lib/mock-data";
import { challengeRate, contentCatalog, contentReleaseChecks, isModuleHeld, usedMinutes } from "@/lib/metrics";
import { formatMinutes } from "@/lib/utils";

export default function OperatorHomePage() {
  const { state, quoteLocalCase } = useDemo();
  const catalog = contentCatalog(state);
  const draft = state.contentDrafts.c7;
  const releaseChecks = contentReleaseChecks(state, draft);
  const blockers = releaseChecks.filter((item) => !item.passed);
  const activeSchools = TENANTS.filter((item) => item.status === "active").length;
  const published = catalog.filter((item) => state.publishedChallengeIds.includes(item.id)).length;
  const heldReports = CLASSROOM.studentIds.filter((id) => isModuleHeld(state, id, "c6")).length;
  const heat = catalog
    .filter((item) => state.publishedChallengeIds.includes(item.id))
    .map((challenge) => {
      const rows = state.submissions.filter(
        (item) =>
          item.challengeId === challenge.id &&
          item.status !== "not_started" &&
          CLASSROOM.studentIds.includes(item.studentId),
      );
      return {
        challenge,
        people: rows.length,
        passed: challengeRate(state, challenge.id).passed,
        minutes: rows.reduce((sum, item) => sum + item.desktopMinutes, 0),
      };
    })
    .sort((a, b) => b.minutes - a.minutes || b.people - a.people);

  return (
    <>
      <PageHeader
        title="运营总览"
        action={<Link className={buttonVariants()} href="/operator/content">处理内容发布</Link>}
      />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="内容状态" value={`${published} 已发布`} hint={`${draft.stage === "draft" ? 1 : 0} 草稿 · ${draft.stage === "pending" ? 1 : 0} 待发布 · ${draft.stage === "offline" ? 1 : 0} 已下线`} />
        <MetricCard label="租户覆盖" value={`${activeSchools}/${TENANTS.length}`} hint={state.updatePackConfirmed ? "江城更新包已授权" : "江城更新包合同待确认"} />
        <MetricCard label="内容资产" value={`${catalog.length} 项`} hint="跨行业挑战、专家范本与配套教学资料" />
        <MetricCard label="额度与合同" value={`${state.tenantQuotaHours} 小时`} hint={`${formatMinutes(usedMinutes(state))} 已用 · ${blockers.length} 项发布阻断`} />
      </section>
      <section className="mt-6 rounded-xl border border-line bg-paper p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h2 className="section-title">发布闭环待办</h2><p className="mt-2 text-sm text-ink-soft">「{draft.title}」当前为 {draft.stage === "draft" ? "草稿" : draft.stage === "pending" ? "待发布" : draft.stage === "published" ? "已发布" : "已下线"}。</p></div>
          <Link href="/operator/content" className={buttonVariants({ variant: "secondary" })}>打开发布清单</Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Link href="/operator/content" className="rounded-lg bg-canvas p-4 text-sm"><span className="font-medium">校验</span><span className="mt-1 block text-xs text-ink-muted">{blockers.length ? `${blockers.length} 项未过` : draft.stage === "published" ? "已发布" : "可发布"}</span></Link>
          <Link href="/operator/tenants?from=overview" className="rounded-lg bg-canvas p-4 text-sm"><span className="font-medium">合同</span><span className="mt-1 block text-xs text-ink-muted">{state.updatePackConfirmed ? "已确认" : "待确认"}</span></Link>
          <Link href="/operator/content" className="rounded-lg bg-canvas p-4 text-sm"><span className="font-medium">发布</span><span className="mt-1 block text-xs text-ink-muted">{draft.stage === "published" ? "已发布" : draft.stage === "pending" ? "待发布" : draft.stage === "offline" ? "已下线" : "草稿"}</span></Link>
        </div>
      </section>
      {state.localCaseRequested ? (
        <div className="notice-warning mt-6 flex flex-wrap items-center justify-between gap-3">
          <p>
            {state.localCaseAccepted
              ? "学校已确认本地案例范围，进入单独制作。制作完成前不进入现有挑战清单。"
              : state.localCaseQuoted
                ? "本地案例已单独报价，等待学校确认范围。报价确认前不进入现有挑战清单。"
                : "江城理工登记了本地行业案例定制，需单独报价。案例做好前，不进入现有挑战清单。"}
          </p>
          <Button disabled={state.localCaseQuoted} onClick={quoteLocalCase}>
            {state.localCaseQuoted ? "报价已发出" : "发出单独报价"}
          </Button>
        </div>
      ) : null}
      <p className="mt-6 text-sm text-ink-muted">汇报未解锁 {heldReports}</p>
      <section className="mt-6 rounded-xl border border-line bg-paper p-5">
        <h2 className="section-title">使用</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {heat.map(({ challenge, people, passed, minutes }) => (
            <li key={challenge.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-2 first:border-0 first:pt-0">
              <span>{challenge.title}</span>
              <span className="text-ink-soft">{people} 人开始 · 通过 {passed} 人 · {formatMinutes(minutes)}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
