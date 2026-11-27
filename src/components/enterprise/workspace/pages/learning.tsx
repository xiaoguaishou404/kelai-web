import { Link } from "@/components/router/link";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronRight,
  Download,
  GraduationCap,
  LockKeyhole,
} from "lucide-react";
import {
  abilityScores,
  classMetrics,
  dimensions,
  examQuestions,
  latestWork,
  learningPathProgress,
  nowLabel,
  resourceName,
  resourceRightsBlockedReason,
  resourceVisible,
  resumeComplete,
  sceneProgressFor,
  taskDetailById,
  taskCompletionFor,
  taskSubmissionBlockedReason,
  taskSubmissionFor,
  workReview,
  type Application,
  type Resume,
  type SceneAssessmentMethod,
  type SceneProfile,
  type TaskAssessmentResult,
  type TaskSubmission,
  type Work,
} from "@/lib/enterprise-workspace";
import { useWorkspacePage } from "@/components/enterprise/workspace/page-runtime";
import {
  Btn,
  Card,
  Empty,
  History,
  Metric,
  Tag,
  applicationTone,
} from "@/components/enterprise/workspace/ui";

export function StudentHome() {
  const { checkInSession, jobById, notify, sceneById, state, taskStatusTone } = useWorkspacePage();
  const scores = abilityScores(state);
  const metrics = classMetrics(state);
  const taskPending = state.taskSubmissions.filter((item) => item.status === "待评价").length;
  const taskPassed = state.taskSubmissions.filter((item) => item.status === "已通过").length;
  const scenesCompleted = state.sceneCompletions.filter((item) => item.status === "已完成").length;
  const upcomingSessions = state.offlineSessions.filter((item) => item.classId === state.classroom.id);
  const jobPaths = state.learningPaths
    .map((path) => {
      const job = jobById(path.jobId);
      const progress = learningPathProgress(state, path.jobId);
      return job ? { job, path, progress } : undefined;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  return (
    <>
      <Card className="ep-welcome">
        <div><Tag>MY LEARNING</Tag><h1>{state.resume.name}，向下一项岗位能力出发</h1><p>{state.classroom.name} · {state.resume.education}</p></div>
        <GraduationCap size={76} strokeWidth={1} />
      </Card>
      <div className="ep-stats">
        <Metric label="学习路径" value={jobPaths.length} />
        <Metric label="通过任务" value={taskPassed} />
        <Metric label="完成场景" value={scenesCompleted} />
        <Metric label="待评价任务" value={taskPending} />
      </div>
      <Card className="ep-practice-paths-card">
        <h2>岗位实践路径</h2>
        {jobPaths.length > 0 ? (
          <div className="ep-practice-path-list">
            {jobPaths.map(({ job, path, progress }) => {
              const percent = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
              return (
                <Link className="ep-practice-path" href={`/platform/job/${job.id}`} key={path.id}>
                  <header>
                    <span className="ep-practice-path-icon"><BriefcaseBusiness size={17} /></span>
                    <span className="ep-grow">
                      <b>{job.name}</b>
                      <small>{progress.completed}/{progress.total} 个场景{progress.score !== undefined ? ` · ${progress.score} 分` : ""}</small>
                    </span>
                    <ChevronRight size={16} />
                  </header>
                  <span className="ep-practice-path-meter" aria-label={`路径完成 ${percent}%`}>
                    <span style={{ width: `${percent}%` }} />
                  </span>
                  <div className="ep-practice-path-track">
                    {progress.nodes.map((item, index) => {
                      const nodeClass =
                        item.progress.status === "已完成"
                          ? "is-completed"
                          : item.progress.status === "学习中"
                            ? "is-learning"
                            : item.progress.status === "待评价"
                              ? "is-review"
                              : "is-pending";
                      return (
                        <span className={`ep-practice-path-node ${nodeClass}`} key={item.node.id}>
                          <i>{item.progress.status === "已完成" ? <CheckCircle2 size={14} /> : index + 1}</i>
                          <small>{item.node.phase}</small>
                        </span>
                      );
                    })}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : <Empty>暂无岗位实践路径。</Empty>}
      </Card>
      <div className="ep-split">
        <Card>
          <h2>线下课堂</h2>
          {upcomingSessions.length ? upcomingSessions.map((session) => {
            const checkedIn = state.attendanceRecords.some((item) => item.sessionId === session.id && item.studentId === state.activeStudentId);
            return (
              <div className="ep-row" key={session.id}>
                <span className="ep-icon"><Building2 size={18} /></span>
                <div className="ep-grow"><b>{session.title}</b><p>{session.startAt} · {session.location} · {sceneById(session.sceneId)?.name}</p></div>
                {checkedIn ? <Tag tone="success">已签到</Tag> : <Btn secondary onClick={() => { checkInSession(session.id); notify("课堂签到成功"); }}>签到</Btn>}
                <Link href={`/platform/scene/${session.sceneId}${session.taskId ? `?task=${session.taskId}` : ""}`}>查看任务</Link>
              </div>
            );
          }) : <Empty>暂无课堂安排。</Empty>}
          <h2>能力状态</h2>
          {dimensions.map((item, index) => <div className="ep-ability" key={item}><span>{item}</span><progress max={100} value={scores[index]} /><b>{scores[index]}</b></div>)}
        </Card>
        <Card>
          <h2>任务成果与反馈 {taskPending > 0 && <small>{taskPending} 项待评价</small>}</h2>
          {state.taskSubmissions.length === 0 ? <Empty>从当前场景任务开始，提交第一份任务成果。</Empty> : state.taskSubmissions.slice(0, 8).map((submission) => {
            const task = taskDetailById(state, submission.sceneId, submission.taskId);
            const review = submission.reviews[submission.reviews.length - 1];
            return (
              <div className="ep-row" key={submission.id}>
                <div className="ep-grow"><b>{task?.title ?? submission.taskId}</b><p>{review?.comment ?? "等待教师评价"}</p><small>{sceneById(submission.sceneId)?.name}</small></div>
                <Tag tone={taskStatusTone(submission.status)}>{submission.status}</Tag>
                {["已退回", "草稿"].includes(submission.status) && <Link href={`/platform/scene/${submission.sceneId}`}>继续</Link>}
              </div>
            );
          })}
          {state.works.length > 0 && <details><summary>历史场景成果 {state.works.length}</summary>{state.works.map((work) => <div className="ep-row" key={work.id}><span className="ep-grow">{sceneById(work.sceneId)?.name}</span><Tag>{work.status}</Tag></div>)}</details>}
          <h2>班级进度</h2><p>已有 {metrics.learnersWithProgress} 名学员形成通过记录，班级平均 {metrics.average} 分。</p>
        </Card>
      </div>
    </>
  );
}

export function StudentApplications({ kind }: { kind: "project" | "job" }) {
  const { state } = useWorkspacePage();
  const applications = state.applications.filter((item) => item.kind === kind);
  return (
    <Card>
      <h1>{kind === "project" ? "我的项目" : "投递记录"}</h1>
      {applications.length === 0 ? <Empty>暂无记录，前往{kind === "project" ? "产业项目实战" : "就业服务中心"}探索机会。</Empty> : applications.map((application) => (
        <ApplicationCard key={application.id} application={application} student />
      ))}
    </Card>
  );
}

function ApplicationCard({ application, student = false }: { application: Application; student?: boolean }) {
  const { notify, submitDelivery } = useWorkspacePage();
  const [delivery, setDelivery] = useState(application.deliveryText ?? "");
  const canDeliver = student && application.kind === "project" && ["已接单", "已退回"].includes(application.status);
  return (
    <div className="ep-field">
      <div className="ep-row"><div className="ep-grow"><h2>{application.name}</h2><p>{application.company}</p></div><Tag tone={applicationTone(application.status)}>{application.status}</Tag></div>
      {application.resumeSnapshot && student && <details><summary>投递快照</summary><p>{application.resumeSnapshot.name} · {application.resumeSnapshot.phone}</p><p>{application.resumeSnapshot.summary}</p></details>}
      {application.deliveryText && <p><b>交付内容</b>{application.deliveryText}</p>}
      {canDeliver && <><textarea aria-label="项目交付成果" value={delivery} onChange={(event) => setDelivery(event.target.value)} placeholder="填写交付报告与证据摘要" /><Btn onClick={() => {
        if (!delivery.trim()) return notify("请填写交付内容");
        submitDelivery(application.id, delivery);
        notify("交付已提交验收");
      }}>提交交付</Btn></>}
      {application.feedback && <p><b>处理反馈</b>{application.feedback}</p>}
      <History items={application.history} />
    </div>
  );
}

export function ResumeView() {
  const { notify, saveResume, state } = useWorkspacePage();
  const [draft, setDraft] = useState<Resume>(state.resume);
  const complete = resumeComplete(draft);
  return (
    <div className="ep-split">
      <Card>
        <h1>编辑简历</h1>
        <label className="ep-form">姓名<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
        <label className="ep-form">联系方式<input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></label>
        <label className="ep-form">教育经历<input value={draft.education} onChange={(event) => setDraft({ ...draft, education: event.target.value })} /></label>
        <label className="ep-form">个人介绍<textarea value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} /></label>
        <p>{complete ? "简历信息完整，可用于项目申请和岗位投递。" : "补全姓名、联系方式、教育经历和个人介绍后开放申请。"}</p>
        <Btn disabled={!complete} onClick={() => { saveResume(draft); notify("简历已保存"); }}>保存简历</Btn>
        <Btn secondary onClick={() => window.print()}><Download size={16} />打印简历</Btn>
      </Card>
      <Card>
        <Tag>PERSONAL RESUME</Tag><h1>{draft.name}</h1><p>{draft.education} · {draft.phone || "待补充联系方式"}</p>
        <h2>个人介绍</h2><p>{draft.summary}</p>
        <h2>实战成果</h2>
        {state.taskSubmissions.filter((item) => item.status === "已通过").map((submission) => {
          const task = taskDetailById(state, submission.sceneId, submission.taskId);
          const review = submission.reviews[submission.reviews.length - 1];
          return <div key={submission.id}><h3>{task?.title}</h3><p>{submission.analysis || submission.worksheet || submission.answer}</p><Tag>{review?.total} 分 · 已通过</Tag></div>;
        })}
      </Card>
    </div>
  );
}

export function SceneView({ id }: { id?: string }) {
  const {
  notify,
  sceneById,
  sceneTab,
  sceneTaskIndex,
  searchParams,
  setSceneTab,
  setSceneTaskIndex,
  state,
  } = useWorkspacePage();
  const scene = sceneById(id ?? "bank");
  useEffect(() => {
    const taskId = searchParams.get("task");
    const taskIndex = taskId ? scene?.taskDetails?.findIndex((task) => task.id === taskId) ?? -1 : -1;
    if (taskIndex >= 0) {
      setSceneTaskIndex(taskIndex);
      setSceneTab("task");
    }
  }, [scene, searchParams, setSceneTab, setSceneTaskIndex]);
  if (!scene) return <Empty>场景不存在。</Empty>;
  if (!resourceVisible(state, scene.id) && state.role !== "manage" && state.role !== "schoolAdmin") {
    return <Empty>{resourceRightsBlockedReason(state, scene.id, "教学使用") || "场景当前不可用于教学。"}</Empty>;
  }
  const work = latestWork(state, scene.id);
  return (
    <ScenePanel
      key={scene.id}
      scene={scene}
      work={work}
      notify={notify}
      activeTab={sceneTab}
      setActiveTab={setSceneTab}
      activeTaskIndex={sceneTaskIndex}
      setActiveTaskIndex={setSceneTaskIndex}
    />
  );
}

function ScenePanel({
  scene,
  work,
  notify,
  activeTab,
  setActiveTab,
  activeTaskIndex,
  setActiveTaskIndex,
}: {
  scene: SceneProfile;
  work?: Work;
  notify: (message: string) => void;
  activeTab: string;
  setActiveTab: (value: string) => void;
  activeTaskIndex: number;
  setActiveTaskIndex: (value: number) => void;
}) {
  const { state, taskStatus, taskStatusTone } = useWorkspacePage();
  const [resourcePreview, setResourcePreview] = useState<string | null>(null);
  const progress = sceneProgressFor(state, scene.id);
  const taskDetails = scene.taskDetails ?? [];
  const activeTask = taskDetails[activeTaskIndex];
  const activeSubmission = activeTask
    ? taskSubmissionFor(state, scene.id, activeTask.id)
    : undefined;
  const legacyReview = workReview(work);
  const tabs = [
    ["overview", `任务概览 ${progress.completedCount}/${progress.taskCount}`],
    ["resources", `资源中心 ${scene.resourceItems?.length ?? 0}`],
    ["ability", `考查能力点 ${scene.abilityPointIds?.length ?? 0}`],
    ["evaluation", "评价标准"],
    ["knowledge", "知识图谱"],
  ];
  const openTask = (index: number) => {
    setActiveTaskIndex(index);
    setActiveTab("task");
  };
  const firstOpenIndex = Math.max(
    0,
    taskDetails.findIndex((task) => taskSubmissionFor(state, scene.id, task.id)?.status !== "已通过"),
  );
  return (
    <>
      <section className="ep-detail-hero">
        <div>
          <div className="ep-chips">
            <Tag>{scene.industry}</Tag>
            <Tag>{scene.difficulty}</Tag>
            <Tag>{scene.code}</Tag>
            <Tag tone={progress.status === "已完成" ? "success" : progress.status === "待评价" ? "warning" : "muted"}>{progress.status}</Tag>
          </div>
          <h1>{resourceName(state, scene.id, scene.name)}</h1>
          <p>{scene.description}</p>
          <div className="ep-detail-meta">
            <span>{taskDetails.length} 个任务</span>
            <span>{taskDetails.reduce((sum, item) => sum + item.minutes, 0)} 分钟</span>
            <span>已完成 {progress.completedCount}/{progress.taskCount}</span>
            {progress.score !== undefined && <span>{progress.status === "已完成" ? "场景得分" : "当前加权"} {progress.score}</span>}
          </div>
        </div>
        <button className="ep-button" onClick={() => openTask(firstOpenIndex)}>
          {progress.status === "已完成" ? "查看成果" : progress.completedCount > 0 ? "继续学习" : "开始学习"}
          <ArrowUpRight size={15} />
        </button>
      </section>
      <div className="ep-scene-progress">
        <div><span style={{ width: `${taskDetails.length ? progress.completedCount / taskDetails.length * 100 : 0}%` }} /></div>
        <small>{progress.status === "已完成" ? `场景已完成${progress.completedAt ? ` · ${progress.completedAt}` : ""}` : `${progress.completedCount} 个任务已通过，${progress.pendingTaskIds.length} 个待评价`}</small>
      </div>
      <div className="ep-detail-tabs">
        {tabs.map(([key, label]) => <button className={activeTab === key ? "active" : ""} onClick={() => setActiveTab(key)} key={key}>{label}</button>)}
        {activeTab === "task" && <button className="active">任务学习</button>}
      </div>
      {activeTab === "overview" && (
        <Card>
          <div className="ep-section-title"><div><h2>任务链</h2><p>{scene.learningGoal}</p></div><Tag tone="muted">全部任务开放</Tag></div>
          <div className="ep-task-list">
            {taskDetails.map((task, index) => {
              const submission = taskSubmissionFor(state, scene.id, task.id);
              const status = taskStatus(submission, scene.id, task.id);
              return (
                <article className={`is-${taskStatusTone(status)}`} key={task.id}>
                  <span className="ep-number">{index + 1}</span>
                  <div>
                    <div className="ep-chips"><Tag>{task.type}</Tag><Tag>{task.minutes} 分钟</Tag><Tag tone={taskStatusTone(status)}>{status}</Tag></div>
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                    <small>交付：{task.deliverable} · 权重 {task.weight}%</small>
                  </div>
                  <Btn onClick={() => openTask(index)}>
                    {status === "待评价" ? "查看提交" : status === "已通过" ? "查看评价" : status === "已退回" ? "重新提交" : status === "草稿" ? "继续学习" : "去学习"}
                  </Btn>
                </article>
              );
            })}
          </div>
          <details className="ep-expert-answer"><summary>专家参考答案与边界说明</summary><p>{scene.answer}</p></details>
          {legacyReview && <p className="ep-status ok">历史场景评价：{legacyReview.total} 分 · {legacyReview.comment}</p>}
        </Card>
      )}
      {activeTab === "resources" && (
        <>
          <div className="ep-resource-grid">
            {(scene.resourceItems ?? []).map((item) => (
              <Card key={item.id}>
                <Tag>{item.type}</Tag><h2>{item.title}</h2><p>{item.description}</p>
                <button className="ep-link" onClick={() => setResourcePreview(resourcePreview === item.id ? null : item.id)}>
                  {resourcePreview === item.id ? "收起资源" : "打开资源"}<ArrowUpRight size={15} />
                </button>
              </Card>
            ))}
          </div>
          {resourcePreview && <Card><h2>{scene.resourceItems?.find((item) => item.id === resourcePreview)?.title}</h2><p>{scene.resourceItems?.find((item) => item.id === resourcePreview)?.description}</p><p>当前演示版本以说明、样本字段和图示代替真实媒体文件，资源可被任务引用并记录到学习过程。</p></Card>}
        </>
      )}
      {activeTab === "ability" && (
        <Card>
          <h2>场景考查能力点</h2>
          {dimensions.map((name, index) => scene.abilityWeights[index] > 0 && (
            <div className="ep-ability" key={name}><span>{name}</span><progress max="100" value={Math.round(scene.abilityWeights[index] * 100)} /><b>{Math.round(scene.abilityWeights[index] * 100)}%</b></div>
          ))}
          <p>能力分由已通过任务按任务权重汇总，任务草稿和待评价成果不进入能力画像。</p>
        </Card>
      )}
      {activeTab === "evaluation" && (
        <Card>
          <h2>任务评价量规</h2>
          <div className="ep-evaluation-grid">
            {taskDetails.flatMap((task) => task.rubric.map((item) => ({ ...item, task: task.title }))).slice(0, 6).map((item, index) => (
              <div key={`${item.task}-${item.id}-${index}`}><b>{item.weight}%</b><span>{item.label}</span><p>{item.description}</p><small>{item.task}</small></div>
            ))}
          </div>
        </Card>
      )}
      {activeTab === "knowledge" && (
        <Card>
          <h2>场景知识图谱</h2>
          <div className="ep-knowledge-map">
            <div className="ep-knowledge-core"><Activity size={24} /><b>{scene.name}</b></div>
            <div className="ep-knowledge-nodes">
              {[...taskDetails.map((item) => item.title), ...dimensions.filter((_, index) => scene.abilityWeights[index] > 0)].map((item, index) => <span className={`node-${index % 3}`} key={`${item}-${index}`}>{item}</span>)}
            </div>
          </div>
        </Card>
      )}
      {activeTab === "task" && activeTask && (
        <TaskWorkspace
          key={activeTask.id}
          scene={scene}
          task={activeTask}
          submission={activeSubmission}
          taskIndex={activeTaskIndex}
          taskCount={taskDetails.length}
          onSwitchTask={openTask}
          onNext={() => {
            if (activeTaskIndex < taskDetails.length - 1) openTask(activeTaskIndex + 1);
            else setActiveTab("overview");
          }}
          notify={notify}
        />
      )}
    </>
  );
}

function TaskWorkspace({
  scene,
  task,
  submission,
  taskIndex,
  taskCount,
  onSwitchTask,
  onNext,
  notify,
}: {
  scene: SceneProfile;
  task: NonNullable<NonNullable<typeof scene.taskDetails>[number]>;
  submission?: TaskSubmission;
  taskIndex: number;
  taskCount: number;
  onSwitchTask: (index: number) => void;
  onNext: () => void;
  notify: (message: string) => void;
}) {
  const {
  checkInSession,
  courseById,
  recordAssessment,
  saveTask,
  state,
  submitTask,
  taskStatus,
  taskStatusTone,
  } = useWorkspacePage();
  const [evidence, setEvidence] = useState<string[]>(submission?.evidenceIds ?? []);
  const [worksheet, setWorksheet] = useState(submission?.worksheet ?? "");
  const [answer, setAnswer] = useState(submission?.answer ?? "");
  const [analysis, setAnalysis] = useState(submission?.analysis ?? "");
  const [nextStep, setNextStep] = useState(submission?.nextStep ?? "");
  const [boundary, setBoundary] = useState(submission?.boundaryAcknowledged ?? false);
  const [quizMethodId, setQuizMethodId] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const blocked = taskSubmissionBlockedReason(state, scene.id, task.id);
  const currentTaskStatus = taskStatus(submission, scene.id, task.id);
  const latestReview = submission?.reviews[submission.reviews.length - 1];
  const editable = !submission || submission.status === "草稿" || submission.status === "已退回";
  const taskEvidence = scene.evidence.filter((item) => task.evidenceIds.includes(item.id));
  const visibleEvidence = taskEvidence.length ? taskEvidence : scene.evidence;
  const taskSessions = state.offlineSessions.filter(
    (session) => session.sceneId === scene.id && (!session.taskId || session.taskId === task.id),
  );
  const assessmentProgress = taskCompletionFor(state, scene.id, task.id).assessments;
  const assessmentStatus = (method: SceneAssessmentMethod) => {
    return assessmentProgress.find((item) => item.method.id === method.id)?.status ?? "未开始";
  };
  const submitQuiz = (method: SceneAssessmentMethod) => {
    const questions = examQuestions.slice(0, 3);
    if (Object.keys(quizAnswers).length < questions.length) return notify("请完成全部随堂测题目");
    const correct = questions.filter((question, index) => quizAnswers[index] === question.answer).length;
    const score = Math.round(correct / questions.length * 100);
    const result: TaskAssessmentResult = {
      id: crypto.randomUUID(),
      methodId: method.id,
      type: method.type,
      status: score >= method.passScore ? "已通过" : "已退回",
      score,
      submittedAt: nowLabel(),
      reviewer: "随堂测自动评分",
      comment: `答对 ${correct}/${questions.length} 题`,
    };
    recordAssessment(scene.id, task.id, result);
    setQuizMethodId(null);
    setQuizAnswers({});
    notify(`随堂测得分 ${score}`);
  };
  const submissionPayload = (): TaskSubmission => ({
    id: submission?.id ?? crypto.randomUUID(),
    studentId: state.activeStudentId,
    studentName: state.resume.name,
    sceneId: scene.id,
    taskId: task.id,
    status: submission?.status ?? "草稿",
    evidenceIds: evidence,
    worksheet,
    answer,
    analysis,
    nextStep,
    boundaryAcknowledged: boundary,
    submittedAt: submission?.submittedAt,
    updatedAt: nowLabel(),
    reviews: submission?.reviews ?? [],
    assessmentResults: submission?.assessmentResults ?? [],
    history: submission?.history ?? [],
  });
  const validate = () => {
    if (evidence.length < Math.min(2, visibleEvidence.length)) return "请至少选择两条任务证据";
    if (task.requiredEvidenceIds.some((id) => !evidence.includes(id))) return "请选择本任务要求的必选证据";
    if (task.type === "训练" && !worksheet.trim()) return "请填写任务过程记录";
    if (task.type === "测评" && !answer.trim()) return "请填写本任务判断结果";
    if (task.type === "复盘" && (!analysis.trim() || !nextStep.trim())) return "请填写分析结论与下一步建议";
    if (task.type === "复盘" && !boundary) return "请确认检测范围与不可见边界";
    return "";
  };
  return (
    <div className="ep-task-workspace">
      <Card>
        <div className="ep-task-workspace-nav">
          {scene.taskDetails?.map((item, index) => {
            const itemSubmission = taskSubmissionFor(state, scene.id, item.id);
            const itemStatus = taskStatus(itemSubmission, scene.id, item.id);
            return <button className={`${taskIndex === index ? "active" : ""} is-${taskStatusTone(itemStatus)}`} onClick={() => onSwitchTask(index)} key={item.id}>{index + 1}</button>;
          })}
        </div>
        <div className="ep-chips">
          <Tag>{task.type}</Tag><Tag>{task.minutes} 分钟</Tag><Tag>{task.weight}% 场景权重</Tag><Tag tone={taskStatusTone(currentTaskStatus)}>{currentTaskStatus}</Tag>
        </div>
        <h1>{task.title}</h1>
        <p>{task.description}</p>
        <h2>学习目标</h2><p>{task.goal}</p>
        <h2>交付要求</h2><p>{task.deliverable}</p>
        <h2>操作步骤</h2>
        <div className="ep-objectives">
          {["阅读任务说明与交付标准", "使用任务资源完成分析", "选择证据并完成成果填写", "保存草稿或提交教师评价"].map((item, index) => <span key={item}><i>{index + 1}</i>{item}</span>)}
        </div>
        <h2>任务资源</h2>
        <div className="ep-chapter-resources">
          {task.resources.map((item) => <details key={item.id}><summary><span>{item.type}</span><b>{item.title}</b><ChevronRight size={14} /></summary><p>{item.description}</p></details>)}
        </div>
        {scene.courseIds.length > 0 && (
          <>
            <h2>课前课程</h2>
            {scene.courseIds.filter((courseId) => resourceVisible(state, courseId)).map((courseId) => (
              <Link className="ep-row" href={`/platform/course/${courseId}`} key={courseId}>
                <BookOpen size={17} /><span className="ep-grow">{resourceName(state, courseId, courseById(courseId)?.name ?? "关联课程")}<small>作为本场景学习方法材料</small></span><ChevronRight size={14} />
              </Link>
            ))}
          </>
        )}
        <h2>评价量规</h2>
        <div className="ep-task-rubric">
          {task.rubric.map((item) => <div key={item.id}><span>{item.label}<small>{item.description}</small></span><b>{item.weight}%</b></div>)}
        </div>
        <h2>任务测评</h2>
        <div className="ep-task-assessment-list">
          {task.assessmentMethods.map((method) => {
            const status = assessmentStatus(method);
            const result = submission?.assessmentResults.find((item) => item.methodId === method.id);
            const session = taskSessions.find((item) => item.mode !== "线上");
            const attendance = session
              ? state.attendanceRecords.find((item) => item.sessionId === session.id && item.studentId === state.activeStudentId)
              : undefined;
            const attended = attendance?.status === "已签到" || attendance?.status === "迟到";
            return (
              <article key={method.id}>
                <div className="ep-chips"><Tag>{method.type}</Tag><Tag>{method.mode}</Tag><Tag>{method.weight}%</Tag><Tag tone={taskStatusTone(status)}>{status}</Tag></div>
                <h3>{method.title}</h3>
                <p>{method.description}</p>
                {["随堂测", "题库"].includes(method.type) && status !== "已通过" && (
                  <button className="ep-link" onClick={() => { setQuizMethodId(method.id); setQuizAnswers({}); }}>开始答题</button>
                )}
                {method.type === "线下课堂" && (
                  <div className="ep-session-inline">
                    {session ? <><span>{session.startAt} · {session.location}</span>{attended ? <Tag tone="success">{attendance?.status}</Tag> : <Btn secondary onClick={() => { checkInSession(session.id); recordAssessment(scene.id, task.id, { id: crypto.randomUUID(), methodId: method.id, type: method.type, status: "已通过", score: 100, submittedAt: nowLabel(), reviewer: "课堂签到", comment: "完成课堂签到" }); notify("课堂签到成功"); }}>课堂签到</Btn>}</> : <small>课堂安排待教师发布</small>}
                  </div>
                )}
                {method.type === "现场答辩" && session && <div className="ep-session-inline"><span>{session.startAt} · {session.location}</span><Tag tone="warning">现场评分</Tag></div>}
                {result && <small>{result.comment}{result.score !== undefined ? ` · ${result.score} 分` : ""}</small>}
              </article>
            );
          })}
        </div>
        {quizMethodId && (
          <div className="ep-inline-quiz">
            <h3>随堂测</h3>
            {examQuestions.slice(0, 3).map((question, index) => (
              <div key={question.id}>
                <b>{index + 1}. {question.title}</b>
                {question.options.map((option, optionIndex) => (
                  <label key={option}><input type="radio" name={`quiz-${question.id}`} checked={quizAnswers[index] === optionIndex} onChange={() => setQuizAnswers({ ...quizAnswers, [index]: optionIndex })} />{option}</label>
                ))}
              </div>
            ))}
            <div className="ep-actions"><Btn secondary onClick={() => setQuizMethodId(null)}>取消</Btn><Btn onClick={() => submitQuiz(task.assessmentMethods.find((item) => item.id === quizMethodId)!)}>提交随堂测</Btn></div>
          </div>
        )}
      </Card>
      <Card>
        <h2>{task.type === "训练" ? "证据与过程记录" : task.type === "测评" ? "证据与判断题" : "复盘报告"}</h2>
        <div className="ep-console">
          <div><span className="ep-dot" />TASK SESSION · {task.id.toUpperCase()}</div>
          {visibleEvidence.map((item) => (
            <label key={item.id}>
              <input
                type="checkbox"
                disabled={!editable}
                checked={evidence.includes(item.id)}
                onChange={(event) => setEvidence(event.target.checked ? [...evidence, item.id] : evidence.filter((id) => id !== item.id))}
              />
              <span><small>{item.time} · {item.title}</small>{item.detail}</span>
            </label>
          ))}
        </div>
        {editable ? (
          <>
            {task.type === "训练" && <textarea aria-label="任务过程记录" value={worksheet} onChange={(event) => setWorksheet(event.target.value)} placeholder="记录操作步骤、关键事实、遇到的问题与完成结果" />}
            {task.type === "测评" && <textarea aria-label="判断结果" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="填写异常判断、关键证据与排除的替代原因" />}
            {task.type === "复盘" && (
              <>
                <textarea aria-label="分析结论" value={analysis} onChange={(event) => setAnalysis(event.target.value)} placeholder="写清问题范围、证据与判断依据" />
                <textarea aria-label="下一步建议" value={nextStep} onChange={(event) => setNextStep(event.target.value)} placeholder="写清仍需补充验证的边界与下一步建议" />
                <label className="ep-check"><input type="checkbox" checked={boundary} onChange={(event) => setBoundary(event.target.checked)} />已说明检测范围与不可见边界</label>
              </>
            )}
            <div className="ep-actions">
              <Btn secondary onClick={() => { saveTask(submissionPayload()); notify("任务草稿已保存"); }}>保存草稿</Btn>
              <Btn onClick={() => {
                if (blocked) return notify(blocked);
                const reason = validate();
                if (reason) return notify(reason);
                submitTask(submissionPayload());
                notify("任务成果已提交，等待教师评价");
              }}>提交任务</Btn>
            </div>
          </>
        ) : (
          <>
            <div className="ep-task-submitted">
              <Tag tone={taskStatusTone(currentTaskStatus)}>{currentTaskStatus}</Tag>
              {latestReview && <><b>{latestReview.total} 分</b><p>{latestReview.comment}</p></>}
            </div>
            {submission?.status === "待评价" && <p>教师完成评价后，本任务和场景进度会自动更新。</p>}
            {submission?.status === "已通过" && <Btn onClick={onNext}>{taskIndex < taskCount - 1 ? "进入下一任务" : "返回场景概览"}</Btn>}
          </>
        )}
        {blocked && <p className="ep-blocker"><LockKeyhole size={14} />{blocked}</p>}
        <History items={submission?.history.map((item) => ({ at: item.at, actor: item.actor, action: item.action, note: item.note })) ?? []} />
      </Card>
    </div>
  );
}
