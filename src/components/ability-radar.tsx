"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { ABILITIES } from "@/lib/mock-data";
import type { AbilityKey } from "@/lib/types";

export function AbilityRadar({
  scores,
  benchmark,
  color = "#3361E8",
}: {
  scores: Record<AbilityKey, number>;
  benchmark?: Record<AbilityKey, number>;
  color?: string;
}) {
  const data = ABILITIES.map((ability) => ({
    name: ability.name.replace("装机与环境部署", "环境部署"),
    score: scores[ability.key],
    benchmark: benchmark?.[ability.key],
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="68%">
          <PolarGrid stroke="#DBE4FF" />
          <PolarAngleAxis dataKey="name" tick={{ fill: "#465B73", fontSize: 12 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          {benchmark ? <Radar dataKey="benchmark" stroke="#94A3B8" strokeDasharray="4 4" fill="#94A3B8" fillOpacity={0.04} /> : null}
          <Radar dataKey="score" stroke={color} strokeWidth={2} fill={color} fillOpacity={0.2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
