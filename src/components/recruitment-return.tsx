"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, BriefcaseBusiness } from "lucide-react";
import { careerById } from "@/lib/career-market-data";
import { recruitmentForTrack } from "@/lib/recruitment-data";

export function RecruitmentReturn() {
  const query = useSearchParams();
  const career = careerById(query.get("career") ?? "");
  if(query.get("from")!=="recruitment"||!career)return null;
  const company = recruitmentForTrack(career.track).find(item=>item.id===query.get("company"));
  return <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-xs text-ink-soft"><span className="flex items-center gap-2"><BriefcaseBusiness size={15}/>{company?.company ?? career.title} · 岗位准备任务</span><Link className="flex items-center gap-2 text-tide" href={`/student/careers/${career.id}/recruitment${company?`?company=${company.id}`:""}`}><ArrowLeft size={13}/>返回公司要求与准备清单</Link></div>;
}
