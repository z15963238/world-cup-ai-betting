import type { ManualMatchInput } from "@/lib/types/manualAnalysis";

const requiredFields: Array<keyof Pick<ManualMatchInput, "matchName" | "competition" | "kickoffTime" | "homeTeam" | "awayTeam">> = [
  "matchName",
  "competition",
  "kickoffTime",
  "homeTeam",
  "awayTeam"
];

export function toSafeNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function isOddsKey(key: string) {
  return key.toLowerCase().includes("odds");
}

export function validateManualInput(input: ManualMatchInput) {
  const errors = [
    ...requiredFields.filter((field) => !String(input[field]).trim()).map((field) => `${field} 為必填欄位。`),
    ...Object.entries(input.marketOdds)
      .filter(([key, value]) => isOddsKey(key) && value <= 1)
      .map(([key]) => `${key} 必須大於 1。`)
  ];

  return { valid: errors.length === 0, errors };
}

export function isManualSubmitDisabled(input: ManualMatchInput) {
  return !validateManualInput(input).valid;
}
