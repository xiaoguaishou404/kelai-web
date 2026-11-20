"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  publishedJobs,
  type ResourceRights,
  type SceneProfile,
  type SceneTaskDetail,
} from "@/lib/enterprise-workspace";
import {
  BuilderProps,
  Field,
  Footer,
  ResourceChecks,
  RightsFields,
  WizardSteps,
  createSceneTask,
  defaultScene,
  initialRights,
  rightsMissing,
  uid,
  useResourceSave,
} from "./shared";

export function SceneBuilder({ resource, initial, notify, onClose }: BuilderProps & { initial?: SceneProfile }) {
  const { state, persist } = useResourceSave(resource);
  const jobs = publishedJobs(state);
  const [draft, setDraft] = useState<SceneProfile>(() => {
    const base = initial ?? defaultScene(jobs[0]?.id ?? "");
    if (base.taskDetails?.length) return base;
    const job = jobs.find((item) => item.id === base.jobId);
    return {
      ...base,
      taskDetails: base.tasks.map((title, index) =>
        ({
          ...createSceneTask(
            `${base.id}-task-${index + 1}`,
            title,
            index,
            (job?.abilityPoints ?? []).map((item) => item.id),
          ),
          weight:
            Math.floor(100 / Math.max(1, base.tasks.length)) +
            (index < 100 % Math.max(1, base.tasks.length) ? 1 : 0),
        }),
      ),
    };
  });
  const [rights, setRights] = useState<ResourceRights>(() => initialRights(resource, draft.id));
  const [step, setStep] = useState(0);
  const taskDetails = draft.taskDetails ?? [];
  const taskWeightTotal = taskDetails.reduce((sum, item) => sum + item.weight, 0);
  const missing = [
    !draft.name.trim() ? "场景名称" : "",
    !draft.jobId ? "所属岗位" : "",
    !draft.description.trim() ? "场景背景" : "",
    draft.tasks.length === 0 ? "任务链" : "",
    taskDetails.some((item) => !item.title.trim() || !item.goal.trim() || !item.deliverable.trim()) ? "任务目标与交付要求" : "",
    taskWeightTotal !== 100 ? "任务权重须为 100%" : "",
    taskDetails.some((item) => item.rubric.reduce((sum, rubric) => sum + rubric.weight, 0) !== 100) ? "每个任务的评价量规须为 100%" : "",
    taskDetails.some((item) => item.assessmentMethods.length === 0 || item.assessmentMethods.reduce((sum, method) => sum + method.weight, 0) !== 100) ? "每个任务的考核方式权重须为 100%" : "",
    draft.evidence.length < 3 ? "至少三条证据" : "",
    ...rightsMissing(rights),
  ].filter(Boolean);
  const updateTask = (id: string, patch: Partial<SceneTaskDetail>) => {
    const nextDetails = taskDetails.map((item) => item.id === id ? { ...item, ...patch } : item);
    setDraft({ ...draft, taskDetails: nextDetails, tasks: nextDetails.map((item) => item.title) });
  };
  const addTask = () => {
    const index = taskDetails.length;
    const job = jobs.find((item) => item.id === draft.jobId);
    const task = createSceneTask(
      uid("task"),
      `新任务 ${index + 1}`,
      index,
      (job?.abilityPoints ?? []).map((item) => item.id),
    );
    const nextDetails = [...taskDetails, task];
    setDraft({ ...draft, taskDetails: nextDetails, tasks: nextDetails.map((item) => item.title) });
  };
  const removeTask = (id: string) => {
    const nextDetails = taskDetails.filter((item) => item.id !== id);
    setDraft({ ...draft, taskDetails: nextDetails, tasks: nextDetails.map((item) => item.title) });
  };
  const save = (submit: boolean) => {
    if (submit && missing.length) return notify(missing.join("；"));
    persist({ kind: "scene", data: { ...draft, taskDetails } }, { name: draft.name || "未命名场景", description: draft.description || "场景草稿待完善", relatedIds: [draft.jobId], rights }, submit);
    notify(submit ? "场景已提交审核" : "场景草稿已保存");
    onClose();
  };
  return <div className="ep-builder"><div className="ep-builder-head"><div><span>场景资源建设</span><h2>{draft.name || "新建场景"}</h2></div><button onClick={onClose}>关闭</button></div><WizardSteps current={step} steps={["基础信息", "任务链与量规", "提交"]} /><div className="ep-builder-body">
    {step === 0 && <div className="ep-form-grid"><Field label="场景名称"><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field><Field label="所属岗位"><select value={draft.jobId} onChange={(event) => setDraft({ ...draft, jobId: event.target.value })}><option value="">请选择</option>{jobs.map((job) => <option value={job.id} key={job.id}>{job.name}</option>)}</select></Field><Field label="难度"><select value={draft.difficulty} onChange={(event) => setDraft({ ...draft, difficulty: event.target.value })}><option>基础</option><option>进阶</option><option>综合</option></select></Field><Field label="场景介绍" wide><textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></Field><Field label="专家参考答案" wide><textarea value={draft.answer} onChange={(event) => setDraft({ ...draft, answer: event.target.value })} /></Field></div>}
    {step === 1 && (
      <div className="ep-builder-list">
        <div className="ep-builder-section-head"><div><h3>场景任务</h3><small>每个任务独立学习、提交和评价，权重合计应为 100%。</small></div><span className={`ep-tag ${taskWeightTotal === 100 ? "is-success" : "is-warning"}`}>任务权重 {taskWeightTotal}%</span></div>
        <div className="ep-task-builder-list">
          {taskDetails.map((task, index) => (
            <section className="ep-task-builder-card" key={task.id}>
              <header>
                <span className="ep-number">{index + 1}</span>
                <input aria-label={`任务${index + 1}名称`} value={task.title} onChange={(event) => updateTask(task.id, { title: event.target.value })} />
                <select aria-label={`任务${index + 1}类型`} value={task.type} onChange={(event) => updateTask(task.id, { type: event.target.value as SceneTaskDetail["type"] })}>
                  <option>训练</option><option>测评</option><option>复盘</option>
                </select>
                <button onClick={() => removeTask(task.id)} aria-label="删除任务"><Trash2 size={15} /></button>
              </header>
              <div className="ep-form-grid">
                <Field label="建议时长（分钟）"><input type="number" min="5" value={task.minutes} onChange={(event) => updateTask(task.id, { minutes: Number(event.target.value) })} /></Field>
                <Field label="场景权重"><input type="number" min="0" max="100" value={task.weight} onChange={(event) => updateTask(task.id, { weight: Number(event.target.value) })} /></Field>
                <Field label="交付物" wide><input value={task.deliverable} onChange={(event) => updateTask(task.id, { deliverable: event.target.value })} /></Field>
                <Field label="任务目标" wide><textarea value={task.goal} onChange={(event) => updateTask(task.id, { goal: event.target.value })} /></Field>
                <Field label="任务说明" wide><textarea value={task.description} onChange={(event) => updateTask(task.id, { description: event.target.value })} /></Field>
              </div>
              <div className="ep-task-rubric-editor">
                <b>评价量规</b>
                {task.rubric.map((rubric) => (
                  <label key={rubric.id}><span>{rubric.label}<small>{rubric.description}</small></span><input type="number" min="0" max="100" value={rubric.weight} onChange={(event) => updateTask(task.id, { rubric: task.rubric.map((item) => item.id === rubric.id ? { ...item, weight: Number(event.target.value) } : item) })} /><em>%</em></label>
                ))}
              </div>
              <Field label="考核方式（每行：类型|权重|授课模式|必做）" wide>
                <textarea
                  value={task.assessmentMethods.map((item) => `${item.type}|${item.weight}|${item.mode}|${item.required ? "必做" : "选做"}`).join("\n")}
                  onChange={(event) => updateTask(task.id, {
                    assessmentMethods: event.target.value
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line, methodIndex) => {
                        const [rawType, rawWeight, rawMode, rawRequired] = line.split("|").map((item) => item.trim());
                        const types = ["随堂测", "作品评审", "实操考核", "现场答辩", "线下课堂", "题库"] as const;
                        const modes = ["线上", "线下", "混合"] as const;
                        const type = types.includes(rawType as typeof types[number]) ? rawType as typeof types[number] : "作品评审";
                        const mode = modes.includes(rawMode as typeof modes[number]) ? rawMode as typeof modes[number] : "混合";
                        return {
                          id: `${task.id}-assessment-${methodIndex + 1}`,
                          type,
                          title: type,
                          description: `${type}考核`,
                          mode,
                          weight: Number(rawWeight) || 0,
                          required: rawRequired !== "选做",
                          passScore: 60,
                        };
                      }),
                  })}
                  placeholder={"随堂测|30|线上|必做\n作品评审|50|混合|必做\n现场答辩|20|线下|选做"}
                />
              </Field>
              <Field label="任务配套资源（每行：类型|标题|说明）" wide>
                <textarea
                  value={task.resources.map((item) => `${item.type}|${item.title}|${item.description}`).join("\n")}
                  onChange={(event) => updateTask(task.id, {
                    resources: event.target.value
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line, resourceIndex) => {
                        const [type, title, ...description] = line.split("|");
                        return {
                          id: `${task.id}-resource-${resourceIndex + 1}`,
                          type: (["视频", "文档", "图片", "习题", "思维导图", "知识图谱", "录音"].includes(type) ? type : "文档") as "视频" | "文档" | "图片" | "习题" | "思维导图" | "知识图谱" | "录音",
                          title: title?.trim() || `任务资源 ${resourceIndex + 1}`,
                          description: description.join("|").trim() || "任务配套资源",
                        };
                      }),
                  })}
                  placeholder={"文档|任务说明|背景、步骤与交付要求\n视频|方法演示|关键操作演示"}
                />
              </Field>
              <div className="ep-builder-relations">
                <ResourceChecks
                  title="考查能力点"
                  items={(jobs.find((item) => item.id === draft.jobId)?.abilityPoints ?? []).map((item) => [item.id, item.name])}
                  selected={task.abilityPointIds}
                  onChange={(abilityPointIds) => updateTask(task.id, { abilityPointIds })}
                />
                <ResourceChecks
                  title="必选证据"
                  items={draft.evidence.map((item) => [item.id, item.title])}
                  selected={task.requiredEvidenceIds}
                  onChange={(requiredEvidenceIds) => updateTask(task.id, { requiredEvidenceIds })}
                />
              </div>
              <label className="ep-check"><input type="checkbox" checked={task.required} onChange={(event) => updateTask(task.id, { required: event.target.checked })} />必做任务，通过后才计入场景完成</label>
            </section>
          ))}
        </div>
        <button className="ep-add-row" onClick={addTask}><Plus size={15} />新增任务</button>
        <div className="ep-builder-section-head"><div><h3>可观测证据</h3><small>任务可引用同一批证据，也可设置不同必选组合。</small></div></div>
        {draft.evidence.map((item, index) => (
          <div className="ep-builder-item" key={item.id}>
            <span className="ep-number">{index + 1}</span>
            <input value={item.title} onChange={(event) => setDraft({ ...draft, evidence: draft.evidence.map((evidence, current) => current === index ? { ...evidence, title: event.target.value } : evidence) })} />
            <input value={item.detail} onChange={(event) => setDraft({ ...draft, evidence: draft.evidence.map((evidence, current) => current === index ? { ...evidence, detail: event.target.value } : evidence) })} />
            <button onClick={() => setDraft({ ...draft, evidence: draft.evidence.filter((_, current) => current !== index) })}><Trash2 size={15} /></button>
          </div>
        ))}
        <button className="ep-add-row" onClick={() => setDraft({ ...draft, evidence: [...draft.evidence, { id: uid("evidence"), time: "10:00:00", title: "新证据", detail: "填写证据内容" }] })}><Plus size={15} />新增证据</button>
      </div>
    )}
    {step === 2 && <><div className="ep-submit-summary"><div><span>场景</span><b>{draft.name}</b></div><div><span>所属岗位</span><b>{jobs.find((job) => job.id === draft.jobId)?.name}</b></div><div><span>任务数</span><b>{draft.tasks.length}</b></div><div><span>可见方式</span><b>年度更新包授权</b></div></div><RightsFields rights={rights} onChange={setRights} /></>}
  </div><Footer current={step} max={2} canSubmit={!missing.length} missing={missing} onBack={() => setStep(Math.max(0, step - 1))} onNext={() => setStep(Math.min(2, step + 1))} onDraft={() => save(false)} onSubmit={() => save(true)} /></div>;
}
