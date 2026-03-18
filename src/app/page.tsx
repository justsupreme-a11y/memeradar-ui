
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

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

// 밈 소스 vs 트렌드 소스 구분
const MEME_SOURCES    = new Set(["reddit", "knowyourmeme", "youtube", "youtube_meme_ch", "x_trends"]);
const TREND_SOURCES   = new Set(["google_trends", "naver_datalab", "naver_realtime", "naver"]);

const FLOW: Record<string, {label: string; color: string}> = {
  inflow:      {label: "유입",   color: "#3b82f6"},
  independent: {label: "독립",   color: "#10b981"},
  export:      {label: "역수출", color: "#f97316"},
};

const STAGE: Record<string, {label: string; color: string}> = {
  seed:   {label: "태동기", color: "#10b981"},
  spread: {label: "확산기", color: "#3b82f6"},
  peak:   {label: "고점",   color: "#f97316"},
  fade:   {label: "쇠퇴기", color: "#6b6b6b"},
};

const SOURCE: Record<string, string> = {
  reddit:         "Reddit",
  youtube:        "YouTube",
  youtube_meme_ch:"YT 밈채널",
  knowyourmeme:   "KnowYourMeme",
  x_trends:       "X 트렌딩",
  google_trends:  "구글 트렌드",
  naver_datalab:  "네이버 DataLab",
  naver_realtime: "네이버 실시간",
  naver:          "네이버",
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return Math.floor(h/24) + "일 전";
  if (h > 0)  return h + "시간 전";
  return m + "분 전";
}

const calcVelocity = (m: Meme) => {
  const hours = Math.max((Date.now() - new Date(m.collected_at).getTime()) / 3600000, 1);
  return Math.round(m.view_count / hours);
};

type MainTab = "meme" | "trend";
type FlowTab = "all" | "inflow" | "independent" | "export";

