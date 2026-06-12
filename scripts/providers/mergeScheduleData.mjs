export function mergeScheduleData(existingSchedule, providerResults, verifiedAt) {
  const warnings = providerResults.flatMap((result) => result.warnings || []);
  const debugLines = providerResults.flatMap((result) => result.debugLines || []);
  const changes = [];
  const byId = new Map(existingSchedule.map((match) => [match.id, { ...match }]));
  const providerRecords = providerResults.flatMap((result) =>
    result.records.map((record) => ({ ...record, provider: result.source, sourceUrl: record.sourceUrl || result.sourceUrl }))
  );

  for (const record of providerRecords) {
    const existing = byId.get(record.id);
    if (!existing) continue;

    const matchingRecords = providerRecords.filter((item) => item.id === record.id);
    const canVerifyHigh = hasMatchingFifaAndEspn(matchingRecords);
    const providerHasFinalScore = record.status === "finished" && record.score;
    const mergedConfidence = canVerifyHigh ? "high" : providerHasFinalScore ? "medium" : existing.dataConfidence === "high" ? "high" : "low";

    debugLines.push(`[MERGE] ${record.id} existing: ${existing.status}${existing.score ? ` ${existing.score}` : ""}`);
    debugLines.push(`[MERGE] ${record.id} provider: ${record.status}${record.score ? ` ${record.score}` : ""}`);

    if (existing.dataConfidence === "high" && mergedConfidence !== "high" && !providerHasFinalScore) {
      warnings.push(`${existing.id}: kept existing high-confidence data; provider data was not cross-verified`);
      debugLines.push(`[MERGE] ${record.id} decision: skipped; existing high-confidence data kept`);
      continue;
    }

    const next = { ...existing };
    if (record.status && record.status !== existing.status) next.status = record.status;
    if (record.score && record.score !== existing.score) next.score = record.score;
    if (record.homeScore != null) next.homeScore = record.homeScore;
    if (record.awayScore != null) next.awayScore = record.awayScore;
    if (record.kickoffTimeUtc && record.kickoffTimeUtc !== existing.kickoffTimeUtc) next.kickoffTimeUtc = record.kickoffTimeUtc;

    next.sourceName = canVerifyHigh ? "FIFA official scores fixtures, cross-checked with ESPN fixtures/results" : record.sourceName || existing.sourceName;
    next.sourceUrl = record.sourceUrl || existing.sourceUrl;
    next.lastVerifiedAt = verifiedAt;
    next.dataConfidence = mergedConfidence;

    if (JSON.stringify(next) !== JSON.stringify(existing)) {
      byId.set(record.id, next);
      const confidenceReason = canVerifyHigh ? "cross-verified high" : providerHasFinalScore ? "single-source medium" : "low confidence";
      changes.push(`${record.id}: merged ${record.provider} schedule data (${confidenceReason})`);
      debugLines.push(`[MERGE] ${record.id} decision: update schedule to ${next.status}${next.score ? ` ${next.score}` : ""}; confidence ${next.dataConfidence}`);
    } else {
      debugLines.push(`[MERGE] ${record.id} decision: no JSON change`);
    }
  }

  return { schedule: existingSchedule.map((match) => byId.get(match.id) || match), changes, warnings, debugLines };
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
