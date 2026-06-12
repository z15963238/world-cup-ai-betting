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
};

const fifaScoresUrl = "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures";
const espnResultsUrl = "https://www.espn.com/soccer/story/_/id/48939282/2026-fifa-world-cup-fixtures-results-match-schedule-group-stage-knockout-rounds-bracket";
const espnDailyScheduleUrl = "https://www.espn.com/soccer/schedule/_/league/fifa.world";
const guardianDailyUrl = "https://www.theguardian.com/football/2026/jun/12/how-to-watch-world-cup-usa-paraguay-canada-bosnia-and-herzegovina";
const cbsScheduleUrl = "https://www.cbssports.com/soccer/news/world-cup-2026-schedule-times-dates/";

const verifiedResultSource = {
  sourceName: "FIFA official scores fixtures, cross-checked with ESPN fixtures/results",
  sourceUrl: fifaScoresUrl,
  lastVerifiedAt: "2026-06-12",
  dataConfidence: "high"
} as const;

const verifiedJune12Source = {
  sourceName: "ESPN daily schedule, cross-checked with Guardian matchday guide",
  sourceUrl: espnDailyScheduleUrl,
  lastVerifiedAt: "2026-06-12",
  dataConfidence: "high"
} as const;

const verifiedJune13Source = {
  sourceName: "ESPN schedule and CBS Sports fixture list",
  sourceUrl: cbsScheduleUrl,
  lastVerifiedAt: "2026-06-12",
  dataConfidence: "high"
} as const;

const scheduleInput = [
  { id: "mexico-south-africa", homeTeam: "\u58a8\u897f\u54e5", awayTeam: "\u5357\u975e", kickoffTimeUtc: "2026-06-12T01:00:00.000Z", status: "finished", group: "A \u7d44", venue: "\u963f\u8332\u7279\u514b\u9ad4\u80b2\u5834", hasRecommendation: true, score: "2 - 0", ...verifiedResultSource },
  { id: "south-korea-czechia", homeTeam: "\u5357\u97d3", awayTeam: "\u6377\u514b", kickoffTimeUtc: "2026-06-12T02:00:00.000Z", status: "finished", group: "A \u7d44", venue: "\u74dc\u9054\u62c9\u54c8\u62c9\u9ad4\u80b2\u5834", hasRecommendation: true, score: "2 - 1", ...verifiedResultSource, sourceUrl: espnResultsUrl },
  { id: "canada-bosnia-herzegovina", homeTeam: "\u52a0\u62ff\u5927", awayTeam: "\u6ce2\u8d6b", kickoffTimeUtc: "2026-06-12T19:00:00.000Z", status: "upcoming", group: "B \u7d44", venue: "\u591a\u502b\u591a BMO Field", hasRecommendation: true, ...verifiedJune12Source },
  { id: "usa-paraguay", homeTeam: "\u7f8e\u570b", awayTeam: "\u5df4\u62c9\u572d", kickoffTimeUtc: "2026-06-13T01:00:00.000Z", status: "upcoming", group: "D \u7d44", venue: "\u6d1b\u6749\u78ef SoFi Stadium", hasRecommendation: true, ...verifiedJune12Source, sourceUrl: guardianDailyUrl },
  { id: "qatar-switzerland", homeTeam: "\u5361\u9054", awayTeam: "\u745e\u58eb", kickoffTimeUtc: "2026-06-13T19:00:00.000Z", status: "upcoming", group: "B \u7d44", venue: "Levi's Stadium", hasRecommendation: false, ...verifiedJune13Source },
  { id: "brazil-morocco", homeTeam: "\u5df4\u897f", awayTeam: "\u6469\u6d1b\u54e5", kickoffTimeUtc: "2026-06-13T22:00:00.000Z", status: "upcoming", group: "C \u7d44", venue: "\u6771\u6d77\u5cb8\u9ad4\u80b2\u5834", hasRecommendation: false, ...verifiedJune13Source },
  { id: "haiti-scotland", homeTeam: "\u6d77\u5730", awayTeam: "\u8607\u683c\u862d", kickoffTimeUtc: "2026-06-14T01:00:00.000Z", status: "upcoming", group: "C \u7d44", venue: "Gillette Stadium", hasRecommendation: false, ...verifiedJune13Source },
  { id: "australia-turkiye", homeTeam: "\u6fb3\u6d32", awayTeam: "\u571f\u8033\u5176", kickoffTimeUtc: "2026-06-14T04:00:00.000Z", status: "upcoming", group: "D \u7d44", venue: "\u5834\u9928\u5f85\u78ba\u8a8d", hasRecommendation: false, ...verifiedJune13Source }
] satisfies Array<Omit<WorldCupScheduleMatch, "kickoffTimeTaiwan">>;

export const worldCupSchedule: WorldCupScheduleMatch[] = scheduleInput.map((match) => ({
  ...match,
  kickoffTimeTaiwan: formatTaiwanTime(match.kickoffTimeUtc)
}));

export const sortedWorldCupSchedule = [...worldCupSchedule].sort((a, b) => {
  if (a.status === "finished" && b.status !== "finished") return 1;
  if (a.status !== "finished" && b.status === "finished") return -1;
  return new Date(a.kickoffTimeUtc).getTime() - new Date(b.kickoffTimeUtc).getTime();
});
