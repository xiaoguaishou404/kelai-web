"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  Layers,
  Network,
  ShieldCheck,
} from "lucide-react";

export type ChannelHeroVariant = "courses" | "assessment" | "projects" | "employment";

export type ChannelHeroMetric = {
  label: string;
  value: string | number;
};

export type ChannelHeroAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  secondary?: boolean;
};

type ChannelHeroProps = {
  variant: ChannelHeroVariant;
  kicker: string;
  title: string;
  highlight?: string;
  description: string;
  metrics: ChannelHeroMetric[];
  actions?: ChannelHeroAction[];
};

const metricIcons: Record<ChannelHeroVariant, ReactNode[]> = {
  courses: [
    <BookOpen key="courses" size={15} strokeWidth={1.7} />,
    <Layers key="chapters" size={15} strokeWidth={1.7} />,
    <Activity key="scenes" size={15} strokeWidth={1.7} />,
    <GraduationCap key="paths" size={15} strokeWidth={1.7} />,
  ],
  assessment: [
    <ShieldCheck key="assessments" size={15} strokeWidth={1.7} />,
    <Layers key="standards" size={15} strokeWidth={1.7} />,
    <Activity key="questions" size={15} strokeWidth={1.7} />,
    <GraduationCap key="pass" size={15} strokeWidth={1.7} />,
  ],
  projects: [
    <Layers key="projects" size={15} strokeWidth={1.7} />,
    <Building2 key="companies" size={15} strokeWidth={1.7} />,
    <Network key="directions" size={15} strokeWidth={1.7} />,
    <BriefcaseBusiness key="deliverables" size={15} strokeWidth={1.7} />,
  ],
  employment: [
    <BriefcaseBusiness key="postings" size={15} strokeWidth={1.7} />,
    <Building2 key="companies" size={15} strokeWidth={1.7} />,
    <Network key="directions" size={15} strokeWidth={1.7} />,
    <Activity key="dimensions" size={15} strokeWidth={1.7} />,
  ],
};

const sceneTypes: Record<ChannelHeroVariant, "cards" | "path"> = {
  courses: "cards",
  assessment: "path",
  projects: "cards",
  employment: "path",
};

