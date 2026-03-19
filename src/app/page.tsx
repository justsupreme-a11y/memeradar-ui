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
  platform: string;
  view_count: number;
  flow_type: string | null;
  lifecycle_stage: string | null;
  category: string | null;
  velocity_score: number | null;
  related_links: {title: string; url: string; source: string}[] | null;
  collected_at: string;
};

const FLOW: Record<string,{label:string;color:string}> = {
  inflow:      {label:"유입",   color:"#3b82f6"},
  independent: {label:"독립",   color:"#10b981"},
  export:      {label:"역수출", color:"#f97316"},
};

const STAGE: Record<string,{label:string;color:string}> = {
  seed:   {label:"태동기", color:"#10b981"},
  spread: {label:"확산기", color:"#3b82f6"},
  peak:   {label:"고점",   color:"#f97316"},
  fade:   {label:"쇠퇴기", color:"#6b6b6b"},
};

const SOURCE: Record<string,string> = {
  namuwiki:       "나무위키",
  instiz:         "인스티즈",
  univ_tomorrow:  "대학내일",
  gogumafarm:     "고구마팜",
  kym:            "KYM",
  memedroid:      "Memedroid",
  wikipedia:      "Wikipedia",
  youtube_meme_ch:"YT 밈채널",
  google_trends:  "구글 트렌드",
};

const DOMESTIC_SOURCES = ["namuwiki","instiz","univ_tomorrow","gogumafarm","google_trends"];
const GLOBAL_SOURCES   = ["kym","memedroid","wikipedia","youtube_meme_ch"];

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return Math.floor(h/24) + "일 전";
  if (h > 0) return h + "시간 전";
  return m + "분 전";
}

type MainTab = "domestic" | "global";
type CategoryTab = "all" | "fb" | "fashion" | "celeb" | "general";
type FlowTab = "all" | "inflow" | "independent" | "export";

