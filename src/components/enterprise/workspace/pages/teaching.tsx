import { Link } from "@/components/router/link";
import { useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Plus,
  ShieldCheck,
} from "lucide-react";
import {
  abilityScores,
  classMetrics,
  dimensions,
  learningPathForJob,
  nowLabel,
  taskDetailById,
  taskReviewBlockers,
  workReview,
  type Review,
  type TaskReview,
  type TaskSubmission,
} from "@/lib/enterprise-workspace";
import { useWorkspacePage } from "@/components/enterprise/workspace/page-runtime";
import { Btn, Card, Empty, History, Metric, RadarView, Tag } from "@/components/enterprise/workspace/ui";

export function TeacherHome() {
  const { jobById, state } = useWorkspacePage();
  const metrics = classMetrics(state);
  const passedTasks = state.taskSubmissions.filter((item) => item.status === "已通过").length;
  const completedScenes = state.sceneCompletions.filter((item) => item.status === "已完成").length;
  return (
    <>
      <div className="ep-stats">
        <Metric label="授课班级" value="1" />
        <Metric label="班级学生" value={state.classroom.studentIds.length} />
        <Metric label="待评价" value={metrics.pending} />
        <Metric label="班级均分" value={metrics.average} />
      </div>
      <div className="ep-split">
        <Card>
          <h2>{state.classroom.name}</h2><p>{state.classroom.teacherName} · {state.classroom.major} · {state.classroom.schedule}</p>
          <div className="ep-actions"><Link className="ep-button" href="/platform/teacher/classes">查看学生</Link><Link className="ep-button secondary" href="/platform/teacher/classroom">课堂教学</Link><Link className="ep-button secondary" href="/platform/teacher/reviews">成果评价</Link></div>
          <h2>岗位学习路径</h2>
          {state.learningPaths.map((path) => <div className="ep-row" key={path.id}><span className="ep-grow">{jobById(path.jobId)?.name ?? path.name}</span><Tag tone="success">{path.sceneNodes.length} 个场景</Tag></div>)}
        </Card>
        <Card>
          <div className="ep-section-title">
            <div><h2>班级成效</h2></div>
            <Btn secondary onClick={() => window.print()}>导出报告</Btn>
          </div>
          <RadarView values={metrics.abilities} />
          <p>最弱维度 {metrics.weak.name} {metrics.weak.score} 分 · 通过覆盖 {metrics.passRate}%</p>
          {dimensions.map((item, index) => <div className="ep-ability" key={item}><span>{item}</span><progress max={100} value={metrics.abilities[index]} /><b>{metrics.abilities[index]}</b></div>)}
          <h2>教学判断</h2>
          <p>班级最弱维度为 {metrics.weak.name}（{metrics.weak.score} 分）。建议优先检查证据来源、不可见边界和结论表达的对应关系。</p>
        </Card>
      </div>
      <Card>
        <div className="ep-section-title">
          <div><h2>学生学习概览</h2></div>
          <Link className="ep-link" href="/platform/teacher/reviews">进入任务评价 <ArrowUpRight size={15} /></Link>
        </div>
        <p>{state.resume.name} 提交 {state.taskSubmissions.length} 个任务成果，通过 {passedTasks} 个任务，完成 {completedScenes} 个场景。</p>
      </Card>
    </>
  );
}
export function ClassesView() {
  const { state } = useWorkspacePage();
  const liveScores = abilityScores(state);
  return (
    <>
      <Card>
        <div className="ep-section-title"><div><h1>{state.classroom.name}</h1><p>{state.classroom.teacherName} · {state.classroom.studentIds.length} 人 · {state.classroom.major}</p></div><Tag>2026 学年</Tag></div>
        <label className="ep-form">教学开始日期<input type="date" value={state.classroom.schedule} readOnly /></label>
      </Card>
      <Card>
        <h2>学生进度</h2>
        <div className="ep-tablewrap"><table>
          <thead><tr><th>学生</th><th>通过任务</th><th>待评</th><th>退回</th><th>能力均分</th></tr></thead>
          <tbody>
            <tr><td><b>{state.resume.name}</b><small>当前演示学生</small></td><td>{state.taskSubmissions.filter((item) => item.status === "已通过").length}</td><td>{state.taskSubmissions.filter((item) => item.status === "待评价").length}</td><td>{state.taskSubmissions.filter((item) => item.status === "已退回").length}</td><td>{Math.round(liveScores.reduce((sum, item) => sum + item, 0) / dimensions.length)}</td></tr>
            {state.classmates.map((learner) => <tr key={learner.id}><td>{learner.name}</td><td>{learner.passed}</td><td>{learner.pending}</td><td>{learner.returned}</td><td>{Math.round(learner.abilityScores.reduce((sum, item) => sum + item, 0) / dimensions.length)}</td></tr>)}
          </tbody>
        </table></div>
      </Card>
    </>
  );
}

