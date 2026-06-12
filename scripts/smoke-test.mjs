import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import "./focused-tests.mjs";

const root = process.cwd();
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
if (worldCupScheduleJson.includes(`"score": "${staleDrawScoreSpaced}"`) || worldCupScheduleJson.includes(`"score": "${staleDrawScoreCompact}"`) || homePage.includes(staleDrawScoreSpaced) || homePage.includes(staleDrawScoreCompact)) {
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
for (const field of ["fetchFifaScheduleData", "FIFA official scores fixtures"]) {
  if (!fifaProvider.includes(field)) throw new Error(`FIFA provider missing ${field}`);
}
for (const field of ["fetchEspnScheduleData", "ESPN fixtures/results"]) {
  if (!espnProvider.includes(field)) throw new Error(`ESPN provider missing ${field}`);
}
for (const field of ["mergeScheduleData", "hasMatchingFifaAndEspn", "kept existing high-confidence data"]) {
  if (!mergeProvider.includes(field)) throw new Error(`Merge provider missing ${field}`);
}
for (const field of ["24-48h", "盤口資料待確認", "confidence: 42"]) {
  if (!updateScript.includes(field)) throw new Error(`Update script missing conservative advice behavior: ${field}`);
}

console.log("Smoke tests passed");