export default function Page() {
  const [mainTab, setMainTab]         = useState<MainTab>("domestic");
  const [categoryTab, setCategoryTab] = useState<CategoryTab>("all");
  const [flowTab, setFlowTab]         = useState<FlowTab>("all");
  const [memes, setMemes]             = useState<Meme[]>([]);
  const [stats, setStats]             = useState({total:0,inflow:0,independent:0,export:0});
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");

  useEffect(() => {
    async function loadStats() {
      const {count:total}       = await supabase.from("memes").select("*",{count:"exact",head:true});
      const {count:inflow}      = await supabase.from("memes").select("*",{count:"exact",head:true}).eq("flow_type","inflow");
      const {count:independent} = await supabase.from("memes").select("*",{count:"exact",head:true}).eq("flow_type","independent");
      const {count:exp}         = await supabase.from("memes").select("*",{count:"exact",head:true}).eq("flow_type","export");
      setStats({total:total||0,inflow:inflow||0,independent:independent||0,export:exp||0});
    }
    loadStats();
  }, []);

  useEffect(() => {
    async function loadMemes() {
      setLoading(true);

      // 48시간 필터
      const cutoff = new Date(Date.now() - 48 * 3600000).toISOString();

      const sources = mainTab === "domestic" ? DOMESTIC_SOURCES : GLOBAL_SOURCES;

      let q = supabase.from("memes").select("*")
        .in("source", sources)
        .gte("collected_at", cutoff)
        .order("velocity_score", {ascending: false})
        .limit(300);

      if (categoryTab !== "all") q = q.eq("category", categoryTab);
      if (flowTab !== "all")     q = q.eq("flow_type", flowTab);

      const {data} = await q;
      setMemes(data || []);
      setLoading(false);
    }
    loadMemes();
  }, [mainTab, categoryTab, flowTab]);

  const list = memes.filter(m => search ? m.title.includes(search) : true);

  const bg      = "#0a0a0a";
  const surface = "#111111";
  const border  = "#1e1e1e";
  const dim     = "#6b6b6b";
  const soft    = "#a0a0a0";
  const primary = "#e8e8e8";

  return (
    <div style={{background:bg,minHeight:"100vh",color:primary,fontFamily:"monospace"}}>
      <div style={{borderBottom:`1px solid ${border}`,padding:"1rem 1.5rem",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:bg,zIndex:10}}>
        <span style={{fontSize:"1.1rem"}}>밈레이더</span>
        <span style={{fontSize:"0.75rem",color:dim}}>최근 48시간 · {new Date().toLocaleTimeString("ko-KR")}</span>
      </div>

      <div style={{maxWidth:"900px",margin:"0 auto",padding:"2rem 1.5rem"}}>

        {/* 통계 */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"0.75rem",marginBottom:"1.5rem"}}>
          {[
            {label:"전체 수집", value:stats.total,       color:primary},
            {label:"해외 유입", value:stats.inflow,      color:"#3b82f6"},
            {label:"국내 독립", value:stats.independent, color:"#10b981"},
            {label:"역수출",   value:stats.export,      color:"#f97316"},
          ].map(x => (
            <div key={x.label} style={{background:surface,border:`1px solid ${border}`,borderRadius:"12px",padding:"1rem"}}>
              <div style={{fontSize:"0.7rem",color:dim,marginBottom:"0.25rem"}}>{x.label}</div>
              <div style={{fontSize:"1.5rem",fontWeight:300,color:x.color}}>{x.value.toLocaleString()}</div>
            </div>
          ))}
        </div>

        {/* 국내 vs 해외 탭 */}
        <div style={{display:"flex",gap:"0.5rem",marginBottom:"1rem"}}>
          {[
            {key:"domestic", label:"국내 밈",  desc:"나무위키 · 인스티즈 · 대학내일 · 고구마팜"},
            {key:"global",   label:"해외 밈",  desc:"KYM · Memedroid · Wikipedia · YouTube"},
          ].map(t => (
            <button key={t.key}
              onClick={() => { setMainTab(t.key as MainTab); setFlowTab("all"); setCategoryTab("all"); }}
              style={{flex:1,padding:"0.75rem 1rem",border:`1px solid ${mainTab===t.key?"#e8e8e8":border}`,borderRadius:"12px",cursor:"pointer",background:mainTab===t.key?surface:"transparent",color:mainTab===t.key?primary:dim,textAlign:"left"}}>
              <div style={{fontSize:"0.875rem",fontWeight:500,marginBottom:"0.15rem"}}>{t.label}</div>
              <div style={{fontSize:"0.65rem",color:dim}}>{t.desc}</div>
            </button>
          ))}
        </div>

        {/* 카테고리 탭 */}
        <div style={{display:"flex",gap:"0.25rem",background:surface,border:`1px solid ${border}`,borderRadius:"12px",padding:"0.25rem",marginBottom:"0.75rem"}}>
          {[
            {key:"all",     label:"전체"},
            {key:"fb",      label:"F&B"},
            {key:"fashion", label:"패션"},
            {key:"celeb",   label:"셀럽"},
            {key:"general", label:"일반"},
          ].map(t => (
            <button key={t.key} onClick={() => setCategoryTab(t.key as CategoryTab)}
              style={{flex:1,padding:"0.4rem",fontSize:"0.72rem",border:"none",borderRadius:"8px",cursor:"pointer",background:categoryTab===t.key?border:"transparent",color:categoryTab===t.key?primary:dim}}>
              {t.label}
            </button>
          ))}
        </div>

        {/* 플로우 탭 */}
        <div style={{display:"flex",gap:"0.25rem",background:surface,border:`1px solid ${border}`,borderRadius:"12px",padding:"0.25rem",marginBottom:"1rem"}}>
          {[
            {key:"all",         label:"전체 흐름"},
            {key:"inflow",      label:"해외→국내"},
            {key:"independent", label:"국내 독립"},
            {key:"export",      label:"역수출"},
          ].map(t => (
            <button key={t.key} onClick={() => setFlowTab(t.key as FlowTab)}
              style={{flex:1,padding:"0.4rem",fontSize:"0.72rem",border:"none",borderRadius:"8px",cursor:"pointer",background:flowTab===t.key?border:"transparent",color:flowTab===t.key?primary:dim}}>
              {t.label}
            </button>
          ))}
        </div>

        {/* 검색 */}
        <input type="text" placeholder="검색..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{width:"100%",background:surface,border:`1px solid ${border}`,borderRadius:"12px",padding:"0.75rem 1rem",fontSize:"0.875rem",color:soft,outline:"none",marginBottom:"0.5rem",fontFamily:"monospace"}} />

        <div style={{fontSize:"0.7rem",color:dim,marginBottom:"1rem",textAlign:"right"}}>
          확산속도 상위 {list.length}개 · 최근 48시간
        </div>

        {/* 목록 */}
        {loading ? (
          <div style={{textAlign:"center",color:dim,padding:"4rem",fontSize:"0.875rem"}}>로딩 중...</div>
        ) : list.length === 0 ? (
          <div style={{textAlign:"center",color:dim,padding:"4rem",fontSize:"0.875rem"}}>
            데이터 없음 — Actions 돌리면 채워져요
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
            {list.map((m,i) => {
              const flow  = FLOW[m.flow_type||""];
              const stage = STAGE[m.lifecycle_stage||""];
              const vel   = m.velocity_score ? Math.round(m.velocity_score) : 0;
              const hasLinks = m.related_links && m.related_links.length > 0;
              return (
                <div key={m.id}>
                  <a href={m.url} target="_blank" rel="noopener noreferrer"
                    style={{display:"flex",alignItems:"center",gap:"0.75rem",background:surface,border:`1px solid ${border}`,borderRadius:hasLinks?"12px 12px 0 0":"12px",padding:"0.75rem 1rem",textDecoration:"none"}}
                    onMouseEnter={e => (e.currentTarget.style.borderColor="#3a3a3a")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor=border)}>
                    <span style={{fontSize:"0.7rem",color:"#3a3a3a",width:"1.5rem",textAlign:"right",flexShrink:0}}>{i+1}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:"0.875rem",color:primary,marginBottom:"0.2rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.title}</div>
                      <div style={{fontSize:"0.7rem",color:dim}}>
                        {SOURCE[m.source]||m.source} · {timeAgo(m.collected_at)}
                        {m.view_count > 0 && " · " + m.view_count.toLocaleString()}
                        {vel > 0 && <span style={{color:"#f97316"}}> · ⚡{vel.toLocaleString()}/h</span>}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:"0.4rem",flexShrink:0}}>
                      {m.category && m.category !== "general" && (
                        <span style={{fontSize:"0.6rem",padding:"0.1rem 0.5rem",borderRadius:"4px",border:"1px solid #3a3a3a",color:soft}}>
                          {m.category === "fb" ? "F&B" : m.category === "fashion" ? "패션" : "셀럽"}
                        </span>
                      )}
                      {stage && <span style={{fontSize:"0.65rem",padding:"0.15rem 0.5rem",borderRadius:"4px",border:`1px solid ${stage.color}40`,color:stage.color,background:`${stage.color}10`}}>{stage.label}</span>}
                      {flow  && <span style={{fontSize:"0.65rem",padding:"0.15rem 0.5rem",borderRadius:"4px",border:`1px solid ${flow.color}40`, color:flow.color, background:`${flow.color}10`}}>{flow.label}</span>}
                    </div>
                  </a>

                  {/* 관련 기사 링크 */}
                  {hasLinks && (
                    <div style={{background:"#0d0d0d",border:`1px solid ${border}`,borderTop:"none",borderRadius:"0 0 12px 12px",padding:"0.5rem 1rem"}}>
                      <div style={{fontSize:"0.65rem",color:dim,marginBottom:"0.3rem"}}>관련 기사</div>
                      <div style={{display:"flex",flexDirection:"column",gap:"0.2rem"}}>
                        {m.related_links!.slice(0,3).map((link, li) => (
                          <a key={li} href={link.url} target="_blank" rel="noopener noreferrer"
                            style={{fontSize:"0.7rem",color:"#3b82f6",textDecoration:"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                            → {link.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
