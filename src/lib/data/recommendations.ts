import recommendationsData from "@/lib/data/recommendations.json";

export type RecommendationAdvice = {
  pick: string;
  confidence: number;
  risk: string;
  modelView: string;
  reasons: string[];
  avoid: string[];
  checklist: string[];
};

export const recommendations = recommendationsData satisfies Record<string, RecommendationAdvice>;

export const recommendationIds = Object.keys(recommendations);
