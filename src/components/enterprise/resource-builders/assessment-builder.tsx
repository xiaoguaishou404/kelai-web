"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  publishedJobs,
  publishedStandards,
  type AssessmentProfile,
  type ResourceRights,
} from "@/lib/enterprise-workspace";
import {
  BuilderProps,
  Field,
  Footer,
  RightsFields,
  WizardSteps,
  defaultAssessment,
  initialRights,
  rightsMissing,
  uid,
  useResourceSave,
} from "./shared";

export function AssessmentBuilder({ resource, initial, notify, onClose }: BuilderProps & { initial?: AssessmentProfile }) {
  const { state, persist } = useResourceSave(resource);
  const jobs = publishedJobs(state);
  const standards = publishedStandards(state);
  const [draft, setDraft] = useState<AssessmentProfile>(() => initial ?? defaultAssessment(jobs[0]?.id ?? "", standards[0]?.id ?? ""));
  const [rights, setRights] = useState<ResourceRights>(() => initialRights(resource, draft.id));
  const [question, setQuestion] = useState({ title: "", optionA: "", optionB: "" });
  const missing = [!draft.name.trim() ? "测评名称" : "", !draft.jobId ? "关联岗位" : "", draft.questions.length === 0 ? "测评题目" : "", ...rightsMissing(rights)].filter(Boolean);
  const save = (submit: boolean) => {
    if (submit && missing.length) return notify(missing.join("；"));
    persist({ kind: "assessment", data: draft }, { name: draft.name || "未命名测评", description: `${draft.questions.length} 题 · ${draft.passScore} 分合格`, relatedIds: [draft.jobId, draft.standardId ?? ""].filter(Boolean), rights }, submit);
    notify(submit ? "测评已提交审核" : "测评草稿已保存");
    onClose();
  };
  return (
    <div className="ep-builder">
      <div className="ep-builder-head"><div><span>测评资源建设</span><h2>{draft.name || "新建测评"}</h2></div><button onClick={onClose}>关闭</button></div>
      <WizardSteps current={0} steps={["测评信息与题目", "提交"]} />
      <div className="ep-builder-body">
        <div className="ep-form-grid">
          <Field label="测评名称"><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field>
          <Field label="关联岗位"><select value={draft.jobId} onChange={(event) => setDraft({ ...draft, jobId: event.target.value })}><option value="">请选择</option>{jobs.map((job) => <option value={job.id} key={job.id}>{job.name}</option>)}</select></Field>
          <Field label="评价标准"><select value={draft.standardId ?? ""} onChange={(event) => setDraft({ ...draft, standardId: event.target.value })}>{standards.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></Field>
          <Field label="时长（分钟）"><input type="number" value={draft.durationMinutes} onChange={(event) => setDraft({ ...draft, durationMinutes: Number(event.target.value) })} /></Field>
          <Field label="合格线"><input type="number" value={draft.passScore} onChange={(event) => setDraft({ ...draft, passScore: Number(event.target.value) })} /></Field>
        </div>
        <div className="ep-builder-list">
          <h3>题目</h3>
          {draft.questions.map((item, index) => (
            <div className="ep-builder-item" key={item.id}>
              <span className="ep-number">{index + 1}</span><b>{item.title}</b><span>{item.options.join(" / ")}</span>
              <button onClick={() => setDraft({ ...draft, questions: draft.questions.filter((question) => question.id !== item.id) })}><Trash2 size={15} /></button>
            </div>
          ))}
          <div className="ep-form-grid">
            <Field label="题干" wide><input value={question.title} onChange={(event) => setQuestion({ ...question, title: event.target.value })} /></Field>
            <Field label="正确选项"><input value={question.optionA} onChange={(event) => setQuestion({ ...question, optionA: event.target.value })} /></Field>
            <Field label="干扰选项"><input value={question.optionB} onChange={(event) => setQuestion({ ...question, optionB: event.target.value })} /></Field>
            <button className="ep-add-row" onClick={() => {
              if (!question.title || !question.optionA || !question.optionB) return notify("请填写完整题目");
              setDraft({ ...draft, questions: [...draft.questions, { id: uid("q"), title: question.title, options: [question.optionA, question.optionB], answer: 0 }] });
              setQuestion({ title: "", optionA: "", optionB: "" });
            }}><Plus size={15} />添加题目</button>
          </div>
        </div>
        <RightsFields rights={rights} onChange={setRights} />
      </div>
      <Footer current={0} max={0} canSubmit={!missing.length} missing={missing} onBack={() => {}} onNext={() => {}} onDraft={() => save(false)} onSubmit={() => save(true)} />
    </div>
  );
}
