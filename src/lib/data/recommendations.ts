import recommendationsData from "@/lib/data/recommendations.json";

export type RecommendationAdvice = {
  matchId?: string;
  recommendedMarket?: string;
  recommendationDecision?: string;
  pick: string;
  confidence: number;
  risk: string;
  modelView: string;
  reasons: string[];
  avoid: string[];
  checklist: string[];
  avoidMarkets?: string[];
  preMatchChecklist?: string[];
  warnings?: string[];
  analysisBasis?: string[];
  generatedBy?: string;
  generatedAt?: string;
};

export const recommendations = recommendationsData satisfies Record<string, RecommendationAdvice>;

export const recommendationIds = Object.keys(recommendations);
