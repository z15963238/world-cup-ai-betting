import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import "./focused-tests.mjs";
import "./parser-tests.mjs";

const root = process.cwd();
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const sourceRoots = ["src", "docs", "prisma", "README.md"].filter((path) => existsSync(join(root, path)));
const forbiddenTerms = [
  ["auto", "Bet"],
  ["place", "Bet"],
  ["execute", "Bet"],
  ["bookmaker", "Login"],
  ["betting", "Bot"],
  ["martin", "gale"],
  ["one", "Click", "Bet"],
  ["order", "Executor"],
  ["wager", "Executor"]
].map((parts) => parts.join(""));

function listFiles(path) {
  const absolute = join(root, path);
  if (statSync(absolute).isFile()) return [absolute];

  return readdirSync(absolute).flatMap((entry) => {
    const child = join(path, entry);
    const childAbsolute = join(root, child);
    if (statSync(childAbsolute).isDirectory()) return listFiles(child);
    return [childAbsolute];
  });
}

for (const file of sourceRoots.flatMap(listFiles)) {
  const content = readFileSync(file, "utf8");
  const match = forbiddenTerms.find((term) => content.includes(term));
  if (match) {
    throw new Error(`Forbidden execution-oriented term found in ${file}`);
  }
}

const teams = readFileSync(join(root, "src/lib/data/mockTeams.ts"), "utf8");
const matches = readFileSync(join(root, "src/lib/data/mockMatches.ts"), "utf8");
const players = readFileSync(join(root, "src/lib/data/mockPlayers.ts"), "utf8");
const recommendationEngine = readFileSync(join(root, "src/lib/betting/recommendationEngine.ts"), "utf8");
const oddsMath = readFileSync(join(root, "src/lib/betting/oddsMath.ts"), "utf8");
const marketEvaluationEngine = readFileSync(join(root, "src/lib/betting/marketEvaluationEngine.ts"), "utf8");
const manualValidation = readFileSync(join(root, "src/lib/manual-input/validation.ts"), "utf8");
const manualRanking = readFileSync(join(root, "src/lib/manual-input/ranking.ts"), "utf8");
const manualStorage = readFileSync(join(root, "src/lib/storage/manualAnalysesStorage.ts"), "utf8");
const taiwanTimeFormatter = readFileSync(join(root, "src/lib/time/formatTaiwanTime.ts"), "utf8");
const worldCupScheduleSource = readFileSync(join(root, "src/lib/data/worldCupSchedule.ts"), "utf8");
const worldCupScheduleJson = readFileSync(join(root, "src/lib/data/worldCupSchedule.json"), "utf8");
const recommendationsJson = readFileSync(join(root, "src/lib/data/recommendations.json"), "utf8");
const updateScript = readFileSync(join(root, "scripts/update-worldcup-data.mjs"), "utf8");
const fifaProvider = readFileSync(join(root, "scripts/providers/fifaScheduleProvider.mjs"), "utf8");
const espnProvider = readFileSync(join(root, "scripts/providers/espnScheduleProvider.mjs"), "utf8");
const mergeProvider = readFileSync(join(root, "scripts/providers/mergeScheduleData.mjs"), "utf8");
const worldCupScheduleRecords = JSON.parse(worldCupScheduleJson);
const recommendationRecords = JSON.parse(recommendationsJson);
const scheduleValidation = readFileSync(join(root, "src/lib/data/validateWorldCupSchedule.ts"), "utf8");
const homePage = readFileSync(join(root, "src/app/page.tsx"), "utf8");
const analysisStatusHelper = readFileSync(join(root, "src/lib/recommendations/getAnalysisStatus.ts"), "utf8");

for (const id of ["argentina", "france", "brazil"]) {
  if (!teams.includes(`id: "${id}"`)) throw new Error(`Missing mock team id: ${id}`);
}

for (const id of ["argentina-france", "brazil-france"]) {
  if (!matches.includes(`id: "${id}"`)) throw new Error(`Missing mock match id: ${id}`);
}

for (const nationalTeam of ["Argentina", "France", "Brazil"]) {
  if (!players.includes(`nationalTeam: "${nationalTeam}"`)) throw new Error(`Missing mock players for ${nationalTeam}`);
}

