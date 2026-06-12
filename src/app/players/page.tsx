import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { enrichPlayersWithFit } from "@/lib/betting/positionFitAnalyzer";
import { mockPlayers } from "@/lib/data/mockPlayers";

export default function PlayersPage() {
  const players = [...enrichPlayersWithFit(mockPlayers)].sort((a, b) => (b.positionFitScore ?? 0) - (a.positionFitScore ?? 0));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-primary">球員位置適配</p>
        <h2 className="mt-2 text-3xl font-bold">球員角色、疲勞、傷停與戰術適配</h2>
      </div>
      <section className="grid gap-4 lg:grid-cols-2">
        {players.map((player) => (
          <Card key={player.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>{player.name}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {player.nationalTeam} / {player.club}
                </p>
              </div>
              <Badge tone={(player.positionFitScore ?? 0) >= 75 ? "success" : (player.positionFitScore ?? 0) >= 55 ? "warning" : "danger"}>
                {player.positionFitScore}/100
              </Badge>
            </div>
            <div className="mt-4">
              <Progress value={player.positionFitScore ?? 0} />
            </div>
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
              <p><span className="text-muted-foreground">位置</span><br />{player.primaryClubPosition} -&gt; {player.nationalTeamPosition}</p>
              <p><span className="text-muted-foreground">傷停</span><br />{player.injuryStatus}</p>
              <p><span className="text-muted-foreground">疲勞風險</span><br />{player.fatigueRisk}/100</p>
              <p><span className="text-muted-foreground">近 5 場進球/助攻</span><br />{player.goalsLast5}/{player.assistsLast5}</p>
              <p><span className="text-muted-foreground">射正</span><br />{player.shotsOnTargetLast5}</p>
              <p><span className="text-muted-foreground">戰術適配</span><br />{player.tacticalFit}/100</p>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
