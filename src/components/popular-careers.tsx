"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { careerById } from "@/lib/career-market-data";
import "./popular-careers.css";

// 教学演示关注样本，不代表企业招聘需求或真实用户行为。
const POPULARITY = [
  { id: "aliyun-observe", followers: 96 },
  { id: "tencent-observe", followers: 91 },
  { id: "bytedance-sre", followers: 87 },
  { id: "huawei-secmaster", followers: 82 },
  { id: "colasoft-aiops", followers: 78 },
  { id: "qianxin-soc", followers: 74 },
  { id: "colasoft-traffic", followers: 69 },
  { id: "midea-iot", followers: 63 },
  { id: "cmcc-netops", followers: 58 },
].flatMap(item => { const career=careerById(item.id);return career?[{...item,career}]:[]; });

export function PopularCareers() {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(3);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const pages=Math.ceil(POPULARITY.length/perPage);
  useEffect(()=>{
    const mobile=window.matchMedia("(max-width: 700px)");
    const motion=window.matchMedia("(prefers-reduced-motion: reduce)");
    const resize=()=>{setPerPage(mobile.matches?1:3);setPage(0);};
    const preference=()=>setPlaying(!motion.matches);
    const visibility=()=>setHidden(document.hidden);
    resize();preference();visibility();
    mobile.addEventListener("change",resize);motion.addEventListener("change",preference);document.addEventListener("visibilitychange",visibility);
    return()=>{mobile.removeEventListener("change",resize);motion.removeEventListener("change",preference);document.removeEventListener("visibilitychange",visibility);};
  },[]);
  useEffect(()=>{
    if(!playing||hovered||focused||hidden||pages<2)return;
    const timer=window.setInterval(()=>setPage(current=>(current+1)%pages),5000);
    return()=>window.clearInterval(timer);
  },[playing,hovered,focused,hidden,pages]);
  function go(next:number){const value=(next+pages)%pages;setPage(value);setAnnouncement(`已显示排行榜第 ${value*perPage+1} 至 ${Math.min((value+1)*perPage,POPULARITY.length)} 名`);}
  return <section className="popular-careers" role="region" aria-roledescription="轮播图" aria-label="热门岗位排行榜" onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setFocused(false);}}>
    <div className="popular-careers-header"><h2>人气</h2><div className="popular-controls"><span>{String(page+1).padStart(2,"0")} / {String(pages).padStart(2,"0")}</span><button type="button" aria-label={playing?"暂停岗位轮播":"播放岗位轮播"} onClick={()=>setPlaying(!playing)}>{playing?<Pause size={14}/>:<Play size={14}/>}</button><button type="button" aria-label="上一组热门岗位" onClick={()=>go(page-1)}><ChevronLeft size={16}/></button><button type="button" aria-label="下一组热门岗位" onClick={()=>go(page+1)}><ChevronRight size={16}/></button></div></div>
    <div className="popular-slide" key={`${perPage}-${page}`} role="group" aria-roledescription="幻灯片" aria-label={`第 ${page+1} 组，共 ${pages} 组`} aria-live="off">{POPULARITY.slice(page*perPage,(page+1)*perPage).map((item,index)=><Link key={item.id} href={`/student/careers/${item.id}`} className="popular-role"><span className={`popular-rank ${page*perPage+index<3?"rank-top":""}`}>{String(page*perPage+index+1).padStart(2,"0")}</span><div><span>{item.career.company} <small>{item.career.track}</small></span><h3>{item.career.title}</h3><p className="numeric">{item.followers}</p></div></Link>)}</div>
    <div className="popular-pagination" aria-label="选择排行榜页">{Array.from({length:pages},(_,index)=><button key={index} type="button" aria-label={`查看排行榜第 ${index+1} 组`} aria-current={page===index?"true":undefined} className={page===index?"active":""} onClick={()=>go(index)}/>)}</div><span className="sr-only" role="status">{announcement}</span>
  </section>;
}
