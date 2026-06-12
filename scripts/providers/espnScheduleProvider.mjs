const ESPN_SCHEDULE_URL = "https://www.espn.com/soccer/schedule/_/league/fifa.world";

export async function fetchEspnScheduleData({ fetchImpl = fetch, expectedRecentResults = [], debug = false } = {}) {
  const debugLines = [];
  const records = [];
  const warnings = [];

  try {
    const response = await fetchImpl(ESPN_SCHEDULE_URL, {
      headers: {
        "user-agent": "world-cup-ai-decision-support/1.0"
      }
    });
    debugLines.push(`[ESPN] fetch URL: ${ESPN_SCHEDULE_URL}`);
    debugLines.push(`[ESPN] fetch ${response.ok ? "ok" : "failed"}: ${response.status}`);

    if (!response.ok) {
      warnings.push(`ESPN fetch failed: ${response.status}`);
    } else {
      const html = await response.text();
      debugLines.push(`[ESPN] fetched raw length: ${html.length}`);
      records.push(...parseEspnHtml(html));
      debugLines.push(`[ESPN] parsed schedule matches: ${records.length}`);
    }
  } catch (error) {
    warnings.push(`ESPN fetch error: ${error.message}`);
  }

  for (const expected of expectedRecentResults) {
    if (!expected.espnUrl) continue;
    const matchResult = await fetchEspnMatchPage(expected, fetchImpl);
    debugLines.push(...matchResult.debugLines);
    warnings.push(...matchResult.warnings);
    if (matchResult.record) records.push(matchResult.record);
  }

  const canadaBosnia = records.find((record) => record.id === "canada-bosnia-herzegovina");
  if (canadaBosnia) {
    debugLines.push(`[ESPN] found: Canada vs Bosnia, ${canadaBosnia.status}, ${canadaBosnia.homeScore}-${canadaBosnia.awayScore}`);
  } else {
    debugLines.push("[ESPN] Canada vs Bosnia not found");
  }

  if (!records.length) warnings.push("ESPN parsed matches count is 0");

  return { source: "espn", sourceUrl: ESPN_SCHEDULE_URL, records: dedupe(records), warnings, debugLines: debug ? debugLines : [] };
}

function parseEspnHtml(html) {
  const records = [];
  const dataMatch = html.match(/window\['__espnfitt__'\]\s*=\s*({[\s\S]*?});\s*<\/script>/);
  if (!dataMatch) return records;

  try {
    const data = JSON.parse(dataMatch[1]);
    walk(data, (value) => {
      if (!value || typeof value !== "object") return;
      const competitors = value.competitors || value.competitions?.[0]?.competitors;
      if (!Array.isArray(competitors) || competitors.length < 2) return;
      const home = competitors.find((item) => item.homeAway === "home") || competitors[0];
      const away = competitors.find((item) => item.homeAway === "away") || competitors[1];
      const kickoff = value.date || value.startDate;
      if (!kickoff) return;
      records.push(normalizeRecord({ home, away, kickoff, status: value.status, sourceName: "ESPN fixtures/results" }));
    });
  } catch {
    return [];
  }

  return dedupe(records);
}

export function parseEspnMatchPage(html, expected) {
  const title = getTitle(html);
  const text = stripTags(html);
  const scorePatterns = [
    /Canada\s+(\d+)\s*-\s*(\d+)\s+Bosnia(?:\s+and\s+Herzegovina|-Herzegovina|-Herz)?/i,
    /Canada\s+(\d+),\s+Bosnia(?:\s+and\s+Herzegovina|-Herzegovina|-Herz)?\s+(\d+)/i,
    /final score\s+(\d+)\s*-\s*(\d+)/i
  ];

  for (const sourceText of [title, text]) {
    for (const pattern of scorePatterns) {
      const match = sourceText.match(pattern);
      if (!match) continue;
      const homeScore = Number(match[1]);
      const awayScore = Number(match[2]);
      return {
        id: expected.id,
        homeTeam: expected.homeTeam,
        awayTeam: expected.awayTeam,
        kickoffTimeUtc: new Date(expected.kickoffTimeUtc).toISOString(),
        status: "finished",
        score: `${homeScore} - ${awayScore}`,
        homeScore,
        awayScore,
        sourceName: "ESPN match page"
      };
    }
  }

  return null;
}

async function fetchEspnMatchPage(expected, fetchImpl) {
  const debugLines = [`[ESPN] fetch URL: ${expected.espnUrl}`];
  const warnings = [];
  try {
    const response = await fetchImpl(expected.espnUrl, {
      headers: {
        "user-agent": "world-cup-ai-decision-support/1.0"
      }
    });
    debugLines.push(`[ESPN] fetch ${response.ok ? "ok" : "failed"}: ${response.status}`);
    if (!response.ok) {
      warnings.push(`ESPN match page fetch failed for ${expected.id}: ${response.status}`);
      return { record: null, warnings, debugLines };
    }
    const html = await response.text();
    debugLines.push(`[ESPN] fetched raw length: ${html.length}`);
    const record = parseEspnMatchPage(html, expected);
    debugLines.push(record ? "[ESPN] parsed match page result: 1" : "[ESPN] parsed match page result: 0");
    return { record: record ? { ...record, sourceUrl: expected.espnUrl } : null, warnings, debugLines };
  } catch (error) {
    warnings.push(`ESPN match page fetch error for ${expected.id}: ${error.message}`);
    return { record: null, warnings, debugLines };
  }
}

function normalizeRecord(input) {
  const homeName = getName(input.home);
  const awayName = getName(input.away);
  const id = slug(`${homeName}-${awayName}`);
  const statusText = input.status?.type?.name || input.status?.type?.state || input.status;
  const status = String(statusText || "").toLowerCase().includes("post") || String(statusText || "").toLowerCase().includes("final") ? "finished" : "upcoming";
  const homeScore = input.home.score;
  const awayScore = input.away.score;
  const score = homeScore != null && awayScore != null && status === "finished" ? `${homeScore} - ${awayScore}` : undefined;
  return { id, homeTeam: homeName, awayTeam: awayName, kickoffTimeUtc: new Date(input.kickoff).toISOString(), status, score, homeScore: Number(homeScore), awayScore: Number(awayScore), sourceName: input.sourceName };
}

function getTitle(html) {
  return html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "";
}

function stripTags(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

function getName(team) {
  return team?.team?.displayName || team?.team?.name || team?.displayName || team?.name || "";
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
