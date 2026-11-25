import { Link } from "@/components/router/link";
import { Image } from "@/components/router/image";
import { useNavigate } from "react-router-dom";
import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { BriefcaseBusiness, ChevronDown, LogOut } from "lucide-react";
import type { Role } from "@/lib/enterprise-workspace";
import { useWorkspace, WorkspaceProvider } from "@/components/enterprise/workspace-store";
import { canEnterAdmin } from "@/lib/platform-admin/permissions";
import { ConsoleSidebar } from "@/components/enterprise/console-sidebar";
import { ConsoleAccessProvider } from "@/components/enterprise/console-access";
import { CompanyDetail, CompanyProfile } from "@/components/enterprise/company-profile";
import {
  channels,
  fullBleedPages,
  management,
  pageTitle,
  schoolAdminNav,
  studentNav,
  teacherNav,
  workspaceAreaForPath,
} from "@/components/enterprise/workspace/routes";
import { WorkspaceRuntimeProvider } from "@/components/enterprise/workspace/runtime";
import { Card } from "@/components/enterprise/workspace/ui";
import { StudentPortrait } from "@/components/enterprise/workspace/student-portrait";
import { LoginView, TeacherGuide } from "@/components/enterprise/workspace/pages/entry";
import { IndustryView, JobView, ResourcesView, ResourceView } from "@/components/enterprise/workspace/pages/public";
import {
  ResumeView,
  SceneView,
  StudentApplications,
  StudentHome,
} from "@/components/enterprise/workspace/pages/learning";
import { CourseView, CoursesView, TextbookView } from "@/components/enterprise/workspace/pages/curriculum";
import {
  AssessmentDetail,
  AssessmentView,
  CertificateDetail,
  EvaluationMethodView,
  ExamView,
  StandardDetail,
} from "@/components/enterprise/workspace/pages/assessment";
import { EmploymentView, JobPostingDetail, ProjectDetail, ProjectsView } from "@/components/enterprise/workspace/pages/projects";
import { PolicyView } from "@/components/enterprise/workspace/pages/policy";
import {
  ClassesView,
  ClassroomView,
  ReviewsView,
  TeacherHome,
} from "@/components/enterprise/workspace/pages/teaching";
import { ManageHome } from "@/components/enterprise/workspace/pages/operations";

const AcademyConsole = lazy(() =>
  import("@/components/enterprise/academy-console").then((module) => ({ default: module.AcademyConsole })),
);
const LessonResultsPanel = lazy(() =>
  import("@/components/enterprise/academy-console/assessment-panels").then((module) => ({ default: module.LessonResultsPanel })),
);

export default function Platform({ path = [] }: { path?: string[] }) {
  return (
    <WorkspaceProvider>
      <WorkspaceShell path={path} />
    </WorkspaceProvider>
  );
}

