"use client";

import { StudentIllustration } from "@/components/student-illustration";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, Bookmark, Building2, CheckCircle2, ChevronRight, ExternalLink, GitCompareArrows, GraduationCap, MapPin, Search, ShieldCheck, Sparkles, X } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { EmptyState } from "@/components/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { careerById } from "@/lib/career-market-data";
import { recruitmentForTrack, RECRUITMENT_CHECKED_AT, type RecruitmentCompany, type EmployerRequirement } from "@/lib/recruitment-data";
import { useDemo } from "@/lib/demo-store";
import { DEMO_STUDENT_ID } from "@/lib/mock-data";
import { challengeForState, isChallengeOpen, submissionOf } from "@/lib/metrics";
import "./recruitment.css";

const SAVED_KEY = "colasoft-recruitment-favorites-s1-v1";

export default function RecruitmentPage() {
  const { id } = useParams<{ id: string }>();
  const query = useSearchParams();
  const router = useRouter();
  const { state } = useDemo();
  const urlKeyword = query.get("q") ?? "";
  const [keyword, setKeyword] = useState(urlKeyword);
  const queryRef = useRef(query.toString());
  queryRef.current = query.toString();
  useEffect(() => setKeyword(urlKeyword), [urlKeyword]);
  useEffect(() => {
    if(keyword === urlKeyword)return;
    const timer = window.setTimeout(() => {
      const next = new URLSearchParams(queryRef.current);
      if(keyword)next.set("q", keyword);else next.delete("q");
      next.delete("company");
      router.replace(`/student/careers/${id}/recruitment${next.size ? `?${next}` : ""}`, { scroll: false });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [keyword, urlKeyword, id, router]);
  const [saved, setSaved] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [compare, setCompare] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [message, setMessage] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { try { const value=JSON.parse(localStorage.getItem(SAVED_KEY)??"[]"); if(Array.isArray(value))setSaved(value.filter((item): item is string=>typeof item==="string")); } catch {} setReady(true); }, []);
  useEffect(() => { if(ready)localStorage.setItem(SAVED_KEY,JSON.stringify(saved)); }, [ready,saved]);
  useEffect(() => { if(compareOpen)dialog.current?.showModal();else dialog.current?.close(); }, [compareOpen]);
  const career = careerById(id);
  if (!career) return <EmptyState title="找不到这个岗位" body="请从岗位地图重新选择岗位。" />;
  const base = `/student/careers/${id}/recruitment`;
  const priority = (item: RecruitmentCompany) => item.evidence === "行业参考" ? 5 : item.channel === "校园招聘" && item.evidence === "职位要求已核验" ? 0 : item.channel === "校园招聘" ? 1 : item.evidence === "职位要求已核验" ? 2 : 3;
  const companies = recruitmentForTrack(career.track).sort((a,b)=>priority(a)-priority(b));
  const city=query.get("city")??"全部";
  const channel=query.get("channel")??"全部";
  const evidence=query.get("evidence")??"全部";
  const onlySaved=query.get("view")==="saved";
  const cities=[...new Set(companies.flatMap(item=>item.cities))];
  const rows=companies.filter(item=>(!keyword||`${item.company}${item.role}${item.searchTerms.join(" ")}${item.requirements.map(row=>row.text).join(" ")}`.toLowerCase().includes(keyword.toLowerCase()))&&(city==="全部"||(city==="待核验"?!item.cities.length:item.cities.includes(city)))&&(channel==="全部"||item.channel===channel)&&(evidence==="全部"||item.evidence===evidence)&&(!onlySaved||saved.includes(item.id)));
  const selected=rows.find(item=>item.id===query.get("company"))??rows[0];
  const comparing=companies.filter(item=>compare.includes(item.id));
  const companyCount=new Set(companies.map(item=>item.company)).size;
  function updateQuery(values:Record<string,string|null>) { const next=new URLSearchParams(queryRef.current);if(keyword)next.set("q",keyword);else next.delete("q");Object.entries(values).forEach(([key,value])=>{if(!value||value==="全部")next.delete(key);else next.set(key,value);});router.replace(`${base}${next.size?`?${next}`:""}`,{scroll:false}); }
  function toggleSave(companyId:string) {setSaved(current=>current.includes(companyId)?current.filter(item=>item!==companyId):[...current,companyId]);}
  function toggleCompare(companyId:string) {
    if(!compare.includes(companyId) && compare.length >= 3) {setMessage("最多同时比较 3 个公司岗位，请先移除一项。");return;}
    setCompare(current=>current.includes(companyId)?current.filter(item=>item!==companyId):current.length<3?[...current,companyId]:current);
  }
  function taskFor(requirement:EmployerRequirement) { return requirement.taskId?challengeForState(state,requirement.taskId):undefined; }
  function hasEvidence(requirement:EmployerRequirement) {const submission=requirement.taskId?submissionOf(state,DEMO_STUDENT_ID,requirement.taskId):undefined;return submission?.status==="passed"&&submission.evidenceIds.length>0;}
  function evidenceCount(company:RecruitmentCompany) {return company.requirements.filter(hasEvidence).length;}
  function officialLink(company:RecruitmentCompany) {return <a href={company.sourceUrl} target="_blank" rel="noreferrer" className={buttonVariants({size:"sm"})}>{company.evidence==="行业参考"?"查看官方业务信息":"前往企业官方页面"}<ExternalLink size={13}/></a>;}

  return <div className="recruitment-page">
    <nav className="recruit-breadcrumb" aria-label="面包屑"><Link href="/student/careers">岗位地图</Link><ChevronRight size={12}/><Link href={`/student/careers/${id}`}>{career.title}</Link><ChevronRight size={12}/><span>全国招聘参考</span></nav>
    <section className="recruit-hero"><div><span className="recruit-kicker">CAREER CONNECTIONS / 从学习走向行业</span><h1>这份能力，<br/>可以走向<span>哪些公司？</span></h1><p>围绕「{career.title}」探索全国相关企业。<br/>看懂岗位要求，准备自己的证据，再前往官方渠道核验。</p><Link href={`/student/careers/${id}`}><ArrowLeft size={13}/>返回岗位学习路线</Link></div><div className="recruit-hero-aside"><StudentIllustration scene={career.track === "安全运营" ? "security" : "network"} className="recruitment-hero-illustration"/><div><strong>{companyCount}<small>家相关企业</small></strong><p>{companies.filter(item=>item.evidence==="职位要求已核验").length} 条职位要求已核验 · {companies.filter(item=>item.evidence==="官方招聘入口").length} 条官方入口</p><span>人工核对快照 {RECRUITMENT_CHECKED_AT}</span></div></div></section>
    <div className="recruit-boundary"><ShieldCheck size={16}/><p>信息分级展示：<b>职位要求已核验</b>为官方页面摘要，<b>官方招聘入口</b>需进一步核验具体 JD，<b>行业参考</b>不代表招聘。名额与有效期以企业官网为准。</p></div>
    <div className="recruit-process"><span><b>01</b> 找到相关公司</span><ChevronRight size={13}/><span><b>02</b> 对照要求与门槛</span><ChevronRight size={13}/><span><b>03</b> 补齐实战证据</span><ChevronRight size={13}/><span><b>04</b> 官网确认与申请</span></div>
    <section className="recruit-filters" aria-label="招聘公司筛选"><label className="recruit-search"><Search size={17}/><input aria-label="搜索公司或要求" value={keyword} onChange={event=>setKeyword(event.target.value)} placeholder="搜索公司、方向或技能要求"/></label><label><span>工作城市</span><select value={city} onChange={event=>updateQuery({city:event.target.value,company:null})}><option value="全部">全国范围</option>{cities.map(item=><option key={item}>{item}</option>)}<option value="待核验">城市待核验</option></select></label><label><span>招聘类型</span><select value={channel} onChange={event=>updateQuery({channel:event.target.value,company:null})}>{["全部","校园招聘","社会招聘","官网核验"].map(item=><option key={item}>{item}</option>)}</select></label><label><span>信息完整度</span><select value={evidence} onChange={event=>updateQuery({evidence:event.target.value,company:null})}>{["全部","职位要求已核验","官方招聘入口","行业参考"].map(item=><option key={item}>{item}</option>)}</select></label><Button size="sm" variant="ghost" onClick={()=>{setKeyword("");router.replace(base,{scroll:false});}}>重置筛选</Button></section>
    <div className="recruit-list-bar"><div><button type="button" className={!onlySaved?"active":""} aria-pressed={!onlySaved} onClick={()=>updateQuery({view:null,company:null})}>相关企业方向</button><button type="button" className={onlySaved?"active":""} aria-pressed={onlySaved} onClick={()=>updateQuery({view:"saved",company:null})}>我的关注 {companies.filter(item=>saved.includes(item.id)).length}</button></div><span aria-live="polite">当前 {rows.length} 条 · 校招与已核验信息优先</span></div>
    {message&&<p className="notice-info mb-4" role="status">{message}<button className="ml-3" aria-label="关闭提示" onClick={()=>setMessage("")}>×</button></p>}
    <div className="recruit-workspace"><section className="recruit-company-list" aria-label="相关公司列表">{rows.map(item=><article className={`recruit-company ${selected?.id===item.id?"selected":""}`} key={item.id}><div className="recruit-company-cover"><StudentIllustration scene={item.tracks[0] === "安全运营" ? "security" : item.tracks[0] === "可观测性" ? "cloud" : "network"} /></div><div className="recruit-company-top"><span className="recruit-company-logo">{item.company==="科来网络"?<BrandLogo/>:item.shortName}</span><div><h2>{item.company}</h2><p>{item.category}</p></div><button aria-label={`${saved.includes(item.id)?"取消关注":"关注"}${item.company}${item.role}`} aria-pressed={saved.includes(item.id)} className={saved.includes(item.id)?"saved":""} onClick={()=>toggleSave(item.id)}><Bookmark size={17} fill={saved.includes(item.id)?"currentColor":"none"}/></button></div><Link href={`${base}?${new URLSearchParams({...Object.fromEntries(query.entries()),company:item.id}).toString()}`} scroll={false} className="recruit-company-role" onClick={()=>{if(window.innerWidth<950)requestAnimationFrame(()=>document.getElementById("company-detail")?.scrollIntoView({behavior:"smooth",block:"start"}));}}>{item.role}<ChevronRight size={14}/></Link><div className="recruit-company-tags"><span><MapPin size={11}/>{item.cities.join(" / ")||"城市待核验"}</span><span>{item.channel}</span></div><span className={`recruit-evidence evidence-${item.evidence==="职位要求已核验"?"jd":item.evidence==="行业参考"?"reference":"portal"}`}>{item.evidence}</span><p className="recruit-company-reason">{item.reason}</p><div className="recruit-company-bottom"><label><input type="checkbox" checked={compare.includes(item.id)} onChange={()=>toggleCompare(item.id)}/> 加入对比</label><span>{evidenceCount(item)}/{item.requirements.length} 项有相关实训证据</span></div></article>)}{!rows.length&&<div className="recruit-empty"><Search size={28}/><h2>{onlySaved?"关注列表暂时为空":"暂未找到匹配的方向"}</h2><p>{onlySaved?"关注只保存在本机，可以从相关企业列表添加。":"请减少城市、类型或关键词条件。城市未核验的企业不会被当成某个城市的岗位。"}</p><Button variant="secondary" onClick={()=>{setKeyword("");router.replace(base,{scroll:false});}}>查看全部相关企业</Button></div>}</section>
      <aside id="company-detail" className="recruit-detail" aria-label="公司要求详情">{selected?<><div className="recruit-detail-head"><span>COMPANY REQUIREMENTS / 公司与岗位要求</span><h2>{selected.company} · {selected.role}</h2><p>{selected.cityNote}</p><div>{officialLink(selected)}<Button size="sm" variant="secondary" onClick={()=>toggleSave(selected.id)}><Bookmark size={13}/>{saved.includes(selected.id)?"已关注":"关注此方向"}</Button></div></div><div className="recruit-detail-body"><p className="recruit-eligibility-note">{selected.eligibilityNote}</p><div className="recruit-gates"><div><GraduationCap size={16}/><span>学历与专业<b>{selected.education}</b></span></div><div><Building2 size={16}/><span>经验与对象<b>{selected.experience}</b></span></div></div><h3>具体要求与我的准备</h3><p className="recruit-section-note">只认已通过且收录证据的对应任务；不把学习进度当成招聘达标分数。学历、年限与平台外技能单独核验。</p><div className="recruit-requirements">{selected.requirements.map((requirement,index)=>{const task=taskFor(requirement);const supported=hasEvidence(requirement);const open=task&&isChallengeOpen(state,task);return <article key={`${selected.id}-${index}`}><div><span>{String(index+1).padStart(2,"0")}</span><p>{requirement.text}<small>{requirement.origin==="official"?"官方要求摘要":"学习准备建议，非企业正式 JD"}</small></p></div><footer><span className={supported?"supported":""}>{supported?<CheckCircle2 size={12}/>:<Sparkles size={12}/>} {supported?"已有相关实训证据":task?"建议补充实战证据":"需在平台外另行准备"}</span>{task&&open?<Link href={`/student/challenges/${task.id}?career=${id}&from=recruitment&company=${selected.id}`}>{supported?"回看成果":"前往训练"} <ArrowUpRight size={12}/></Link>:task?<span>任务暂不可用</span>:null}</footer></article>;})}</div>
        {selected.bonus.length>0&&<><h3>{selected.evidence==="职位要求已核验"?"补充关注项":"可准备的补充材料"}</h3><ul className="recruit-bonus">{selected.bonus.map(item=><li key={item}>{item}</li>)}</ul></>}
        <div className="recruit-next-action"><Sparkles size={19}/><div><h3>下一步怎么准备</h3><p>{selected.preparation}</p><Link href="/student?view=portrait">查看我的能力画像 <ArrowUpRight size={12}/></Link></div></div>
        <details className="recruit-source" open><summary>来源与核验记录</summary><p>{selected.sourceLabel}</p><a href={selected.sourceUrl} target="_blank" rel="noreferrer">查看原始官方来源 <ExternalLink size={11}/></a><p>人工核验日期：{RECRUITMENT_CHECKED_AT}。本页不持续同步职位状态，来源内容可能发生变化。</p><p>官网检索关键词：{selected.searchTerms.join("、")}</p><p>申请前核对：职位是否开放、工作地、学历/专业、毕业届次、经验、截止时间。平台不保存或代投简历。</p></details></div></>:<div className="recruit-empty">调整筛选后，选择公司查看具体要求。</div>}</aside></div>
    {compare.length>0&&<div className="recruit-compare-bar"><span><GitCompareArrows size={17}/>已选 {compare.length}/3 项对比</span><div>{comparing.map(item=><button key={item.id} title={`${item.company} · ${item.role}`} onClick={()=>toggleCompare(item.id)}>{item.company} · {item.role}<X size={11}/></button>)}</div><Button size="sm" disabled={compare.length<2} onClick={()=>setCompareOpen(true)}>查看对比</Button><Button size="sm" variant="ghost" onClick={()=>setCompare([])}>清空</Button></div>}
    <dialog ref={dialog} onCancel={()=>setCompareOpen(false)} onClose={()=>setCompareOpen(false)} className="recruit-compare-dialog"><header><div><span>COMPARE / 横向比较</span><h2>比较要求，选择准备方向</h2></div><button autoFocus aria-label="关闭对比" onClick={()=>setCompareOpen(false)}><X size={20}/></button></header><div className="recruit-compare-table"><table><thead><tr><th>对比维度</th>{comparing.map(item=><th key={item.id}>{item.company}<small>{item.role}</small></th>)}</tr></thead><tbody>{[{label:"信息等级",get:(item:RecruitmentCompany)=>item.evidence},{label:"工作城市",get:(item:RecruitmentCompany)=>item.cities.join(" / ")||"需官网核验"},{label:"招聘类型",get:(item:RecruitmentCompany)=>item.channel},{label:"学历专业",get:(item:RecruitmentCompany)=>item.education},{label:"经验 / 届次",get:(item:RecruitmentCompany)=>item.experience},{label:"已有验收证据",get:(item:RecruitmentCompany)=>`${evidenceCount(item)} / ${item.requirements.length} 项（不等于企业达标）`},{label:"准备重点",get:(item:RecruitmentCompany)=>item.preparation}].map(row=><tr key={row.label}><th>{row.label}</th>{comparing.map(item=><td key={item.id}>{row.get(item)}</td>)}</tr>)}<tr><th>官方来源</th>{comparing.map(item=><td key={item.id}>{officialLink(item)}</td>)}</tr></tbody></table></div><p>比较不计算录用概率；学历、经验、编程等要求不能由平台实训记录替代。</p></dialog>
  </div>;
}
