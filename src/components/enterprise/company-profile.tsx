"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Database,
  GraduationCap,
  Network,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

export type CompanyResourceSummary = {
  jobs: number;
  scenes: number;
  courses: number;
  assessments: number;
  projects: number;
  openings: number;
};

const companyMetrics = [
  { value: "2003", label: "公司成立" },
  { value: "430+", label: "核心知识产权" },
  { value: "110+", label: "国家和地区" },
  { value: "10000+", label: "商业客户" },
];

const milestones = [
  {
    phase: "2003",
    title: "从流量分析出发",
    detail: "长期专注于网络流量采集与分析技术。",
  },
  {
    phase: "2010",
    title: "全流量与回溯分析",
    detail: "让故障时间窗可以被完整还原和复核。",
  },
  {
    phase: "2021—2022",
    title: "云网可观测与 AIOps",
    detail: "能力从单点分析延伸到云上云下与智能运维。",
  },
  {
    phase: "2024—2025",
    title: "AI 与高性能突破",
    detail: "以数据底座支撑 AI 诊断和更大规模运行场景。",
  },
];

const capabilitySteps = [
  { name: "采集", detail: "全流量与云网数据", icon: Network },
  { name: "解析", detail: "协议与业务语义", icon: Database },
  { name: "回溯", detail: "故障窗口与会话事实", icon: Workflow },
  { name: "关联", detail: "交易、告警与链路", icon: ShieldCheck },
  { name: "AI 诊断", detail: "证据驱动的智能分析", icon: Sparkles },
];

export function CompanyEntry() {
  return (
    <Link
      className="ep-company-entry"
      href="/platform/industry/company"
      aria-label="了解科来网络企业介绍"
    >
      <span className="ep-company-entry-signal" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="ep-company-entry-brand">
        <span className="ep-company-entry-logo">
          <Image src="/brand/colasoft-logo.png" alt="" width={28} height={26} />
        </span>
        <span>
          <small>ABOUT COLASOFT</small>
          <strong>科来网络 · 企业介绍</strong>
        </span>
      </span>
      <span className="ep-company-entry-copy">
        <strong>从高保真流量分析，走向 AI 时代的可观测性基础设施</strong>
        <small>连接真实产业现场、专业软件与人才培养。</small>
      </span>
      <span className="ep-company-entry-facts" aria-label="科来企业信息">
        <span><b>2003</b><small>成立</small></span>
        <span><b>430+</b><small>知识产权</small></span>
        <span><b>110+</b><small>国家和地区</small></span>
      </span>
      <span className="ep-company-entry-action">
        了解科来
        <ArrowRight size={16} aria-hidden="true" />
      </span>
    </Link>
  );
}

