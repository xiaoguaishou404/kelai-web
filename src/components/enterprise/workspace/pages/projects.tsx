"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import {
  Activity,
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronRight,
  GraduationCap,
  MapPin,
  Search,
  Star,
} from "lucide-react";
import {
  dimensions,
  jobMatch,
  jobPostingEligibility,
  projectEligibility,
  recommendedScenesForJob,
  taskDetailById,
  type JobPosting,
  type ProjectPosting,
} from "@/lib/enterprise-workspace";
import { ChannelHero } from "@/components/enterprise/channel-hero";
import { useWorkspacePage } from "@/components/enterprise/workspace/page-runtime";
import { Btn, Card, Empty, Tag } from "@/components/enterprise/workspace/ui";

export function ProjectDetail({ id }: { id: string }) {
  const { applyWithNotice, jobById, notify, state, toggleFavoriteWithNotice } = useWorkspacePage();
  const project = state.projects.find((item) => item.id === id);
  if (!project) return <Empty>项目不存在。</Empty>;
  const job = jobById(project.jobId);
  const eligibility = projectEligibility(state, project);
  const applied = state.applications.find((item) => item.kind === "project" && item.targetId === project.id);
  const workStatus = project.workStatus ?? "待接单";
  const category = project.category ?? job?.category ?? "产业项目";
  const orderCode = project.code ?? `WO-${project.id.slice(-4).toUpperCase()}`;
  const teamSize = project.teamSize ?? Math.max(3, project.deliverables.length);
  const duration = project.duration ?? "按里程碑推进";
  const reward = project.reward ?? "按验收结算";
  const deliveryMode = project.deliveryMode ?? "远程";
  const outcome = project.outcome ?? project.deliverables.join("、");
  const progressIndex =
    applied?.status === "已验收" || workStatus === "已完成"
      ? 3
      : applied?.status === "待验收"
        ? 3
        : applied && ["已接单", "已退回"].includes(applied.status)
          ? 2
          : applied
            ? 1
            : workStatus === "进行中"
              ? 2
              : 0;
  const flow = ["工单发布", "接单确认", "项目执行", "交付验收"];
  return (
    <>
      <Card className="ep-project-detail">
        <div className="ep-project-detail-top">
          <div className="ep-project-detail-code">
            <Tag>项目工单</Tag>
            <span>{orderCode}</span>
          </div>
          <Tag tone={workStatus === "待接单" ? "success" : "muted"}>{workStatus}</Tag>
        </div>
        <h1>{project.name}</h1>
        <p className="ep-project-detail-company">{project.company} · {category} · 截止 {project.deadline}</p>
        <p>{project.description}</p>
        <div className="ep-project-detail-meta">
          <span><small>团队规模</small><b>{teamSize} 人</b></span>
          <span><small>项目周期</small><b>{duration}</b></span>
          <span><small>项目激励</small><b>{reward}</b></span>
          <span><small>交付方式</small><b>{deliveryMode}</b></span>
        </div>
      </Card>
      <Card className="ep-project-process-card">
        <div className="ep-section-title"><div><Tag>DELIVERY FLOW</Tag><h2>工单流转</h2></div></div>
        <ol className="ep-project-flow">
          {flow.map((item, index) => (
            <li key={item} className={index < progressIndex ? "is-done" : index === progressIndex ? "is-active" : ""}>
              <i>{String(index + 1).padStart(2, "0")}</i>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </Card>
      <div className="ep-split">
        <Card>
          <h2>预期成果</h2>
          <p>{outcome}</p>
          <h2>交付物</h2>
          {project.deliverables.map((item) => <p key={item}>· {item}</p>)}
          <h2>验收标准</h2>
          {project.acceptance.map((item) => <p key={item}>· {item}</p>)}
        </Card>
        <Card>
          <h2>接单要求</h2>
          {job ? <><p>{job.name} · 最低能力匹配 {project.minMatch}%</p><div className="ep-chips">{job.skills.map((skill) => <Tag key={skill}>{skill}</Tag>)}</div></> : <Empty>未关联岗位</Empty>}
          <div className="ep-project-detail-actions">
            {state.role === "student" && workStatus === "待接单" && (applied ? <Tag tone="muted">{applied.status}</Tag> : <Btn disabled={!eligibility.ok} title={eligibility.reason} onClick={() => {
              if (!eligibility.ok) return notify(eligibility.reason);
              applyWithNotice({ kind: "project", targetId: project.id, name: project.name, company: project.company });
            }}>立即接单</Btn>)}
            {state.role === "student" && <Btn secondary onClick={() => toggleFavoriteWithNotice(project.id, "工单")}><Star size={14} fill={state.favorites.includes(project.id) ? "currentColor" : "none"} />{state.favorites.includes(project.id) ? "已收藏" : "收藏工单"}</Btn>}
          </div>
          {state.role === "student" && workStatus !== "待接单" && <p className="ep-status">{workStatus === "进行中" ? "工单已进入执行阶段，可前往“我的项目”查看进度。" : "该工单已完成企业验收，可在项目成果中查看交付记录。"}</p>}
          {state.role === "student" && workStatus === "待接单" && !eligibility.ok && !applied && <p className="ep-status warn">{eligibility.reason}</p>}
        </Card>
      </div>
    </>
  );
}

export function ProjectsView() {
  const {
  applyWithNotice,
  go,
  jobById,
  notify,
  query,
  scrollToSection,
  setQuery,
  state,
  toggleFavoriteWithNotice,
  } = useWorkspacePage();
  const publishedProjects = state.projects.filter((project) => project.status === "已发布");
  const [projectCategory, setProjectCategory] = useState("全部工单");
  const [projectStatus, setProjectStatus] = useState("全部状态");
  const [projectCompany, setProjectCompany] = useState("全部企业");
  const [projectJob, setProjectJob] = useState("全部岗位");
  const projectCategoryOf = (project: ProjectPosting) => project.category ?? jobById(project.jobId)?.category ?? "其他工单";
  const projectStatusOf = (project: ProjectPosting) => project.workStatus ?? "待接单";
  const categories = Array.from(new Set(publishedProjects.map(projectCategoryOf)));
  const companies = Array.from(new Set(publishedProjects.map((project) => project.company)));
  const projectJobs = Array.from(new Set(publishedProjects.map((project) => jobById(project.jobId)?.name).filter(Boolean))) as string[];
  const filteredProjects = publishedProjects.filter((project) => {
    const keyword = query.trim().toLowerCase();
    const jobName = jobById(project.jobId)?.name ?? "";
    return (
      (projectCategory === "全部工单" || projectCategoryOf(project) === projectCategory) &&
      (projectStatus === "全部状态" || projectStatusOf(project) === projectStatus) &&
      (projectCompany === "全部企业" || project.company === projectCompany) &&
      (projectJob === "全部岗位" || jobName === projectJob) &&
      (!keyword || `${project.name} ${project.company} ${project.description}`.toLowerCase().includes(keyword))
    );
  });
  const resetProjectFilters = () => {
    setProjectCategory("全部工单");
    setProjectStatus("全部状态");
    setProjectCompany("全部企业");
    setProjectJob("全部岗位");
    setQuery("");
  };
  return (
    <>
      <ChannelHero
        variant="projects"
        kicker="INDUSTRY PROJECT WORKORDER"
        title="产业项目实战"
        description="查看项目需求、周期与激励，在线接单，按里程碑提交成果并完成企业验收。"
        metrics={[
          { label: "待接单", value: String(publishedProjects.filter((project) => projectStatusOf(project) === "待接单").length).padStart(2, "0") },
          { label: "进行中", value: String(publishedProjects.filter((project) => projectStatusOf(project) === "进行中").length).padStart(2, "0") },
          { label: "已完成", value: String(publishedProjects.filter((project) => projectStatusOf(project) === "已完成").length).padStart(2, "0") },
          { label: "合作企业", value: new Set(publishedProjects.map((project) => project.company)).size },
        ]}
        actions={[
          { label: "浏览待接单", onClick: () => scrollToSection("project-browser") },
          { label: "查看岗位能力", href: "/platform/resources", secondary: true },
        ]}
      />
      <section className="ep-project-browser" id="project-browser">
        <div className="ep-project-browser-head">
          <div><h2>产业项目工单</h2><p>企业发布真实项目需求，学生在线查看、收藏与接单</p></div>
          <label className="ep-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索工单、企业" /></label>
        </div>
        <div className="ep-project-tabs" aria-label="工单分类">
          <button className={projectCategory === "全部工单" ? "active" : ""} onClick={() => setProjectCategory("全部工单")}>全部工单 <span>{publishedProjects.length}</span></button>
          {categories.map((category) => (
            <button key={category} className={projectCategory === category ? "active" : ""} onClick={() => setProjectCategory(category)}>{category} <span>{publishedProjects.filter((project) => projectCategoryOf(project) === category).length}</span></button>
          ))}
        </div>
        <div className="ep-project-filters">
          <label><span>合作企业</span><select value={projectCompany} onChange={(event) => setProjectCompany(event.target.value)}><option>全部企业</option>{companies.map((company) => <option key={company}>{company}</option>)}</select></label>
          <label><span>关联岗位</span><select value={projectJob} onChange={(event) => setProjectJob(event.target.value)}><option>全部岗位</option>{projectJobs.map((job) => <option key={job}>{job}</option>)}</select></label>
          <label><span>项目状态</span><select value={projectStatus} onChange={(event) => setProjectStatus(event.target.value)}><option>全部状态</option><option>待接单</option><option>进行中</option><option>已完成</option></select></label>
          <button type="button" onClick={resetProjectFilters}>重置筛选</button>
        </div>
        <div className="ep-project-order-grid">
        {filteredProjects.map((project) => {
          const job = jobById(project.jobId);
          const eligibility = projectEligibility(state, project);
          const applied = state.applications.find((item) => item.kind === "project" && item.targetId === project.id);
          const workStatus = projectStatusOf(project);
          const orderCode = project.code ?? `WO-${project.id.slice(-4).toUpperCase()}`;
          const teamSize = project.teamSize ?? Math.max(3, project.deliverables.length);
          const duration = project.duration ?? "按里程碑";
          const reward = project.reward ?? "按验收结算";
          const deliveryMode = project.deliveryMode ?? "远程";
          const outcome = project.outcome ?? project.deliverables.join("、");
          return (
            <Card key={project.id} className="ep-project-order-card">
              <div className="ep-project-order-top">
                <span>{orderCode}</span>
                <Tag tone={workStatus === "待接单" || workStatus === "已完成" ? "success" : "muted"}>{workStatus}</Tag>
              </div>
              <div className="ep-project-order-company">
                <i>{project.company.slice(0, 1)}</i>
                <div><b>{project.company}</b><span>{projectCategoryOf(project)} · {deliveryMode}</span></div>
              </div>
              <h2>{project.name}</h2>
              <p>{project.description}</p>
              <div className="ep-project-order-tags">
                <Tag>{job?.name ?? "综合岗位"}</Tag>
                {job?.skills.slice(0, 2).map((skill) => <Tag key={skill}>{skill}</Tag>)}
              </div>
              <div className="ep-project-order-meta">
                <span><small>团队</small><b>{teamSize} 人</b></span>
                <span><small>周期</small><b>{duration}</b></span>
                <span><small>项目激励</small><b>{reward}</b></span>
              </div>
              <div className="ep-project-order-outcome"><small>预期成果</small><p>{outcome}</p></div>
              <div className="ep-project-order-foot">
                <span><b>{eligibility.match?.match ?? 0}%</b> 能力匹配</span>
                <time>{workStatus === "待接单" ? `截止 ${project.deadline}` : workStatus}</time>
              </div>
              <div className="ep-project-order-actions">
                <Link className="ep-button secondary" href={`/platform/project/${project.id}`}>查看详情</Link>
                {state.role === "student" && workStatus === "待接单" && (applied ? <Tag tone="muted">{applied.status}</Tag> : <Btn disabled={!eligibility.ok} title={eligibility.reason} onClick={() => {
                  if (!eligibility.ok) return notify(eligibility.reason);
                  applyWithNotice({ kind: "project", targetId: project.id, name: project.name, company: project.company });
                }}>立即接单</Btn>)}
                {state.role === "student" && <Btn secondary title={state.favorites.includes(project.id) ? "取消收藏" : "收藏工单"} onClick={() => toggleFavoriteWithNotice(project.id, "工单")}><Star size={14} fill={state.favorites.includes(project.id) ? "currentColor" : "none"} /></Btn>}
                {state.role !== "student" && <Btn secondary onClick={() => project.jobId && go(`job/${job?.id ?? ""}`)}>岗位能力</Btn>}
              </div>
              {state.role === "student" && workStatus === "待接单" && !eligibility.ok && !applied && <small className="ep-project-order-note">{eligibility.reason}</small>}
            </Card>
          );
        })}
        {filteredProjects.length === 0 && <Card className="ep-project-empty"><Empty>当前筛选下没有项目工单。</Empty></Card>}
        </div>
      </section>
    </>
  );
}

export function EmploymentView() {
  const { applyWithNotice, jobById, query, setQuery, state, toggleFavoriteWithNotice } = useWorkspacePage();
  const [jobIndustry, setJobIndustry] = useState("全部行业");
  const [jobType, setJobType] = useState("全部类型");
  const [salaryFloor, setSalaryFloor] = useState("不限");
  const [jobCity, setJobCity] = useState("全部城市");
  const [jobSort, setJobSort] = useState("匹配度最高");
  const [page, setPage] = useState(1);
  const [resumePosting, setResumePosting] = useState<JobPosting | null>(null);
  const publishedPostings = state.jobPostings.filter((posting) => posting.status === "已发布");
  const industries = Array.from(new Set(publishedPostings.map((item) => item.industry).filter(Boolean))) as string[];
  const cities = Array.from(new Set(publishedPostings.map((item) => item.city).filter(Boolean))) as string[];
  const postings = publishedPostings
    .map((posting) => {
      const job = jobById(posting.jobId);
      const match = job ? jobMatch(state, job) : { match: 0, missing: [], ready: false };
      const eligibility = jobPostingEligibility(state, posting);
      return { posting, job, match, eligibility };
    })
    .filter(({ posting }) => {
      if (jobIndustry !== "全部行业" && posting.industry !== jobIndustry) return false;
      if (jobType !== "全部类型" && posting.employmentType !== jobType) return false;
      if (jobCity !== "全部城市" && posting.city !== jobCity) return false;
      if (salaryFloor !== "不限" && (posting.salaryMax ?? 0) < Number(salaryFloor)) return false;
      return `${posting.name}${posting.company}${posting.description}`.toLowerCase().includes(query.trim().toLowerCase());
    })
    .sort((a, b) => {
      if (jobSort === "最新发布") return (a.posting.publishedDaysAgo ?? 99) - (b.posting.publishedDaysAgo ?? 99);
      if (jobSort === "薪资最高") return (b.posting.salaryMax ?? 0) - (a.posting.salaryMax ?? 0);
      return b.match.match - a.match.match;
    });
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(postings.length / pageSize));
  const activePage = Math.min(page, totalPages);
  const visiblePostings = postings.slice((activePage - 1) * pageSize, activePage * pageSize);
  const averageSalaryMin = Math.round(
    publishedPostings.reduce((sum, item) => sum + (item.salaryMin ?? 0), 0) /
      Math.max(1, publishedPostings.length),
  );
  const averageSalaryMax = Math.round(
    publishedPostings.reduce((sum, item) => sum + (item.salaryMax ?? 0), 0) /
      Math.max(1, publishedPostings.length),
  );
  const resetJobs = () => {
    setJobIndustry("全部行业");
    setJobType("全部类型");
    setSalaryFloor("不限");
    setJobCity("全部城市");
    setJobSort("匹配度最高");
    setQuery("");
    setPage(1);
  };
  const resumePostingEligibility = resumePosting
    ? jobPostingEligibility(state, resumePosting)
    : { ok: false, reason: "请选择招聘岗位" };
  return (
    <>
      <ChannelHero
        variant="employment"
        kicker="CAREER SERVICE"
        title="就业服务中心"
        description="把能力画像、岗位匹配与投递服务连成一条路径，帮助学生看清差距、找到方向。"
        metrics={[
          { label: "在招岗位", value: String(publishedPostings.length).padStart(2, "0") },
          { label: "招聘企业", value: new Set(publishedPostings.map((posting) => posting.company)).size },
          { label: "高匹配岗位", value: postings.filter((item) => item.match.match >= 80).length },
          { label: "平均薪资", value: `${averageSalaryMin}-${averageSalaryMax}K` },
        ]}
      />
      <div className="ep-job-filter-panel" id="employment-browser">
        <div className="ep-job-filter-search">
          <label><Search size={16} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="搜索岗位、企业或技能" /></label>
          <div><span>共 {postings.length} 个岗位</span><button type="button" onClick={resetJobs}>重置筛选</button></div>
        </div>
        <div className="ep-job-filter-grid">
          <label>行业<select value={jobIndustry} onChange={(event) => { setJobIndustry(event.target.value); setPage(1); }}><option>全部行业</option>{industries.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>类型<select value={jobType} onChange={(event) => { setJobType(event.target.value); setPage(1); }}><option>全部类型</option>{["全职", "实习", "远程"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>薪资<select value={salaryFloor} onChange={(event) => { setSalaryFloor(event.target.value); setPage(1); }}><option>不限</option><option value="8">8K以上</option><option value="12">12K以上</option><option value="15">15K以上</option></select></label>
          <label>城市<select value={jobCity} onChange={(event) => { setJobCity(event.target.value); setPage(1); }}><option>全部城市</option>{cities.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>排序<select value={jobSort} onChange={(event) => { setJobSort(event.target.value); setPage(1); }}><option>匹配度最高</option><option>最新发布</option><option>薪资最高</option></select></label>
        </div>
      </div>
      <div className="ep-job-list">
        {visiblePostings.map(({ posting, match, eligibility }) => {
          const applied = state.applications.find((item) => item.kind === "job" && item.targetId === posting.id);
          const favorite = state.favorites.includes(posting.id);
          const matchTone = match.match >= 80 ? "good" : match.match >= 60 ? "medium" : "low";
          return (
            <Card className={`ep-job-card is-${matchTone}`} key={posting.id}>
              <div className="ep-job-logo">{posting.company.slice(0, 1)}</div>
              <div className="ep-job-main">
                <div className="ep-job-title"><div><h2>{posting.name}</h2><b>{posting.salaryMin}-{posting.salaryMax}K</b></div></div>
                <p>{posting.company} · {posting.companySize ?? "企业规模待补充"} · {posting.companyType ?? "企业"}</p>
                <div className="ep-job-meta"><span><MapPin size={13} />{posting.city}</span><span>{posting.publishedDaysAgo ?? 0} 天前发布</span><span>{posting.employmentType}</span><span>{posting.experience}</span><span>{posting.education}</span></div>
                <p className="ep-job-highlight">{posting.matchHighlight}</p>
                <div className="ep-job-actions">
                  {state.role === "student" && eligibility.tier === "apply" && (applied ? <Tag>{applied.status}</Tag> : <Btn disabled={!eligibility.ok} title={eligibility.reason} onClick={() => applyWithNotice({ kind: "job", targetId: posting.id, name: posting.name, company: posting.company })}>投递</Btn>)}
                  {state.role === "student" && eligibility.tier === "apply" && <Btn secondary onClick={() => setResumePosting(posting)}>简历</Btn>}
                  {state.role === "student" && eligibility.tier === "improve" && <Link className="ep-button" href={`/platform/employment/${posting.id}#improve`}>个性化提升建议</Link>}
                  {state.role === "student" && eligibility.tier === "learn" && <Link className="ep-button" href={`/platform/job/${posting.jobId}/learning-path`}>去学习</Link>}
                  <Link className="ep-button secondary" href={`/platform/employment/${posting.id}`}>查看详情</Link>
                  <Btn secondary onClick={() => toggleFavoriteWithNotice(posting.id)}><Star size={14} />{favorite ? "已收藏" : "收藏"}</Btn>
                </div>
                {state.role === "student" && eligibility.tier === "apply" && !eligibility.ok && !applied && <small className="ep-action-note">{eligibility.reason}</small>}
              </div>
              <div className="ep-job-match" style={{ "--match": `${match.match * 3.6}deg`, "--match-color": match.match >= 80 ? "#5b6f8d" : match.match >= 60 ? "#8d99a8" : "#b5bdc8" } as CSSProperties}><b>{match.match}%</b><span>能力匹配度</span></div>
            </Card>
          );
        })}
        {visiblePostings.length === 0 && <Card><Empty>当前筛选下没有岗位。</Empty></Card>}
      </div>
      <div className="ep-job-pager">
        <button type="button" disabled={activePage <= 1} onClick={() => setPage(activePage - 1)}>‹</button>
        {Array.from({ length: totalPages }, (_, index) => <button type="button" className={activePage === index + 1 ? "active" : ""} onClick={() => setPage(index + 1)} key={index}>{index + 1}</button>)}
        <button type="button" disabled={activePage >= totalPages} onClick={() => setPage(activePage + 1)}>›</button>
        <span>共 {postings.length} 个岗位</span>
      </div>
      <div className="ep-job-capabilities">
        <Link href="/platform/learning/portrait"><span><Activity size={19} /></span><div><b>能力画像</b><small>查看六维能力与达成明细</small></div><ChevronRight size={16} /></Link>
        <Link href="/platform/employment#employment-browser"><span><BriefcaseBusiness size={19} /></span><div><b>岗位匹配推荐</b><small>按能力匹配度查看机会</small></div><ChevronRight size={16} /></Link>
        <Link href="/platform/resources"><span><GraduationCap size={19} /></span><div><b>个性化提升</b><small>通过岗位场景补足能力差距</small></div><ChevronRight size={16} /></Link>
      </div>
      {resumePosting && (
        <div className="ep-resume-mask" role="presentation" onClick={() => setResumePosting(null)}>
          <section className="ep-resume-preview" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <header><div><Tag>RESUME PREVIEW</Tag><h2>简历预览</h2><p>{resumePosting.name} · {resumePosting.company}</p></div><button type="button" onClick={() => setResumePosting(null)}>×</button></header>
            <div className="ep-resume-content">
              <aside><span className="ep-avatar">{state.resume.name.slice(0, 1)}</span><h3>{state.resume.name}</h3><p>{state.resume.education}</p><Tag>{jobById(resumePosting.jobId)?.name}</Tag></aside>
              <div><h3>个人介绍</h3><p>{state.resume.summary || "待补充"}</p><h3>联系方式</h3><p>{state.resume.phone || "待补充"}</p><h3>实战成果</h3>{state.taskSubmissions.filter((item) => item.status === "已通过").slice(0, 3).map((item) => <div className="ep-row" key={item.id}><span className="ep-grow">{taskDetailById(item.sceneId, item.taskId)?.title}</span><Tag tone="success">已通过</Tag></div>)}{state.taskSubmissions.filter((item) => item.status === "已通过").length === 0 && <p>暂无已通过任务成果。</p>}</div>
            </div>
            <footer><Link className="ep-button secondary" href="/platform/learning/resume">编辑简历</Link><Btn disabled={!resumePostingEligibility.ok} title={resumePostingEligibility.reason} onClick={() => { setResumePosting(null); applyWithNotice({ kind: "job", targetId: resumePosting.id, name: resumePosting.name, company: resumePosting.company }); }}>投递该岗位</Btn></footer>
          </section>
        </div>
      )}
    </>
  );
}

export function JobPostingDetail({ id }: { id: string }) {
  const { applyWithNotice, jobById, state, toggleFavoriteWithNotice } = useWorkspacePage();
  const posting = state.jobPostings.find((item) => item.id === id);
  if (!posting) return <Empty>招聘岗位不存在。</Empty>;
  const job = jobById(posting.jobId);
  const match = job
    ? jobMatch(state, job)
    : { match: 0, missing: [], ready: false, scores: dimensions.map(() => 0) };
  const matchScores = job ? match.scores : dimensions.map(() => 0);
  const eligibility = jobPostingEligibility(state, posting);
  const applied = state.applications.find((item) => item.kind === "job" && item.targetId === posting.id);
  const recommendations = job ? recommendedScenesForJob(state, job) : [];
  const favorite = state.favorites.includes(posting.id);
  return (
    <>
      <section className="ep-detail-hero">
        <div>
          <div className="ep-chips"><Tag>{posting.employmentType}</Tag><Tag>{posting.industry}</Tag><Tag tone={match.match >= 80 ? "success" : match.match >= 60 ? "warning" : "muted"}>{match.match}% 匹配</Tag></div>
          <h1>{posting.name}</h1>
          <p>{posting.company} · {posting.city} · {posting.salaryMin}-{posting.salaryMax}K</p>
          <div className="ep-detail-meta"><span>{posting.experience}</span><span>{posting.education}</span><span>{posting.publishedDaysAgo} 天前发布</span></div>
        </div>
        <div className="ep-detail-hero-actions">
          <Btn secondary onClick={() => toggleFavoriteWithNotice(posting.id)}><Star size={14} />{favorite ? "已收藏" : "收藏"}</Btn>
          {state.role === "student" && eligibility.tier === "apply" && (applied ? <Tag>{applied.status}</Tag> : <Btn disabled={!eligibility.ok} title={eligibility.reason} onClick={() => applyWithNotice({ kind: "job", targetId: posting.id, name: posting.name, company: posting.company })}>投递简历</Btn>)}
        </div>
      </section>
      <div className="ep-split">
        <Card>
          <h2>岗位介绍</h2><p>{posting.description}</p>
          <h2>岗位职责</h2>{(posting.responsibilities ?? job?.responsibilities ?? []).map((item) => <p key={item}>· {item}</p>)}
          <h2>任职要求</h2>{(posting.requirements ?? job?.requirements ?? []).map((item) => <p key={item}>· {item}</p>)}
        </Card>
        <Card>
          <h2>能力匹配</h2>
          <div className="ep-posting-match"><b>{match.match}%</b><div><Tag tone={match.match >= 80 ? "success" : match.match >= 60 ? "warning" : "muted"}>{eligibility.tier === "apply" ? "可直接投递" : eligibility.tier === "improve" ? "建议针对性提升" : "需要系统学习"}</Tag><p>{posting.matchHighlight}</p></div></div>
          {job && <div className="ep-assess-ability-list">{dimensions.map((item, index) => <div key={item}><span>{item}</span><progress max="100" value={matchScores[index] ?? 0} /><b>{matchScores[index] ?? 0}/{job.target[index]}</b></div>)}</div>}
          {!eligibility.ok && <p className="ep-status warn">{eligibility.reason}</p>}
          {state.role === "student" && eligibility.tier !== "apply" && <Link className="ep-button" href={`/platform/job/${posting.jobId}/learning-path`}>进入岗位学习路径</Link>}
        </Card>
      </div>
      <Card id="improve">
        <div className="ep-section-title"><div><h2>针对性提升</h2><p>根据当前能力差距推荐场景。</p></div><Link className="ep-link" href={`/platform/job/${posting.jobId}/learning-path`}>查看完整路径 <ArrowUpRight size={15} /></Link></div>
        <div className="ep-grid">
          {recommendations.map((scene) => <Link className="ep-job-scene" href={`/platform/scene/${scene.id}`} key={scene.id}><Tag>{scene.industry}</Tag><h3>{scene.name}</h3><p>{scene.description}</p><span>{scene.tasks.length} 个任务 <ChevronRight size={14} /></span></Link>)}
          {recommendations.length === 0 && <Empty>当前没有额外推荐场景。</Empty>}
        </div>
      </Card>
    </>
  );
}
