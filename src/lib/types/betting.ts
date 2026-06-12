export type MarketType = "matchWinner" | "spread" | "total" | "btts";

export type OddsProvider = {
  id: string;
  name: string;
  region: string;
  isSharp: boolean;
};

export type OddsSnapshot = {
  matchId: string;
  providerId: string;
  timestamp: string;
  homeWin: number;
  draw: number;
  awayWin: number;
  spreadLine: number;
  homeSpread: number;
  awaySpread: number;
  totalLine: number;
  over: number;
  under: number;
  bttsYes: number;
  bttsNo: number;
  volumeIndex: number;
};

export type Weights = {
  teamForm: number;
  xgTrend: number;
  playerAvailability: number;
  tacticalMatchup: number;
  positionFit: number;
  oddsMovement: number;
  marketConsensus: number;
  injuryRisk: number;
};

export type DecisionSupport = "Strong edge" | "Edge" | "Small edge" | "No edge";
export type RiskLevel = "Low" | "Medium" | "High" | "Extreme";

export type Recommendation = {
  matchId: string;
  suggestedMarket: string;
  alternativeMarkets: string[];
  marketsToAvoid: string[];
  modelProbability: number;
  marketImpliedProbability: number;
  normalizedMarketProbability: number;
  edge: number;
  confidenceScore: number;
  riskScore: number;
  riskLevel: RiskLevel;
  decisionSupport: DecisionSupport;
  stakeGuidance: string;
  reasoning: string[];
  warnings: string[];
};

export type OddsSignal = {
  label: string;
  severity: RiskLevel;
  description: string;
};
