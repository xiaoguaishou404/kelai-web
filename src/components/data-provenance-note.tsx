import { ExternalLink, Info } from "lucide-react";
import { DEMO_DATA_NOTICE, INDUSTRY_RESEARCH_SOURCES, RESEARCH_RETRIEVED_AT } from "@/lib/industry-research";

export function DataProvenanceNote({ compact = false }: { compact?: boolean }) {
  return (
    <aside className="rounded-xl border border-line bg-[#F8FAFC] p-4 text-xs leading-5 text-ink-soft">
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 shrink-0 text-tide" size={15} />
        <div>
          <p className="font-medium text-ink">数据来源 / 演示口径</p>
          <p className="mt-1">{DEMO_DATA_NOTICE}</p>
          {!compact ? (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {INDUSTRY_RESEARCH_SOURCES.map((source) => (
                <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-tide hover:underline">
                  {source.name}<ExternalLink size={11} />
                </a>
              ))}
            </div>
          ) : null}
          <p className="mt-2 text-[11px] text-ink-muted">公开资料检索日期：{RESEARCH_RETRIEVED_AT}</p>
        </div>
      </div>
    </aside>
  );
}
