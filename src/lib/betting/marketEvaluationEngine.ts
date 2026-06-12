import {
  calculateEdge,
  impliedProbability,
  normalizeOneX2Market,
  normalizeTwoWayMarket,
  validateDecimalOdds
} from "@/lib/betting/oddsMath";
import type { DecisionSupport, RiskLevel } from "@/lib/types/betting";
import type { ManualMatchInput, MarketEvaluation, TeamMetricsInput } from "@/lib/types/manualAnalysis";

type CandidateMarket = {
  marketType: string;
  selection: string;
  odds: number;
  modelProbability: number;
  normalizedMarketProbability: number;
  reasoning: string[];
  warnings: string[];
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function formScore(form: string) {
  const results = form
    .toUpperCase()
    .split("")
    .filter((item) => ["W", "D", "L"].includes(item));
  if (results.length === 0) return 0.5;
  return results.reduce((sum, result) => sum + (result === "W" ? 3 : result === "D" ? 1 : 0), 0) / (results.length * 3);
}

function teamStrength(team: TeamMetricsInput) {
  const attack = team.goalsForLast5 * 4 + team.xGLast5 * 5;
  const defense = 30 - team.goalsAgainstLast5 * 3 - team.xGALast5 * 4;
  const tactical =
    (team.pressingLevel + team.possessionAbility + team.counterAttackAbility + team.setPieceThreat + team.lineupStability + team.motivationScore + team.tacticalFitScore) / 7;
  const riskDrag = (team.injuryImpact + team.fatigueRisk) * 0.45;
  return clamp(formScore(team.recent5Form) * 35 + attack + defense + tactical * 0.45 - riskDrag, 1, 100);
}

function riskLevel(score: number): RiskLevel | "Avoid" {
  if (score >= 78) return "Avoid";
  if (score >= 62) return "High";
  if (score >= 38) return "Medium";
  return "Low";
}

function decisionSupport(edge: number, confidenceScore: number, level: RiskLevel | "Avoid"): DecisionSupport | "Avoid" {
  if (level === "Avoid") return "Avoid";
  if (level === "High") return edge < 0.06 ? "No edge" : "Small edge";
  if (edge < 0.02) return "No edge";
  if (confidenceScore >= 80 && edge >= 0.07) return "Strong edge";
  if (confidenceScore >= 65 && edge >= 0.04) return "Edge";
  return "Small edge";
}

function stakeGuidance(decision: DecisionSupport | "Avoid") {
  if (decision === "Strong edge") return "Analysis cap: 1.5% - 2.0% bankroll";
  if (decision === "Edge") return "Analysis cap: 0.75% - 1.0% bankroll";
  if (decision === "Small edge") return "Analysis cap: 0.25% - 0.5% bankroll";
  if (decision === "Avoid") return "Avoid for now";
  return "Analysis cap: 0% bankroll";
}

function movementPressure(openingOdds: number, currentOdds: number) {
  if (!validateDecimalOdds(openingOdds).valid || !validateDecimalOdds(currentOdds).valid) return 0;
  return impliedProbability(currentOdds) - impliedProbability(openingOdds);
}

function buildEvaluation(candidate: CandidateMarket, baseRisk: number): MarketEvaluation {
  const oddsValidation = validateDecimalOdds(candidate.odds);
  const marketImpliedProbability = impliedProbability(candidate.odds);
  const valueEdge = calculateEdge(candidate.modelProbability, marketImpliedProbability);
  const riskScore = clamp(Math.round(baseRisk + Math.max(0, -valueEdge) * 90 + (candidate.warnings.length * 5)), 0, 100);
  const level = riskLevel(riskScore);
  const confidenceScore = clamp(Math.round(52 + valueEdge * 260 + candidate.modelProbability * 16 - riskScore * 0.18), 0, 100);
  const decision = oddsValidation.valid ? decisionSupport(valueEdge, confidenceScore, level) : "Avoid";

  return {
    id: `${candidate.marketType}-${candidate.selection}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    marketType: candidate.marketType,
    selection: candidate.selection,
    odds: candidate.odds,
    modelProbability: candidate.modelProbability,
    marketImpliedProbability,
    normalizedMarketProbability: candidate.normalizedMarketProbability,
    edge: valueEdge,
    confidenceScore,
    riskScore,
    riskLevel: oddsValidation.valid ? level : "Avoid",
    decisionSupport: decision,
    stakeGuidance: stakeGuidance(decision),
    reasoning: candidate.reasoning,
    warnings: oddsValidation.valid ? candidate.warnings : [...candidate.warnings, oddsValidation.error ?? "Invalid odds"]
  };
}

function sortEvaluations(evaluations: MarketEvaluation[]) {
  return [...evaluations].sort((a, b) => {
    const aBlocked = a.riskLevel === "High" || a.riskLevel === "Avoid";
    const bBlocked = b.riskLevel === "High" || b.riskLevel === "Avoid";
    if (aBlocked !== bBlocked) return aBlocked ? 1 : -1;
    if (b.edge !== a.edge) return b.edge - a.edge;
    if (b.confidenceScore !== a.confidenceScore) return b.confidenceScore - a.confidenceScore;
    return a.riskScore - b.riskScore;
  });
}

export function evaluateManualMatch(input: ManualMatchInput) {
  const home = input.homeMetrics;
  const away = input.awayMetrics;
  const homeStrength = teamStrength(home);
  const awayStrength = teamStrength(away);
  const strengthGap = homeStrength - awayStrength;
  const totalXG = home.xGLast5 + away.xGLast5;
  const totalXGA = home.xGALast5 + away.xGALast5;
  const paceScore = (home.pressingLevel + away.pressingLevel + home.counterAttackAbility + away.counterAttackAbility) / 4;
  const injuryFatigueRisk = (home.injuryImpact + away.injuryImpact + home.fatigueRisk + away.fatigueRisk) / 4;
  const baseRisk = clamp(injuryFatigueRisk * 0.55 + Math.abs(home.lineupStability - away.lineupStability) * 0.15, 8, 85);
  const oneX2 = normalizeOneX2Market(input.marketOdds.homeWinOdds, input.marketOdds.drawOdds, input.marketOdds.awayWinOdds);
  const handicap = normalizeTwoWayMarket(input.marketOdds.homeHandicapOdds, input.marketOdds.awayHandicapOdds);
  const goals = normalizeTwoWayMarket(input.marketOdds.overOdds, input.marketOdds.underOdds);
  const btts = normalizeTwoWayMarket(input.marketOdds.bttsYesOdds, input.marketOdds.bttsNoOdds);
  const corners = normalizeTwoWayMarket(input.marketOdds.cornerOverOdds, input.marketOdds.cornerUnderOdds);
  const homeSteam = movementPressure(input.marketMovement.openingHomeWinOdds, input.marketMovement.currentHomeWinOdds);
  const awaySteam = movementPressure(input.marketMovement.openingAwayWinOdds, input.marketMovement.currentAwayWinOdds);
  const overSteam = movementPressure(input.marketMovement.openingOverOdds, input.marketMovement.currentOverOdds);
  const underSteam = movementPressure(input.marketMovement.openingUnderOdds, input.marketMovement.currentUnderOdds);
  const totalLineMove = input.marketMovement.currentTotalGoalsLine - input.marketMovement.openingTotalGoalsLine;
  const homeWinProbability = clamp(0.38 + strengthGap * 0.0038 + homeSteam * 0.2, 0.12, 0.72);
  const awayWinProbability = clamp(0.32 - strengthGap * 0.0036 + awaySteam * 0.2, 0.1, 0.68);
  const drawProbability = clamp(1 - homeWinProbability - awayWinProbability, 0.16, 0.34);
  const overProbability = clamp(0.42 + (totalXG + totalXGA - 20) * 0.015 + (paceScore - 60) * 0.002 + totalLineMove * 0.03 + overSteam * 0.2, 0.18, 0.78);
  const underProbability = clamp(1 - overProbability + underSteam * 0.1, 0.18, 0.78);
  const bttsYesProbability = clamp(0.44 + (home.xGLast5 + away.xGLast5 - home.xGALast5 - away.xGALast5) * 0.01 + paceScore * 0.0015, 0.22, 0.76);
  const cornerOverProbability = clamp(0.45 + (home.pressingLevel + away.pressingLevel + home.setPieceThreat + away.setPieceThreat - 250) * 0.0018, 0.22, 0.76);

  const sharedWarnings = [
    "Analysis-only output. The system does not execute wagers or connect betting accounts.",
    ...(input.marketMovement.notes ? [`Market notes: ${input.marketMovement.notes}`] : [])
  ];

  const candidates: CandidateMarket[] = [
    {
      marketType: "1X2",
      selection: `${input.homeTeam} win`,
      odds: input.marketOdds.homeWinOdds,
      modelProbability: homeWinProbability,
      normalizedMarketProbability: oneX2[0],
      reasoning: [`Home strength ${homeStrength.toFixed(1)} vs away strength ${awayStrength.toFixed(1)}.`, "Home price movement is included in the model."],
      warnings: sharedWarnings
    },
    {
      marketType: "1X2",
      selection: "Draw",
      odds: input.marketOdds.drawOdds,
      modelProbability: drawProbability,
      normalizedMarketProbability: oneX2[1],
      reasoning: ["Draw probability is derived from the remaining 1X2 distribution.", "Higher lineup uncertainty increases draw variance."],
      warnings: sharedWarnings
    },
    {
      marketType: "1X2",
      selection: `${input.awayTeam} win`,
      odds: input.marketOdds.awayWinOdds,
      modelProbability: awayWinProbability,
      normalizedMarketProbability: oneX2[2],
      reasoning: [`Away strength ${awayStrength.toFixed(1)} vs home strength ${homeStrength.toFixed(1)}.`, "Away price movement is included in the model."],
      warnings: sharedWarnings
    },
    {
      marketType: "Asian Handicap",
      selection: `${input.homeTeam} ${input.marketOdds.handicapLine}`,
      odds: input.marketOdds.homeHandicapOdds,
      modelProbability: clamp(homeWinProbability + 0.1 - Math.max(0, input.marketOdds.handicapLine) * 0.08, 0.18, 0.82),
      normalizedMarketProbability: handicap[0],
      reasoning: ["Handicap estimate adjusts 1X2 strength by the entered handicap line."],
      warnings: sharedWarnings
    },
    {
      marketType: "Asian Handicap",
      selection: `${input.awayTeam} ${-input.marketOdds.handicapLine}`,
      odds: input.marketOdds.awayHandicapOdds,
      modelProbability: clamp(awayWinProbability + 0.1 + Math.max(0, input.marketOdds.handicapLine) * 0.08, 0.18, 0.82),
      normalizedMarketProbability: handicap[1],
      reasoning: ["Away handicap estimate adjusts away strength by the entered handicap line."],
      warnings: sharedWarnings
    },
    {
      marketType: "Total Goals",
      selection: `Over ${input.marketOdds.totalGoalsLine}`,
      odds: input.marketOdds.overOdds,
      modelProbability: overProbability,
      normalizedMarketProbability: goals[0],
      reasoning: ["Total estimate uses xG trend, xGA trend, pace, total line movement, and over odds movement."],
      warnings: sharedWarnings
    },
    {
      marketType: "Total Goals",
      selection: `Under ${input.marketOdds.totalGoalsLine}`,
      odds: input.marketOdds.underOdds,
      modelProbability: underProbability,
      normalizedMarketProbability: goals[1],
      reasoning: ["Under estimate reacts to xGA profile, total line movement, and under odds movement."],
      warnings: sharedWarnings
    },
    {
      marketType: "BTTS",
      selection: "BTTS Yes",
      odds: input.marketOdds.bttsYesOdds,
      modelProbability: bttsYesProbability,
      normalizedMarketProbability: btts[0],
      reasoning: ["BTTS Yes uses both teams' xG production and match pace."],
      warnings: sharedWarnings
    },
    {
      marketType: "BTTS",
      selection: "BTTS No",
      odds: input.marketOdds.bttsNoOdds,
      modelProbability: clamp(1 - bttsYesProbability, 0.18, 0.78),
      normalizedMarketProbability: btts[1],
      reasoning: ["BTTS No is the inverse view after xG and pace adjustment."],
      warnings: sharedWarnings
    },
    {
      marketType: "Corner Total",
      selection: `Corner Over ${input.marketOdds.cornerLine}`,
      odds: input.marketOdds.cornerOverOdds,
      modelProbability: cornerOverProbability,
      normalizedMarketProbability: corners[0],
      reasoning: ["Corner model uses pressing level and set-piece threat."],
      warnings: sharedWarnings
    },
    {
      marketType: "Corner Total",
      selection: `Corner Under ${input.marketOdds.cornerLine}`,
      odds: input.marketOdds.cornerUnderOdds,
      modelProbability: clamp(1 - cornerOverProbability, 0.18, 0.78),
      normalizedMarketProbability: corners[1],
      reasoning: ["Corner under is the inverse view after pressing and set-piece adjustment."],
      warnings: sharedWarnings
    }
  ];

  return sortEvaluations(candidates.map((candidate) => buildEvaluation(candidate, baseRisk)));
}
