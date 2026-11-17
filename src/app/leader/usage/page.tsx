"use client";

import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { useDemo } from "@/lib/demo-store";
import { Button } from "@/components/ui/button";
import { CHALLENGES, CLASSROOM, TENANTS } from "@/lib/mock-data";
import { liveMinutes, sessionLimit, submissionOf, usedMinutes, visibleChallenges } from "@/lib/metrics";
import { formatMinutes } from "@/lib/utils";

export default function LeaderUsagePage() {
  const { state, requestSeats, requestUpdatePack, requestLocalCase, acceptLocalCase } = useDemo();
  const tenant = TENANTS.find((item) => item.primary)!;
  const used = usedMinutes(state);
  const ratio = Math.min(100, Math.round((used / (state.tenantQuotaHours * 60)) * 100));
  const remain = Math.max(0, state.tenantQuotaHours * 60 - used);
  const timeout = state.environment.timeoutMinutes;
  const consumption = visibleChallenges(state).map((challenge) => {
    const rows = CLASSROOM.studentIds
      .map((studentId) => submissionOf(state, studentId, challenge.id))
      .filter((item) => item && item.status !== "not_started");
    const minutes = rows.reduce((sum, item) => sum + (item?.desktopMinutes ?? 0), 0);
    const reclaimed = rows.filter(
      (item) =>
        item &&
        (item.status === "in_progress" || item.status === "returned") &&
        item.desktopMinutes >= sessionLimit(timeout, item.grantedMinutes),
    ).length;
    return { challenge, people: rows.length, minutes, reclaimed };
  });

  return (
    <>
      <PageHeader title="资源" />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="本班机时" value={formatMinutes(liveMinutes(state))} hint="学生开始或暂停模拟实操时，这里会变化。" />
        <MetricCard label="租户已用" value={formatMinutes(used)} hint={`额度 ${state.tenantQuotaHours} 小时，已用约 ${ratio}%。`} />
        <MetricCard label="并发额度" value={String(tenant.concurrent + (state.seatsConfirmed ? state.seatRequest : 0))} hint={state.seatsConfirmed ? `含已确认增购 ${state.seatRequest} 席` : "增购合同确认前，仍按基础并发。"} />
        <MetricCard label="环境状态" value={state.environment.maintenance ? "维护" : "可用"} hint={`${state.environment.version} · 单次回收 ${state.environment.timeoutMinutes ?? 40} 分钟`} />
      </section>
      <section className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="surface-card p-5">
          <h2 className="section-title">近 6 周机时趋势（Mock 基准 + 当前联动）</h2>
          <div className="mt-4 flex h-36 items-end gap-3">
            {[18, 27, 34, 29, 46, Math.max(8, Math.round(liveMinutes(state) / 60))].map((hours, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2"><span className="text-[10px] text-ink-muted">{hours}h</span><div className="w-full rounded-t bg-gradient-to-t from-tide to-tide-light" style={{ height: `${Math.min(100, hours * 2)}%` }} /><span className="text-[10px] text-ink-muted">W{index + 1}</span></div>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-soft">并发峰值 12/30 席（演示 Mock）；当前挑战机时按本地状态实时计算。</p>
        </article>
        <article className="surface-card p-5">
          <h2 className="section-title">版本与风险建议</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6">
            <li>镜像：{state.environment.imageId}</li>
            <li>运行时：{state.environment.contentRuntimeVersion} · 内容 {state.publishedChallengeIds.length} 项</li>
            <li>维护影响：{state.environment.maintenance ? "学生实操暂停，已提交成果仍可验收" : "无计划内维护影响"}</li>
            <li>{ratio >= 80 ? "额度利用较高，建议评估增购。" : "额度余量充足，暂不建议增购机时。"}</li>
            <li>{consumption.some((item) => item.reclaimed > 0) ? "存在桌面回收，建议核查阈值或授予延时。" : "暂未发现回收风险。"}</li>
          </ul>
        </article>
      </section>
      <div className="mt-6 h-3 overflow-hidden rounded-full bg-line" aria-hidden>
        <div className="h-full bg-tide" style={{ width: `${ratio}%` }} />
      </div>
      <p className="mt-3 text-sm text-ink-soft">合同额度还剩 {formatMinutes(remain)}。下表是本班按挑战汇总的消耗，不含学生个人操作明细。</p>
      <section className="mt-6 rounded-xl border border-line bg-paper p-5">
        <h2 className="section-title">本校正在消费的科来供给</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6">
          <li>云环境：{state.environment.version} · {state.environment.samplePack}</li>
          <li>已纳入课程包：{state.publishedChallengeIds.length} 项已发布挑战，基础并发 {tenant.concurrent} 席</li>
          <li>
            {state.updatePackConfirmed
              ? "年度更新包合同已确认，新挑战已进入课程包。"
              : `年度更新包尚未采购：${CHALLENGES.filter((item) => !state.publishedChallengeIds.includes(item.id)).map((item) => `「${item.title}」（${item.version}）不会进入本班`).join("；") || "当前没有待发布草稿"}`}
          </li>
          <li>
            {state.localCaseAccepted
              ? "学校已确认本地案例范围，科来单独制作，不进入现有挑战。"
              : state.localCaseQuoted
                ? "本地案例已收到科来报价，确认范围前不进入课程。"
                : state.localCaseRequested
                  ? "本地案例已登记，等待科来报价。"
                  : "尚未登记本地案例定制。"}
          </li>
        </ul>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={() => requestSeats(10)}>登记并发增购 10 席</Button>
          <Button variant="secondary" disabled={state.updatePackRequested} onClick={requestUpdatePack}>
            {state.updatePackRequested ? "年度更新包已登记" : "登记年度更新包"}
          </Button>
          <Button variant="secondary" disabled={state.localCaseRequested} onClick={requestLocalCase}>
            {state.localCaseRequested ? "本地案例已登记" : "登记本地案例定制"}
          </Button>
          {state.localCaseQuoted ? (
            <Button disabled={state.localCaseAccepted} onClick={acceptLocalCase}>
              {state.localCaseAccepted ? "案例范围已确认" : "确认案例范围"}
            </Button>
          ) : null}
          <p className="text-sm text-ink-soft">
            {state.seatRequest > 0
              ? state.seatsConfirmed
                ? `并发增购 ${state.seatRequest} 席已计入，当前并发 ${tenant.concurrent + state.seatRequest} 席。`
                : `已向科来登记并发增购 ${state.seatRequest} 席，基础并发仍是 ${tenant.concurrent}。合同确认前，学校自己不改额度。`
              : "还没有登记并发增购。机时不够时再向科来提出，不在校内直接改合同。"}
          </p>
        </div>
      </section>
      <ul className="mt-4 space-y-3">
        {consumption.map(({ challenge, people, minutes, reclaimed }) => (
          <li key={challenge.id} className="rounded-xl border border-line bg-paper p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-medium">{challenge.title}</h2>
              <p className="text-sm">{formatMinutes(minutes)}</p>
            </div>
            <p className="mt-1 text-sm text-ink-soft">
              {people} 人上机{reclaimed > 0 ? ` · ${reclaimed} 人已到回收线，机时仍计入额度` : " · 当前没有人到回收线"}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
