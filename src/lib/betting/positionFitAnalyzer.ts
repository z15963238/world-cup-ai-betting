import type { PlayerProfile } from "@/lib/types/football";

export function calculatePositionFitScore(player: PlayerProfile) {
  let score = 50;
  if (!player.isPositionMismatch) score += 25;
  if (player.isPositionMismatch) score -= 15;
  if (player.recentNationalTeamForm >= 80) score += 20;
  if (player.recentNationalTeamForm < 65) score -= 20;
  if (player.injuryStatus === "doubtful" || player.injuryStatus === "out") score -= 25;
  if (player.recentlyReturnedFromInjury) score -= 15;
  if (player.fatigueRisk > 60) score -= 10;
  if (player.minutesLast10 > 850) score -= 10;
  if (player.tacticalFit >= 80) score += 10;
  if (player.climateFit >= 80) score += 5;
  return Math.max(0, Math.min(100, score));
}

export function enrichPlayersWithFit(players: PlayerProfile[]) {
  return players.map((player) => ({
    ...player,
    positionFitScore: calculatePositionFitScore(player)
  }));
}
