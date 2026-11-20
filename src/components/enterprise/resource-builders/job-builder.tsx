"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  dimensions,
  publishedAssessments,
  publishedCourses,
  publishedScenes,
  publishedStandards,
  type JobProfile,
  type ResourceContent,
  type ResourceRights,
} from "@/lib/enterprise-workspace";
import {
  BuilderProps,
  Field,
  Footer,
  ResourceChecks,
  RightsFields,
  WizardSteps,
  comma,
  defaultJob,
  initialRights,
  lines,
  rightsMissing,
  uid,
  useResourceSave,
} from "./shared";

export function JobBuilder({ resource, initial, notify, onClose }: BuilderProps & { initial?: JobProfile }) {
  const { state, persist } = useResourceSave(resource);
  const [draft, setDraft] = useState<JobProfile>(() => initial ?? defaultJob());
  const [rights, setRights] = useState<ResourceRights>(() => initialRights(resource, draft.id));
  const [step, setStep] = useState(0);
  const [responsibilities, setResponsibilities] = useState((draft.responsibilities ?? []).join("\n"));
  const [requirements, setRequirements] = useState((draft.requirements ?? []).join("\n"));
  const [skills, setSkills] = useState((draft.skills ?? []).join("，"));
  const scenes = publishedScenes(state);
  const courses = publishedCourses(state);
  const assessments = publishedAssessments(state);
  const standards = publishedStandards(state);
  const missing = [
    !draft.name.trim() ? "岗位名称" : "",
    !draft.description.trim() ? "岗位简介" : "",
    !lines(responsibilities).length ? "岗位职责" : "",
    !(draft.majorGroupIds ?? []).length ? "适配专业群" : "",
    !(draft.tasks ?? []).length ? "工作任务" : "",
    (draft.abilityPoints ?? []).reduce((sum, item) => sum + item.weight, 0) !== 100 ? "能力权重须为 100%" : "",
    ...rightsMissing(rights),
  ].filter(Boolean);
  const content = (): ResourceContent => ({
    kind: "job",
    data: {
      ...draft,
      responsibilities: lines(responsibilities),
      requirements: lines(requirements),
      skills: comma(skills),
    } as JobProfile,
  });
  const save = (submit: boolean) => {
    if (submit && missing.length) return notify(missing.join("；"));
    persist(content(), {
      name: draft.name || "未命名岗位",
      description: draft.description || "岗位草稿待完善",
      relatedIds: [...(draft.sceneIds ?? []), ...(draft.courseIds ?? []), ...(draft.assessmentIds ?? []), ...(draft.standardIds ?? [])],
      packageId: "renewal",
      rights,
    }, submit);
    notify(submit ? "岗位已提交审核" : "岗位草稿已保存");
    onClose();
  };
  return (
    <div className="ep-builder">
      <div className="ep-builder-head"><div><span>岗位资源建设</span><h2>{draft.name || "新建岗位"}</h2><small>{draft.code}</small></div><button onClick={onClose}>关闭</button></div>
      <WizardSteps current={step} steps={["基础信息", "工作任务", "能力模型", "关联资源", "提交"]} />
      <div className="ep-builder-body">
        {step === 0 && <div className="ep-form-grid">
          <Field label="岗位名称"><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="如：网络性能诊断工程师" /></Field>
          <Field label="岗位编码"><input value={draft.code ?? ""} readOnly /></Field>
          <Field label="所属行业"><select value={draft.industry} onChange={(event) => setDraft({ ...draft, industry: event.target.value })}>{["金融", "能源", "医疗", "制造", "政务", "运营商"].map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="产业链阶段"><select value={draft.stage} onChange={(event) => setDraft({ ...draft, stage: event.target.value })}>{["采集基础设施", "分析研判", "技术服务"].map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="面向专业" wide><input value={(draft.majors ?? []).join("，")} onChange={(event) => setDraft({ ...draft, majors: comma(event.target.value) })} /></Field>
          <div className="wide"><ResourceChecks title="适配专业群" items={state.majorGroups.map((item) => [item.id, item.name])} selected={draft.majorGroupIds ?? []} onChange={(majorGroupIds) => setDraft({ ...draft, majorGroupIds })} /></div>
          <Field label="岗位简介" wide><textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></Field>
          <Field label="岗位职责（每行一项）" wide><textarea value={responsibilities} onChange={(event) => setResponsibilities(event.target.value)} /></Field>
          <Field label="任职要求（每行一项）" wide><textarea value={requirements} onChange={(event) => setRequirements(event.target.value)} /></Field>
          <Field label="核心技能（逗号分隔）" wide><input value={skills} onChange={(event) => setSkills(event.target.value)} /></Field>
          <Field label="关联证书" wide><input value={(draft.certificates ?? []).join("，")} onChange={(event) => setDraft({ ...draft, certificates: comma(event.target.value) })} /></Field>
        </div>}
        {step === 1 && <div className="ep-builder-list">
          {(draft.tasks ?? []).map((task, index) => <div className="ep-builder-item" key={task.id}>
            <span className="ep-number">{index + 1}</span>
            <input value={task.name} onChange={(event) => setDraft({ ...draft, tasks: (draft.tasks ?? []).map((item) => item.id === task.id ? { ...item, name: event.target.value } : item) })} placeholder="工作任务名称" />
            <input value={task.description} onChange={(event) => setDraft({ ...draft, tasks: (draft.tasks ?? []).map((item) => item.id === task.id ? { ...item, description: event.target.value } : item) })} placeholder="任务说明" />
            <button onClick={() => setDraft({ ...draft, tasks: (draft.tasks ?? []).filter((item) => item.id !== task.id) })}><Trash2 size={15} /></button>
          </div>)}
          <button className="ep-add-row" onClick={() => setDraft({ ...draft, tasks: [...(draft.tasks ?? []), { id: uid("task"), name: "", description: "", abilityPointIds: [] }] })}><Plus size={15} />新增工作任务</button>
        </div>}
        {step === 2 && <div className="ep-form-grid">
          {dimensions.map((name, index) => <div className="ep-capacity-row wide" key={name}>
            <b>{name}</b>
            <label>目标分值<input type="number" min="0" max="100" value={draft.target[index]} onChange={(event) => setDraft({ ...draft, target: draft.target.map((value, current) => current === index ? Number(event.target.value) : value) })} /></label>
            <label>能力点权重<input type="number" min="0" max="100" value={draft.abilityPoints?.[index]?.weight ?? 0} onChange={(event) => setDraft({ ...draft, abilityPoints: (draft.abilityPoints ?? []).map((item, current) => current === index ? { ...item, weight: Number(event.target.value) } : item) })} /></label>
            <label className="ep-check"><input type="checkbox" checked={draft.requiredDimensions.includes(index)} onChange={(event) => setDraft({ ...draft, requiredDimensions: event.target.checked ? [...draft.requiredDimensions, index] : draft.requiredDimensions.filter((item) => item !== index) })} />核心能力</label>
          </div>)}
          <p className={draft.abilityPoints?.reduce((sum, item) => sum + item.weight, 0) === 100 ? "ep-status ok wide" : "ep-status warn wide"}>能力权重合计 {draft.abilityPoints?.reduce((sum, item) => sum + item.weight, 0) ?? 0}%</p>
        </div>}
        {step === 3 && <div className="ep-builder-relations">
          <ResourceChecks title="关联场景" items={scenes.map((item) => [item.id, item.name])} selected={draft.sceneIds ?? []} onChange={(sceneIds) => setDraft({ ...draft, sceneIds })} />
          <ResourceChecks title="关联课程" items={courses.map((item) => [item.id, item.name])} selected={draft.courseIds ?? []} onChange={(courseIds) => setDraft({ ...draft, courseIds })} />
          <ResourceChecks title="关联测评" items={assessments.map((item) => [item.id, item.name])} selected={draft.assessmentIds ?? []} onChange={(assessmentIds) => setDraft({ ...draft, assessmentIds })} />
          <ResourceChecks title="关联评价标准" items={standards.map((item) => [item.id, item.name])} selected={draft.standardIds ?? []} onChange={(standardIds) => setDraft({ ...draft, standardIds })} />
        </div>}
        {step === 4 && <div className="ep-submit-summary">
          <div><span>岗位</span><b>{draft.name || "未填写"}</b></div><div><span>工作任务</span><b>{draft.tasks?.length ?? 0} 项</b></div><div><span>能力权重</span><b>{draft.abilityPoints?.reduce((sum, item) => sum + item.weight, 0) ?? 0}%</b></div><div><span>关联场景</span><b>{draft.sceneIds?.length ?? 0} 个</b></div><div><span>关联课程</span><b>{draft.courseIds?.length ?? 0} 门</b></div><div><span>建设方式</span><b>{draft.buildMode}</b></div>
          <label className="ep-form">建设方式<select value={draft.buildMode} onChange={(event) => setDraft({ ...draft, buildMode: event.target.value as JobProfile["buildMode"] })}><option>独立建设</option><option>校企共建</option></select></label>
          <label className="ep-form">可见范围<select><option>年度更新包 · 授权院校</option><option>发布后全平台可见</option></select></label>
          <RightsFields rights={rights} onChange={setRights} />
          <p className="ep-status warn">岗位发布后若没有场景或课程，会标记为“学习路径待完善”，暂不可被短训、项目和招聘选择。</p>
        </div>}
      </div>
      <Footer current={step} max={4} canSubmit={!missing.length} missing={missing} onBack={() => setStep(Math.max(0, step - 1))} onNext={() => setStep(Math.min(4, step + 1))} onDraft={() => save(false)} onSubmit={() => save(true)} />
    </div>
  );
}
