"use client";

import { useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Clock, ListChecks, MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { sortedWorldCupSchedule, worldCupSchedule, type MatchStatus, type WorldCupScheduleMatch } from "@/lib/data/worldCupSchedule";

const text = {
  title: "\u4e16\u754c\u76c3 AI \u8cfd\u524d\u5efa\u8b70",
  subtitle:
    "\u9078\u64c7\u6bd4\u8cfd\u5f8c\uff0cAI \u6703\u7d9c\u5408\u7403\u968a\u72c0\u614b\u3001\u7403\u54e1\u72c0\u6cc1\u3001\u76e4\u53e3\u8b8a\u5316\u8207\u8fd1\u671f\u6578\u64da\uff0c\u7d66\u51fa\u6700\u9069\u5408\u7684\u6295\u6ce8\u9078\u9805\u8207\u7406\u7531\u3002",
  heroNote: "\u8cfd\u524d\u5feb\u901f\u5224\u65b7\u3001\u98a8\u96aa\u63d0\u9192\u3001\u4eba\u5de5\u6c7a\u7b56\u53c3\u8003",
  notStarted: "\u5c1a\u672a\u958b\u8cfd",
  completedReview: "\u5df2\u5b8c\u8cfd\uff0c\u8cfd\u524d\u5efa\u8b70\u53ef\u56de\u9867",
  completedNoAnalysis: "\u5df2\u5b8c\u8cfd\uff0c\u7121\u8cfd\u524d\u5206\u6790",
  canAnalyze: "\u5c1a\u672a\u5206\u6790\uff0c\u53ef\u7522\u751f AI \u5efa\u8b70",
  hasAnalysis: "\u5df2\u6709\u5206\u6790",
  noAnalysis: "\u5c1a\u672a\u5206\u6790",
  pending: "\u5f85\u78ba\u8a8d",
  score: "\u6bd4\u5206\uff1a",
  generate: "\u7522\u751f AI \u5efa\u8b70",
  view: "\u67e5\u770b AI \u5efa\u8b70",
  pick: "\u63a8\u85a6\u4e0b\u6ce8\uff1a",
  confidence: "\u628a\u63e1\u5ea6\uff1a",
  risk: "\u98a8\u96aa\uff1a",
  model: "\u6a21\u578b\u5224\u65b7\uff1a",
  why: "\u70ba\u4ec0\u9ebc\u63a8\u85a6",
  avoid: "\u4e0d\u8981\u78b0\u7684\u9078\u9805",
  checklist: "\u4e0b\u6ce8\u524d\u8981\u78ba\u8a8d",
  schedule: "\u672a\u4f86\u8cfd\u7a0b",
  scheduleHint: "\u6642\u9593\u7686\u4ee5\u53f0\u7063\u6642\u9593\u986f\u793a\uff0c\u672a\u4f86\u8cfd\u4e8b\u4f9d\u6642\u9593\u7531\u8fd1\u5230\u9060\u6392\u5217\u3002",
  date: "\u65e5\u671f",
  taiwanTime: "\u53f0\u7063\u6642\u9593",
  match: "\u5c0d\u6230\u7d44\u5408",
  group: "\u5206\u7d44",
  status: "\u72c0\u614b",
  analysisStatus: "\u8cfd\u524d\u5206\u6790\u8cc7\u6599\u72c0\u614b"
};

const featuredMatchIds = ["mexico-south-africa", "south-korea-czechia", "canada-bosnia-herzegovina", "usa-paraguay"] as const;

const recommendations = {
  "mexico-south-africa": {
    pick: "\u5c0f 2.5 \u7403",
    confidence: 74,
    risk: "\u4e2d",
    modelView: "\u504f\u5411\u5c0f\u6bd4\u5206\u3001\u7bc0\u594f\u504f\u6162\uff0c\u5169\u968a\u9032\u7403\u6578\u4e0d\u5bb9\u6613\u62c9\u9ad8\u3002",
    reasons: [
      "\u58a8\u897f\u54e5\u63a7\u7403\u7a69\u5b9a\uff0c\u4f46\u7d42\u7d50\u6548\u7387\u4ecd\u9700\u89c0\u5bdf\u3002",
      "\u5357\u975e\u5ba2\u5834\u7bc0\u594f\u504f\u4fdd\u5b88\uff0c\u53cd\u64ca\u5a01\u8105\u5927\u65bc\u6301\u7e8c\u58d3\u8feb\u3002",
      "\u76ee\u524d\u76e4\u53e3\u5c0d\u5927\u6bd4\u5206\u652f\u6301\u4e0d\u8db3\uff0c\u5c0f\u7403\u65b9\u5411\u8f03\u7b26\u5408\u6a21\u578b\u5224\u65b7\u3002"
    ],
    avoid: ["\u5927 3.5 \u7403", "\u8ffd\u9ad8\u71b1\u9580\u8b93\u5206", "\u81e8\u5834\u8ce0\u7387\u6025\u8dcc\u5f8c\u624d\u8ffd\u9032"],
    checklist: [
      "\u78ba\u8a8d\u5148\u767c\u524d\u92d2\u8207\u4e3b\u529b\u4e2d\u5834\u662f\u5426\u51fa\u8cfd\u3002",
      "\u82e5\u7e3d\u9032\u7403\u76e4\u5f9e 2.5 \u5347\u5230 2.75\uff0c\u9700\u8981\u91cd\u65b0\u8a55\u4f30\u3002",
      "\u82e5\u81e8\u5834\u51fa\u73fe\u5929\u5019\u6216\u5834\u5730\u4e0d\u5229\u50b3\u63a7\uff0c\u5c0f\u7403\u5224\u65b7\u6703\u66f4\u7a69\u3002"
    ]
  },
  "south-korea-czechia": {
    pick: "\u5357\u97d3 +0.25",
    confidence: 68,
    risk: "\u4e2d",
    modelView: "\u5357\u97d3\u6a5f\u52d5\u6027\u8207\u8f49\u63db\u901f\u5ea6\u8f03\u597d\uff0c\u4f46\u6377\u514b\u8eab\u6750\u8207\u5b9a\u4f4d\u7403\u4ecd\u6709\u5a01\u8105\u3002",
    reasons: [
      "\u5357\u97d3\u8fd1\u671f\u653b\u5b88\u8f49\u63db\u901f\u5ea6\u8f03\u5feb\uff0c\u80fd\u9650\u5236\u6377\u514b\u63a8\u9032\u3002",
      "\u6377\u514b\u5b9a\u4f4d\u7403\u5a01\u8105\u9ad8\uff0c\u8b93\u6bd4\u8cfd\u4ecd\u6709\u6ce2\u52d5\u3002",
      "\u8cfd\u679c\u5df2\u5b8c\u8cfd\uff0c\u5efa\u8b70\u4ecd\u53ef\u4f5c\u70ba\u6a21\u578b\u5224\u65b7\u56de\u9867\u3002"
    ],
    avoid: ["\u5357\u97d3\u5927\u52dd\u65b9\u5411", "\u9ad8\u8ce0\u6b63\u6bd4", "\u5ffd\u7565\u5b9a\u4f4d\u7403\u98a8\u96aa\u7684\u55ae\u908a\u5224\u65b7"],
    checklist: [
      "\u56de\u770b\u5be6\u969b\u5148\u767c\u662f\u5426\u7b26\u5408\u6a21\u578b\u9810\u671f\u3002",
      "\u78ba\u8a8d\u6377\u514b\u5b9a\u4f4d\u7403\u8207\u9ad8\u7a7a\u7403\u662f\u5426\u9020\u6210\u4e3b\u8981\u5a01\u8105\u3002",
      "\u6aa2\u67e5\u8cfd\u524d\u76e4\u53e3\u662f\u5426\u66fe\u51fa\u73fe\u53cd\u5411\u5287\u70c8\u8b8a\u52d5\u3002"
    ]
  },
  "canada-bosnia-herzegovina": {
    pick: "\u5169\u968a\u9032\u7403\uff1a\u662f",
    confidence: 58,
    risk: "\u4e2d\u504f\u9ad8",
    modelView:
      "\u52a0\u62ff\u5927\u4e3b\u5834\u9032\u653b\u610f\u5716\u660e\u78ba\uff0c\u4f46\u6ce2\u8d6b\u8eab\u9ad4\u5c0d\u6297\u8207\u53cd\u64ca\u4e0d\u5bb9\u5ffd\u8996\u3002\u76e4\u53e3\u8cc7\u6599\u5f85\u78ba\u8a8d\uff0c\u56e0\u6b64\u628a\u63e1\u5ea6\u4e0d\u7d66\u904e\u9ad8\u3002",
    reasons: [
      "\u52a0\u62ff\u5927\u4e3b\u5834\u9996\u6230\u61c9\u6703\u4e3b\u52d5\u63a8\u9032\uff0c\u653b\u64ca\u7aef\u6709\u901f\u5ea6\u512a\u52e2\u3002",
      "\u6ce2\u8d6b\u9632\u7dda\u5c0d\u6297\u5f37\uff0c\u4f46\u8f49\u8eab\u8207\u6a6b\u5411\u79fb\u52d5\u53ef\u80fd\u88ab\u52a0\u62ff\u5927\u62c9\u626f\u3002",
      "\u6ce2\u8d6b\u53cd\u64ca\u8207\u5b9a\u4f4d\u7403\u6709\u9032\u7403\u6a5f\u6703\uff0c\u55ae\u908a\u8ffd\u52a0\u62ff\u5927\u52dd\u98a8\u96aa\u8f03\u9ad8\u3002",
      "\u76e4\u53e3\u8cc7\u6599\u5f85\u78ba\u8a8d\uff0c\u76ee\u524d\u53ea\u80fd\u4f5c\u70ba\u4fdd\u5b88\u5206\u6790\u3002"
    ],
    avoid: ["\u52a0\u62ff\u5927\u5927\u52dd\u9ad8\u8ce0", "\u672a\u78ba\u8a8d\u5148\u767c\u524d\u8ffd\u5927\u7403", "\u5ffd\u7565\u6ce2\u8d6b\u5b9a\u4f4d\u7403\u98a8\u96aa"],
    checklist: [
      "\u78ba\u8a8d\u52a0\u62ff\u5927\u4e3b\u529b\u908a\u8def\u8207\u4e2d\u92d2\u662f\u5426\u5148\u767c\u3002",
      "\u78ba\u8a8d\u6ce2\u8d6b\u5f8c\u885b\u7dda\u8207\u9632\u5b88\u4e2d\u5834\u7684\u5b8c\u6574\u5ea6\u3002",
      "\u958b\u8cfd\u524d\u91cd\u770b\u5169\u968a\u9032\u7403\u8207\u7e3d\u9032\u7403\u76e4\u53e3\uff0c\u76e4\u53e3\u8cc7\u6599\u5f85\u78ba\u8a8d\u3002"
    ]
  },
  "usa-paraguay": {
    pick: "\u7f8e\u570b\u4e0d\u6557",
    confidence: 61,
    risk: "\u4e2d",
    modelView:
      "\u7f8e\u570b\u4e3b\u5834\u8207\u9663\u5bb9\u4e0a\u9650\u8f03\u597d\uff0c\u4f46\u5df4\u62c9\u572d\u5c0d\u6297\u5f37\u3001\u6bd4\u8cfd\u7bc0\u594f\u53ef\u80fd\u88ab\u62c9\u6162\u3002\u76e4\u53e3\u8cc7\u6599\u5f85\u78ba\u8a8d\uff0c\u5efa\u8b70\u907f\u514d\u904e\u5ea6\u8ffd\u8b93\u5206\u3002",
    reasons: [
      "\u7f8e\u570b\u4e2d\u524d\u5834\u6a5f\u52d5\u6027\u8f03\u597d\uff0c\u4e3b\u5834\u9996\u6230\u52d5\u6a5f\u5145\u8db3\u3002",
      "\u5df4\u62c9\u572d\u8eab\u9ad4\u5c0d\u6297\u8207\u9632\u5b88\u5bc6\u5ea6\u6703\u589e\u52a0\u7f8e\u570b\u7834\u9580\u96e3\u5ea6\u3002",
      "\u7f8e\u570b\u4e0d\u6557\u6bd4\u76f4\u63a5\u8ffd\u5927\u52dd\u66f4\u7b26\u5408\u4fdd\u5b88\u98a8\u63a7\u3002",
      "\u76e4\u53e3\u8cc7\u6599\u5f85\u78ba\u8a8d\uff0c\u4e0d\u61c9\u7528\u9ad8\u4fe1\u5fc3\u7b49\u7d1a\u89e3\u8b80\u3002"
    ],
    avoid: ["\u7f8e\u570b\u8b93\u592a\u6df1\u7684\u76e4", "\u9ad8\u8ce0\u6b63\u6bd4", "\u672a\u770b\u5148\u767c\u5c31\u8ffd\u5927\u7403"],
    checklist: [
      "\u78ba\u8a8d\u7f8e\u570b\u4e3b\u529b\u524d\u5834\u8207\u4e2d\u5834\u662f\u5426\u5148\u767c\u3002",
      "\u78ba\u8a8d\u5df4\u62c9\u572d\u662f\u5426\u6392\u51fa\u504f\u4fdd\u5b88\u9632\u7dda\u3002",
      "\u958b\u8cfd\u524d\u91cd\u770b 1X2 \u8207\u8b93\u5206\u76e4\u53e3\uff0c\u76e4\u53e3\u8cc7\u6599\u5f85\u78ba\u8a8d\u3002"
    ]
  }
};

type Recommendation = (typeof recommendations)[keyof typeof recommendations];
type FeaturedMatch = WorldCupScheduleMatch & { recommendation?: Recommendation };

const statusLabels: Record<MatchStatus, string> = {
  upcoming: "\u5c1a\u672a\u958b\u8cfd",
  live: "\u9032\u884c\u4e2d",
  finished: "\u5df2\u5b8c\u8cfd"
};

const statusTones: Record<MatchStatus, "success" | "warning" | "muted"> = {
  upcoming: "success",
  live: "warning",
  finished: "muted"
};

export default function HomePage() {
  const featuredMatches = useMemo<FeaturedMatch[]>(
    () =>
      featuredMatchIds
        .map((id) => worldCupSchedule.find((match) => match.id === id))
        .filter((match): match is WorldCupScheduleMatch => Boolean(match))
        .map((match) => ({ ...match, recommendation: recommendations[match.id as keyof typeof recommendations] })),
    []
  );
  const [selectedId, setSelectedId] = useState(featuredMatches[0]?.id ?? "mexico-south-africa");
  const [showAdvice, setShowAdvice] = useState(false);
  const selectedMatch = featuredMatches.find((match) => match.id === selectedId) ?? featuredMatches[0];
  const canShowAdvice = Boolean(selectedMatch?.recommendation);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-sky-50 px-6 py-8 shadow-panel md:px-10 md:py-12">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{text.heroNote}</p>
          <h1 className="text-4xl font-black tracking-normal text-slate-950 md:text-6xl">{text.title}</h1>
          <p className="text-base leading-8 text-slate-700 md:text-lg">{text.subtitle}</p>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {featuredMatches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            selected={selectedId === match.id}
            onSelect={() => {
              setSelectedId(match.id);
              setShowAdvice(false);
            }}
          />
        ))}
      </section>

      {selectedMatch ? (
        <div className="rounded-2xl border border-border bg-white p-5 shadow-panel">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">{text.analysisStatus}</p>
              <p className="mt-1 text-lg font-bold text-slate-950">{getAnalysisMessage(selectedMatch)}</p>
            </div>
            <button
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none"
              type="button"
              disabled={!canShowAdvice}
              onClick={() => setShowAdvice(true)}
            >
              <Sparkles className="h-4 w-4" />
              {selectedMatch.status === "finished" ? text.view : text.generate}
            </button>
          </div>
        </div>
      ) : null}

      {showAdvice && selectedMatch?.recommendation ? <AdviceCard match={selectedMatch} recommendation={selectedMatch.recommendation} /> : null}

      <ScheduleSection
        selectedId={selectedId}
        onSelect={(id) => {
          setSelectedId(id);
          setShowAdvice(Boolean(recommendations[id as keyof typeof recommendations]));
        }}
      />
    </div>
  );
}

