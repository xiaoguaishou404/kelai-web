import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type {
  ResourceRights,
  TeachingResourceItem,
  TextbookProfile,
} from "@/lib/enterprise-workspace";
import {
  BuilderProps,
  Field,
  Footer,
  RightsFields,
  WizardSteps,
  initialRights,
  lines,
  rightsMissing,
  uid,
  useResourceSave,
} from "./shared";

function defaultTextbook(): TextbookProfile {
  return {
    id: uid("textbook"),
    name: "",
    code: `KL-JC-${String(Date.now()).slice(-4)}`,
    creator: "科来教学资源部",
    industry: "金融",
    major: "网络工程",
    coverTone: "blue",
    chapters: [],
  };
}

export function TextbookBuilder({ resource, initial, notify, onClose }: BuilderProps & { initial?: TextbookProfile }) {
  const { state, persist } = useResourceSave(resource);
  const materials = state.teachingMaterials.filter((item) => item.status === "启用");
  const [draft, setDraft] = useState<TextbookProfile>(() => initial ?? defaultTextbook());
  const [rights, setRights] = useState<ResourceRights>(() => initialRights(resource, draft.id));
  const [chapter, setChapter] = useState({
    title: "",
    content: "",
    method: "",
    objectives: "",
    points: "",
    resources: [] as TeachingResourceItem[],
  });
  const [materialPick, setMaterialPick] = useState("");
  const missing = [
    !draft.name.trim() ? "教材名称" : "",
    !draft.code.trim() ? "教材编码" : "",
    draft.chapters.length === 0 ? "教材章节" : "",
    ...rightsMissing(rights),
  ].filter(Boolean);
  const save = (submit: boolean) => {
    if (submit && missing.length) return notify(missing.join("；"));
    persist(
      { kind: "textbook", data: draft },
      {
        name: draft.name || "未命名教材",
        description: `${draft.chapters.length} 章 · ${draft.major}`,
        relatedIds: [],
        rights,
      },
      submit,
    );
    notify(submit ? "教材已提交审核" : "教材草稿已保存");
    onClose();
  };

  return (
    <div className="ep-builder">
      <div className="ep-builder-head">
        <div><span>数字教材建设</span><h2>{draft.name || "新建教材"}</h2><small>{draft.code}</small></div>
        <button onClick={onClose}>关闭</button>
      </div>
      <WizardSteps current={0} steps={["教材信息与章节", "提交"]} />
      <div className="ep-builder-body">
        <div className="ep-form-grid">
          <Field label="教材名称"><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field>
          <Field label="教材编码"><input value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value })} /></Field>
          <Field label="主编"><input value={draft.creator} onChange={(event) => setDraft({ ...draft, creator: event.target.value })} /></Field>
          <Field label="行业"><input value={draft.industry} onChange={(event) => setDraft({ ...draft, industry: event.target.value })} /></Field>
          <Field label="适用专业"><input value={draft.major} onChange={(event) => setDraft({ ...draft, major: event.target.value })} /></Field>
          <Field label="封面色调">
            <select value={draft.coverTone} onChange={(event) => setDraft({ ...draft, coverTone: event.target.value as TextbookProfile["coverTone"] })}>
              <option value="blue">蓝色</option>
              <option value="teal">青色</option>
              <option value="amber">琥珀</option>
              <option value="violet">紫色</option>
              <option value="navy">深蓝</option>
            </select>
          </Field>
        </div>
        <div className="ep-builder-list">
          <h3>教材章节</h3>
          {draft.chapters.map((item, index) => (
            <div className="ep-builder-item" key={`${item.title}-${index}`}>
              <span className="ep-number">{index + 1}</span>
              <b>{item.title}</b>
              <span>{item.content}</span>
              <span>{item.resources?.length ?? 0} 项资源</span>
              <button onClick={() => setDraft({ ...draft, chapters: draft.chapters.filter((_, current) => current !== index) })}><Trash2 size={15} /></button>
            </div>
          ))}
          <div className="ep-form-grid">
            <Field label="章节标题"><input value={chapter.title} onChange={(event) => setChapter({ ...chapter, title: event.target.value })} /></Field>
            <Field label="章节正文"><input value={chapter.content} onChange={(event) => setChapter({ ...chapter, content: event.target.value })} /></Field>
            <Field label="教学方法" wide><input value={chapter.method} onChange={(event) => setChapter({ ...chapter, method: event.target.value })} /></Field>
            <Field label="本章目标（每行一项）" wide><textarea value={chapter.objectives} onChange={(event) => setChapter({ ...chapter, objectives: event.target.value })} /></Field>
            <Field label="方法要点（每行一项）" wide><textarea value={chapter.points} onChange={(event) => setChapter({ ...chapter, points: event.target.value })} /></Field>
          </div>
          <div className="ep-material-picker">
            <select value={materialPick} onChange={(event) => setMaterialPick(event.target.value)}>
              <option value="">从素材库选择</option>
              {materials.map((material) => <option value={material.id} key={material.id}>{material.type} · {material.title}</option>)}
            </select>
            <button onClick={() => {
              const material = materials.find((item) => item.id === materialPick);
              if (!material) return notify("请选择素材");
              setChapter({
                ...chapter,
                resources: [...chapter.resources, { id: material.id, type: material.type, title: material.title, description: material.description }],
              });
              setMaterialPick("");
            }}>添加素材</button>
          </div>
          <button className="ep-add-row" onClick={() => {
            if (!chapter.title.trim()) return notify("请填写章节标题");
            setDraft({
              ...draft,
              chapters: [
                ...draft.chapters,
                {
                  title: chapter.title,
                  content: chapter.content,
                  method: chapter.method,
                  objectives: lines(chapter.objectives),
                  points: lines(chapter.points),
                  resources: chapter.resources,
                },
              ],
            });
            setChapter({ title: "", content: "", method: "", objectives: "", points: "", resources: [] });
          }}><Plus size={15} />添加章节</button>
        </div>
        <RightsFields rights={rights} onChange={setRights} />
      </div>
      <Footer current={0} max={0} canSubmit={!missing.length} missing={missing} onBack={() => {}} onNext={() => {}} onDraft={() => save(false)} onSubmit={() => save(true)} />
    </div>
  );
}
