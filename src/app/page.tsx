"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const FLOW: Record<string, { label: string; color: string }> = {
  inflow:      { label: "유입",   color: "#3b82f6" },
  independent: { label: "독립",   color: "#10b981" },
  export:      { label: "역수출", color: "#f97316" },
};

const STAGE: Record<string, { label: string; color: string }> = {
  seed:   { label: "태동기", color: "#10b981" },
  spread: { label: "확산기", color: "#3b82f6" },
  peak:   { label: "고점",   color: "#f97316" },
  fade:   { label: "쇠퇴기", color: "#6b6b6b" },
};

const SOURCE: Record<string, string> = {
  reddit:   "Reddit",
  youtube:  "YouTube",
  ruliweb:  "루리웹",
  ucduk:    "웃긴대학",
  naver:    "네이버",
  dcinside: "디시인사이드",
  fmkorea:  "에펨코리아",
};

type Meme = {
  id: number;
  title: string;
  url: string;
  source: string;
  view_count: number;
  like_count: number;
  flow_type: string | null;
  lifecycle_stage: string | null;
  collected_at: string;
};

type Tab = "all" | "inflow" | "independent" | "export";

const TABS: { key: Tab; label: string }[] = [
  { key: "all",         label: "전체" },
  { key: "inflow",      label: "해외→국내" },
  { key: "independent", label: "국내 독립" },
  { key: "export",      label: "역수출" },
];

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h / 24)}일 전`;
  if (h > 0)  return `${h}시간 전`;
  return `${m}분 전`;
}

export default function Dashboard() {
  const [memes, setMemes]     = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<Tab>("all");
  const [search, setSearch]   = useState("");
  const [updated, setUpdated] = useState("");

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      let q = supabase
        .from("memes")
        .select("*")
        .order("collected_at", { ascending: false })
        .limit(200);
      if (tab !== "all") q = q.eq("flow_type", tab);
      const { data } = await q;
      setMemes(data || []);
      setUpdated(new Date().toLocaleTimeString("ko-KR"));
      setLoading(false);
    }
    fetch();
  }, [tab]);

  const filtered = memes.filter(m =>
    search ? m.title.toLowerCase().includes(search.toLowerCase()) : true
  );

  const stats = {
    total:       memes.length,
    inflow:      memes.filter(m => m.flow_type === "inflow").length,
    independent: memes.filter(m => m.flow_type === "independent").length,
    export:      memes.filter(m => m.flow_type === "export").length,
  };

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#e8e8e8", fontFamily: "monospace" }}>

      {/* 헤더 */}
      <div style={{ borderBottom: "1px solid #1e1e1e", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#0a0a0a", zIndex: 10 }}>
        <span style={{ fontSize: "1.1rem", letterSpacing: "-0.02em" }}>밈레이더</span>
        <span style={{ fontSize: "0.75rem", color: "#6b6b6b" }}>업데이트 {updated}</span>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* 통계 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {[
            { label: "전체",    value: stats.total,       color: "#e8e8e8" },
            { label: "유입",    value: stats.inflow,      color: "#3b82f6" },
            { label: "독립",    value: stats.independent, color: "#10b981" },
            { label: "역수출",  value: stats.export,      color: "#f97316" },
          ].map(s => (
            <div key={s.label} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "1rem" }}>
              <div style={{ fontSize: "0.7rem", color: "#6b6b6b", marginBottom: "0.25rem" }}>{s.label}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 300, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* 탭 */}
        <div style={{ display: "flex", gap: "0.25rem", background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "0.25rem", marginBottom: "1rem" }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: "0.5rem", fontSize: "0.75rem", border: "none", borderRadius: "8px", cursor: "pointer",
                background: tab === t.key ? "#1e1e1e" : "transparent",
                color: tab === t.key ? "#e8e8e8" : "#6b6b6b",
                transition: "all 0.15s",
              }}
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
          style={{
            width: "100%", background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px",
            padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#a0a0a0",
            outline: "none", marginBottom: "1rem", fontFamily: "monospace",
          }}
        />

        {/* 목록 */}
        {loading ? (
          <div style={{ textAlign: "center", color: "#6b6b6b", padding: "4rem", fontSize: "0.875rem" }}>로딩 중...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", color: "#6b6b6b", padding: "4rem", fontSize: "0.875rem" }}>데이터 없음</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {filtered.map((meme, i) => {
              const flow  = FLOW[meme.flow_type || ""];
              const stage = STAGE[meme.lifecycle_stage || ""];
              return (
                
                  key={meme.id}
                  href={meme.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px",
                    padding: "0.75rem 1rem", textDecoration: "none", transition: "border-color 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "#3a3a3a")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "#1e1e1e")}
                >
                  <span style={{ fontSize: "0.7rem", color: "#3a3a3a", width: "1.5rem", textAlign: "right", flexShrink: 0 }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.875rem", color: "#e8e8e8", marginBottom: "0.2rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {meme.title}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#6b6b6b" }}>
                      {SOURCE[meme.source] || meme.source} · {timeAgo(meme.collected_at)}
                      {meme.view_count > 0 && ` · 조회 ${meme.view_count.toLocaleString()}`}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                    {stage && (
                      <span style={{ fontSize: "0.65rem", padding: "0.15rem 0.5rem", borderRadius: "4px", border: `1px solid ${stage.color}40`, color: stage.color, background: `${stage.color}10` }}>
                        {stage.label}
                      </span>
                    )}
                    {flow && (
                      <span style={{ fontSize: "0.65rem", padding: "0.15rem 0.5rem", borderRadius: "4px", border: `1px solid ${flow.color}40`, color: flow.color, background: `${flow.color}10` }}>
                        {flow.label}
                      </span>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
