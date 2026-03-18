"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import MemeCard from "./components/MemeCard";
import StatBar from "./components/StatBar";
import FlowChart from "./components/FlowChart";

type Meme = {
  id: number;
  title: string;
  url: string;
  source: string;
  platform: string;
  image_url: string;
  view_count: number;
  like_count: number;
  flow_type: string | null;
  lifecycle_stage: string | null;
  collected_at: string;
};

type Tab = "all" | "inflow" | "independent" | "export";

const TABS: { key: Tab; label: string; color: string }[] = [
  { key: "all",         label: "전체",           color: "#e8e8e8" },
  { key: "inflow",      label: "해외 → 국내 유입", color: "#3b82f6" },
  { key: "independent", label: "국내 독립 생성",   color: "#10b981" },
  { key: "export",      label: "국내 → 해외 역수출", color: "#f97316" },
];

const STAGE_LABEL: Record<string, string> = {
  seed:   "태동기",
  spread: "확산기",
  peak:   "고점",
  fade:   "쇠퇴기",
};

const SOURCE_LABEL: Record<string, string> = {
  reddit:   "Reddit",
  youtube:  "YouTube",
  ruliweb:  "루리웹",
  ucduk:    "웃긴대학",
  naver:    "네이버",
  dcinside: "디시인사이드",
  fmkorea:  "에펨코리아",
};

export default function Dashboard() {
  const [memes, setMemes]         = useState<Meme[]>([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState<Tab>("all");
  const [search, setSearch]       = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchMemes = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("memes")
      .select("*")
      .order("collected_at", { ascending: false })
      .limit(200);

    if (tab !== "all") {
      query = query.eq("flow_type", tab);
    }

    const { data } = await query;
    setMemes(data || []);
    setLastUpdated(new Date().toLocaleTimeString("ko-KR"));
    setLoading(false);
  }, [tab]);

  useEffect(() => { fetchMemes(); }, [fetchMemes]);

  const filtered = memes.filter(m =>
    search ? m.title.toLowerCase().includes(search.toLowerCase()) : true
  );

  // 통계
  const stats = {
    total:       memes.length,
    inflow:      memes.filter(m => m.flow_type === "inflow").length,
    independent: memes.filter(m => m.flow_type === "independent").length,
    export:      memes.filter(m => m.flow_type === "export").length,
    seed:        memes.filter(m => m.lifecycle_stage === "seed").length,
    spread:      memes.filter(m => m.lifecycle_stage === "spread").length,
    peak:        memes.filter(m => m.lifecycle_stage === "peak").length,
  };

  return (
    <div className="min-h-screen bg-bg text-primary">

      {/* 헤더 */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 bg-bg z-10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-lg tracking-tight">밈레이더</span>
          <span className="flex items-center gap-1.5 text-xs text-dim font-mono">
            <span className="live-dot w-1.5 h-1.5 rounded-full bg-indep inline-block" />
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-dim font-mono">
          <span>업데이트 {lastUpdated}</span>
          <button
            onClick={fetchMemes}
            className="px-3 py-1 border border-border rounded text-soft hover:border-muted hover:text-primary transition-colors"
          >
            새로고침
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "전체 밈",   value: stats.total,       color: "#e8e8e8" },
            { label: "해외 유입", value: stats.inflow,      color: "#3b82f6" },
            { label: "국내 독립", value: stats.independent, color: "#10b981" },
            { label: "역수출",   value: stats.export,      color: "#f97316" },
          ].map(s => (
            <div key={s.label} className="bg-surface border border-border rounded-xl p-4 fade-up">
              <div className="text-xs text-dim font-mono mb-1">{s.label}</div>
              <div className="text-2xl font-mono font-light" style={{ color: s.color }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* 확산 현황 바 */}
        <div className="bg-surface border border-border rounded-xl p-4 mb-6">
          <div className="text-xs text-dim font-mono mb-3">생애주기 분포</div>
          <div className="flex gap-2 items-center">
            {[
              { key: "seed",   label: "태동기", color: "#10b981", count: stats.seed },
              { key: "spread", label: "확산기", color: "#3b82f6", count: stats.spread },
              { key: "peak",   label: "고점",   color: "#f97316", count: stats.peak },
              { key: "fade",   label: "쇠퇴기", color: "#3a3a3a",
                count: stats.total - stats.seed - stats.spread - stats.peak },
            ].map(s => (
              <StatBar key={s.key} {...s} total={stats.total} />
            ))}
          </div>
        </div>

        {/* 플로우 차트 */}
        <div className="bg-surface border border-border rounded-xl p-4 mb-6">
          <div className="text-xs text-dim font-mono mb-3">소스별 수집 현황</div>
          <FlowChart memes={memes} />
        </div>

        {/* 탭 */}
        <div className="flex gap-1 mb-4 bg-surface border border-border rounded-xl p-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 text-xs font-mono rounded-lg transition-all ${
                tab === t.key
                  ? "bg-border text-primary"
                  : "text-dim hover:text-soft"
              }`}
              style={tab === t.key ? { color: t.color } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 검색 */}
        <input
          type="text"
          placeholder="밈 제목 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-mono text-soft placeholder-muted focus:outline-none focus:border-muted mb-4 transition-colors"
        />

        {/* 밈 목록 */}
        {loading ? (
          <div className="text-center text-dim font-mono py-20 text-sm">로딩 중...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-dim font-mono py-20 text-sm">데이터 없음</div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((meme, i) => (
              <MemeCard
                key={meme.id}
                meme={meme}
                index={i}
                stageLabel={STAGE_LABEL[meme.lifecycle_stage || ""] || "—"}
                sourceLabel={SOURCE_LABEL[meme.source] || meme.source}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
