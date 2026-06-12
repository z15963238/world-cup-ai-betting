import type { DecisionSupport, RiskLevel } from "@/lib/types/betting";

export function decisionSupportLabel(value: DecisionSupport | "Avoid") {
  if (value === "Strong edge") return "高信心建議";
  if (value === "Edge") return "可考慮";
  if (value === "Small edge") return "小注觀察";
  if (value === "No edge") return "不建議";
  return "避開";
}

export function riskLevelLabel(value: RiskLevel | "Avoid") {
  if (value === "Low") return "低";
  if (value === "Medium") return "中";
  if (value === "High") return "高";
  if (value === "Extreme") return "極高";
  return "避開";
}

export function edgeLabel(value: string) {
  if (value === "No Edge") return "無優勢";
  if (value === "Small Edge") return "小優勢";
  return "正優勢";
}

export function reviewOutcomeLabel(value: "hit" | "miss" | "pending") {
  if (value === "hit") return "命中";
  if (value === "miss") return "未命中";
  return "待確認";
}

export function stakeGuidanceLabel(value: string) {
  return value
    .replace("Analysis cap:", "分析上限：")
    .replace("Avoid for now", "暫時避開")
    .replace("bankroll", "本金");
}
