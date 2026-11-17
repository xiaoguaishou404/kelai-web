"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { ChallengeCard } from "@/components/challenge-card";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";
import { ABILITIES, DEMO_STUDENT_ID } from "@/lib/mock-data";
import { modulePace, submissionOf, visibleChallenges } from "@/lib/metrics";
import type { Challenge } from "@/lib/types";
import "./task-workspace.css";

const FILTERS = ["全部", "必选", "进行中", "待验收", "退回重做", "已通过"] as const;
type TaskFilter = (typeof FILTERS)[number];

export default function ChallengesPage() {
  const { state } = useDemo();
  const [filter, setFilter] = useState<TaskFilter>("全部");
  const [keyword, setKeyword] = useState("");
  const [ability, setAbility] = useState("全部");
  const [sort, setSort] = useState("recommended");
  const pace = modulePace(state, DEMO_STUDENT_ID);
  const catalog=visibleChallenges(state);
  function matches(challenge:Challenge, category:TaskFilter) {
    const status=submissionOf(state,DEMO_STUDENT_ID,challenge.id)?.status??"not_started";
    if(category==="必选")return challenge.required;
    if(category==="进行中")return status==="in_progress";
    if(category==="待验收")return status==="submitted";
    if(category==="退回重做")return status==="returned";
    if(category==="已通过")return status==="passed";
    return true;
  }
  function priority(challenge:Challenge) {
    const step=pace.steps.find(item=>item.challenge.id===challenge.id);
    if(step?.held)return 6;
    const status=step?.submission?.status??"not_started";
    return {returned:0,in_progress:1,not_started:2,submitted:3,passed:4}[status];
  }
  const searched=catalog.filter(challenge=>(!keyword.trim()||[challenge.title,challenge.code,challenge.summary,challenge.scene,...challenge.abilities.map(key=>ABILITIES.find(item=>item.key===key)?.name)].join(" ").toLowerCase().includes(keyword.trim().toLowerCase()))&&(ability==="全部"||challenge.abilities.some(key=>key===ability)));
  const challenges=searched.filter(challenge=>matches(challenge,filter)).sort((a,b)=>sort==="recommended"?priority(a)-priority(b):catalog.indexOf(a)-catalog.indexOf(b));
  const next=[...catalog].sort((a,b)=>priority(a)-priority(b)).find(challenge=>priority(challenge)<3);
  const progress=pace.steps.length?Math.round(pace.passed/pace.steps.length*100):0;
  function reset(){setFilter("全部");setKeyword("");setAbility("全部");}

  return <div className="task-workspace">
    <PageHeader title="任务" action={<Link href="/student/records" className={buttonVariants({ variant: "secondary" })}>记录</Link>} />
    <div className="task-two-column"><aside className="task-sidebar" aria-label="筛选">
      <section className="task-filter-panel"><label className="task-search"><Search size={15}/><input aria-label="搜索任务" placeholder="搜索" value={keyword} onChange={event=>setKeyword(event.target.value)}/></label><label className="task-ability-filter"><span className="sr-only">能力</span><select aria-label="能力" value={ability} onChange={event=>setAbility(event.target.value)}><option value="全部">全部能力</option>{ABILITIES.map(item=><option key={item.key} value={item.key}>{item.name}</option>)}</select></label><label className="task-ability-filter"><span className="sr-only">排序</span><select aria-label="排序" value={sort} onChange={event=>setSort(event.target.value)}><option value="recommended">待处理优先</option><option value="course">课程顺序</option></select></label><div className="task-state-filters" aria-label="状态">{FILTERS.map(item=><button key={item} type="button" aria-pressed={filter===item} className={filter===item?"active":""} onClick={()=>setFilter(item)}><span>{item}</span><b>{searched.filter(challenge=>matches(challenge,item)).length}</b></button>)}</div>{filter!=="全部"||keyword||ability!=="全部"?<button className="task-reset" onClick={reset}>清空</button>:null}</section>
      <section className="task-progress-panel"><strong>{pace.passed}<small> / {pace.steps.length}</small></strong><div className="task-overall-track" role="progressbar" aria-label="通过进度" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{width:`${progress}%`}}/></div>{next?<Link href={`/student/challenges/${next.id}`}><span>{next.title}</span><ChevronRight size={15}/></Link>:null}</section>
    </aside><section className="task-catalog" aria-label="任务">
      {!challenges.length?<div className="task-empty"><EmptyState title="没有符合的任务" body="换一个条件。"/><button onClick={reset}>查看全部</button></div>:<div className="task-card-grid">{challenges.map(challenge=>{
        const step=pace.steps.find(item=>item.challenge.id===challenge.id);
        const submission=submissionOf(state,DEMO_STUDENT_ID,challenge.id);
        const note=step?.held?"未解锁":submission?.status==="returned"?submission.review?.comment:undefined;
        return <ChallengeCard key={challenge.id} challenge={challenge} submission={submission} timeoutMinutes={state.environment.timeoutMinutes} note={note} badge={challenge.id==="c7"&&state.updatePackConfirmed?"更新包":undefined}/>;
      })}</div>}
    </section></div>
  </div>;
}
