const FIFA_FIXTURES_URL = "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures";

export async function fetchFifaScheduleData({ fetchImpl = fetch, debug = false } = {}) {
  const debugLines = [`[FIFA] fetch URL: ${FIFA_FIXTURES_URL}`];
  try {
    const response = await fetchImpl(FIFA_FIXTURES_URL, {
      headers: {
        "user-agent": "world-cup-ai-decision-support/1.0"
      }
    });
    debugLines.push(`[FIFA] fetch ${response.ok ? "ok" : "failed"}: ${response.status}`);

    if (!response.ok) {
      return { source: "fifa", sourceUrl: FIFA_FIXTURES_URL, records: [], warnings: [`FIFA fetch failed: ${response.status}`], debugLines: debug ? debugLines : [] };
    }

    const html = await response.text();
    debugLines.push(`[FIFA] fetched raw length: ${html.length}`);
    const records = parseFifaHtml(html);
    debugLines.push(`[FIFA] parsed matches: ${records.length}`);
    if (!records.length) debugLines.push("[FIFA] no machine-readable fixture data parsed");
    return {
      source: "fifa",
      sourceUrl: FIFA_FIXTURES_URL,
      records,
      warnings: records.length ? [] : ["FIFA page fetched but no machine-readable fixtures were parsed"],
      debugLines: debug ? debugLines : []
    };
  } catch (error) {
    debugLines.push(`[FIFA] fetch error: ${error.message}`);
    return { source: "fifa", sourceUrl: FIFA_FIXTURES_URL, records: [], warnings: [`FIFA fetch error: ${error.message}`], debugLines: debug ? debugLines : [] };
  }
}

function parseFifaHtml(html) {
  const records = [];
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!nextDataMatch) return records;

  try {
    const data = JSON.parse(nextDataMatch[1]);
    walk(data, (value) => {
      if (!value || typeof value !== "object") return;
      const home = value.homeTeam || value.home || value.homeContestant;
      const away = value.awayTeam || value.away || value.awayContestant;
      const kickoff = value.kickoffTime || value.date || value.utcDate;
      if (!home || !away || !kickoff) return;
      records.push(normalizeRecord({ home, away, kickoff, sourceName: "FIFA official scores fixtures" }));
    });
  } catch {
    return [];
  }

  return dedupe(records);
}

function normalizeRecord(input) {
  const homeName = getName(input.home);
  const awayName = getName(input.away);
  const id = slug(`${homeName}-${awayName}`);
  const status = String(input.status || "").toLowerCase().includes("finish") ? "finished" : "upcoming";
  const score = input.homeScore != null && input.awayScore != null ? `${input.homeScore} - ${input.awayScore}` : undefined;
  return { id, homeTeam: homeName, awayTeam: awayName, kickoffTimeUtc: new Date(input.kickoff).toISOString(), status, score, sourceName: input.sourceName };
}

function getName(team) {
  if (typeof team === "string") return team;
  return team?.name || team?.displayName || team?.shortName || "";
}

function slug(value) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function walk(value, visitor) {
  visitor(value);
  if (Array.isArray(value)) value.forEach((item) => walk(item, visitor));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => walk(item, visitor));
}

function dedupe(records) {
  const seen = new Set();
  return records.filter((record) => {
    const key = `${record.homeTeam}|${record.awayTeam}|${record.kickoffTimeUtc}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return record.homeTeam && record.awayTeam && record.kickoffTimeUtc;
  });
}
