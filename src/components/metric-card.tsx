export function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <article className="metric-enhanced rounded-xl border border-line bg-paper px-4 py-4">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="numeric mt-2 text-[26px] font-semibold leading-none tracking-tight text-ink">{value}</p>
    </article>
  );
}
