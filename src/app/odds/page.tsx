import { OddsChart } from "@/components/odds/odds-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeOddsMovement } from "@/lib/betting/oddsMovementAnalyzer";
import { getMovement, mockMatches, oddsSnapshots } from "@/lib/data/mockMatches";
import { oddsProviders } from "@/lib/data/oddsProviders";
import { getTeam } from "@/lib/data/mockTeams";

export default function OddsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-primary">賠率變化分析</p>
        <h2 className="mt-2 text-3xl font-bold">賠率走勢與資料來源比較</h2>
      </div>
      <section className="grid gap-4 lg:grid-cols-2">
        {mockMatches.map((match) => {
          const home = getTeam(match.homeTeamId);
          const away = getTeam(match.awayTeamId);
          const movement = getMovement(match.id);
          const signals = analyzeOddsMovement(movement);

          return (
            <Card key={match.id}>
              <CardHeader>
                <div>
                  <CardTitle>
                    {home?.name} vs {away?.name}
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">市場共識，24 小時至 30 分鐘前快照</p>
                </div>
                <Badge tone={signals.length > 2 ? "warning" : "success"}>{signals.length} 個訊號</Badge>
              </CardHeader>
              <OddsChart data={movement} />
              <div className="mt-4 flex flex-wrap gap-2">
                {signals.map((signal) => (
                  <Badge key={signal.label} tone={signal.severity === "High" ? "danger" : "warning"}>
                    {signal.label}
                  </Badge>
                ))}
              </div>
            </Card>
          );
        })}
      </section>
      <Card>
        <CardTitle>資料來源快照</CardTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-muted-foreground">
              <tr>
                <th className="py-2">來源</th>
                <th>專業盤</th>
                <th>主勝</th>
                <th>和局</th>
                <th>客勝</th>
                <th>大小球</th>
                <th>量能</th>
              </tr>
            </thead>
            <tbody>
              {oddsSnapshots
                .filter((item) => item.timestamp === "30m")
                .slice(0, 12)
                .map((snapshot) => {
                  const provider = oddsProviders.find((item) => item.id === snapshot.providerId);

                  return (
                    <tr key={`${snapshot.matchId}-${snapshot.providerId}`} className="border-t border-border">
                      <td className="py-2">{provider?.name}</td>
                      <td>{provider?.isSharp ? "是" : "否"}</td>
                      <td>{snapshot.homeWin}</td>
                      <td>{snapshot.draw}</td>
                      <td>{snapshot.awayWin}</td>
                      <td>{snapshot.totalLine}</td>
                      <td>{snapshot.volumeIndex}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
