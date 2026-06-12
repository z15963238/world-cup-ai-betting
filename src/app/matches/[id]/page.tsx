import { notFound } from "next/navigation";
import { AlertTriangle, Trophy } from "lucide-react";
import { OddsChart } from "@/components/odds/odds-chart";
import { RecommendationCard } from "@/components/recommendations/recommendation-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getMatch, getMovement } from "@/lib/data/mockMatches";
import { getTeam } from "@/lib/data/mockTeams";
import { mockPlayers } from "@/lib/data/mockPlayers";
import { analyzeOddsMovement } from "@/lib/betting/oddsMovementAnalyzer";
import { buildRecommendation } from "@/lib/betting/recommendationEngine";
import { enrichPlayersWithFit } from "@/lib/betting/positionFitAnalyzer";

export default function MatchPage({ params }: { params: { id: string } }) {
  const match = getMatch(params.id);
  if (!match) notFound();

  const home = getTeam(match.homeTeamId);
  const away = getTeam(match.awayTeamId);
  if (!home || !away) notFound();

  const movement = getMovement(match.id);
  const signals = analyzeOddsMovement(movement);
  const recommendation = buildRecommendation(match);
  const players = enrichPlayersWithFit(mockPlayers.filter((player) => [home.name, away.name].includes(player.nationalTeam)));

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <div>
              <p className="text-sm font-semibold text-primary">{match.stage}</p>
              <h2 className="mt-2 text-3xl font-bold">
                {home.name} vs {away.name}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {match.venue} / {new Date(match.date).toLocaleString("zh-TW")}
              </p>
            </div>
            <Trophy className="h-8 w-8 text-primary" />
          </CardHeader>
          <p className="text-muted-foreground">{match.narrative}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <TeamPanel name={home.name} form={home.recent5Results.join(" ")} xg={home.xGLast5} xga={home.xGALast5} stability={home.lineupStability} />
            <TeamPanel name={away.name} form={away.recent5Results.join(" ")} xg={away.xGLast5} xga={away.xGALast5} stability={away.lineupStability} />
          </div>
        </Card>
        <Card>
          <CardTitle>風險摘要</CardTitle>
          <div className="mt-4 space-y-3">
            {signals.map((signal) => (
              <div key={signal.label} className="rounded border border-border p-3">
                <p className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  {signal.label}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{signal.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <RecommendationCard recommendation={recommendation} />

      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardTitle>賠率走勢</CardTitle>
          <OddsChart data={movement} />
        </Card>
        <Card>
          <CardTitle>關鍵球員位置適配</CardTitle>
          <div className="mt-4 space-y-4">
            {players.map((player) => (
              <div key={player.id}>
                <div className="mb-1 flex justify-between gap-3 text-sm">
                  <span>
                    {player.name} <span className="text-muted-foreground">{player.primaryClubPosition} -&gt; {player.nationalTeamPosition}</span>
                  </span>
                  <Badge tone={(player.positionFitScore ?? 0) >= 75 ? "success" : "warning"}>{player.positionFitScore}</Badge>
                </div>
                <Progress value={player.positionFitScore ?? 0} />
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

function TeamPanel({ name, form, xg, xga, stability }: { name: string; form: string; xg: number; xga: number; stability: number }) {
  return (
    <div className="rounded border border-border bg-slate-50 p-4">
      <p className="font-semibold">{name}</p>
      <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
        <p>
          <span className="text-muted-foreground">近況</span>
          <br />
          {form}
        </p>
        <p>
          <span className="text-muted-foreground">xG/xGA</span>
          <br />
          {xg}/{xga}
        </p>
        <p>
          <span className="text-muted-foreground">穩定度</span>
          <br />
          {stability}
        </p>
      </div>
    </div>
  );
}
