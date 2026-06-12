import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchEspnScheduleData } from "./providers/espnScheduleProvider.mjs";
import { fetchFifaScheduleData } from "./providers/fifaScheduleProvider.mjs";
import { mergeScheduleData } from "./providers/mergeScheduleData.mjs";
import { expectedRecentResults } from "./expectedRecentResults.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const schedulePath = join(root, "src/lib/data/worldCupSchedule.json");
const recommendationsPath = join(root, "src/lib/data/recommendations.json");

const mode = process.argv.includes("--write") ? "write" : process.argv.includes("--dry-run") ? "dry-run" : null;
const debug = process.argv.includes("--debug");
if (!mode) {
  console.error("Usage: node scripts/update-worldcup-data.mjs --dry-run|--write");
  process.exit(1);
}

const now = new Date();
const verifiedAt = now.toISOString().slice(0, 10);
let schedule = JSON.parse(readFileSync(schedulePath, "utf8"));
const originalSchedule = JSON.stringify(schedule, null, 2);
const recommendations = JSON.parse(readFileSync(recommendationsPath, "utf8"));
const originalRecommendations = JSON.stringify(recommendations, null, 2);
const changes = [];
const warnings = [];

const providerResults = await Promise.allSettled([
  fetchFifaScheduleData({ debug }),
  fetchEspnScheduleData({ expectedRecentResults, debug })
]);
const usableProviderResults = providerResults.flatMap((result) => {
  if (result.status === "fulfilled") return [result.value];
  warnings.push(`Provider failed without data changes: ${result.reason?.message || result.reason}`);
  return [];
});

const merged = mergeScheduleData(schedule, usableProviderResults, verifiedAt);
schedule = merged.schedule;
changes.push(...merged.changes);
warnings.push(...merged.warnings);
if (debug) for (const line of merged.debugLines) console.log(line);

for (const match of schedule) {
  normalizeDataConfidence(match, changes);
  validateRecord(match, warnings);

  const hoursUntilKickoff = (new Date(match.kickoffTimeUtc).getTime() - now.getTime()) / 36e5;
  if (match.status === "upcoming" && hoursUntilKickoff >= 0 && hoursUntilKickoff <= 48) {
    if (ensureConservativeRecommendation(match, recommendations)) {
      match.hasRecommendation = true;
      changes.push(`${match.id}: added conservative 24-48h AI advice`);
    }
  }
}

for (const expected of expectedRecentResults) {
  const kickoffPlusWindow = new Date(new Date(expected.kickoffTimeUtc).getTime() + 2.5 * 36e5);
  const scheduleMatch = schedule.find((match) => match.id === expected.id);
  if (now > kickoffPlusWindow && (!scheduleMatch || scheduleMatch.status !== "finished" || !scheduleMatch.score)) {
    warnings.push(`${expected.id}: 已過完賽時間，但外部資料源尚未解析到比分`);
    if (debug) console.log(`[MERGE] ${expected.id} no verified provider score available`);
  }
}

if (warnings.length) {
  console.warn("Warnings:");
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (mode === "dry-run") {
  console.log("Dry run completed.");
  console.log(changes.length ? changes.join("\n") : "No changes needed.");
  console.log(nextWriteSummary(schedule, recommendations, originalSchedule, originalRecommendations));
  process.exit(0);
}

const nextSchedule = JSON.stringify(schedule, null, 2);
const nextRecommendations = JSON.stringify(recommendations, null, 2);

if (nextSchedule !== originalSchedule) writeFileSync(schedulePath, `${nextSchedule}\n`);
if (nextRecommendations !== originalRecommendations) writeFileSync(recommendationsPath, `${nextRecommendations}\n`);

console.log(changes.length ? changes.join("\n") : "No changes needed.");

if (!existsSync(schedulePath) || !existsSync(recommendationsPath)) {
  console.error("Expected data files were not found after write.");
  process.exit(1);
}

function nextWriteSummary(nextSchedule, nextRecommendations, previousSchedule, previousRecommendations) {
  const scheduleChanged = JSON.stringify(nextSchedule, null, 2) !== previousSchedule;
  const recommendationsChanged = JSON.stringify(nextRecommendations, null, 2) !== previousRecommendations;
  return `[WRITE] schedule would update: ${scheduleChanged}; recommendations would update: ${recommendationsChanged}`;
}

function normalizeDataConfidence(match, log) {
  if (["high", "medium", "low", "unverified"].includes(match.dataConfidence)) return;
  match.dataConfidence = "unverified";
  log.push(`${match.id}: normalized invalid dataConfidence to unverified`);
}

function validateRecord(match, log) {
  if (!match.id || !match.kickoffTimeUtc) log.push(`Missing id/kickoffTimeUtc: ${JSON.stringify(match)}`);
  if (match.status === "finished" && !match.score) log.push(`Finished match missing score: ${match.id}`);
  if (match.status !== "finished" && match.score) log.push(`Unfinished match has final score: ${match.id}`);
  if (match.dataConfidence === "high" && (!match.sourceName || !match.sourceUrl || !match.lastVerifiedAt)) {
    match.dataConfidence = "unverified";
    log.push(`${match.id}: downgraded high confidence because source metadata was incomplete`);
  }
}

function ensureConservativeRecommendation(match, target) {
  if (target[match.id]) return false;
  target[match.id] = buildConservativeRecommendation(match);
  return true;
}

function buildConservativeRecommendation(match) {
  return {
    pick: "觀察，不急著下注",
    confidence: 42,
    risk: "中偏高",
    modelView: `${match.homeTeam} vs ${match.awayTeam} 的賽程接近開賽，但目前沒有球員 API、盤口 API 或完整傷停資料。盤口資料待確認，因此只給保守觀察建議。`,
    reasons: [
      "賽程資料可用，但陣容、傷停與盤口資料仍待確認。",
      "目前不串付費 API，也沒有即時 bookmaker 資料。",
      "資料不足時不應提高把握度，先以風險控管為主。"
    ],
    avoid: ["高信心單邊投注", "未確認盤口前追熱門", "把未驗證資料當成官方結論"],
    checklist: ["確認官方賽程與開賽時間。", "確認先發陣容與主要傷停。", "確認盤口資料來源與更新時間。"]
  };
}
