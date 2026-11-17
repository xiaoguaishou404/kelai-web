"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Building2, GraduationCap, ShieldCheck, ArrowUpRight, Clock3, Layers3, UsersRound, CalendarDays, Plus, Minus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { MetricCard } from "@/components/metric-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";
import { TENANTS } from "@/lib/mock-data";
import { usedMinutes } from "@/lib/metrics";
import { formatMinutes } from "@/lib/utils";
import "./tenants.css";

export default function TenantsPage() {
  const { state, adjustQuota, confirmSeats, requestUpdatePack, confirmUpdatePack } = useDemo();
  const contentId = useSearchParams().get("content");
  const totalQuota = TENANTS.reduce((sum, tenant) => sum + (tenant.primary ? state.tenantQuotaHours : tenant.quotaHours), 0);
  return <div className="tenant-center">
    {contentId ? <Link href={`/operator/content?content=${contentId}`} className="notice-info mb-5 block">← 返回内容发布，继续校验与发布</Link> : null}
    <PageHeader title="院校租户" />
    <div className="tenant-summary"><MetricCard label="合作院校" value={`${TENANTS.length} 所`} hint="专属授权 · 独立数据边界"/><MetricCard label="服务中 / 待续费" value={`${TENANTS.filter(item=>item.status==="active").length} / ${TENANTS.filter(item=>item.status==="expiring").length}`} hint="按当前演示合同状态统计"/><MetricCard label="合计授权额度" value={`${totalQuota.toLocaleString()} 小时`} hint="当前院校云桌面机时授权"/></div>
    <div className="tenant-section-label"><span><Building2 size={17}/> 院校服务档案</span><small>{TENANTS.length} 个租户 · 数据按院校隔离</small></div>
    <div className="tenant-card-grid">{TENANTS.map((tenant,index)=>{
      const quota=tenant.primary?state.tenantQuotaHours:tenant.quotaHours;
      const seats=tenant.concurrent+(tenant.primary&&state.seatsConfirmed?state.seatRequest:0);
      const used=tenant.primary?usedMinutes(state):tenant.mockUsedHours*60;
      const ratio=Math.round(used/(quota*60)*100);
      return <article key={tenant.id} className={`tenant-card ${tenant.primary?"tenant-primary":"tenant-renewal"}`}>
        <div className="tenant-card-cover"><div className="tenant-campus" aria-hidden="true"><svg viewBox="0 0 500 130" fill="none"><path d="M0 130H500M250 22L315 50H185L250 22ZM200 58V111M225 58V111M250 58V111M275 58V111M300 58V111M180 118H320M172 125H328M85 70H170V125M330 70H415V125M95 80H160M340 80H405" stroke="currentColor" strokeWidth="2"/><path d="M105 90V115M125 90V115M145 90V115M355 90V115M375 90V115M395 90V115" stroke="currentColor" strokeWidth="5"/></svg></div><span className="tenant-cover-code">PARTNER / 0{index+1}</span><span className={`tenant-service-badge ${tenant.status==="expiring"?"renewal":""}`}><i/>{tenant.status==="active"?"服务中":"续费关注"}</span></div>
        <div className="tenant-card-content"><div className="tenant-school-heading"><span className="tenant-school-icon"><GraduationCap size={28}/></span><div><h2>{tenant.school}</h2><p>{tenant.college}</p></div></div><div className="tenant-identity"><span>{tenant.region}</span><span>{tenant.code}</span></div>
        <div className="tenant-resource-stats"><div><Clock3 size={15}/><strong>{quota.toLocaleString()}<small>小时</small></strong><span>授权机时</span></div><div><UsersRound size={15}/><strong>{seats}<small>席</small></strong><span>实训并发</span></div><div><Layers3 size={15}/><strong>{tenant.primary?state.publishedChallengeIds.length:4}<small>项</small></strong><span>可用挑战</span></div></div>
        <div className="tenant-usage"><div><span>机时使用进度</span><b>{ratio}%</b></div><div className="tenant-usage-track"><span style={{width:`${Math.min(100,ratio)}%`}}/></div><p>已用 {formatMinutes(used)}<span>剩余 {formatMinutes(Math.max(0,quota*60-used))}</span></p></div>
        <div className="tenant-entitlement"><h3><Layers3 size={14}/> 课程与服务权益</h3><div><span>年度课程包</span><b>{tenant.primary?"行业实战挑战课程包":"网络运维基础包"}</b></div><div><span>年度更新服务</span><b className={tenant.primary&&state.updatePackConfirmed?"entitled":""}>{tenant.primary?state.updatePackConfirmed?"已授权":state.updatePackRequested?"待合同确认":"基础服务":"基础服务"}</b></div>{tenant.primary&&<><div><span>并发增购</span><b>{state.seatsConfirmed?`已确认 ${state.seatRequest} 席`:state.seatRequest?`待确认 ${state.seatRequest} 席`:"按需申请"}</b></div><div><span>本地案例定制</span><b>{state.localCaseAccepted?"范围已确认":state.localCaseQuoted?"已报价":state.localCaseRequested?"待报价":"未申请"}</b></div></>}</div>
        <div className="tenant-contract"><CalendarDays size={17}/><span>{tenant.plan}<small>服务到期 {tenant.renewal}</small></span><span className="tenant-contract-label">{tenant.status==="active"?"合同有效":"待续约"}</span></div>
        <p className="tenant-security"><ShieldCheck size={14}/>{tenant.dataBoundary}</p>
        {tenant.primary?<div className="tenant-actions"><div className="tenant-quota-actions"><span>调整机时额度</span><Button size="sm" variant="secondary" aria-label="减少20小时" onClick={()=>adjustQuota(-20)}><Minus size={13}/>20h</Button><Button size="sm" variant="secondary" aria-label="增加20小时" onClick={()=>adjustQuota(20)}><Plus size={13}/>20h</Button></div><div className="flex flex-wrap gap-2"><Button size="sm" variant="secondary" disabled={!state.seatRequest||state.seatsConfirmed} onClick={confirmSeats}>{state.seatsConfirmed?"并发已确认":"确认并发增购"}</Button>{!state.updatePackRequested?<Button size="sm" variant="secondary" onClick={requestUpdatePack}>登记年度更新包</Button>:!state.updatePackConfirmed?<Button size="sm" onClick={confirmUpdatePack}>确认更新包合同</Button>:<Button size="sm" disabled>更新包已授权</Button>}<Link className={buttonVariants({size:"sm"})} href={contentId?`/operator/content?content=${contentId}`:"/operator/content"}>管理课程内容<ArrowUpRight size={13}/></Link></div></div>:<div className="tenant-readonly"><ShieldCheck size={14}/><span>对照院校样本 · 本轮演示仅提供只读服务档案</span></div>}
        </div></article>;
    })}</div><p className="tenant-data-note">院校、合同与额度均为教学演示数据。主租户的额度、内容授权与学校端使用同一份本地状态。</p>
  </div>;
}