export function CompanyProfile({ resources }: { resources: CompanyResourceSummary }) {
  return (
    <div className="ep-company-page">
      <section className="ep-company-hero" aria-labelledby="company-hero-title">
        <div className="ep-company-hero-grid" aria-hidden="true" />
        <div className="ep-company-hero-inner">
          <div className="ep-company-hero-copy">
            <span className="ep-company-kicker">ABOUT COLASOFT · SINCE 2003</span>
            <h1 id="company-hero-title">
              让真实运行数据，
              <span>成为人才培养的底座</span>
            </h1>
            <p>
              科来从网络流量采集与分析起步，持续走向云网可观测、AIOps 与 AI
              诊断，把关键行业的真实运行事实带进学习现场。
            </p>
            <div className="ep-company-hero-actions">
              <Link className="ep-company-primary" href="/platform/resources">
                探索岗位与场景
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
              <Link className="ep-company-secondary" href="/platform/industry">
                <ArrowLeft size={15} aria-hidden="true" />
                返回产业链
              </Link>
            </div>
          </div>

          <div className="ep-company-hero-visual" aria-hidden="true">
            <Image
              className="ep-company-visual-image"
              src="/brand/colasoft-observability-hero.webp"
              alt=""
              fill
              priority
              sizes="(max-width: 1020px) 1px, min(68vw, 980px)"
            />
          </div>
        </div>

        <ul className="ep-company-metrics" aria-label="科来企业概览">
          {companyMetrics.map((metric) => (
            <li key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="ep-company-section ep-company-story">
        <div className="ep-company-section-lead">
          <span>2003—2026</span>
          <h2>围绕数据价值，持续演进</h2>
          <p>从流量分析工具到可观测性基础设施，科来的能力始终建立在可检索、可复核的运行事实之上。</p>
        </div>
        <ol className="ep-company-timeline">
          {milestones.map((item, index) => (
            <li key={item.phase}>
              <span className="ep-company-timeline-index">{String(index + 1).padStart(2, "0")}</span>
              <time>{item.phase}</time>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="ep-company-section ep-company-capabilities">
        <div className="ep-company-section-heading">
          <div>
            <span>DATA TO DECISION</span>
            <h2>一条从现场事实到智能判断的能力链</h2>
          </div>
          <p>保留数据上下文，再进入诊断、复盘与持续治理。</p>
        </div>
        <ol className="ep-company-capability-flow">
          {capabilitySteps.map((item, index) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <span className="ep-company-capability-icon">
                  <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <span className="ep-company-capability-order">{String(index + 1).padStart(2, "0")}</span>
                <strong>{item.name}</strong>
                <small>{item.detail}</small>
              </li>
            );
          })}
        </ol>
        <div className="ep-company-capability-tags" aria-label="相关能力方向">
          <span>全流量</span>
          <span>云网可观测</span>
          <span>业务性能</span>
          <span>AIOps</span>
          <span>AI 安全数据分析</span>
        </div>
      </section>

      <section className="ep-company-section ep-company-purpose">
        <div className="ep-company-purpose-copy">
          <span>FROM INDUSTRY TO LEARNING</span>
          <h2>把科来能力，转化为可教、可练、可评价的学习现场</h2>
          <p>
            平台以真实岗位为起点，用脱敏业务场景组织练习，再以证据、推理和交付完成评价，帮助学生形成可被产业识别的能力画像。
          </p>
        </div>
        <ol className="ep-company-learning-loop" aria-label="平台学习闭环">
          {[
            ["岗位标准", BriefcaseBusiness],
            ["场景实训", Network],
            ["测评认证", ShieldCheck],
            ["项目与就业", GraduationCap],
          ].map(([label, Icon], index) => {
            const StepIcon = Icon as typeof BriefcaseBusiness;
            return (
              <li key={String(label)}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <StepIcon size={22} strokeWidth={1.6} aria-hidden="true" />
                <strong>{String(label)}</strong>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="ep-company-section ep-company-resources" id="company-resources">
        <div className="ep-company-section-heading">
          <div>
            <span>WHAT YOU CAN USE</span>
            <h2>科来能为学生提供什么</h2>
          </div>
          <p>从进入真实软件，到完成一张能力凭证。</p>
        </div>

        <div className="ep-company-resource-grid">
          <article className="ep-company-resource-card resource-lab">
            <span className="ep-company-resource-icon"><Network size={21} strokeWidth={1.6} /></span>
            <h3>真实软件与实训环境</h3>
            <p>在专业软件中分析脱敏流量、还原业务链路并提交可复核成果。</p>
            <div className="ep-company-resource-facts">
              <strong>{resources.scenes}</strong>
              <span>个真实业务场景</span>
            </div>
            <Link href="/platform/resources">
              进入资源馆 <ArrowUpRight size={15} />
            </Link>
          </article>

          <article className="ep-company-resource-card resource-map">
            <span className="ep-company-resource-icon"><BriefcaseBusiness size={21} strokeWidth={1.6} /></span>
            <h3>岗位、场景与学习路径</h3>
            <p>沿着产业链看清岗位能力，把课程、短训与场景任务串成路径。</p>
            <div className="ep-company-resource-facts multi">
              <span><strong>{resources.jobs}</strong> 个岗位</span>
              <span><strong>{resources.courses}</strong> 门课程</span>
            </div>
            <Link href="/platform/resources">
              查看岗位与场景 <ArrowUpRight size={15} />
            </Link>
          </article>

          <article className="ep-company-resource-card resource-proof">
            <span className="ep-company-resource-icon"><ShieldCheck size={21} strokeWidth={1.6} /></span>
            <h3>测评、证书与能力评价</h3>
            <p>依据岗位指标完成测评，用证据、推理与交付获得能力反馈。</p>
            <div className="ep-company-resource-facts multi">
              <span><strong>{resources.assessments}</strong> 项测评</span>
              <span>CSNA 认证体系</span>
            </div>
            <Link href="/platform/assessment">
              查看测评与证书 <ArrowUpRight size={15} />
            </Link>
          </article>

          <article className="ep-company-resource-card resource-career">
            <span className="ep-company-resource-icon"><BookOpen size={21} strokeWidth={1.6} /></span>
            <h3>产业项目与就业连接</h3>
            <p>用企业课题检验学习成果，并把完成的项目与岗位机会连接起来。</p>
            <div className="ep-company-resource-facts multi">
              <span><strong>{resources.projects}</strong> 个产业项目</span>
              <span><strong>{resources.openings}</strong> 个岗位机会</span>
            </div>
            <div className="ep-company-resource-actions">
              <Link href="/platform/projects">查看产业项目</Link>
              <Link href="/platform/employment">进入就业服务</Link>
            </div>
          </article>
        </div>
      </section>

      <section className="ep-company-cta" aria-labelledby="company-cta-title">
        <div>
          <span>CONTINUE THE JOURNEY</span>
          <h2 id="company-cta-title">从了解科来，到走进产业链</h2>
          <p>选择一个岗位，开始一段由真实业务问题驱动的学习。</p>
        </div>
        <div className="ep-company-cta-actions">
          <Link className="ep-company-primary" href="/platform/resources">
            探索岗位与场景
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link className="ep-company-cta-link" href="/platform/industry">
            返回产业链
          </Link>
        </div>
      </section>
    </div>
  );
}
