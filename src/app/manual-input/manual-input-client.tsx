"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RecommendationRanking } from "@/components/recommendations/recommendation-ranking";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { evaluateManualMatch } from "@/lib/betting/marketEvaluationEngine";
import { isOddsKey, toSafeNumber, validateManualInput } from "@/lib/manual-input/validation";
import { deleteManualAnalysis, listManualAnalyses, saveManualAnalysis } from "@/lib/storage/manualAnalysesStorage";
import type { ManualAnalysisRecord, ManualMatchInput } from "@/lib/types/manualAnalysis";

const defaultInput: ManualMatchInput = {
  matchName: "Argentina vs France",
  competition: "World Cup",
  kickoffTime: "2026-06-19T20:00",
  venue: "MetLife Stadium",
  homeTeam: "Argentina",
  awayTeam: "France",
  homeMetrics: {
    recent5Form: "WWDWW",
    goalsForLast5: 11,
    goalsAgainstLast5: 3,
    xGLast5: 9.8,
    xGALast5: 4.1,
    pressingLevel: 72,
    possessionAbility: 84,
    counterAttackAbility: 78,
    setPieceThreat: 70,
    lineupStability: 86,
    injuryImpact: 18,
    fatigueRisk: 36,
    motivationScore: 88,
    tacticalFitScore: 84
  },
  awayMetrics: {
    recent5Form: "WDWWL",
    goalsForLast5: 10,
    goalsAgainstLast5: 5,
    xGLast5: 10.4,
    xGALast5: 5.7,
    pressingLevel: 69,
    possessionAbility: 76,
    counterAttackAbility: 91,
    setPieceThreat: 82,
    lineupStability: 78,
    injuryImpact: 24,
    fatigueRisk: 42,
    motivationScore: 85,
    tacticalFitScore: 80
  },
  marketOdds: {
    homeWinOdds: 2.42,
    drawOdds: 3.18,
    awayWinOdds: 2.86,
    handicapLine: -0.25,
    homeHandicapOdds: 1.91,
    awayHandicapOdds: 1.97,
    totalGoalsLine: 2.5,
    overOdds: 1.92,
    underOdds: 1.96,
    bttsYesOdds: 1.84,
    bttsNoOdds: 1.98,
    cornerLine: 9.5,
    cornerOverOdds: 1.9,
    cornerUnderOdds: 1.92
  },
  marketMovement: {
    openingHomeWinOdds: 2.5,
    currentHomeWinOdds: 2.42,
    openingDrawOdds: 3.12,
    currentDrawOdds: 3.18,
    openingAwayWinOdds: 2.8,
    currentAwayWinOdds: 2.86,
    openingTotalGoalsLine: 2.5,
    currentTotalGoalsLine: 2.5,
    openingOverOdds: 1.98,
    currentOverOdds: 1.92,
    openingUnderOdds: 1.9,
    currentUnderOdds: 1.96,
    notes: "僅為手動範例。臨場陣容公布後請重新評估。"
  }
};

type MetricKey = keyof ManualMatchInput["homeMetrics"];
type OddsKey = keyof ManualMatchInput["marketOdds"];
type MovementKey = keyof ManualMatchInput["marketMovement"];

const metricFields: Array<{ key: MetricKey; label: string; type?: "text" | "number" }> = [
  { key: "recent5Form", label: "近 5 場戰績", type: "text" },
  { key: "goalsForLast5", label: "近 5 場進球" },
  { key: "goalsAgainstLast5", label: "近 5 場失球" },
  { key: "xGLast5", label: "近 5 場 xG" },
  { key: "xGALast5", label: "近 5 場 xGA" },
  { key: "pressingLevel", label: "逼搶強度" },
  { key: "possessionAbility", label: "控球能力" },
  { key: "counterAttackAbility", label: "反擊能力" },
  { key: "setPieceThreat", label: "定位球威脅" },
  { key: "lineupStability", label: "陣容穩定度" },
  { key: "injuryImpact", label: "傷停影響" },
  { key: "fatigueRisk", label: "疲勞風險" },
  { key: "motivationScore", label: "戰意分數" },
  { key: "tacticalFitScore", label: "戰術適配分數" }
];

