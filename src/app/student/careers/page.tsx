"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PopularCareers } from "@/components/popular-careers";
import "./careers.css";
import { buttonVariants } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";
import {
  CAREER_MARKET_ITEMS,
  INDUSTRY_OUTLOOK,
  type CareerIndustry,
  type CareerTrack,
} from "@/lib/career-market-data";
import { DEMO_STUDENT_ID } from "@/lib/mock-data";
import { jobFit, nextPractice } from "@/lib/metrics";

const INDUSTRIES = Object.keys(INDUSTRY_OUTLOOK) as CareerIndustry[];
const TRACKS: CareerTrack[] = ["网络分析", "可观测性", "安全运营", "SRE / 运维"];

export default function CareersPage() {
  const { state } = useDemo();
  const [keyword, setKeyword] = useState("");
  const [industry, setIndustry] = useState<CareerIndustry | "全部">("全部");
  const [track, setTrack] = useState<CareerTrack | "全部">("全部");
  const [company, setCompany] = useState("全部");
  const jobs = jobFit(state, DEMO_STUDENT_ID);
  const next = nextPractice(state, DEMO_STUDENT_ID);
  const companies = useMemo(
    () => [...new Set(CAREER_MARKET_ITEMS.map((item) => item.company))].sort((a, b) => a.localeCompare(b, "zh-CN")),
    [],
  );
  const fitByCareer = new Map(jobs.map((item) => [item.id, item]));
  const filteredItems = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    return CAREER_MARKET_ITEMS.filter((item) => {
      const searchable = [item.company, item.title, item.summary, item.scenario, ...item.skills].join(" ").toLowerCase();
      return (
        (!normalized || searchable.includes(normalized)) &&
        (industry === "全部" || item.industry === industry) &&
        (track === "全部" || item.track === track) &&
        (company === "全部" || item.company === company)
      );
    });
  }, [company, industry, keyword, track]);

  return (
    <div className="career-explorer">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-semibold leading-none tracking-tight">岗位地图</h1>
          <p className="mt-2 text-sm text-ink-muted">{CAREER_MARKET_ITEMS.length} 个岗位 · {companies.length} 家企业</p>
        </div>
        {next ? <Link href={`/student/challenges/${next.challenge.id}`} className={buttonVariants()}>{next.challenge.title}</Link> : null}
      </header>
      <PopularCareers />
      <div className="career-track-shortcuts">{TRACKS.map((name,index)=><button key={name} type="button" aria-pressed={track===name} className={track===name?"selected":""} onClick={()=>setTrack(track===name?"全部":name)}><span className={`career-track-number track-${index}`}>0{index+1}</span><b>{name}</b></button>)}</div>
      <section className="career-map">
      <div className="career-map-board">
      <section className="surface-card p-4" aria-label="筛选">
        <div className="grid gap-3">
          <label className="relative">
            <span className="sr-only">搜索公司、岗位或技能</span>
            <Search className="pointer-events-none absolute left-3 top-2.5 text-ink-muted" size={16} />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="field-control w-full pl-9"
              placeholder="搜索公司、岗位或技能"
            />
          </label>
          <label>
            <span className="sr-only">行业筛选</span>
            <select className="field-control w-full" value={industry} onChange={(event) => setIndustry(event.target.value as CareerIndustry | "全部")}>
              <option value="全部">全部行业</option>
              {INDUSTRIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">方向筛选</span>
            <select className="field-control w-full" value={track} onChange={(event) => setTrack(event.target.value as CareerTrack | "全部")}>
              <option value="全部">全部方向</option>
              {TRACKS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">公司筛选</span>
            <select className="field-control w-full" value={company} onChange={(event) => setCompany(event.target.value)}>
              <option value="全部">全部公司</option>
              {companies.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <button
            type="button"
            className="min-h-9 rounded-md border border-line-control px-3 text-xs text-ink-soft hover:bg-canvas"
            onClick={() => { setKeyword(""); setIndustry("全部"); setTrack("全部"); setCompany("全部"); }}
          >
            清空筛选
          </button>
        </div>
      </section>
      </div>
      <div className="career-map-jobs" id="career-opportunities">
        <div className="job-list">
          {filteredItems.map((item) => {
            const fit = fitByCareer.get(item.careerId);
            return (
              <article key={item.id} className="surface-card flex flex-col p-4">
                <Link href={`/student/careers/${item.id}`} className="block">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-ink-muted">{item.company} · {item.track}</p>
                      <h3 className="mt-1 text-[15px] font-medium">{item.title}</h3>
                    </div>
                    {fit ? <b className="numeric text-xl">{fit.fit}</b> : null}
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink-soft">{item.summary}</p>
                </Link>
                <Link href={`/student/careers/${item.id}/recruitment`} className="mt-3 text-xs text-ink-muted hover:text-ink">招聘</Link>
              </article>
            );
          })}
          {filteredItems.length === 0 ? (
            <div className="job-empty surface-card p-8 text-center text-sm text-ink-soft">没有符合的岗位。</div>
          ) : null}
        </div>
      </div>
      </section>
    </div>
  );
}
