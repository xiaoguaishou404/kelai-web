"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { publishedJobs, publishedScenes, type CourseProfile, type ResourceRights } from "@/lib/enterprise-workspace";
import {
  BuilderProps,
  Field,
  Footer,
  RightsFields,
  WizardSteps,
  defaultCourse,
  initialRights,
  rightsMissing,
  useResourceSave,
} from "./shared";

export function CourseBuilder({ resource, initial, notify, onClose }: BuilderProps & { initial?: CourseProfile }) {
  const { state, persist } = useResourceSave(resource);
  const jobs = publishedJobs(state);
  const scenes = publishedScenes(state);
  const [draft, setDraft] = useState<CourseProfile>(() => initial ?? defaultCourse(jobs[0]?.id ?? "", scenes[0]?.id ?? ""));
  const [rights, setRights] = useState<ResourceRights>(() => initialRights(resource, draft.id));
  const [chapter, setChapter] = useState({ title: "", content: "", method: "" });
  const missing = [!draft.name.trim() ? "课程名称" : "", !draft.jobId ? "所属岗位" : "", draft.chapters.length === 0 ? "课程章节" : "", ...rightsMissing(rights)].filter(Boolean);
  const save = (submit: boolean) => {
    if (submit && missing.length) return notify(missing.join("；"));
    persist({ kind: "course", data: draft }, { name: draft.name || "未命名课程", description: `${draft.chapters.length} 个章节`, relatedIds: [draft.jobId, draft.sceneId], rights }, submit);
    notify(submit ? "课程已提交审核" : "课程草稿已保存");
    onClose();
  };
  return (
    <div className="ep-builder">
      <div className="ep-builder-head"><div><span>课程资源建设</span><h2>{draft.name || "新建课程"}</h2></div><button onClick={onClose}>关闭</button></div>
      <WizardSteps current={0} steps={["课程信息与章节", "提交"]} />
      <div className="ep-builder-body">
        <div className="ep-form-grid">
          <Field label="课程名称"><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field>
          <Field label="课程类型"><select value={draft.courseType} onChange={(event) => setDraft({ ...draft, courseType: event.target.value as CourseProfile["courseType"] })}><option>体系课</option><option>颗粒课</option><option>混合课</option></select></Field>
          <Field label="所属岗位"><select value={draft.jobId} onChange={(event) => setDraft({ ...draft, jobId: event.target.value })}><option value="">请选择</option>{jobs.map((job) => <option value={job.id} key={job.id}>{job.name}</option>)}</select></Field>
          <Field label="关联场景"><select value={draft.sceneId} onChange={(event) => setDraft({ ...draft, sceneId: event.target.value })}>{scenes.map((scene) => <option value={scene.id} key={scene.id}>{scene.name}</option>)}</select></Field>
          <Field label="总学时"><input type="number" value={draft.totalHours ?? 0} onChange={(event) => setDraft({ ...draft, totalHours: Number(event.target.value) })} /></Field>
        </div>
        <div className="ep-builder-list">
          <h3>章节大纲</h3>
          {draft.chapters.map((item, index) => (
            <div className="ep-builder-item" key={`${item.title}-${index}`}>
              <span className="ep-number">{index + 1}</span><b>{item.title}</b><span>{item.content}</span>
              <button onClick={() => setDraft({ ...draft, chapters: draft.chapters.filter((_, current) => current !== index) })}><Trash2 size={15} /></button>
            </div>
          ))}
          <div className="ep-form-grid">
            <Field label="章节标题"><input value={chapter.title} onChange={(event) => setChapter({ ...chapter, title: event.target.value })} /></Field>
            <Field label="节点内容"><input value={chapter.content} onChange={(event) => setChapter({ ...chapter, content: event.target.value })} /></Field>
            <Field label="教学方法" wide><input value={chapter.method} onChange={(event) => setChapter({ ...chapter, method: event.target.value })} /></Field>
            <button className="ep-add-row" onClick={() => {
              if (!chapter.title.trim()) return notify("请填写章节标题");
              setDraft({ ...draft, chapters: [...draft.chapters, chapter] });
              setChapter({ title: "", content: "", method: "" });
            }}><Plus size={15} />添加章节</button>
          </div>
        </div>
        <RightsFields rights={rights} onChange={setRights} />
      </div>
      <Footer current={0} max={0} canSubmit={!missing.length} missing={missing} onBack={() => {}} onNext={() => {}} onDraft={() => save(false)} onSubmit={() => save(true)} />
    </div>
  );
}