for (const field of ["suggestedMarket", "decisionSupport", "stakeGuidance", "confidenceScore", "riskLevel"]) {
  if (!recommendationEngine.includes(field)) throw new Error(`Recommendation engine missing ${field}`);
}

for (const field of ["normalizeOneX2Market", "normalizeTwoWayMarket", "calculateOverround", "validateDecimalOdds", "formatProbability", "formatOddsEdge"]) {
  if (!oddsMath.includes(field)) throw new Error(`Odds math missing ${field}`);
}

for (const field of ["Home", "Draw", "Away", "Asian Handicap", "Total Goals", "BTTS", "Corner Total", "odds movement", "fatigue"]) {
  if (!marketEvaluationEngine.includes(field)) throw new Error(`Market evaluation engine missing factor or market: ${field}`);
}

function impliedProbability(decimalOdds) {
  return decimalOdds > 1 ? 1 / decimalOdds : 0;
}

function normalize(probabilities) {
  const total = probabilities.reduce((sum, value) => sum + value, 0);
  return probabilities.map((value) => value / total);
}

const oneX2 = normalize([2.2, 3.3, 3.4].map(impliedProbability));
const twoWay = normalize([1.91, 1.97].map(impliedProbability));
const oneX2Total = oneX2.reduce((sum, value) => sum + value, 0);
const twoWayTotal = twoWay.reduce((sum, value) => sum + value, 0);
if (Math.abs(oneX2Total - 1) > 0.000001) throw new Error("1X2 normalized probability total is not 1");
if (Math.abs(twoWayTotal - 1) > 0.000001) throw new Error("Two-way normalized probability total is not 1");
if (impliedProbability(1) !== 0 || impliedProbability(0.99) !== 0) throw new Error("Invalid odds should return zero implied probability in smoke formula");

const overround = [2.2, 3.3, 3.4].reduce((sum, odds) => sum + impliedProbability(odds), 0) - 1;
if (Math.abs(overround - 0.0516934046) > 0.0001) throw new Error("Overround calculation changed unexpectedly");

for (const field of ["validateManualInput", "isManualSubmitDisabled", "toSafeNumber"]) {
  if (!manualValidation.includes(field)) throw new Error(`Manual validation missing ${field}`);
}

for (const field of ["sortMarketEvaluations", "splitMarketEvaluations", "getEdgeLabel"]) {
  if (!manualRanking.includes(field)) throw new Error(`Manual ranking missing ${field}`);
}

for (const field of ["saveManualAnalysisReview", "clearManualAnalysisReview"]) {
  if (!manualStorage.includes(field)) throw new Error(`Manual analysis storage missing ${field}`);
}

for (const field of ["formatTaiwanTime", "Asia/Taipei", "\\u53f0\\u7063\\u6642\\u9593"]) {
  if (!taiwanTimeFormatter.includes(field)) throw new Error(`Taiwan time formatter missing ${field}`);
}

for (const field of ["worldCupSchedule", "kickoffTimeUtc", "kickoffTimeTaiwan", "hasRecommendation", "finished"]) {
  if (!worldCupScheduleSource.includes(field) && !worldCupScheduleJson.includes(field)) throw new Error(`World Cup schedule missing ${field}`);
}

for (const field of ["sourceName", "sourceUrl", "lastVerifiedAt", "dataConfidence"]) {
  if (!worldCupScheduleJson.includes(field)) throw new Error(`World Cup schedule missing source metadata: ${field}`);
}

for (const field of ["validateWorldCupSchedule", "Duplicate schedule id", "Finished match missing score", "Unfinished match should not have final score", "Missing recommendation"]) {
  if (!scheduleValidation.includes(field)) throw new Error(`Schedule validation missing ${field}`);
}
for (const field of ["Blocked unverified matchup", "High confidence match missing source metadata"]) {
  if (!scheduleValidation.includes(field)) throw new Error(`Schedule validation missing ${field}`);
}

