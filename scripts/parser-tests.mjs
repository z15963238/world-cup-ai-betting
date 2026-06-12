import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseEspnMatchPage } from "./providers/espnScheduleProvider.mjs";
import { mergeScheduleData } from "./providers/mergeScheduleData.mjs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const fixture = readFileSync(join(process.cwd(), "scripts/fixtures/espn-canada-bosnia-final.html"), "utf8");
const expected = {
  id: "canada-bosnia-herzegovina",
  homeTeam: "Canada",
  awayTeam: "Bosnia-Herzegovina",
  kickoffTimeUtc: "2026-06-12T19:00:00.000Z"
};

const parsed = parseEspnMatchPage(fixture, expected);
assert(parsed, "parser extracts finished Canada Bosnia score");
assert(parsed.homeTeam === "Canada", "parser home team");
assert(parsed.awayTeam === "Bosnia-Herzegovina", "parser away team");
assert(parsed.status === "finished", "parser finished status");
assert(parsed.homeScore === 1 && parsed.awayScore === 1 && parsed.score === "1 - 1", "parser final score");

const existingSchedule = [
  {
    id: "canada-bosnia-herzegovina",
    homeTeam: "加拿大",
    awayTeam: "波赫",
    kickoffTimeUtc: "2026-06-12T19:00:00.000Z",
    status: "upcoming",
    group: "B 組",
    venue: "BMO Field",
    hasRecommendation: true,
    sourceName: "Existing source",
    sourceUrl: "https://example.com",
    lastVerifiedAt: "2026-06-12",
    dataConfidence: "high"
  }
];

const merged = mergeScheduleData(
  existingSchedule,
  [{ source: "espn", sourceUrl: "https://www.espn.com/soccer/match/_/gameId/760416/bosnia-herzegovina-canada", records: [parsed], warnings: [] }],
  "2026-06-13"
);
assert(merged.schedule[0].status === "finished", "merge updates upcoming match to finished when provider has final score");
assert(merged.schedule[0].score === "1 - 1", "merge writes final score from provider");
assert(merged.schedule[0].dataConfidence === "medium", "single provider final score is medium confidence");

console.log("Parser tests passed");
