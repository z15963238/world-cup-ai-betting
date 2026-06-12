import { Badge } from "@/components/ui/badge";
import { decisionSupportLabel, edgeLabel, riskLevelLabel, stakeGuidanceLabel } from "@/lib/i18n/labels";
import { getEdgeLabel, splitMarketEvaluations } from "@/lib/manual-input/ranking";
import { formatEdge, formatPercent } from "@/lib/utils";
import type { MarketEvaluation } from "@/lib/types/manualAnalysis";

const toneByDecision = {
  "Strong edge": "success",
  Edge: "success",
  "Small edge": "muted",
  "No edge": "muted",
  Avoid: "danger"
} as const;

export function RecommendationRanking({ evaluations }: { evaluations: MarketEvaluation[] }) {
  const { recommended, watchlist, avoid } = splitMarketEvaluations(evaluations);

  return (
    <div className="space-y-5">
      <RankingTable title="推薦" evaluations={recommended} startRank={1} />
      <RankingTable title="觀察" evaluations={watchlist} startRank={recommended.length + 1} />
      <RankingTable title="避開" evaluations={avoid} startRank={recommended.length + watchlist.length + 1} />
    </div>
  );
}

function RankingTable({ title, evaluations, startRank }: { title: string; evaluations: MarketEvaluation[]; startRank: number }) {
  return (
    <section>
      <h3 className="mb-3 text-base font-semibold">{title}</h3>
      <div className="overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">排序</th>
              <th>市場</th>
              <th>選項</th>
              <th>賠率</th>
              <th>模型勝率</th>
              <th>去水後機率</th>
              <th>優勢值</th>
              <th>優勢標籤</th>
              <th>信心分數</th>
              <th>風險等級</th>
              <th>倉位建議</th>
              <th>決策建議</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-muted-foreground" colSpan={12}>
                  此區目前沒有符合條件的市場。
                </td>
              </tr>
            ) : (
              evaluations.map((item, index) => (
                <tr key={item.id} className="border-t border-border">
                  <td className="px-3 py-3 font-semibold">{startRank + index}</td>
                  <td>{item.marketType}</td>
                  <td>{item.selection}</td>
                  <td>{item.odds.toFixed(2)}</td>
                  <td>{formatPercent(item.modelProbability)}</td>
                  <td>{formatPercent(item.normalizedMarketProbability)}</td>
                  <td className={item.edge >= 0.02 ? "font-semibold text-emerald-700" : "text-slate-500"}>{formatEdge(item.edge)}</td>
                  <td>{edgeLabel(getEdgeLabel(item.edge))}</td>
                  <td>{item.confidenceScore}/100</td>
                  <td>{riskLevelLabel(item.riskLevel)}</td>
                  <td>{stakeGuidanceLabel(item.stakeGuidance)}</td>
                  <td>
                    <Badge tone={toneByDecision[item.decisionSupport]}>{decisionSupportLabel(item.decisionSupport)}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
