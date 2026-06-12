import type { Match } from "@/lib/types/football";
import type { OddsSnapshot } from "@/lib/types/betting";

export const mockMatches: Match[] = [
  {
    id: "argentina-france",
    date: "2026-06-19T20:00:00+08:00",
    venue: "MetLife Stadium",
    stage: "Group Stage",
    homeTeamId: "argentina",
    awayTeamId: "france",
    weather: "Mild, light wind",
    refereeProfile: "Average card volume, lets contact flow",
    narrative: "Argentina control tempo well, France carry elite transition threat."
  },
  {
    id: "brazil-france",
    date: "2026-06-23T21:00:00+08:00",
    venue: "AT&T Stadium",
    stage: "Group Stage",
    homeTeamId: "brazil",
    awayTeamId: "france",
    weather: "Indoor, fast pitch",
    refereeProfile: "High foul discipline, low penalty frequency",
    narrative: "Brazil wing volume meets France counter speed; totals market is sensitive to lineup news."
  }
];

const timestamps = ["24h", "12h", "6h", "3h", "1h", "30m"];

export const oddsSnapshots: OddsSnapshot[] = mockMatches.flatMap((match, matchIndex) =>
  ["global", "pinnacle", "bet365", "betfair"].flatMap((providerId, providerIndex) =>
    timestamps.map((timestamp, index) => {
      const drift = index * 0.015 + providerIndex * 0.006;
      const isSecond = matchIndex === 1;
      return {
        matchId: match.id,
        providerId,
        timestamp,
        homeWin: Number((isSecond ? 2.72 + drift : 2.34 + drift).toFixed(2)),
        draw: Number((isSecond ? 3.24 - drift / 2 : 3.18 - drift / 3).toFixed(2)),
        awayWin: Number((isSecond ? 2.48 - drift : 2.92 - drift).toFixed(2)),
        spreadLine: isSecond ? 0.25 : -0.25,
        homeSpread: Number((isSecond ? 1.92 + drift : 1.86 + drift).toFixed(2)),
        awaySpread: Number((isSecond ? 1.94 - drift : 2.02 - drift).toFixed(2)),
        totalLine: index > 3 ? 2.75 : 2.5,
        over: Number((isSecond ? 1.9 - drift : 1.96 - drift / 2).toFixed(2)),
        under: Number((isSecond ? 1.98 + drift : 1.9 + drift / 2).toFixed(2)),
        bttsYes: Number((isSecond ? 1.78 - drift / 2 : 1.84 - drift / 3).toFixed(2)),
        bttsNo: Number((isSecond ? 2.06 + drift / 2 : 1.98 + drift / 3).toFixed(2)),
        volumeIndex: Math.round(44 + index * 8 + providerIndex * 3 + matchIndex * 5)
      };
    })
  )
);

export function getMatch(id: string) {
  return mockMatches.find((match) => match.id === id);
}

export function getLatestSnapshots(matchId: string) {
  return oddsSnapshots.filter((snapshot) => snapshot.matchId === matchId && snapshot.timestamp === "30m");
}

export function getMovement(matchId: string, providerId = "global") {
  return oddsSnapshots.filter((snapshot) => snapshot.matchId === matchId && snapshot.providerId === providerId);
}
