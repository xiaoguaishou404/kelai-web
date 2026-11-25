"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronRight,
  Download,
  Eye,
  Plus,
  Settings2,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import {
  approvalIdentityLabels,
  findPlatformPage,
  platformDefinitions,
  type ApprovalIdentity,
  type PlatformRecord,
} from "@/lib/platform-admin";
import { isReadOnlyFor, moduleOwner, ownerLabel, roleOwner } from "@/lib/platform-admin/permissions";
import { ConsoleAccessProvider } from "@/components/enterprise/console-access";
import {
  effectiveRightsStatus,
  publishedAssessments,
  publishedJobs,
  publishedScenes,
  type JobLearningPath,
} from "@/lib/enterprise-workspace";
import { useWorkspace } from "@/components/enterprise/workspace-store";
import { RecordEditor } from "./record-editor";
import { renderCatalogPage } from "./catalog-panels";
import { renderCareerPage } from "./career-panels";
import { renderScenePage } from "./scene-panels";
import { renderCoursePage } from "./course-panels";
import { renderAssessmentPage } from "./assessment-panels";
import { renderServicePage } from "./service-panels";
import { renderCertificatePage } from "./certificate-panels";
import { renderAcademicPage } from "./academic-panels";

function toneFor(status: string) {
  if (["已发布", "已通过", "已报名", "已归档"].includes(status)) return "success";
  if (["草稿", "即将开放", "未开放"].includes(status)) return "muted";
  if (["已驳回", "停用", "已下线"].includes(status)) return "danger";
  return "warning";
}

