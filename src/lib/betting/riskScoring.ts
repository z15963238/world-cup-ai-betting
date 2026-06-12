import type { PlayerProfile, TeamProfile } from "@/lib/types/football";
import type { RiskLevel } from "@/lib/types/betting";

export function riskLevel(score: number): RiskLevel {
  if (score >= 80) return "Extreme";
  if (score >= 60) return "High";
  if (score >= 35) return "Medium";
  return "Low";
}

export function calculateRiskScore(home: TeamProfile, away: TeamProfile, players: PlayerProfile[], marketRisk: number) {
  const injuryRisk = players.reduce((sum, player) => {
    const statusRisk = player.injuryStatus === "fit" ? 0 : player.injuryStatus === "minor" ? 8 : player.injuryStatus === "doubtful" ? 18 : 30;
    return sum + statusRisk + player.fatigueRisk * 0.08;
  }, 0) / Math.max(players.length, 1);

  const volatility =
    (home.vulnerableToCounter + away.vulnerableToCounter + home.vulnerableToPress + away.vulnerableToPress) / 8;

  return Math.max(0, Math.min(100, Math.round(injuryRisk + volatility + marketRisk)));
}