function WorkspaceShell({ path }: { path: string[] }) {
  const navigate = useNavigate();
  const { state, hydrated, setRole, markGuideSeen } = useWorkspace();
  const [notice, setNotice] = useState("");
  const page = path.join("/") || "industry";
  const title = pageTitle(page);
  const companyPage = page === "industry" || page === "industry/company";
  const portraitPage = page === "learning/portrait" || page === "admin/affairs/portraits";
  const detailChannel =
    path[0] === "job" || path[0] === "scene"
      ? "resources"
      : path[0] === "course" || path[0] === "textbook"
        ? "courses"
        : path[0] === "standard" || path[0] === "certificate" || path[0] === "evaluation-method"
          ? "assessment"
          : path[0] === "project"
            ? "projects"
            : path[0] === "employment"
              ? "employment"
              : "";
  const consolePage = page === "admin" || page.startsWith("admin/") || page === "manage" || page.startsWith("manage/");
  const consoleBlocked = consolePage && !canEnterAdmin(state.role);
  const showConsoleSidebar = consolePage && canEnterAdmin(state.role);
  const immersivePage = fullBleedPages.has(page) || page.startsWith("job/");
  const requiredRole = consolePage ? null : workspaceAreaForPath(page);
  const showWorkspaceSidebar = Boolean(requiredRole && state.role === requiredRole) || showConsoleSidebar;
  const accountName =
    state.role === "teacher"
      ? "周启明"
      : state.role === "schoolAdmin"
        ? "院校管理员"
        : state.role === "manage"
          ? "科来运营"
          : state.resume.name;
  const workspaceHome =
    state.role === "teacher"
      ? "teacher"
      : state.role === "schoolAdmin"
        ? "admin/system/tenant"
        : state.role === "manage"
          ? "manage"
          : "learning";
  const workspaceLabel =
    state.role === "teacher"
      ? "院校教学服务"
      : state.role === "schoolAdmin"
        ? "院校管理服务台"
        : state.role === "manage"
          ? "科来企业服务台"
          : "学生学习空间";
  const notify = (message: string) => setNotice(message);
  const go = (target: string) => navigate(`/platform/${target}`);
  const switchRole = (role: Role, target: string) => {
    setRole(role);
    navigate(`/platform/${target}`);
  };

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  if (!hydrated) {
    return <div className="ep-loading">正在载入演示数据…</div>;
  }

  const content = (
    <WorkspaceRuntimeProvider value={{ notify, go, switchRole }}>
      <Suspense fallback={<div className="ep-loading">正在载入工作空间…</div>}>
        {renderPage(path, page, notify)}
      </Suspense>
    </WorkspaceRuntimeProvider>
  );

  return (
    <div className={`ep${companyPage ? " ep-company-shell ep-compact-shell" : ""}`}>
      <header className="ep-header">
        <Link className="ep-brand" href="/platform/industry">
          <span className="ep-brand-lockup">
            <Image src="/brand/colasoft-logo.png" alt="科来" width={34} height={32} priority />
            <strong>科来网络</strong>
          </span>
          <span className="ep-brand-product">
            <b>场景化产教融合平台</b>
            <small>SCENARIO-BASED INDUSTRY-EDUCATION INTEGRATION PLATFORM</small>
          </span>
        </Link>
        <div className="ep-header-right">
          <div className="ep-account">
            <button className="ep-user" type="button" aria-haspopup="menu" aria-label={`${accountName} · ${workspaceLabel}`}>
              <span className="ep-user-avatar" aria-hidden="true">{accountName.slice(0, 1)}</span>
              <span className="ep-user-copy">
                <b>{accountName}</b>
                <small>{workspaceLabel}</small>
              </span>
              <ChevronDown className="ep-user-chevron" size={14} />
            </button>
            <div className="ep-user-menu" role="menu">
              <Link href={`/platform/${workspaceHome}`} role="menuitem">
                <span className="ep-user-menu-icon"><BriefcaseBusiness size={16} /></span>
                <span>
                  <b>我的工作</b>
                  <small>{workspaceLabel}</small>
                </span>
              </Link>
              <span className="ep-user-menu-divider" />
              <Link href="/platform/login" role="menuitem">
                <span className="ep-user-menu-icon"><LogOut size={16} /></span>
                <span><b>切换身份</b></span>
              </Link>
            </div>
          </div>
        </div>
      </header>
      {page !== "login" && (
        <nav className="ep-nav">
          {channels.map(([url, label]) => (
            <Link key={url} className={(detailChannel || page) === url || page.startsWith(`${url}/`) ? "active" : ""} href={`/platform/${url}`}>
              {label}
            </Link>
          ))}
        </nav>
      )}
      {page === "login" ? content : (
        <div className={"ep-layout " + (showWorkspaceSidebar ? "with-sidebar " : "") + (consolePage ? "is-console" : "")}>
          {showWorkspaceSidebar && (
            <aside className={"ep-sidebar " + (showConsoleSidebar ? "ep-console-sidebar-aside" : "")}>
              {showConsoleSidebar ? (
                <ConsoleSidebar path={path} />
              ) : (
                <>
                  <small>{state.role === "manage" ? "科来企业服务台" : state.role === "schoolAdmin" ? "院校管理服务台" : state.role === "teacher" ? "院校教学服务" : "学生学习空间"}</small>
                  {(state.role === "manage" ? management : state.role === "schoolAdmin" ? schoolAdminNav : state.role === "teacher" ? teacherNav : studentNav).map(([url, label]) => (
                    <Link
                      className={
                        page === url ||
                        (state.role === "schoolAdmin" && page.startsWith(`${url.split("/").slice(0, 2).join("/")}/`))
                          ? "active"
                          : ""
                      }
                      key={url}
                      href={`/platform/${url}`}
                    >
                      {label}
                    </Link>
                  ))}
                </>
              )}
            </aside>
          )}
          <main className="ep-main">
            {!immersivePage && page !== "learning" && !portraitPage && (
              <div className="ep-pageheading">
                <h1>{title}</h1>
                <span>2026 学年 · 企业版</span>
              </div>
            )}
            {consoleBlocked ? (
              <Card>
                <h2>当前身份无法进入管理后台</h2>
                <p>后台仅对科来管理或院校管理身份开放。</p>
                <Link className="ep-button" href="/platform/login">选择身份</Link>
              </Card>
            ) : requiredRole && state.role !== requiredRole ? (
              <Card>
                <h2>需要{requiredRole === "student" ? "学生" : requiredRole === "teacher" ? "院校教职工" : requiredRole === "schoolAdmin" ? "院校管理" : "科来管理"}身份</h2>
                <p>请选择对应演示身份后继续。</p>
                <Link className="ep-button" href="/platform/login">选择身份</Link>
              </Card>
            ) : content}
          </main>
        </div>
      )}
      <footer className="ep-footer">
        <p className="ep-footer-statement">
          场景化产教融合平台体系支撑单位：<strong>杭州知与未来科技有限公司</strong>
        </p>
        <div className="ep-footer-main">
          <div className="ep-footer-brand">
            <Link href="/platform/industry">
              <Image src="/brand/colasoft-logo.png" alt="" width={34} height={32} />
              <strong>科来-知与</strong>
            </Link>
            <p>场景化产教融合平台，连接产业岗位、院校教学与人才评价。</p>
            <small className="ep-footer-copyright">© 2026 场景化产教融合平台</small>
          </div>
          <nav className="ep-footer-links" aria-label="平台功能">
            <strong>平台功能</strong>
            <Link href="/platform/industry">首页</Link>
            <Link href="/platform/industry/company">关于科来</Link>
            <Link href="/platform/resources">岗位与场景</Link>
            <Link href="/platform/projects">产业项目</Link>
            <Link href="/platform/employment">就业服务</Link>
          </nav>
          <nav className="ep-footer-links" aria-label="资源与政策">
            <strong>资源与政策</strong>
            <Link href="/platform/courses">课程与教材</Link>
            <Link href="/platform/assessment">测评与证书</Link>
            <Link href="/platform/admin/career/positions">资源建设</Link>
            <Link href="/platform/admin/ability/job-ability">能力标准</Link>
            <Link href="/platform/policy">国家政策</Link>
          </nav>
          <div className="ep-footer-qr">
            <Image src="/brand/zhiyu-wechat-qr.png" alt="知与公众号二维码" width={92} height={92} />
            <div>
              <strong>关注知与</strong>
              <span>扫码了解产业人才培养实践</span>
            </div>
          </div>
        </div>
      </footer>
      {state.role === "teacher" && !state.teacherGuideSeen && page === "industry" && (
        <TeacherGuide onClose={() => { markGuideSeen(); notify("教师导览已记录"); }} />
      )}
      {notice && <div role="status" className="ep-toast">{notice}</div>}
    </div>
  );
}

