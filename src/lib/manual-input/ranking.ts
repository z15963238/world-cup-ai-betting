import type { MarketEvaluation } from "@/lib/types/manualAnalysis";

export function sortMarketEvaluations(evaluations: MarketEvaluation[]) {
  return [...evaluations].sort((a, b) => b.edge - a.edge || b.confidenceScore - a.confidenceScore || a.riskScore - b.riskScore);
}

export function splitMarketEvaluations(evaluations: MarketEvaluation[]) {
  const ordered = sortMarketEvaluations(evaluations);
  const recommended = ordered.filter((item) => item.riskLevel !== "High" && item.riskLevel !== "Avoid" && item.edge >= 0.02);
  const watchlist = ordered.filter((item) => !recommended.includes(item) && item.riskLevel !== "Avoid");
  const avoid = ordered.filter((item) => item.riskLevel === "Avoid");
  return { recommended, watchlist, avoid };
}

export function getEdgeLabel(edge: number) {
  if (edge < 0.02) return "No Edge";
  if (edge < 0.04) return "Small Edge";
  return "Positive Edge";
}
