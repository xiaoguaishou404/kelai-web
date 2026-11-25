"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { ResourceBuilder } from "@/components/enterprise/resource-builders";
import { useWorkspace } from "@/components/enterprise/workspace-store";
import { useConsoleAccess } from "@/components/enterprise/console-access";
import { Tag } from "@/components/enterprise/workspace/ui";
import { PanelTitle } from "./catalog-panel";
import {
  effectiveRightsStatus,
  publishedAssessments,
  type AssessmentProfile,
  type Resource,
} from "@/lib/enterprise-workspace";

type AssessmentKind = NonNullable<AssessmentProfile["kind"]>;

export function AssessmentCatalogPanel({ kind, notify }: { kind: AssessmentKind; notify: (message: string) => void }) {
  const { state, resourceAction } = useWorkspace();
  const { readOnly } = useConsoleAccess();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const items = state.resources.filter(
    (item) => item.type === "测评"
      && item.draftContent.kind === "assessment"
      && (item.draftContent.data.kind ?? "试卷") === kind,
  );

  const submit = (resource: Resource) => {
    resourceAction(resource.id, "submit", "");
    notify(`${kind}已提交审核，请到审批中心处理`);
  };

  return (
    <>
      <div className="ep-catalog-head">
        <PanelTitle title={`${kind}管理`} description={kind === "题库" ? "多题型题目与能力点。" : "组卷、分值与合格线。"} />
        <div className="ep-catalog-head-actions">
          <span>{items.length} 条</span>
          {!readOnly && <button className="ep-button" onClick={() => setCreating(true)}><Plus size={15} />新建{kind}</button>}
        </div>
      </div>
      {!readOnly && (creating || editing) && (
        <ResourceBuilder
          kind="测评"
          assessmentKind={kind}
          resource={editing ?? undefined}
          notify={notify}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
      <div className="ep-tablewrap ep-academy-table">
        <table>
          <thead>
            <tr><th>编码 / 名称</th><th>关联岗位</th><th>题目</th><th>时长 / 合格线</th><th>状态</th><th>权属</th><th>操作</th></tr>
          </thead>
          <tbody>
            {items.map((resource) => {
              const content = resource.draftContent;
              const data = content.kind === "assessment" ? content.data : undefined;
              const job = data ? state.resources.find((item) => item.id === data.jobId && item.draftContent.kind === "job") : undefined;
              const jobName = job?.draftContent.kind === "job" ? job.draftContent.data.name : data?.jobId ?? "-";
              const rightsStatus = effectiveRightsStatus(resource.rights);
              return (
                <tr key={resource.id}>
                  <td><button className="ep-link" onClick={() => setEditing(resource)}>{resource.name}</button><small>{data?.code ?? resource.id}</small></td>
                  <td>{jobName}</td>
                  <td>{data?.questions.length ?? 0}</td>
                  <td>{data ? `${data.durationMinutes} 分钟 / ${data.passScore} 分` : "-"}</td>
                  <td><Tag tone={resource.status === "已发布" ? "success" : resource.status === "已驳回" ? "danger" : "warning"}>{resource.status}</Tag></td>
                  <td><Tag tone={rightsStatus === "已确权" ? "success" : rightsStatus === "已驳回" ? "danger" : "warning"}>{rightsStatus}</Tag></td>
                  <td>
                    <div className="ep-actions">
                      {!readOnly && <button onClick={() => setEditing(resource)}>编辑</button>}
                      {!readOnly && resource.status === "草稿" && <button onClick={() => submit(resource)}>提交审核</button>}
                      {!readOnly && resource.status === "已驳回" && <button onClick={() => submit(resource)}>重新提交</button>}
                      {!readOnly && resource.status === "已发布" && <button onClick={() => { resourceAction(resource.id, "offline", ""); notify(`${kind}已下线`); }}>下线</button>}
                      <Link href={`/platform/resource/${resource.id}`}>详情</Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length === 0 && <div className="ep-empty">暂无{kind}。</div>}
      </div>
    </>
  );
}

export function AssessmentStandardsPanel({ notify }: { notify: (message: string) => void }) {
  const { state, resourceAction } = useWorkspace();
  const { readOnly } = useConsoleAccess();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const items = state.resources.filter((item) => item.type === "评价标准");

  const submit = (resource: Resource) => {
    resourceAction(resource.id, "submit", "");
    notify("评价标准已提交审核");
  };

  return (
    <>
      <div className="ep-catalog-head">
        <PanelTitle title="认定规则" description="复用能力评价标准，配置等级、权重与认定条件。" />
        <div className="ep-catalog-head-actions">
          <span>{items.length} 条</span>
          {!readOnly && <button className="ep-button" onClick={() => setCreating(true)}><Plus size={15} />新建标准</button>}
        </div>
      </div>
      {!readOnly && (creating || editing) && (
        <ResourceBuilder
          kind="评价标准"
          resource={editing ?? undefined}
          notify={notify}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
      <div className="ep-tablewrap ep-academy-table">
        <table>
          <thead><tr><th>编码 / 名称</th><th>关联岗位</th><th>能力点</th><th>状态</th><th>权属</th><th>操作</th></tr></thead>
          <tbody>
            {items.map((resource) => {
              const content = resource.draftContent;
              const data = content.kind === "standard" ? content.data : undefined;
              const job = data ? state.resources.find((item) => item.id === data.jobId && item.draftContent.kind === "job") : undefined;
              const jobName = job?.draftContent.kind === "job" ? job.draftContent.data.name : data?.jobId ?? "-";
              const rightsStatus = effectiveRightsStatus(resource.rights);
              return (
                <tr key={resource.id}>
                  <td><button className="ep-link" onClick={() => setEditing(resource)}>{resource.name}</button><small>{data?.code ?? resource.id}</small></td>
                  <td>{jobName}</td>
                  <td>{data?.abilityPointWeights.length ?? 0}</td>
                  <td><Tag tone={resource.status === "已发布" ? "success" : resource.status === "已驳回" ? "danger" : "warning"}>{resource.status}</Tag></td>
                  <td><Tag tone={rightsStatus === "已确权" ? "success" : rightsStatus === "已驳回" ? "danger" : "warning"}>{rightsStatus}</Tag></td>
                  <td>
                    <div className="ep-actions">
                      {!readOnly && <button onClick={() => setEditing(resource)}>编辑</button>}
                      {!readOnly && resource.status === "草稿" && <button onClick={() => submit(resource)}>提交审核</button>}
                      {!readOnly && resource.status === "已驳回" && <button onClick={() => submit(resource)}>重新提交</button>}
                      {!readOnly && resource.status === "已发布" && <button onClick={() => { resourceAction(resource.id, "offline", ""); notify("评价标准已下线"); }}>下线</button>}
                      <Link href={`/platform/resource/${resource.id}`}>详情</Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length === 0 && <div className="ep-empty">暂无评价标准。</div>}
      </div>
    </>
  );
}

export function ExamSchedulesPanel({ notify }: { notify: (message: string) => void }) {
  const { state, replacePlatformAdmin } = useWorkspace();
  const { readOnly } = useConsoleAccess();
  const papers = publishedAssessments(state).filter((item) => item.kind === "试卷");
  const [assessmentId, setAssessmentId] = useState(papers[0]?.id ?? "");
  const [classId, setClassId] = useState(state.classGroups[0]?.id ?? state.classroom.id);
  const [openAt, setOpenAt] = useState("2026-12-01 09:00");
  const [closeAt, setCloseAt] = useState("2026-12-01 18:00");
  const selectedPaper = papers.find((item) => item.id === assessmentId);

  const createSchedule = () => {
    if (!selectedPaper) return notify("请先选择试卷");
    replacePlatformAdmin({
      ...state.platformAdmin,
      examSchedules: [
        {
          id: crypto.randomUUID(),
          assessmentId: selectedPaper.id,
          name: `${selectedPaper.name} · 新增考试`,
          classId,
          openAt,
          closeAt,
          durationMinutes: selectedPaper.durationMinutes,
          status: "待开始",
        },
        ...state.platformAdmin.examSchedules,
      ],
    });
    notify("考试安排已创建");
  };

  return (
    <>
      <div className="ep-catalog-head">
        <PanelTitle title="考试管理" description="选择试卷、考试班级与时间。" />
        <div className="ep-catalog-head-actions"><span>{state.platformAdmin.examSchedules.length} 场</span></div>
      </div>
      {!readOnly && <div className="ep-catalog-form">
        <div className="ep-form-grid">
          <label className="ep-form">试卷
            <select value={assessmentId} onChange={(event) => setAssessmentId(event.target.value)}>
              {papers.length === 0 && <option value="">暂无可排考试卷</option>}
              {papers.map((paper) => <option value={paper.id} key={paper.id}>{paper.name}</option>)}
            </select>
          </label>
          <label className="ep-form">考试班级
            <select value={classId} onChange={(event) => setClassId(event.target.value)}>
              {state.classGroups.map((group) => <option value={group.id} key={group.id}>{group.name}</option>)}
            </select>
          </label>
          <label className="ep-form">开始时间<input value={openAt} onChange={(event) => setOpenAt(event.target.value)} /></label>
          <label className="ep-form">结束时间<input value={closeAt} onChange={(event) => setCloseAt(event.target.value)} /></label>
        </div>
        <div className="ep-actions"><button className="ep-button" disabled={!selectedPaper} onClick={createSchedule}><Plus size={15} />创建考试</button></div>
      </div>}
      <div className="ep-tablewrap ep-academy-table">
        <table>
          <thead><tr><th>考试</th><th>试卷</th><th>班级</th><th>时间</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            {state.platformAdmin.examSchedules.map((schedule) => {
              const paper = publishedAssessments(state).find((item) => item.id === schedule.assessmentId);
              const group = state.classGroups.find((item) => item.id === schedule.classId);
              return (
                <tr key={schedule.id}>
                  <td><b>{schedule.name}</b></td>
                  <td>{paper?.name ?? schedule.assessmentId}</td>
                  <td>{group?.name ?? schedule.classId}</td>
                  <td><small>{schedule.openAt} 至 {schedule.closeAt}</small></td>
                  <td><Tag tone={schedule.status === "进行中" ? "success" : schedule.status === "已结束" ? "muted" : "warning"}>{schedule.status}</Tag></td>
                  <td>
                    {!readOnly && <button onClick={() => {
                      const nextStatus = schedule.status === "待开始" ? "进行中" : schedule.status === "进行中" ? "已结束" : "待开始";
                      replacePlatformAdmin({
                        ...state.platformAdmin,
                        examSchedules: state.platformAdmin.examSchedules.map((item) => item.id === schedule.id ? { ...item, status: nextStatus } : item),
                      });
                      notify(`考试已切换为${nextStatus}`);
                    }}>{schedule.status === "待开始" ? "开启考试" : schedule.status === "进行中" ? "结束考试" : "重新开启"}</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {state.platformAdmin.examSchedules.length === 0 && <div className="ep-empty">暂无考试安排。</div>}
      </div>
    </>
  );
}

export function LessonResultsPanel() {
  const { state, saveCatalogItem } = useWorkspace();
  const { readOnly } = useConsoleAccess();
  const [studentFilter, setStudentFilter] = useState("全部");
  const [editing, setEditing] = useState<{
    studentId: string;
    courseId: string;
    chapterIndex: number;
    score: number;
    comment: string;
  } | null>(null);
  const studentsWithProgress = state.studentRecords.filter(
    (student) => Object.keys(state.studentCourseProgress?.[student.id] ?? {}).length > 0,
  );
  const students = studentsWithProgress.filter((student) => studentFilter === "全部" || student.id === studentFilter);
  const rows = students.flatMap((student) =>
    Object.entries(state.studentCourseProgress?.[student.id] ?? {}).flatMap(([courseId, chapters]) => {
      const resource = state.resources.find((item) => item.id === courseId && item.draftContent.kind === "course");
      if (resource?.draftContent.kind !== "course") return [];
      const course = resource.draftContent.data;
      return chapters.map((chapterIndex) => ({
        studentId: student.id,
        studentName: student.name,
        courseId,
        courseName: course.name,
        chapterIndex,
        chapterTitle: course.chapters[chapterIndex]?.title ?? `第 ${chapterIndex + 1} 章`,
        result: state.lessonResults.find(
          (item) => item.studentId === student.id && item.courseId === courseId && item.chapterIndex === chapterIndex,
        ),
      }));
    }),
  );

  const save = () => {
    if (!editing) return;
    const student = state.studentRecords.find((item) => item.id === editing.studentId);
    if (!student) return;
    saveCatalogItem("lessonResults", {
      id: `${editing.studentId}-${editing.courseId}-${editing.chapterIndex}`,
      studentId: editing.studentId,
      courseId: editing.courseId,
      chapterIndex: editing.chapterIndex,
      score: editing.score,
      comment: editing.comment,
      reviewer: "周启明",
      reviewedAt: new Date().toLocaleString("zh-CN", { hour12: false }),
    });
    setEditing(null);
  };

  return (
    <section className="ep-catalog-panel">
      <div className="ep-catalog-head">
        <PanelTitle title="课程节点评价" description="按学生查看课程章节完成情况并评价。" />
        <div className="ep-catalog-head-actions">
          <select value={studentFilter} onChange={(event) => setStudentFilter(event.target.value)}>
            <option value="全部">全部学生</option>
            {studentsWithProgress.map((student) => <option value={student.id} key={student.id}>{student.name}</option>)}
          </select>
          <span>{rows.length} 个节点</span>
        </div>
      </div>
      <div className="ep-tablewrap ep-academy-table">
        <table>
          <thead><tr><th>学生</th><th>课程</th><th>章节</th><th>状态</th><th>得分</th><th>评语</th><th>操作</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.studentId}-${row.courseId}-${row.chapterIndex}`}>
                <td>{row.studentName}</td>
                <td>{row.courseName}</td>
                <td>{row.chapterTitle}</td>
                <td><Tag tone={row.result ? "success" : "warning"}>{row.result ? "已评价" : "待评价"}</Tag></td>
                <td>{row.result?.score ?? "-"}</td>
                <td>{row.result?.comment ?? "-"}</td>
                <td>
                  {!readOnly && (
                    <button onClick={() => setEditing({
                      studentId: row.studentId,
                      courseId: row.courseId,
                      chapterIndex: row.chapterIndex,
                      score: row.result?.score ?? 80,
                      comment: row.result?.comment ?? "",
                    })}>{row.result ? "重新评价" : "评价"}</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="ep-empty">当前筛选下没有课程学习记录。</div>}
      </div>
      {!readOnly && editing && (
        <div className="ep-catalog-form">
          <div className="ep-catalog-form-head"><h3>课程节点评价</h3><button onClick={() => setEditing(null)}>关闭</button></div>
          <div className="ep-form-grid">
            <label className="ep-form">得分<input type="number" min="0" max="100" value={editing.score} onChange={(event) => setEditing({ ...editing, score: Number(event.target.value) })} /></label>
            <label className="ep-form wide">评语<textarea value={editing.comment} onChange={(event) => setEditing({ ...editing, comment: event.target.value })} /></label>
          </div>
          <div className="ep-actions">
            <button className="ep-button" onClick={save}>保存评价</button>
            <button className="ep-button secondary" onClick={() => setEditing(null)}>取消</button>
          </div>
        </div>
      )}
    </section>
  );
}

export function ExamResultsPanel() {
  const { state } = useWorkspace();
  const attempts = [...state.examAttempts].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  return (
    <section className="ep-catalog-panel">
      <div className="ep-catalog-head"><PanelTitle title="日常考试评价" description="学生考试成绩与通过状态。" /><div className="ep-catalog-head-actions"><span>{attempts.length} 条</span></div></div>
      <div className="ep-tablewrap ep-academy-table">
        <table>
          <thead><tr><th>学生</th><th>测评</th><th>成绩</th><th>结果</th><th>提交时间</th></tr></thead>
          <tbody>
            {attempts.map((attempt) => {
              const student = state.studentRecords.find((item) => item.id === attempt.studentId);
              return (
                <tr key={attempt.id}>
                  <td>{student?.name ?? attempt.studentId}</td>
                  <td>{attempt.assessmentName ?? attempt.assessmentId ?? "岗位测评"}</td>
                  <td><b>{attempt.score}</b></td>
                  <td><Tag tone={attempt.passed ? "success" : "warning"}>{attempt.passed ? "通过" : "未通过"}</Tag></td>
                  <td>{attempt.submittedAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {attempts.length === 0 && <div className="ep-empty">暂无考试记录。</div>}
      </div>
    </section>
  );
}

export function AbilityResultsPanel() {
  const { state } = useWorkspace();
  const rows = state.studentRecords
    .map((student) => {
      const attempts = state.examAttempts
        .filter((item) => item.studentId === student.id)
        .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
      const latest = attempts[0];
      const certificate = state.certificates.find((item) => item.studentId === student.id);
      const completedScenes = state.sceneCompletions.filter((item) => item.studentId === student.id && item.status === "已完成").length;
      return { student, latest, certificate, completedScenes };
    })
    .filter((row) => row.latest || row.certificate || row.completedScenes > 0);

  return (
    <section className="ep-catalog-panel">
      <div className="ep-catalog-head"><PanelTitle title="认定结果" description="考试成绩、场景完成与结业凭证。" /><div className="ep-catalog-head-actions"><span>{rows.length} 人</span></div></div>
      <div className="ep-tablewrap ep-academy-table">
        <table>
          <thead><tr><th>学生</th><th>班级</th><th>最近成绩</th><th>完成场景</th><th>凭证</th></tr></thead>
          <tbody>
            {rows.map(({ student, latest, certificate, completedScenes }) => (
              <tr key={student.id}>
                <td>{student.name}<small>{student.studentNo}</small></td>
                <td>{state.classGroups.find((item) => item.id === student.classId)?.name ?? student.classId}</td>
                <td>{latest ? <><b>{latest.score}</b> <Tag tone={latest.passed ? "success" : "warning"}>{latest.passed ? "通过" : "未通过"}</Tag></> : "未测评"}</td>
                <td>{completedScenes}</td>
                <td>{certificate ? <Tag tone="success">{certificate.number}</Tag> : <Tag tone="muted">未发放</Tag>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="ep-empty">暂无认定结果。</div>}
      </div>
    </section>
  );
}

export function renderAssessmentPage(
  platformId: string,
  pageId: string,
  notify: (message: string) => void,
): ReactNode | null {
  if (platformId !== "ability") return null;
  if (pageId === "question-banks") return <AssessmentCatalogPanel kind="题库" notify={notify} />;
  if (pageId === "exams") return <AssessmentCatalogPanel kind="试卷" notify={notify} />;
  if (pageId === "job-ability") return <AssessmentStandardsPanel notify={notify} />;
  if (pageId === "exam-usage") return <ExamSchedulesPanel notify={notify} />;
  if (pageId === "lesson-results") return <LessonResultsPanel />;
  if (pageId === "daily-exams") return <ExamResultsPanel />;
  if (pageId === "job-ability-results") return <AbilityResultsPanel />;
  return null;
}
