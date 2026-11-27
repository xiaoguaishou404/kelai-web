import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";

const ABILITY_KEYS = ["deploy", "listen", "path", "locate", "alert", "report"] as const;
const ABILITY_LABELS = ["识图建模", "工艺实施", "现场施工", "质量安全", "成本进度", "协作交付"];

type AbilityKey = (typeof ABILITY_KEYS)[number];

export function AbilityRadar({
  scores,
  benchmark,
  color = "#3361E8",
  labels,
}: {
  scores: Record<AbilityKey, number>;
  benchmark?: Record<AbilityKey, number>;
  color?: string;
  labels?: string[];
}) {
  const data = ABILITY_KEYS.map((key, index) => ({
    name: labels?.[index] ?? ABILITY_LABELS[index] ?? key,
    score: scores[key],
    benchmark: benchmark?.[key],
  }));

  return (
    <div className="ability-radar">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="68%">
          <PolarGrid stroke="#DBE4FF" />
          <PolarAngleAxis dataKey="name" tick={{ fill: "#465B73", fontSize: "calc(var(--scale-base) * 12)" }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          {benchmark ? <Radar dataKey="benchmark" stroke="#94A3B8" strokeDasharray="calc(var(--scale-base) * 4) calc(var(--scale-base) * 4)" fill="#94A3B8" fillOpacity={0.04} /> : null}
          <Radar dataKey="score" stroke={color} strokeWidth="calc(var(--scale-base) * 2)" fill={color} fillOpacity={0.2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
