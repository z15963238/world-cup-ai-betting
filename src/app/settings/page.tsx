import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { defaultWeights } from "@/lib/betting/recommendationEngine";

export default function SettingsPage() {
  const total = Object.values(defaultWeights).reduce((sum, value) => sum + value, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-primary">模型權重</p>
        <h2 className="mt-2 text-3xl font-bold">推薦引擎權重設定</h2>
      </div>
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>預設權重</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">MVP 目前顯示預設權重並檢查總和。之後可再接狀態保存或 API。</p>
          </div>
          <button className="inline-flex h-10 items-center gap-2 rounded bg-primary px-4 text-sm font-medium text-primary-foreground">
            <RotateCcw className="h-4 w-4" /> 重設
          </button>
        </div>
        <div className="mt-5 rounded border border-border bg-slate-50 p-4 text-sm">
          權重總和：<strong>{total.toFixed(2)}</strong>{" "}
          {Math.abs(total - 1) > 0.001 ? <span className="text-amber-700">警告：總和應等於 1</span> : <span className="text-emerald-700">有效</span>}
        </div>
        <div className="mt-5 grid gap-4">
          {Object.entries(defaultWeights).map(([key, value]) => (
            <div key={key} className="grid gap-2 md:grid-cols-[220px_1fr_80px] md:items-center">
              <label className="flex items-center gap-2 text-sm font-medium">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                {key}
              </label>
              <Progress value={value * 100} />
              <input className="h-10 rounded border border-border bg-white px-3 text-sm" defaultValue={value.toFixed(2)} aria-label={key} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
