import { mockMatches, oddsSnapshots } from "@/lib/data/mockMatches";
import { mockPlayers } from "@/lib/data/mockPlayers";
import { getTeam } from "@/lib/data/mockTeams";
import { analyzeOddsMovement } from "@/lib/betting/oddsMovementAnalyzer";
import { edge, impliedProbability, normalizeProbabilities } from "@/lib/betting/oddsMath";
import { calculateRiskScore, riskLevel } from "@/lib/betting/riskScoring";
import { enrichPlayersWithFit } from "@/lib/betting/positionFitAnalyzer";
import type { Match } from "@/lib/types/football";
import type { Recommendation, Weights } from "@/lib/types/betting";

export const defaultWeights: Weights = {
  teamForm: 0.15,
  xgTrend: 0.15,
  playerAvailability: 0.12,
  tacticalMatchup: 0.15,
  positionFit: 0.1,
  oddsMovement: 0.18,
  marketConsensus: 0.08,
  injuryRisk: 0.07
};

function resultScore(results: string[]) {
  return results.reduce((sum, result) => sum + (result === "W" ? 3 : result === "D" ? 1 : 0), 0) / (results.length * 3);
}

function chooseDecisionSupport(confidenceScore: number, valueEdge: number) {
  if (confidenceScore >= 80 && valueEdge >= 0.07) return "Strong edge" as const;
  if (confidenceScore >= 65 && valueEdge >= 0.04) return "Edge" as const;
  if (confidenceScore >= 55 && valueEdge >= 0.02) return "Small edge" as const;
  return "No edge" as const;
}

function stakeGuidance(decisionSupport: Recommendation["decisionSupport"]) {
  if (decisionSupport === "Strong edge") return "Analysis cap: 1.5% - 2.0% bankroll";
  if (decisionSupport === "Edge") return "Analysis cap: 0.75% - 1.0% bankroll";
  if (decisionSupport === "Small edge") return "Analysis cap: 0.25% - 0.5% bankroll";
  return "Analysis cap: 0% bankroll";
}

export function buildRecommendation(match: Match, weights: Weights = defaultWeights): Recommendation {
  const home = getTeam(match.homeTeamId);
  const away = getTeam(match.awayTeamId);
  if (!home || !away) throw new Error(`Missing team profile for ${match.id}`);

  const latest = oddsSnapshots.find((snapshot) => snapshot.matchId === match.id && snapshot.providerId === "global" && snapshot.timestamp === "30m");
  if (!latest) throw new Error(`Missing latest odds for ${match.id}`);

  const movement = oddsSnapshots.filter((snapshot) => snapshot.matchId === match.id && snapshot.providerId === "global");
  const signals = analyzeOddsMovement(movement);
  const teamPlayers = enrichPlayersWithFit(mockPlayers.filter((player) => [home.name, away.name].includes(player.nationalTeam)));
  const avgPositionFit = teamPlayers.reduce((sum, player) => sum + (player.positionFitScore ?? 50), 0) / Math.max(teamPlayers.length, 1);
  const availability = teamPlayers.filter((player) => player.injuryStatus === "fit" || player.injuryStatus === "minor").length / Math.max(teamPlayers.length, 1);

  const formGap = resultScore(home.recent5Results) - resultScore(away.recent5Results);
  const xgGap = (home.xGLast5 - home.xGALast5) - (away.xGLast5 - away.xGALast5);
  const tacticalGap =
    (home.possessionAbility + home.centralProgression + home.setPieceThreat - away.vulnerableToPress - away.vulnerableToCounter) / 300;
  const oddsSupport = latest.homeWin < movement[0].homeWin ? 0.05 : -0.02;
  const modelProbability = Math.max(
    0.28,
    Math.min(
      0.68,
      0.42 +
        formGap * weights.teamForm +
        xgGap * 0.025 * weights.xgTrend +
        tacticalGap * weights.tacticalMatchup +
        (avgPositionFit - 65) * 0.002 * weights.positionFit +
        availability * 0.08 * weights.playerAvailability +
        oddsSupport * weights.oddsMovement
    )
  );

  const raw = [impliedProbability(latest.homeWin), impliedProbability(latest.draw), impliedProbability(latest.awayWin)];
  const normalized = normalizeProbabilities(raw);
  const marketProbability = raw[0];
  const normalizedMarketProbability = normalized[0];
  const valueEdge = edge(modelProbability, marketProbability);
  const marketRisk = signals.reduce((sum, signal) => sum + (signal.severity === "High" ? 12 : signal.severity === "Medium" ? 7 : 3), 0);
  const riskScore = calculateRiskScore(home, away, teamPlayers, marketRisk);
  const confidenceScore = Math.max(0, Math.min(100, Math.round(52 + valueEdge * 260 + (avgPositionFit - 60) * 0.22 - riskScore * 0.18)));
  const decisionSupport = chooseDecisionSupport(confidenceScore, valueEdge);

  return {
    matchId: match.id,
    suggestedMarket: `${home.name} draw no bet / conservative home side exposure`,
    alternativeMarkets: [`${home.name} +0 Asian handicap`, "Under 3.5 goals"],
    marketsToAvoid: ["High exposure parlay", "Chasing late steam without lineup confirmation"],
    modelProbability,
    marketImpliedProbability: marketProbability,
    normalizedMarketProbability,
    edge: valueEdge,
    confidenceScore,
    riskScore,
    riskLevel: riskLevel(riskScore),
    decisionSupport,
    stakeGuidance: stakeGuidance(decisionSupport),
    reasoning: [
      `${home.name} form and xG profile are slightly stronger than market baseline.`,
      `Average position fit is ${avgPositionFit.toFixed(0)}/100 after injury and fatigue adjustment.`,
      `Market movement has ${signals.length} active warning signal(s), so staking remains capped.`
    ],
    warnings: [
      "MVP uses mock data only; analysis does not execute wagers or guarantee profit.",
      ...signals.map((signal) => signal.label)
    ]
  };
}

export function getRecommendations(weights: Weights = defaultWeights) {
  return mockMatches.map((match: Match) => buildRecommendation(match, weights));
}