export function ReviewsView() {
  const { notify, reviewTask, reviewWork, sceneById, state, taskStatusTone } = useWorkspacePage();
  const [reviewFilter, setReviewFilter] = useState("待评价");
  const taskSubmissions = state.taskSubmissions
    .filter((submission) => {
      if (reviewFilter === "全部") return true;
      if (reviewFilter === "待评价") return submission.status === "待评价";
      if (reviewFilter === "已通过") return submission.status === "已通过";
      return submission.status === "已退回";
    })
    .sort((a, b) => (b.submittedAt ?? b.updatedAt).localeCompare(a.submittedAt ?? a.updatedAt));
  const pending = state.taskSubmissions.filter((item) => item.status === "待评价").length;
  const passed = state.taskSubmissions.filter((item) => item.status === "已通过").length;
  const returned = state.taskSubmissions.filter((item) => item.status === "已退回").length;
  return (
    <>
      <div className="ep-stats">
        <Metric label="待评价任务" value={pending} />
        <Metric label="已通过任务" value={passed} />
        <Metric label="退回任务" value={returned} />
        <Metric label="完成场景" value={state.sceneCompletions.filter((item) => item.status === "已完成").length} />
      </div>
      <Card>
        <div className="ep-section-title"><div><h1>场景任务评价</h1><p>按任务查看证据、过程和交付成果，评价结果直接回写学生任务与场景进度。</p></div></div>
        <div className="ep-detail-tabs">
          {["待评价", "已通过", "已退回", "全部"].map((item) => <button className={reviewFilter === item ? "active" : ""} onClick={() => setReviewFilter(item)} key={item}>{item}</button>)}
        </div>
        {taskSubmissions.length === 0 ? <Empty>当前筛选下没有任务成果。</Empty> : taskSubmissions.map((submission) => {
          const scene = sceneById(submission.sceneId);
          const task = taskDetailById(state, submission.sceneId, submission.taskId);
          const latestReview = submission.reviews[submission.reviews.length - 1];
          if (!scene || !task) return null;
          return (
            <article className="ep-task-review-card" key={submission.id}>
              <header>
                <div>
                  <div className="ep-chips"><Tag>{task.type}</Tag><Tag>{scene.name}</Tag><Tag tone={taskStatusTone(submission.status)}>{submission.status}</Tag></div>
                  <h2>{task.title}</h2>
                  <p>{submission.studentName} · 提交于 {submission.submittedAt ?? submission.updatedAt}</p>
                </div>
                <span className="ep-number">{task.weight}%</span>
              </header>
              <div className="ep-task-review-body">
                <div>
                  <h3>任务成果</h3>
                  {submission.worksheet && <p>{submission.worksheet}</p>}
                  {submission.answer && <p>{submission.answer}</p>}
                  {submission.analysis && <p>{submission.analysis}</p>}
                  {submission.nextStep && <p><b>下一步</b>{submission.nextStep}</p>}
                  <div className="ep-chips">{submission.evidenceIds.map((id) => <Tag key={id}>{scene.evidence.find((item) => item.id === id)?.title ?? id}</Tag>)}</div>
                  {task.type === "复盘" && <small>边界确认：{submission.boundaryAcknowledged ? "已说明采集范围" : "未确认"}</small>}
                </div>
                <div>
                  <h3>评价量规</h3>
                  {task.rubric.map((item) => <div className="ep-row" key={item.id}><span className="ep-grow">{item.label}</span><b>{item.weight}%</b></div>)}
                </div>
              </div>
              {submission.status === "待评价" ? (
                <TaskReviewForm task={task} submission={submission} onSubmit={(review) => {
                  reviewTask(submission.id, review);
                  notify(review.decision === "passed" ? "任务已通过，场景进度已更新" : "任务已退回，其他任务进度保持不变");
                }} />
              ) : latestReview ? (
                <div className="ep-task-review-result">
                  <b>{latestReview.total} 分</b>
                  <Tag tone={latestReview.decision === "passed" ? "success" : "danger"}>{latestReview.decision === "passed" ? "已通过" : "已退回"}</Tag>
                  <p>{latestReview.comment}</p>
                </div>
              ) : null}
              <History items={submission.history.map((item) => ({ at: item.at, actor: item.actor, action: item.action, note: item.note }))} />
            </article>
          );
        })}
      </Card>
      {state.works.length > 0 && (
        <Card>
          <details>
            <summary>历史场景级成果 {state.works.length}</summary>
            {state.works.map((work) => (
              <div className="ep-field" key={work.id}>
                <div className="ep-row"><h2 className="ep-grow">{work.studentName} · {sceneById(work.sceneId)?.name}</h2><Tag tone={work.status === "已通过" ? "success" : work.status === "已退回" ? "danger" : "warning"}>{work.status}</Tag></div>
                <p>{work.analysis}</p>
                {work.status === "待评价" ? <ReviewForm onSubmit={(review) => { reviewWork(work.id, review); notify(review.decision === "passed" ? "历史成果已通过" : "历史成果已退回"); }} /> : <p><b>{workReview(work)?.total} 分</b>{workReview(work)?.comment}</p>}
              </div>
            ))}
          </details>
        </Card>
      )}
    </>
  );
}

