"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Building2, Plus } from "lucide-react";
import {
  effectiveRightsStatus,
  jobTrainingReadiness,
  orderRightsBlockers,
  publishedJobs,
  resourceRightsBlockedReason,
  resourceRightsReady,
  rightsSummary,
  type Resource,
} from "@/lib/enterprise-workspace";
import { jobStatusOptions, projectStatusOptions } from "@/components/enterprise/workspace-store";
import { ResourceBuilder } from "@/components/enterprise/resource-builders";
import { useWorkspacePage } from "@/components/enterprise/workspace/page-runtime";
import { Btn, Card, Empty, History, Metric, Tag, applicationTone } from "@/components/enterprise/workspace/ui";

export function ManageHome() {
  const { state } = useWorkspacePage();
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

export function ManageResources() {
  const {
  creatingResource,
  go,
  notify,
  resourceActionWithNotice,
  resourceType,
  setCreatingResource,
  setResourceType,
  state,
  } = useWorkspacePage();
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

export function StandardsView() {
  const { jobById, notify, publishedStandardList } = useWorkspacePage();
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

export function SchoolsView() {
  const { state } = useWorkspacePage();
  return (
    <Card>
      <h1>合作院校与协议</h1>
      {state.schools.map((school) => <div className="ep-row" key={school.id}><Building2 className="ep-blue" /><div className="ep-grow"><h2>{school.name}</h2><p>{school.college} · {school.plan} · {school.contact}</p></div><Tag tone={school.status === "服务中" ? "success" : "muted"}>{school.status}</Tag></div>)}
      <Link className="ep-link" href="/platform/manage/orders">管理订阅与授权 <ArrowUpRight size={15} /></Link>
    </Card>
  );
}

export function ExpertsView() {
  return <div className="ep-grid">{[
    ["周明", "网络性能诊断", "金融交易与链路分析"],
    ["陈宁", "全流量安全研判", "能源管理区告警分析"],
    ["李远", "售前解决方案", "采集方案与 PoC 验证"],
    ["许安", "应急响应", "勒索事件取证与处置复盘"],
    ["唐清", "云网可观测性", "迁移链路与性能基线"],
    ["顾行", "项目交付", "采集实施与客户验收"],
    ["沈禾", "应用性能保障", "容量趋势与跨层排障"],
    ["陆川", "行业解决方案", "医疗与政务数字化方案"],
  ].map(([name, field, desc]) => <Card key={name}><span className="ep-avatar">{name[0]}</span><h2>{name}</h2><Tag>{field}</Tag><p>{desc}</p><small>参与资源评审和项目验收</small></Card>)}</div>;
}

export function ManageApplications({ kind }: { kind: "project" | "job" }) {
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
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [company, setCompany] = useState("科来网络");
  const [description, setDescription] = useState("");
  const [jobId, setJobId] = useState("");
  const [deliverables, setDeliverables] = useState("分析报告\n证据清单");
  const [acceptance, setAcceptance] = useState("结论有证据支撑\n说明采集边界");
  const [projectCategory, setProjectCategory] = useState("运行分析");
  const [teamSize, setTeamSize] = useState(4);
  const [duration, setDuration] = useState("4 周");
  const [reward, setReward] = useState("3,000 元/组");
  const [deliveryMode, setDeliveryMode] = useState<"远程" | "驻场" | "混合">("远程");
  const [projectOutcome, setProjectOutcome] = useState("形成可复核的分析报告、证据清单和交付建议");
  const [minMatch, setMinMatch] = useState(kind === "job" ? 80 : 60);
  const [industry, setIndustry] = useState("网络与信息安全");
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
              <label className="ep-form">工单分类<select value={projectCategory} onChange={(event) => setProjectCategory(event.target.value)}><option>运行分析</option><option>安全研判</option><option>云网可观测</option><option>安全应急</option><option>采集验收</option><option>项目验证</option></select></label>
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

export function OrdersView() {
  const { advanceOrder, notify, state } = useWorkspacePage();
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

export function SettlementView() {
  const { state } = useWorkspacePage();
  const orders = state.orders.filter((item) => item.status === "已授权" || item.status === "已结算");
  return (
    <Card>
      <h1>结算台账</h1>
      {orders.length === 0 ? <Empty>暂无已授权订单。</Empty> : <div className="ep-tablewrap"><table><thead><tr><th>订单</th><th>院校</th><th>状态</th><th>金额</th><th>更新时间</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td>{order.name}</td><td>{state.schools.find((item) => item.id === order.schoolId)?.name}</td><td>{order.status}</td><td>¥{order.amount.toLocaleString("zh-CN")}</td><td>{order.updatedAt}</td></tr>)}</tbody></table></div>}
    </Card>
  );
}
