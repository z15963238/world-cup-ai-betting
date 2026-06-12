import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";

const reviews = [
  {
    match: "Argentina vs France",
    prediction: "Argentina +0 DNB",
    result: "待回填",
    clv: 0.04,
    hit: true,
    lesson: "優勢來自控球能力與臨場小分支撐；因轉換進攻風險，倉位維持在 1% 以下。"
  },
  {
    match: "Brazil vs France",
    prediction: "Under 3.5 goals",
    result: "待回填",
    clv: -0.01,
    hit: false,
    lesson: "大小球市場過早移動；提高信心分數前，需要更重視先發名單確認。"
  }
];

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-primary">賽後回顧</p>
        <h2 className="mt-2 text-3xl font-bold">賽後檢討、CLV 與模型修正</h2>
      </div>
      <section className="grid gap-4 lg:grid-cols-2">
        {reviews.map((review) => (
          <Card key={review.match}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>{review.match}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{review.prediction}</p>
              </div>
              <Badge tone={review.hit ? "success" : "warning"}>{review.hit ? "模型命中" : "需要檢討"}</Badge>
            </div>
            <div className="mt-5 grid gap-3 text-sm md:grid-cols-3">
              <p><span className="text-muted-foreground">實際結果</span><br />{review.result}</p>
              <p><span className="text-muted-foreground">CLV</span><br />{review.clv > 0 ? "+" : ""}{review.clv}</p>
              <p><span className="text-muted-foreground">倉位檢查</span><br />單場上限低於 2%</p>
            </div>
            <p className="mt-4 rounded border border-border bg-slate-50 p-3 text-sm">{review.lesson}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
