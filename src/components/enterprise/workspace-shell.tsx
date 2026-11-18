"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronRight,
  Download,
  GraduationCap,
  Layers,
  LockKeyhole,
  LogOut,
  Network,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";
import { AbilityRadar } from "@/components/ability-radar";
import {
  abilityScores,
  certificateEligibility,
  classMetrics,
  completedDays,
  dimensions,
  effectiveRightsStatus,
  examQuestions,
  generatedCertificateNumber,
  jobMatch,
  jobPostingEligibility,
  jobTrainingReadiness,
  latestWork,
  majorGroupAdaptation,
  nowLabel,
  orderRightsBlockers,
  projectEligibility,
  publishedAssessments,
  publishedCourses,
  publishedJobs,
  publishedScenes,
  publishedStandards,
  resourceById,
  resourceName,
  resourceRightsBlockedReason,
  resourceRightsReady,
  resourceVisible,
  rightsSummary,
  resumeComplete,
  trainingEligibility,
  trainings,
  workBlockedReason,
  workReview,
  type Application,
  type ApplicationStatus,
  type AssessmentProfile,
  type MajorGroup,
  type Resource,
  type Resume,
  type Review,
  type Role,
  type StandardProfile,
  type TrainingProfile,
  type Work,
} from "@/lib/enterprise-workspace";
import {
  buildApplication,
  buildWork,
  jobStatusOptions,
  projectStatusOptions,
  useWorkspace,
  WorkspaceProvider,
} from "@/components/enterprise/workspace-store";
import { ResourceBuilder, ResourcePreview } from "@/components/enterprise/resource-builders";

const channels = [
  ["industry", "产业链分析"],
  ["resources", "岗位与场景资源馆"],
  ["courses", "课程与教材资源馆"],
  ["assessment", "测评与证书资源馆"],
  ["projects", "产业项目实战"],
  ["employment", "就业服务中心"],
];

const studentNav = [
  ["learning", "我的学习"],
  ["learning/portrait", "能力画像"],
  ["learning/projects", "我的项目"],
  ["learning/applications", "投递记录"],
  ["learning/resume", "我的简历"],
];

const teacherNav = [
  ["teacher", "教学总览"],
  ["teacher/classes", "班级与学生"],
  ["teacher/reviews", "成果评价"],
  ["teacher/report", "院校成效"],
];

const management = [
  ["manage", "企业看板"],
  ["manage/resources", "资源建设与审核"],
  ["manage/standards", "能力评价标准"],
  ["manage/schools", "合作院校与协议"],
  ["manage/experts", "企业专家库"],
  ["manage/projects", "项目派单与验收"],
  ["manage/recruitment", "招聘与人才库"],
  ["manage/orders", "资源订阅与授权"],
  ["manage/settlement", "结算台账"],
];

const radarKeys = ["deploy", "listen", "path", "locate", "alert", "report"] as const;