export function ChannelHero({
  variant,
  kicker,
  title,
  highlight,
  description,
  metrics,
  actions,
}: ChannelHeroProps) {
  const titleId = `channel-hero-${variant}-title`;
  const scene = sceneTypes[variant];
  const titleOnly = !highlight?.trim();

  return (
    <section className={`ep-channel-hero ep-full-bleed is-${variant}${titleOnly ? " is-title-only" : ""}`} aria-labelledby={titleId}>
      <div className="ep-channel-hero-grid" aria-hidden="true" />
      <div className="ep-channel-hero-orbit" aria-hidden="true" />
      <div className="ep-channel-hero-inner">
        <div className="ep-channel-hero-copy">
          <span className="ep-channel-hero-kicker">
            <i aria-hidden="true" />
            {kicker}
          </span>
          <h1 id={titleId}>
            {title}
            {!titleOnly && <span>{highlight}</span>}
          </h1>
          <p>{description}</p>
          {!!actions?.length && <div className="ep-channel-hero-actions">
            {actions.map((action) => {
              const content = (
                <>
                  {action.label}
                  {action.href ? (
                    <ArrowUpRight size={16} aria-hidden="true" />
                  ) : action.secondary ? (
                    <ArrowDown size={15} aria-hidden="true" />
                  ) : (
                    <ArrowUpRight size={16} aria-hidden="true" />
                  )}
                </>
              );
              return action.href ? (
                <Link
                  className={action.secondary ? "ep-channel-hero-secondary" : "ep-channel-hero-primary"}
                  href={action.href}
                  key={action.label}
                >
                  {content}
                </Link>
              ) : (
                <button
                  className={action.secondary ? "ep-channel-hero-secondary" : "ep-channel-hero-primary"}
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                >
                  {content}
                </button>
              );
            })}
          </div>}
          <ul className="ep-channel-hero-metrics" aria-label="频道概览">
            {metrics.map((metric, index) => (
              <li key={metric.label}>
                <span className="ep-channel-metric-icon">
                  {metricIcons[variant][index] ?? <Network size={15} strokeWidth={1.7} />}
                </span>
                <span className="ep-channel-metric-copy">
                  <small>{metric.label}</small>
                  <strong>{metric.value}</strong>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className={`ep-channel-hero-stage is-${scene}`} aria-hidden="true">
          {variant === "courses" || variant === "projects" ? (
            <CardScene variant={variant} />
          ) : (
            <PathScene variant={variant} />
          )}
        </div>
      </div>
    </section>
  );
}

function CardScene({ variant }: { variant: "courses" | "projects" }) {
  const isCourses = variant === "courses";
  return (
    <div className={`ep-channel-scene ep-channel-scene-${variant}`}>
      <div className="ep-channel-stage-grid" />
      <div className="ep-channel-stage-glow" />
      <svg className="ep-channel-stage-links" viewBox="0 0 790 500" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`channel-${variant}-link`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".12" />
            <stop offset=".5" stopColor="#dceeff" stopOpacity=".75" />
            <stop offset="1" stopColor="#88ddd1" stopOpacity=".58" />
          </linearGradient>
        </defs>
        <path d="M228 144C292 147 325 185 369 233" />
        <path d="M561 157C518 185 493 213 462 246" />
        <path d="M309 394C333 355 353 318 389 267" />
        <path className="is-ghost" d="M42 367C157 292 267 304 376 355S586 412 745 294" />
        <circle cx="369" cy="233" r="4.5" />
        <circle cx="462" cy="246" r="4.5" />
        <circle cx="389" cy="267" r="4.5" />
      </svg>
      <div className="ep-channel-orbit">
        <span />
        <span />
        <span />
      </div>

      <div className="ep-channel-card-world">
        {isCourses ? <CourseCards /> : <ProjectCards />}

        <div className="ep-channel-core">
          <div className="ep-channel-core-float">
            <div className="ep-channel-cube">
              <span className="cube-face cube-front">
                <i>{isCourses ? "课" : "项"}</i>
              </span>
              <span className="cube-face cube-back">
                <i>{isCourses ? "学" : "评"}</i>
              </span>
              <span className="cube-face cube-right">
                <i>{isCourses ? "练" : "交"}</i>
              </span>
              <span className="cube-face cube-left">
                <i>{isCourses ? "岗" : "岗"}</i>
              </span>
              <span className="cube-face cube-top">
                <i>{isCourses ? "场景" : "验收"}</i>
              </span>
              <span className="cube-face cube-bottom">
                <i>{isCourses ? "能力" : "交付"}</i>
              </span>
            </div>
            <span className="ep-channel-core-ring" />
          </div>
          <span className="ep-channel-core-label">
            {isCourses ? <BookOpen size={13} /> : <Layers size={13} />}
            {isCourses ? "课程中枢" : "项目工作台"}
          </span>
        </div>

        <span className="ep-channel-scene-node node-one">
          <i />
        </span>
        <span className="ep-channel-scene-node node-two">
          <i />
        </span>
        <span className="ep-channel-scene-node node-three">
          <i />
        </span>
      </div>
    </div>
  );
}

function CourseCards() {
  return (
    <>
      <article className="ep-channel-card ep-channel-card-main course-card-system">
        <header className="ep-channel-card-head">
          <div>
            <strong>课程体系</strong>
            <small>岗位能力 → 课程内容</small>
          </div>
          <BookOpen size={18} />
        </header>
        <div className="course-system-list">
          {[
            ["01", "协议与流量分析"],
            ["02", "采集与环境部署"],
            ["03", "性能诊断实务"],
          ].map(([index, label]) => (
            <div key={index}>
              <span>{index}</span>
              <b>{label}</b>
              <i />
            </div>
          ))}
        </div>
      </article>

      <article className="ep-channel-card course-card-guide">
        <header className="ep-channel-card-head">
          <div>
            <strong>章节导学</strong>
            <small>4 个学习环节</small>
          </div>
          <GraduationCap size={18} />
        </header>
        <div className="course-guide-track">
          {["任务导学", "方法讲解", "案例拆解", "实操复盘"].map((label, index) => (
            <div className={index < 2 ? "is-done" : ""} key={label}>
              <i>{index + 1}</i>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="ep-channel-card course-card-scene">
        <header className="ep-channel-card-head">
          <div>
            <strong>场景联动</strong>
            <small>课程进入真实任务</small>
          </div>
          <Activity size={18} />
        </header>
        <div className="course-scene-chain">
          <span>课程</span>
          <i />
          <span>场景</span>
          <i />
          <span>成果</span>
        </div>
      </article>
    </>
  );
}

function ProjectCards() {
  return (
    <>
      <article className="ep-channel-card ep-channel-card-main project-card-brief">
        <header className="ep-channel-card-head">
          <div>
            <strong>待接单工单</strong>
            <small>银行网点交易异常复盘</small>
          </div>
          <BriefcaseBusiness size={18} />
        </header>
        <div className="project-brief-meta">
          <span>
            <small>项目激励</small>
            <b>3,000 元/组</b>
          </span>
          <span>
            <small>团队规模</small>
            <b>4 人</b>
          </span>
        </div>
        <div className="project-brief-tags">
          <span>定位报告</span>
          <span>证据清单</span>
          <span>验证建议</span>
        </div>
      </article>

      <article className="ep-channel-card project-card-flow">
        <header className="ep-channel-card-head">
          <div>
            <strong>工单流转</strong>
            <small>从接单到验收</small>
          </div>
          <Network size={18} />
        </header>
        <div className="project-flow-list">
          {[
            ["01", "企业发布", "is-active"],
            ["02", "学生接单", ""],
            ["03", "执行交付", ""],
            ["04", "企业验收", ""],
          ].map(([index, label, state]) => (
            <div className={state} key={index}>
              <i>{index}</i>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="ep-channel-card project-card-acceptance">
        <header className="ep-channel-card-head">
          <div>
            <strong>交付验收</strong>
            <small>按业务标准结项</small>
          </div>
          <ShieldCheck size={18} />
        </header>
        <div className="project-acceptance-list">
          {["证据充分", "边界清晰", "建议可执行"].map((label) => (
            <span key={label}>
              <i />
              {label}
            </span>
          ))}
        </div>
      </article>
    </>
  );
}

function PathScene({ variant }: { variant: "assessment" | "employment" }) {
  return variant === "assessment" ? <AssessmentPathScene /> : <EmploymentPathScene />;
}

function AssessmentPathScene() {
  return (
    <div className="ep-channel-path-scene ep-assessment-scene">
      <svg viewBox="0 0 790 500" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="assessment-base-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f1fbff" stopOpacity=".34" />
            <stop offset=".55" stopColor="#95d5dd" stopOpacity=".15" />
            <stop offset="1" stopColor="#6d96dc" stopOpacity=".1" />
          </linearGradient>
          <linearGradient id="assessment-object-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".98" />
            <stop offset="1" stopColor="#d5f1ef" stopOpacity=".84" />
          </linearGradient>
          <linearGradient id="assessment-object-left" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#73a3df" stopOpacity=".86" />
            <stop offset="1" stopColor="#355a9f" stopOpacity=".72" />
          </linearGradient>
          <linearGradient id="assessment-object-right" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b7e4df" stopOpacity=".88" />
            <stop offset="1" stopColor="#5e969d" stopOpacity=".7" />
          </linearGradient>
          <linearGradient id="assessment-route" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#d9f8f3" stopOpacity=".16" />
            <stop offset=".5" stopColor="#f2fffd" stopOpacity=".92" />
            <stop offset="1" stopColor="#8cd9d0" stopOpacity=".52" />
          </linearGradient>
          <radialGradient id="assessment-glow">
            <stop offset="0" stopColor="#ddfff8" stopOpacity=".44" />
            <stop offset=".52" stopColor="#9ddddb" stopOpacity=".14" />
            <stop offset="1" stopColor="#6e95dc" stopOpacity="0" />
          </radialGradient>
          <filter id="assessment-glow-filter" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="ep-path-ambient">
          <ellipse cx="416" cy="265" rx="292" ry="152" />
          <ellipse cx="416" cy="265" rx="218" ry="112" className="ring-two" />
          <path d="M92 206C200 89 366 72 522 136c98 40 158 106 196 172" />
        </g>

        <g className="ep-path-base">
          <polygon points="106,310 402,458 402,480 106,332" className="base-left" />
          <polygon points="402,458 702,307 702,329 402,480" className="base-right" />
          <polygon points="106,310 402,159 702,307 402,458" className="base-top" />
          <g className="base-grid">
            <path d="M461 182 165 328M520 211 224 357M579 240 283 386M638 269 342 415M697 298 401 444" />
            <path d="M343 182 639 328M284 211 580 357M225 240 521 386M166 269 462 415M107 298 403 444" />
          </g>
          <path className="base-outline" d="M106 310 402 159 702 307 402 458Z" />
        </g>

        <path className="ep-assessment-route route-one" d="M251 302C327 269 364 238 416 219" />
        <path className="ep-assessment-route route-two" d="M416 219C482 224 532 265 588 300" />
        <path className="ep-assessment-route route-three" d="M248 309C327 342 409 367 511 419" />

        <g className="ep-assessment-stations">
          <g className="station theory-station">
            <polygon points="173,301 251,263 329,301 251,339" className="pad-top" />
            <polygon points="173,301 251,339 251,348 173,310" className="pad-left" />
            <polygon points="251,339 329,301 329,310 251,348" className="pad-right" />
            <g className="station-object">
              <polygon points="205,243 251,219 297,243 251,267" className="object-top" />
              <polygon points="205,243 251,267 251,317 205,293" className="object-left" />
              <polygon points="251,267 297,243 297,293 251,317" className="object-right" />
              <path d="M218 260h20M218 270h15M265 252l17-9M265 264l20-11" className="object-lines" />
              <circle cx="251" cy="232" r="4" className="object-signal" />
            </g>
            <text x="177" y="373">理论核验</text>
          </g>

          <g className="station evidence-station">
            <polygon points="342,297 416,260 490,297 416,334" className="pad-top" />
            <polygon points="342,297 416,334 416,343 342,306" className="pad-left" />
            <polygon points="416,334 490,297 490,306 416,343" className="pad-right" />
            <g className="station-object">
              <polygon points="370,235 416,211 462,235 416,259" className="object-top" />
              <polygon points="370,235 416,259 416,317 370,293" className="object-left" />
              <polygon points="416,259 462,235 462,293 416,317" className="object-right" />
              <path d="M382 252h27M382 263h20M382 274h24" className="object-lines" />
              <polygon points="433,241 445,235 457,241 445,247" className="object-chip" />
            </g>
            <text x="374" y="368">场景证据</text>
          </g>

          <g className="station credential-station">
            <polygon points="532,301 610,263 688,301 610,339" className="pad-top" />
            <polygon points="532,301 610,339 610,348 532,310" className="pad-left" />
            <polygon points="610,339 688,301 688,310 610,348" className="pad-right" />
            <g className="station-object">
              <polygon points="564,236 610,212 656,236 610,260" className="object-top" />
              <polygon points="564,236 610,260 610,314 564,290" className="object-left" />
              <polygon points="610,260 656,236 656,290 610,314" className="object-right" />
              <path d="M579 253h22M579 263h17" className="object-lines" />
              <circle cx="631" cy="265" r="13" className="credential-seal" />
              <path d="m625 265 4 4 8-10" className="credential-check" />
            </g>
            <text x="566" y="373">岗位凭证</text>
          </g>
        </g>

        <g className="ep-assessment-core">
          <ellipse cx="416" cy="219" rx="87" ry="44" />
          <path d="M367 219a49 49 0 1 0 98 0 49 49 0 1 0-98 0" className="score-ring" />
          <path d="M377 219a39 39 0 0 1 71-24" className="score-arc" />
          <text x="416" y="218" textAnchor="middle" className="score-value">84</text>
          <text x="416" y="234" textAnchor="middle" className="score-label">能力达标</text>
          <circle cx="448" cy="194" r="3.5" className="score-node" />
        </g>

        <g className="ep-path-tokens assessment-tokens">
          <circle r="4" />
          <circle r="3" />
          <circle r="3.5" />
        </g>

        <g className="ep-path-shards">
          <polygon points="127,183 140,175 153,183 140,192" />
          <polygon points="668,192 683,183 698,192 683,201" />
          <circle cx="544" cy="103" r="2.5" />
          <circle cx="246" cy="143" r="2" />
        </g>
      </svg>
    </div>
  );
}

function EmploymentPathScene() {
  return (
    <div className="ep-channel-path-scene ep-employment-scene">
      <svg viewBox="0 0 790 500" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="employment-base-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f3f8ff" stopOpacity=".32" />
            <stop offset=".58" stopColor="#9dbce9" stopOpacity=".16" />
            <stop offset="1" stopColor="#77cfc4" stopOpacity=".1" />
          </linearGradient>
          <linearGradient id="employment-object-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".98" />
            <stop offset="1" stopColor="#d4e6ff" stopOpacity=".84" />
          </linearGradient>
          <linearGradient id="employment-object-left" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#658ed0" stopOpacity=".88" />
            <stop offset="1" stopColor="#2f508f" stopOpacity=".74" />
          </linearGradient>
          <linearGradient id="employment-object-right" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#aadfda" stopOpacity=".9" />
            <stop offset="1" stopColor="#548d94" stopOpacity=".72" />
          </linearGradient>
          <linearGradient id="employment-route" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#d8f8f2" stopOpacity=".16" />
            <stop offset=".45" stopColor="#f4fffd" stopOpacity=".9" />
            <stop offset="1" stopColor="#a7d7ff" stopOpacity=".5" />
          </linearGradient>
          <radialGradient id="employment-glow">
            <stop offset="0" stopColor="#e2fff9" stopOpacity=".38" />
            <stop offset=".54" stopColor="#a7d8e8" stopOpacity=".12" />
            <stop offset="1" stopColor="#6f95d6" stopOpacity="0" />
          </radialGradient>
          <filter id="employment-glow-filter" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="ep-path-ambient employment-ambient">
          <ellipse cx="420" cy="262" rx="292" ry="151" />
          <ellipse cx="420" cy="262" rx="219" ry="111" className="ring-two" />
          <path d="M98 393C213 435 394 450 664 342" />
        </g>

        <g className="ep-path-base employment-base">
          <polygon points="102,310 401,458 401,480 102,332" className="base-left" />
          <polygon points="401,458 704,306 704,328 401,480" className="base-right" />
          <polygon points="102,310 401,158 704,306 401,458" className="base-top" />
          <g className="base-grid">
            <path d="M461 181 163 328M520 210 222 357M579 239 281 386M638 268 340 415M697 297 399 444" />
            <path d="M341 181 639 328M282 210 580 357M223 239 521 386M164 268 462 415M105 297 403 444" />
          </g>
          <path className="base-outline" d="M102 310 401 158 704 306 401 458Z" />
        </g>

        <path className="ep-employment-route main-route" d="M214 302C282 286 329 267 393 254S523 264 585 295" />
        <path className="ep-employment-route echo-route" d="M214 302C282 286 329 267 393 254S523 264 585 295" />
        <path className="ep-employment-branch" d="M585 295C628 286 658 273 681 253" />
        <path className="ep-employment-branch branch-two" d="M585 295C632 310 663 329 687 356" />

        <g className="ep-employment-profile">
          <ellipse cx="192" cy="261" rx="86" ry="45" className="profile-glow" />
          <polygon points="149,291 214,258 279,291 214,324" className="pad-top" />
          <polygon points="149,291 214,324 214,334 149,301" className="pad-left" />
          <polygon points="214,324 279,291 279,301 214,334" className="pad-right" />
          <g className="profile-object">
            <polygon points="178,218 214,199 250,218 214,237" className="object-top" />
            <polygon points="178,218 214,237 214,294 178,275" className="object-left" />
            <polygon points="214,237 250,218 250,275 214,294" className="object-right" />
            <circle cx="214" cy="218" r="12" className="profile-avatar" />
            <path d="M190 252h13M190 262h18M190 272h10M226 252h17M226 262h12" className="profile-lines" />
          </g>
          <g className="employment-label">
            <rect x="148" y="342" width="72" height="22" rx="7" />
            <text x="184" y="357" textAnchor="middle">能力画像</text>
          </g>
        </g>

        <g className="ep-employment-match">
          <polygon points="334,253 393,224 452,253 393,282" className="match-top" />
          <polygon points="334,253 393,282 393,293 334,264" className="match-left" />
          <polygon points="393,282 452,253 452,264 393,293" className="match-right" />
          <path d="M333 219a60 60 0 1 0 120 0 60 60 0 1 0-120 0" className="match-ring" />
          <path d="M347 219a46 46 0 0 1 80-28" className="match-arc" />
          <text x="393" y="218" textAnchor="middle" className="match-value">86%</text>
          <text x="393" y="235" textAnchor="middle" className="match-label">岗位匹配</text>
          <circle cx="430" cy="187" r="4" className="match-node" />
        </g>

        <g className="ep-employment-jobs">
          <g className="job-platform job-primary">
            <polygon points="603,286 674,251 745,286 674,321" className="pad-top" />
            <polygon points="603,286 674,321 674,331 603,296" className="pad-left" />
            <polygon points="674,321 745,286 745,296 674,331" className="pad-right" />
            <g className="job-object">
              <polygon points="635,232 674,213 713,232 674,251" className="object-top" />
              <polygon points="635,232 674,251 674,301 635,282" className="object-left" />
              <polygon points="674,251 713,232 713,282 674,301" className="object-right" />
              <path d="M647 249h12M647 258h18M685 244l13-7" className="job-lines" />
            </g>
            <g className="employment-label">
              <rect x="610" y="226" width="88" height="22" rx="7" />
              <text x="654" y="241" textAnchor="middle">技术服务</text>
            </g>
          </g>
          <g className="job-platform job-secondary">
            <polygon points="624,369 677,343 730,369 677,395" className="pad-top" />
            <polygon points="624,369 677,395 677,402 624,376" className="pad-left" />
            <polygon points="677,395 730,369 730,376 677,402" className="pad-right" />
            <g className="job-object">
              <polygon points="647,334 677,320 707,334 677,348" className="object-top" />
              <polygon points="647,334 677,348 677,383 647,369" className="object-left" />
              <polygon points="677,348 707,334 707,369 677,383" className="object-right" />
              <circle cx="677" cy="338" r="6" className="job-signal" />
            </g>
            <g className="employment-label">
              <rect x="626" y="408" width="78" height="22" rx="7" />
              <text x="665" y="423" textAnchor="middle">安全分析</text>
            </g>
          </g>
          <g className="job-platform job-tertiary">
            <polygon points="579,196 629,172 679,196 629,220" className="pad-top" />
            <polygon points="579,196 629,220 629,227 579,203" className="pad-left" />
            <polygon points="629,220 679,196 679,203 629,227" className="pad-right" />
            <g className="job-object">
              <polygon points="603,165 629,152 655,165 629,178" className="object-top" />
              <polygon points="603,165 629,178 629,209 603,196" className="object-left" />
              <polygon points="629,178 655,165 655,196 629,209" className="object-right" />
              <path d="M614 176h10M614 183h7" className="job-lines" />
            </g>
            <g className="employment-label">
              <rect x="573" y="130" width="84" height="22" rx="7" />
              <text x="615" y="145" textAnchor="middle">可观测性</text>
            </g>
          </g>
        </g>

        <g className="ep-path-tokens employment-tokens">
          <circle r="4" />
          <circle r="3" />
          <circle r="3.5" />
        </g>

        <g className="ep-path-shards employment-shards">
          <polygon points="111,179 124,171 137,179 124,188" />
          <polygon points="717,174 732,165 747,174 732,183" />
          <circle cx="527" cy="102" r="2.5" />
          <circle cx="272" cy="135" r="2" />
        </g>
      </svg>
    </div>
  );
}