function downloadCsv(name: string, rows: PlatformRecord[]) {
  const fields = ["名称", "编码", "状态", "负责人", "更新时间"];
  const content = [
    fields.join(","),
    ...rows.map((item) => [item.name, item.code, item.status, item.owner, item.updatedAt].map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")),
  ].join("\n");
  const blob = new Blob([`\ufeff${content}`], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${name}.csv`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

export function AcademyConsole({
  path,
  notify,
}: {
  path: string[];
  notify: (message: string) => void;
}) {
  const {
    state,
    resourceAction,
    replacePlatformAdmin,
    setApprovalIdentity,
    savePlatformRecord,
    saveLearningPath,
  } = useWorkspace();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<PlatformRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [approvalView, setApprovalView] = useState<"pending" | "done">("pending");
  const pathJobs = publishedJobs(state);
  const [pathJobId, setPathJobId] = useState(pathJobs[0]?.id ?? "service");
  const [learningPathDraft, setLearningPathDraft] = useState<JobLearningPath | null>(
    () => state.learningPaths.find((item) => item.jobId === (pathJobs[0]?.id ?? "service")) ?? null,
  );
  const platformId = path[1] && platformDefinitions.some((item) => item.id === path[1]) ? path[1] : "career";
  const platform = platformDefinitions.find((item) => item.id === platformId) ?? platformDefinitions[0];
  const defaultPage = platform.groups[0].pages[0].id;
  const pageId = path[2] && findPlatformPage(platform.id, path[2]).page ? path[2] : defaultPage;
  const definition = findPlatformPage(platform.id, pageId);
  const currentPage = definition.page!;
  const readOnly = isReadOnlyFor(state.role, platform.id, pageId);
  const owner = roleOwner(state.role);
  const catalogPanel = renderCatalogPage(platform.id, pageId);
  const careerPanel = renderCareerPage(platform.id, pageId, notify);
  const scenePanel = renderScenePage(platform.id, pageId, notify);
  const coursePanel = renderCoursePage(platform.id, pageId, notify);
  const assessmentPanel = renderAssessmentPage(platform.id, pageId, notify);
  const servicePanel = renderServicePage(platform.id, pageId);
  const certificatePanel = renderCertificatePage(platform.id, pageId, notify);
  const academicPanel = renderAcademicPage(platform.id, pageId);
  const linkedTypes =
    platform.id === "career" ? ["岗位"] :
      platform.id === "scene" ? ["场景"] :
        platform.id === "course" && ["system", "granular", "hybrid", "culture"].includes(pageId) ? ["课程"] :
          platform.id === "ability" && ["question-banks", "exams"].includes(pageId) ? ["测评"] :
            [];
  const linkedResources = state.resources.filter((item) => linkedTypes.includes(item.type));
  const records = state.platformAdmin.records.filter(
    (item) =>
      item.platformId === platform.id &&
      item.pageId === pageId &&
      `${item.name}${item.code}${item.owner}${item.status}`.toLowerCase().includes(query.toLowerCase()),
  );
  const identity = state.platformAdmin.reviewerIdentity;
  const platformApprovals = useMemo(
    () => state.platformAdmin.approvals.filter((item) => item.platformId === platform.id),
    [state.platformAdmin.approvals, platform.id],
  );
  const approvals = platformApprovals.filter((item) => approvalView === "pending" ? item.status === "审批中" : item.status !== "审批中");
  const workflows = state.platformAdmin.workflows.filter((item) => item.platformId === platform.id);
  const batches = state.platformAdmin.batches.filter((item) => item.platformId === platform.id);
  const schedules = state.platformAdmin.examSchedules;
  const certificateDefinitions = state.platformAdmin.certificates;
  const enrollments = state.platformAdmin.enrollments;
  const sceneProfiles = publishedScenes(state);
  const selectedPathJob = pathJobs.find((item) => item.id === pathJobId);
  const pathSceneOptions = sceneProfiles;

  const updateAdmin = (patch: Partial<typeof state.platformAdmin>) =>
    replacePlatformAdmin({ ...state.platformAdmin, ...patch });

  const createConfiguredItem = () => {
    if (pageId === "workflows") {
      updateAdmin({
        workflows: [
          ...state.platformAdmin.workflows,
          {
            id: crypto.randomUUID(),
            platformId: platform.id,
            name: `${platform.short}资源审批流程`,
            description: "院校审批身份按顺序处理",
            steps: [
              { name: "院系初审", identity: "departmentLead" },
              { name: "专业复核", identity: "majorLead" },
              { name: "教务终审", identity: "academicAffairs" },
            ],
          },
        ],
      });
      notify("已创建三级审批流程");
      return;
    }
    if (pageId === "batches") {
      const flow = workflows[0];
      if (!flow) return notify("请先配置审批流程");
      updateAdmin({
        batches: [
          ...state.platformAdmin.batches,
          {
            id: crypto.randomUUID(),
            platformId: platform.id,
            name: `2027 春季${platform.short}资源建设批次`,
            code: `BATCH-2027-${String(state.platformAdmin.batches.length + 1).padStart(3, "0")}`,
            flowId: flow.id,
            status: "开放中",
            createdAt: new Date().toLocaleString("zh-CN", { hour12: false }),
          },
        ],
      });
      notify("建设批次已创建");
      return;
    }
    if (pageId === "exam-usage") {
      const assessment = publishedAssessments(state)[0];
      if (!assessment) return notify("请先建设岗位测评");
      updateAdmin({
        examSchedules: [
          ...state.platformAdmin.examSchedules,
          {
            id: crypto.randomUUID(),
            assessmentId: assessment.id,
            name: `${assessment.name} · 新增考试`,
            classId: state.classroom.id,
            openAt: "2026-12-01 09:00",
            closeAt: "2026-12-01 18:00",
            durationMinutes: assessment.durationMinutes,
            status: "待开始",
          },
        ],
      });
      notify("考试安排已创建");
      return;
    }
    if (pageId === "certificates") {
      updateAdmin({
        certificates: [
          ...state.platformAdmin.certificates,
          {
            id: crypto.randomUUID(),
            name: "网络分析专项能力证书（示例）",
            category: "行业认证",
            issuer: "行业能力认证机构（示例）",
            level: "初级",
            jobIds: ["operations"],
            abilityCount: 12,
            condition: "完成规定学习路径并通过实操测评",
            format: "在线测评 + 成果评审",
            examDate: "2027-01-12",
            status: "即将开放",
            sample: true,
          },
        ],
      });
      notify("证书资源已创建");
      return;
    }
    setCreating(true);
  };

  const saveRecord = (record: PlatformRecord) => {
    savePlatformRecord({ ...record, updatedAt: new Date().toLocaleString("zh-CN", { hour12: false }) });
    notify(editing ? "业务记录已更新" : "业务记录已创建");
    setEditing(null);
    setCreating(false);
  };

  const approve = (id: string) => {
    const request = state.platformAdmin.approvals.find((item) => item.id === id);
    if (!request) return;
    const step = request.steps[request.currentStep];
    if (!step || step.identity !== identity) {
      notify(`当前步骤需由${step ? approvalIdentityLabels[step.identity] : "审批人"}处理`);
      return;
    }
    const now = new Date().toLocaleString("zh-CN", { hour12: false });
    const steps = request.steps.map((item, index) =>
      index === request.currentStep
        ? { ...item, state: "approved" as const, actor: approvalIdentityLabels[identity], note: "同意进入下一环节", at: now }
        : item,
    );
    const finished = request.currentStep >= steps.length - 1;
    updateAdmin({
      approvals: state.platformAdmin.approvals.map((item) =>
        item.id === id
          ? {
              ...item,
              steps,
              currentStep: finished ? item.currentStep : item.currentStep + 1,
              status: finished ? "已通过" : "审批中",
            }
          : item,
      ),
    });
    if (finished && request.resourceId) {
      const resource = state.resources.find((item) => item.id === request.resourceId);
      if (resource?.rights && effectiveRightsStatus(resource.rights) !== "已确权") {
        resourceAction(request.resourceId, "confirm-rights", "审批终审通过，权属同步确认");
      }
      resourceAction(request.resourceId, "publish", "审批终审通过");
    }
    notify(finished ? "审批已通过并完成发布" : `已通过，流转至${approvalIdentityLabels[steps[request.currentStep + 1]?.identity] ?? "下一节点"}`);
  };

  const reject = (id: string) => {
    const request = state.platformAdmin.approvals.find((item) => item.id === id);
    if (!request) return;
    const step = request.steps[request.currentStep];
    if (!step || step.identity !== identity) {
      notify(`当前步骤需由${step ? approvalIdentityLabels[step.identity] : "审批人"}处理`);
      return;
    }
    const now = new Date().toLocaleString("zh-CN", { hour12: false });
    updateAdmin({
      approvals: state.platformAdmin.approvals.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "已驳回",
              steps: item.steps.map((child, index) =>
                index === item.currentStep
                  ? { ...child, state: "rejected" as const, actor: approvalIdentityLabels[identity], note: "材料需补充后重新提交", at: now }
                  : child,
              ),
            }
          : item,
      ),
    });
    if (request.resourceId) resourceAction(request.resourceId, "reject", "审批驳回，请补充资源内容");
    notify("已驳回并回写资源状态");
  };


  if (!owner) {
    return (
      <div className="ep-academy">
        <div className="ep-empty">当前身份无权进入管理后台，请切换为科来管理或院校管理身份。</div>
      </div>
    );
  }

  return (
    <ConsoleAccessProvider value={{ readOnly, owner, pageTitle: currentPage.label }}>
    <div className="ep-academy">
      <div className="ep-console-toolbar">
        <span>{platform.label}</span>
        <div className="ep-actions">
          {pageId === "approvals" && (
            <label className="ep-reviewer-switch">
              <ShieldCheck size={16} />
              <span>审批身份</span>
              <select
                value={identity}
                onChange={(event) => {
                  setApprovalIdentity(event.target.value as ApprovalIdentity);
                  notify(`已切换为${approvalIdentityLabels[event.target.value as ApprovalIdentity]}`);
                }}
              >
                {(Object.entries(approvalIdentityLabels) as [ApprovalIdentity, string][]).map(([key, value]) => (
                  <option value={key} key={key}>{value}</option>
                ))}
              </select>
            </label>
          )}
          {currentPage.capabilities.includes("export") && (
            <button className="ep-button secondary" onClick={() => downloadCsv(currentPage.label, records)}>
              <Download size={15} />{pageId === "portraits" ? "导出 CSV" : "导出"}
            </button>
          )}
          {!readOnly && !academicPanel && !certificatePanel && !servicePanel && !assessmentPanel && !coursePanel && !scenePanel && !careerPanel && !catalogPanel && currentPage.capabilities.includes("create") && pageId !== "learn-roads" && (
            <button className="ep-button" onClick={createConfiguredItem}>
              <Plus size={15} />新建{currentPage.entity}
            </button>
          )}
        </div>
      </div>

      {readOnly && (
        <p className="ep-status warn">当前身份只读：该模块由{ownerLabel(moduleOwner(platform.id, pageId))}维护。</p>
      )}

      <div className="ep-academy-main">

          {academicPanel ? academicPanel : certificatePanel ? certificatePanel : servicePanel ? servicePanel : assessmentPanel ? assessmentPanel : coursePanel ? coursePanel : scenePanel ? scenePanel : careerPanel ? careerPanel : catalogPanel ? catalogPanel : pageId === "learn-roads" ? (
            <section className="ep-path-editor">
              <div className="ep-path-editor-head">
                <label className="ep-form">
                  岗位
                  <select value={pathJobId} onChange={(event) => {
                    const nextJobId = event.target.value;
                    setPathJobId(nextJobId);
                    setLearningPathDraft(
                      state.learningPaths.find((item) => item.jobId === nextJobId) ?? {
                        id: `path-${nextJobId}`,
                        jobId: nextJobId,
                        name: `${pathJobs.find((item) => item.id === nextJobId)?.name ?? "岗位"}学习路径`,
                        description: "按岗位任务顺序编排实践场景。",
                        version: "V1.0",
                        sceneNodes: [],
                      },
                    );
                  }}>
                    {pathJobs.map((job) => <option value={job.id} key={job.id}>{job.name}</option>)}
                  </select>
                </label>
                {selectedPathJob && (
                  <a className="ep-button secondary" href={`/platform/job/${selectedPathJob.id}#job-learning-path`}>
                    <Eye size={15} />预览前台路径
                  </a>
                )}
              </div>
              {learningPathDraft && (
                <>
                  <div className="ep-form-grid">
                    <label className="ep-form">路径名称<input value={learningPathDraft.name} onChange={(event) => setLearningPathDraft({ ...learningPathDraft, name: event.target.value })} /></label>
                    <label className="ep-form">版本<input value={learningPathDraft.version} onChange={(event) => setLearningPathDraft({ ...learningPathDraft, version: event.target.value })} /></label>
                    <label className="ep-form ep-path-description">路径说明<textarea value={learningPathDraft.description} onChange={(event) => setLearningPathDraft({ ...learningPathDraft, description: event.target.value })} /></label>
                  </div>
                  <div className="ep-path-node-list">
                    <header>
                      <div><h3>场景节点</h3><p>{learningPathDraft.sceneNodes.length} 个节点，按学习顺序执行。</p></div>
                      <button
                        className="ep-button secondary"
                        disabled={pathSceneOptions.every((scene) => learningPathDraft.sceneNodes.some((node) => node.sceneId === scene.id))}
                        onClick={() => {
                          const scene = pathSceneOptions.find((item) => !learningPathDraft.sceneNodes.some((node) => node.sceneId === item.id));
                          if (!scene) return;
                          setLearningPathDraft({
                            ...learningPathDraft,
                            sceneNodes: [
                              ...learningPathDraft.sceneNodes,
                              {
                                id: crypto.randomUUID(),
                                sceneId: scene.id,
                                phase: `实践阶段 ${learningPathDraft.sceneNodes.length + 1}`,
                                required: true,
                              },
                            ],
                          });
                        }}
                      >
                        <Plus size={15} />添加场景
                      </button>
                    </header>
                    {learningPathDraft.sceneNodes.map((node, index) => (
                      <article key={node.id}>
                        <span className="ep-number">{index + 1}</span>
                        <select
                          value={node.sceneId}
                          onChange={(event) => setLearningPathDraft({
                            ...learningPathDraft,
                            sceneNodes: learningPathDraft.sceneNodes.map((item) => item.id === node.id ? { ...item, sceneId: event.target.value } : item),
                          })}
                        >
                          {pathSceneOptions.map((scene) => <option value={scene.id} key={scene.id}>{scene.name} · {pathJobs.find((job) => job.id === scene.jobId)?.name ?? scene.jobId}</option>)}
                        </select>
                        <input
                          value={node.phase}
                          onChange={(event) => setLearningPathDraft({
                            ...learningPathDraft,
                            sceneNodes: learningPathDraft.sceneNodes.map((item) => item.id === node.id ? { ...item, phase: event.target.value } : item),
                          })}
                          placeholder="阶段名称"
                        />
                        <label><input type="checkbox" checked={node.required} onChange={(event) => setLearningPathDraft({
                          ...learningPathDraft,
                          sceneNodes: learningPathDraft.sceneNodes.map((item) => item.id === node.id ? { ...item, required: event.target.checked } : item),
                        })} />必做</label>
                        <div className="ep-actions">
                          <button disabled={index === 0} aria-label="上移" onClick={() => {
                            const nodes = [...learningPathDraft.sceneNodes];
                            [nodes[index - 1], nodes[index]] = [nodes[index], nodes[index - 1]];
                            setLearningPathDraft({ ...learningPathDraft, sceneNodes: nodes });
                          }}><ArrowUp size={14} /></button>
                          <button disabled={index === learningPathDraft.sceneNodes.length - 1} aria-label="下移" onClick={() => {
                            const nodes = [...learningPathDraft.sceneNodes];
                            [nodes[index], nodes[index + 1]] = [nodes[index + 1], nodes[index]];
                            setLearningPathDraft({ ...learningPathDraft, sceneNodes: nodes });
                          }}><ArrowDown size={14} /></button>
                          <button aria-label="删除节点" onClick={() => setLearningPathDraft({
                            ...learningPathDraft,
                            sceneNodes: learningPathDraft.sceneNodes.filter((item) => item.id !== node.id),
                          })}><Trash2 size={14} /></button>
                        </div>
                      </article>
                    ))}
                    {learningPathDraft.sceneNodes.length === 0 && <div className="ep-empty">尚未添加场景，请选择“添加场景”。</div>}
                  </div>
                  <footer className="ep-path-editor-footer">
                    <span>{selectedPathJob?.name} · {learningPathDraft.sceneNodes.length} 个场景 · {learningPathDraft.sceneNodes.filter((node) => node.required).length} 个必做</span>
                    <button className="ep-button" disabled={readOnly || !learningPathDraft.name.trim() || learningPathDraft.sceneNodes.length === 0} onClick={() => {
                      if (readOnly) return;
                      saveLearningPath(learningPathDraft);
                      notify("岗位学习路径已保存，并同步至前台");
                    }}>保存路径</button>
                  </footer>
                </>
              )}
            </section>
          ) : pageId === "workflows" ? (
            <section className="ep-config-list">
              {workflows.map((workflow) => (
                <article key={workflow.id}>
                  <header><div><h3>{workflow.name}</h3><p>{workflow.description}</p></div><span className="ep-tag is-success">启用中</span></header>
                  <div className="ep-flow-steps">
                    {workflow.steps.map((step, index) => <div key={`${workflow.id}-${step.identity}`}><i>{index + 1}</i><b>{step.name}</b><small>{approvalIdentityLabels[step.identity]}</small></div>)}
                  </div>
                </article>
              ))}
              {workflows.length === 0 && <div className="ep-empty">尚未配置审批流程。</div>}
            </section>
          ) : pageId === "scene-results" ? (
            <section className="ep-scene-results">
              <div className="ep-certificate-summary">
                <div><small>任务成果</small><b>{state.taskSubmissions.length}</b></div>
                <div><small>待教师评价</small><b>{state.taskSubmissions.filter((item) => item.status === "待评价").length}</b></div>
                <div><small>已完成场景</small><b>{state.sceneCompletions.filter((item) => item.status === "已完成").length}</b></div>
              </div>
              <div className="ep-tablewrap ep-academy-table">
                <table>
                  <thead><tr><th>学生</th><th>场景 / 任务</th><th>任务类型</th><th>状态</th><th>得分</th><th>更新时间</th></tr></thead>
                  <tbody>
                    {state.taskSubmissions.map((submission) => {
                      const scene = sceneProfiles.find((item) => item.id === submission.sceneId);
                      const task = scene?.taskDetails?.find((item) => item.id === submission.taskId);
                      const score = submission.reviews[submission.reviews.length - 1]?.total;
                      return (
                        <tr key={submission.id}>
                          <td><b>{submission.studentName}</b></td>
                          <td><b>{scene?.name ?? submission.sceneId}</b><small>{task?.title ?? submission.taskId}</small></td>
                          <td>{task?.type ?? "-"}</td>
                          <td><span className={`ep-tag is-${submission.status === "已通过" ? "success" : submission.status === "已退回" ? "danger" : "warning"}`}>{submission.status}</span></td>
                          <td>{score ?? "-"}</td>
                          <td>{submission.updatedAt}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ) : pageId === "batches" ? (
            <section className="ep-config-list">
              {batches.map((batch) => (
                <article key={batch.id}>
                  <header><div><h3>{batch.name}</h3><p>{batch.code} · {workflows.find((item) => item.id === batch.flowId)?.name}</p></div><span className={`ep-tag is-${batch.status === "开放中" ? "success" : "muted"}`}>{batch.status}</span></header>
                  <footer><span>创建于 {batch.createdAt}</span>{!readOnly && <button className="ep-button secondary" onClick={() => {
                    updateAdmin({ batches: state.platformAdmin.batches.map((item) => item.id === batch.id ? { ...item, status: item.status === "开放中" ? "已截止" : "开放中" } : item) });
                    notify(batch.status === "开放中" ? "批次已截止" : "批次已重新开放");
                  }}>{batch.status === "开放中" ? "截止批次" : "重新开放"}</button>}</footer>
                </article>
              ))}
              {batches.length === 0 && <div className="ep-empty">尚未创建建设批次。</div>}
            </section>
          ) : pageId === "exam-usage" ? (
            <section className="ep-config-list">
              {schedules.map((schedule) => (
                <article key={schedule.id}>
                  <header><div><h3>{schedule.name}</h3><p>{schedule.openAt} 至 {schedule.closeAt} · {schedule.durationMinutes} 分钟</p></div><span className={`ep-tag is-${schedule.status === "进行中" ? "success" : schedule.status === "待开始" ? "warning" : "muted"}`}>{schedule.status}</span></header>
                  <footer><span>考试对象：网络工程 2401</span><button className="ep-button secondary" onClick={() => {
                    updateAdmin({ examSchedules: state.platformAdmin.examSchedules.map((item) => item.id === schedule.id ? { ...item, status: item.status === "进行中" ? "已结束" : "进行中" } : item) });
                    notify(schedule.status === "进行中" ? "考试已结束" : "考试已开启");
                  }}>{schedule.status === "进行中" ? "结束考试" : "开启考试"}</button></footer>
                </article>
              ))}
            </section>
          ) : pageId === "certificates" ? (
            <section className="ep-config-list">
              {certificateDefinitions.map((certificate) => {
                const related = enrollments.filter((item) => item.certificateId === certificate.id);
                return (
                  <article key={certificate.id}>
                    <header><div><h3>{certificate.name}</h3><p>{certificate.category} · {certificate.issuer} · {certificate.level}</p></div><span className="ep-tag is-warning">{certificate.status}</span></header>
                    <footer><span>{certificate.sample ? "演示认证" : "平台认证"} · {related.length} 人报名</span><a className="ep-button secondary" href={`/platform/certificate/${certificate.id}`}>查看详情</a></footer>
                  </article>
                );
              })}
            </section>
          ) : pageId === "approvals" ? (
            <section className="ep-approval-list">
              <div className="ep-approval-tabs">
                <button className={approvalView === "pending" ? "active" : ""} onClick={() => setApprovalView("pending")}>待审批 {platformApprovals.filter((item) => item.status === "审批中").length}</button>
                <button className={approvalView === "done" ? "active" : ""} onClick={() => setApprovalView("done")}>已审批 {platformApprovals.filter((item) => item.status !== "审批中").length}</button>
              </div>
              {approvals.length === 0 ? <div className="ep-empty">{approvalView === "pending" ? "暂无待审批记录。" : "暂无已审批记录。"}</div> : approvals.map((request) => {
                const step = request.steps[request.currentStep];
                const canAct = !readOnly && request.status === "审批中" && step?.identity === identity;
                return (
                  <article key={request.id}>
                    <header>
                      <div>
                        <h3>{request.title}</h3>
                        <p>{request.code} · {request.submittedBy} · {request.submittedAt}</p>
                      </div>
                      <span className={`ep-tag is-${request.status === "已通过" ? "success" : request.status === "已驳回" ? "danger" : "warning"}`}>{request.status}</span>
                    </header>
                    <div className="ep-approval-steps">
                      {request.steps.map((item, index) => (
                        <div className={item.state} key={item.id}>
                          <i>{item.state === "approved" ? <Check size={12} /> : index + 1}</i>
                          <b>{item.name}</b>
                          <small>{approvalIdentityLabels[item.identity]}</small>
                        </div>
                      ))}
                    </div>
                    <footer>
                      <span>{request.status !== "审批中" ? `流程已${request.status === "已通过" ? "完成" : "驳回"}` : canAct ? `当前由你以${approvalIdentityLabels[identity]}身份处理` : `等待${step ? approvalIdentityLabels[step.identity] : "审批人"}处理`}</span>
                      {request.status === "审批中" && <div className="ep-actions">
                        <button className="ep-button secondary" onClick={() => reject(request.id)} disabled={!canAct}>
                          <X size={14} />驳回
                        </button>
                        <button className="ep-button" onClick={() => approve(request.id)} disabled={!canAct}>
                          <Check size={14} />通过本步
                        </button>
                      </div>}
                    </footer>
                  </article>
                );
              })}
            </section>
          ) : (
            <>
              <div className="ep-status warn">演示占位：该页面仍为通用业务记录，功能待接入真实数据。</div>
              {linkedResources.length > 0 && (
                <section className="ep-linked-resources">
                  <div className="ep-section-title"><div><h3>已在公开资源馆使用的{linkedTypes.join("、")}资源</h3><p>进入资源详情可继续维护内容、权属和审核状态。</p></div></div>
                  <div className="ep-grid">
                    {linkedResources.map((resource) => (
                      <article key={resource.id}>
                        <span className={`ep-tag is-${toneFor(resource.status)}`}>{resource.status}</span>
                        <h3>{resource.name}</h3>
                        <p>{resource.description}</p>
                        <div><small>{resource.version} · {resource.rights.ownership}</small><a href={`/platform/resource/${resource.id}`}>维护资源<ChevronRight size={13} /></a></div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
              <div className="ep-admin-toolbar">
                <label className="ep-search">
                  <Settings2 size={15} />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`搜索${currentPage.entity}名称、编码或负责人`} />
                </label>
                <span>{records.length} 条记录</span>
              </div>
              <div className="ep-tablewrap ep-academy-table">
                <table>
                  <thead>
                    <tr><th>名称</th><th>编码</th><th>状态</th><th>负责人</th><th>更新时间</th><th>操作</th></tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id}>
                        <td><b>{record.name}</b><small>{Object.entries(record.data).slice(0, 1).map(([, value]) => String(value)).join("")}</small></td>
                        <td>{record.code}</td>
                        <td><span className={`ep-tag is-${toneFor(record.status)}`}>{record.status}</span></td>
                        <td>{record.owner}</td>
                        <td>{record.updatedAt}</td>
                        <td>
                          <div className="ep-actions">
                            {!readOnly && currentPage.capabilities.includes("edit") && <button onClick={() => setEditing(record)}>编辑</button>}
                            {!readOnly && currentPage.capabilities.includes("archive") && record.status !== "已归档" && (
                              <button onClick={() => {
                                savePlatformRecord({ ...record, status: "已归档", updatedAt: new Date().toLocaleString("zh-CN", { hour12: false }) });
                                notify("记录已归档");
                              }}><Archive size={13} />归档</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {records.length === 0 && <div className="ep-empty">当前页面还没有业务记录。</div>}
              </div>
            </>
          )}
      </div>

      {!readOnly && (creating || editing) && (
        <RecordEditor
          record={editing}
          platformId={platform.id}
          pageId={pageId}
          entity={currentPage.entity}
          group={definition.group?.label ?? ""}
          onSave={saveRecord}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
        />
      )}
    </div>
    </ConsoleAccessProvider>
  );
}
