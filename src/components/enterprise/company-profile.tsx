"use client";

import type { ReactNode } from "react";
import { IndustryHero } from "@/components/enterprise/industry-hero";

const companyMetrics = [
  { value: "2003", label: "公司成立" },
  { value: "430+", label: "知识产权" },
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
          description: "科来成立于 2003 年，长期专注网络流量采集与分析；面向数字经济与 AI 时代，将全流量、高保真回溯、云网可观测与 AI 能力组织为服务关键行业的可观测性基础设施。",
          primaryLabel: "了解科来资源",
          secondaryLabel: "查看发展历程",
        }}
        showStageLabels={false}
      />

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
