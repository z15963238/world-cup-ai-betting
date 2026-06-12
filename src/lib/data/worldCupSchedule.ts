import scheduleData from "@/lib/data/worldCupSchedule.json";
import { formatTaiwanTime } from "@/lib/time/formatTaiwanTime";

export type MatchStatus = "upcoming" | "live" | "finished";
export type DataConfidence = "high" | "medium" | "low" | "unverified";

export type WorldCupScheduleMatch = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  kickoffTimeUtc: string;
  kickoffTimeTaiwan: string;
  status: MatchStatus;
  group: string;
  venue: string;
  hasRecommendation: boolean;
  sourceName: string;
  sourceUrl: string;
  lastVerifiedAt: string;
  dataConfidence: DataConfidence;
  score?: string;
  homeScore?: number;
  awayScore?: number;
};

const scheduleInput = scheduleData as Array<Omit<WorldCupScheduleMatch, "kickoffTimeTaiwan">>;

export const worldCupSchedule: WorldCupScheduleMatch[] = scheduleInput.map((match) => ({
  ...match,
  kickoffTimeTaiwan: formatTaiwanTime(match.kickoffTimeUtc)
}));

export const sortedWorldCupSchedule = [...worldCupSchedule].sort((a, b) => {
  if (a.status === "finished" && b.status !== "finished") return 1;
  if (a.status !== "finished" && b.status === "finished") return -1;
  return new Date(a.kickoffTimeUtc).getTime() - new Date(b.kickoffTimeUtc).getTime();
});
