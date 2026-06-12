import type { DecisionSupport, RiskLevel } from "@/lib/types/betting";

export type TeamMetricsInput = {
  recent5Form: string;
  goalsForLast5: number;
  goalsAgainstLast5: number;
  xGLast5: number;
  xGALast5: number;
  pressingLevel: number;
  possessionAbility: number;
  counterAttackAbility: number;
  setPieceThreat: number;
  lineupStability: number;
  injuryImpact: number;
  fatigueRisk: number;
  motivationScore: number;
  tacticalFitScore: number;
};

export type ManualMatchInput = {
  matchName: string;
  competition: string;
  kickoffTime: string;
  venue: string;
  homeTeam: string;
  awayTeam: string;
  homeMetrics: TeamMetricsInput;
  awayMetrics: TeamMetricsInput;
  marketOdds: {
    homeWinOdds: number;
    drawOdds: number;
    awayWinOdds: number;
    handicapLine: number;
    homeHandicapOdds: number;
    awayHandicapOdds: number;
    totalGoalsLine: number;
    overOdds: number;
    underOdds: number;
    bttsYesOdds: number;
    bttsNoOdds: number;
    cornerLine: number;
    cornerOverOdds: number;
    cornerUnderOdds: number;
  };
  marketMovement: {
    openingHomeWinOdds: number;
    currentHomeWinOdds: number;
    openingDrawOdds: number;
    currentDrawOdds: number;
    openingAwayWinOdds: number;
    currentAwayWinOdds: number;
    openingTotalGoalsLine: number;
    currentTotalGoalsLine: number;
    openingOverOdds: number;
    currentOverOdds: number;
    openingUnderOdds: number;
    currentUnderOdds: number;
    notes: string;
  };
};

export type MarketEvaluation = {
  id: string;
  marketType: string;
  selection: string;
  odds: number;
  modelProbability: number;
  marketImpliedProbability: number;
  normalizedMarketProbability: number;
  edge: number;
  confidenceScore: number;
  riskScore: number;
  riskLevel: RiskLevel | "Avoid";
  decisionSupport: DecisionSupport | "Avoid";
  stakeGuidance: string;
  reasoning: string[];
  warnings: string[];
};

export type ManualAnalysisRecord = {
  id: string;
  createdAt: string;
  input: ManualMatchInput;
  evaluations: MarketEvaluation[];
  reviewResult?: {
    finalScore: string;
    outcome: "hit" | "miss" | "pending";
    notes: string;
    updatedAt: string;
  };
};
