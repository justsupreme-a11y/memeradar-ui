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
  flow_type: string | null;
  lifecycle_stage: string | null;
  collected_at: string;
};

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
  reddit:  "Reddit", youtube: "YouTube",
  ruliweb: "루리웹",  ucduk:   "웃긴대학",
  naver:   "네이버",  dcinside:"디시", fmkorea:"에펨",
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return Math.floor(h/24) + "일 전";
  if (h > 0)  return h + "시간 전";
  return m + "분 전";
}

export default function Page() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      let q = supabase.from("memes").select("*").order("collected_at", {ascending: false}).limit(200);
      if (tab !== "all") q = q.eq("flow_type", tab);
      const {data} = await q;
      setMemes(data || []);
      setLoading(false);
    }
    load();
  }, [tab]);

// 확산 속도 계산 (조회수 ÷ 경과시간(시간))
const calcVelocity = (meme: Meme) => {
  const hours = Math.max(
    (Date.now() - new Date(meme.collected_at).getTime()) / 3600000,
    1
  );
  return meme.view_count / hours;
};

const list = memes
  .filter(m => search ? m.title.includes(search) : true)
  .sort((a, b) => calcVelocity(b) - calcVelocity(a));
  
  const s = {
    total: memes.length,
    inflow: memes.filter(m => m.flow_type === "inflow").length,
    independent: memes.filter(m => m.flow_type === "independent").length,
    export: memes.filter(m => m.flow_type === "export").length,
  };

  const C = {
    bg: "#0a0a0a", surface: "#111111", border: "#1e1e1e",
    dim: "#6b6b6b", soft: "#a0a0a0", primary: "#e8e8e8",
  };

  return (
    <div style={{background:C.bg, minHeight:"100vh", color:C.primary, fontFamily:"monospace"}}>
      <div style={{borderBottom:`1px solid ${C.border}`, padding:"1rem 1.5rem", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:C.bg, zIndex:10}}>
        <span style={{fontSize:"1.1rem"}}>밈레이더</span>
        <span style={{fontSize:"0.75rem", color:C.dim}}>{new Date().toLocaleTimeString("ko-KR")}</span>
      </div>

      <div style={{maxWidth:"900px", margin:"0 auto", padding:"2rem 1.5rem"}}>
        <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"0.75rem", marginBottom:"1.5rem"}}>
          {[
            {label:"전체",   value:s.total,       color:C.primary},
            {label:"유입",   value:s.inflow,      color:"#3b82f6"},
            {label:"독립",   value:s.independent, color:"#10b981"},
            {label:"역수출", value:s.export,      color:"#f97316"},
          ].map(x => (
            <div key={x.label} style={{background:C.surface, border:`1px solid ${C.border}`, borderRadius:"12px", padding:"1rem"}}>
              <div style={{fontSize:"0.7rem", color:C.dim, marginBottom:"0.25rem"}}>{x.label}</div>
              <div style={{fontSize:"1.5rem", fontWeight:300, color:x.color}}>{x.value}</div>
            </div>
          ))}
        </div>

        <div style={{display:"flex", gap:"0.25rem", background:C.surface, border:`1px solid ${C.border}`, borderRadius:"12px", padding:"0.25rem", marginBottom:"1rem"}}>
          {[
            {key:"all", label:"전체"},
            {key:"inflow", label:"해외→국내"},
            {key:"independent", label:"국내 독립"},
            {key:"export", label:"역수출"},
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{flex:1, padding:"0.5rem", fontSize:"0.75rem", border:"none", borderRadius:"8px", cursor:"pointer",
                background: tab===t.key ? C.border : "transparent",
                color: tab===t.key ? C.primary : C.dim}}>
              {t.label}
            </button>
          ))}
        </div>

        <input type="text" placeholder="밈 제목 검색..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:"12px",
            padding:"0.75rem 1rem", fontSize:"0.875rem", color:C.soft, outline:"none",
            marginBottom:"1rem", fontFamily:"monospace"}} />

        {loading ? (
          <div style={{textAlign:"center", color:C.dim, padding:"4rem", fontSize:"0.875rem"}}>로딩 중...</div>
        ) : list.length === 0 ? (
          <div style={{textAlign:"center", color:C.dim, padding:"4rem", fontSize:"0.875rem"}}>데이터 없음</div>
        ) : (
          <div style={{display:"flex", flexDirection:"column", gap:"0.5rem"}}>
            {list.map((m, i) => {
              const flow = FLOW[m.flow_type || ""];
              const stage = STAGE[m.lifecycle_stage || ""];
              return (
                <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer"
                  style={{display:"flex", alignItems:"center", gap:"0.75rem",
                    background:C.surface, border:`1px solid ${C.border}`, borderRadius:"12px",
                    padding:"0.75rem 1rem", textDecoration:"none"}}>
                  <span style={{fontSize:"0.7rem", color:"#3a3a3a", width:"1.5rem", textAlign:"right", flexShrink:0}}>{i+1}</span>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:"0.875rem", color:C.primary, marginBottom:"0.2rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{m.title}</div>
                    <div style={{fontSize:"0.7rem", color:C.dim}}>
                      {SOURCE[m.source]||m.source} · {timeAgo(m.collected_at)}
                      {m.view_count > 0 && " · 조회 " + m.view_count.toLocaleString()}
                    </div>
                  </div>
                  <div style={{display:"flex", gap:"0.4rem", flexShrink:0}}>
                    {stage && <span style={{fontSize:"0.65rem", padding:"0.15rem 0.5rem", borderRadius:"4px", border:`1px solid ${stage.color}40`, color:stage.color, background:`${stage.color}10`}}>{stage.label}</span>}
                    {flow  && <span style={{fontSize:"0.65rem", padding:"0.15rem 0.5rem", borderRadius:"4px", border:`1px solid ${flow.color}40`,  color:flow.color,  background:`${flow.color}10`}}>{flow.label}</span>}
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
