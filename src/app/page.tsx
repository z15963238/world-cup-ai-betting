"use client";

import { useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Clock, ListChecks, MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { recommendations, type RecommendationAdvice } from "@/lib/data/recommendations";
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

type Recommendation = RecommendationAdvice;
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
