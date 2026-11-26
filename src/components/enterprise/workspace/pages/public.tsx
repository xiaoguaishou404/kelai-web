import { Link } from "@/components/router/link";
import { useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Layers,
  Network,
  Search,
  ShieldCheck,
} from "lucide-react";
import {
  dimensions,
  effectiveRightsStatus,
  jobLearningReadiness,
  learningPathProgress,
  majorGroupAdaptation,
  resourceById,
  resourceName,
  resourceRightsBlockedReason,
  resourceVisible,
  rightsSummary,
  sceneProgressFor,
  type JobProfile,
  type MajorGroup,
  type Resource,
} from "@/lib/enterprise-workspace";
import { ResourceBuilder, ResourcePreview } from "@/components/enterprise/resource-builders";
import { useWorkspacePage } from "@/components/enterprise/workspace/page-runtime";
import { ResourceCover } from "@/components/enterprise/workspace/resource-cover";
import { Btn, Card, Empty, History, Metric, RadarView, Tag } from "@/components/enterprise/workspace/ui";

export function IndustryView() {
  const { jobs, notify, scenes, state, updateMajorGroup } = useWorkspacePage();
  const [groupFilter, setGroupFilter] = useState("全部");
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupMajors, setGroupMajors] = useState("");
  const [groupJobIds, setGroupJobIds] = useState<string[]>([]);
  const manager = state.role === "manage";
  const selectedGroup = state.majorGroups.find((item) => item.id === groupFilter);
  const resourceAvailable = (id: string) =>
    manager ? Boolean(resourceById(state, id)?.publishedContent) : resourceVisible(state, id);
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
      <Card className="ep-major-matrix" id="major-groups">
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
      <Card className="ep-industry-scenes">
        <div className="ep-section-title">
          <div><Tag>FIELD SCENES</Tag><h2>行业应用现场</h2></div>
          <Link className="ep-link" href="/platform/resources">查看全部场景 <ArrowUpRight size={15} /></Link>
        </div>
        <div className="ep-grid compact">
          {visibleScenes.slice(0, 4).map((item) => {
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
      <Card className="ep-rights-overview">
        <div className="ep-section-title">
          <div><Tag>RIGHT CLEARANCE</Tag><h2>场景与资源确权</h2></div>
          {manager && <Link className="ep-link" href="/platform/admin/scene/scenarios">进入场景管理 <ArrowUpRight size={15} /></Link>}
        </div>
        <p className="ep-rights-intro">科来对知与的场景与资源进行确权授权，明确资源用途、使用范围与有效期，让产业内容合规进入课程、实训与人才评价。</p>
        <div className="ep-rights-flow" aria-label="资源授权链路">
          <span><i>01</i>资源归属</span>
          <span><i>02</i>授权确认</span>
          <span><i>03</i>教学使用</span>
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
    </>
  );
}

export function ResourcesView() {
  const {
  courses,
  filter,
  jobById,
  jobs,
  query,
  sceneById,
  scenes,
  setFilter,
  setQuery,
  setTab,
  state,
  tab,
  } = useWorkspacePage();
  const matching = (text: string) => text.toLowerCase().includes(query.trim().toLowerCase());
  const resourceOverview = [
    { label: "岗位", value: jobs.filter((item) => resourceVisible(state, item.id)).length },
    { label: "场景", value: scenes.filter((item) => resourceVisible(state, item.id)).length },
    { label: "课程", value: courses.filter((item) => resourceVisible(state, item.id)).length },
    {
      label: "学习路径",
      value: state.learningPaths.filter((path) => {
        const job = jobById(path.jobId);
        return Boolean(job && resourceVisible(state, job.id));
      }).length,
    },
  ];
  const resourceChainLabels = ["能力标准", "真实任务", "方法内容", "学习路径"];
  const maxResourceCount = Math.max(1, ...resourceOverview.map((item) => item.value));
  const listedJobs = jobs
    .filter((item) => resourceVisible(state, item.id) && (filter === "全部" || item.industry === filter) && matching(`${item.name}${item.skills.join("")}${item.stage}`))
    .sort((a, b) => Number(b.recommended) - Number(a.recommended));
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
      <section className="ep-resource-hero ep-full-bleed is-title-only">
        <svg className="ep-resource-hero-geometry" viewBox="0 0 1440 520" preserveAspectRatio="none" aria-hidden="true">
          <path d="M-70 448 224 274V72l280 158" />
          <path d="M-70 448 238 482 518 314" />
          <path d="M1184 112 1388 228v236l-206-119Z" />
          <path d="M1078 0 1388 176" />
          <path d="M1030 520 1388 303" />
        </svg>
        <div className="ep-resource-hero-inner">
          <div className="ep-resource-hero-copy">
            <h2>岗位与场景</h2>
            <p>从岗位标准到场景实训，连接可教、可练、可评价的产业资源。</p>
            <div className="ep-resource-mode-switch">
              <button type="button" className={tab === "岗位" ? "is-active" : ""} onClick={() => browseResources("岗位")}>
                <BriefcaseBusiness size={16} />产业岗位
              </button>
              <button type="button" className={tab === "场景" ? "is-active" : ""} onClick={() => browseResources("场景")}>
                <Activity size={16} />实践场景
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
      <div className="ep-toolbar" id="resource-browser">
        <div className="ep-resource-context">
          <Tag>{tab === "场景" ? "实践场景" : tab === "资源图谱" ? "资源图谱" : "产业岗位"}</Tag>
          <span>{tab === "场景" ? "按行业、岗位和任务筛选真实实践场景" : tab === "资源图谱" ? "查看岗位、场景、课程和评价关系" : "按产业链阶段、行业与能力方向浏览岗位"}</span>
        </div>
        <label className="ep-search"><Search size={16} /><input aria-label="搜索资源" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索岗位、场景或技能" /></label>
      </div>
      {tab === "岗位" && (
        <div className="ep-grid">
          {listedJobs.map((item) => (
            <Link className="ep-card ep-resource-card-link" href={`/platform/job/${item.id}`} aria-label={`查看岗位 ${item.name}`} key={item.id}>
              <ResourceCover id={item.id} kind="job" category={item.category} industry={item.industry} />
              <div className="ep-cardbody">
                <div className="ep-chips">
                  <Tag>{item.stage}</Tag>
                  {item.category && item.category !== item.stage && <Tag tone="muted">{item.category}</Tag>}
                  {item.recommended && <Tag tone="success">推荐</Tag>}
                </div>
                <h2>{item.name}</h2>
                <p>{item.description}</p>
                <div className="ep-chips">{item.skills.map((skill) => <Tag key={skill}>{skill}</Tag>)}</div>
              </div>
            </Link>
          ))}
          {state.resources.filter((item) => item.type === "岗位" && !jobById(item.id) && resourceVisible(state, item.id) && matching(item.name)).map((item) => <ResourceCard key={item.id} resource={item} showCover href={`/platform/resource/${item.id}`} />)}
        </div>
      )}
      {tab === "场景" && (
        <div className="ep-grid">
          {scenes.filter((item) => resourceVisible(state, item.id) && (filter === "全部" || item.industry === filter) && matching(item.name)).map((item) => (
            <Link className="ep-card ep-resource-card-link" href={`/platform/scene/${item.id}`} aria-label={`查看场景 ${item.name}`} key={item.id}>
              <ResourceCover id={item.id} kind="scene" industry={item.industry} />
              <div className="ep-cardbody">
                <div className="ep-chips">
                  <Tag>{item.difficulty}</Tag>
                  {item.industry && <Tag tone="muted">{item.industry}</Tag>}
                  <Tag tone={sceneProgressFor(state, item.id).status === "已完成" ? "success" : sceneProgressFor(state, item.id).status === "待评价" ? "warning" : "muted"}>{sceneProgressFor(state, item.id).status}</Tag>
                </div>
                <h2>{item.name}</h2><p>{item.description}</p>
                <small>{sceneProgressFor(state, item.id).completedCount}/{sceneProgressFor(state, item.id).taskCount} 个任务已完成</small>
              </div>
            </Link>
          ))}
          {state.resources.filter((item) => item.type === "场景" && !sceneById(item.id) && resourceVisible(state, item.id) && matching(item.name)).map((item) => <ResourceCard key={item.id} resource={item} showCover href={`/platform/resource/${item.id}`} />)}
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
      {tab === "资源图谱" && <ResourceGraph />}
    </>
  );
}

export function ResourceCard({ resource, showCover = false, href }: { resource: Resource; showCover?: boolean; href?: string }) {
  const content = (
    <>
      {showCover && <ResourceCover id={resource.id} kind={resource.type === "岗位" ? "job" : "scene"} />}
      <div className="ep-cardbody">
        <Tag>{resource.type}</Tag>
        <h2>{resource.name}</h2>
        <p>{resource.description}</p>
        {!href && <Link className="ep-link" href={`/platform/resource/${resource.id}`}>查看资源 <ArrowUpRight size={16} /></Link>}
      </div>
    </>
  );
  if (href) {
    return <Link className="ep-card ep-resource-card-link" href={href} aria-label={`查看${resource.type} ${resource.name}`}>{content}</Link>;
  }
  return <Card>{content}</Card>;
}

function ResourceGraph() {
  const { state } = useWorkspacePage();
  const visibleResources = state.resources.filter((item) => resourceVisible(state, item.id));
  const jobResources = visibleResources.filter((item) => item.type === "岗位");
  const sceneResources = visibleResources.filter((item) => item.type === "场景");
  const courseResources = visibleResources.filter((item) => item.type === "课程");
  const assessmentResources = visibleResources.filter((item) => item.type === "测评" || item.type === "评价标准");
  return (
    <Card>
      <div className="ep-section-title"><div><h2>岗位 · 场景 · 课程 · 评价</h2><p>资源之间通过能力点和真实任务形成培养关系。</p></div><Tag>{visibleResources.length} 项资源</Tag></div>
      <div className="ep-resource-relation-map">
        <section>
          <small>岗位标准</small>
          {jobResources.map((resource) => <Link href={`/platform/resource/${resource.id}`} key={resource.id}>{resourceName(state, resource.id, resource.name)}</Link>)}
        </section>
        <i />
        <section>
          <small>实践场景</small>
          {sceneResources.map((resource) => <Link href={`/platform/resource/${resource.id}`} key={resource.id}>{resourceName(state, resource.id, resource.name)}</Link>)}
        </section>
        <i />
        <section>
          <small>课程内容</small>
          {courseResources.map((resource) => <Link href={`/platform/resource/${resource.id}`} key={resource.id}>{resourceName(state, resource.id, resource.name)}</Link>)}
        </section>
        <i />
        <section>
          <small>评价与认定</small>
          {assessmentResources.map((resource) => <Link href={`/platform/resource/${resource.id}`} key={resource.id}>{resourceName(state, resource.id, resource.name)}</Link>)}
        </section>
      </div>
      <div className="ep-resource-relation-links">
        {jobResources.map((resource) => {
          const related = resource.relatedIds.map((id) => resourceById(state, id)).filter((item): item is Resource => Boolean(item));
          return <div key={resource.id}><b>{resource.name}</b><span>{related.map((item) => item.name).join(" · ") || "待关联"}</span></div>;
        })}
      </div>
    </Card>
  );
}

export function JobView({ id }: { id?: string }) {
  const {
  courses,
  evaluationStandard,
  jobs,
  publishedAssessmentList,
  publishedStandardList,
  scenes,
  state,
  toggleFavoriteWithNotice,
  } = useWorkspacePage();
  const [detailTab, setDetailTab] = useState("overview");
  const job = jobs.find((item) => item.id === id);
  const path = job ? learningPathProgress(state, job.id) : undefined;
  const pathNodes = path?.nodes ?? [];
  if (!job) return <Empty>岗位不存在。</Empty>;
  if (!resourceVisible(state, job.id) && state.role !== "manage" && state.role !== "schoolAdmin") {
    return <Empty>{resourceRightsBlockedReason(state, job.id, "教学使用") || "该岗位当前不可用于教学。"}</Empty>;
  }
  const readiness = jobLearningReadiness(state, job.id);
  const pathSceneIds = path?.nodes.map((node) => node.node.sceneId) ?? job.sceneIds ?? [];
  const relatedAssessments = publishedAssessmentList.filter((item) => (job.assessmentIds ?? []).includes(item.id) && (state.role === "manage" || resourceVisible(state, item.id)));
  const relatedStandards = publishedStandardList.filter((item) => (job.standardIds ?? []).includes(item.id) && (state.role === "manage" || resourceVisible(state, item.id)));
  const relatedScenes = pathSceneIds
    .map((sceneId) => scenes.find((item) => item.id === sceneId))
    .filter((item): item is NonNullable<typeof item> => Boolean(item) && (state.role === "manage" || resourceVisible(state, item!.id)));
  const relatedCourses = courses.filter((item) => (job.courseIds ?? []).includes(item.id) && (state.role === "manage" || resourceVisible(state, item.id)));
  const jobRights = resourceById(state, job.id)?.rights;
  const strategy = relatedStandards[0] ?? (job.id === "service" ? evaluationStandard : undefined);
  const knowledgeNodes = [...(job.skills ?? []), ...(job.abilityPoints ?? []).map((item) => item.name)].slice(0, 14);
  const jobTabs = [
    ["overview", "岗位概况"],
    ["duties", "岗位职责"],
    ["ability", "能力模型"],
    ["standard", "胜任标准"],
    ["knowledge", "知识图谱"],
    ["certificate", "涉及证书"],
  ];
  return (
    <>
      <section className="ep-detail-hero ep-job-detail-hero">
        <div className="ep-job-detail-top">
          <div>
            <div className="ep-chips">
              <Tag>{job.category}</Tag>
              <Tag tone={readiness.ready ? "success" : "warning"}>{readiness.ready ? "可培养" : "学习路径待完善"}</Tag>
              {jobRights && <Tag tone={effectiveRightsStatus(jobRights) === "已确权" ? "success" : "warning"}>{effectiveRightsStatus(jobRights)}</Tag>}
            </div>
            <h1>{resourceName(state, job.id, job.name)}</h1>
            <p>{job.description}</p>
            <div className="ep-detail-meta">
              <span>岗位编码 {job.code ?? `KL-GW-${job.id.toUpperCase()}`}</span>
              <span>{job.industry} · {job.stage}</span>
              <span>{job.salaryRange ?? "能力导向"}</span>
            </div>
            {!!job.aliases?.length && <small>别名：{job.aliases.join(" · ")}</small>}
          </div>
          <div className="ep-detail-hero-actions">
            {state.role === "student" && <Btn secondary onClick={() => toggleFavoriteWithNotice(job.id)}>{state.favorites.includes(job.id) ? "已收藏" : "收藏岗位"}</Btn>}
          </div>
        </div>
        <div className="ep-job-scene-path" id="job-learning-path">
          <div className="ep-job-scene-path-head">
            <b>场景学习路径</b>
            <Tag tone={path?.completed === path?.total ? "success" : "muted"}>{path?.completed ?? 0}/{path?.total ?? 0} 场景完成</Tag>
          </div>
          {pathNodes.length ? (
            <div className="ep-scene-path-track">
              {pathNodes.map((item, index) => (
                <Link
                  className={`is-${item.progress.status === "已完成" ? "success" : item.progress.status === "待评价" ? "warning" : "muted"}`}
                  href={`/platform/scene/${item.scene.id}`}
                  key={item.node.id}
                >
                  <span className="ep-scene-path-index">{index === 0 ? "START" : index === pathNodes.length - 1 ? "END" : String(index + 1).padStart(2, "0")}</span>
                  <i>{item.progress.status === "已完成" ? <CheckCircle2 size={18} /> : index + 1}</i>
                  <b>{item.scene.name}</b>
                  <small>{item.node.phase} · {item.progress.completedCount}/{item.progress.taskCount} 任务</small>
                </Link>
              ))}
            </div>
          ) : <Empty>当前岗位还没有可用的场景学习路径。</Empty>}
        </div>
      </section>
      <div className="ep-stats">
        <Metric label="工作任务" value={relatedScenes.reduce((sum, item) => sum + (item.taskDetails?.length ?? item.tasks.length), 0)} />
        <Metric label="能力点" value={job.abilityPoints?.length ?? 0} />
        <Metric label="关联场景" value={relatedScenes.length} />
        <Metric label="关联课程" value={(job.courseIds ?? []).filter((id) => resourceVisible(state, id)).length} />
      </div>
      <div className="ep-detail-tabs">
        {jobTabs.map(([key, label]) => (
          <button className={detailTab === key ? "active" : ""} onClick={() => setDetailTab(key)} key={key}>{label}</button>
        ))}
      </div>
      {detailTab === "overview" && (
        <Card className="ep-job-overview">
          <div className="ep-job-overview-grid">
            <div>
              <h2>岗位定位</h2>
              <p>{job.description}</p>
            </div>
            <div>
              <h2>职业发展路线</h2>
              {(job.careerPaths ?? []).length ? (job.careerPaths ?? []).map((item, index) => (
                <div className="ep-career-step" key={item}><span>{index + 1}</span><b>{item}</b></div>
              )) : <Empty>职业发展路线待完善。</Empty>}
            </div>
          </div>
        </Card>
      )}
      {detailTab === "duties" && (
        <div className="ep-split">
          <Card>
            <h2>典型工作任务</h2>
            {(job.tasks ?? []).length ? (job.tasks ?? []).map((task, index) => (
              <div className="ep-duty-row" key={task.id}>
                <span className="ep-number">{index + 1}</span>
                <div><b>{task.name}</b><p>{task.description}</p></div>
                <Tag>{task.abilityPointIds.length} 个能力点</Tag>
              </div>
            )) : <Empty>工作任务待完善。</Empty>}
          </Card>
          <Card>
            <h2>任职要求</h2>
            {(job.requirements ?? []).map((item, index) => <p key={item}><b>{index + 1}.</b> {item}</p>)}
            <h2>关联职责</h2>
            {(job.responsibilities ?? []).map((item) => <div className="ep-row" key={item}>{item}</div>)}
          </Card>
        </div>
      )}
      {detailTab === "ability" && (
        <div className="ep-split">
          <Card>
            <h2>目标能力雷达</h2>
            <RadarView values={job.target} />
            {dimensions.map((item, index) => <div className="ep-ability" key={item}><span>{item}</span><progress max="100" value={job.target[index]} /><b>{job.target[index]}</b></div>)}
          </Card>
          <Card>
            <h2>能力领域与能力点</h2>
            {Object.entries((job.abilityPoints ?? []).reduce<Record<string, NonNullable<JobProfile["abilityPoints"]>>>((groups, point) => {
              const key = point.domain || "综合能力";
              groups[key] = [...(groups[key] ?? []), point];
              return groups;
            }, {})).map(([domain, points]) => (
              <div className="ep-ability-group" key={domain}>
                <h3>{domain}</h3>
                {points.map((point) => <div className="ep-row" key={point.id}><span className="ep-grow">{point.name}</span><Tag>{point.level}</Tag><small>{point.weight}%</small></div>)}
              </div>
            ))}
          </Card>
        </div>
      )}
      {detailTab === "standard" && (
        <Card>
          <div className="ep-section-title">
            <div><h2>{strategy?.name ?? "岗位能力胜任标准"}</h2><p>{strategy?.recognitionRule ?? "等待配置评价标准"}</p></div>
            {strategy && <Link className="ep-link" href={`/platform/standard/${strategy.id}`}>查看完整标准 <ArrowUpRight size={15} /></Link>}
          </div>
          {strategy ? (
            <div className="ep-standard-grid">
              {strategy.abilityPointWeights.map((point) => <div key={point.id}><span>{point.name}</span><b>{point.weight}%</b><small>{point.level}</small></div>)}
            </div>
          ) : <Empty>该岗位尚未关联能力评价标准。</Empty>}
        </Card>
      )}
      {detailTab === "knowledge" && (
        <Card>
          <h2>岗位知识图谱</h2>
          <div className="ep-knowledge-map">
            <div className="ep-knowledge-core"><BriefcaseBusiness size={24} /><b>{job.name}</b></div>
            <div className="ep-knowledge-nodes">
              {knowledgeNodes.map((node, index) => <span className={`node-${index % 3}`} key={node}>{node}</span>)}
            </div>
          </div>
        </Card>
      )}
      {detailTab === "certificate" && (
        <div className="ep-grid ep-certificate-reference-grid">
          {(job.certificates ?? []).length ? (job.certificates ?? []).map((item, index) => (
            <Card className="ep-certificate-reference-card" key={item}>
              <span className="ep-credential-mark">CERT</span>
              <div className="ep-certificate-reference-copy">
                <h2>{item}</h2>
                <p>{index === 0 ? "岗位能力达标后可关联认定" : "行业或企业认证参考"}</p>
              </div>
              <Link className="ep-link ep-certificate-reference-link" href="/platform/assessment#certificate-resources">查看证书资源 <ArrowUpRight size={15} /></Link>
            </Card>
          )) : <Card className="ep-certificate-reference-empty"><Empty>当前岗位未配置关联证书。</Empty></Card>}
        </div>
      )}
      <Card>
        <h2>关联课程与评价</h2>
        {relatedCourses.map((item) => <Link className="ep-row" key={item.id} href={`/platform/course/${item.id}`}><span className="ep-icon"><BookOpen size={18} /></span><span className="ep-grow">{item.name}<small>{item.courseType} · {item.totalHours} 学时</small></span><ChevronRight size={15} /></Link>)}
        {relatedAssessments.map((item) => <Link className="ep-row" key={item.id} href={`/platform/assessment/${item.id}`}><span className="ep-grow">{item.name}</span><ChevronRight size={15} /></Link>)}
        {relatedStandards.map((item) => <Link className="ep-row" key={item.id} href={`/platform/standard/${item.id}`}><span className="ep-grow">{item.name}</span><ChevronRight size={15} /></Link>)}
      </Card>
    </>
  );
}

export function ResourceView({ id }: { id?: string }) {
  const { notify, resourceActionWithNotice, state } = useWorkspacePage();
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
        </div><History items={resource.reviewHistory.map((item) => ({ at: item.at, actor: item.actor, action: item.action, note: item.note }))} /></Card>
      </>}
    </div>
  );
  if (!resourceVisible(state, resource.id)) {
    return <Empty>{resourceRightsBlockedReason(state, resource.id, "教学使用") || "该资源当前不可用于教学。"}</Empty>;
  }
  return <Card><ResourcePreview state={state} resource={resource} /><h2>关联资源</h2>{resource.relatedIds.map((relatedId) => {
    const related = resourceById(state, relatedId);
    return related && resourceVisible(state, related.id) ? <Link className="ep-row" key={related.id} href={related.type === "岗位" ? `/platform/job/${related.id}` : related.type === "场景" ? `/platform/scene/${related.id}` : related.type === "课程" ? `/platform/course/${related.id}` : related.type === "测评" ? `/platform/assessment/${related.id}` : `/platform/standard/${related.id}`}>{related.name}<ChevronRight /></Link> : null;
  })}</Card>;
}