function renderPage(path: string[], page: string, notify: (message: string) => void): ReactNode {
  if (page === "login") return <LoginView />;
  if (page === "admin" || page.startsWith("admin/")) return <AcademyConsole path={path} notify={notify} />;
  if (page === "industry") return <CompanyProfile industrySection={<IndustryView />} />;
  if (page === "industry/company") return <CompanyDetail />;
  if (page === "resources") return <ResourcesView />;
  if (page === "courses") return <CoursesView />;
  if (page === "assessment") return <AssessmentView />;
  if (page === "policy") return <PolicyView />;
  if (page === "exam") return <ExamView />;
  if (path[0] === "assessment" && path[1]) return <AssessmentDetail id={path[1]} />;
  if (path[0] === "standard" && path[1]) return <StandardDetail id={path[1]} />;
  if (path[0] === "textbook" && path[1]) return <TextbookView id={path[1]} />;
  if (path[0] === "certificate" && path[1]) return <CertificateDetail id={path[1]} />;
  if (path[0] === "evaluation-method" && path[1]) return <EvaluationMethodView id={path[1]} />;
  if (path[0] === "exam" && path[1]) return <ExamView id={path[1]} />;
  if (page === "projects") return <ProjectsView />;
  if (path[0] === "project" && path[1]) return <ProjectDetail id={path[1]} />;
  if (path[0] === "employment" && path[1]) return <JobPostingDetail id={path[1]} />;
  if (page === "employment") return <EmploymentView />;
  if (path[0] === "job" && path.length === 2 && path[1]) return <JobView key={path[1]} id={path[1]} />;
  if (path[0] === "scene") return <SceneView id={path[1]} />;
  if (path[0] === "course") return <CourseView id={path[1]} />;
  if (path[0] === "resource") return <ResourceView id={path[1]} />;
  if (page === "learning") return <StudentHome />;
  if (page === "learning/portrait") return <StudentPortrait />;
  if (page === "learning/projects") return <StudentApplications kind="project" />;
  if (page === "learning/applications") return <StudentApplications kind="job" />;
  if (page === "learning/resume") return <ResumeView />;
  if (page === "teacher") return <TeacherHome />;
  if (page === "teacher/classes") return <ClassesView />;
  if (page === "teacher/classroom") return <ClassroomView />;
  if (page === "teacher/reviews") return <ReviewsView />;
  if (page === "teacher/lessons") {
    return (
      <ConsoleAccessProvider value={{ readOnly: false, owner: null, pageTitle: "课程节点评价" }}>
        <LessonResultsPanel />
      </ConsoleAccessProvider>
    );
  }
  if (page === "manage") return <ManageHome />;
  return <Card><h1>页面不存在</h1><Link href="/platform/industry">返回首页</Link></Card>;
}
