"use client";

import type { ReactNode } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Send } from "lucide-react";
import {
  createResourceRights,
  dimensions,
  effectiveRightsStatus,
  nowLabel,
  type AssessmentProfile,
  type CourseProfile,
  type JobProfile,
  type Resource,
  type ResourceContent,
  type ResourceRights,
  type ResourceUseScope,
  type SceneProfile,
  type SceneTaskDetail,
  type StandardProfile,
} from "@/lib/enterprise-workspace";
import { useWorkspace } from "@/components/enterprise/workspace-store";

export type BuilderProps = {
  resource?: Resource;
  notify: (message: string) => void;
  onClose: () => void;
};

export function uid(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export function defaultJob(): JobProfile {
  return {
    id: uid("job"),
    code: `KL-GW-${String(Date.now()).slice(-4)}`,
    name: "",
    category: "网络分析",
    stage: "技术服务",
    industry: "金融",
    description: "",
    majors: ["网络工程"],
    majorGroupIds: [],
    responsibilities: [],
    requirements: [],
    certificates: [],
    skills: [],
    target: [70, 70, 75, 80, 60, 75],
    requiredDimensions: [3, 5],
    tasks: [],
    abilityPoints: dimensions.map((name, index) => ({
      id: `ability-${index}`,
      name,
      domain: name,
      dimension: index,
      level: index === 3 || index === 5 ? "L4" : "L3",
      weight: [15, 15, 20, 25, 10, 15][index],
    })),
    sceneIds: [],
    courseIds: [],
    assessmentIds: [],
    standardIds: [],
    buildMode: "校企共建",
    schoolIds: ["school-1"],
  };
}

export function defaultScene(jobId = ""): SceneProfile {
  return {
    id: uid("scene"),
    name: "",
    industry: "金融",
    jobId,
    difficulty: "进阶",
    description: "",
    required: false,
    tasks: [],
    evidence: [],
    answer: "",
    abilityWeights: [0, 0.15, 0.2, 0.5, 0, 0.15],
    courseIds: [],
  };
}

export function createSceneTask(
  id: string,
  title: string,
  index: number,
  abilityPointIds: string[],
): SceneTaskDetail {
  const type: SceneTaskDetail["type"] = index === 0 || index === 1 ? "训练" : index === 2 ? "测评" : "复盘";
  return {
    id,
    title,
    description: "补充任务背景、输入材料和交付要求。",
    type,
    minutes: type === "测评" ? 30 : 25,
    goal: `完成“${title}”，形成可复核的过程记录与成果。`,
    evidenceIds: [],
    resources: [],
    abilityPointIds,
    weight: 0,
    required: true,
    requiredEvidenceIds: [],
    deliverable:
      type === "训练" ? "任务过程记录" : type === "测评" ? "判断结果与依据" : "复盘报告",
    rubric: [
      { id: "evidence", label: type === "测评" ? "判断准确性" : "证据与过程", description: "材料、记录和结论能够相互印证。", weight: 40 },
      { id: "reasoning", label: "方法运用", description: "能够按任务要求完成分析和推理。", weight: 40 },
      { id: "delivery", label: "交付表达", description: "成果结构清晰，边界和下一步说明完整。", weight: 20 },
    ],
    deliveryMode: "混合",
    assessmentMethods: [
      { id: "quiz", type: "随堂测", title: "随堂测", description: "即时检测关键知识。", mode: "线上", weight: 30, required: true, passScore: 60 },
      { id: "work", type: "作品评审", title: "任务成果评审", description: "教师对任务成果进行评价。", mode: "混合", weight: 50, required: true, passScore: 60 },
      { id: "defense", type: "现场答辩", title: "现场答辩", description: "完成现场说明与追问。", mode: "线下", weight: 20, required: false, passScore: 60 },
    ],
  };
}

export function defaultCourse(jobId = "", sceneId = ""): CourseProfile {
  return {
    id: uid("course"),
    name: "",
    jobId,
    sceneId,
    courseType: "体系课",
    totalHours: 12,
    abilityPointIds: [],
    chapters: [],
  };
}

export function defaultAssessment(jobId = "", standardId = ""): AssessmentProfile {
  return {
    id: uid("assessment"),
    name: "",
    code: `KL-AS-${String(Date.now()).slice(-4)}`,
    jobId,
    standardId,
    durationMinutes: 30,
    passScore: 80,
    questions: [],
  };
}

export function defaultStandard(jobId = ""): StandardProfile {
  return {
    id: uid("standard"),
    name: "",
    code: `KL-ST-${String(Date.now()).slice(-4)}`,
    jobId,
    abilityPointWeights: dimensions.map((name, index) => ({
      id: uid("point"),
      name,
      weight: [15, 15, 20, 25, 10, 15][index],
      level: "L3",
    })),
    levelBands: [
      { level: "未达标", min: 0, max: 59 },
      { level: "L1", min: 60, max: 69 },
      { level: "L2", min: 70, max: 79 },
      { level: "L3", min: 80, max: 89 },
      { level: "L4", min: 90, max: 100 },
    ],
    recognitionRule: "核心能力达到岗位要求，并通过关联场景测评。",
    evidenceWeight: 40,
    reasoningWeight: 40,
    deliveryWeight: 20,
    passScore: 60,
    goodScore: 80,
    excellentScore: 90,
  };
}

export function lines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

export function comma(value: string) {
  return value.split(/[，,]/).map((item) => item.trim()).filter(Boolean);
}

const rightsScopes: ResourceUseScope[] = ["教学使用", "实训交付", "项目展示", "招聘引用"];

export function initialRights(resource: Resource | undefined, id: string): ResourceRights {
  return resource?.rights ?? {
    ...createResourceRights(id),
    agreementNo: "",
    evidenceName: "",
    status: "待确权",
    history: [],
  };
}

export function rightsMissing(rights: ResourceRights) {
  return [
    !rights.ownerName.trim() ? "权属人" : "",
    !rights.sourceNote.trim() ? "来源说明" : "",
    !rights.desensitizationNote.trim() && rights.ownership === "客户授权" ? "脱敏说明" : "",
    !rights.agreementNo.trim() ? "协议或授权编号" : "",
    !rights.evidenceName.trim() ? "权属材料" : "",
    !rights.useScopes.length ? "使用范围" : "",
    !rights.validFrom || !rights.validUntil ? "有效期" : "",
  ].filter(Boolean);
}

export function RightsFields({
  rights,
  onChange,
}: {
  rights: ResourceRights;
  onChange: (rights: ResourceRights) => void;
}) {
  const update = (patch: Partial<ResourceRights>) =>
    onChange({ ...rights, ...patch, status: "待确权", reviewNote: "" });
  const toggleScope = (scope: ResourceUseScope) => {
    update({
      useScopes: rights.useScopes.includes(scope)
        ? rights.useScopes.filter((item) => item !== scope)
        : [...rights.useScopes, scope],
    });
  };
  return (
    <div className="ep-rights-form">
      <div className="ep-rights-head">
        <div><h3>权属与合规</h3><small>{effectiveRightsStatus(rights)}</small></div>
        {rights.status === "已确权" && <span className="ep-tag is-success">已确权</span>}
      </div>
      <div className="ep-form-grid">
        <label className="ep-form">权属类型
          <select value={rights.ownership} onChange={(event) => update({ ownership: event.target.value as ResourceRights["ownership"] })}>
            {["科来自有", "客户授权", "校企共建", "公开资料改编"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="ep-form">权属人<input value={rights.ownerName} onChange={(event) => update({ ownerName: event.target.value })} /></label>
        <label className="ep-form wide">来源说明<textarea value={rights.sourceNote} onChange={(event) => update({ sourceNote: event.target.value })} /></label>
        <label className="ep-form wide">脱敏说明<textarea value={rights.desensitizationNote} onChange={(event) => update({ desensitizationNote: event.target.value })} /></label>
        <label className="ep-form">协议 / 授权编号<input value={rights.agreementNo} onChange={(event) => update({ agreementNo: event.target.value })} placeholder="如 KL-RIGHTS-2026-001" /></label>
        <label className="ep-form">权属材料<input value={rights.evidenceName} onChange={(event) => update({ evidenceName: event.target.value })} placeholder="模拟文件名" /></label>
        <label className="ep-form">生效日期<input type="date" value={rights.validFrom} onChange={(event) => update({ validFrom: event.target.value })} /></label>
        <label className="ep-form">有效期至<input type="date" value={rights.validUntil} onChange={(event) => update({ validUntil: event.target.value })} /></label>
      </div>
      <div className="ep-rights-scopes">
        <span>使用范围</span>
        {rightsScopes.map((scope) => <label key={scope}><input type="checkbox" checked={rights.useScopes.includes(scope)} onChange={() => toggleScope(scope)} />{scope}</label>)}
      </div>
      {rights.reviewNote && <p className="ep-status warn">{rights.reviewNote}</p>}
    </div>
  );
}

export function Field({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return <label className={"ep-form" + (wide ? " wide" : "")}>{label}{children}</label>;
}

export function WizardSteps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="ep-wizard-steps">
      {steps.map((step, index) => (
        <span className={index === current ? "active" : index < current ? "done" : ""} key={step}>
          <i>{index < current ? <CheckCircle2 size={13} /> : index + 1}</i>{step}
        </span>
      ))}
    </div>
  );
}

export function Footer({
  current,
  max,
  canSubmit,
  missing,
  onBack,
  onNext,
  onDraft,
  onSubmit,
}: {
  current: number;
  max: number;
  canSubmit: boolean;
  missing: string[];
  onBack: () => void;
  onNext: () => void;
  onDraft: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="ep-wizard-footer">
      <button className="ep-button secondary" onClick={onDraft}>保存草稿</button>
      {missing.length > 0 && <span className="ep-missing">{missing.join(" · ")}</span>}
      <span className="ep-grow" />
      <button className="ep-button secondary" disabled={current === 0} onClick={onBack}><ChevronLeft size={15} />上一步</button>
      {current < max
        ? <button className="ep-button" onClick={onNext}>下一步<ChevronRight size={15} /></button>
        : <button className="ep-button" disabled={!canSubmit} title={missing.join("；")} onClick={onSubmit}><Send size={15} />提交审核</button>}
    </div>
  );
}

export function useResourceSave(resource?: Resource) {
  const { state, createResource, updateResource, resourceAction } = useWorkspace();
  const persist = (
    content: ResourceContent,
    meta: { name: string; description: string; relatedIds: string[]; rights: ResourceRights },
    submit: boolean,
  ) => {
    const status = "草稿" as const;
    if (resource) {
      updateResource(resource.id, { ...meta, draftContent: content }, "科来运营");
      if (submit) resourceAction(resource.id, "submit");
      return resource.id;
    }
    const id = content.data.id;
    createResource({
      id,
      ...meta,
      type: content.kind === "job" ? "岗位" : content.kind === "scene" ? "场景" : content.kind === "course" ? "课程" : content.kind === "assessment" ? "测评" : "评价标准",
      status,
      version: "V1.0",
      updatedAt: nowLabel(),
      draftContent: content,
      rights: {
        ...meta.rights,
        status: "待确权",
        reviewNote: "",
      },
      reviewHistory: [],
    });
    if (submit) resourceAction(id, "submit");
    return id;
  };
  return { state, persist };
}

export function ResourceChecks({ title, items, selected, onChange }: { title: string; items: [string, string][]; selected: string[]; onChange: (value: string[]) => void }) {
  return <div className="ep-resource-checks"><h3>{title}</h3>{items.length === 0 ? <p>暂无可关联资源</p> : items.map(([id, name]) => <label key={id}><input type="checkbox" checked={selected.includes(id)} onChange={(event) => onChange(event.target.checked ? [...selected, id] : selected.filter((item) => item !== id))} />{name}</label>)}</div>;
}