function MatchCard({ match, selected, onSelect }: { match: FeaturedMatch; selected: boolean; onSelect: () => void }) {
  return (
    <button
      className={`w-full rounded-2xl border bg-white p-5 text-left shadow-panel transition hover:-translate-y-0.5 hover:border-primary hover:shadow-xl ${
        selected ? "border-primary ring-4 ring-primary/15" : "border-border"
      } ${match.status === "finished" ? "bg-slate-50" : ""}`}
      type="button"
      onClick={onSelect}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-2xl font-black text-slate-950">
              {match.homeTeam} <span className="text-slate-400">vs</span> {match.awayTeam}
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-600">
              <Clock className="h-4 w-4 text-primary" />
              {match.kickoffTimeTaiwan}
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="h-4 w-4" />
              {match.venue}
            </p>
          </div>
          <Badge tone={statusTones[match.status]}>{statusLabels[match.status]}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          {match.status === "finished" && match.score ? <Badge tone="default">{text.score + match.score}</Badge> : null}
          <Badge tone={match.hasRecommendation ? "success" : "muted"}>{match.hasRecommendation ? text.hasAnalysis : text.noAnalysis}</Badge>
          {match.dataConfidence !== "high" ? <Badge tone="warning">{text.pending}</Badge> : null}
          <span className="text-sm text-slate-500">{getAnalysisMessage(match)}</span>
        </div>
      </div>
    </button>
  );
}

