"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RecommendationRanking } from "@/components/recommendations/recommendation-ranking";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getManualAnalysis, saveManualAnalysisReview } from "@/lib/storage/manualAnalysesStorage";
import type { ManualAnalysisRecord } from "@/lib/types/manualAnalysis";

export function ManualAnalysisDetailClient({ id }: { id: string }) {
  const [record, setRecord] = useState<ManualAnalysisRecord | null>(null);
  const [finalScore, setFinalScore] = useState("");
  const [outcome, setOutcome] = useState<"hit" | "miss" | "pending">("pending");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const saved = getManualAnalysis(id) ?? null;
    setRecord(saved);
    setFinalScore(saved?.reviewResult?.finalScore ?? "");
    setOutcome(saved?.reviewResult?.outcome ?? "pending");
    setNotes(saved?.reviewResult?.notes ?? "");
  }, [id]);

  if (!record) {
    return (
      <Card>
        <CardTitle>找不到人工分析</CardTitle>
        <p className="mt-3 text-sm text-muted-foreground">這筆紀錄可能已從 localStorage 刪除，或儲存在另一個瀏覽器。</p>
        <Link className="mt-4 inline-flex h-10 items-center rounded bg-primary px-4 text-sm font-medium text-primary-foreground" href="/manual-input">
          回到人工輸入
        </Link>
      </Card>
    );
  }

  const avoidWarnings = record.evaluations.filter((item) => item.riskLevel === "High" || item.riskLevel === "Avoid");

  function saveReview() {
    if (!record) return;

    const reviewResult = {
      finalScore,
      outcome,
      notes,
      updatedAt: new Date().toISOString()
    };
    const updatedRecord: ManualAnalysisRecord = { ...record, reviewResult };
    saveManualAnalysisReview(updatedRecord.id, reviewResult);
    setRecord(updatedRecord);
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold text-primary">人工分析明細</p>
        <h2 className="mt-2 text-3xl font-bold">{record.input.matchName}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {record.input.competition} / {record.input.venue} / {new Date(record.createdAt).toLocaleString()}
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>原始輸入資料</CardTitle>
        </CardHeader>
        <pre className="max-h-96 overflow-auto rounded border border-border bg-slate-950 p-4 text-xs text-slate-50">{JSON.stringify(record.input, null, 2)}</pre>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>賽後結果回填</CardTitle>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-1 text-sm">
            <span className="font-medium">最終比分</span>
            <input className="h-10 rounded border border-border bg-white px-3" value={finalScore} onChange={(event) => setFinalScore(event.target.value)} placeholder="例：2-1" />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">命中狀態</span>
            <select className="h-10 rounded border border-border bg-white px-3" value={outcome} onChange={(event) => setOutcome(event.target.value as "hit" | "miss" | "pending")}>
              <option value="pending">待確認</option>
              <option value="hit">命中</option>
              <option value="miss">未命中</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm md:col-span-3">
            <span className="font-medium">備註</span>
            <textarea className="min-h-24 rounded border border-border bg-white px-3 py-2" value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>
        </div>
        <button className="mt-4 h-10 rounded bg-primary px-4 text-sm font-medium text-primary-foreground" type="button" onClick={saveReview}>
          儲存回填結果
        </button>
        {record.reviewResult ? <p className="mt-3 text-sm text-muted-foreground">已儲存：{new Date(record.reviewResult.updatedAt).toLocaleString()}</p> : null}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>推薦排序</CardTitle>
        </CardHeader>
        <RecommendationRanking evaluations={record.evaluations} />
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>風險警示</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {avoidWarnings.length === 0 ? (
              <p className="text-sm text-muted-foreground">這筆分析沒有高風險或避開市場。</p>
            ) : (
              avoidWarnings.map((item) => (
                <div key={item.id} className="rounded border border-border p-3 text-sm">
                  <p className="font-medium">{item.selection}</p>
                  <p className="text-muted-foreground">
                    {item.riskLevel} / {item.riskScore}/100
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>理由與警示</CardTitle>
          </CardHeader>
          <div className="space-y-3 text-sm">
            {record.evaluations.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded border border-border p-3">
                <p className="font-medium">{item.selection}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                  {item.reasoning.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                  {item.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
