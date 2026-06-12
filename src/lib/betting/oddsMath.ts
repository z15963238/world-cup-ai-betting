export function impliedProbability(decimalOdds: number) {
  return validateDecimalOdds(decimalOdds).valid ? 1 / decimalOdds : 0;
}

export function normalizeProbabilities(rawProbabilities: number[]) {
  const total = rawProbabilities.reduce((sum, probability) => sum + probability, 0);
  return total === 0 ? rawProbabilities.map(() => 0) : rawProbabilities.map((probability) => probability / total);
}

export function edge(modelProbability: number, marketImpliedProbability: number) {
  return modelProbability - marketImpliedProbability;
}

export function validateDecimalOdds(decimalOdds: number) {
  if (!Number.isFinite(decimalOdds) || decimalOdds <= 1) {
    return { valid: false, error: "Decimal odds must be greater than 1." };
  }

  return { valid: true };
}

export function normalizeOneX2Market(homeOdds: number, drawOdds: number, awayOdds: number) {
  const raw = [homeOdds, drawOdds, awayOdds].map(impliedProbability);
  return normalizeProbabilities(raw);
}

export function normalizeTwoWayMarket(firstOdds: number, secondOdds: number) {
  const raw = [firstOdds, secondOdds].map(impliedProbability);
  return normalizeProbabilities(raw);
}

export function calculateOverround(odds: number[]) {
  return odds.reduce((sum, decimalOdds) => sum + impliedProbability(decimalOdds), 0) - 1;
}

export function calculateEdge(modelProbability: number, marketProbability: number) {
  return edge(modelProbability, marketProbability);
}

export function formatProbability(value: number, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatOddsEdge(value: number, digits = 1) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(digits)}%`;
}