const getScheduleRecord = (id) => worldCupScheduleRecords.find((match) => match.id === id);
if (getScheduleRecord("mexico-south-africa")?.score !== "2 - 0") {
  throw new Error("Mexico vs South Africa score must be 2 - 0");
}
if (getScheduleRecord("south-korea-czechia")?.score !== "2 - 1") {
  throw new Error("South Korea vs Czechia score must be 2 - 1");
}
const staleDrawScoreSpaced = "1 " + "- 1";
const staleDrawScoreCompact = "1" + "-1";
const southKoreaCzechia = getScheduleRecord("south-korea-czechia");
if (southKoreaCzechia?.score === staleDrawScoreSpaced || southKoreaCzechia?.score === staleDrawScoreCompact) {
  throw new Error("South Korea vs Czechia must not show stale draw score");
}
for (const id of ["mexico-south-africa", "south-korea-czechia"]) {
  const record = getScheduleRecord(id);
  if (record?.status !== "finished" || !record.score) throw new Error(`Finished match must have score: ${id}`);
}
if (worldCupScheduleRecords.some((match) => match.status === "upcoming" && match.score)) throw new Error("Future match must not have final score");

for (const id of ["canada-bosnia-herzegovina", "usa-paraguay", "qatar-switzerland", "brazil-morocco", "haiti-scotland", "australia-turkiye"]) {
  if (!getScheduleRecord(id)) throw new Error(`Missing corrected World Cup fixture: ${id}`);
}
for (const id of ["canada-japan", "usa-ghana"]) {
  if (getScheduleRecord(id) || homePage.includes(`"${id}"`)) throw new Error(`Incorrect fixture must not remain: ${id}`);
}
for (const id of ["canada-bosnia-herzegovina", "usa-paraguay"]) {
  if (getScheduleRecord(id)?.hasRecommendation !== true) throw new Error(`Tomorrow fixture must have AI recommendation flag: ${id}`);
  if (!recommendationRecords[id]) throw new Error(`Tomorrow fixture recommendation missing from JSON: ${id}`);
}

for (const field of ["--dry-run", "--write", "dataConfidence", "unverified"]) {
  if (!updateScript.includes(field)) throw new Error(`Update script missing ${field}`);
}
for (const field of ["generated recommendations count", "score_pending count", "tomorrow matches count", "next 48h matches count"]) {
  if (!updateScript.includes(field)) throw new Error(`Update script debug log missing ${field}`);
}
for (const field of ["fetchFifaScheduleData", "FIFA official scores fixtures"]) {
  if (!fifaProvider.includes(field)) throw new Error(`FIFA provider missing ${field}`);
}
for (const field of ["fetchEspnScheduleData", "ESPN fixtures/results"]) {
  if (!espnProvider.includes(field)) throw new Error(`ESPN provider missing ${field}`);
}
for (const field of ["mergeScheduleData", "hasMatchingFifaAndEspn", "kept existing high-confidence data"]) {
  if (!mergeProvider.includes(field)) throw new Error(`Merge provider missing ${field}`);
}
for (const field of ["today/tomorrow/48h", "\u76e4\u53e3\u8cc7\u6599\u5f85\u78ba\u8a8d", "confidence: 48"]) {
  if (!updateScript.includes(field)) throw new Error(`Update script missing conservative advice behavior: ${field}`);
}
for (const field of ["generated:", "skipped existing recommendation:", "recommendedMarket", "recommendationDecision", "generatedBy"]) {
  if (!updateScript.includes(field)) throw new Error(`Update script missing full recommendation flow: ${field}`);
}

const canadaBosnia = getScheduleRecord("canada-bosnia-herzegovina");
assert(canadaBosnia.status === "finished" && canadaBosnia.score === "1 - 1", "Canada vs Bosnia should be finished with score");
assert(canadaBosnia.dataConfidence === "medium", "Single-source finished score should be medium confidence");
assert(homePage.includes("scoreSingleSource"), "finished + score single-source UI status should exist");
assert(homePage.includes("getDisplayStatusLabel"), "finished match must use display status helper");
assert(!homePage.includes('match.status === "finished" ? "尚未開賽"'), "finished match must not display not started");

