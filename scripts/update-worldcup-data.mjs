import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expectedRecentResults } from "./expectedRecentResults.mjs";
import { fetchEspnScheduleData } from "./providers/espnScheduleProvider.mjs";
import { fetchFifaScheduleData } from "./providers/fifaScheduleProvider.mjs";
import { mergeScheduleData } from "./providers/mergeScheduleData.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const schedulePath = join(root, "src/lib/data/worldCupSchedule.json");
const recommendationsPath = join(root, "src/lib/data/recommendations.json");
const mode = process.argv.includes("--write") ? "write" : process.argv.includes("--dry-run") ? "dry-run" : null;
const debug = process.argv.includes("--debug");

if (!mode) {
  console.error("Usage: node scripts/update-worldcup-data.mjs --dry-run|--write [--debug]");
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
const stats = {
  fetchedMatchesCount: 0,
  parsedMatchesCount: 0,
  mergedScheduleUpdatesCount: 0,
  scoreUpdatesCount: 0,
  scorePendingCount: 0,
  generatedRecommendationsCount: 0,
  skippedExistingRecommendationsCount: 0,
  next48hMatchesCount: 0,
  tomorrowMatchesCount: 0
};

const providerResults = await Promise.allSettled([
  fetchFifaScheduleData({ debug }),
  fetchEspnScheduleData({ expectedRecentResults, debug })
]);

const usableProviderResults = providerResults.flatMap((result) => {
  if (result.status === "fulfilled") return [result.value];
  warnings.push(`Provider failed without data changes: ${result.reason?.message || result.reason}`);
  return [];
});

stats.fetchedMatchesCount = usableProviderResults.reduce((sum, result) => sum + (result.fetchedMatchesCount || result.records.length), 0);
stats.parsedMatchesCount = usableProviderResults.reduce((sum, result) => sum + result.records.length, 0);

const merged = mergeScheduleData(schedule, usableProviderResults, verifiedAt);
schedule = merged.schedule;
changes.push(...merged.changes);
warnings.push(...merged.warnings);
stats.mergedScheduleUpdatesCount = merged.changes.length;
stats.scoreUpdatesCount = merged.changes.filter((change) => change.includes("finished") || change.includes("score") || change.includes("schedule data")).length;
if (debug) for (const line of merged.debugLines) console.log(line);

for (const match of schedule) {
  normalizeDataConfidence(match, changes);
  validateRecord(match, warnings);

  if (match.status === "upcoming" && isNext48Hours(match, now)) stats.next48hMatchesCount += 1;
  if (match.status === "upcoming" && isTomorrowInTaipei(match, now)) stats.tomorrowMatchesCount += 1;
  if (match.status !== "finished" && isPastScoreConfirmationWindow(match, now)) stats.scorePendingCount += 1;

  if (match.status === "upcoming" && isInAutoRecommendationWindow(match, now)) {
    const action = ensureConservativeRecommendation(match, recommendations);
    if (action === "created") {
      match.hasRecommendation = true;
      stats.generatedRecommendationsCount += 1;
      changes.push(`${match.id}: added conservative today/tomorrow/48h AI advice`);
    } else if (action === "updated") {
      match.hasRecommendation = true;
      changes.push(`${match.id}: normalized conservative today/tomorrow/48h AI advice`);
    } else {
      stats.skippedExistingRecommendationsCount += 1;
      if (debug) console.log(`[RECOMMENDATION] ${match.id}: skipped existing recommendation`);
    }
  }
}

for (const expected of expectedRecentResults) {
  const scheduleMatch = schedule.find((match) => match.id === expected.id);
  if (now > new Date(expected.kickoffTimeUtc).getTime() + 2.5 * 36e5 && (!scheduleMatch || scheduleMatch.status !== "finished" || !scheduleMatch.score)) {
    warnings.push(`${expected.id}: finished-time window passed, but external providers did not parse a final score`);
    if (debug) console.log(`[MERGE] ${expected.id} no verified provider score available`);
  }
}

if (debug) {
  console.log(`[STATS] fetched matches count: ${stats.fetchedMatchesCount}`);
  console.log(`[STATS] parsed matches count: ${stats.parsedMatchesCount}`);
  console.log(`[STATS] merged schedule updates count: ${stats.mergedScheduleUpdatesCount}`);
  console.log(`[STATS] score updates count: ${stats.scoreUpdatesCount}`);
  console.log(`[STATS] score_pending count: ${stats.scorePendingCount}`);
  console.log(`[STATS] generated recommendations count: ${stats.generatedRecommendationsCount}`);
  console.log(`[STATS] skipped existing recommendations count: ${stats.skippedExistingRecommendationsCount}`);
  console.log(`[STATS] next 48h matches count: ${stats.next48hMatchesCount}`);
  console.log(`[STATS] tomorrow matches count: ${stats.tomorrowMatchesCount}`);
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
  if (!target[match.id]) {
    target[match.id] = buildConservativeRecommendation(match);
    return "created";
  }
  if (isConservativePlaceholder(target[match.id])) {
    const nextRecommendation = buildConservativeRecommendation(match);
    if (JSON.stringify(target[match.id]) === JSON.stringify(nextRecommendation)) return "skipped";
    target[match.id] = nextRecommendation;
    return "updated";
  }
  if (target[match.id].confidence > 62) target[match.id].confidence = 62;
  return "skipped";
}

function isConservativePlaceholder(recommendation) {
  return (
    recommendation.pick === "觀察，不急著下注" ||
    recommendation.pick === "小 3.5 球，或暫不建議重點下注" ||
    String(recommendation.modelView || "").includes("盤口資料待確認")
  );
}

function buildConservativeRecommendation(match) {
  return {
    pick: "小 3.5 球，或暫不建議重點下注",
    confidence: 48,
    risk: "中高",
    modelView: `${match.homeTeam} vs ${match.awayTeam} 接近開賽，但盤口資料待確認、先發陣容待確認、傷病資訊待確認。先採保守分析，不做高信心判斷。`,
    reasons: [
      "盤口資料待確認，不能用高信心解讀。",
      "先發陣容待確認，臨場變動可能影響節奏與進球期望。",
      "傷病資訊待確認，暫時只採保守方向。",
      "目前不串球員 API、不串賠率 API，也不登入任何下注平台。"
    ],
    avoid: ["正確比分", "球員市場", "角球或紅黃牌市場", "高賠冷門與過度追熱門"],
    checklist: ["確認官方開賽時間。", "確認先發陣容。", "確認傷病資訊。", "確認臨場盤口是否劇烈變動。"]
  };
}

function isInAutoRecommendationWindow(match, referenceDate) {
  return isNext48Hours(match, referenceDate) || isTodayInTaipei(match, referenceDate) || isTomorrowInTaipei(match, referenceDate);
}

function isNext48Hours(match, referenceDate) {
  const hoursUntilKickoff = (new Date(match.kickoffTimeUtc).getTime() - referenceDate.getTime()) / 36e5;
  return hoursUntilKickoff >= 0 && hoursUntilKickoff <= 48;
}

function isTodayInTaipei(match, referenceDate) {
  return taipeiDateKey(match.kickoffTimeUtc) === taipeiDateKey(referenceDate);
}

function isTomorrowInTaipei(match, referenceDate) {
  const tomorrow = new Date(referenceDate.getTime() + 24 * 36e5);
  return taipeiDateKey(match.kickoffTimeUtc) === taipeiDateKey(tomorrow);
}

function taipeiDateKey(input) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(input));
}

function isPastScoreConfirmationWindow(match, referenceDate) {
  return referenceDate.getTime() > new Date(match.kickoffTimeUtc).getTime() + 2.5 * 36e5;
}
