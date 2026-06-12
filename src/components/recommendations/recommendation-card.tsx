import { AlertTriangle, CheckCircle2, Gauge } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { decisionSupportLabel, riskLevelLabel, stakeGuidanceLabel } from "@/lib/i18n/labels";
import { formatEdge, formatPercent } from "@/lib/utils";
import type { Recommendation } from "@/lib/types/betting";

export function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const tone =
    recommendation.decisionSupport === "No edge"
      ? "muted"
      : recommendation.riskLevel === "High" || recommendation.riskLevel === "Extreme"
        ? "warning"
        : "success";

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>決策建議</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{recommendation.suggestedMarket}</p>
        </div>
        <Badge tone={tone}>{decisionSupportLabel(recommendation.decisionSupport)}</Badge>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="優勢值" value={formatEdge(recommendation.edge)} icon={<CheckCircle2 className="h-4 w-4" />} />
        <Metric label="信心分數" value={`${recommendation.confidenceScore}/100`} icon={<Gauge className="h-4 w-4" />} />
        <Metric label="風險等級" value={`${riskLevelLabel(recommendation.riskLevel)} ${recommendation.riskScore}/100`} icon={<AlertTriangle className="h-4 w-4" />} />
        <Metric label="倉位建議" value={stakeGuidanceLabel(recommendation.stakeGuidance)} />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div>
          <p className="text-sm font-medium">機率比較</p>
          <div className="mt-3 space-y-3 text-sm">
            <div>
              <div className="mb-1 flex justify-between">
                <span>模型勝率</span>
                <span>{formatPercent(recommendation.modelProbability)}</span>
              </div>
              <Progress value={recommendation.modelProbability * 100} />
            </div>
            <div>
              <div className="mb-1 flex justify-between">
                <span>市場隱含勝率</span>
                <span>{formatPercent(recommendation.marketImpliedProbability)}</span>
              </div>
              <Progress value={recommendation.marketImpliedProbability * 100} />
            </div>
          </div>
        </div>
        <div className="grid gap-3 text-sm">
          {recommendation.reasoning.map((item) => (
            <p key={item} className="rounded border border-border bg-slate-50 p-3">
              {item}
            </p>
          ))}
        </div>
      </div>
    </Card>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="rounded border border-border bg-slate-50 p-3">
      <p className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-base font-semibold">{value}</p>
    </div>
  );
}
