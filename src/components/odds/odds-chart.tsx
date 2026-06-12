"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { OddsSnapshot } from "@/lib/types/betting";

export function OddsChart({ data }: { data: OddsSnapshot[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <XAxis dataKey="timestamp" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} domain={["dataMin - 0.08", "dataMax + 0.08"]} />
          <Tooltip />
          <Line type="monotone" dataKey="homeWin" stroke="#0f766e" strokeWidth={2} dot={false} name="主勝" />
          <Line type="monotone" dataKey="draw" stroke="#64748b" strokeWidth={2} dot={false} name="和局" />
          <Line type="monotone" dataKey="awayWin" stroke="#dc2626" strokeWidth={2} dot={false} name="客勝" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
