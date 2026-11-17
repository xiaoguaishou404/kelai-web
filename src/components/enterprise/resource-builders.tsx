"use client";

import { useState, type ReactNode } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Plus, Send, Trash2 } from "lucide-react";
import {
  dimensions,
  jobMatch,
  nowLabel,
  publishedAssessments,
  publishedCourses,
  publishedJobs,
  publishedScenes,
  publishedStandards,
  trainings,
  type AssessmentProfile,
  type CourseProfile,
  type EnterpriseWorkspaceState,
  type JobProfile,
  type Resource,
  type ResourceContent,
  type ResourceType,
  type SceneProfile,
  type StandardProfile,
} from "@/lib/enterprise-workspace";
import { useWorkspace } from "@/components/enterprise/workspace-store";

type BuilderProps = {
  resource?: Resource;
  notify: (message: string) => void;
  onClose: () => void;
};

function uid(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function defaultJob(): JobProfile {
  return {
    id: uid("job"),
    code: `KL-GW-${String(Date.now()).slice(-4)}`,
    name: "",
    category: "网络分析",
    stage: "技术服务",
    industry: "金融",
    description: "",
    majors: ["网络工程"],
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

function defaultScene(jobId = ""): SceneProfile {
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
    trainingIds: [],
  };
}

function defaultCourse(jobId = "", sceneId = ""): CourseProfile {
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

function defaultAssessment(jobId = "", standardId = ""): AssessmentProfile {
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

function defaultStandard(jobId = ""): StandardProfile {
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

function lines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function comma(value: string) {
  return value.split(/[，,]/).map((item) => item.trim()).filter(Boolean);
}

function Field({
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

function WizardSteps({ steps, current }: { steps: string[]; current: number }) {
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

function Footer({
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

export function ResourceBuilder(props: BuilderProps & { kind?: ResourceType }) {
  const content = props.resource?.draftContent;
  const kind = content?.kind ?? (
    props.kind === "场景" ? "scene" :
      props.kind === "课程" ? "course" :
        props.kind === "测评" ? "assessment" :
          props.kind === "评价标准" ? "standard" : "job"
  );
  if (kind === "job") return <JobBuilder {...props} initial={content?.kind === "job" ? content.data : undefined} />;
  if (kind === "scene") return <SceneBuilder {...props} initial={content?.kind === "scene" ? content.data : undefined} />;
  if (kind === "course") return <CourseBuilder {...props} initial={content?.kind === "course" ? content.data : undefined} />;
  if (kind === "assessment") return <AssessmentBuilder {...props} initial={content?.kind === "assessment" ? content.data : undefined} />;
  return <StandardBuilder {...props} initial={content?.kind === "standard" ? content.data : undefined} />;
}

function useResourceSave(resource?: Resource) {
  const { state, createResource, updateResource, resourceAction } = useWorkspace();
  const persist = (
    content: ResourceContent,
    meta: { name: string; description: string; relatedIds: string[]; packageId: string },
    submit: boolean,
  ) => {
    const status = submit ? "待审核" as const : "草稿" as const;
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
      authorizedTo: [],
      updatedAt: nowLabel(),
      draftContent: content,
      reviewHistory: submit
        ? [{ id: crypto.randomUUID(), action: "提交审核", actor: "科来运营", note: "资源建设完成并提交审核", at: nowLabel() }]
        : [],
    });
    return id;
  };
  return { state, persist };
}

function JobBuilder({ resource, initial, notify, onClose }: BuilderProps & { initial?: JobProfile }) {
  const { state, persist } = useResourceSave(resource);
  const [draft, setDraft] = useState<JobProfile>(() => initial ?? defaultJob());
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
    !(draft.tasks ?? []).length ? "工作任务" : "",
    (draft.abilityPoints ?? []).reduce((sum, item) => sum + item.weight, 0) !== 100 ? "能力权重须为 100%" : "",
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
          <p className="ep-status warn">岗位发布后若没有场景或课程，会标记为“学习路径待完善”，暂不可被短训、项目和招聘选择。</p>
        </div>}
      </div>
      <Footer current={step} max={4} canSubmit={!missing.length} missing={missing} onBack={() => setStep(Math.max(0, step - 1))} onNext={() => setStep(Math.min(4, step + 1))} onDraft={() => save(false)} onSubmit={() => save(true)} />
    </div>
  );
}

function ResourceChecks({ title, items, selected, onChange }: { title: string; items: [string, string][]; selected: string[]; onChange: (value: string[]) => void }) {
  return <div className="ep-resource-checks"><h3>{title}</h3>{items.length === 0 ? <p>暂无可关联资源</p> : items.map(([id, name]) => <label key={id}><input type="checkbox" checked={selected.includes(id)} onChange={(event) => onChange(event.target.checked ? [...selected, id] : selected.filter((item) => item !== id))} />{name}</label>)}</div>;
}

function SceneBuilder({ resource, initial, notify, onClose }: BuilderProps & { initial?: SceneProfile }) {
  const { state, persist } = useResourceSave(resource);
  const jobs = publishedJobs(state);
  const [draft, setDraft] = useState<SceneProfile>(() => initial ?? defaultScene(jobs[0]?.id ?? ""));
  const [step, setStep] = useState(0);
  const missing = [!draft.name.trim() ? "场景名称" : "", !draft.jobId ? "所属岗位" : "", !draft.description.trim() ? "场景背景" : "", draft.tasks.length === 0 ? "任务链" : "", draft.evidence.length < 3 ? "至少三条证据" : ""].filter(Boolean);
  const save = (submit: boolean) => {
    if (submit && missing.length) return notify(missing.join("；"));
    persist({ kind: "scene", data: draft }, { name: draft.name || "未命名场景", description: draft.description || "场景草稿待完善", relatedIds: [draft.jobId], packageId: "renewal" }, submit);
    notify(submit ? "场景已提交审核" : "场景草稿已保存");
    onClose();
  };
  return <div className="ep-builder"><div className="ep-builder-head"><div><span>场景资源建设</span><h2>{draft.name || "新建场景"}</h2></div><button onClick={onClose}>关闭</button></div><WizardSteps current={step} steps={["基础信息", "任务链与量规", "提交"]} /><div className="ep-builder-body">
    {step === 0 && <div className="ep-form-grid"><Field label="场景名称"><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field><Field label="所属岗位"><select value={draft.jobId} onChange={(event) => setDraft({ ...draft, jobId: event.target.value })}><option value="">请选择</option>{jobs.map((job) => <option value={job.id} key={job.id}>{job.name}</option>)}</select></Field><Field label="难度"><select value={draft.difficulty} onChange={(event) => setDraft({ ...draft, difficulty: event.target.value })}><option>基础</option><option>进阶</option><option>综合</option></select></Field><Field label="归属短训"><select value={draft.trainingIds[0] ?? ""} onChange={(event) => setDraft({ ...draft, trainingIds: event.target.value ? [event.target.value] : [] })}><option value="">暂不关联</option>{trainings.map((training) => <option value={training.id} key={training.id}>{training.name}</option>)}</select></Field><Field label="场景介绍" wide><textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></Field><Field label="专家参考答案" wide><textarea value={draft.answer} onChange={(event) => setDraft({ ...draft, answer: event.target.value })} /></Field></div>}
    {step === 1 && <div className="ep-builder-list">{draft.tasks.map((task, index) => <div className="ep-builder-item" key={`${task}-${index}`}><span className="ep-number">{index + 1}</span><input value={task} onChange={(event) => setDraft({ ...draft, tasks: draft.tasks.map((item, current) => current === index ? event.target.value : item) })} /><button onClick={() => setDraft({ ...draft, tasks: draft.tasks.filter((_, current) => current !== index) })}><Trash2 size={15} /></button></div>)}<button className="ep-add-row" onClick={() => setDraft({ ...draft, tasks: [...draft.tasks, ""] })}><Plus size={15} />新增任务</button><h3>可观测证据</h3>{draft.evidence.map((item, index) => <div className="ep-builder-item" key={item.id}><span className="ep-number">{index + 1}</span><input value={item.title} onChange={(event) => setDraft({ ...draft, evidence: draft.evidence.map((evidence, current) => current === index ? { ...evidence, title: event.target.value } : evidence) })} /><input value={item.detail} onChange={(event) => setDraft({ ...draft, evidence: draft.evidence.map((evidence, current) => current === index ? { ...evidence, detail: event.target.value } : evidence) })} /><button onClick={() => setDraft({ ...draft, evidence: draft.evidence.filter((_, current) => current !== index) })}><Trash2 size={15} /></button></div>)}<button className="ep-add-row" onClick={() => setDraft({ ...draft, evidence: [...draft.evidence, { id: uid("evidence"), time: "10:00:00", title: "新证据", detail: "填写证据内容" }] })}><Plus size={15} />新增证据</button><p className="ep-status warn">任务评价沿用证据准确、定位推理和交付表达三项量规。</p></div>}
    {step === 2 && <div className="ep-submit-summary"><div><span>场景</span><b>{draft.name}</b></div><div><span>所属岗位</span><b>{jobs.find((job) => job.id === draft.jobId)?.name}</b></div><div><span>任务数</span><b>{draft.tasks.length}</b></div><div><span>可见方式</span><b>年度更新包授权</b></div></div>}
  </div><Footer current={step} max={2} canSubmit={!missing.length} missing={missing} onBack={() => setStep(Math.max(0, step - 1))} onNext={() => setStep(Math.min(2, step + 1))} onDraft={() => save(false)} onSubmit={() => save(true)} /></div>;
}

function CourseBuilder({ resource, initial, notify, onClose }: BuilderProps & { initial?: CourseProfile }) {
  const { state, persist } = useResourceSave(resource);
  const jobs = publishedJobs(state);
  const scenes = publishedScenes(state);
  const [draft, setDraft] = useState<CourseProfile>(() => initial ?? defaultCourse(jobs[0]?.id ?? "", scenes[0]?.id ?? ""));
  const [chapter, setChapter] = useState({ title: "", content: "", method: "" });
  const missing = [!draft.name.trim() ? "课程名称" : "", !draft.jobId ? "所属岗位" : "", draft.chapters.length === 0 ? "课程章节" : ""].filter(Boolean);
  const save = (submit: boolean) => {
    if (submit && missing.length) return notify(missing.join("；"));
    persist({ kind: "course", data: draft }, { name: draft.name || "未命名课程", description: `${draft.chapters.length} 个章节`, relatedIds: [draft.jobId, draft.sceneId], packageId: "renewal" }, submit);
    notify(submit ? "课程已提交审核" : "课程草稿已保存");
    onClose();
  };
  return <div className="ep-builder"><div className="ep-builder-head"><div><span>课程资源建设</span><h2>{draft.name || "新建课程"}</h2></div><button onClick={onClose}>关闭</button></div><WizardSteps current={0} steps={["课程信息与章节", "提交"]} /><div className="ep-builder-body"><div className="ep-form-grid"><Field label="课程名称"><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field><Field label="课程类型"><select value={draft.courseType} onChange={(event) => setDraft({ ...draft, courseType: event.target.value as CourseProfile["courseType"] })}><option>体系课</option><option>颗粒课</option><option>混合课</option></select></Field><Field label="所属岗位"><select value={draft.jobId} onChange={(event) => setDraft({ ...draft, jobId: event.target.value })}><option value="">请选择</option>{jobs.map((job) => <option value={job.id} key={job.id}>{job.name}</option>)}</select></Field><Field label="关联场景"><select value={draft.sceneId} onChange={(event) => setDraft({ ...draft, sceneId: event.target.value })}>{scenes.map((scene) => <option value={scene.id} key={scene.id}>{scene.name}</option>)}</select></Field><Field label="总学时"><input type="number" value={draft.totalHours ?? 0} onChange={(event) => setDraft({ ...draft, totalHours: Number(event.target.value) })} /></Field></div><div className="ep-builder-list"><h3>章节大纲</h3>{draft.chapters.map((item, index) => <div className="ep-builder-item" key={`${item.title}-${index}`}><span className="ep-number">{index + 1}</span><b>{item.title}</b><span>{item.content}</span><button onClick={() => setDraft({ ...draft, chapters: draft.chapters.filter((_, current) => current !== index) })}><Trash2 size={15} /></button></div>)}<div className="ep-form-grid"><Field label="章节标题"><input value={chapter.title} onChange={(event) => setChapter({ ...chapter, title: event.target.value })} /></Field><Field label="节点内容"><input value={chapter.content} onChange={(event) => setChapter({ ...chapter, content: event.target.value })} /></Field><Field label="教学方法" wide><input value={chapter.method} onChange={(event) => setChapter({ ...chapter, method: event.target.value })} /></Field><button className="ep-add-row" onClick={() => { if (!chapter.title.trim()) return notify("请填写章节标题"); setDraft({ ...draft, chapters: [...draft.chapters, chapter] }); setChapter({ title: "", content: "", method: "" }); }}><Plus size={15} />添加章节</button></div></div></div><Footer current={0} max={0} canSubmit={!missing.length} missing={missing} onBack={() => {}} onNext={() => {}} onDraft={() => save(false)} onSubmit={() => save(true)} /></div>;
}

function AssessmentBuilder({ resource, initial, notify, onClose }: BuilderProps & { initial?: AssessmentProfile }) {
  const { state, persist } = useResourceSave(resource);
  const jobs = publishedJobs(state);
  const standards = publishedStandards(state);
  const [draft, setDraft] = useState<AssessmentProfile>(() => initial ?? defaultAssessment(jobs[0]?.id ?? "", standards[0]?.id ?? ""));
  const [question, setQuestion] = useState({ title: "", optionA: "", optionB: "" });
  const missing = [!draft.name.trim() ? "测评名称" : "", !draft.jobId ? "关联岗位" : "", draft.questions.length === 0 ? "测评题目" : ""].filter(Boolean);
  const save = (submit: boolean) => {
    if (submit && missing.length) return notify(missing.join("；"));
    persist({ kind: "assessment", data: draft }, { name: draft.name || "未命名测评", description: `${draft.questions.length} 题 · ${draft.passScore} 分合格`, relatedIds: [draft.jobId, draft.standardId ?? ""].filter(Boolean), packageId: "renewal" }, submit);
    notify(submit ? "测评已提交审核" : "测评草稿已保存");
    onClose();
  };
  return <div className="ep-builder"><div className="ep-builder-head"><div><span>测评资源建设</span><h2>{draft.name || "新建测评"}</h2></div><button onClick={onClose}>关闭</button></div><WizardSteps current={0} steps={["测评信息与题目", "提交"]} /><div className="ep-builder-body"><div className="ep-form-grid"><Field label="测评名称"><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field><Field label="关联岗位"><select value={draft.jobId} onChange={(event) => setDraft({ ...draft, jobId: event.target.value })}><option value="">请选择</option>{jobs.map((job) => <option value={job.id} key={job.id}>{job.name}</option>)}</select></Field><Field label="评价标准"><select value={draft.standardId ?? ""} onChange={(event) => setDraft({ ...draft, standardId: event.target.value })}>{standards.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></Field><Field label="时长（分钟）"><input type="number" value={draft.durationMinutes} onChange={(event) => setDraft({ ...draft, durationMinutes: Number(event.target.value) })} /></Field><Field label="合格线"><input type="number" value={draft.passScore} onChange={(event) => setDraft({ ...draft, passScore: Number(event.target.value) })} /></Field></div><div className="ep-builder-list"><h3>题目</h3>{draft.questions.map((item, index) => <div className="ep-builder-item" key={item.id}><span className="ep-number">{index + 1}</span><b>{item.title}</b><span>{item.options.join(" / ")}</span><button onClick={() => setDraft({ ...draft, questions: draft.questions.filter((question) => question.id !== item.id) })}><Trash2 size={15} /></button></div>)}<div className="ep-form-grid"><Field label="题干" wide><input value={question.title} onChange={(event) => setQuestion({ ...question, title: event.target.value })} /></Field><Field label="正确选项"><input value={question.optionA} onChange={(event) => setQuestion({ ...question, optionA: event.target.value })} /></Field><Field label="干扰选项"><input value={question.optionB} onChange={(event) => setQuestion({ ...question, optionB: event.target.value })} /></Field><button className="ep-add-row" onClick={() => { if (!question.title || !question.optionA || !question.optionB) return notify("请填写完整题目"); setDraft({ ...draft, questions: [...draft.questions, { id: uid("q"), title: question.title, options: [question.optionA, question.optionB], answer: 0 }] }); setQuestion({ title: "", optionA: "", optionB: "" }); }}><Plus size={15} />添加题目</button></div></div></div><Footer current={0} max={0} canSubmit={!missing.length} missing={missing} onBack={() => {}} onNext={() => {}} onDraft={() => save(false)} onSubmit={() => save(true)} /></div>;
}

function StandardBuilder({ resource, initial, notify, onClose }: BuilderProps & { initial?: StandardProfile }) {
  const { state, persist } = useResourceSave(resource);
  const jobs = publishedJobs(state);
  const [draft, setDraft] = useState<StandardProfile>(() => initial ?? defaultStandard(jobs[0]?.id ?? ""));
  const total = draft.abilityPointWeights.reduce((sum, item) => sum + item.weight, 0);
  const missing = [!draft.name.trim() ? "标准名称" : "", !draft.jobId ? "关联岗位" : "", total !== 100 ? "能力权重须为 100%" : ""].filter(Boolean);
  const save = (submit: boolean) => {
    if (submit && missing.length) return notify(missing.join("；"));
    persist({ kind: "standard", data: draft }, { name: draft.name || "未命名评价标准", description: "岗位能力等级与认定规则", relatedIds: [draft.jobId], packageId: "renewal" }, submit);
    notify(submit ? "评价标准已提交审核" : "评价标准草稿已保存");
    onClose();
  };
  return <div className="ep-builder"><div className="ep-builder-head"><div><span>评价标准建设</span><h2>{draft.name || "新建评价标准"}</h2></div><button onClick={onClose}>关闭</button></div><WizardSteps current={0} steps={["能力权重与认定规则", "提交"]} /><div className="ep-builder-body"><div className="ep-form-grid"><Field label="标准名称"><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field><Field label="关联岗位"><select value={draft.jobId} onChange={(event) => setDraft({ ...draft, jobId: event.target.value })}><option value="">请选择</option>{jobs.map((job) => <option value={job.id} key={job.id}>{job.name}</option>)}</select></Field><Field label="岗位认定规则" wide><textarea value={draft.recognitionRule} onChange={(event) => setDraft({ ...draft, recognitionRule: event.target.value })} /></Field></div><div className="ep-builder-list"><h3>能力点权重</h3>{draft.abilityPointWeights.map((item, index) => <div className="ep-builder-item" key={item.id}><span className="ep-number">{index + 1}</span><b>{item.name}</b><input type="number" value={item.weight} onChange={(event) => setDraft({ ...draft, abilityPointWeights: draft.abilityPointWeights.map((point, current) => current === index ? { ...point, weight: Number(event.target.value) } : point) })} /><select value={item.level} onChange={(event) => setDraft({ ...draft, abilityPointWeights: draft.abilityPointWeights.map((point, current) => current === index ? { ...point, level: event.target.value } : point) })}>{["L1", "L2", "L3", "L4", "L5"].map((level) => <option key={level}>{level}</option>)}</select></div>)}<p className={total === 100 ? "ep-status ok" : "ep-status warn"}>权重合计 {total}%</p></div></div><Footer current={0} max={0} canSubmit={!missing.length} missing={missing} onBack={() => {}} onNext={() => {}} onDraft={() => save(false)} onSubmit={() => save(true)} /></div>;
}

export function ResourcePreview({ state, resource }: { state: EnterpriseWorkspaceState; resource: Resource }) {
  const published = resource.publishedContent;
  if (!published) return <div className="ep-empty">尚无已发布版本。</div>;
  if (published.kind === "job") {
    const job = published.data;
    const match = jobMatch(state, job);
    return <div className="ep-resource-preview"><h2>{job.name}</h2><p>{job.description}</p><div className="ep-chips">{(job.skills ?? []).map((item) => <span className="ep-tag" key={item}>{item}</span>)}</div><div className="ep-stats"><div className="ep-card"><small>工作任务</small><strong>{job.tasks?.length ?? 0}</strong></div><div className="ep-card"><small>能力点</small><strong>{job.abilityPoints?.length ?? 0}</strong></div><div className="ep-card"><small>关联场景</small><strong>{job.sceneIds?.length ?? 0}</strong></div><div className="ep-card"><small>岗位匹配</small><strong>{jobMatch(state, job).match}%</strong></div></div><h3>岗位职责</h3>{(job.responsibilities ?? []).map((item) => <p key={item}>· {item}</p>)}<h3>任职要求</h3>{(job.requirements ?? []).map((item) => <p key={item}>· {item}</p>)}<p className="ep-status">{match.missing.length ? `待补充能力：${match.missing.join("、")}` : "核心能力证据已具备"}</p></div>;
  }
  if (published.kind === "scene") return <div className="ep-resource-preview"><h2>{published.data.name}</h2><p>{published.data.description}</p><h3>任务链</h3>{published.data.tasks.map((item, index) => <p key={`${item}-${index}`}>{index + 1}. {item}</p>)}</div>;
  if (published.kind === "course") return <div className="ep-resource-preview"><h2>{published.data.name}</h2><p>{published.data.courseType} · {published.data.totalHours} 学时</p>{published.data.chapters.map((item, index) => <p key={`${item.title}-${index}`}>{index + 1}. {item.title}</p>)}</div>;
  if (published.kind === "assessment") return <div className="ep-resource-preview"><h2>{published.data.name}</h2><p>{published.data.questions.length} 题 · {published.data.durationMinutes} 分钟 · {published.data.passScore} 分合格</p></div>;
  return <div className="ep-resource-preview"><h2>{published.data.name}</h2><p>{published.data.recognitionRule}</p>{published.data.abilityPointWeights.map((item) => <p key={item.id}>{item.name} · {item.weight}% · {item.level}</p>)}</div>;
}
