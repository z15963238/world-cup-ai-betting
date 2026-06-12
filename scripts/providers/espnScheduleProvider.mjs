const ESPN_SCHEDULE_URL = "https://www.espn.com/soccer/schedule/_/league/fifa.world";

export async function fetchEspnScheduleData({ fetchImpl = fetch } = {}) {
  try {
    const response = await fetchImpl(ESPN_SCHEDULE_URL, {
      headers: {
        "user-agent": "world-cup-ai-decision-support/1.0"
      }
    });

    if (!response.ok) {
      return { source: "espn", sourceUrl: ESPN_SCHEDULE_URL, records: [], warnings: [`ESPN fetch failed: ${response.status}`] };
    }

    const html = await response.text();
    const records = parseEspnHtml(html);
    return {
      source: "espn",
      sourceUrl: ESPN_SCHEDULE_URL,
      records,
      warnings: records.length ? [] : ["ESPN page fetched but no machine-readable fixtures were parsed"]
    };
  } catch (error) {
    return { source: "espn", sourceUrl: ESPN_SCHEDULE_URL, records: [], warnings: [`ESPN fetch error: ${error.message}`] };
  }
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

function normalizeRecord(input) {
  const homeName = getName(input.home);
  const awayName = getName(input.away);
  const id = slug(`${homeName}-${awayName}`);
  const statusText = input.status?.type?.name || input.status?.type?.state || input.status;
  const status = String(statusText || "").toLowerCase().includes("post") || String(statusText || "").toLowerCase().includes("final") ? "finished" : "upcoming";
  const homeScore = input.home.score;
  const awayScore = input.away.score;
  const score = homeScore != null && awayScore != null && status === "finished" ? `${homeScore} - ${awayScore}` : undefined;
  return { id, homeTeam: homeName, awayTeam: awayName, kickoffTimeUtc: new Date(input.kickoff).toISOString(), status, score, sourceName: input.sourceName };
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
