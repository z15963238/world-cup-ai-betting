import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const schedulePath = join(root, "src/lib/data/worldCupSchedule.json");
const recommendationsPath = join(root, "src/lib/data/recommendations.json");

const mode = process.argv.includes("--write") ? "write" : process.argv.includes("--dry-run") ? "dry-run" : null;
if (!mode) {
  console.error("Usage: node scripts/update-worldcup-data.mjs --dry-run|--write");
  process.exit(1);
}

const today = new Date();
const schedule = JSON.parse(readFileSync(schedulePath, "utf8"));
const recommendations = JSON.parse(readFileSync(recommendationsPath, "utf8"));
const errors = [];
const changes = [];

function isVerified(match) {
  return match.dataConfidence === "high" && match.sourceName && match.sourceUrl && match.lastVerifiedAt;
}

function addConservativePlaceholder(match) {
  if (recommendations[match.id]) return false;
  recommendations[match.id] = {
    pick: "觀察，不急著下注",
    confidence: 45,
    risk: "中偏高",
    modelView: "目前資料不足，盤口資料待確認。先保留觀察，不用高信心解讀。",
    reasons: ["賽程資料存在，但球員與盤口資料仍待確認。", "未串接付費 API，也沒有即時 bookmaker 資料。", "若臨場陣容與盤口方向明確，再重新評估。"],
    avoid: ["高信心單邊投注", "未確認盤口前追熱門", "把未驗證資料當成官方結論"],
    checklist: ["確認官方賽程與開賽時間。", "確認先發陣容。", "確認盤口資料來源與更新時間。"]
  };
  return true;
}

for (const match of schedule) {
  if (!match.id || !match.kickoffTimeUtc) errors.push(`Missing id/kickoffTimeUtc: ${JSON.stringify(match)}`);
  if (match.status === "finished" && !match.score) errors.push(`Finished match missing score: ${match.id}`);
  if (match.status !== "finished" && match.score) errors.push(`Unfinished match has final score: ${match.id}`);
  if (match.dataConfidence === "high" && !isVerified(match)) errors.push(`High confidence match missing source metadata: ${match.id}`);
  if (match.dataConfidence !== "high" && match.dataConfidence !== "medium" && match.dataConfidence !== "low" && match.dataConfidence !== "unverified") {
    match.dataConfidence = "unverified";
    changes.push(`${match.id}: normalized invalid dataConfidence to unverified`);
  }

  const kickoff = new Date(match.kickoffTimeUtc);
  const hoursUntilKickoff = (kickoff.getTime() - today.getTime()) / 36e5;
  if (match.status === "upcoming" && hoursUntilKickoff >= 0 && hoursUntilKickoff <= 36) {
    if (addConservativePlaceholder(match)) {
      match.hasRecommendation = true;
      if (match.dataConfidence === "high") match.dataConfidence = "low";
      changes.push(`${match.id}: added conservative recommendation placeholder`);
    }
  }
}

if (errors.length) {
  console.error("Data validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

if (mode === "dry-run") {
  console.log("Dry run completed.");
  console.log(changes.length ? changes.join("\n") : "No changes needed.");
  process.exit(0);
}

writeFileSync(schedulePath, `${JSON.stringify(schedule, null, 2)}\n`);
writeFileSync(recommendationsPath, `${JSON.stringify(recommendations, null, 2)}\n`);
console.log(changes.length ? changes.join("\n") : "No changes needed.");

if (!existsSync(schedulePath) || !existsSync(recommendationsPath)) {
  console.error("Expected data files were not found after write.");
  process.exit(1);
}
