export function mergeScheduleData(existingSchedule, providerResults, verifiedAt) {
  const warnings = providerResults.flatMap((result) => result.warnings || []);
  const changes = [];
  const byId = new Map(existingSchedule.map((match) => [match.id, { ...match }]));
  const providerRecords = providerResults.flatMap((result) =>
    result.records.map((record) => ({ ...record, provider: result.source, sourceUrl: result.sourceUrl }))
  );

  for (const record of providerRecords) {
    const existing = byId.get(record.id);
    if (!existing) continue;

    const matchingRecords = providerRecords.filter((item) => item.id === record.id);
    const canVerifyHigh = hasMatchingFifaAndEspn(matchingRecords);
    const mergedConfidence = canVerifyHigh ? "high" : existing.dataConfidence === "high" ? "high" : "low";

    if (existing.dataConfidence === "high" && mergedConfidence !== "high") {
      warnings.push(`${existing.id}: kept existing high-confidence data; provider data was not cross-verified`);
      continue;
    }

    const next = { ...existing };
    if (record.status && record.status !== existing.status) next.status = record.status;
    if (record.score && record.score !== existing.score) next.score = record.score;
    if (record.kickoffTimeUtc && record.kickoffTimeUtc !== existing.kickoffTimeUtc) next.kickoffTimeUtc = record.kickoffTimeUtc;

    next.sourceName = canVerifyHigh ? "FIFA official scores fixtures, cross-checked with ESPN fixtures/results" : record.sourceName || existing.sourceName;
    next.sourceUrl = record.sourceUrl || existing.sourceUrl;
    next.lastVerifiedAt = verifiedAt;
    next.dataConfidence = mergedConfidence;

    if (JSON.stringify(next) !== JSON.stringify(existing)) {
      byId.set(record.id, next);
      changes.push(`${record.id}: merged ${record.provider} schedule data`);
    }
  }

  return { schedule: existingSchedule.map((match) => byId.get(match.id) || match), changes, warnings };
}

function hasMatchingFifaAndEspn(records) {
  const fifa = records.find((record) => record.provider === "fifa");
  const espn = records.find((record) => record.provider === "espn");
  if (!fifa || !espn) return false;
  return fifa.status === espn.status && (fifa.score || "") === (espn.score || "") && sameKickoffDate(fifa.kickoffTimeUtc, espn.kickoffTimeUtc);
}

function sameKickoffDate(a, b) {
  return new Date(a).toISOString().slice(0, 10) === new Date(b).toISOString().slice(0, 10);
}