const oddsFields: Array<{ key: OddsKey; label: string }> = [
  { key: "homeWinOdds", label: "主勝賠率" },
  { key: "drawOdds", label: "和局賠率" },
  { key: "awayWinOdds", label: "客勝賠率" },
  { key: "handicapLine", label: "讓球盤口" },
  { key: "homeHandicapOdds", label: "主隊讓球賠率" },
  { key: "awayHandicapOdds", label: "客隊讓球賠率" },
  { key: "totalGoalsLine", label: "大小球盤口" },
  { key: "overOdds", label: "大分賠率" },
  { key: "underOdds", label: "小分賠率" },
  { key: "bttsYesOdds", label: "雙方進球是賠率" },
  { key: "bttsNoOdds", label: "雙方進球否賠率" },
  { key: "cornerLine", label: "角球盤口" },
  { key: "cornerOverOdds", label: "角球大分賠率" },
  { key: "cornerUnderOdds", label: "角球小分賠率" }
];

const movementFields: Array<{ key: MovementKey; label: string; type?: "text" | "number" }> = [
  { key: "openingHomeWinOdds", label: "初盤主勝賠率" },
  { key: "currentHomeWinOdds", label: "目前主勝賠率" },
  { key: "openingDrawOdds", label: "初盤和局賠率" },
  { key: "currentDrawOdds", label: "目前和局賠率" },
  { key: "openingAwayWinOdds", label: "初盤客勝賠率" },
  { key: "currentAwayWinOdds", label: "目前客勝賠率" },
  { key: "openingTotalGoalsLine", label: "初盤大小球盤口" },
  { key: "currentTotalGoalsLine", label: "目前大小球盤口" },
  { key: "openingOverOdds", label: "初盤大分賠率" },
  { key: "currentOverOdds", label: "目前大分賠率" },
  { key: "openingUnderOdds", label: "初盤小分賠率" },
  { key: "currentUnderOdds", label: "目前小分賠率" },
  { key: "notes", label: "備註", type: "text" }
];