function Btn({
  children,
  onClick,
  secondary = false,
  disabled = false,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button type="button" title={title} disabled={disabled} className={secondary ? "ep-button secondary" : "ep-button"} onClick={onClick}>
      {children}
    </button>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={"ep-card " + className}>{children}</section>;
}

function Tag({ children, tone = "" }: { children: ReactNode; tone?: string }) {
  return <span className={`ep-tag ${tone ? `is-${tone}` : ""}`}>{children}</span>;
}

function RadarView({ values }: { values: number[] }) {
  return <AbilityRadar scores={Object.fromEntries(radarKeys.map((key, index) => [key, values[index]])) as Record<typeof radarKeys[number], number>} />;
}

function Metric({ value, label }: { value: ReactNode; label: string }) {
  return (
    <Card>
      <small>{label}</small>
      <strong>{value}</strong>
    </Card>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <div className="ep-empty"><AlertCircle size={18} />{children}</div>;
}

function History({ items }: { items: { at: string; actor: string; action: string; note: string }[] }) {
  if (!items.length) return null;
  return (
    <details className="ep-history">
      <summary>进展记录 {items.length}</summary>
      <div>
        {items.map((item, index) => (
          <p key={`${item.at}-${index}`}>
            <time>{item.at}</time>
            <b>{item.actor}</b>
            {item.action}
            <span>{item.note}</span>
          </p>
        ))}
      </div>
    </details>
  );
}

function pageTitle(page: string) {
  return [...channels, ...studentNav, ...teacherNav, ...management].find(([url]) => url === page)?.[1] ?? ({
    job: "岗位详情",
    scene: "场景实训",
    training: "短训学习地图",
    course: "课程学习",
    exam: "岗位测评",
    resource: "资源详情",
    standard: "岗位评价标准",
    project: "项目详情",
    login: "身份选择",
  } as Record<string, string>)[page.split("/")[0]] ?? "岗位培养";
}

export default function Platform({ path = [] }: { path?: string[] }) {
  return (
    <WorkspaceProvider>
      <WorkspaceShell path={path} />
    </WorkspaceProvider>
  );
}

function WorkspaceShell({ path }: { path: string[] }) {
  const router = useRouter();
  const {
    state,
    hydrated,
    setRole,
    markGuideSeen,
    saveResume,
    toggleFavorite,
    assignTraining,
    completeDay,
    submitWork,
    reviewWork,
    submitExam,
    issueCertificate,
    resourceAction,
    updateMajorGroup,
    publishProject,
    toggleProject,
    publishJob,
    toggleJob,
    apply,
    processApplication,
    submitDelivery,
    advanceOrder,
    reset,
  } = useWorkspace();
  const page = path.join("/") || "industry";
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("全部");
  const [tab, setTab] = useState("岗位");
  const [selected, setSelected] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [resourceType, setResourceType] = useState<Resource["type"]>("岗位");
  const [creatingResource, setCreatingResource] = useState(false);
  const jobs = publishedJobs(state);
  const scenes = publishedScenes(state);
  const courses = publishedCourses(state);
  const publishedAssessmentList = publishedAssessments(state);
  const publishedStandardList = publishedStandards(state);
  const accessibleAssessmentList = publishedAssessmentList.filter((item) => state.role === "manage" || resourceVisible(state, item.id));
  const accessibleStandardList = publishedStandardList.filter((item) => state.role === "manage" || resourceVisible(state, item.id));
  const jobById = (id: string) => jobs.find((item) => item.id === id);
  const sceneById = (id: string) => scenes.find((item) => item.id === id);
  const courseById = (id: string) => courses.find((item) => item.id === id);
  const trainingById = (id: string): TrainingProfile | undefined => {
    const base = trainings.find((item) => item.id === id);
    if (base) return base;
    if (!id.startsWith("path-")) return undefined;
    const job = jobById(id.slice(5));
    if (!job) return undefined;
    const relatedScenes = scenes.filter((scene) => (job.sceneIds ?? []).includes(scene.id));
    const relatedCourses = courses.filter((course) => (job.courseIds ?? []).includes(course.id));
    const planItems = [
      { title: `${job.name}岗位认知`, courseId: relatedCourses[0]?.id ?? "", sceneId: undefined as string | undefined },
      ...relatedCourses.slice(0, 3).map((course) => ({ title: course.name, courseId: course.id, sceneId: undefined as string | undefined })),
      ...relatedScenes.map((scene) => ({ title: scene.name, courseId: relatedCourses[0]?.id ?? "", sceneId: scene.id })),
    ];
    return {
      id,
      name: `${job.name}岗位学习路径`,
      days: planItems.length,
      jobId: job.id,
      sceneId: relatedScenes[0]?.id ?? "",
      dayPlans: planItems.map((item, index) => ({
        day: index + 1,
        title: item.title,
        courseId: item.courseId,
        sceneId: item.sceneId,
        activity: item.sceneId ? "完成场景分析并提交成果" : "完成课程节点并记录方法要点",
      })),
    };
  };
  const currentTrainingDay = (workspaceState: typeof state, id = "network") => {
    const training = trainingById(id);
    if (!training) return undefined;
    const done = completedDays(workspaceState, id);
    return training.dayPlans.find((item) => !done.includes(item.day)) ?? training.dayPlans[training.dayPlans.length - 1];
  };
  const assessment: AssessmentProfile =
    accessibleAssessmentList.find((item) => item.jobId === "service") ??
    accessibleAssessmentList[0] ??
    {
      id: "assessment-service",
      name: "技术服务岗位综合测评",
      jobId: "service",
      durationMinutes: 30,
      passScore: 80,
      questions: examQuestions,
    };
  const evaluationStandard: StandardProfile =
    accessibleStandardList.find((item) => item.jobId === "service") ??
    accessibleStandardList[0] ??
    {
      id: "standard-service",
      name: "技术服务工程师能力评价标准",
      jobId: "service",
      abilityPointWeights: [],
      levelBands: [],
      recognitionRule: "",
      evidenceWeight: 40,
      reasoningWeight: 40,
      deliveryWeight: 20,
      passScore: 60,
      goodScore: 80,
      excellentScore: 90,
    };
  const title = pageTitle(page);
  const requiredRole: Role | null = page.startsWith("learning")
    ? "student"
    : page.startsWith("teacher")
      ? "teacher"
      : page.startsWith("manage")
        ? "manage"
        : null;
  const authorizedArea = Boolean(requiredRole && state.role === requiredRole);
  const notify = (message: string) => setNotice(message);

  useEffect(() => {
    setQuery("");
    setFilter("全部");
    setSelected(0);
    setAnswers({});
  }, [page]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const switchRole = (role: Role, target: string) => {
    setRole(role);
    router.push(`/platform/${target}`);
  };

  const go = (target: string) => router.push(`/platform/${target}`);

  if (!hydrated) {
    return <div className="ep-loading">正在载入演示数据…</div>;
  }

  const content = renderPage();

  return (
    <div className="ep">
      <header className="ep-header">
        <Link className="ep-brand" href="/platform/industry">
          <span className="ep-brand-lockup">
            <Image src="/brand/colasoft-logo.png" alt="科来" width={34} height={32} priority />
            <strong>科来-知与</strong>
          </span>
          <span className="ep-brand-product">
            <b>场景化产教融合平台</b>
            <small>SCENARIO-BASED INDUSTRY-EDUCATION INTEGRATION PLATFORM</small>
          </span>
        </Link>
        <div className="ep-header-right">
          <button onClick={() => switchRole("student", "learning")}>学习中心</button>
          <button onClick={() => switchRole("teacher", "teacher")}>教学服务台</button>
          <button onClick={() => switchRole("manage", "manage")}>科来管理</button>
          <Link className="ep-user" href="/platform/login">
            {state.role === "teacher" ? "周启明" : state.role === "manage" ? "科来运营" : state.resume.name}
            <LogOut size={14} />
          </Link>
        </div>
      </header>
      {page !== "login" && (
        <nav className="ep-nav">
          {channels.map(([url, label]) => (
            <Link key={url} className={page === url ? "active" : ""} href={`/platform/${url}`}>
              {label}
            </Link>
          ))}
        </nav>
      )}
      {page === "login" ? content : (
        <div className={"ep-layout " + (authorizedArea ? "with-sidebar" : "")}>
          {authorizedArea && (
            <aside className="ep-sidebar">
              <small>{state.role === "manage" ? "科来企业服务台" : state.role === "teacher" ? "院校教学服务" : "学生学习空间"}</small>
              {(state.role === "manage" ? management : state.role === "teacher" ? teacherNav : studentNav).map(([url, label]) => (
                <Link className={page === url ? "active" : ""} key={url} href={`/platform/${url}`}>{label}</Link>
              ))}
              <button onClick={() => { reset(); notify("演示数据已恢复"); }}>恢复演示数据</button>
              <small>本地演示环境</small>
            </aside>
          )}
          <main className="ep-main">
            {page !== "resources" && <div className="ep-breadcrumb">场景化产教融合平台 <ChevronRight size={12} /> {title}</div>}
            {!["industry", "learning", "resources"].includes(page) && (
              <div className="ep-pageheading">
                <h1>{title}</h1>
                <span>2026 学年 · 企业版</span>
              </div>
            )}
            {requiredRole && state.role !== requiredRole ? (
              <Card>
                <h2>需要{requiredRole === "student" ? "学生" : requiredRole === "teacher" ? "院校教职工" : "科来管理"}身份</h2>
                <p>请选择对应演示身份后继续。</p>
                <Link className="ep-button" href="/platform/login">选择身份</Link>
              </Card>
            ) : content}
          </main>
        </div>
      )}
      <footer className="ep-footer">
        <div className="ep-footer-main">
          <div className="ep-footer-brand">
            <Link href="/platform/industry">
              <Image src="/brand/colasoft-logo.png" alt="" width={34} height={32} />
              <strong>科来 - 知与</strong>
            </Link>
            <p>场景化产教融合平台，连接产业岗位、院校教学与人才评价。</p>
          </div>
          <nav className="ep-footer-links" aria-label="平台功能">
            <strong>平台功能</strong>
            <Link href="/platform/industry">产业链分析</Link>
            <Link href="/platform/resources">岗位与场景</Link>
            <Link href="/platform/projects">产业项目</Link>
            <Link href="/platform/employment">就业服务</Link>
          </nav>
          <nav className="ep-footer-links" aria-label="资源体系">
            <strong>资源体系</strong>
            <Link href="/platform/courses">课程与教材</Link>
            <Link href="/platform/assessment">测评与证书</Link>
            <Link href="/platform/manage/resources">资源建设</Link>
            <Link href="/platform/manage/standards">能力标准</Link>
          </nav>
          <div className="ep-footer-qr">
            <Image src="/brand/zhiyu-wechat-qr.png" alt="知与公众号二维码" width={92} height={92} />
            <div>
              <strong>关注知与</strong>
              <span>扫码了解产业人才培养实践</span>
            </div>
          </div>
        </div>
        <div className="ep-footer-bottom">
          <span>© 2026 场景化产教融合平台</span>
          <span className="ep-footer-support">场景化产教融合平台体系支撑单位：杭州知与未来科技有限公司</span>
        </div>
      </footer>
      {state.role === "teacher" && !state.teacherGuideSeen && page === "industry" && (
        <TeacherGuide onClose={() => { markGuideSeen(); notify("教师导览已记录"); }} />
      )}
      {notice && <div role="status" className="ep-toast">{notice}</div>}
    </div>
  );

  function TeacherGuide({ onClose }: { onClose: () => void }) {
    return (
      <div className="ep-modal-backdrop" role="dialog" aria-modal="true" aria-label="教师产业导览">
        <Card>
          <Tag>教师首次导览</Tag>
          <h1>以岗位标准组织场景教学</h1>
          <h2>岗位 → 短训 → 场景 → 评价 → 画像</h2>
          <p>学生在真实业务问题中完成任务，教师依据证据、推理和交付维度完成验收。</p>
          <Btn onClick={onClose}>进入教学服务台</Btn>
        </Card>
      </div>
    );
  }

  function renderPage(): ReactNode {
    if (page === "login") return <LoginView />;
    if (page === "industry") return <IndustryView />;
    if (page === "resources") return <ResourcesView />;
    if (page === "courses") return <CoursesView />;
    if (page === "assessment") return <AssessmentView />;
    if (page === "exam") return <ExamView />;
    if (path[0] === "assessment" && path[1]) return <AssessmentDetail id={path[1]} />;
    if (path[0] === "standard" && path[1]) return <StandardDetail id={path[1]} />;
    if (path[0] === "exam" && path[1]) return <ExamView id={path[1]} />;
    if (page === "projects") return <ProjectsView />;
    if (path[0] === "project" && path[1]) return <ProjectDetail id={path[1]} />;
    if (page === "employment") return <EmploymentView />;
    if (path[0] === "job") return <JobView id={path[1]} />;
    if (path[0] === "training") return <TrainingView id={path[1]} />;
    if (path[0] === "scene") return <SceneView id={path[1]} />;
    if (path[0] === "course") return <CourseView id={path[1]} />;
    if (path[0] === "resource") return <ResourceView id={path[1]} />;
    if (page === "learning") return <StudentHome />;
    if (page === "learning/portrait") return <PortraitView />;
    if (page === "learning/projects") return <StudentApplications kind="project" />;
    if (page === "learning/applications") return <StudentApplications kind="job" />;
    if (page === "learning/resume") return <ResumeView />;
    if (page === "teacher") return <TeacherHome />;
    if (page === "teacher/classes") return <ClassesView />;
    if (page === "teacher/reviews") return <ReviewsView />;
    if (page === "teacher/report") return <TeacherReport />;
    if (page === "manage") return <ManageHome />;
    if (page === "manage/resources") return <ManageResources />;
    if (page === "manage/standards") return <StandardsView />;
    if (page === "manage/schools") return <SchoolsView />;
    if (page === "manage/experts") return <ExpertsView />;
    if (page === "manage/projects") return <ManageApplications kind="project" />;
    if (page === "manage/recruitment") return <ManageApplications kind="job" />;
    if (page === "manage/orders") return <OrdersView />;
    if (page === "manage/settlement") return <SettlementView />;
    return <Card><h1>页面不存在</h1><Link href="/platform/industry">返回产业链分析</Link></Card>;
  }

  function LoginView() {
    const roles: { role: Role; name: string; desc: string; icon: ReactNode }[] = [
      { role: "student", name: "学生", desc: "学习、实训与求职", icon: <GraduationCap /> },
      { role: "teacher", name: "院校教职工", desc: "教学、评价与成效", icon: <BookOpen /> },
      { role: "manage", name: "科来管理", desc: "资源、合作与人才", icon: <Building2 /> },
    ];
    return (
      <div className="ep-login">
        <div>
          <Tag>场景化产教融合平台</Tag>
          <h1>让真实业务现场<br />成为人才成长的起点</h1>
          <p>从岗位标准、场景实战，到能力评价与产业交付。</p>
          <div className="ep-login-art"><Network size={160} strokeWidth={0.7} /><Activity size={100} strokeWidth={0.8} /></div>
        </div>
        <Card>
          <h2>登录场景化产教融合平台</h2>
          <p>选择演示身份进入工作空间</p>
          {roles.map((item) => (
            <button
              key={item.role}
              className="ep-role"
              onClick={() => switchRole(item.role, item.role === "student" ? "learning" : item.role === "teacher" ? "teacher" : "manage")}
            >
              <span className="ep-icon">{item.icon}</span>
              <span className="ep-grow"><b>{item.name}</b><small>{item.desc}</small></span>
              <ArrowUpRight />
            </button>
          ))}
          <small>浏览器本地演示 · 侧栏可恢复全部数据</small>
        </Card>
      </div>
    );
  }

  function IndustryView() {
    const [groupFilter, setGroupFilter] = useState("全部");
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
    const [groupMajors, setGroupMajors] = useState("");
    const [groupJobIds, setGroupJobIds] = useState<string[]>([]);
    const manager = state.role === "manage";
    const selectedGroup = state.majorGroups.find((item) => item.id === groupFilter);
    const resourceAvailable = (id: string) =>
      manager ? Boolean(resourceById(state, id)?.publishedContent) : resourceVisible(state, id);
    const visibleJobs = jobs.filter(
      (item) =>
        resourceAvailable(item.id) &&
        (!selectedGroup || selectedGroup.jobIds.includes(item.id)),
    );
    const visibleScenes = scenes.filter(
      (item) =>
        resourceAvailable(item.id) &&
        (!selectedGroup || selectedGroup.jobIds.includes(item.jobId)),
    );
    const rights = rightsSummary(state);
    const pendingScenes = scenes.filter((scene) => {
      const status = effectiveRightsStatus(resourceById(state, scene.id)?.rights);
      return status !== "已确权";
    });
    const beginGroupEdit = (group: MajorGroup) => {
      setEditingGroupId(group.id);
      setGroupMajors(group.majors.join("，"));
      setGroupJobIds(group.jobIds);
    };
    const saveGroup = () => {
      if (!editingGroupId) return;
      const majors = groupMajors.split(/[，,、]/).map((item) => item.trim()).filter(Boolean);
      if (!majors.length || !groupJobIds.length) return notify("请选择专业与关联岗位");
      updateMajorGroup(editingGroupId, { majors, jobIds: groupJobIds });
      notify("专业群适配已更新");
      setEditingGroupId(null);
    };
    return (
      <>
        <div className="ep-stats">
          <Metric label="产业链环节" value={3} />
          <Metric label="科来适配岗位" value={jobs.filter((item) => resourceAvailable(item.id)).length} />
          <Metric label="适配专业群" value={state.majorGroups.length} />
          <Metric label="已确权资源" value={`${rights.confirmed}/${state.resources.length}`} />
        </div>
        <div className="ep-section-title">
          <div><Tag>INDUSTRY LANDSCAPE</Tag><h1>从产业链到专业群</h1><p>连接科来岗位能力、院校专业群与可确权教学资源</p></div>
          <Link className="ep-button" href="/platform/resources">探索岗位与场景 <ArrowUpRight size={16} /></Link>
        </div>
        <div className="ep-chain industry">
          {[["采集基础设施", "TAP · 镜像采集 · 环境部署", Network], ["分析研判", "协议分析 · 性能诊断 · 安全研判", Activity], ["技术服务", "方案验证 · 现场交付 · 业务运维", ShieldCheck]].map(([name, desc, Icon]) => {
            const Comp = Icon as typeof Network;
            const stageJobs = visibleJobs.filter((item) => item.stage === name);
            const relatedGroups = state.majorGroups.filter((group) => group.jobIds.some((id) => stageJobs.some((job) => job.id === id)));
            const readyCount = stageJobs.filter((job) => jobTrainingReadiness(state, job.id).ready).length;
            return (
              <Card className="ep-industry-stage" key={String(name)}>
                <Comp size={48} strokeWidth={1} />
                <h2>{String(name)}</h2>
                <p>{String(desc)}</p>
                <div className="ep-stage-meta">
                  <span>{stageJobs.length} 个岗位</span>
                  <span>{readyCount}/{stageJobs.length} 条完整路径</span>
                </div>
                <div className="ep-chips">{relatedGroups.map((group) => <Tag key={group.id}>{group.name}</Tag>)}</div>
                {stageJobs.map((item) => (
                  <Link className="ep-row" key={item.id} href={`/platform/job/${item.id}`}>{item.name}<ArrowUpRight size={15} /></Link>
                ))}
              </Card>
            );
          })}
        </div>
        <Card className="ep-major-matrix">
          <div className="ep-section-title">
            <div><Tag>MAJOR GROUP FIT</Tag><h2>科来适配的专业群</h2></div>
            <button className="ep-button secondary" onClick={() => setGroupFilter("全部")}>全部专业群</button>
          </div>
          <div className="ep-filters">
            <button className={groupFilter === "全部" ? "active" : ""} onClick={() => setGroupFilter("全部")}>全部</button>
            {state.majorGroups.map((group) => (
              <button key={group.id} className={groupFilter === group.id ? "active" : ""} onClick={() => setGroupFilter(group.id)}>{group.name}</button>
            ))}
          </div>
          <div className="ep-major-grid">
            {state.majorGroups.map((group) => {
              const fit = majorGroupAdaptation(state, group.id);
              return (
                <article className={"ep-major-card " + (groupFilter === group.id ? "selected" : "")} key={group.id}>
                  <button className="ep-major-main" onClick={() => setGroupFilter(group.id)}>
                    <div className="ep-major-head"><Tag>{group.code}</Tag><Tag tone={fit.status === "强适配" ? "success" : fit.status === "可适配" ? "warning" : "muted"}>{fit.status}</Tag></div>
                    <h3>{group.name}</h3>
                    <p>{group.description}</p>
                    <div className="ep-chips">{group.majors.map((major) => <span key={major}>{major}</span>)}</div>
                    <div className="ep-major-stats">
                      <span><b>{fit.jobs.length}</b> 岗位</span>
                      <span><b>{fit.scenes.length}</b> 场景</span>
                      <span><b>{fit.courses.length}</b> 课程</span>
                      <span><b>{fit.completedJobs.length}</b> 完整路径</span>
                    </div>
                  </button>
                  {manager && <button type="button" className="ep-major-edit" onClick={() => beginGroupEdit(group)}>维护适配</button>}
                </article>
              );
            })}
          </div>
          {manager && editingGroupId && (
            <div className="ep-major-editor">
              <h3>维护专业与岗位映射</h3>
              <label className="ep-form">覆盖专业<input value={groupMajors} onChange={(event) => setGroupMajors(event.target.value)} /></label>
              <div className="ep-resource-checks">
                <h3>关联岗位</h3>
                {jobs.map((job) => (
                  <label key={job.id}>
                    <input type="checkbox" checked={groupJobIds.includes(job.id)} onChange={(event) => setGroupJobIds(event.target.checked ? [...groupJobIds, job.id] : groupJobIds.filter((id) => id !== job.id))} />
                    {job.name}
                  </label>
                ))}
              </div>
              <div className="ep-actions"><Btn onClick={saveGroup}>保存适配</Btn><Btn secondary onClick={() => setEditingGroupId(null)}>取消</Btn></div>
            </div>
          )}
        </Card>
        <Card className="ep-rights-overview">
          <div className="ep-section-title">
            <div><Tag>RIGHT CLEARANCE</Tag><h2>场景与资源确权</h2></div>
            {manager && <Link className="ep-link" href="/platform/manage/resources">进入资源管理 <ArrowUpRight size={15} /></Link>}
          </div>
          <div className="ep-rights-stats">
            <div><b>{rights.confirmed}</b><span>已确权</span></div>
            <div><b>{rights.reviewing}</b><span>审核中</span></div>
            <div><b>{rights.pending}</b><span>待确权</span></div>
            <div><b>{rights.rejected + rights.expired}</b><span>驳回 / 过期</span></div>
          </div>
          {manager && pendingScenes.length > 0 && (
            <div className="ep-rights-pending">
              {pendingScenes.slice(0, 4).map((scene) => {
                const resource = resourceById(state, scene.id);
                const status = effectiveRightsStatus(resource?.rights);
                return (
                  <div key={scene.id}>
                    <span><b>{scene.name}</b><small>{resource?.rights?.ownership ?? "待补录"}</small></span>
                    <Tag tone={status === "已驳回" || status === "已过期" ? "danger" : "warning"}>{status}</Tag>
                    {manager && resource?.rights?.agreementNo && <small>{resource.rights.agreementNo}</small>}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
        <Card>
          <h2>行业应用现场</h2>
          <div className="ep-grid compact">
            {visibleScenes.map((item) => {
              const resource = resourceById(state, item.id);
              const rightsStatus = effectiveRightsStatus(resource?.rights);
              return (
                <Link className="ep-field ep-scene-field" href={`/platform/scene/${item.id}`} key={item.id}>
                  <div className="ep-field-tags"><Tag>{item.industry}</Tag><Tag tone={rightsStatus === "已确权" ? "success" : "warning"}>{rightsStatus}</Tag></div>
                  <h3>{item.name}</h3><p>{item.description}</p>
                  <small>{resource?.rights?.ownership ?? "待补录"} · {resource?.rights?.useScopes.join(" / ")}</small>
                </Link>
              );
            })}
          </div>
        </Card>
      </>
    );
  }

  function ResourcesView() {
    const tabs = ["岗位", "场景", "课程", "短训", "资源图谱"];
    const matching = (text: string) => text.toLowerCase().includes(query.trim().toLowerCase());
    const generatedPaths = jobs
      .filter((job) => jobTrainingReadiness(state, job.id).ready && !trainings.some((training) => training.jobId === job.id))
      .map((job) => trainingById(`path-${job.id}`))
      .filter((item): item is TrainingProfile => Boolean(item));
    const resourceOverview = [
      { label: "岗位", value: jobs.filter((item) => resourceVisible(state, item.id)).length },
      { label: "场景", value: scenes.filter((item) => resourceVisible(state, item.id)).length },
      { label: "课程", value: courses.filter((item) => resourceVisible(state, item.id)).length },
      { label: "短训", value: trainings.filter((item) => resourceVisible(state, item.sceneId)).length + generatedPaths.length },
    ];
    const resourceChainLabels = ["能力标准", "真实任务", "方法内容", "学习路径"];
    const maxResourceCount = Math.max(1, ...resourceOverview.map((item) => item.value));
    const browseResources = (nextTab: string) => {
      setTab(nextTab);
      setFilter("全部");
      setQuery("");
      window.requestAnimationFrame(() => {
        const behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
        document.getElementById("resource-browser")?.scrollIntoView({ behavior, block: "start" });
      });
    };
    return (
      <>
        <section className="ep-resource-hero">
          <svg className="ep-resource-hero-geometry" viewBox="0 0 1440 520" preserveAspectRatio="none" aria-hidden="true">
            <path d="M-70 448 224 274V72l280 158" />
            <path d="M-70 448 238 482 518 314" />
            <path d="M1184 112 1388 228v236l-206-119Z" />
            <path d="M1078 0 1388 176" />
            <path d="M1030 520 1388 303" />
          </svg>
          <div className="ep-resource-hero-inner">
            <div className="ep-resource-hero-copy">
              <h2>把产业现场，<em>变成学习现场</em></h2>
              <p>从岗位标准到场景实训，连接可教、可练、可评价的产业资源。</p>
              <div className="ep-resource-hero-actions">
                <button type="button" className="ep-resource-hero-primary" onClick={() => browseResources("岗位")}>
                  浏览岗位资源<ArrowUpRight size={16} />
                </button>
                <button type="button" className="ep-resource-hero-secondary" onClick={() => browseResources("资源图谱")}>
                  打开资源图谱<Network size={16} />
                </button>
              </div>
              <div className="ep-resource-hero-metrics" aria-label="资源概览">
                {resourceOverview.map((item, index) => (
                  <div key={item.label} className={`ep-resource-metric metric-${index}`}>
                    <span className="ep-resource-metric-icon">
                      {index === 0 && <BriefcaseBusiness size={15} />}
                      {index === 1 && <Activity size={15} />}
                      {index === 2 && <BookOpen size={15} />}
                      {index === 3 && <GraduationCap size={15} />}
                    </span>
                    <span className="ep-resource-metric-copy">
                      <small>{item.label}</small>
                      <strong>{String(item.value).padStart(2, "0")}</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="ep-resource-hero-stage" aria-hidden="true">
              <div className="ep-resource-scene">
                <div className="ep-resource-stage-grid" />
                <div className="ep-resource-stage-glow" />
                <svg className="ep-resource-stage-links" viewBox="0 0 760 520" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="resource-link-gradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#fff" stopOpacity=".16" />
                      <stop offset=".52" stopColor="#ddeeff" stopOpacity=".7" />
                      <stop offset="1" stopColor="#79d2c6" stopOpacity=".58" />
                    </linearGradient>
                  </defs>
                  <path d="M260 128C306 124 327 145 354 192" />
                  <path d="M522 175C495 180 474 202 448 231" />
                  <path d="M360 372C369 341 382 319 404 295" />
                  <path className="is-ghost" d="M55 351C175 277 274 302 363 352S550 412 708 300" />
                  <circle cx="354" cy="192" r="4" />
                  <circle cx="448" cy="231" r="4" />
                  <circle cx="404" cy="295" r="4" />
                </svg>
                <div className="ep-resource-stage-orbit"><span /><span /><span /></div>

                <article className="ep-resource-card ep-resource-card-capability">
                  <header className="ep-resource-card-head">
                    <div><strong>岗位能力图谱</strong><small>真实业务任务</small></div>
                    <Network size={18} />
                  </header>
                  <div className="ep-resource-mini-map">
                    <svg viewBox="0 0 320 154" preserveAspectRatio="none">
                      <path d="M52 72 125 34 198 62 269 38 267 112 178 125 91 116Z" />
                      <path d="M52 72 136 88 198 62M136 88 178 125M136 88 267 112M125 34 136 88M91 116 198 62" />
                      <circle cx="52" cy="72" r="5" />
                      <circle cx="125" cy="34" r="5" />
                      <circle cx="198" cy="62" r="5" />
                      <circle cx="269" cy="38" r="4" />
                      <circle cx="267" cy="112" r="5" />
                      <circle cx="178" cy="125" r="4" />
                      <circle cx="91" cy="116" r="5" />
                      <circle className="is-core" cx="136" cy="88" r="9" />
                    </svg>
                    <span className="map-label label-collect">采集</span>
                    <span className="map-label label-analyze">分析</span>
                    <span className="map-label label-locate">定位</span>
                    <span className="map-label label-deliver">交付</span>
                  </div>
                </article>

                <article className="ep-resource-card ep-resource-card-composition">
                  <header className="ep-resource-card-head">
                    <div><strong>资源构成</strong><small>岗位到评价</small></div>
                    <Layers size={18} />
                  </header>
                  <div className="ep-resource-composition">
                    {resourceOverview.map((item, index) => (
                      <div className="ep-resource-composition-row" key={item.label}>
                        <div><b>{item.label}</b><small>{resourceChainLabels[index]}</small></div>
                        <i><span style={{ width: `${Math.max(24, Math.round(item.value / maxResourceCount * 100))}%` }} /></i>
                        <strong>{String(item.value).padStart(2, "0")}</strong>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="ep-resource-card ep-resource-card-path">
                  <header className="ep-resource-card-head">
                    <div><strong>教学转化</strong><small>任务形成能力证据</small></div>
                    <GraduationCap size={18} />
                  </header>
                  <div className="ep-resource-path">
                    {["真实任务", "实训过程", "能力评价"].map((item, index) => (
                      <div className="ep-resource-path-step" key={item}>
                        <span>{index + 1}</span><b>{item}</b>
                      </div>
                    ))}
                  </div>
                </article>

                <div className="ep-resource-core">
                  <div className="ep-resource-core-float">
                    <div className="ep-resource-core-cube">
                      <span className="cube-face cube-face-front"><i>资源</i></span>
                      <span className="cube-face cube-face-back"><i>评价</i></span>
                      <span className="cube-face cube-face-right"><i>教学</i></span>
                      <span className="cube-face cube-face-left"><i>岗位</i></span>
                      <span className="cube-face cube-face-top"><i>产业</i></span>
                      <span className="cube-face cube-face-bottom"><i>场景</i></span>
                    </div>
                    <span className="ep-resource-core-ring" />
                  </div>
                  <span className="ep-resource-core-label"><ShieldCheck size={13} />资源中枢</span>
                </div>

                <span className="ep-resource-scene-node scene-node-one"><i /></span>
                <span className="ep-resource-scene-node scene-node-two"><i /></span>
                <span className="ep-resource-scene-node scene-node-three"><i /></span>
              </div>
            </div>
          </div>
        </section>
        <div className="ep-pageheading ep-resource-pageheading">
          <h1>岗位与场景资源馆</h1>
          <span>2026 学年 · 企业版</span>
        </div>
        <div className="ep-toolbar" id="resource-browser">
          <div className="ep-tabs">
            {tabs.map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => { setTab(item); setFilter("全部"); }}>{item}</button>)}
          </div>
          <label className="ep-search"><Search size={16} /><input aria-label="搜索资源" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索岗位、场景或技能" /></label>
        </div>
        <Card className="ep-matrix">
          <h2>产业链资源矩阵</h2>
          <div className="ep-filters">
            {["全部", "金融", "能源", "医疗", "制造", "政务", "运营商"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}
          </div>
          <div className="ep-chain">
            {["采集基础设施", "分析研判", "技术服务"].map((stage, index) => (
              <button key={stage} onClick={() => { setFilter("全部"); setQuery(stage); }}>
                <span>0{index + 1}</span><b>{stage}</b><small>{jobs.filter((item) => item.stage === stage && resourceVisible(state, item.id)).length} 个岗位</small><ChevronRight />
              </button>
            ))}
          </div>
        </Card>
        {tab === "岗位" && (
          <div className="ep-grid">
            {jobs.filter((item) => resourceVisible(state, item.id) && (filter === "全部" || item.industry === filter) && matching(`${item.name}${item.skills.join("")}${item.stage}`)).map((item, index) => (
              <Card key={item.id}>
                <div className={`ep-art art-${index}`}><Network size={64} /><span>{item.category}</span></div>
                <div className="ep-cardbody"><Tag>{item.stage}</Tag><h2>{item.name}</h2><p>{item.description}</p><div className="ep-chips">{item.skills.map((skill) => <Tag key={skill}>{skill}</Tag>)}</div><Link className="ep-link" href={`/platform/job/${item.id}`}>探索岗位与学习路径 <ArrowUpRight size={16} /></Link></div>
              </Card>
            ))}
            {state.resources.filter((item) => item.type === "岗位" && !jobById(item.id) && resourceVisible(state, item.id) && matching(item.name)).map((item) => <ResourceCard key={item.id} resource={item} />)}
          </div>
        )}
        {tab === "场景" && (
          <div className="ep-grid">
            {scenes.filter((item) => resourceVisible(state, item.id) && (filter === "全部" || item.industry === filter) && matching(item.name)).map((item, index) => (
              <Card key={item.id}>
                <div className={`ep-art art-${index}`}><Activity size={64} /><span>{item.industry}现场</span></div>
                <div className="ep-cardbody"><Tag>{item.difficulty}</Tag><h2>{item.name}</h2><p>{item.description}</p><Link className="ep-link" href={`/platform/scene/${item.id}`}>查看场景与任务 <ArrowUpRight size={16} /></Link></div>
              </Card>
            ))}
            {state.resources.filter((item) => item.type === "场景" && !sceneById(item.id) && resourceVisible(state, item.id) && matching(item.name)).map((item) => <ResourceCard key={item.id} resource={item} />)}
          </div>
        )}
        {tab === "课程" && (
          <div className="ep-grid">
            {courses.filter((item) => resourceVisible(state, item.id) && matching(item.name)).map((item, index) => (
              <Card key={item.id}>
                <div className={`ep-art art-${index}`}><BookOpen size={64} /><span>COLASOFT ACADEMY</span></div>
                <div className="ep-cardbody"><Tag>岗位核心课程</Tag><h2>{resourceName(state, item.id, item.name)}</h2><p>{item.chapters.length} 个章节 · 案例与实训联动</p><Link className="ep-link" href={`/platform/course/${item.id}`}>进入课程 <ArrowUpRight size={16} /></Link></div>
              </Card>
            ))}
          </div>
        )}
        {tab === "短训" && (
          <div className="ep-grid">
            {trainings.filter((item) => resourceVisible(state, item.sceneId)).map((item) => (
              <Card key={item.id}>
                <div className="ep-art"><GraduationCap size={64} /><span>{item.days} DAY LEARNING MAP</span></div>
                <div className="ep-cardbody"><Tag>{item.days} 天短训</Tag><h2>{item.name}</h2><p>岗位认知 → 方法学习 → 场景实操 → 综合交付</p><Link className="ep-link" href={`/platform/training/${item.id}`}>打开岗位学习地图 <ArrowUpRight size={16} /></Link></div>
              </Card>
            ))}
            {generatedPaths.map((item) => (
              <Card key={item.id}>
                <div className="ep-art"><GraduationCap size={64} /><span>{item.days} DAY JOB PATH</span></div>
                <div className="ep-cardbody"><Tag>{item.days} 个学习节点</Tag><h2>{item.name}</h2><p>岗位认知 → 课程学习 → 场景实操 → 成果提交</p><Link className="ep-link" href={`/platform/training/${item.id}`}>打开岗位学习地图 <ArrowUpRight size={16} /></Link></div>
              </Card>
            ))}
          </div>
        )}
        {tab === "资源图谱" && <ResourceGraph />}
      </>
    );
  }

  function ResourceCard({ resource }: { resource: Resource }) {
    return (
      <Card>
        <div className="ep-cardbody"><Tag>{resource.type}</Tag><h2>{resource.name}</h2><p>{resource.description}</p><Link className="ep-link" href={`/platform/resource/${resource.id}`}>查看资源 <ArrowUpRight size={16} /></Link></div>
      </Card>
    );
  }

  function ResourceGraph() {
    const visibleResources = state.resources.filter((item) => resourceVisible(state, item.id));
    return (
      <Card>
        <h2>岗位 · 场景 · 课程 · 能力</h2>
        {visibleResources.filter((item) => item.type === "岗位").map((resource) => {
          const related = resource.relatedIds.map((id) => resourceById(state, id)).filter((item): item is Resource => Boolean(item));
          return (
            <div className="ep-graph" key={resource.id}>
              <Link href={`/platform/resource/${resource.id}`}>{resourceName(state, resource.id, resource.name)}</Link>
              <ChevronRight />
              {related.map((item) => <Link key={item.id} href={`/platform/resource/${item.id}`}>{resourceName(state, item.id, item.name)}</Link>)}
            </div>
          );
        })}
      </Card>
    );
  }

  function JobView({ id }: { id?: string }) {
    const job = jobs.find((item) => item.id === id);
    if (!job) return <Empty>岗位不存在。</Empty>;
    if (!resourceVisible(state, job.id) && state.role !== "manage") {
      return <Empty>{resourceRightsBlockedReason(state, job.id, "教学使用") || "该岗位尚未授权给当前院校。"}</Empty>;
    }
    const readiness = jobTrainingReadiness(state, job.id);
    const relatedAssessments = publishedAssessmentList.filter((item) => (job.assessmentIds ?? []).includes(item.id) && (state.role === "manage" || resourceVisible(state, item.id)));
    const relatedStandards = publishedStandardList.filter((item) => (job.standardIds ?? []).includes(item.id) && (state.role === "manage" || resourceVisible(state, item.id)));
    const relatedScenes = scenes.filter((item) => (job.sceneIds ?? []).includes(item.id) && (state.role === "manage" || resourceVisible(state, item.id)));
    const relatedCourses = courses.filter((item) => (job.courseIds ?? []).includes(item.id) && (state.role === "manage" || resourceVisible(state, item.id)));
    const relatedGroups = state.majorGroups.filter((group) => (job.majorGroupIds ?? []).includes(group.id));
    const jobRights = resourceById(state, job.id)?.rights;
    return (
      <>
        <Card>
          <Tag>{job.category}</Tag><Tag tone={readiness.ready ? "success" : "warning"}>{readiness.ready ? "可培养" : "学习路径待完善"}</Tag>
          {jobRights && <Tag tone={effectiveRightsStatus(jobRights) === "已确权" ? "success" : "warning"}>{effectiveRightsStatus(jobRights)}</Tag>}
          <h1>{resourceName(state, job.id, job.name)}</h1><p>{job.description}</p>
          <div className="ep-chips">{job.skills.map((item) => <Tag key={item}>{item}</Tag>)}</div>
          {state.role === "student" && <Btn secondary onClick={() => toggleFavoriteWithNotice(job.id)}>{state.favorites.includes(job.id) ? "已收藏" : "收藏岗位"}</Btn>}
        </Card>
        <div className="ep-stats">
          <Metric label="工作任务" value={job.tasks?.length ?? 0} />
          <Metric label="能力点" value={job.abilityPoints?.length ?? 0} />
          <Metric label="关联场景" value={(job.sceneIds ?? []).filter((id) => resourceVisible(state, id)).length} />
          <Metric label="关联课程" value={(job.courseIds ?? []).filter((id) => resourceVisible(state, id)).length} />
        </div>
        <div className="ep-split">
          <Card>
            <h2>岗位能力模型与胜任标准</h2><RadarView values={job.target} />
            {dimensions.map((item, index) => <div className="ep-ability" key={item}><span>{item}</span><progress max="100" value={job.target[index]} /><b>{job.target[index]}</b></div>)}
            <h2>岗位职责</h2>
            {(job.responsibilities ?? []).length ? (job.responsibilities ?? []).map((item, index) => <div className="ep-row" key={`${item}-${index}`}><span className="ep-number">{index + 1}</span><span>{item}</span></div>) : <Empty>岗位职责待完善。</Empty>}
            <h2>任职要求</h2>
            {(job.requirements ?? []).map((item, index) => <p key={`${item}-${index}`}>· {item}</p>)}
          </Card>
          <Card>
            <h2>岗位实践路径</h2>
            {relatedGroups.length > 0 && <><h2>适配专业群</h2><div className="ep-chips">{relatedGroups.map((group) => <Tag key={group.id}>{group.name}</Tag>)}</div></>}
            {relatedScenes.map((item) => <Link className="ep-row" key={item.id} href={`/platform/scene/${item.id}`}>{item.name}<ChevronRight /></Link>)}
            <h2>关联课程与评价</h2>
            {relatedCourses.map((item) => <Link className="ep-row" key={item.id} href={`/platform/course/${item.id}`}>{item.name}<ChevronRight /></Link>)}
            {relatedAssessments.map((item) => <Link className="ep-row" key={item.id} href={`/platform/assessment/${item.id}`}>{item.name}<ChevronRight /></Link>)}
            {relatedStandards.map((item) => <Link className="ep-row" key={item.id} href={`/platform/standard/${item.id}`}>{item.name}<ChevronRight /></Link>)}
            {(job.certificates ?? []).length > 0 && <><h2>关联证书</h2><div className="ep-chips">{(job.certificates ?? []).map((item) => <Tag key={item}>{item}</Tag>)}</div></>}
            {!readiness.ready && <p className="ep-status warn">{readiness.reason}</p>}
          </Card>
        </div>
      </>
    );
  }

  function TrainingView({ id }: { id?: string }) {
    const training = trainingById(id ?? "network");
    if (!training) return <Empty>短训不存在。</Empty>;
    const day = training.dayPlans[selected] ?? training.dayPlans[0];
    const current = currentTrainingDay(state, training.id);
    const completed = completedDays(state, training.id);
    const assigned = state.classroom.assignedTrainingIds.includes(training.id);
    return (
      <>
        <Card>
          <Tag>{training.days} 天岗位学习地图</Tag><h1>{training.name}</h1>
          <p>{assigned ? "已分配至网络工程 2401" : "等待教师分配至班级"}</p>
          {state.role === "student" && !assigned && <Empty>教师分配后可开始学习。</Empty>}
        </Card>
        <div className="ep-learning-map">
          <Card>
            <h2>场景导航</h2>
            {training.dayPlans.map((item, index) => (
              <button className={"ep-day " + (selected === index ? "active" : "")} key={item.day} onClick={() => setSelected(index)}>
                <small>DAY {String(item.day).padStart(2, "0")}</small>{item.title}{completed.includes(item.day) && <CheckCircle2 size={14} />}
              </button>
            ))}
          </Card>
          <Card>
            <Tag>DAY {String(day.day).padStart(2, "0")}</Tag><h1>{day.title}</h1>
            <h2>本日任务</h2><p>{day.activity}</p>
            {day.courseId && resourceVisible(state, day.courseId) && <Link className="ep-row" href={`/platform/course/${day.courseId}`}><BookOpen size={20} /><div className="ep-grow">{resourceName(state, day.courseId, courseById(day.courseId)?.name ?? "关联课程")}<p>课程与案例材料</p></div><ChevronRight /></Link>}
            {day.sceneId && resourceVisible(state, day.sceneId) && <Link className="ep-row" href={`/platform/scene/${day.sceneId}`}><Activity size={20} /><div className="ep-grow">{resourceName(state, day.sceneId, sceneById(day.sceneId)?.name ?? "关联实训")}<p>进入场景完成任务</p></div><ChevronRight /></Link>}
            {state.role === "student" && assigned && (
              completed.includes(day.day)
                ? <Tag tone="success">本日已完成</Tag>
                : day.day === current?.day
                  ? <Btn onClick={() => { completeDayWithNotice(training.id, day.day); }}>完成本日学习</Btn>
                  : <Empty>当前开放 DAY {String(current?.day ?? 1).padStart(2, "0")}</Empty>
            )}
          </Card>
        </div>
      </>
    );
  }

  function CoursesView() {
    return (
      <div className="ep-grid">
        {courses.filter((course) => resourceVisible(state, course.id)).map((course, index) => (
          <Card key={course.id}>
            <div className={`ep-art art-${index}`}>
              <BookOpen size={64} />
              <span>COLASOFT ACADEMY</span>
            </div>
            <div className="ep-cardbody">
              <Tag>岗位核心课程</Tag>
              <h2>{resourceName(state, course.id, course.name)}</h2>
              <p>{course.chapters.length} 个章节 · 原理、案例与实操联动</p>
              <Link className="ep-link" href={`/platform/course/${course.id}`}>进入课程 <ArrowUpRight size={16} /></Link>
            </div>
          </Card>
        ))}
        {state.resources
          .filter((resource) => resource.type === "课程" && !courseById(resource.id) && resourceVisible(state, resource.id))
          .map((resource) => <ResourceCard key={resource.id} resource={resource} />)}
      </div>
    );
  }

  function CourseView({ id }: { id?: string }) {
    const course = courseById(id ?? "course-0");
    if (!course) return <Empty>课程不存在。</Empty>;
    if (!resourceVisible(state, course.id) && state.role !== "manage") {
      return <Empty>{resourceRightsBlockedReason(state, course.id, "教学使用") || "课程尚未授权给当前院校。"}</Empty>;
    }
    const chapter = course.chapters[selected] ?? course.chapters[0];
    return (
      <div className="ep-split">
        <Card>
          <h1>{resourceName(state, course.id, course.name)}</h1>
          {course.chapters.map((item, index) => <button className={"ep-day " + (selected === index ? "active" : "")} onClick={() => setSelected(index)} key={item.title}>{index + 1}. {item.title}</button>)}
        </Card>
        <Card>
          <Tag>第 {selected + 1} 章</Tag><h1>{chapter.title}</h1><p>{chapter.content}</p><h2>分析方法</h2><p>{chapter.method}</p>
          {resourceVisible(state, course.sceneId) && <Link className="ep-row" href={`/platform/scene/${course.sceneId}`}>进入{sceneById(course.sceneId)?.name}<ChevronRight /></Link>}
          {state.role === "student" && <Btn secondary onClick={() => notify("章节阅读已记录，完成情况以短训节点为准")}>标记已阅读</Btn>}
        </Card>
      </div>
    );
  }

  function SceneView({ id }: { id?: string }) {
    const scene = sceneById(id ?? "bank");
    if (!scene) return <Empty>场景不存在。</Empty>;
    if (!resourceVisible(state, scene.id) && state.role !== "manage") {
      return <Empty>{resourceRightsBlockedReason(state, scene.id, "教学使用") || "场景尚未授权给当前院校。"}</Empty>;
    }
    const work = latestWork(state, scene.id);
    return <ScenePanel key={scene.id} scene={scene} work={work} notify={notify} />;
  }

  function AssessmentDetail({ id }: { id: string }) {
    const item = publishedAssessmentList.find((assessmentItem) => assessmentItem.id === id);
    if (!item) return <Empty>测评不存在。</Empty>;
    if (!resourceVisible(state, item.id) && state.role !== "manage") {
      return <Empty>{resourceRightsBlockedReason(state, item.id, "教学使用") || "测评尚未授权给当前院校。"}</Empty>;
    }
    const job = jobById(item.jobId);
    return (
      <Card>
        <Tag>岗位能力测评 · {item.durationMinutes} 分钟</Tag>
        <h1>{item.name}</h1>
        <p>{job?.name ?? "未关联岗位"} · {item.questions.length} 题 · {item.passScore} 分合格</p>
        <div className="ep-actions">
          {state.role === "student" && <Link className="ep-button" href={`/platform/exam/${item.id}`}>进入测评</Link>}
          {job && <Link className="ep-button secondary" href={`/platform/job/${job.id}`}>查看岗位要求</Link>}
        </div>
      </Card>
    );
  }

  function StandardDetail({ id }: { id: string }) {
    const item = publishedStandardList.find((standard) => standard.id === id);
    if (!item) return <Empty>评价标准不存在。</Empty>;
    if (!resourceVisible(state, item.id) && state.role !== "manage") {
      return <Empty>{resourceRightsBlockedReason(state, item.id, "教学使用") || "评价标准尚未授权给当前院校。"}</Empty>;
    }
    const job = jobById(item.jobId);
    return (
      <Card>
        <Tag>岗位能力胜任标准</Tag>
        <h1>{item.name}</h1>
        <p>{job?.name ?? "未关联岗位"} · {item.abilityPointWeights.length} 个能力点</p>
        <h2>能力点权重</h2>
        {item.abilityPointWeights.map((point) => <div className="ep-ability" key={point.id}><span>{point.name}</span><progress max="100" value={point.weight} /><b>{point.weight}%</b></div>)}
        <h2>等级映射</h2>
        <div className="ep-chips">{item.levelBands.map((band) => <Tag key={band.level}>{band.level} {band.min}-{band.max}</Tag>)}</div>
        <h2>认定规则</h2>
        <p>{item.recognitionRule}</p>
      </Card>
    );
  }

  function AssessmentView() {
    if (accessibleAssessmentList.length === 0) return <Empty>暂无已完成确权并授权给当前院校的岗位测评。</Empty>;
    const eligibility = certificateEligibility(state);
    return (
      <>
        <div className="ep-split">
          <Card>
            <Tag>岗位能力综合测评</Tag><h1>{assessment.name}</h1><p>完成理论核验与场景实操评价，确认岗位能力达成情况。</p>
            {state.role === "student" ? <Link className="ep-button" href="/platform/exam">{eligibility.latestExam ? "查看成绩与重新测评" : "开始测评"}</Link> : <Empty>学生登录后可参加测评。</Empty>}
            <h2>当前状态</h2><p>理论成绩 {eligibility.latestExam?.score ?? "待测评"} · 必选场景 {eligibility.sceneReady ? "已通过" : "未通过"}</p>
          </Card>
          <Card>
            <ShieldCheck size={52} className="ep-blue" /><h2>岗位实战结业凭证</h2>
            <p>理论成绩达到 {assessment.passScore} 分，并通过至少一项必选场景实操。</p>
            {eligibility.certificate ? <Tag tone="success">{eligibility.certificate.number}</Tag> : <Btn disabled={!eligibility.eligible || state.role !== "student"} onClick={claimCertificate}>领取结业凭证</Btn>}
            {!eligibility.eligible && <p>{!eligibility.examReady ? "需先通过理论测评。" : ""}{!eligibility.sceneReady ? "需先通过必选场景实操。" : ""}</p>}
          </Card>
        </div>
        {eligibility.certificate && <CertificateCard certificate={eligibility.certificate} />}
        <Card>
          <div className="ep-section-title"><div><h2>测评历史</h2><p>最近一次成绩用于凭证判定</p></div></div>
          {state.examAttempts.length === 0 ? <Empty>还没有测评记录。</Empty> : state.examAttempts.map((item) => (
            <div className="ep-row" key={item.id}><div className="ep-grow"><b>{item.score} 分</b><p>{item.submittedAt}</p></div><Tag tone={item.passed ? "success" : "warning"}>{item.passed ? "已通过" : "未通过"}</Tag></div>
          ))}
        </Card>
        {accessibleAssessmentList.length > 1 && <Card><h2>全部岗位测评</h2>{accessibleAssessmentList.map((item) => <Link className="ep-row" key={item.id} href={`/platform/assessment/${item.id}`}><span className="ep-grow">{item.name}<small>{jobById(item.jobId)?.name}</small></span><ChevronRight /></Link>)}</Card>}
        <Card><h2>岗位评价标准</h2>{accessibleStandardList.map((item) => <Link className="ep-row" key={item.id} href={`/platform/standard/${item.id}`}><span className="ep-grow">{item.name}<small>{jobById(item.jobId)?.name}</small></span><ChevronRight /></Link>)}</Card>
      </>
    );
  }

  function claimCertificate() {
    const eligibility = certificateEligibility(state);
    if (!eligibility.eligible) return notify("尚未满足结业凭证条件");
    issueCertificate();
    notify(`结业凭证 ${generatedCertificateNumber(state)} 已生成`);
  }

  function CertificateCard({ certificate }: { certificate: { number: string; issuedAt: string } }) {
    return (
      <Card className="ep-certificate">
        <Tag>场景化产教融合平台</Tag>
        <h2>岗位实战结业凭证</h2><h1>{state.resume.name}</h1>
        <p>完成技术服务岗位实训与综合测评</p>
        <small>{certificate.number} · {certificate.issuedAt}</small>
        <Btn secondary onClick={() => window.print()}><Download size={16} />打印凭证</Btn>
      </Card>
    );
  }

  function ExamView({ id }: { id?: string }) {
    if (state.role !== "student") return <Empty>学生登录后可参加测评。</Empty>;
    if (accessibleAssessmentList.length === 0) return <Empty>测评尚未完成权属确认或院校授权。</Empty>;
    const activeAssessment = id ? accessibleAssessmentList.find((item) => item.id === id) : assessment;
    if (!activeAssessment) return <Empty>测评不存在或尚未完成权属确认与院校授权。</Empty>;
    const latest = state.examAttempts[0];
    return (
      <Card>
        <h1>{activeAssessment.name}</h1>
        {activeAssessment.questions.map((question, index) => (
          <div className="ep-question" key={question.id}>
            <h2>{index + 1}. {question.title}</h2>
            {question.options.map((option, optionIndex) => <label key={option}><input type="radio" name={question.id} checked={answers[index] === optionIndex} onChange={() => setAnswers({ ...answers, [index]: optionIndex })} />{option}</label>)}
          </div>
        ))}
        <Btn onClick={() => {
          if (Object.keys(answers).length < activeAssessment.questions.length) return notify("请完成全部题目");
          const score = Math.round(activeAssessment.questions.filter((question, index) => answers[index] === question.answer).length / Math.max(1, activeAssessment.questions.length) * 100);
          submitExam(score, activeAssessment.questions.map((_, index) => answers[index] ?? -1), activeAssessment.jobId, activeAssessment.id);
          setAnswers({});
          notify(`测评完成，成绩 ${score} 分`);
        }}>交卷评分</Btn>
        {latest && <div className="ep-result"><b>最近成绩 {latest.score} 分</b><Tag tone={latest.passed ? "success" : "warning"}>{latest.passed ? "已通过" : "未通过"}</Tag></div>}
      </Card>
    );
  }

  function ProjectDetail({ id }: { id: string }) {
    const project = state.projects.find((item) => item.id === id);
    if (!project) return <Empty>项目不存在。</Empty>;
    const job = jobById(project.jobId);
    const eligibility = projectEligibility(state, project);
    const applied = state.applications.find((item) => item.kind === "project" && item.targetId === project.id);
    return (
      <>
        <Card><Tag>产业项目 · {project.company}</Tag><h1>{project.name}</h1><p>{project.description}</p><p>截止 {project.deadline}</p></Card>
        <div className="ep-split">
          <Card><h2>交付要求</h2>{project.deliverables.map((item) => <p key={item}>· {item}</p>)}<h2>验收标准</h2>{project.acceptance.map((item) => <p key={item}>· {item}</p>)}</Card>
          <Card><h2>能力要求</h2>{job ? <><p>{job.name} · 最低匹配 {project.minMatch}%</p>{job.skills.map((skill) => <Tag key={skill}>{skill}</Tag>)}</> : <Empty>未关联岗位</Empty>}{state.role === "student" && (applied ? <Tag>{applied.status}</Tag> : <Btn disabled={!eligibility.ok} title={eligibility.reason} onClick={() => { if (!eligibility.ok) return notify(eligibility.reason); applyWithNotice({ kind: "project", targetId: project.id, name: project.name, company: project.company }); }}>申请接单</Btn>)}{!eligibility.ok && !applied && <p className="ep-status warn">{eligibility.reason}</p>}</Card>
        </div>
      </>
    );
  }

  function ProjectsView() {
    return (
      <>
        <div className="ep-toolbar"><h2>来自业务现场的真实课题</h2><label className="ep-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索项目" /></label></div>
        <div className="ep-grid">
          {state.projects.filter((item) => item.status === "已发布" && item.name.includes(query)).map((project) => {
            const job = jobById(project.jobId);
            const eligibility = projectEligibility(state, project);
            const applied = state.applications.find((item) => item.kind === "project" && item.targetId === project.id);
            return (
              <Card key={project.id}>
                <div className="ep-art"><Layers size={60} /><span>{project.company}</span></div>
                <div className="ep-cardbody">
                  <Tag>产业项目</Tag><h2>{project.name}</h2><p>{project.description}</p>
                  <div className="ep-chips">{project.deliverables.map((item) => <Tag key={item}>{item}</Tag>)}</div>
                  <p>能力匹配 <b className="ep-blue">{eligibility.match?.match ?? 0}%</b> · 截止 {project.deadline}</p>
                  <div className="ep-actions">
                    <Link className="ep-button secondary" href={`/platform/project/${project.id}`}>查看项目详情</Link>
                    {state.role === "student" && (applied ? <Tag>{applied.status}</Tag> : <Btn disabled={!eligibility.ok} title={eligibility.reason} onClick={() => {
                      if (!eligibility.ok) return notify(eligibility.reason);
                      applyWithNotice({ kind: "project", targetId: project.id, name: project.name, company: project.company });
                    }}>申请接单</Btn>)}
                    <Btn secondary onClick={() => project.jobId && go(`job/${job?.id ?? ""}`)}>查看能力要求</Btn>
                  </div>
                  {state.role === "student" && !eligibility.ok && !applied && <small className="ep-action-note">{eligibility.reason}</small>}
                </div>
              </Card>
            );
          })}
        </div>
      </>
    );
  }

  function EmploymentView() {
    return (
      <>
        <div className="ep-toolbar"><h2>让实战成果连接岗位机会</h2><label className="ep-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索岗位" /></label></div>
        <div className="ep-grid">
          {state.jobPostings.filter((item) => item.status === "已发布" && item.name.includes(query)).map((posting) => {
            const job = jobById(posting.jobId);
            const match = job ? jobMatch(state, job) : { match: 0, missing: [], ready: false };
            const eligibility = jobPostingEligibility(state, posting);
            const applied = state.applications.find((item) => item.kind === "job" && item.targetId === posting.id);
            return (
              <Card key={posting.id}>
                <div className="ep-art"><BriefcaseBusiness size={60} /><span>{posting.company}</span></div>
                <div className="ep-cardbody">
                  <Tag>校招 / 实习</Tag><h2>{posting.name}</h2><p>{posting.description}</p>
                  <p>能力匹配 <b className="ep-blue">{match.match}%</b>{match.missing.length ? ` · 缺少${match.missing.join("、")}` : ""}</p>
                  <div className="ep-actions">
                    {state.role === "student" && (applied ? <Tag>{applied.status}</Tag> : <Btn disabled={!eligibility.ok} title={eligibility.reason} onClick={() => {
                      if (!eligibility.ok) return notify(eligibility.reason);
                      applyWithNotice({ kind: "job", targetId: posting.id, name: posting.name, company: posting.company });
                    }}>投递简历</Btn>)}
                    {state.role === "student" && <Btn secondary onClick={() => go("learning/resume")}>编辑简历</Btn>}
                  </div>
                  {state.role === "student" && !eligibility.ok && !applied && <small className="ep-action-note">{eligibility.reason}</small>}
                </div>
              </Card>
            );
          })}
        </div>
      </>
    );
  }

  function StudentHome() {
    const assignedTrainings = state.classroom.assignedTrainingIds
      .map((id) => trainingById(id))
      .filter((item): item is TrainingProfile => Boolean(item));
    const totalCompleted = assignedTrainings.reduce((sum, item) => sum + completedDays(state, item.id).length, 0);
    const scores = abilityScores(state);
    const metrics = classMetrics(state);
    return (
      <>
        <Card className="ep-welcome">
          <div><Tag>MY LEARNING</Tag><h1>{state.resume.name}，向下一项岗位能力出发</h1><p>{state.classroom.name} · {state.resume.education}</p></div>
          <GraduationCap size={76} strokeWidth={1} />
        </Card>
        <div className="ep-stats">
          <Metric label="学习路径" value={state.classroom.assignedTrainingIds.length} />
          <Metric label="完成节点" value={totalCompleted} />
          <Metric label="已交成果" value={state.works.length} />
          <Metric label="实操通过" value={state.works.filter((item) => item.status === "已通过").length} />
        </div>
        <div className="ep-split">
          <Card>
            <h2>当前学习路径</h2>
            {assignedTrainings.length ? assignedTrainings.map((item) => {
              const itemCurrent = currentTrainingDay(state, item.id);
              const done = completedDays(state, item.id).length;
              return <Link className="ep-row" href={`/platform/training/${item.id}`} key={item.id}><span className="ep-icon"><Network /></span><div className="ep-grow"><b>{item.name}</b><p>{done}/{item.days} 节点 · 当前 DAY {String(itemCurrent?.day ?? 1).padStart(2, "0")} · {itemCurrent?.title}</p></div><ChevronRight /></Link>;
            }) : <Empty>等待教师分配学习路径。</Empty>}
            <h2>能力状态</h2>
            {dimensions.map((item, index) => <div className="ep-ability" key={item}><span>{item}</span><progress max={100} value={scores[index]} /><b>{scores[index]}</b></div>)}
          </Card>
          <Card>
            <h2>成果与反馈</h2>
            {state.works.length === 0 ? <Empty>从当前学习节点进入场景，提交第一份分析成果。</Empty> : state.works.map((work) => {
              const review = workReview(work);
              return (
                <div className="ep-row" key={work.id}><div className="ep-grow"><b>{sceneById(work.sceneId)?.name}</b><p>{review?.comment ?? "等待教师评价"}</p></div><Tag tone={work.status === "已通过" ? "success" : work.status === "已退回" ? "danger" : "warning"}>{work.status}</Tag>{work.status === "已退回" && <Link href={`/platform/scene/${work.sceneId}`}>重交</Link>}</div>
              );
            })}
            <h2>班级进度</h2><p>已有 {metrics.learnersWithProgress} 名学员形成通过记录，班级平均 {metrics.average} 分。</p>
          </Card>
        </div>
      </>
    );
  }

  function PortraitView() {
    const scores = abilityScores(state);
    const eligibility = certificateEligibility(state);
    const passed = state.works.filter((item) => item.status === "已通过");
    const learningNodes = state.classroom.assignedTrainingIds.reduce((sum, id) => sum + completedDays(state, id).length, 0);
    return (
      <>
        <Card>
          <div className="ep-section-title"><div><Tag>COMPETENCY PROFILE</Tag><h1>{state.resume.name}的岗位能力画像</h1></div><Btn secondary onClick={() => window.print()}><Download size={16} />导出报告</Btn></div>
          <p>已通过 {passed.length} 项实操 · 完成 {learningNodes} 个学习节点 · 理论成绩 {eligibility.latestExam?.score ?? "待测评"}</p>
          <RadarView values={scores} />
          {dimensions.map((item, index) => <div className="ep-ability" key={item}><span>{item}</span><progress max={100} value={scores[index]} /><b>{scores[index]}</b></div>)}
          <h2>岗位契合度</h2>
          {jobs.map((job) => {
            const match = jobMatch(state, job);
            return <div className="ep-row" key={job.id}><span className="ep-grow">{job.name}{match.missing.length ? <small>缺少{match.missing.join("、")}</small> : null}</span><Tag tone={match.ready ? "success" : "muted"}>{match.match}%</Tag></div>;
          })}
          {eligibility.certificate && <h2>结业凭证 {eligibility.certificate.number}</h2>}
        </Card>
        <Card>
          <h2>评价证据</h2>
          {passed.length === 0 ? <Empty>通过教师评价后，成果会自动进入画像。</Empty> : passed.map((work) => <p key={work.id}>{sceneById(work.sceneId)?.name} · {workReview(work)?.total} 分 · {workReview(work)?.comment}</p>)}
        </Card>
      </>
    );
  }

  function StudentApplications({ kind }: { kind: "project" | "job" }) {
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

  function ResumeView() {
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
          {state.works.filter((item) => item.status === "已通过").map((work) => <div key={work.id}><h3>{sceneById(work.sceneId)?.name}</h3><p>{work.analysis}</p><Tag>{workReview(work)?.total} 分 · 已通过</Tag></div>)}
        </Card>
      </div>
    );
  }

  function TeacherHome() {
    const metrics = classMetrics(state);
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
            <div className="ep-actions"><Link className="ep-button" href="/platform/teacher/classes">查看学生</Link><Link className="ep-button secondary" href="/platform/teacher/reviews">处理评价</Link></div>
            <h2>当前短训</h2>
            {state.classroom.assignedTrainingIds.map((id) => <div className="ep-row" key={id}><span className="ep-grow">{trainingById(id)?.name}</span><Tag tone="success">已分配</Tag></div>)}
          </Card>
          <Card>
            <h2>班级能力</h2><RadarView values={metrics.abilities} /><p>最弱维度 {metrics.weak.name} {metrics.weak.score} 分 · 通过覆盖 {metrics.passRate}%</p>
            <Link className="ep-link" href="/platform/teacher/report">查看院校成效 <ArrowUpRight size={15} /></Link>
          </Card>
        </div>
      </>
    );
  }

  function ClassesView() {
    const liveScores = abilityScores(state);
    const extraPaths = jobs
      .filter((job) => jobTrainingReadiness(state, job.id).ready && !trainings.some((training) => training.jobId === job.id))
      .map((job) => trainingById(`path-${job.id}`))
      .filter((item): item is TrainingProfile => Boolean(item));
    const assignableTrainings = [...trainings, ...extraPaths];
    return (
      <>
        <Card>
          <div className="ep-section-title"><div><h1>{state.classroom.name}</h1><p>{state.classroom.teacherName} · {state.classroom.studentIds.length} 人 · {state.classroom.major}</p></div><Tag>2026 学年</Tag></div>
          <label className="ep-form">教学开始日期<input type="date" value={state.classroom.schedule} readOnly /></label>
          <h2>可分配短训</h2>
          {assignableTrainings.map((training) => {
            const assigned = state.classroom.assignedTrainingIds.includes(training.id);
            const eligibility = trainingEligibility(state, training);
            return <div className="ep-row" key={training.id}><span className="ep-grow">{training.name} · {training.days} 天{!eligibility.ok && <small>{eligibility.reason}</small>}</span><Btn secondary disabled={assigned || !eligibility.ok} title={eligibility.reason} onClick={() => { if (!eligibility.ok) return notify(eligibility.reason); assignTraining(training.id); notify("短训已分配至班级"); }}>{assigned ? "已分配" : "分配给本班"}</Btn></div>;
          })}
        </Card>
        <Card>
          <h2>学生进度</h2>
          <div className="ep-tablewrap"><table>
            <thead><tr><th>学生</th><th>学习节点</th><th>通过</th><th>待评</th><th>退回</th><th>能力均分</th></tr></thead>
            <tbody>
              <tr><td><b>{state.resume.name}</b><small>当前演示学生</small></td><td>{completedDays(state).length}/{trainingById(state.classroom.assignedTrainingIds[0])?.days ?? 0}</td><td>{state.works.filter((item) => item.status === "已通过").length}</td><td>{state.works.filter((item) => item.status === "待评价").length}</td><td>{state.works.filter((item) => item.status === "已退回").length}</td><td>{Math.round(liveScores.reduce((sum, item) => sum + item, 0) / dimensions.length)}</td></tr>
              {state.classmates.map((learner) => <tr key={learner.id}><td>{learner.name}</td><td>{learner.completedDays}/15</td><td>{learner.passed}</td><td>{learner.pending}</td><td>{learner.returned}</td><td>{Math.round(learner.abilityScores.reduce((sum, item) => sum + item, 0) / dimensions.length)}</td></tr>)}
            </tbody>
          </table></div>
        </Card>
      </>
    );
  }

  function ReviewsView() {
    return (
      <Card>
        <h1>成果评价</h1>
        {state.works.length === 0 ? <Empty>学生提交成果后会在这里显示。</Empty> : state.works.map((work) => (
          <div className="ep-field" key={work.id}>
            <div className="ep-row"><h2 className="ep-grow">{work.studentName} · {sceneById(work.sceneId)?.name}</h2><Tag tone={work.status === "已通过" ? "success" : work.status === "已退回" ? "danger" : "warning"}>{work.status}</Tag></div>
            <p>{work.analysis}</p><p><b>下一步</b>{work.nextStep}</p>
            <div className="ep-chips">{work.evidenceIds.map((id) => <Tag key={id}>{sceneById(work.sceneId)?.evidence.find((item) => item.id === id)?.title}</Tag>)}</div>
            <p>边界确认：{work.boundaryAcknowledged ? "已说明采集范围" : "未确认"}</p>
            {work.status === "待评价" ? <ReviewForm onSubmit={(review) => { reviewWork(work.id, review); notify(review.decision === "passed" ? "已通过并回写画像" : "已退回并通知学生"); }} /> : <p><b>{workReview(work)?.total} 分</b>{workReview(work)?.comment}</p>}
            <History items={work.reviews.map((review) => ({ at: review.reviewedAt, actor: review.reviewer, action: review.decision === "passed" ? "通过成果" : "退回成果", note: review.comment }))} />
          </div>
        ))}
      </Card>
    );
  }

  function ReviewForm({ onSubmit }: { onSubmit: (review: Review) => void }) {
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

  function TeacherReport() {
    const metrics = classMetrics(state);
    const liveLearningNodes = state.classroom.assignedTrainingIds.reduce((sum, id) => sum + completedDays(state, id).length, 0);
    return (
      <>
        <Card>
          <div className="ep-section-title"><div><Tag>CLASS OUTCOME</Tag><h1>网络工程 2401 培养成效</h1><p>30 名学生 · 1 名实时演示学生 · 29 名样本记录</p></div><Btn secondary onClick={() => window.print()}><Download size={16} />导出报告</Btn></div>
          <div className="ep-stats"><Metric label="通过覆盖" value={`${metrics.passRate}%`} /><Metric label="平均能力" value={metrics.average} /><Metric label="待评价" value={metrics.pending} /><Metric label="退回成果" value={metrics.returned} /></div>
          <RadarView values={metrics.abilities} />
          {dimensions.map((item, index) => <div className="ep-ability" key={item}><span>{item}</span><progress max={100} value={metrics.abilities[index]} /><b>{metrics.abilities[index]}</b></div>)}
          <h2>教学判断</h2><p>班级最弱维度为 {metrics.weak.name}（{metrics.weak.score} 分）。建议优先检查证据来源、不可见边界和结论表达的对应关系。</p>
        </Card>
        <Card><h2>实时学生</h2><p>{state.resume.name} 已完成 {liveLearningNodes} 个学习节点，提交 {state.works.length} 份成果，通过 {state.works.filter((item) => item.status === "已通过").length} 份。</p><Link className="ep-link" href="/platform/teacher/reviews">进入成果评价 <ArrowUpRight size={15} /></Link></Card>
      </>
    );
  }

  function ManageHome() {
    const pendingResources = state.resources.filter((item) => item.status === "待审核").length;
    const rights = rightsSummary(state);
    const rightsAttention = rights.pending + rights.reviewing + rights.rejected + rights.expired;
    const projectApplications = state.applications.filter((item) => item.kind === "project").length;
    const jobApplications = state.applications.filter((item) => item.kind === "job").length;
    const pendingOrders = state.orders.filter((item) => item.status !== "已结算" && item.status !== "已取消").length;
    return (
      <>
        <div className="ep-stats">
          <Metric label="合作院校" value={state.schools.filter((item) => item.status === "服务中").length} />
          <Metric label="待处理资源" value={pendingResources + rightsAttention} />
          <Metric label="待处理申请" value={projectApplications + jobApplications} />
          <Metric label="订阅流程中" value={pendingOrders} />
        </div>
        <div className="ep-split">
          <Card>
            <h2>业务待办</h2>
            <Link className="ep-row" href="/platform/manage/resources"><div className="ep-grow"><b>资源审核</b><p>{pendingResources} 项等待审核</p></div><ArrowUpRight /></Link>
            <Link className="ep-row" href="/platform/manage/projects"><div className="ep-grow"><b>项目验收</b><p>{projectApplications} 条项目申请记录</p></div><ArrowUpRight /></Link>
            <Link className="ep-row" href="/platform/manage/recruitment"><div className="ep-grow"><b>人才投递</b><p>{jobApplications} 条岗位投递记录</p></div><ArrowUpRight /></Link>
            <Link className="ep-row" href="/platform/manage/orders"><div className="ep-grow"><b>订阅与授权</b><p>{state.orders.find((item) => item.status === "待确认")?.name ?? "暂无待确认订单"}</p></div><ArrowUpRight /></Link>
          </Card>
          <Card>
            <h2>最近操作</h2>
            {state.auditEvents.length === 0 ? <Empty>完成资源、教学或申请操作后会显示审计记录。</Empty> : state.auditEvents.slice(0, 8).map((event) => <div className="ep-row" key={event.id}><div className="ep-grow"><b>{event.action}</b><p>{event.actor} · {event.target}</p></div><small>{event.at.slice(5)}</small></div>)}
          </Card>
        </div>
        <Card>
          <h2>资源概况</h2>
          <div className="ep-stats">
            {(["岗位", "场景", "课程", "测评", "评价标准"] as const).map((type) => <Metric key={type} label={type} value={state.resources.filter((item) => item.type === type).length} />)}
          </div>
          <div className="ep-rights-stats">
            <div><b>{rights.confirmed}</b><span>已确权</span></div>
            <div><b>{rights.reviewing}</b><span>审核中</span></div>
            <div><b>{rights.pending}</b><span>待确权</span></div>
            <div><b>{rights.rejected + rights.expired}</b><span>驳回 / 过期</span></div>
          </div>
        </Card>
      </>
    );
  }

  function ManageResources() {
    const types: Resource["type"][] = ["岗位", "场景", "课程", "测评", "评价标准"];
    const resources = state.resources.filter((resource) => resource.type === resourceType);
    return (
      <>
        <Card>
          <div className="ep-section-title"><div><h1>资源建设与审核</h1><p>草稿 → 审核发布 → 院校授权 → 前台使用</p></div><Tag>年度更新包</Tag></div>
          <div className="ep-tabs ep-resource-tabs">{types.map((type) => <button key={type} className={resourceType === type ? "active" : ""} onClick={() => { setResourceType(type); setCreatingResource(false); }}>{type}<small>{state.resources.filter((item) => item.type === type).length}</small></button>)}</div>
          <div className="ep-toolbar ep-resource-toolbar"><div><b>{resourceType}资源</b><p>{resourceType === "岗位" ? "按真实工作任务建设能力模型并组织学习路径" : `管理${resourceType}资源、版本和院校授权`}</p></div><Btn onClick={() => setCreatingResource(true)}><Plus size={16} />新建{resourceType}</Btn></div>
          {creatingResource && <ResourceBuilder kind={resourceType} notify={notify} onClose={() => setCreatingResource(false)} />}
          <div className="ep-tablewrap"><table>
            <thead><tr><th>编码 / 名称</th><th>版本</th><th>状态</th><th>关联 / 完整性</th><th>资源确权</th><th>院校授权</th><th>操作</th></tr></thead>
            <tbody>{resources.map((resource) => {
              const content = resource.draftContent.data;
              const code = "code" in content ? content.code : undefined;
              const readiness = resource.draftContent.kind === "job" ? jobTrainingReadiness(state, resource.id) : { ready: false, reason: "" };
              const rightsStatus = effectiveRightsStatus(resource.rights);
              const rightsReason = resourceRightsBlockedReason(state, resource.id, "教学使用");
              return (
                <tr key={resource.id}>
                  <td><Link href={`/platform/resource/${resource.id}`}>{resource.name}</Link><small>{code ?? resource.id}</small>{resource.reviewNote && <small className="danger">{resource.reviewNote}</small>}</td>
                  <td>{resource.version}</td>
                  <td><Tag tone={resource.status === "已发布" ? "success" : resource.status === "已驳回" ? "danger" : "warning"}>{resource.status}</Tag></td>
                  <td>{resource.draftContent.kind === "job" ? <><Tag tone={readiness.ready ? "success" : "muted"}>{readiness.ready ? "可培养" : "待完善"}</Tag><small>{readiness.reason}</small></> : `${resource.relatedIds.length} 项关联`}</td>
                  <td><Tag tone={rightsStatus === "已确权" ? "success" : rightsStatus === "已驳回" || rightsStatus === "已过期" ? "danger" : "warning"}>{rightsStatus}</Tag><small>{rightsReason}</small></td>
                  <td>{state.authorizations.some((item) => item.resourceId === resource.id && item.schoolId === state.activeSchoolId && item.status === "有效") ? "已授权" : "未授权"}</td>
                  <td><div className="ep-actions">
                    {(rightsStatus === "待确权" || rightsStatus === "已驳回" || rightsStatus === "已过期") && <Btn secondary onClick={() => go(`resource/${resource.id}`)}>补录确权</Btn>}
                    {resource.status === "草稿" && <Btn secondary onClick={() => resourceActionWithNotice(resource.id, "submit", "")}>提交审核</Btn>}
                    {resource.status === "待审核" && rightsStatus === "审核中" && <><Btn onClick={() => resourceActionWithNotice(resource.id, "confirm-rights", "")}>通过确权</Btn><Btn secondary onClick={() => resourceActionWithNotice(resource.id, "reject-rights", "请补充权属材料")}>驳回权属</Btn></>}
                    {resource.status === "待审核" && <><Btn disabled={Boolean(rightsReason)} title={rightsReason} onClick={() => resourceActionWithNotice(resource.id, "publish", "")}>审核发布</Btn><Btn secondary onClick={() => resourceActionWithNotice(resource.id, "reject", "请补充内容与关联资源")}>驳回内容</Btn></>}
                    {resource.status === "已驳回" && <Btn secondary onClick={() => resourceActionWithNotice(resource.id, "submit", "")}>重新提交</Btn>}
                    {resource.status === "已发布" && <Btn secondary disabled={!state.authorizations.some((item) => item.resourceId === resource.id && item.schoolId === state.activeSchoolId && item.status === "有效") && Boolean(rightsReason)} title={rightsReason} onClick={() => resourceActionWithNotice(resource.id, "authorize", "")}>{state.authorizations.some((item) => item.resourceId === resource.id && item.schoolId === state.activeSchoolId && item.status === "有效") ? "撤回授权" : "发放授权"}</Btn>}
                    {resource.status === "已发布" && <Btn secondary onClick={() => resourceActionWithNotice(resource.id, "offline", "")}>下线</Btn>}
                    {(resource.status === "已下线" || resource.status === "已驳回") && <Btn secondary onClick={() => resourceActionWithNotice(resource.id, "revise", "")}>编辑新版本</Btn>}
                  </div></td>
                </tr>
              );
            })}</tbody>
          </table></div>
        </Card>
        {resourceType === "岗位" && <Card><h2>岗位选择状态</h2>{publishedJobs(state).map((job) => {
          const readiness = jobTrainingReadiness(state, job.id);
          return <div className="ep-row" key={job.id}><div className="ep-grow"><b>{job.name}</b><p>{readiness.reason || "已具备场景与课程，可被短训、项目和招聘选择"}</p></div><Tag tone={readiness.ready ? "success" : "warning"}>{readiness.ready ? "可培养" : "标准已发布"}</Tag></div>;
        })}</Card>}
      </>
    );
  }

  function StandardsView() {
    const [creating, setCreating] = useState(false);
    return (
      <>
        <Card>
          <div className="ep-section-title"><div><h1>岗位能力评价标准</h1><p>配置岗位能力点权重、等级映射与认定规则。</p></div><Btn onClick={() => setCreating(true)}><Plus size={16} />新建标准</Btn></div>
          {creating && <ResourceBuilder kind="评价标准" notify={notify} onClose={() => setCreating(false)} />}
          {publishedStandardList.length === 0 ? <Empty>暂无已发布标准。</Empty> : publishedStandardList.map((standard) => <div className="ep-row" key={standard.id}><div className="ep-grow"><b>{standard.name}</b><p>{jobById(standard.jobId)?.name} · {standard.abilityPointWeights.length} 个能力点</p></div><Link className="ep-link" href={`/platform/standard/${standard.id}`}>查看</Link><Link className="ep-link" href={`/platform/resource/${standard.id}`}>编辑</Link></div>)}
        </Card>
      </>
    );
  }

  function SchoolsView() {
    return (
      <Card>
        <h1>合作院校与协议</h1>
        {state.schools.map((school) => <div className="ep-row" key={school.id}><Building2 className="ep-blue" /><div className="ep-grow"><h2>{school.name}</h2><p>{school.college} · {school.plan} · {school.contact}</p></div><Tag tone={school.status === "服务中" ? "success" : "muted"}>{school.status}</Tag></div>)}
        <Link className="ep-link" href="/platform/manage/orders">管理订阅与授权 <ArrowUpRight size={15} /></Link>
      </Card>
    );
  }

  function ExpertsView() {
    return <div className="ep-grid">{[["周明", "网络性能诊断", "金融交易与链路分析"], ["陈宁", "全流量安全研判", "能源管理区告警分析"], ["李远", "售前解决方案", "采集方案与 PoC 验证"]].map(([name, field, desc]) => <Card key={name}><span className="ep-avatar">{name[0]}</span><h2>{name}</h2><Tag>{field}</Tag><p>{desc}</p><small>参与资源评审和项目验收</small></Card>)}</div>;
  }

  function ManageApplications({ kind }: { kind: "project" | "job" }) {
    const [feedback, setFeedback] = useState<Record<string, string>>({});
    const [name, setName] = useState("");
    const [company, setCompany] = useState("科来网络");
    const [description, setDescription] = useState("");
    const [jobId, setJobId] = useState("");
    const [deliverables, setDeliverables] = useState("分析报告\n证据清单");
    const [acceptance, setAcceptance] = useState("结论有证据支撑\n说明采集边界");
    const [minMatch, setMinMatch] = useState(60);
    const applications = state.applications.filter((item) => item.kind === kind);
    const requiredScope = kind === "project" ? "项目展示" : "招聘引用";
    const selectableJobs = jobs.filter((job) => jobTrainingReadiness(state, job.id).ready && resourceRightsReady(state, job.id, requiredScope));
    const selectedJob = selectableJobs.find((job) => job.id === jobId) ?? selectableJobs[0];
    return (
      <>
        <Card>
          <div className="ep-section-title"><div><h1>{kind === "project" ? "项目派单与验收" : "招聘与人才库"}</h1><p>{kind === "project" ? "发布客户课题并跟踪申请、交付和验收" : "发布岗位并跟踪投递、面试和录用"}</p></div><Tag>{applications.length} 条记录</Tag></div>
          <details>
            <summary>发布新的{kind === "project" ? "产业项目" : "招聘岗位"}</summary>
            <label className="ep-form">名称<input value={name} onChange={(event) => setName(event.target.value)} /></label>
            <label className="ep-form">单位<input value={company} onChange={(event) => setCompany(event.target.value)} /></label>
            <label className="ep-form">关联岗位<select value={selectedJob?.id ?? ""} onChange={(event) => setJobId(event.target.value)}><option value="">请选择可培养岗位</option>{selectableJobs.map((job) => <option value={job.id} key={job.id}>{job.name}</option>)}</select></label>
            <label className="ep-form">最低能力匹配<input type="number" min="0" max="100" value={minMatch} onChange={(event) => setMinMatch(Number(event.target.value))} /></label>
            <label className="ep-form">{kind === "project" ? "业务问题与验收标准" : "岗位职责与任职要求"}<textarea value={description} onChange={(event) => setDescription(event.target.value)} /></label>
            {kind === "project" && <><label className="ep-form">交付物（每行一项）<textarea value={deliverables} onChange={(event) => setDeliverables(event.target.value)} /></label><label className="ep-form">验收标准（每行一项）<textarea value={acceptance} onChange={(event) => setAcceptance(event.target.value)} /></label></>}
            {selectableJobs.length === 0 && <p className="ep-status warn">暂无可引用岗位。岗位需形成完整学习路径，且权属范围包含{requiredScope}。</p>}
            <Btn disabled={!name.trim() || !company.trim() || !description.trim() || !selectedJob} onClick={() => {
              if (kind === "project") {
                publishProject({
                  id: crypto.randomUUID(), name: name.trim(), company: company.trim(), description: description.trim(),
                  deliverables: deliverables.split("\n").map((item) => item.trim()).filter(Boolean),
                  acceptance: acceptance.split("\n").map((item) => item.trim()).filter(Boolean),
                  schoolIds: [state.activeSchoolId], jobId: selectedJob?.id ?? "", minMatch, deadline: "2026-12-31", status: "已发布",
                });
              } else {
                publishJob({ id: crypto.randomUUID(), name: name.trim(), company: company.trim(), description: description.trim(), jobId: selectedJob?.id ?? "", minMatch, status: "已发布" });
              }
              setName(""); setDescription(""); notify("内容已发布至前台");
            }}>确认发布</Btn>
          </details>
          <h2>已发布内容</h2>
          {(kind === "project" ? state.projects : state.jobPostings).map((item) => <div className="ep-row" key={item.id}><span className="ep-grow">{item.name} · {item.company}</span><Tag tone={item.status === "已发布" ? "success" : "muted"}>{item.status}</Tag><Btn secondary onClick={() => kind === "project" ? toggleProject(item.id) : toggleJob(item.id)}>{item.status === "已发布" ? "下线" : "发布"}</Btn></div>)}
        </Card>
        <Card>
          <h2>申请与处理</h2>
          {applications.length === 0 ? <Empty>学生提交申请后会在这里显示。</Empty> : applications.map((application) => {
            const options = kind === "project" ? projectStatusOptions(application) : jobStatusOptions(application);
            return (
              <div className="ep-field" key={application.id}>
                <div className="ep-row"><div className="ep-grow"><h2>{application.studentName} · {application.name}</h2><p>{application.company}</p></div><Tag tone={applicationTone(application.status)}>{application.status}</Tag></div>
                {application.resumeSnapshot && <details><summary>简历快照</summary><p>{application.resumeSnapshot.phone} · {application.resumeSnapshot.education}</p><p>{application.resumeSnapshot.summary}</p></details>}
                {application.deliveryText && <p><b>交付内容</b>{application.deliveryText}</p>}
                {options.length > 0 && <>
                  <input value={feedback[application.id] ?? ""} onChange={(event) => setFeedback({ ...feedback, [application.id]: event.target.value })} placeholder="处理意见 / 退回原因" />
                  <div className="ep-actions">{options.map((status) => <Btn key={status} secondary onClick={() => {
                    if ((status === "已驳回" || status === "已退回" || status === "未通过") && !(feedback[application.id] ?? "").trim()) return notify("请填写处理原因");
                    processApplication(application.id, status, feedback[application.id]);
                    notify(`申请已更新为${status}`);
                  }}>{status}</Btn>)}</div>
                </>}
                <History items={application.history} />
              </div>
            );
          })}
        </Card>
      </>
    );
  }

  function OrdersView() {
    return (
      <Card>
        <h1>资源订阅与授权</h1>
        <p>基础包已生效，年度更新包完成确认、授权后才会对院校开放。</p>
        {state.orders.map((order) => {
          const blockers = orderRightsBlockers(state, order);
          return (
            <div className="ep-field" key={order.id}>
              <div className="ep-row"><div className="ep-grow"><h2>{order.name}</h2><p>{order.packageId === "base" ? "基础岗位培养资源" : "新增场景与课程更新"} · {order.majorGroupIds.map((id) => state.majorGroups.find((group) => group.id === id)?.name).filter(Boolean).join(" / ")}</p></div><Tag tone={order.status === "已结算" ? "success" : "warning"}>{order.status}</Tag></div>
              <p>演示金额 ¥{order.amount.toLocaleString("zh-CN")} · {order.id}</p>
              {order.status === "待确认" && <Btn onClick={() => { advanceOrder(order.id, "已确认", "院校确认年度更新包"); notify("订阅已确认"); }}>确认订阅订单</Btn>}
              {order.status === "已确认" && <Btn disabled={blockers.length > 0} title={blockers.map((item) => item.reason).join("；")} onClick={() => { if (blockers.length) return notify("仍有资源未完成确权"); advanceOrder(order.id, "已授权", "资源已发放至江城理工学院"); notify("资源授权已发放"); }}>发放资源授权</Btn>}
              {order.status === "已授权" && <Btn onClick={() => { advanceOrder(order.id, "已结算", "确认收款并完成结算"); notify("订单已结算"); }}>确认收款并结算</Btn>}
              {order.status === "已结算" && <Tag tone="success">流程完成</Tag>}
              {blockers.length > 0 && <div className="ep-rights-pending">{blockers.map((item) => <div key={item.id}><span><b>{item.name}</b><small>{item.reason}</small></span><Tag tone="warning">待处理</Tag></div>)}</div>}
              <History items={order.history} />
            </div>
          );
        })}
      </Card>
    );
  }

  function SettlementView() {
    const orders = state.orders.filter((item) => item.status === "已授权" || item.status === "已结算");
    return (
      <Card>
        <h1>结算台账</h1>
        {orders.length === 0 ? <Empty>暂无已授权订单。</Empty> : <div className="ep-tablewrap"><table><thead><tr><th>订单</th><th>院校</th><th>状态</th><th>金额</th><th>更新时间</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td>{order.name}</td><td>{state.schools.find((item) => item.id === order.schoolId)?.name}</td><td>{order.status}</td><td>¥{order.amount.toLocaleString("zh-CN")}</td><td>{order.updatedAt}</td></tr>)}</tbody></table></div>}
      </Card>
    );
  }

  function ResourceView({ id }: { id?: string }) {
    const [mode, setMode] = useState<"preview" | "edit">("preview");
    const resource = id ? resourceById(state, id) : undefined;
    if (!resource) return <Empty>资源不存在。</Empty>;
    const rightsStatus = effectiveRightsStatus(resource.rights);
    const rightsReason = resourceRightsBlockedReason(state, resource.id, "教学使用");
    if (state.role === "manage") return (
      <div>
        <Card>
          <div className="ep-section-title"><div><Tag>{resource.type} · {resource.version}</Tag><h1>{resource.name}</h1><p>{resource.status} · {resource.reviewNote || "资源内容与关联关系"}</p></div><div className="ep-actions"><Btn secondary={mode === "preview"} onClick={() => setMode("preview")}>预览</Btn><Btn secondary={mode === "edit"} onClick={() => setMode("edit")}>编辑草稿</Btn></div></div>
        </Card>
        {mode === "edit" ? <ResourceBuilder resource={resource} notify={notify} onClose={() => setMode("preview")} /> : <>
          <Card><ResourcePreview state={state} resource={resource} /></Card>
          <Card className="ep-rights-detail">
            <div className="ep-section-title"><div><Tag>RIGHT CLEARANCE</Tag><h2>资源确权</h2><p>{resource.rights.ownership} · {resource.rights.ownerName}</p></div><Tag tone={rightsStatus === "已确权" ? "success" : rightsStatus === "已驳回" || rightsStatus === "已过期" ? "danger" : "warning"}>{rightsStatus}</Tag></div>
            <div className="ep-rights-detail-grid">
              <div><span>协议 / 授权编号</span><b>{resource.rights.agreementNo || "待补录"}</b></div>
              <div><span>权属材料</span><b>{resource.rights.evidenceName || "待补录"}</b></div>
              <div><span>有效期</span><b>{resource.rights.validFrom} 至 {resource.rights.validUntil}</b></div>
              <div><span>使用范围</span><b>{resource.rights.useScopes.join(" / ") || "待选择"}</b></div>
            </div>
            <p>{resource.rights.sourceNote}</p>
            <p>{resource.rights.desensitizationNote}</p>
            {rightsReason && <p className="ep-status warn">{rightsReason}</p>}
            <div className="ep-actions">
              {(rightsStatus === "待确权" || rightsStatus === "已驳回" || rightsStatus === "已过期") && <Btn secondary onClick={() => setMode("edit")}>补录权属</Btn>}
              {rightsStatus === "审核中" && <><Btn onClick={() => resourceActionWithNotice(resource.id, "confirm-rights", "")}>确认已确权</Btn><Btn secondary onClick={() => resourceActionWithNotice(resource.id, "reject-rights", "请补充权属证明材料")}>驳回权属</Btn></>}
              {rightsStatus === "已确权" && <Btn secondary onClick={() => resourceActionWithNotice(resource.id, "revoke-rights", "权属撤回后资源将停止前台使用")}>撤回权属</Btn>}
            </div>
            <History items={(resource.rights.history ?? []).map((item) => ({ at: item.at, actor: item.actor, action: item.action, note: item.note }))} />
          </Card>
          <Card><h2>审核与发布</h2><div className="ep-actions">
            {resource.status === "草稿" && <Btn onClick={() => resourceActionWithNotice(resource.id, "submit", "")}>提交审核</Btn>}
            {resource.status === "待审核" && <><Btn disabled={Boolean(rightsReason)} title={rightsReason} onClick={() => resourceActionWithNotice(resource.id, "publish", "")}>审核发布</Btn><Btn secondary onClick={() => resourceActionWithNotice(resource.id, "reject", "请补充内容与关联资源")}>驳回内容</Btn></>}
            {resource.status === "已发布" && <Btn secondary disabled={!state.authorizations.some((item) => item.resourceId === resource.id && item.schoolId === state.activeSchoolId && item.status === "有效") && Boolean(rightsReason)} title={rightsReason} onClick={() => resourceActionWithNotice(resource.id, "authorize", "")}>{state.authorizations.some((item) => item.resourceId === resource.id && item.schoolId === state.activeSchoolId && item.status === "有效") ? "撤回授权" : "发放授权"}</Btn>}
          </div><History items={resource.reviewHistory.map((item) => ({ at: item.at, actor: item.actor, action: item.action, note: item.note }))} /></Card>
        </>}
      </div>
    );
    if (!resourceVisible(state, resource.id)) {
      return <Empty>{resourceRightsBlockedReason(state, resource.id, "教学使用") || "该资源尚未对当前院校开放。"}</Empty>;
    }
    return <Card><ResourcePreview state={state} resource={resource} /><h2>关联资源</h2>{resource.relatedIds.map((relatedId) => {
      const related = resourceById(state, relatedId);
      return related && resourceVisible(state, related.id) ? <Link className="ep-row" key={related.id} href={related.type === "岗位" ? `/platform/job/${related.id}` : related.type === "场景" ? `/platform/scene/${related.id}` : related.type === "课程" ? `/platform/course/${related.id}` : related.type === "测评" ? `/platform/assessment/${related.id}` : `/platform/standard/${related.id}`}>{related.name}<ChevronRight /></Link> : null;
    })}</Card>;
  }

  function ScenePanel({ scene, work }: { scene: NonNullable<ReturnType<typeof sceneById>>; work?: Work; notify: (message: string) => void }) {
    const [evidence, setEvidence] = useState<string[]>(work?.evidenceIds ?? []);
    const [analysis, setAnalysis] = useState(work?.analysis ?? "");
    const [nextStep, setNextStep] = useState(work?.nextStep ?? "");
    const [boundary, setBoundary] = useState(work?.boundaryAcknowledged ?? false);
    const blocked = workBlockedReason(state, scene.id);
    const review = workReview(work);
    return (
      <>
        <Card><Tag>{scene.industry} · {scene.difficulty}</Tag><h1>{resourceName(state, scene.id, scene.name)}</h1><p>{scene.description}</p></Card>
        <div className="ep-split">
          <Card>
            <h2>任务概览</h2>
            {scene.tasks.map((task, index) => <div className="ep-row" key={task}><span className="ep-number">{index + 1}</span><span>{task}</span></div>)}
            <h2>专家范本</h2><details><summary>查看参考答案与边界说明</summary><p>{scene.answer}</p></details>
            <h2>评价标准</h2><p>证据准确 40% · 定位推理 40% · 交付表达 20%</p>
          </Card>
          <Card>
            <h2>模拟流量分析台</h2>
            <div className="ep-console"><div><span className="ep-dot" />ANALYSIS SESSION · {scene.id.toUpperCase()}</div>{scene.evidence.map((item) => <label key={item.id}><input type="checkbox" checked={evidence.includes(item.id)} onChange={(event) => setEvidence(event.target.checked ? [...evidence, item.id] : evidence.filter((id) => id !== item.id))} /><span><small>{item.time} · {item.title}</small>{item.detail}</span></label>)}</div>
            <h2>提交分析成果</h2>
            <textarea aria-label="分析结论" value={analysis} onChange={(event) => setAnalysis(event.target.value)} placeholder="写清问题范围、证据与判断依据" />
            <textarea aria-label="下一步建议" value={nextStep} onChange={(event) => setNextStep(event.target.value)} placeholder="写清仍需补充验证的边界与下一步建议" />
            <label className="ep-check"><input type="checkbox" checked={boundary} onChange={(event) => setBoundary(event.target.checked)} />已说明采集范围与不可见边界</label>
            {blocked ? <p className="ep-blocker"><LockKeyhole size={14} />{blocked}</p> : <Btn onClick={() => {
              const required = scene.id === "bank" ? ["wait", "retry"] : [];
              if (evidence.length < 3) return notify("至少选择三条关键证据");
              if (required.some((id) => !evidence.includes(id))) return notify("银行场景必须包含应用响应等待与重传证据");
              if (!analysis.trim() || !nextStep.trim()) return notify("请填写分析结论与下一步建议");
              if (!boundary) return notify("请确认采集范围与不可见边界");
              submitWork(buildWork({ state, sceneId: scene.id, analysis, nextStep, evidenceIds: evidence, boundaryAcknowledged: boundary }));
              notify("成果已提交，等待教师评价");
            }}>提交成果</Btn>}
            {review && <p><b>{review.decision === "passed" ? "已通过" : "已退回"} · {review.total} 分</b>{review.comment}</p>}
            <History items={work?.reviews.map((item) => ({ at: item.reviewedAt, actor: item.reviewer, action: item.decision === "passed" ? "通过成果" : "退回成果", note: item.comment })) ?? []} />
          </Card>
        </div>
      </>
    );
  }

  function toggleFavoriteWithNotice(jobId: string) {
    toggleFavorite(jobId);
    notify(state.favorites.includes(jobId) ? "已取消收藏" : "岗位已收藏");
  }

  function completeDayWithNotice(trainingId: string, day: number) {
    const current = currentTrainingDay(state, trainingId);
    if (!current || current.day !== day) return notify(`当前开放 DAY ${String(current?.day ?? 1).padStart(2, "0")}`);
    completeDay(day, trainingId);
    notify(`DAY ${String(day).padStart(2, "0")} 已完成`);
  }

  function applyWithNotice(input: { kind: "project" | "job"; targetId: string; name: string; company: string }) {
    if (state.applications.some((item) => item.kind === input.kind && item.targetId === input.targetId)) return notify("已提交，请勿重复申请");
    apply(buildApplication({ state, ...input }));
    notify(input.kind === "project" ? "项目申请已提交" : "简历已投递");
  }

  function resourceActionWithNotice(id: string, action: "submit" | "publish" | "reject" | "offline" | "revise" | "authorize" | "confirm-rights" | "reject-rights" | "revoke-rights", note: string) {
    const currentlyAuthorized = state.authorizations.some((item) => item.resourceId === id && item.schoolId === state.activeSchoolId && item.status === "有效");
    const rightsReason = action === "publish" || (action === "authorize" && !currentlyAuthorized) ? resourceRightsBlockedReason(state, id, "教学使用") : "";
    if (rightsReason) return notify(rightsReason);
    resourceAction(id, action, note);
    notify(
      action === "publish" ? "资源已发布"
        : action === "reject" ? "资源已驳回"
          : action === "authorize" ? "院校授权已更新"
            : action === "confirm-rights" ? "资源权属已确认"
              : action === "reject-rights" ? "资源权属已驳回"
                : action === "revoke-rights" ? "资源权属已撤回"
                : "资源状态已更新",
    );
  }
}

function applicationTone(status: ApplicationStatus) {
  if (["已验收", "已录用"].includes(status)) return "success";
  if (["已驳回", "已退回", "未通过"].includes(status)) return "danger";
  if (["待审核", "待验收", "待面试"].includes(status)) return "warning";
  return "muted";
}
