"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { AssessmentProfile, Question, ResourceRights } from "@/lib/enterprise-workspace";
import {
  BuilderProps,
  Field,
  Footer,
  RightsFields,
  WizardSteps,
  defaultAssessment,
  initialRights,
  lines,
  rightsMissing,
  uid,
  useResourceSave,
} from "./shared";

type QuestionType = NonNullable<Question["type"]>;

export function AssessmentBuilder({
  resource,
  initial,
  notify,
  onClose,
  assessmentKind,
}: BuilderProps & { initial?: AssessmentProfile }) {
  const { state, persist } = useResourceSave(resource);
  const jobs = state.resources.flatMap((item) => item.draftContent.kind === "job" ? [item.draftContent.data] : []);
  const standards = state.resources.flatMap((item) => item.draftContent.kind === "standard" ? [item.draftContent.data] : []);
  const abilityPoints = state.abilityCatalog.filter((item) => item.status === "启用");
  const [draft, setDraft] = useState<AssessmentProfile>(
    () => initial ?? defaultAssessment(jobs[0]?.id ?? "", standards[0]?.id ?? "", assessmentKind ?? "试卷"),
  );
  const [rights, setRights] = useState<ResourceRights>(() => initialRights(resource, draft.id));
  const [question, setQuestion] = useState({
    title: "",
    type: "单选" as QuestionType,
    options: "",
    answer: 0,
    score: 10,
    difficulty: "中级",
    abilityPointId: "",
  });
  const missing = [
    !draft.name.trim() ? "测评名称" : "",
    !draft.jobId ? "关联岗位" : "",
    draft.questions.length === 0 ? "测评题目" : "",
    ...rightsMissing(rights),
  ].filter(Boolean);
  const save = (submit: boolean) => {
    if (submit && missing.length) return notify(missing.join("；"));
    persist(
      { kind: "assessment", data: draft },
      {
        name: draft.name || "未命名测评",
        description: `${draft.kind} · ${draft.questions.length} 题 · ${draft.passScore} 分合格`,
        relatedIds: [draft.jobId, draft.standardId ?? ""].filter(Boolean),
        rights,
      },
      submit,
    );
    notify(submit ? "测评已提交审核" : "测评草稿已保存");
    onClose();
  };
  const addQuestion = () => {
    if (!question.title.trim()) return notify("请填写题干");
    const options = question.type === "判断"
      ? ["正确", "错误"]
      : lines(question.options);
    if (options.length < 2) return notify("至少需要两个选项");
    if (question.answer >= options.length) return notify("正确答案超出选项范围");
    setDraft({
      ...draft,
      questions: [
        ...draft.questions,
        {
          id: uid("q"),
          title: question.title,
          options,
          answer: question.answer,
          type: question.type,
          difficulty: question.difficulty,
          score: question.score,
          abilityPointIds: question.abilityPointId ? [question.abilityPointId] : [],
        },
      ],
    });
    setQuestion({ title: "", type: "单选", options: "", answer: 0, score: 10, difficulty: "中级", abilityPointId: "" });
  };

  return (
    <div className="ep-builder">
      <div className="ep-builder-head">
        <div><span>测评资源建设</span><h2>{draft.name || `新建${draft.kind}`}</h2><small>{draft.code}</small></div>
        <button onClick={onClose}>关闭</button>
      </div>
      <WizardSteps current={0} steps={["测评信息与题目", "提交"]} />
      <div className="ep-builder-body">
        <div className="ep-form-grid">
          <Field label="测评名称"><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field>
          <Field label="测评类型">
            <select value={draft.kind ?? "试卷"} onChange={(event) => setDraft({ ...draft, kind: event.target.value as AssessmentProfile["kind"] })}>
              <option value="题库">题库</option>
              <option value="试卷">试卷</option>
            </select>
          </Field>
          <Field label="关联岗位"><select value={draft.jobId} onChange={(event) => setDraft({ ...draft, jobId: event.target.value })}><option value="">请选择</option>{jobs.map((job) => <option value={job.id} key={job.id}>{job.name}</option>)}</select></Field>
          <Field label="评价标准"><select value={draft.standardId ?? ""} onChange={(event) => setDraft({ ...draft, standardId: event.target.value })}><option value="">不关联</option>{standards.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></Field>
          <Field label="难度">
            <select value={draft.difficulty ?? "中级"} onChange={(event) => setDraft({ ...draft, difficulty: event.target.value as AssessmentProfile["difficulty"] })}>
              {["入门", "初级", "中级", "高级", "专家"].map((item) => <option value={item} key={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="发布方"><input value={draft.publisher ?? ""} onChange={(event) => setDraft({ ...draft, publisher: event.target.value })} /></Field>
          <Field label="时长（分钟）"><input type="number" value={draft.durationMinutes} onChange={(event) => setDraft({ ...draft, durationMinutes: Number(event.target.value) })} /></Field>
          <Field label="合格线"><input type="number" value={draft.passScore} onChange={(event) => setDraft({ ...draft, passScore: Number(event.target.value) })} /></Field>
        </div>
        <div className="ep-builder-list">
          <h3>题目</h3>
          {draft.questions.map((item, index) => (
            <div className="ep-builder-item" key={item.id}>
              <span className="ep-number">{index + 1}</span>
              <b>{item.title}</b>
              <span>{item.type ?? "单选"} · {item.options.join(" / ")} · 答案 {String.fromCharCode(65 + item.answer)} · {item.score ?? 0} 分</span>
              <button onClick={() => setDraft({ ...draft, questions: draft.questions.filter((child) => child.id !== item.id) })}><Trash2 size={15} /></button>
            </div>
          ))}
          <div className="ep-form-grid">
            <Field label="题干" wide><input value={question.title} onChange={(event) => setQuestion({ ...question, title: event.target.value })} /></Field>
            <Field label="题型">
              <select value={question.type} onChange={(event) => setQuestion({ ...question, type: event.target.value as QuestionType, answer: 0 })}>
                <option value="单选">单选</option>
                <option value="判断">判断</option>
              </select>
            </Field>
            <Field label="难度">
              <select value={question.difficulty} onChange={(event) => setQuestion({ ...question, difficulty: event.target.value })}>
                {["入门", "初级", "中级", "高级", "专家"].map((item) => <option value={item} key={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="分值"><input type="number" value={question.score} onChange={(event) => setQuestion({ ...question, score: Number(event.target.value) })} /></Field>
            <Field label="考查能力点">
              <select value={question.abilityPointId} onChange={(event) => setQuestion({ ...question, abilityPointId: event.target.value })}>
                <option value="">不关联</option>
                {abilityPoints.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
              </select>
            </Field>
            <Field label={question.type === "判断" ? "选项（判断题自动生成）" : "选项（每行一项）"} wide>
              <textarea
                value={question.type === "判断" ? "正确\n错误" : question.options}
                disabled={question.type === "判断"}
                onChange={(event) => setQuestion({ ...question, options: event.target.value })}
              />
            </Field>
            <Field label="正确答案">
              <select value={question.answer} onChange={(event) => setQuestion({ ...question, answer: Number(event.target.value) })}>
                {(question.type === "判断" ? ["正确", "错误"] : lines(question.options)).map((option, index) => (
                  <option value={index} key={`${option}-${index}`}>{String.fromCharCode(65 + index)} · {option}</option>
                ))}
              </select>
            </Field>
          </div>
          <button className="ep-add-row" onClick={addQuestion}><Plus size={15} />添加题目</button>
        </div>
        <RightsFields rights={rights} onChange={setRights} />
      </div>
      <Footer current={0} max={0} canSubmit={!missing.length} missing={missing} onBack={() => {}} onNext={() => {}} onDraft={() => save(false)} onSubmit={() => save(true)} />
    </div>
  );
}
