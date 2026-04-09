"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import MemeCard from "./components/MemeCard";
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
  velocity_score: number | null;
  category: string | null;
  collected_at: string;
};

type Tab      = "all" | "domestic" | "inflow";
type Period   = "1d" | "3d" | "7d";
type Category = "all" | "trend" | "general" | "food" | "celeb" | "fashion" | "travel" | "broadcast" | "fb";
type Sort     = "latest" | "views" | "hot";

const TABS: { key: Tab; label: string }[] = [
  { key: "all",      label: "전체" },
  { key: "domestic", label: "국내" },
  { key: "inflow",   label: "🌐 해외 유입" },
];

const PERIODS: { key: Period; label: string }[] = [
  { key: "1d", label: "오늘" },
  { key: "3d", label: "3일" },
  { key: "7d", label: "1주" },
];

const PERIOD_HOURS: Record<Period, number> = {
  "1d": 24,
  "3d": 72,
  "7d": 168,
};

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "all",       label: "전체"     },
  { key: "trend",     label: "트렌드"   },
  { key: "general",   label: "일반"     },
  { key: "food",      label: "푸드"     },
  { key: "celeb",     label: "셀럽"     },
  { key: "fashion",   label: "패션"     },
  { key: "travel",    label: "여행"     },
  { key: "broadcast", label: "방송·연예" },
  { key: "fb",        label: "F&B"      },
];

const SORTS: { key: Sort; label: string }[] = [
  { key: "latest", label: "최신순" },
  { key: "views",  label: "조회순" },
  { key: "hot",    label: "🔥 핫한순" },
];

const SOURCE_LABEL: Record<string, string> = {
  gogumafarm:            "고구마팜",
  google_trends:         "구글트렌드",
  gqkorea:               "GQ Korea",
  hypebeast:             "Hypebeast KR",
  hypebeast_en:          "Hypebeast EN",
  instiz:                "인스티즈",
  kym:                   "KYM",
  pannate:               "네이트판",
  theqoo:                "더쿠",
  youtube_channel_hype:  "YouTube 채널",
  youtube_meme_ch:       "YouTube 밈채널",
  youtube_trending_hype: "YouTube 트렌딩",
};

const SOURCES = Object.values(SOURCE_LABEL);