export function ClassroomView() {
  const {
  createOfflineSession,
  markAttendance,
  notify,
  sceneById,
  selected,
  setSelected,
  state,
  updateOfflineSession,
  } = useWorkspacePage();
  const [rollcallName, setRollcallName] = useState("点击开始点名");
  const [groupOffset, setGroupOffset] = useState(0);
  const [newSessionTitle, setNewSessionTitle] = useState("场景现场答辩");
  const [newSessionSceneId, setNewSessionSceneId] = useState("bank");
  const [newSessionDate, setNewSessionDate] = useState("2026-12-02");
  const [newSessionLocation, setNewSessionLocation] = useState("网络分析实训室");
  const sessions = state.offlineSessions;
  const session = sessions[Math.min(selected, Math.max(0, sessions.length - 1))];
  const attendees = session
    ? state.attendanceRecords.filter((item) => item.sessionId === session.id)
    : [];
  const roster = [
    { id: state.activeStudentId, name: state.resume.name },
    ...state.classmates.slice(0, 12).map((item) => ({ id: item.id, name: item.name })),
  ];
  const groups = Array.from({ length: 4 }, (_, index) =>
    roster.filter((_, memberIndex) => (memberIndex + groupOffset) % 4 === index),
  );
  return (
    <>
      <div className="ep-stats">
        <Metric label="课堂安排" value={sessions.length} />
        <Metric label="进行中" value={sessions.filter((item) => item.status === "进行中").length} />
        <Metric label="本次签到" value={attendees.filter((item) => item.status !== "缺席").length} />
        <Metric label="现场答辩" value={sessions.filter((item) => item.taskId).length} />
      </div>
      <div className="ep-classroom-layout">
        <Card className="ep-session-nav">
          <h2>场景课堂</h2>
          {sessions.map((item, index) => (
            <button className={session?.id === item.id ? "active" : ""} onClick={() => setSelected(index)} key={item.id}>
              <span>{item.startAt.slice(5, 16)}</span>
              <b>{item.title}</b>
              <small>{sceneById(item.sceneId)?.name} · {item.mode}</small>
              <Tag tone={item.status === "进行中" ? "success" : item.status === "已结束" ? "muted" : "warning"}>{item.status}</Tag>
            </button>
          ))}
          <details className="ep-new-session">
            <summary><Plus size={14} />新建课堂安排</summary>
            <div className="ep-form-grid">
              <label className="ep-form">课堂名称<input value={newSessionTitle} onChange={(event) => setNewSessionTitle(event.target.value)} /></label>
              <label className="ep-form">关联场景<select value={newSessionSceneId} onChange={(event) => setNewSessionSceneId(event.target.value)}>{(learningPathForJob(state, "service")?.sceneNodes ?? []).map((node) => <option value={node.sceneId} key={node.id}>{sceneById(node.sceneId)?.name ?? node.sceneId}</option>)}</select></label>
              <label className="ep-form">上课日期<input type="date" value={newSessionDate} onChange={(event) => setNewSessionDate(event.target.value)} /></label>
              <label className="ep-form">地点<input value={newSessionLocation} onChange={(event) => setNewSessionLocation(event.target.value)} /></label>
            </div>
            <Btn onClick={() => {
              if (!newSessionTitle.trim()) return notify("请填写课堂名称");
              const scene = sceneById(newSessionSceneId);
              createOfflineSession({
                id: crypto.randomUUID(),
                sceneId: newSessionSceneId,
                taskId: scene?.taskDetails?.[scene.taskDetails.length - 1]?.id,
                classId: state.classroom.id,
                title: newSessionTitle.trim(),
                location: newSessionLocation.trim() || "实训室",
                teacher: state.classroom.teacherName,
                startAt: `${newSessionDate} 14:00`,
                endAt: `${newSessionDate} 15:30`,
                mode: "混合",
                status: "待开始",
              });
              notify("课堂安排已创建");
            }}>保存课堂</Btn>
          </details>
        </Card>
        {session ? (
          <div>
            <Card>
              <div className="ep-section-title">
                <div>
                  <div className="ep-chips"><Tag>{session.mode}</Tag><Tag tone={session.status === "进行中" ? "success" : session.status === "已结束" ? "muted" : "warning"}>{session.status}</Tag></div>
                  <h1>{session.title}</h1>
                  <p>{sceneById(session.sceneId)?.name} · {session.location} · {session.startAt} 至 {session.endAt}</p>
                </div>
                <div className="ep-actions">
                  {session.status !== "进行中" && <Btn onClick={() => { updateOfflineSession(session.id, "进行中"); notify("课堂已开始"); }}>开始课堂</Btn>}
                  {session.status === "进行中" && <Btn secondary onClick={() => { updateOfflineSession(session.id, "已结束"); notify("课堂已结束"); }}>结束课堂</Btn>}
                </div>
              </div>
              <div className="ep-classroom-tools">
                <button onClick={() => notify("已发布课堂签到")}><CheckCircle2 size={18} /><b>签到</b><span>{attendees.length}/{roster.length}</span></button>
                <button onClick={() => setRollcallName(roster[Math.floor(Math.random() * roster.length)]?.name ?? "暂无学生")}><Activity size={18} /><b>随机点名</b><span>{rollcallName}</span></button>
                <button onClick={() => document.getElementById("class-groups")?.scrollIntoView({ behavior: "smooth" })}><GraduationCap size={18} /><b>实践分组</b><span>{groups.length} 组</span></button>
                <button onClick={() => notify("随堂测已下发到学生任务页")}><BookOpen size={18} /><b>下发随堂测</b><span>即时推送</span></button>
                <button onClick={() => notify("现场答辩评分可在任务评价中完成")}><ShieldCheck size={18} /><b>答辩评分</b><span>{session.taskId ? "已关联任务" : "未关联"}</span></button>
              </div>
            </Card>
            <div className="ep-split">
              <Card>
                <h2>课堂签到</h2>
                <div className="ep-attendance-list">
                  {roster.map((student) => {
                    const record = attendees.find((item) => item.studentId === student.id);
                    return (
                      <div key={student.id}>
                        <span className="ep-avatar">{student.name[0]}</span>
                        <b>{student.name}</b>
                        <Tag tone={record?.status === "已签到" ? "success" : record?.status === "迟到" ? "warning" : record?.status === "缺席" ? "danger" : "muted"}>{record?.status ?? "未签到"}</Tag>
                        <div className="ep-actions">
                          <button onClick={() => markAttendance(session.id, student.id, "已签到")}>签到</button>
                          <button onClick={() => markAttendance(session.id, student.id, "迟到")}>迟到</button>
                          <button onClick={() => markAttendance(session.id, student.id, "缺席")}>缺席</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
              <Card id="class-groups">
                <h2>实践分组</h2>
                {groups.map((group, index) => (
                  <div className="ep-class-group" key={index}>
                    <b>第 {index + 1} 组</b>
                    <div className="ep-chips">{group.map((student) => <Tag key={student.id}>{student.name}</Tag>)}</div>
                  </div>
                ))}
                <Btn secondary onClick={() => { setGroupOffset((value) => value + 1); notify("实践分组已更新"); }}>随机重新分组</Btn>
                {session.taskId && <Link className="ep-link" href="/platform/teacher/reviews">进入现场答辩评分 <ArrowUpRight size={15} /></Link>}
              </Card>
            </div>
          </div>
        ) : <Card><Empty>暂无线下课堂安排。</Empty></Card>}
      </div>
    </>
  );
}

function TaskReviewForm({
  task,
  submission,
  onSubmit,
}: {
  task: NonNullable<ReturnType<typeof taskDetailById>>;
  submission: TaskSubmission;
  onSubmit: (review: TaskReview) => void;
}) {
  const { recordAssessment, state } = useWorkspacePage();
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(task.rubric.map((item) => [item.id, Math.round(item.weight * 0.75)])),
  );
  const [comment, setComment] = useState("任务证据完整，过程与结论基本一致，可以进入下一任务。");
  const [tags, setTags] = useState<string[]>(["证据清楚", "过程完整"]);
  const [defenseScore, setDefenseScore] = useState(86);
  const [defenseComment, setDefenseComment] = useState("能够说明判断依据，并清楚回应采集边界。");
  const total = task.rubric.reduce((sum, item) => sum + (scores[item.id] ?? 0), 0);
  const blockers = taskReviewBlockers(
    state,
    submission.sceneId,
    task.id,
    submission.studentId,
  );
  const prerequisiteReason = blockers.join("；");
  const defenseMethod = task.assessmentMethods.find(
    (method) => method.required && method.type === "现场答辩",
  );
  const defenseSession = state.offlineSessions.find(
    (session) =>
      session.sceneId === submission.sceneId &&
      session.taskId === task.id &&
      session.mode !== "线上",
  );
  const defenseResult = defenseMethod
    ? submission.assessmentResults.find((item) => item.methodId === defenseMethod.id)
    : undefined;
  const submit = (decision: "passed" | "returned") => {
    if (!comment.trim()) return;
    if (decision === "passed" && total < 60) return;
    onSubmit({
      id: crypto.randomUUID(),
      reviewer: "周启明",
      reviewedAt: nowLabel(),
      decision,
      total,
      comment,
      tags,
      scores: task.rubric.map((item) => ({
        rubricId: item.id,
        label: item.label,
        score: scores[item.id] ?? 0,
        weight: item.weight,
      })),
    });
  };
  return (
    <div className="ep-task-review-form">
      <div className="ep-task-review-scores">
        {task.rubric.map((item) => (
          <label key={item.id}>
            <span>{item.label}<small>{item.description}</small></span>
            <input type="range" min="0" max={item.weight} value={scores[item.id] ?? 0} onChange={(event) => setScores({ ...scores, [item.id]: Number(event.target.value) })} />
            <b>{scores[item.id] ?? 0}/{item.weight}</b>
          </label>
        ))}
      </div>
      <div className="ep-chips">
        {["证据清楚", "过程完整", "推理充分", "边界明确", "需要补充证据"].map((tag) => (
          <button className={tags.includes(tag) ? "active" : ""} onClick={() => setTags(tags.includes(tag) ? tags.filter((item) => item !== tag) : [...tags, tag])} key={tag}>{tag}</button>
        ))}
      </div>
      {defenseMethod && defenseSession && (
        <div className="ep-defense-review">
          <div>
            <b>现场答辩</b>
            <small>{defenseSession.startAt} · {defenseSession.location}</small>
          </div>
          <label>答辩得分<input type="number" min="0" max="100" value={defenseScore} onChange={(event) => setDefenseScore(Number(event.target.value))} /></label>
          <label>答辩意见<input value={defenseComment} onChange={(event) => setDefenseComment(event.target.value)} /></label>
          <Btn
            secondary
            disabled={!defenseComment.trim() || Boolean(defenseResult?.status === "已通过")}
            onClick={() => recordAssessment(
              submission.sceneId,
              task.id,
              {
                id: crypto.randomUUID(),
                methodId: defenseMethod.id,
                type: defenseMethod.type,
                status: defenseScore >= defenseMethod.passScore ? "已通过" : "已退回",
                score: defenseScore,
                submittedAt: nowLabel(),
                reviewer: "周启明",
                comment: defenseComment,
              },
              submission.studentId,
            )}
          >
            {defenseResult?.status === "已通过" ? "已评分" : "保存答辩评分"}
          </Btn>
        </div>
      )}
      <input aria-label="任务评价反馈" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="填写评价意见与修改要求" />
      <div className="ep-actions">
        <span className="ep-grow">综合 {total} 分 · 通过线 60</span>
        <Btn secondary disabled={!comment.trim()} onClick={() => submit("returned")}>退回本任务</Btn>
        <Btn disabled={total < 60 || !comment.trim() || Boolean(prerequisiteReason)} title={prerequisiteReason} onClick={() => submit("passed")}>通过本任务</Btn>
      </div>
      {prerequisiteReason && <p className="ep-status warn">{prerequisiteReason}</p>}
    </div>
  );
}

function ReviewForm({ onSubmit }: { onSubmit: (review: Review) => void }) {
  const { evaluationStandard } = useWorkspacePage();
  const [evidence, setEvidence] = useState(32);
  const [reasoning, setReasoning] = useState(32);
  const [delivery, setDelivery] = useState(16);
  const [comment, setComment] = useState("证据完整，能够说明定位依据与采集边界。");
  const [tags, setTags] = useState<string[]>(["证据充分", "边界清楚"]);
  const total = Math.round(evidence + reasoning + delivery);
  const passScore = evaluationStandard.passScore ?? 60;
  const submit = (decision: "passed" | "returned") => {
    if (!comment.trim()) return;
    if (decision === "passed" && total < passScore) return;
    onSubmit({ evidenceScore: evidence, reasoningScore: reasoning, deliveryScore: delivery, total, tags, comment, decision, reviewer: "周启明", reviewedAt: nowLabel() });
  };
  return (
    <div className="ep-review">
      <div className="ep-review-scores">
        <label>证据准确<input type="range" min="0" max="40" value={evidence} onChange={(event) => setEvidence(Number(event.target.value))} /><b>{evidence}/40</b></label>
        <label>定位推理<input type="range" min="0" max="40" value={reasoning} onChange={(event) => setReasoning(Number(event.target.value))} /><b>{reasoning}/40</b></label>
        <label>交付表达<input type="range" min="0" max="20" value={delivery} onChange={(event) => setDelivery(Number(event.target.value))} /><b>{delivery}/20</b></label>
      </div>
      <div className="ep-chips">{["证据充分", "答辩清楚", "边界清楚", "建议补充盲区"].map((tag) => <button className={tags.includes(tag) ? "active" : ""} key={tag} onClick={() => setTags(tags.includes(tag) ? tags.filter((item) => item !== tag) : [...tags, tag])}>{tag}</button>)}</div>
      <input aria-label="评价反馈" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="评价反馈与修改要求" />
      <p>综合 {total} 分 · 通过线 {passScore}</p>
      <div className="ep-actions"><Btn disabled={total < passScore || !comment.trim()} onClick={() => submit("passed")}>通过并回写画像</Btn><Btn secondary disabled={!comment.trim()} onClick={() => submit("returned")}>退回修改</Btn></div>
    </div>
  );
}