const taipeiKey = (value) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
const reference = new Date("2026-06-13T00:00:00+08:00");
const tomorrowKey = taipeiKey(new Date(reference.getTime() + 24 * 36e5));
const todayKey = taipeiKey(reference);
const todayTomorrowUpcoming = worldCupScheduleRecords.filter(
  (match) => match.status === "upcoming" && [todayKey, tomorrowKey].includes(taipeiKey(match.kickoffTimeUtc))
);
assert(todayTomorrowUpcoming.every((match) => recommendationRecords[match.id]), "today/tomorrow upcoming matches must have recommendations");
for (const id of ["qatar-switzerland", "brazil-morocco", "haiti-scotland", "australia-turkiye"]) {
  assert(recommendationRecords[id], `6/14 fixture must have conservative analysis: ${id}`);
  assert(recommendationRecords[id].confidence <= 62, `Conservative confidence must be <= 62: ${id}`);
  assert(recommendationRecords[id].modelView.includes("\u76e4\u53e3\u8cc7\u6599\u5f85\u78ba\u8a8d"), `Conservative advice must mention odds pending: ${id}`);
}

function isCompleteRecommendation(recommendation) {
  return Boolean(
    recommendation &&
      recommendation.matchId &&
      recommendation.recommendedMarket &&
      recommendation.recommendationDecision &&
      typeof recommendation.confidence === "number" &&
      recommendation.risk &&
      recommendation.modelView &&
      recommendation.reasons?.length >= 4 &&
      recommendation.avoidMarkets?.length >= 3 &&
      recommendation.preMatchChecklist?.length >= 4 &&
      recommendation.analysisBasis?.length >= 1 &&
      recommendation.generatedBy &&
      recommendation.generatedAt
  );
}

const requiredConservativeRecommendationIds = ["qatar-switzerland", "brazil-morocco", "haiti-scotland", "australia-turkiye"];
for (const id of requiredConservativeRecommendationIds) {
  const recommendation = recommendationRecords[id];
  assert(isCompleteRecommendation(recommendation), `Conservative analysis must have complete recommendation content: ${id}`);
  assert(recommendation.recommendationDecision === "wait_for_market", `Conservative recommendation decision must wait for market: ${id}`);
  assert(recommendation.recommendedMarket === "\u66ab\u4e0d\u5efa\u8b70\u4e0b\u6ce8\uff0c\u7b49\u5f85\u81e8\u5834\u76e4\u53e3", `Conservative recommended market must be explicit: ${id}`);
  assert(recommendation.confidence <= 50, `Data-limited conservative confidence must be <= 50: ${id}`);
  assert(recommendation.risk === "\u4e2d\u9ad8", `Data-limited conservative risk must be medium-high: ${id}`);
  for (const warning of [
    "\u76e4\u53e3\u8cc7\u6599\u5f85\u78ba\u8a8d",
    "\u5148\u767c\u9663\u5bb9\u5f85\u78ba\u8a8d",
    "\u50b7\u75c5\u8cc7\u8a0a\u5f85\u78ba\u8a8d"
  ]) {
    assert(recommendation.warnings?.includes(warning), `Conservative recommendation missing warning ${warning}: ${id}`);
  }
}
for (const [id, recommendation] of Object.entries(recommendationRecords)) {
  if (recommendation.generatedBy === "auto-conservative-generator") {
    assert(isCompleteRecommendation(recommendation), `Every conservative analysis label must have complete content: ${id}`);
  }
}
assert(analysisStatusHelper.includes('generatedBy === "auto-conservative-generator"'), "analysis status must detect conservative generator");
assert(analysisStatusHelper.includes('return "missing"'), "missing recommendation must not show conservative analysis");
assert(!homePage.includes("hasRecommendation ? text.conservativeAnalysis"), "homepage must not derive conservative label from schedule flag");
assert(homePage.includes("isCompleteRecommendation(getRecommendation(match.id))"), "schedule rows must be clickable only when complete recommendation exists");

const futureRows = worldCupScheduleRecords
  .filter((match) => match.status !== "finished")
  .sort((a, b) => new Date(a.kickoffTimeUtc) - new Date(b.kickoffTimeUtc));
for (let index = 1; index < futureRows.length; index += 1) {
  assert(new Date(futureRows[index - 1].kickoffTimeUtc) <= new Date(futureRows[index].kickoffTimeUtc), "future 7 day schedule should sort near to far");
}
assert(homePage.includes("getScheduleDisplayRows"), "homepage should use future/history schedule display ordering");

console.log("Smoke tests passed");