// 스켈레톤 카드
function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-border flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-border rounded w-3/4" />
          <div className="h-3 bg-border rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [memes, setMemes]             = useState<Meme[]>([]);
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState<Tab>("all");
  const [period, setPeriod]           = useState<Period>("1d");
  const [category, setCategory]       = useState<Category>("all");
  const [sort, setSort]               = useState<Sort>("latest");
  const [search, setSearch]           = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchMemes = useCallback(async () => {
    setLoading(true);

    const since = new Date(
      Date.now() - PERIOD_HOURS[period] * 60 * 60 * 1000
    ).toISOString();

    // 정렬 컬럼 결정 — 핫한순은 클라이언트에서 velocity_score로 처리
    const orderCol  = sort === "views" ? "view_count" : "collected_at";
    const ascending = false;

    let query = supabase
      .from("memes")
      .select("*")
      .gte("collected_at", since)
      .order(orderCol, { ascending })
      .limit(200);

    if (tab === "domestic") {
      query = query.eq("platform", "domestic");
    } else if (tab === "inflow") {
      query = query.eq("flow_type", "inflow");
    }

    if (category !== "all") {
      query = query.eq("category", category);
    }

    const { data } = await query;
    setMemes(data || []);
    setLastUpdated(new Date().toLocaleTimeString("ko-KR"));
    setLoading(false);
  }, [tab, period, category, sort]);

  useEffect(() => { fetchMemes(); }, [fetchMemes]);

  const filtered = memes
    .filter(m => search ? m.title.toLowerCase().includes(search.toLowerCase()) : true)
    .sort((a, b) => {
      if (sort === "hot") return (b.velocity_score || 0) - (a.velocity_score || 0);
      return 0; // latest/views는 Supabase에서 이미 정렬됨
    });

  // velocity_score 최대값 기준 1~5 등급 계산
  const maxVelocity = Math.max(...memes.map(m => m.velocity_score || 0), 1);
  const velocityGrade = (score: number | null): number => {
    if (!score || maxVelocity === 0) return 0;
    return Math.ceil((score / maxVelocity) * 5);
  };

  const stats = {
    total:  memes.length,
    domestic: memes.filter(m => m.platform === "domestic").length,
    inflow: memes.filter(m => m.flow_type === "inflow").length,
  };

  return (
    <div className="min-h-screen bg-bg text-primary">

      {/* 헤더 */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 bg-bg z-10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-lg tracking-tight whitespace-nowrap">밈레이더</span>
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

        {/* ── 서비스 설명 ── */}
        <div className="mb-8">
          <p className="text-sm text-dim font-mono mb-3">
            국내외 커뮤니티·SNS·검색어를 실시간 수집해 밈·트렌드를 한눈에 보여줍니다
          </p>
          <div className="flex flex-wrap gap-2">
            {SOURCES.map(s => (
              <span
                key={s}
                className="text-xs font-mono px-2 py-1 bg-surface border border-border rounded-lg text-dim"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "전체 수집",  value: stats.total,    color: "#e8e8e8" },
            { label: "국내",       value: stats.domestic, color: "#10b981" },
            { label: "해외 유입",  value: stats.inflow,   color: "#3b82f6" },
          ].map(s => (
            <div key={s.label} className="bg-surface border border-border rounded-xl p-4 fade-up">
              <div className="text-xs text-dim font-mono mb-1">{s.label}</div>
              <div className="text-2xl font-mono font-light" style={{ color: s.color }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* 플로우 차트 */}
        <div className="bg-surface border border-border rounded-xl p-4 mb-6">
          <div className="text-xs text-dim font-mono mb-3">소스별 수집 현황</div>
          <FlowChart memes={memes} />
        </div>

        {/* 탭 */}
        <div className="flex gap-1 mb-3 bg-surface border border-border rounded-xl p-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 text-xs font-mono rounded-lg transition-all ${
                tab === t.key
                  ? "bg-border text-primary"
                  : "text-dim hover:text-soft"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 카테고리 + 기간 + 정렬 */}
        <div className="flex flex-col gap-2 mb-4">

          {/* 카테고리 */}
          <div className="flex gap-1 bg-surface border border-border rounded-xl p-1 overflow-x-auto no-scrollbar">
            {CATEGORIES.map(c => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all whitespace-nowrap ${
                  category === c.key
                    ? "bg-border text-primary"
                    : "text-dim hover:text-soft"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

        <div className="flex gap-2 flex-wrap">
            {/* 기간 */}
            <div className="flex gap-1 bg-surface border border-border rounded-xl p-1">
              {PERIODS.map(p => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
                    period === p.key
                      ? "bg-border text-primary"
                      : "text-dim hover:text-soft"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* 정렬 */}
            <div className="flex gap-1 bg-surface border border-border rounded-xl p-1">
              {SORTS.map(s => (
                <button
                  key={s.key}
                  onClick={() => setSort(s.key)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
                    sort === s.key
                      ? "bg-border text-primary"
                      : "text-dim hover:text-soft"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
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
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <span className="text-3xl">📭</span>
            <p className="text-sm text-dim font-mono">
              {search ? `"${search}"에 해당하는 밈이 없습니다` : "아직 수집된 데이터가 없습니다"}
            </p>
            <p className="text-xs text-dim font-mono opacity-60">
              크롤러가 주기적으로 데이터를 수집합니다
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((meme, i) => (
              <MemeCard
                key={meme.id}
                meme={meme}
                index={i}
                sourceLabel={SOURCE_LABEL[meme.source] || meme.source}
                velocityGrade={velocityGrade(meme.velocity_score)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
