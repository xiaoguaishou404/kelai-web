"use client";

import Link from "next/link";
import {
  Activity,
  ArrowDown,
  ArrowUpRight,
  BriefcaseBusiness,
  GraduationCap,
  Network,
  ShieldCheck,
} from "lucide-react";

export type IndustryHeroMetric = {
  label: string;
  value: string | number;
};

type IndustryHeroProps = {
  metrics: IndustryHeroMetric[];
  onViewGroups: () => void;
};

const metricIcons = [Network, BriefcaseBusiness, GraduationCap, ShieldCheck];

export function IndustryHero({ metrics, onViewGroups }: IndustryHeroProps) {
  return (
    <section className="ep-industry-hero" aria-labelledby="industry-hero-title">
      <div className="ep-industry-hero-grid" aria-hidden="true" />
      <div className="ep-industry-hero-halo" aria-hidden="true" />
      <div className="ep-industry-hero-inner">
        <div className="ep-industry-hero-copy">
          <span className="ep-industry-hero-kicker">
            <i aria-hidden="true" />
            INDUSTRY CHAIN
          </span>
          <h1 id="industry-hero-title">
            沿着产业链，
            <span>找到专业群的位置</span>
          </h1>
          <p>从采集基础设施、分析研判到技术服务，连接科来岗位能力与院校专业群。</p>
          <div className="ep-industry-hero-actions">
            <Link className="ep-industry-hero-primary" href="/platform/resources">
              探索岗位与场景
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            <button className="ep-industry-hero-secondary" type="button" onClick={onViewGroups}>
              查看适配专业群
              <ArrowDown size={16} aria-hidden="true" />
            </button>
          </div>
          <ul className="ep-industry-hero-metrics" aria-label="产业链概览">
            {metrics.map((metric, index) => {
              const Icon = metricIcons[index] ?? Network;
              return (
                <li key={metric.label}>
                  <span className="ep-industry-metric-icon">
                    <Icon size={15} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <span className="ep-industry-metric-copy">
                    <small>{metric.label}</small>
                    <strong>{metric.value}</strong>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="ep-industry-hero-stage" aria-hidden="true">
          <svg className="ep-industry-hero-scene" viewBox="0 0 820 540" focusable="false">
            <defs>
              <linearGradient id="industry-base-top" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#f4fbff" stopOpacity=".36" />
                <stop offset=".52" stopColor="#a7c8f4" stopOpacity=".18" />
                <stop offset="1" stopColor="#4c7ed5" stopOpacity=".12" />
              </linearGradient>
              <linearGradient id="industry-base-left" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#315ba9" stopOpacity=".52" />
                <stop offset="1" stopColor="#21417f" stopOpacity=".18" />
              </linearGradient>
              <linearGradient id="industry-base-right" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#8eb8ea" stopOpacity=".34" />
                <stop offset="1" stopColor="#527cc0" stopOpacity=".16" />
              </linearGradient>
              <linearGradient id="industry-object-light" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffffff" stopOpacity=".96" />
                <stop offset="1" stopColor="#c4e7f2" stopOpacity=".8" />
              </linearGradient>
              <linearGradient id="industry-object-left" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#6f9bd9" stopOpacity=".9" />
                <stop offset="1" stopColor="#315c9f" stopOpacity=".76" />
              </linearGradient>
              <linearGradient id="industry-object-right" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#b4dce8" stopOpacity=".92" />
                <stop offset="1" stopColor="#6594ba" stopOpacity=".78" />
              </linearGradient>
              <linearGradient id="industry-flow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#b8e9ff" stopOpacity=".2" />
                <stop offset=".48" stopColor="#e8ffff" stopOpacity=".86" />
                <stop offset="1" stopColor="#87e1d2" stopOpacity=".48" />
              </linearGradient>
              <radialGradient id="industry-core-glow">
                <stop offset="0" stopColor="#d6fff8" stopOpacity=".36" />
                <stop offset=".55" stopColor="#a9e6eb" stopOpacity=".12" />
                <stop offset="1" stopColor="#8ab3ec" stopOpacity="0" />
              </radialGradient>
              <filter id="industry-glow-filter" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g className="ep-industry-scene-ambient">
              <ellipse className="ep-industry-ambient-ring ring-one" cx="430" cy="270" rx="286" ry="158" />
              <ellipse className="ep-industry-ambient-ring ring-two" cx="430" cy="270" rx="214" ry="116" />
              <path className="ep-industry-ambient-arc" d="M106 248c78-108 226-157 372-117 100 28 182 98 242 176" />
              <path className="ep-industry-ambient-arc arc-two" d="M112 410c139 79 354 86 588-8" />
            </g>

            <g className="ep-industry-base">
              <polygon className="ep-industry-base-side-left" points="115,312.5 430,470 430,494 115,336.5" />
              <polygon className="ep-industry-base-side-right" points="430,470 745,312.5 745,336.5 430,494" />
              <polygon className="ep-industry-base-top" points="115,312.5 430,155 745,312.5 430,470" />
              <g className="ep-industry-base-grid">
                <path d="M486.7 183.4 171.7 340.9M543.4 211.7 228.4 369.2M600.1 240.1 285.1 397.6M656.8 268.4 341.8 425.9M713.5 296.8 398.5 454.3" />
                <path d="M373.3 183.4 688.3 340.9M316.6 211.7 631.6 369.2M259.9 240.1 574.9 397.6M203.2 268.4 518.2 425.9M146.5 296.8 461.5 454.3" />
              </g>
              <path className="ep-industry-base-outline" d="M115 312.5 430 155 745 312.5 430 470Z" />
            </g>

            <path
              className="ep-industry-main-route"
              d="M270 320C325 303 380 281 430 260S535 303 590 320"
            />
            <path
              className="ep-industry-main-route route-echo"
              d="M270 320C325 303 380 281 430 260S535 303 590 320"
            />

            <g className="ep-industry-route-tokens">
              <g className="ep-industry-route-token token-one">
                <circle r="4" />
                <circle className="token-glow" r="11" />
              </g>
              <g className="ep-industry-route-token token-two">
                <circle r="3" />
                <circle className="token-glow" r="9" />
              </g>
              <g className="ep-industry-route-token token-three">
                <circle r="3.5" />
                <circle className="token-glow" r="10" />
              </g>
            </g>

            <g className="ep-industry-outcome-links">
              <path d="M430 164C492 137 545 118 602 108" />
              <path d="M454 185C548 166 638 174 710 190" />
              <circle cx="542" cy="131" r="3" />
              <circle cx="581" cy="173" r="3" />
            </g>
            <g className="ep-industry-outcomes">
              <g className="ep-industry-outcome outcome-jobs">
                <path d="M558 89 602 66 646 89 602 112Z" />
                <text x="602" y="93" textAnchor="middle">岗位能力</text>
              </g>
              <g className="ep-industry-outcome outcome-groups">
                <path d="M666 170 710 147 754 170 710 193Z" />
                <text x="710" y="174" textAnchor="middle">专业群适配</text>
              </g>
            </g>

            <g className="ep-industry-stations">
              <g className="ep-industry-station station-collect">
                <polygon className="station-pad-top" points="198,320 270,284 342,320 270,356" />
                <polygon className="station-pad-left" points="198,320 270,356 270,364 198,328" />
                <polygon className="station-pad-right" points="270,356 342,320 342,328 270,364" />
                <g className="station-object collect-object">
                  <polygon className="object-top" points="228,262 270,234 312,262 270,290" />
                  <polygon className="object-left" points="228,262 270,290 270,348 228,320" />
                  <polygon className="object-right" points="270,290 312,262 312,320 270,348" />
                  <polygon className="object-inset" points="246,261 270,249 294,261 270,273" />
                  <polygon className="object-detail" points="239,286 259,296 259,324 239,314" />
                  <path className="object-detail" d="M244 299h10M244 307h8M244 315h6M272 287 290 278M272 299 294 288M272 311 286 304" />
                  <path className="collector-mast" d="M270 234V198" />
                  <circle className="collector-signal signal-one" cx="270" cy="192" r="6" />
                  <circle className="collector-signal signal-two" cx="270" cy="192" r="15" />
                  <circle className="collector-signal signal-three" cx="270" cy="192" r="24" />
                  <path className="collector-link" d="M270 217 231 238M270 217 309 238" />
                </g>
                <text className="scene-label" x="198" y="390">01　采集基础设施</text>
              </g>

              <g className="ep-industry-station station-analyze">
                <ellipse className="station-core-glow" cx="430" cy="260" rx="120" ry="64" />
                <polygon className="station-pad-top center-pad" points="350,260 430,220 510,260 430,300" />
                <polygon className="station-pad-left" points="350,260 430,300 430,308 350,268" />
                <polygon className="station-pad-right" points="430,300 510,260 510,268 430,308" />
                <g className="station-object analyze-object">
                  <polygon className="core-top" points="374,192 430,164 486,192 430,220" />
                  <polygon className="core-left" points="374,192 430,220 430,288 374,260" />
                  <polygon className="core-right" points="430,220 486,192 486,260 430,288" />
                  <polygon className="core-inset" points="402,192 430,179 458,192 430,205" />
                  <path className="core-wave" d="M388 236h12l7-12 10 28 10-25 9 20 8-16 8 8h8" />
                  <path className="core-beam" d="M430 164V82" />
                  <circle className="core-signal" cx="430" cy="76" r="4" />
                </g>
                <text className="scene-label analyze-label" x="350" y="338">02　分析研判</text>
              </g>

              <g className="ep-industry-station station-service">
                <polygon className="station-pad-top" points="518,320 590,284 662,320 590,356" />
                <polygon className="station-pad-left" points="518,320 590,356 590,364 518,328" />
                <polygon className="station-pad-right" points="590,356 662,320 662,328 590,364" />
                <g className="station-object service-object">
                  <polygon className="object-top" points="548,264 590,243 632,264 590,285" />
                  <polygon className="object-left service-left" points="548,264 590,285 590,341 548,320" />
                  <polygon className="object-right service-right" points="590,285 632,264 632,320 590,341" />
                  <polygon className="service-screen" points="558,282 581,293 581,325 558,314" />
                  <path className="service-screen-line" d="M563 292 575 298M563 300 577 307M563 308 573 313" />
                  <polygon className="service-handoff" points="600 251 618 242 636 252 618 261" />
                  <path className="service-path" d="M620 285c28 16 55 30 82 46" />
                  <circle className="service-node" cx="706" cy="334" r="4" />
                </g>
                <text className="scene-label service-label" x="518" y="390">03　技术服务</text>
              </g>
            </g>

            <g className="ep-industry-floating-shards">
              <polygon points="119,198 132,190 145,198 132,207" />
              <polygon points="691,181 708,171 725,181 708,192" />
              <polygon points="676,82 689,74 702,82 689,91" />
              <circle cx="149" cy="142" r="2.5" />
              <circle cx="723" cy="245" r="2" />
              <circle cx="530" cy="92" r="2" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
