"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { BadgeCheck, Cpu, Gauge, Globe2, type LucideIcon } from "lucide-react";
import { IndustryHero } from "@/components/enterprise/industry-hero";

const companyMetrics = [
  { value: "2003", label: "公司成立" },
  { value: "20+", label: "年技术沉淀" },
  { value: "430+", label: "核心知识产权" },
  { value: "160+", label: "500 强客户" },
];

const strengths: Array<{
  icon: LucideIcon;
  value: string;
  title: string;
  detail: string;
}> = [
  {
    icon: Cpu,
    value: "430+",
    title: "自主研发",
    detail: "核心知识产权积累，国家知识产权示范企业。",
  },
  {
    icon: Gauge,
    value: "200Gbps",
    title: "高性能处理",
    detail: "流量处理能力持续突破，实现全栈国产化 100Gbps。",
  },
  {
    icon: Globe2,
    value: "110+",
    title: "全球服务",
    detail: "服务 110+ 国家和地区、10,000+ 商业客户。",
  },
  {
    icon: BadgeCheck,
    value: "8 年",
    title: "行业认可",
    detail: "2018—2025 连续八年 IDC 相关市场领先。",
  },
];

const milestones = [
  {
    phase: "2003—2009",
    title: "成立与全球化起步",
    detail: "从网络流量分析出发，产品进入全球 46 个国家和地区。",
  },
  {
    phase: "2010—2012",
    title: "全流量与回溯分析",
    detail: "提出全流量与回溯分析理念，让故障窗口可被完整还原。",
  },
  {
    phase: "2013—2017",
    title: "企业级数据中心",
    detail: "从专业分析工具走向企业级数据中心运行保障。",
  },
  {
    phase: "2018—2020",
    title: "国际认可与标准参与",
    detail: "进入 Gartner 相关市场视野，持续参与行业标准建设。",
  },
  {
    phase: "2021—2022",
    title: "云网可观测与产品扩展",
    detail: "发布云魔方与混天绫，形成云上云下协同的分析能力。",
  },
  {
    phase: "2023",
    title: "知识产权与市场认可",
    detail: "获评国家知识产权示范企业，核心知识产权达到 430+。",
  },
  {
    phase: "2024—2025",
    title: "AI 与高性能突破",
    detail: "全栈产品 AI 赋能，流量处理能力突破 200Gbps。",
  },
];

export function CompanyProfile({
  industrySection,
}: {
  industrySection?: ReactNode;
}) {
  return (
    <div className="ep-company-page">
      <IndustryHero
        metrics={companyMetrics}
        onViewGroups={() => {
          document.getElementById("company-history")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        copy={{
          kicker: "ABOUT COLASOFT · OBSERVABILITY SINCE 2003",
          title: "科来网络",
          highlight: "",
          description: "科来网络成立于 2003 年，持续深耕网络流量采集与分析。二十余年间，从全流量与回溯分析走向云网可观测和 AI 可观测，为金融、能源、运营商、智能制造等关键行业提供高保真数据底座。",
          primaryLabel: "了解科来资源",
          secondaryLabel: "查看发展历程",
        }}
        showStageLabels={false}
      />

      <section className="ep-company-section ep-company-strengths" aria-labelledby="company-strengths-title">
        <div className="ep-company-strength-visual">
          <Image
            src="/brand/colasoft-company-strength.webp"
            alt="面向 AI 时代的网络数据流与可观测性基础设施"
            fill
            sizes="(max-width: 1180px) 100vw, 42vw"
          />
          <div className="ep-company-visual-caption">
            <span>FROM FLOW DATA TO AI OBSERVABILITY</span>
            <strong>让复杂运行数据成为可信事实</strong>
          </div>
        </div>
        <div className="ep-company-strength-copy">
          <div className="ep-company-strength-head">
            <span>COMPANY STRENGTH</span>
            <h2 id="company-strengths-title">长期研发，持续进入关键行业</h2>
            <p>从流量采集、回溯分析到云网与 AI 可观测，技术能力沿着真实业务复杂度持续生长。</p>
          </div>
          <div className="ep-company-strength-grid">
            {strengths.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title}>
                  <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
                  <strong>{item.value}</strong>
                  <b>{item.title}</b>
                  <p>{item.detail}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="ep-company-section ep-company-story" id="company-history">
        <div className="ep-company-section-lead">
          <span>2003—2026</span>
          <h2>围绕流量价值，持续演进</h2>
          <p>从网络流量采集与分析出发，科来持续拓展全流量回溯、云网可观测与 AI 诊断能力，让复杂网络问题可还原、可解释、可复核。</p>
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

      {industrySection && (
        <section className="ep-company-section ep-company-industry" id="industry-analysis">
          {industrySection}
        </section>
      )}
    </div>
  );
}