export function ManualInputClient() {
  const [input, setInput] = useState<ManualMatchInput>(defaultInput);
  const [currentRecord, setCurrentRecord] = useState<ManualAnalysisRecord | null>(null);
  const [history, setHistory] = useState<ManualAnalysisRecord[]>([]);

  useEffect(() => {
    setHistory(listManualAnalyses());
  }, []);

  const preview = useMemo(() => evaluateManualMatch(input), [input]);
  const formErrors = validateManualInput(input).errors;

  function refreshHistory() {
    setHistory(listManualAnalyses());
  }

  function submitAnalysis() {
    if (formErrors.length > 0) return;

    const record = saveManualAnalysis({
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      input,
      evaluations: preview
    });
    setCurrentRecord(record);
    refreshHistory();
  }

  function updateMatchField<K extends keyof Pick<ManualMatchInput, "matchName" | "competition" | "kickoffTime" | "venue" | "homeTeam" | "awayTeam">>(
    key: K,
    value: ManualMatchInput[K]
  ) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function updateMetric(side: "homeMetrics" | "awayMetrics", key: MetricKey, value: string) {
    setInput((current) => ({
      ...current,
      [side]: {
        ...current[side],
        [key]: key === "recent5Form" ? value : toSafeNumber(value)
      }
    }));
  }

  function updateOdds(key: OddsKey, value: string) {
    setInput((current) => ({
      ...current,
      marketOdds: { ...current.marketOdds, [key]: toSafeNumber(value) }
    }));
  }

  function updateMovement(key: MovementKey, value: string) {
    setInput((current) => ({
      ...current,
      marketMovement: { ...current.marketMovement, [key]: key === "notes" ? value : toSafeNumber(value) }
    }));
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold text-primary">人工分析</p>
        <h2 className="mt-2 text-3xl font-bold">人工輸入賽事資料與推薦排序</h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">手動輸入賽事、球隊、賠率與盤口變化。瀏覽器只產生分析結果，不連接下注帳號，也不執行下注。</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>賽事資訊</CardTitle>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-3">
          <TextInput label="賽事名稱" required value={input.matchName} onChange={(value) => updateMatchField("matchName", value)} />
          <TextInput label="賽事類別" required value={input.competition} onChange={(value) => updateMatchField("competition", value)} />
          <TextInput label="開賽時間" required type="datetime-local" value={input.kickoffTime} onChange={(value) => updateMatchField("kickoffTime", value)} />
          <TextInput label="場地" value={input.venue} onChange={(value) => updateMatchField("venue", value)} />
          <TextInput label="主隊" required value={input.homeTeam} onChange={(value) => updateMatchField("homeTeam", value)} />
          <TextInput label="客隊" required value={input.awayTeam} onChange={(value) => updateMatchField("awayTeam", value)} />
        </div>
      </Card>

      <section className="grid gap-4 xl:grid-cols-2">
        <TeamMetricsCard title="主隊指標" fields={metricFields} values={input.homeMetrics} onChange={(key, value) => updateMetric("homeMetrics", key, value)} />
        <TeamMetricsCard title="客隊指標" fields={metricFields} values={input.awayMetrics} onChange={(key, value) => updateMetric("awayMetrics", key, value)} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>市場賠率</CardTitle>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          {oddsFields.map((field) => (
            <TextInput
              key={field.key}
              label={field.label}
              type="number"
              step="0.01"
              value={String(input.marketOdds[field.key])}
              error={isOddsKey(field.key) && input.marketOdds[field.key] <= 1 ? "賠率必須大於 1。" : undefined}
              onChange={(value) => updateOdds(field.key, value)}
            />
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>盤口變化</CardTitle>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          {movementFields.map((field) => (
            <TextInput
              key={field.key}
              label={field.label}
              type={field.type === "text" ? "text" : "number"}
              step="0.01"
              value={String(input.marketMovement[field.key])}
              onChange={(value) => updateMovement(field.key, value)}
            />
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <button className="h-10 rounded bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={formErrors.length > 0} onClick={submitAnalysis}>
          儲存分析預覽
        </button>
        {currentRecord ? (
          <Link className="inline-flex h-10 items-center rounded border border-border bg-white px-4 text-sm font-medium" href={`/manual-input/${currentRecord.id}`}>
            開啟已儲存分析
          </Link>
        ) : null}
      </div>
      {formErrors.length > 0 ? (
        <Card className="border-amber-300 bg-amber-50">
          <CardTitle>輸入檢查</CardTitle>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-900">
            {formErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>分析預覽</CardTitle>
        </CardHeader>
        <RecommendationRanking evaluations={preview} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>最近 10 筆人工分析</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">目前沒有已儲存的人工分析。</p>
          ) : (
            history.map((record) => (
              <div key={record.id} className="flex flex-wrap items-center justify-between gap-3 rounded border border-border p-3 text-sm">
                <div>
                  <p className="font-medium">{record.input.matchName}</p>
                  <p className="text-muted-foreground">{new Date(record.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <Link className="rounded border border-border px-3 py-2" href={`/manual-input/${record.id}`}>
                    開啟
                  </Link>
                  <button
                    className="rounded border border-border px-3 py-2"
                    type="button"
                    onClick={() => {
                      deleteManualAnalysis(record.id);
                      refreshHistory();
                    }}
                  >
                    刪除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

function TeamMetricsCard({
  title,
  fields,
  values,
  onChange
}: {
  title: string;
  fields: typeof metricFields;
  values: ManualMatchInput["homeMetrics"];
  onChange: (key: MetricKey, value: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <TextInput
            key={field.key}
            label={field.label}
            type={field.type === "text" ? "text" : "number"}
            step="0.01"
            value={String(values[field.key])}
            onChange={(value) => onChange(field.key, value)}
          />
        ))}
      </div>
    </Card>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
  step,
  required,
  error
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  step?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">
        {label} {required ? <span className="text-rose-600">*</span> : null}
      </span>
      <input className="h-10 rounded border border-border bg-white px-3" type={type} step={step} required={required} value={value} onChange={(event) => onChange(event.target.value)} />
      {error ? <span className="text-xs text-rose-700">{error}</span> : null}
    </label>
  );
}
