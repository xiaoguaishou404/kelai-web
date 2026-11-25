"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, ChevronRight, Download, Search } from "lucide-react";
import {
  abilityScores,
  assessmentAvailability,
  certificateEligibility,
  dimensions,
  nowLabel,
  resourceRightsBlockedReason,
  resourceVisible,
  type AssessmentProfile,
} from "@/lib/enterprise-workspace";
import { ChannelHero } from "@/components/enterprise/channel-hero";
import { useWorkspacePage } from "@/components/enterprise/workspace/page-runtime";
import { Btn, Card, Empty, Metric, Tag } from "@/components/enterprise/workspace/ui";

export function AssessmentDetail({ id }: { id: string }) {
  const { jobById, publishedAssessmentList, publishedStandardList, state } = useWorkspacePage();
  const item = publishedAssessmentList.find((assessmentItem) => assessmentItem.id === id);
  if (!item) return <Empty>测评不存在。</Empty>;
  const job = jobById(item.jobId);
  const standard = publishedStandardList.find((candidate) => candidate.id === item.standardId);
  const availability = assessmentAvailability(state, item);
  const schedule = availability.schedule;
  const questionTypes = Object.entries(item.questions.reduce<Record<string, number>>((groups, question) => {
    const type = question.type ?? "单选";
    groups[type] = (groups[type] ?? 0) + 1;
    return groups;
  }, {}));
  return (
    <>
      <section className="ep-detail-hero">
        <div>
          <div className="ep-chips"><Tag>岗位能力测评</Tag><Tag>{item.durationMinutes} 分钟</Tag><Tag>{item.passScore} 分合格</Tag></div>
          <h1>{item.name}</h1>
          <p>{job?.name ?? "未关联岗位"} · {item.questions.length} 题 · {item.code ?? item.id}</p>
        </div>
        {state.role === "student" && availability.available && <Link className="ep-button" href={`/platform/exam/${item.id}${item.kind === "题库" ? "?mode=practice" : ""}`}>{item.kind === "题库" ? "开始刷题" : "进入测评"}</Link>}
        {state.role === "student" && !availability.available && availability.action === "result" && <Link className="ep-button secondary" href={`/platform/exam/${item.id}`}>查看结果</Link>}
      </section>
      <div className="ep-stats">
        <Metric label="题目数量" value={item.questions.length} />
        <Metric label={item.kind === "题库" ? "练习时长" : "考试时长"} value={`${item.durationMinutes} 分钟`} />
        <Metric label="能力点" value={item.abilityPointCount ?? standard?.abilityPointWeights.length ?? job?.abilityPoints?.length ?? 0} />
        <Metric label={item.kind === "题库" ? "推荐分" : "合格线"} value={item.passScore} />
      </div>
      <div className="ep-split">
        <Card>
          <h2>试卷结构</h2>
          {questionTypes.map(([type, count]) => <div className="ep-row" key={type}><span className="ep-grow">{type}</span><b>{count} 题</b></div>)}
          <h2>考试安排</h2>
          {schedule ? <><p>{schedule.name}</p><p>{schedule.openAt} 至 {schedule.closeAt}</p><Tag tone={schedule.status === "进行中" ? "success" : "warning"}>{schedule.status}</Tag></> : <Empty>{item.kind === "题库" ? "题库不限考试时间。" : "当前没有考试安排。"}</Empty>}
          {!availability.available && availability.reason && <p className="ep-status warn">{availability.reason}</p>}
        </Card>
        <Card>
          <h2>岗位与评价标准</h2>
          {job && <Link className="ep-row" href={`/platform/job/${job.id}`}><span className="ep-grow">{job.name}<small>{job.skills.join(" · ")}</small></span><ChevronRight size={15} /></Link>}
          {standard && <Link className="ep-row" href={`/platform/standard/${standard.id}`}><span className="ep-grow">{standard.name}<small>{standard.recognitionRule}</small></span><ChevronRight size={15} /></Link>}
          <h2>关联证书</h2>
          <Link className="ep-link" href="/platform/assessment#certificate-resources">查看可关联证书资源 <ArrowUpRight size={15} /></Link>
        </Card>
      </div>
    </>
  );
}

