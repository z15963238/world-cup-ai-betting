import type { RecommendationAdvice } from "@/lib/data/recommendations";

export type AnalysisStatus = "available" | "conservative" | "missing";

export function isCompleteRecommendation(recommendation: RecommendationAdvice | undefined): recommendation is RecommendationAdvice {
  if (!recommendation) return false;
  const reasons = recommendation.reasons ?? recommendation.analysisBasis ?? [];
  const avoidMarkets = recommendation.avoidMarkets ?? recommendation.avoid ?? [];
  const checklist = recommendation.preMatchChecklist ?? recommendation.checklist ?? [];
  const hasBaseAdvice = Boolean(
    (recommendation.recommendedMarket || recommendation.pick) &&
      (recommendation.recommendationDecision || recommendation.pick) &&
      typeof recommendation.confidence === "number" &&
      recommendation.risk &&
      recommendation.modelView
  );

  if (!hasBaseAdvice) return false;

  if (recommendation.generatedBy === "auto-conservative-generator") {
    return Boolean(
      recommendation.matchId &&
        recommendation.recommendedMarket &&
        recommendation.recommendationDecision &&
        recommendation.warnings?.includes("盤口資料待確認") &&
        recommendation.warnings?.includes("先發陣容待確認") &&
        recommendation.warnings?.includes("傷病資訊待確認") &&
        recommendation.analysisBasis?.length &&
        recommendation.generatedAt &&
        reasons.length >= 4 &&
        avoidMarkets.length >= 3 &&
        checklist.length >= 4
    );
  }

  return Boolean(
      reasons.length >= 3 &&
      avoidMarkets.length >= 3 &&
      checklist.length >= 3
  );
}

export function getAnalysisStatus(recommendation: RecommendationAdvice | undefined): AnalysisStatus {
  if (!isCompleteRecommendation(recommendation)) return "missing";
  return recommendation.generatedBy === "auto-conservative-generator" ? "conservative" : "available";
}
