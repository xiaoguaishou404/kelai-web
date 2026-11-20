"use client";

import { useState } from "react";
import { publishedJobs, type ResourceRights, type StandardProfile } from "@/lib/enterprise-workspace";
import {
  BuilderProps,
  Field,
  Footer,
  RightsFields,
  WizardSteps,
  defaultStandard,
  initialRights,
  rightsMissing,
  useResourceSave,
} from "./shared";

export function StandardBuilder({ resource, initial, notify, onClose }: BuilderProps & { initial?: StandardProfile }) {
  const { state, persist } = useResourceSave(resource);
  const jobs = publishedJobs(state);
  const [draft, setDraft] = useState<StandardProfile>(() => initial ?? defaultStandard(jobs[0]?.id ?? ""));
  const [rights, setRights] = useState<ResourceRights>(() => initialRights(resource, draft.id));
  const total = draft.abilityPointWeights.reduce((sum, item) => sum + item.weight, 0);
  const missing = [!draft.name.trim() ? "标准名称" : "", !draft.jobId ? "关联岗位" : "", total !== 100 ? "能力权重须为 100%" : "", ...rightsMissing(rights)].filter(Boolean);
  const save = (submit: boolean) => {
    if (submit && missing.length) return notify(missing.join("；"));
    persist({ kind: "standard", data: draft }, { name: draft.name || "未命名评价标准", description: "岗位能力等级与认定规则", relatedIds: [draft.jobId], packageId: "renewal", rights }, submit);
    notify(submit ? "评价标准已提交审核" : "评价标准草稿已保存");
    onClose();
  };
  return (
    <div className="ep-builder">
      <div className="ep-builder-head"><div><span>评价标准建设</span><h2>{draft.name || "新建评价标准"}</h2></div><button onClick={onClose}>关闭</button></div>
      <WizardSteps current={0} steps={["能力权重与认定规则", "提交"]} />
      <div className="ep-builder-body">
        <div className="ep-form-grid">
          <Field label="标准名称"><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field>
          <Field label="关联岗位"><select value={draft.jobId} onChange={(event) => setDraft({ ...draft, jobId: event.target.value })}><option value="">请选择</option>{jobs.map((job) => <option value={job.id} key={job.id}>{job.name}</option>)}</select></Field>
          <Field label="岗位认定规则" wide><textarea value={draft.recognitionRule} onChange={(event) => setDraft({ ...draft, recognitionRule: event.target.value })} /></Field>
        </div>
        <div className="ep-builder-list">
          <h3>能力点权重</h3>
          {draft.abilityPointWeights.map((item, index) => (
            <div className="ep-builder-item" key={item.id}>
              <span className="ep-number">{index + 1}</span><b>{item.name}</b>
              <input type="number" value={item.weight} onChange={(event) => setDraft({ ...draft, abilityPointWeights: draft.abilityPointWeights.map((point, current) => current === index ? { ...point, weight: Number(event.target.value) } : point) })} />
              <select value={item.level} onChange={(event) => setDraft({ ...draft, abilityPointWeights: draft.abilityPointWeights.map((point, current) => current === index ? { ...point, level: event.target.value } : point) })}>{["L1", "L2", "L3", "L4", "L5"].map((level) => <option key={level}>{level}</option>)}</select>
            </div>
          ))}
          <p className={total === 100 ? "ep-status ok" : "ep-status warn"}>权重合计 {total}%</p>
        </div>
        <RightsFields rights={rights} onChange={setRights} />
      </div>
      <Footer current={0} max={0} canSubmit={!missing.length} missing={missing} onBack={() => {}} onNext={() => {}} onDraft={() => save(false)} onSubmit={() => save(true)} />
    </div>
  );
}
