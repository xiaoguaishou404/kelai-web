import { lazy, Suspense, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { dimensions, type ApplicationStatus } from "@/lib/enterprise-workspace";

const AbilityRadar = lazy(() =>
  import("@/components/ability-radar").then((module) => ({ default: module.AbilityRadar })),
);

const radarKeys = ["deploy", "listen", "path", "locate", "alert", "report"] as const;

export function Btn({
  children,
  onClick,
  secondary = false,
  disabled = false,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button type="button" title={title} disabled={disabled} className={secondary ? "ep-button secondary" : "ep-button"} onClick={onClick}>
      {children}
    </button>
  );
}

export function Card({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  return <section id={id} className={"ep-card " + className}>{children}</section>;
}

export function Tag({ children, tone = "" }: { children: ReactNode; tone?: string }) {
  return <span className={`ep-tag ${tone ? `is-${tone}` : ""}`}>{children}</span>;
}

export function RadarView({ values }: { values: number[] }) {
  return (
    <Suspense fallback={<div className="ability-radar" aria-hidden="true" />}>
      <AbilityRadar labels={dimensions} scores={Object.fromEntries(radarKeys.map((key, index) => [key, values[index]])) as Record<typeof radarKeys[number], number>} />
    </Suspense>
  );
}

export function Metric({ value, label }: { value: ReactNode; label: string }) {
  return (
    <Card>
      <small>{label}</small>
      <strong>{value}</strong>
    </Card>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="ep-empty"><AlertCircle size={18} />{children}</div>;
}

export function History({ items }: { items: { at: string; actor: string; action: string; note: string }[] }) {
  if (!items.length) return null;
  return (
    <details className="ep-history">
      <summary>操作记录</summary>
      {items.map((item) => (
        <div key={`${item.at}-${item.actor}-${item.action}`}>
          <p>{item.action} · {item.note}</p>
          <small>{item.actor}</small>
          <time>{item.at}</time>
        </div>
      ))}
    </details>
  );
}

export function applicationTone(status: ApplicationStatus) {
  if (["已验收", "已录用"].includes(status)) return "success";
  if (["已驳回", "已退回", "未通过"].includes(status)) return "danger";
  if (["待审核", "待验收", "待面试"].includes(status)) return "warning";
  return "muted";
}