export default function Page() {
  const [mainTab, setMainTab] = useState<MainTab>("meme");
  const [flowTab, setFlowTab] = useState<FlowTab>("all");
  const [memes, setMemes]     = useState<Meme[]>([]);
  const [stats, setStats]     = useState({total:0, inflow:0, independent:0, export:0});
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    async function loadStats() {
      const { count: total }       = await supabase.from("memes").select("*", {count:"exact", head:true});
      const { count: inflow }      = await supabase.from("memes").select("*", {count:"exact", head:true}).eq("flow_type","inflow");
      const { count: independent } = await supabase.from("memes").select("*", {count:"exact", head:true}).eq("flow_type","independent");
      const { count: exp }         = await supabase.from("memes").select("*", {count:"exact", head:true}).eq("flow_type","export");
      setStats({ total: total||0, inflow: inflow||0, independent: independent||0, export: exp||0 });
    }
    loadStats();
  }, []);

  useEffect(() => {
    async function loadMemes() {
      setLoading(true);

      let q = supabase.from("memes").select("*").limit(500);

      if (mainTab === "meme") {
        // 밈 탭: 밈 소스만 + 확산속도 정렬
        q = q.in("source", Array.from(MEME_SOURCES))
             .order("view_count", {ascending: false});
        if (flowTab !== "all") q = q.eq("flow_type", flowTab);
      } else {
        // 트렌드 탭: 트렌드 소스만 + 최신순
        q = q.in("source", Array.from(TREND_SOURCES))
             .order("collected_at", {ascending: false});
      }

      const {data} = await q;
      let sorted = data || [];

      if (mainTab === "meme") {
        sorted = sorted.sort((a, b) => calcVelocity(b) - calcVelocity(a)).slice(0, 200);
      }

      setMemes(sorted);
      setLoading(false);
    }
    loadMemes();
  }, [mainTab, flowTab]);

  const list = memes.filter(m => search ? m.title.includes(search) : true);

  const C = {
    bg: "#0a0a0a", surface: "#111111", border: "#1e1e1e",
    dim: "#6b6b6b", soft: "#a0a0a0", primary: "#e8e8e8",
  };

  return (
    <div style={{background:C.bg, minHeight:"100vh", color:C.primary, fontFamily:"monospace"}}>

      {/* 헤더 */}
      <div style={{borderBottom:`1px solid ${C.border}`, padding:"1rem 1.5rem", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:C.bg, zIndex:10}}>
        <span style={{fontSize:"1.1rem"}}>밈레이더</span>
        <span style={{fontSize:"0.75rem", color:C.dim}}>{new Date().toLocaleTimeString("ko-KR")}</span>
      </div>

      <div style={{maxWidth:"900px", margin:"0 auto", padding:"2rem 1.5rem"}}>

        {/* 통계 */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"0.75rem", marginBottom:"1.5rem"}}>
          {[
            {label:"전체 수집",  value:stats.total,       color:C.primary},
            {label:"해외 유입",  value:stats.inflow,      color:"#3b82f6"},
            {label:"국내 독립",  value:stats.independent, color:"#10b981"},
            {label:"역수출",    value:stats.export,      color:"#f97316"},
          ].map(x => (
            <div key={x.label} style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:"12px", padding:"1rem"}}>
              <div style={{fontSize:"0.7rem", color:C.dim, marginBottom:"0.25rem"}}>{x.label}</div>
              <div style={{fontSize:"1.5rem", fontWeight:300, color:x.color}}>{x.value.toLocaleString()}</div>
            </div>
          ))}
        </div>

        {/* 메인 탭: 밈 vs 트렌드 */}
        <div style={{display:"flex", gap:"0.5rem", marginBottom:"1rem"}}>
          {[
            {key:"meme",  label:"밈",    desc:"KYM · Reddit · YouTube"},
            {key:"trend", label:"트렌드", desc:"구글 · 네이버 · X"},
          ].map(t => (
            <button key={t.key} onClick={() => { setMainTab(t.key as MainTab); setFlowTab("all"); }}
              style={{flex:1, padding:"0.75rem 1rem", border:`1px solid ${mainTab===t.key ? "#e8e8e8" : C.border}`,
                borderRadius:"12px", cursor:"pointer", background: mainTab===t.key ? C.surface : "transparent",
                color: mainTab===t.key ? C.primary : C.dim, textAlign:"left" as const}}>
              <div style={{fontSize:"0.875rem", fontWeight:500, marginBottom:"0.15rem"}}>{t.label}</div>
              <div style={{fontSize:"0.65rem", color:C.dim}}>{t.desc}</div>
            </button>
          ))}
        </div>

        {/* 플로우 탭 (밈 탭일 때만) */}
        {mainTab === "meme" && (
          <div style={{display:"flex", gap:"0.25rem", background:C.surface, border:`1px solid ${C.border}`, borderRadius:"12px", padding:"0.25rem", marginBottom:"1rem"}}>
            {[
              {key:"all",         label:"전체"},
              {key:"inflow",      label:"해외→국내"},
              {key:"independent", label:"국내 독립"},
              {key:"export",      label:"역수출"},
            ].map(t => (
              <button key={t.key} onClick={() => setFlowTab(t.key as FlowTab)}
                style={{flex:1, padding:"0.5rem", fontSize:"0.75rem", border:"none", borderRadius:"8px", cursor:"pointer",
                  background: flowTab===t.key ? C.border : "transparent",
                  color: flowTab===t.key ? C.primary : C.dim}}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* 검색 */}
        <input type="text" placeholder="검색..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:"12px",
            padding:"0.75rem 1rem", fontSize:"0.875rem", color:C.soft, outline:"none",
            marginBottom:"0.5rem", fontFamily:"monospace"}} />

        <div style={{fontSize:"0.7rem", color:C.dim, marginBottom:"1rem", textAlign:"right" as const}}>
          {mainTab === "meme" ? `확산속도 상위 ${list.length}개` : `최신 ${list.length}개`}
        </div>

        {/* 목록 */}
        {loading ? (
          <div style={{textAlign:"center" as const, color:C.dim, padding:"4rem", fontSize:"0.875rem"}}>로딩 중...</div>
        ) : list.length === 0 ? (
          <div styl
