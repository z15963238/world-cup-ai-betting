import { formatTaiwanTime } from "@/lib/time/formatTaiwanTime";
import type { WorldCupScheduleMatch } from "@/lib/data/worldCupSchedule";

export type ScheduleValidationResult = {
  valid: boolean;
  errors: string[];
};

export function validateWorldCupSchedule(
  schedule: WorldCupScheduleMatch[],
  recommendationMatchIds: string[] = [],
  matchData: Array<{ id: string; actualResult?: string; status?: string }> = []
): ScheduleValidationResult {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const blockedMatchups = [
    { homeTeam: "\u52a0\u62ff\u5927", awayTeam: "\u65e5\u672c", label: "Canada vs Japan" },
    { homeTeam: "\u7f8e\u570b", awayTeam: "\u8fe6\u7d0d", label: "USA vs Ghana" }
  ];

  for (const match of schedule) {
    if (seenIds.has(match.id)) errors.push(`Duplicate schedule id: ${match.id}`);
    seenIds.add(match.id);

    if (!match.kickoffTimeUtc) errors.push(`Missing kickoffTimeUtc: ${match.id}`);

    const formattedTaiwanTime = formatTaiwanTime(match.kickoffTimeUtc);
    if (formattedTaiwanTime.includes("Invalid") || formattedTaiwanTime.includes("\u6642\u9593\u5f85\u78ba\u8a8d")) {
      errors.push(`Invalid Taiwan time: ${match.id}`);
    }

    if (match.status === "finished" && !match.score) errors.push(`Finished match missing score: ${match.id}`);
    if (match.status !== "finished" && match.score) errors.push(`Unfinished match should not have final score: ${match.id}`);
    if (
      blockedMatchups.some((blocked) => blocked.homeTeam === match.homeTeam && blocked.awayTeam === match.awayTeam) &&
      !(match.dataConfidence === "high" && match.sourceName.toLowerCase().includes("fifa official"))
    ) {
      errors.push(`Blocked unverified matchup: ${match.id}`);
    }
    if (match.hasRecommendation && !recommendationMatchIds.includes(match.id)) {
      errors.push(`Missing recommendation for schedule match: ${match.id}`);
    }
    const matchingMatchData = matchData.find((item) => item.id === match.id);
    if (matchingMatchData?.actualResult && matchingMatchData.actualResult !== match.score) {
      errors.push(`Score mismatch between match data and schedule data: ${match.id}`);
    }
    if (matchingMatchData?.status && matchingMatchData.status !== match.status) {
      errors.push(`Status mismatch between match data and schedule data: ${match.id}`);
    }
    if (match.dataConfidence === "high" && (!match.sourceName || !match.sourceUrl || !match.lastVerifiedAt)) {
      errors.push(`High confidence match missing source metadata: ${match.id}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
