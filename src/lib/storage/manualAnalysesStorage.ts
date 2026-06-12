import type { ManualAnalysisRecord } from "@/lib/types/manualAnalysis";

const STORAGE_KEY = "world-cup-manual-analyses";
const MAX_RECORDS = 10;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function listManualAnalyses(): ManualAnalysisRecord[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ManualAnalysisRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveManualAnalysis(record: ManualAnalysisRecord) {
  if (!canUseStorage()) return record;

  const records = [record, ...listManualAnalyses().filter((item) => item.id !== record.id)].slice(0, MAX_RECORDS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return record;
}

export function getManualAnalysis(id: string) {
  return listManualAnalyses().find((record) => record.id === id);
}

export function deleteManualAnalysis(id: string) {
  if (!canUseStorage()) return;

  const records = listManualAnalyses().filter((record) => record.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function saveManualAnalysisReview(id: string, reviewResult: NonNullable<ManualAnalysisRecord["reviewResult"]>) {
  if (!canUseStorage()) return;

  const records = listManualAnalyses().map((record) => (record.id === id ? { ...record, reviewResult } : record));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function clearManualAnalysisReview(id: string) {
  if (!canUseStorage()) return;

  const records = listManualAnalyses().map((record) => {
    if (record.id !== id) return record;
    const { reviewResult: _reviewResult, ...withoutReview } = record;
    return withoutReview;
  });
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}