function AdviceCard({ match, recommendation }: { match: FeaturedMatch; recommendation: Recommendation }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-primary/30 bg-white shadow-panel">
      <div className="flex flex-col gap-3 border-b border-border bg-emerald-50 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">
            {match.homeTeam} vs {match.awayTeam}
          </p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">AI {match.status === "finished" ? text.completedReview : text.hasAnalysis}</h2>
        </div>
        <Badge tone={match.status === "finished" ? "muted" : "success"}>{statusLabels[match.status]}</Badge>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[0.95fr_1.25fr]">
        <div className="rounded-2xl border border-border bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-500">{text.pick}</p>
          <p className="mt-2 text-4xl font-black text-slate-950">{recommendation.pick}</p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Metric label={text.confidence} value={`${recommendation.confidence} / 100`} />
            <Metric label={text.risk} value={recommendation.risk} />
          </div>
          <p className="mt-6 text-sm font-semibold text-slate-500">{text.model}</p>
          <p className="mt-2 text-base font-medium leading-7 text-slate-800">{recommendation.modelView}</p>
        </div>

        <div className="grid gap-4">
          <InfoBlock icon={<CheckCircle2 className="h-4 w-4 text-emerald-700" />} title={text.why} items={recommendation.reasons} />
          <InfoBlock icon={<AlertTriangle className="h-4 w-4 text-amber-700" />} title={text.avoid} items={recommendation.avoid} />
          <InfoBlock icon={<ListChecks className="h-4 w-4 text-slate-700" />} title={text.checklist} items={recommendation.checklist} />
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function ScheduleSection({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-3xl font-black tracking-normal text-slate-950">{text.schedule}</h2>
        <p className="mt-2 text-sm text-slate-600">{text.scheduleHint}</p>
      </div>
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-white shadow-panel lg:block">
        <div className="grid grid-cols-[1fr_1fr_1.5fr_0.7fr_0.8fr_1fr] gap-3 border-b border-border bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700">
          <span>{text.date}</span>
          <span>{text.taiwanTime}</span>
          <span>{text.match}</span>
          <span>{text.group}</span>
          <span>{text.status}</span>
          <span>{text.analysisStatus}</span>
        </div>
        <div className="divide-y divide-border">
          {sortedWorldCupSchedule.map((match) => (
            <button
              key={match.id}
              className={`grid w-full grid-cols-[1fr_1fr_1.5fr_0.7fr_0.8fr_1fr] gap-3 px-5 py-4 text-left text-sm transition ${
                selectedId === match.id ? "bg-emerald-50 text-slate-900" : match.status === "finished" ? "bg-slate-50 text-slate-500" : "text-slate-800"
              } ${match.hasRecommendation ? "hover:bg-emerald-50" : "cursor-default"}`}
              type="button"
              disabled={!match.hasRecommendation}
              onClick={() => onSelect(match.id)}
            >
              <span>{match.kickoffTimeTaiwan.slice(0, 10)}</span>
              <span>{match.kickoffTimeTaiwan.slice(11)}</span>
              <span className="font-bold">
                {match.homeTeam} vs {match.awayTeam}
              </span>
              <span>{match.group}</span>
              <span>
                <Badge tone={statusTones[match.status]}>{statusLabels[match.status]}</Badge>
              </span>
              <span>
                <Badge tone={match.dataConfidence !== "high" ? "warning" : match.hasRecommendation ? "success" : "muted"}>
                  {match.dataConfidence !== "high" ? text.pending : match.hasRecommendation ? text.hasAnalysis : text.noAnalysis}
                </Badge>
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 lg:hidden">
        {sortedWorldCupSchedule.map((match) => (
          <button
            key={match.id}
            className={`rounded-2xl border border-border bg-white p-4 text-left shadow-panel transition ${
              selectedId === match.id ? "border-primary ring-4 ring-primary/15" : ""
            } ${match.status === "finished" ? "opacity-75" : ""} ${match.hasRecommendation ? "hover:border-primary" : "cursor-default"}`}
            type="button"
            disabled={!match.hasRecommendation}
            onClick={() => onSelect(match.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-slate-950">
                  {match.homeTeam} vs {match.awayTeam}
                </p>
                <p className="mt-2 text-sm text-slate-600">{match.kickoffTimeTaiwan}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {match.group} / {match.venue}
                </p>
              </div>
              <Badge tone={statusTones[match.status]}>{statusLabels[match.status]}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {match.status === "finished" && match.score ? <Badge tone="default">{text.score + match.score}</Badge> : null}
              <Badge tone={match.hasRecommendation ? "success" : "muted"}>{match.hasRecommendation ? text.hasAnalysis : text.noAnalysis}</Badge>
              {match.dataConfidence !== "high" ? <Badge tone="warning">{text.pending}</Badge> : null}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function InfoBlock({ icon, title, items }: { icon: ReactNode; title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <p className="flex items-center gap-2 font-bold text-slate-900">
        {icon}
        {title}
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-600">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function getAnalysisMessage(match: FeaturedMatch | WorldCupScheduleMatch) {
  if (match.status === "finished") {
    return match.hasRecommendation ? text.completedReview : text.completedNoAnalysis;
  }
  return match.hasRecommendation ? text.hasAnalysis : text.canAnalyze;
}
