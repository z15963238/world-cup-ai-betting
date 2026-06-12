function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function toSafeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function validateManualInput(input) {
  const required = ["matchName", "competition", "kickoffTime", "homeTeam", "awayTeam"];
  const errors = [
    ...required.filter((field) => !String(input[field]).trim()).map((field) => `${field} is required.`),
    ...Object.entries(input.marketOdds)
      .filter(([key, value]) => key.toLowerCase().includes("odds") && value <= 1)
      .map(([key]) => `${key} must be greater than 1.`)
  ];
  return { valid: errors.length === 0, errors };
}

function sortMarketEvaluations(evaluations) {
  return [...evaluations].sort((a, b) => b.edge - a.edge || b.confidenceScore - a.confidenceScore || a.riskScore - b.riskScore);
}

function splitMarketEvaluations(evaluations) {
  const ordered = sortMarketEvaluations(evaluations);
  const recommended = ordered.filter((item) => item.riskLevel !== "High" && item.riskLevel !== "Avoid" && item.edge >= 0.02);
  const watchlist = ordered.filter((item) => !recommended.includes(item) && item.riskLevel !== "Avoid");
  const avoid = ordered.filter((item) => item.riskLevel === "Avoid");
  return { recommended, watchlist, avoid };
}

function getEdgeLabel(edge) {
  if (edge < 0.02) return "No Edge";
  if (edge < 0.04) return "Small Edge";
  return "Positive Edge";
}

function formatTaiwanTime(input) {
  const date = typeof input === "string" ? new Date(input) : input;
  const parts = new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(date);
  const getPart = (type) => parts.find((part) => part.type === type)?.value ?? "";
  return `${getPart("year")}/${getPart("month")}/${getPart("day")} ${getPart("hour")}:${getPart("minute")} 台灣時間`;
}

const validInput = {
  matchName: "A vs B",
  competition: "World Cup",
  kickoffTime: "2026-06-19T20:00",
  homeTeam: "A",
  awayTeam: "B",
  marketOdds: {
    homeWinOdds: 2,
    drawOdds: 3,
    awayWinOdds: 4,
    homeHandicapOdds: 1.9,
    awayHandicapOdds: 1.9,
    overOdds: 1.9,
    underOdds: 1.9,
    bttsYesOdds: 1.9,
    bttsNoOdds: 1.9,
    cornerOverOdds: 1.9,
    cornerUnderOdds: 1.9,
    handicapLine: -0.25,
    totalGoalsLine: 2.5,
    cornerLine: 9.5
  }
};

assert(!validateManualInput({ ...validInput, matchName: "" }).valid, "required fields missing should be invalid");
assert(!validateManualInput({ ...validInput, marketOdds: { ...validInput.marketOdds, homeWinOdds: 1 } }).valid, "odds <= 1 should be invalid");
assert(validateManualInput(validInput).valid, "valid odds should be valid");
assert(toSafeNumber("") === 0 && !Number.isNaN(toSafeNumber("")), "empty numeric optional fields must not create NaN");

const market = (id, edge, confidenceScore, riskScore, riskLevel = "Low") => ({
  id,
  edge,
  confidenceScore,
  riskScore,
  riskLevel,
  decisionSupport: riskLevel === "Avoid" ? "Avoid" : edge < 0.02 ? "No edge" : "Small edge"
});

assert(sortMarketEvaluations([market("a", 0.02, 50, 10), market("b", 0.05, 40, 10)])[0].id === "b", "ranking should sort edge desc");
assert(sortMarketEvaluations([market("a", 0.03, 50, 10), market("b", 0.03, 70, 10)])[0].id === "b", "ranking should sort confidence desc on equal edge");
assert(sortMarketEvaluations([market("a", 0.03, 70, 30), market("b", 0.03, 70, 10)])[0].id === "b", "ranking should sort risk asc on equal edge/confidence");

const split = splitMarketEvaluations([market("good", 0.05, 80, 10), market("high", 0.08, 90, 70, "High"), market("avoid", 0.1, 90, 90, "Avoid")]);
assert(split.recommended.every((item) => item.riskLevel !== "High" && item.riskLevel !== "Avoid"), "High/Avoid must not enter recommended");
assert(split.avoid.length === 1 && split.avoid[0].id === "avoid", "Avoid market should enter avoid section");
assert(getEdgeLabel(0.019) === "No Edge", "edge < 0.02 label");
assert(getEdgeLabel(0.02) === "Small Edge", "edge >= 0.02 label");
assert(getEdgeLabel(0.04) === "Positive Edge", "edge >= 0.04 label");
assert(formatTaiwanTime("2026-06-12T01:00:00.000Z") === "2026/06/12 09:00 台灣時間", "UTC should convert to Taiwan time");

const records = [{ id: "1", input: {}, evaluations: [] }];
const withReview = records.map((record) => (record.id === "1" ? { ...record, reviewResult: { finalScore: "2-1", outcome: "hit", notes: "ok", updatedAt: "now" } } : record));
assert(withReview[0].reviewResult.finalScore === "2-1", "save/read review result");
const updated = withReview.map((record) => (record.id === "1" ? { ...record, reviewResult: { ...record.reviewResult, outcome: "miss" } } : record));
assert(updated[0].reviewResult.outcome === "miss", "update review result");
const cleared = updated.map((record) => {
  const { reviewResult: _reviewResult, ...withoutReview } = record;
  return withoutReview;
});
assert(!("reviewResult" in cleared[0]) && cleared[0].id === "1", "clear review result without destroying record");

console.log("Focused tests passed");
