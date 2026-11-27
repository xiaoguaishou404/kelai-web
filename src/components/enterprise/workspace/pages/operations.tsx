import { Link } from "@/components/router/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import {
  jobLearningReadiness,
  resourceRightsReady,
  rightsSummary,
} from "@/lib/enterprise-workspace";
import { jobStatusOptions, projectStatusOptions } from "@/components/enterprise/workspace-store";
import { useWorkspacePage } from "@/components/enterprise/workspace/page-runtime";
import { useConsoleAccess } from "@/components/enterprise/console-access";
import { Btn, Card, Empty, History, Metric, Tag, applicationTone } from "@/components/enterprise/workspace/ui";

export function ManageHome() {
  const { state } = useWorkspacePage();
  const pendingResources = state.resources.filter((item) => item.status === "待审核").length;
  const rights = rightsSummary(state);
  const rightsAttention = rights.pending + rights.reviewing + rights.rejected + rights.expired;
  const projectApplications = state.applications.filter((item) => item.kind === "project").length;
  const jobApplications = state.applications.filter((item) => item.kind === "job").length;
  return (
    <>
      <div className="ep-stats is-three">
        <Metric label="合作院校" value={state.schools.filter((item) => item.status === "服务中").length} />
        <Metric label="待处理资源" value={pendingResources + rightsAttention} />
        <Metric label="待处理申请" value={projectApplications + jobApplications} />
      </div>
      <div className="ep-split">
        <Card>
          <h2>业务待办</h2>
          <Link className="ep-row" href="/platform/admin/career/positions"><div className="ep-grow"><b>资源审核</b><p>{pendingResources} 项等待审核</p></div><ArrowUpRight /></Link>
          <Link className="ep-row" href="/platform/admin/alliance/projects"><div className="ep-grow"><b>项目验收</b><p>{projectApplications} 条项目申请记录</p></div><ArrowUpRight /></Link>
          <Link className="ep-row" href="/platform/admin/alliance/employment-job"><div className="ep-grow"><b>人才投递</b><p>{jobApplications} 条岗位投递记录</p></div><ArrowUpRight /></Link>
        </Card>
        <Card>
          <h2>最近操作</h2>
          {state.auditEvents.length === 0 ? <Empty>完成资源、教学或申请操作后会显示审计记录。</Empty> : state.auditEvents.slice(0, 8).map((event) => <div className="ep-row" key={event.id}><div className="ep-grow"><b>{event.action}</b><p>{event.actor} · {event.target}</p></div><small>{event.at.slice(5)}</small></div>)}
        </Card>
      </div>
      <Card>
        <h2>资源概况</h2>
        <div className="ep-stats">
          {(["岗位", "场景", "课程", "教材", "测评", "评价标准"] as const).map((type) => <Metric key={type} label={type} value={state.resources.filter((item) => item.type === type).length} />)}
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

export function ManageApplications({ kind, hideTitle = false }: { kind: "project" | "job"; hideTitle?: boolean }) {
  const {
  jobs,
  notify,
  processApplication,
  publishJob,
  publishProject,
  state,
  toggleJob,
  toggleProject,
  } = useWorkspacePage();
  const { readOnly } = useConsoleAccess();
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [company, setCompany] = useState("中建科工");
  const [description, setDescription] = useState("");
  const [jobId, setJobId] = useState("");
  const [deliverables, setDeliverables] = useState("分析报告\n证据清单");
  const [acceptance, setAcceptance] = useState("结论有证据支撑\n说明检测边界");
  const [projectCategory, setProjectCategory] = useState("运行分析");
  const [teamSize, setTeamSize] = useState(4);
  const [duration, setDuration] = useState("4 周");
  const [reward, setReward] = useState("3,000 元/组");
  const [deliveryMode, setDeliveryMode] = useState<"远程" | "驻场" | "混合">("远程");
  const [projectOutcome, setProjectOutcome] = useState("形成可复核的分析报告、证据清单和交付建议");
  const [minMatch, setMinMatch] = useState(kind === "job" ? 80 : 60);
  const [industry, setIndustry] = useState("建筑工程");
  const [city, setCity] = useState("杭州");
  const [employmentType, setEmploymentType] = useState<"全职" | "实习" | "远程">("全职");
  const [experience, setExperience] = useState("1-3年");
  const [education, setEducation] = useState("大专");
  const [salaryMin, setSalaryMin] = useState(8);
  const [salaryMax, setSalaryMax] = useState(12);
  const [companySize, setCompanySize] = useState("100-500人");
  const [companyType, setCompanyType] = useState("民营");
  const [matchHighlight, setMatchHighlight] = useState("岗位核心能力与学习成果相关");
  const [responsibilities, setResponsibilities] = useState("完成岗位核心工作任务\n记录过程与交付结果");
  const [requirements, setRequirements] = useState("具备相关岗位基础能力\n能够说明工作依据与边界");
  const applications = state.applications.filter((item) => item.kind === kind);
  const requiredScope = kind === "project" ? "项目展示" : "招聘引用";
  const selectableJobs = jobs.filter((job) => jobLearningReadiness(state, job.id).ready && resourceRightsReady(state, job.id, requiredScope));
  const selectedJob = selectableJobs.find((job) => job.id === jobId) ?? selectableJobs[0];
  return (
    <>
      <Card>
        <div className="ep-section-title">{!hideTitle && <div><h1>{kind === "project" ? "项目派单与验收" : "招聘与人才库"}</h1><p>{kind === "project" ? "发布客户课题并跟踪申请、交付和验收" : "发布岗位并跟踪投递、面试和录用"}</p></div>}<Tag>{applications.length} 条记录</Tag></div>
        {!readOnly && <details>
          <summary>发布新的{kind === "project" ? "产业项目" : "招聘岗位"}</summary>
          <label className="ep-form">名称<input value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label className="ep-form">单位<input value={company} onChange={(event) => setCompany(event.target.value)} /></label>
          <label className="ep-form">关联岗位<select value={selectedJob?.id ?? ""} onChange={(event) => setJobId(event.target.value)}><option value="">请选择可培养岗位</option>{selectableJobs.map((job) => <option value={job.id} key={job.id}>{job.name}</option>)}</select></label>
          <label className="ep-form">最低能力匹配<input type="number" min={kind === "job" ? 80 : 0} max="100" value={minMatch} onChange={(event) => setMinMatch(Number(event.target.value))} /></label>
          <label className="ep-form">{kind === "project" ? "业务问题与验收标准" : "岗位职责与任职要求"}<textarea value={description} onChange={(event) => setDescription(event.target.value)} /></label>
          {kind === "job" && (
            <div className="ep-form-grid">
              <label className="ep-form">行业<input value={industry} onChange={(event) => setIndustry(event.target.value)} /></label>
              <label className="ep-form">城市<input value={city} onChange={(event) => setCity(event.target.value)} /></label>
              <label className="ep-form">招聘类型<select value={employmentType} onChange={(event) => setEmploymentType(event.target.value as "全职" | "实习" | "远程")}><option>全职</option><option>实习</option><option>远程</option></select></label>
              <label className="ep-form">经验要求<input value={experience} onChange={(event) => setExperience(event.target.value)} /></label>
              <label className="ep-form">学历要求<input value={education} onChange={(event) => setEducation(event.target.value)} /></label>
              <label className="ep-form">企业规模<input value={companySize} onChange={(event) => setCompanySize(event.target.value)} /></label>
              <label className="ep-form">企业性质<input value={companyType} onChange={(event) => setCompanyType(event.target.value)} /></label>
              <label className="ep-form">最低月薪（K）<input type="number" min="1" value={salaryMin} onChange={(event) => setSalaryMin(Number(event.target.value))} /></label>
              <label className="ep-form">最高月薪（K）<input type="number" min={salaryMin} value={salaryMax} onChange={(event) => setSalaryMax(Number(event.target.value))} /></label>
              <label className="ep-form">匹配亮点<input value={matchHighlight} onChange={(event) => setMatchHighlight(event.target.value)} /></label>
              <label className="ep-form">岗位职责（每行一项）<textarea value={responsibilities} onChange={(event) => setResponsibilities(event.target.value)} /></label>
              <label className="ep-form">任职要求（每行一项）<textarea value={requirements} onChange={(event) => setRequirements(event.target.value)} /></label>
            </div>
          )}
          {kind === "project" && <>
            <div className="ep-form-grid">
              <label className="ep-form">工单分类<select value={projectCategory} onChange={(event) => setProjectCategory(event.target.value)}><option>超高层施工</option><option>城市更新</option><option>智能建造</option><option>检测加固</option><option>模块化建筑</option><option>项目验证</option></select></label>
              <label className="ep-form">团队规模<input type="number" min="1" max="30" value={teamSize} onChange={(event) => setTeamSize(Number(event.target.value))} /></label>
              <label className="ep-form">项目周期<input value={duration} onChange={(event) => setDuration(event.target.value)} /></label>
              <label className="ep-form">项目激励<input value={reward} onChange={(event) => setReward(event.target.value)} /></label>
              <label className="ep-form">交付方式<select value={deliveryMode} onChange={(event) => setDeliveryMode(event.target.value as "远程" | "驻场" | "混合")}><option>远程</option><option>驻场</option><option>混合</option></select></label>
              <label className="ep-form">预期成果<input value={projectOutcome} onChange={(event) => setProjectOutcome(event.target.value)} /></label>
            </div>
            <label className="ep-form">交付物（每行一项）<textarea value={deliverables} onChange={(event) => setDeliverables(event.target.value)} /></label>
            <label className="ep-form">验收标准（每行一项）<textarea value={acceptance} onChange={(event) => setAcceptance(event.target.value)} /></label>
          </>}
          {selectableJobs.length === 0 && <p className="ep-status warn">暂无可引用岗位。岗位需形成完整学习路径，且权属范围包含{requiredScope}。</p>}
          <Btn disabled={!name.trim() || !company.trim() || !description.trim() || !selectedJob} onClick={() => {
            if (kind === "project") {
              publishProject({
                id: crypto.randomUUID(), name: name.trim(), company: company.trim(), description: description.trim(),
                deliverables: deliverables.split("\n").map((item) => item.trim()).filter(Boolean),
                acceptance: acceptance.split("\n").map((item) => item.trim()).filter(Boolean),
                schoolIds: [state.activeSchoolId], jobId: selectedJob?.id ?? "", minMatch, deadline: "2026-12-31", status: "已发布",
                code: `WO-${String(state.projects.length + 1).padStart(4, "0")}`,
                category: projectCategory,
                workStatus: "待接单",
                teamSize,
                duration,
                reward,
                deliveryMode,
                outcome: projectOutcome.trim(),
              });
            } else {
              publishJob({
                id: crypto.randomUUID(),
                name: name.trim(),
                company: company.trim(),
                description: description.trim(),
                jobId: selectedJob?.id ?? "",
                minMatch,
                industry,
                city,
                employmentType,
                experience,
                education,
                salaryMin,
                salaryMax,
                companySize,
                companyType,
                publishedDaysAgo: 0,
                matchHighlight,
                responsibilities: responsibilities.split("\n").map((item) => item.trim()).filter(Boolean),
                requirements: requirements.split("\n").map((item) => item.trim()).filter(Boolean),
                status: "已发布",
              });
            }
            setName(""); setDescription(""); notify("内容已发布至前台");
          }}>确认发布</Btn>
        </details>}
        <h2>已发布内容</h2>
        {(kind === "project" ? state.projects : state.jobPostings).map((item) => <div className="ep-row" key={item.id}><span className="ep-grow">{item.name} · {item.company}</span><Tag tone={item.status === "已发布" ? "success" : "muted"}>{item.status}</Tag>{!readOnly && <Btn secondary onClick={() => kind === "project" ? toggleProject(item.id) : toggleJob(item.id)}>{item.status === "已发布" ? "下线" : "发布"}</Btn>}</div>)}
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
              {!readOnly && options.length > 0 && <>
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