export function StandardDetail({ id }: { id: string }) {
  const { jobById, publishedStandardList, state } = useWorkspacePage();
  const item = publishedStandardList.find((standard) => standard.id === id);
  if (!item) return <Empty>评价标准不存在。</Empty>;
  if (!resourceVisible(state, item.id) && state.role !== "manage" && state.role !== "schoolAdmin") {
    return <Empty>{resourceRightsBlockedReason(state, item.id, "教学使用") || "评价标准当前不可用于教学。"}</Empty>;
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

export function AssessmentView() {
  const {
  accessibleAssessmentList,
  accessibleStandardList,
  claimCertificate,
  enrollCertificate,
  jobById,
  notify,
  publishedAssessmentList,
  publishedStandardList,
  query,
  setQuery,
  state,
  } = useWorkspacePage();
  const evaluationMethods = state.evaluationMethodCatalog;
  const [topTab, setTopTab] = useState<"assessment" | "certificate">("assessment");
  const [assessmentTab, setAssessmentTab] = useState("题库");
  const [assessmentJob, setAssessmentJob] = useState("全部岗位");
  const [assessmentType, setAssessmentType] = useState("全部类型");
  const [assessmentDifficulty, setAssessmentDifficulty] = useState("全部难度");
  const [certificateCategory, setCertificateCategory] = useState("全部");
  const [certificateJob, setCertificateJob] = useState("全部岗位");
  const [certificateLevel, setCertificateLevel] = useState("全部等级");
  const [certificateIssuer, setCertificateIssuer] = useState("全部机构");
  const openTopTab = (tab: "assessment" | "certificate") => {
    setTopTab(tab);
    window.history.replaceState(null, "", tab === "certificate" ? "#certificate-resources" : window.location.pathname);
  };
  useEffect(() => {
    const sync = () => setTopTab(window.location.hash === "#certificate-resources" ? "certificate" : "assessment");
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const eligibility = certificateEligibility(state);
  const questionBanks = publishedAssessmentList.filter((item) => item.kind === "题库");
  const assessmentPapers = publishedAssessmentList.filter((item) => item.kind === "试卷");
  const assessmentJobs = Array.from(new Set(publishedAssessmentList.map((item) => item.jobId)));
  const questionTypes = Array.from(new Set(
    publishedAssessmentList.flatMap((item) => item.questions.map((question) => question.type ?? "单选")),
  ));
  const difficulties = ["入门", "初级", "中级", "高级", "专家"];
  const matchesAssessmentFilters = (item: AssessmentProfile) => {
    if (assessmentJob !== "全部岗位" && item.jobId !== assessmentJob) return false;
    if (assessmentDifficulty !== "全部难度" && item.difficulty !== assessmentDifficulty) return false;
    if (assessmentType !== "全部类型" && !item.questions.some((question) => (question.type ?? "单选") === assessmentType)) return false;
    const text = `${item.name}${item.code ?? ""}${jobById(item.jobId)?.name ?? ""}`;
    return text.toLowerCase().includes(query.trim().toLowerCase());
  };
  const filteredQuestionBanks = questionBanks.filter(matchesAssessmentFilters);
  const filteredPapers = assessmentPapers.filter(matchesAssessmentFilters);
  const filteredStandards = publishedStandardList.filter((item) => {
    if (assessmentJob !== "全部岗位" && item.jobId !== assessmentJob) return false;
    if (assessmentType !== "全部类型" || assessmentDifficulty !== "全部难度") return false;
    return `${item.name}${item.code ?? ""}${jobById(item.jobId)?.name ?? ""}`.toLowerCase().includes(query.trim().toLowerCase());
  });
  const filteredMethods = evaluationMethods.filter((item) => {
    if (assessmentJob !== "全部岗位" || assessmentType !== "全部类型" || assessmentDifficulty !== "全部难度") return false;
    return `${item.name}${item.form}${item.use}`.toLowerCase().includes(query.trim().toLowerCase());
  });
  const attempts = state.examAttempts
    .filter((item) => item.studentId === state.activeStudentId)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const latestAttempt = attempts[0];
  const scores = abilityScores(state);
  const certificates = state.platformAdmin.certificates.filter((item) => {
    if (certificateCategory !== "全部" && item.category !== certificateCategory) return false;
    if (certificateJob !== "全部岗位" && !item.jobIds.includes(certificateJob)) return false;
    if (certificateLevel !== "全部等级" && item.level !== certificateLevel) return false;
    if (certificateIssuer !== "全部机构" && item.issuer !== certificateIssuer) return false;
    return `${item.name}${item.issuer}${item.condition}`.toLowerCase().includes(query.trim().toLowerCase());
  });
  const certificateJobs = Array.from(new Set(state.platformAdmin.certificates.flatMap((item) => item.jobIds)));
  const certificateLevels = Array.from(new Set(state.platformAdmin.certificates.map((item) => item.level)));
  const certificateIssuers = Array.from(new Set(state.platformAdmin.certificates.map((item) => item.issuer)));
  const resetAssessmentFilters = () => {
    setAssessmentJob("全部岗位");
    setAssessmentType("全部类型");
    setAssessmentDifficulty("全部难度");
    setQuery("");
  };
  const resetCertificateFilters = () => {
    setCertificateCategory("全部");
    setCertificateJob("全部岗位");
    setCertificateLevel("全部等级");
    setCertificateIssuer("全部机构");
    setQuery("");
  };
  const assessmentCount = questionBanks.length + assessmentPapers.length + publishedStandardList.length + evaluationMethods.length;
  return (
    <>
      <ChannelHero
        variant="assessment"
        kicker="ASSESSMENT & CREDENTIAL"
        title="测评与证书"
        description="用岗位标准组织理论核验、场景实操与能力认定，让每一次达标都可追溯、可证明。"
        metrics={[
          { label: "测评资源", value: String(assessmentCount).padStart(2, "0") },
          { label: "评价标准", value: String(accessibleStandardList.length).padStart(2, "0") },
          { label: "核验题目", value: accessibleAssessmentList.reduce((sum, item) => sum + item.questions.length, 0) },
          { label: "可报考证书", value: state.platformAdmin.certificates.filter((item) => item.status === "报名中").length },
        ]}
      />
      <div className="ep-assess-switch" role="tablist">
        <button className={topTab === "assessment" ? "active" : ""} onClick={() => openTopTab("assessment")}>
          测评资源<small>{assessmentCount}</small>
        </button>
        <button className={topTab === "certificate" ? "active" : ""} onClick={() => openTopTab("certificate")}>
          证书资源<small>{state.platformAdmin.certificates.length}</small>
        </button>
      </div>
      {topTab === "assessment" ? (
        <>
          <div className="ep-assess-filters">
            <label>关联岗位<select value={assessmentJob} onChange={(event) => setAssessmentJob(event.target.value)}><option>全部岗位</option>{assessmentJobs.map((jobId) => <option value={jobId} key={jobId}>{jobById(jobId)?.name ?? jobId}</option>)}</select></label>
            <label>测评类型<select value={assessmentType} onChange={(event) => setAssessmentType(event.target.value)}><option>全部类型</option>{questionTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
            <label>难度<select value={assessmentDifficulty} onChange={(event) => setAssessmentDifficulty(event.target.value)}><option>全部难度</option>{difficulties.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="ep-assess-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索测评、标准或方式" /></label>
            <button type="button" onClick={resetAssessmentFilters}>重置</button>
          </div>
          <div className="ep-assess-tabs">
            {[
              ["题库", questionBanks.length],
              ["试卷", assessmentPapers.length],
              ["评价标准", publishedStandardList.length],
              ["测评方式", evaluationMethods.length],
            ].map(([item, count]) => <button className={assessmentTab === item ? "active" : ""} onClick={() => setAssessmentTab(String(item))} key={item}>{item}<small>{count}</small></button>)}
          </div>
          {assessmentTab === "题库" && (
            <div className="ep-grid ep-assess-card-grid">
              {filteredQuestionBanks.map((item) => {
                const job = jobById(item.jobId);
                const availability = assessmentAvailability(state, item);
                return (
                  <Card className="ep-assess-card" key={item.id}>
                    <div className="ep-assess-card-top"><Tag>题库</Tag><Tag tone="muted">{item.difficulty}</Tag></div>
                    <h2>{item.name}</h2>
                    <p>{job?.name ?? "未关联岗位"} · {item.abilityPointCount} 个能力点</p>
                    <div className="ep-assess-metrics"><span><b>{item.questions.length}</b>道示例题</span><span><b>{item.usageCount ?? 0}</b>次使用</span><span><b>{item.averageScore ?? "-"}</b>均分</span></div>
                    <div className="ep-assess-publisher"><span>{item.publisher}</span><small>{item.code}</small></div>
                    <div className="ep-actions">
                      {state.role === "student" ? (
                        availability.available
                          ? <Link className="ep-button" href={`/platform/exam/${item.id}?mode=practice`}>开始刷题</Link>
                          : <Btn disabled title={availability.reason}>{availability.reason}</Btn>
                      ) : <Link className="ep-button secondary" href={`/platform/assessment/${item.id}`}>查看题库</Link>}
                      <Link className="ep-button secondary" href={`/platform/assessment/${item.id}`}>详情</Link>
                    </div>
                  </Card>
                );
              })}
              {filteredQuestionBanks.length === 0 && <Card><Empty>当前筛选下没有题库。</Empty></Card>}
            </div>
          )}
          {assessmentTab === "试卷" && (
            <div className="ep-grid ep-assess-card-grid">
              {filteredPapers.map((item) => {
                const availability = assessmentAvailability(state, item);
                return (
                  <Card className="ep-assess-card" key={item.id}>
                    <div className="ep-assess-card-top"><Tag>试卷</Tag><Tag tone="warning">{item.difficulty}</Tag></div>
                    <h2>{item.name}</h2>
                    <p>{jobById(item.jobId)?.name ?? "未关联岗位"} · {item.abilityPointCount} 个能力点</p>
                    <div className="ep-assess-metrics"><span><b>{item.questions.length}</b>题</span><span><b>{item.durationMinutes}</b>分钟</span><span><b>{item.passScore}</b>合格线</span></div>
                    <div className="ep-assess-publisher"><span>{item.publisher}</span>{availability.schedule && <small>{availability.schedule.openAt}</small>}</div>
                    <div className="ep-actions">
                      <Link className="ep-button secondary" href={`/platform/assessment/${item.id}`}>详情</Link>
                      {state.role === "student" && (
                        availability.available
                          ? <Link className="ep-button" href={`/platform/exam/${item.id}`}>开始测评</Link>
                          : availability.action === "result"
                            ? <Link className="ep-button" href={`/platform/exam/${item.id}`}>查看结果</Link>
                            : <Btn disabled title={availability.reason}>{availability.reason}</Btn>
                      )}
                    </div>
                  </Card>
                );
              })}
              {filteredPapers.length === 0 && <Card><Empty>当前筛选下没有试卷。</Empty></Card>}
            </div>
          )}
          {assessmentTab === "评价标准" && (
            <div className="ep-grid ep-assess-card-grid">
              {filteredStandards.map((item) => (
                <Card className="ep-assess-card" key={item.id}>
                  <div className="ep-assess-card-top"><Tag>评价标准</Tag><Tag tone="success">{item.levelBands.length} 个等级</Tag></div>
                  <h2>{item.name}</h2>
                  <p>{jobById(item.jobId)?.name ?? "未关联岗位"} · {item.abilityPointWeights.length} 个能力点</p>
                  <div className="ep-standard-mini">{item.abilityPointWeights.slice(0, 4).map((point) => <span key={point.id}>{point.name}<b>{point.weight}%</b></span>)}</div>
                  <Link className="ep-link" href={`/platform/standard/${item.id}`}>查看认定规则 <ArrowUpRight size={15} /></Link>
                </Card>
              ))}
              {filteredStandards.length === 0 && <Card><Empty>当前筛选下没有评价标准。</Empty></Card>}
            </div>
          )}
          {assessmentTab === "测评方式" && (
            <div className="ep-grid ep-assess-card-grid">
              {filteredMethods.map((method) => (
                <Card className="ep-assess-card" key={method.id}>
                  <div className="ep-assess-card-top"><Tag>测评方式</Tag><Tag tone="muted">{method.duration}</Tag></div>
                  <h2>{method.name}</h2><p>{method.form}</p><div className="ep-row">{method.use}</div>
                  <Link className="ep-link" href={`/platform/evaluation-method/${method.id}`}>查看使用说明 <ArrowUpRight size={15} /></Link>
                </Card>
              ))}
              {filteredMethods.length === 0 && <Card><Empty>当前筛选下没有测评方式。</Empty></Card>}
            </div>
          )}
          <div className="ep-assess-personal" id="assessment-overview">
            <Card>
              <div className="ep-section-title"><div><Tag>MY ASSESSMENT</Tag><h2>我的测评与能力</h2><p>测评记录、场景结果和能力画像集中回写。</p></div><Link className="ep-link" href="/platform/learning/portrait">查看完整画像 <ArrowUpRight size={15} /></Link></div>
              <div className="ep-assess-personal-metrics">
                <div><small>最近成绩</small><b>{latestAttempt?.score ?? "待测评"}</b></div>
                <div><small>必选场景</small><b>{eligibility.sceneReady ? "已通过" : "未通过"}</b></div>
                <div><small>结业凭证</small><b>{eligibility.certificate ? "已获得" : eligibility.eligible ? "可领取" : "未达成"}</b></div>
              </div>
              <div className="ep-assess-ability-list">
                {dimensions.map((item, index) => <div key={item}><span>{item}</span><progress max="100" value={scores[index]} /><b>{scores[index]}</b></div>)}
              </div>
              <div className="ep-actions">
                {eligibility.certificate
                  ? <Tag tone="success">{eligibility.certificate.number}</Tag>
                  : <Btn disabled={!eligibility.eligible || state.role !== "student"} onClick={claimCertificate}>领取结业凭证</Btn>}
              </div>
            </Card>
            <Card>
              <h2>最近测评</h2>
              {attempts.length === 0 ? <Empty>还没有测评记录。</Empty> : attempts.slice(0, 5).map((item) => (
                <div className="ep-row" key={item.id}>
                  <div className="ep-grow"><b>{item.assessmentName ?? "岗位综合测评"}</b><p>{item.submittedAt} · {item.assessmentKind ?? "试卷"}</p></div>
                  <b>{item.score} 分</b>
                  <Tag tone={item.passed ? "success" : "warning"}>{item.passed ? "已通过" : "未通过"}</Tag>
                </div>
              ))}
            </Card>
          </div>
        </>
      ) : (
        <div id="certificate-resources">
          <div className="ep-certificate-summary">
            <div><small>我的证书</small><b>{state.certificates.length}</b></div>
            <div><small>报名审核</small><b>{state.platformAdmin.enrollments.filter((item) => item.status === "待审核").length}</b></div>
            <div><small>可报考证书</small><b>{state.platformAdmin.certificates.filter((item) => item.status === "报名中").length}</b></div>
          </div>
          <div className="ep-assess-filters">
            <label>关联岗位<select value={certificateJob} onChange={(event) => setCertificateJob(event.target.value)}><option>全部岗位</option>{certificateJobs.map((jobId) => <option value={jobId} key={jobId}>{jobById(jobId)?.name ?? jobId}</option>)}</select></label>
            <label>证书等级<select value={certificateLevel} onChange={(event) => setCertificateLevel(event.target.value)}><option>全部等级</option>{certificateLevels.map((level) => <option key={level}>{level}</option>)}</select></label>
            <label>发证机构<select value={certificateIssuer} onChange={(event) => setCertificateIssuer(event.target.value)}><option>全部机构</option>{certificateIssuers.map((issuer) => <option key={issuer}>{issuer}</option>)}</select></label>
            <label className="ep-assess-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索证书名称、机构" /></label>
            <button type="button" onClick={resetCertificateFilters}>重置</button>
          </div>
          <div className="ep-certificate-filters">
            {["全部", "平台认证", "行业认证", "企业认证", "职业技能等级"].map((item) => <button className={certificateCategory === item ? "active" : ""} onClick={() => setCertificateCategory(item)} key={item}>{item}</button>)}
          </div>
          <div className="ep-grid ep-assess-card-grid">
            {certificates.map((certificate) => {
              const enrollment = state.platformAdmin.enrollments.find((item) => item.certificateId === certificate.id && item.studentId === state.activeStudentId);
              return (
                <Card className="ep-assess-card" key={certificate.id}>
                  <div className="ep-assess-card-top"><Tag>{certificate.category}</Tag><Tag tone={certificate.sample ? "warning" : "success"}>{certificate.sample ? "演示认证" : "平台凭证"}</Tag></div>
                  <span className="ep-credential-mark">{certificate.level}</span>
                  <h2>{certificate.name}</h2>
                  <p>{certificate.issuer} · {certificate.abilityCount} 个能力点</p>
                  <small>{certificate.jobIds.map((jobId) => jobById(jobId)?.name ?? jobId).join(" / ")}</small>
                  <div className="ep-certificate-meta"><span>{certificate.format}</span><span>{certificate.examDate}</span></div>
                  <p>{certificate.condition}</p>
                  <div className="ep-actions">
                    <Link className="ep-button secondary" href={`/platform/certificate/${certificate.id}`}>查看详情</Link>
                    {state.role === "student" && (enrollment ? <Tag tone={enrollment.status === "已驳回" ? "danger" : "success"}>{enrollment.status}</Tag> : <Btn disabled={certificate.status !== "报名中"} onClick={() => {
                      if (certificate.status !== "报名中") return notify("当前证书未开放报名");
                      enrollCertificate({
                        id: crypto.randomUUID(),
                        certificateId: certificate.id,
                        studentId: state.activeStudentId,
                        status: "待审核",
                        submittedAt: nowLabel(),
                        note: "证书报名信息待审核",
                      });
                      notify("证书报名已提交");
                    }}>立即报名</Btn>)}
                  </div>
                </Card>
              );
            })}
            {certificates.length === 0 && <Card><Empty>当前筛选下没有证书资源。</Empty></Card>}
          </div>
          <div className="ep-split ep-certificate-personal">
            <Card>
              <h2>我的证书</h2>
              {state.certificates.length === 0 ? <Empty>通过岗位测评和场景实操后可获得平台凭证。</Empty> : state.certificates.map((certificate) => (
                <div className="ep-row" key={certificate.id}><div className="ep-grow"><b>{(certificate.definitionId ? state.platformAdmin.certificates.find((item) => item.id === certificate.definitionId)?.name : undefined) ?? `${jobById(certificate.jobId)?.name ?? "岗位实战"}结业凭证`}</b><p>{certificate.number}</p></div><Tag tone="success">{certificate.issuedAt}</Tag></div>
              ))}
              {eligibility.certificate && <CertificateCard certificate={eligibility.certificate} />}
            </Card>
            <Card>
              <h2>报名状态</h2>
              {state.platformAdmin.enrollments.filter((item) => item.studentId === state.activeStudentId).length === 0
                ? <Empty>暂无证书报名记录。</Empty>
                : state.platformAdmin.enrollments.filter((item) => item.studentId === state.activeStudentId).map((enrollment) => {
                  const certificate = state.platformAdmin.certificates.find((item) => item.id === enrollment.certificateId);
                  return <div className="ep-row" key={enrollment.id}><div className="ep-grow"><b>{certificate?.name ?? enrollment.certificateId}</b><p>{enrollment.note}</p></div><Tag tone={enrollment.status === "已驳回" ? "danger" : enrollment.status === "已通过" ? "success" : "warning"}>{enrollment.status}</Tag></div>;
                })}
            </Card>
          </div>
        </div>
      )}
    </>
  );
}

export function CertificateDetail({ id }: { id: string }) {
  const { enrollCertificate, jobById, notify, state } = useWorkspacePage();
  const certificate = state.platformAdmin.certificates.find((item) => item.id === id);
  if (!certificate) return <Empty>证书资源不存在。</Empty>;
  const enrollment = state.platformAdmin.enrollments.find((item) => item.certificateId === certificate.id && item.studentId === state.activeStudentId);
  return (
    <div className="ep-split">
      <Card className="ep-credential-card">
        <span className="ep-credential-mark">{certificate.category}</span>
        <Tag tone={certificate.sample ? "warning" : "success"}>{certificate.sample ? "演示认证" : "平台凭证"}</Tag>
        <h1>{certificate.name}</h1>
        <p>{certificate.issuer}</p>
        <div className="ep-detail-meta"><span>{certificate.level}</span><span>{certificate.examDate}</span></div>
      </Card>
      <Card>
        <h2>报名与考核</h2>
        <p><b>报考条件</b>{certificate.condition}</p>
        <p><b>考核形式</b>{certificate.format}</p>
        <p><b>关联岗位</b>{certificate.jobIds.map((jobId) => jobById(jobId)?.name ?? jobId).join(" / ")}</p>
        <p><b>关联能力点</b>{certificate.abilityCount} 个</p>
        <h2>认定流程</h2>
        <div className="ep-objectives">
          {["核验报考条件与报名材料", "完成对应岗位场景任务", "参加理论或实操考核", "管理机构复核并发放证书"].map((item, index) => <span key={item}><i>{index + 1}</i>{item}</span>)}
        </div>
        <h2>报名状态</h2>
        {enrollment ? <><Tag tone={enrollment.status === "已驳回" ? "danger" : enrollment.status === "已通过" ? "success" : "warning"}>{enrollment.status}</Tag><p>{enrollment.note}</p></> : (
          <Btn disabled={certificate.status !== "报名中" || state.role !== "student"} onClick={() => {
            enrollCertificate({ id: crypto.randomUUID(), certificateId: certificate.id, studentId: state.activeStudentId, status: "待审核", submittedAt: nowLabel(), note: "证书报名信息待审核" });
            notify("证书报名已提交");
          }}>立即报名</Btn>
        )}
      </Card>
    </div>
  );
}

export function EvaluationMethodView({ id }: { id: string }) {
  const { state } = useWorkspacePage();
  const method = state.evaluationMethodCatalog.find((item) => item.id === id);
  if (!method) return <Empty>测评方式不存在。</Empty>;
  return (
    <Card>
      <Tag>测评方式</Tag><h1>{method.name}</h1>
      <p>{method.form} · {method.duration}</p>
      <h2>适用场景</h2><p>{method.use}</p>
      <h2>实施步骤</h2>
      <div className="ep-objectives">
        {["明确测评目标与合格线", "发布任务或试卷并说明规则", "学生提交答案、过程或成果", "按评价标准评分并记录证据", "回写能力画像与认定结果"].map((item, index) => <span key={item}><i>{index + 1}</i>{item}</span>)}
      </div>
    </Card>
  );
}

function CertificateCard({ certificate }: { certificate: { number: string; issuedAt: string; jobId: string } }) {
  const { jobById, state } = useWorkspacePage();
  return (
    <Card className="ep-certificate">
      <Tag>场景化产教融合平台</Tag>
      <h2>岗位实战结业凭证</h2><h1>{state.resume.name}</h1>
      <p>完成{jobById(certificate.jobId)?.name ?? "岗位"}实训与综合测评</p>
      <small>{certificate.number} · {certificate.issuedAt}</small>
      <Btn secondary onClick={() => window.print()}><Download size={16} />打印凭证</Btn>
    </Card>
  );
}

export function ExamView({ id }: { id?: string }) {
  const {
  accessibleAssessmentList,
  answers,
  assessment,
  jobById,
  notify,
  searchParams,
  setAnswers,
  state,
  submitExam,
  } = useWorkspacePage();
  const [started, setStarted] = useState(false);
  const [remaining, setRemaining] = useState(30 * 60);
  useEffect(() => {
    if (!started) return;
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [started]);
  if (state.role !== "student") return <Empty>学生登录后可参加测评。</Empty>;
  if (accessibleAssessmentList.length === 0) return <Empty>测评尚未完成权属确认或当前不可用于教学。</Empty>;
  const activeAssessment = id ? accessibleAssessmentList.find((item) => item.id === id) : assessment;
  if (!activeAssessment) return <Empty>测评不存在或当前不可用于教学。</Empty>;
  const practiceMode = searchParams.get("mode") === "practice" || activeAssessment.kind === "题库";
  const availability = assessmentAvailability(state, activeAssessment);
  const latest = state.examAttempts
    .filter(
      (item) =>
        item.studentId === state.activeStudentId &&
        item.assessmentId === activeAssessment.id,
    )
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0];
  const totalQuestionScore = activeAssessment.questions.reduce(
    (sum, question) => sum + (question.score ?? Math.round(100 / Math.max(1, activeAssessment.questions.length))),
    0,
  );
  const questionTypeStats = Object.entries(
    activeAssessment.questions.reduce<Record<string, { count: number; score: number }>>((groups, question) => {
      const type = question.type ?? "单选";
      const score = question.score ?? Math.round(100 / Math.max(1, activeAssessment.questions.length));
      groups[type] = {
        count: (groups[type]?.count ?? 0) + 1,
        score: (groups[type]?.score ?? 0) + score,
      };
      return groups;
    }, {}),
  );
  const answered = Object.keys(answers).length;
  if (!started) {
    const schedule = availability.schedule;
    return (
      <div className="ep-exam-intro">
        <section className="ep-detail-hero">
          <div>
            <div className="ep-chips"><Tag>{activeAssessment.kind === "题库" ? "岗位题库" : "岗位能力测评"}</Tag><Tag>{activeAssessment.questions.length} 题</Tag><Tag>{activeAssessment.passScore} 分合格</Tag></div>
            <h1>{activeAssessment.name}</h1>
            <p>{jobById(activeAssessment.jobId)?.name ?? "关联岗位"} · {schedule?.name ?? (practiceMode ? "随到随练" : "统一测评")}</p>
          </div>
        </section>
        <div className="ep-split">
          <Card>
            <h2>考试概览</h2>
            <div className="ep-stats ep-exam-stats">
              <Metric label="考试时长" value={`${activeAssessment.durationMinutes} 分钟`} />
              <Metric label="题目数量" value={activeAssessment.questions.length} />
              <Metric label="总成绩" value="100" />
              <Metric label="合格线" value={activeAssessment.passScore} />
            </div>
            <h2>题型构成</h2>
            {questionTypeStats.map(([type, stat]) => <div className="ep-row" key={type}><span className="ep-grow">{type === "单选" ? "单选题" : type === "判断" ? "判断题" : type}</span><Tag>{stat.count} 题</Tag><small>{Math.round(stat.score / Math.max(1, totalQuestionScore) * 100)}%</small></div>)}
          </Card>
          <Card>
            <h2>考试须知</h2>
            <div className="ep-objectives">
              {[practiceMode ? "练习成绩不计入结业凭证。" : "在规定时间内完成全部题目，超时自动交卷。", "答题过程自动保存，刷新后仍会保留。", "提交后不可修改，请在交卷前检查答题卡。", "测评结果将回写岗位能力画像。"].map((item, index) => <span key={item}><i>{index + 1}</i>{item}</span>)}
            </div>
            {latest && <div className="ep-result"><b>最近成绩 {latest.score} 分</b><Tag tone={latest.passed ? "success" : "warning"}>{latest.passed ? "已通过" : "未通过"}</Tag></div>}
            {availability.available
              ? <Btn onClick={() => { setStarted(true); setRemaining(activeAssessment.durationMinutes * 60); }}>{practiceMode ? "开始刷题" : "开始考试"}</Btn>
              : <Btn disabled title={availability.reason}>{availability.reason}</Btn>}
          </Card>
        </div>
      </div>
    );
  }
  return (
    <div className="ep-exam-paper">
      <Card>
        <div className="ep-exam-head">
          <div><small>岗位能力测评</small><h1>{activeAssessment.name}</h1></div>
          <div><b>{String(Math.floor(remaining / 60)).padStart(2, "0")}:{String(remaining % 60).padStart(2, "0")}</b><span>已答 {answered}/{activeAssessment.questions.length}</span></div>
        </div>
        {activeAssessment.questions.map((question, index) => (
          <div className="ep-question" id={`exam-question-${index}`} key={question.id}>
            <div className="ep-question-head"><span>{String(index + 1).padStart(2, "0")}</span><h2>{question.title}</h2><Tag>{question.type ?? "单选"}</Tag></div>
            {question.options.map((option, optionIndex) => <label className={answers[index] === optionIndex ? "selected" : ""} key={option}><input type="radio" name={question.id} checked={answers[index] === optionIndex} onChange={() => setAnswers({ ...answers, [index]: optionIndex })} />{option}</label>)}
          </div>
        ))}
        <div className="ep-actions">
          <Btn onClick={() => {
            if (Object.keys(answers).length < activeAssessment.questions.length) return notify("请完成全部题目");
            const score = Math.round(activeAssessment.questions.filter((question, index) => answers[index] === question.answer).length / Math.max(1, activeAssessment.questions.length) * 100);
            submitExam(
              score,
              activeAssessment.questions.map((_, index) => answers[index] ?? -1),
              activeAssessment.jobId,
              activeAssessment.id,
              activeAssessment.name,
              activeAssessment.kind ?? "试卷",
              activeAssessment.passScore,
            );
            setAnswers({});
            setStarted(false);
            notify(`${practiceMode ? "刷题" : "测评"}完成，成绩 ${score} 分`);
          }}>交卷评分</Btn>
          <Btn secondary onClick={() => setStarted(false)}>暂存并退出</Btn>
        </div>
        {latest && <div className="ep-result"><b>最近成绩 {latest.score} 分</b><Tag tone={latest.passed ? "success" : "warning"}>{latest.passed ? "已通过" : "未通过"}</Tag></div>}
      </Card>
      <aside className="ep-answer-card">
        <h3>答题卡</h3>
        <div>{activeAssessment.questions.map((_, index) => <button className={answers[index] !== undefined ? "answered" : ""} onClick={() => document.getElementById(`exam-question-${index}`)?.scrollIntoView({ behavior: "smooth", block: "center" })} key={index}>{index + 1}</button>)}</div>
        <p><span />已答 {answered}<span />未答 {activeAssessment.questions.length - answered}</p>
      </aside>
    </div>
  );
}
