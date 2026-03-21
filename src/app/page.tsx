"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

type Meme = {
  id: number; title: string; url: string;
  source: string; platform: string; category: string;
  view_count: number; like_count: number; collected_at: string;
};

type SortKey = "view_count" | "collected_at";

const VIDEO_SOURCES   = new Set(["youtube_trending","youtube_shorts","youtube_meme_ch"]);
const ARTICLE_SOURCES = new Set(["instiz","theqoo","pannate","gogumafarm","univ_tomorrow",
  "kym","wikipedia","google_trends","reddit","hypebeast","hypebeast_en",
  "gqkorea","cosmopolitan","vogue","elle","hsad","daehong","opensurvey"]);

const SOURCE_LABEL: Record<string,string> = {
  youtube_trending:"YT 급상승", youtube_shorts:"YT Shorts", youtube_meme_ch:"YT 밈채널",
  instiz:"인스티즈", theqoo:"더쿠", pannate:"네이트판",
  gogumafarm:"고구마팜", univ_tomorrow:"대학내일",
  reddit:"Reddit", kym:"KYM", wikipedia:"Wikipedia", google_trends:"구글 트렌드",
  hypebeast:"하입비스트KR", hypebeast_en:"하입비스트EN",
  gqkorea:"GQ코리아", cosmopolitan:"코스모폴리탄", vogue:"보그코리아", elle:"엘르코리아",
  hsad:"HS애드", daehong:"대홍기획", opensurvey:"오픈서베이",dispatch: "디스패치",
  dailyfashion: "데일리패션", mlbpark: "MLB파크", imgur: "Imgur",
};

const CAT_LABEL: Record<string,string> = {
  trend:"트렌드검색어", food:"푸드", celeb:"셀럽",
  fashion:"패션", travel:"여행", broadcast:"방송및연예", general:"일반",
};

const CAT_COLOR: Record<string,string> = {
  trend:"#f97316", food:"#10b981", celeb:"#a78bfa",
  fashion:"#f43f5e", travel:"#06b6d4", broadcast:"#3b82f6", general:"#6b7280",
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return Math.floor(h/24)+"일 전";
  if (h > 0)  return h+"시간 전";
  return m+"분 전";
}

const PAGE_SIZE = 50;

export default function Page() {
  const [platform,  setPlatform]  = useState<"all"|"domestic"|"global">("all");
  const [content,   setContent]   = useState<"all"|"video"|"article">("all");
  const [category,  setCategory]  = useState("all");
  const [sort,      setSort]      = useState<SortKey>("view_count");
  const [memes,     setMemes]     = useState<Meme[]>([]);
  const [stats,     setStats]     = useState({total:0, domestic:0, global:0});
  const [loading,   setLoading]   = useState(true);
  const [page,      setPage]      = useState(0);
  const [totalCount,setTotal]     = useState(0);
  const [search,    setSearch]    = useState("");

  useEffect(() => {
    async function s() {
      const [t,d,g] = await Promise.all([
        supabase.from("memes").select("*",{count:"exact",head:true}),
        supabase.from("memes").select("*",{count:"exact",head:true}).eq("platform","domestic"),
        supabase.from("memes").select("*",{count:"exact",head:true}).eq("platform","global"),
      ]);
      setStats({total:t.count||0, domestic:d.count||0, global:g.count||0});
    }
    s();
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const cutoff = new Date(Date.now() - 48*3600000).toISOString();
      let q = supabase.from("memes")
        .select("*",{count:"exact"})
        .gte("collected_at", cutoff)
        .order(sort, {ascending: false});

      if (platform !== "all") q = q.eq("platform", platform);
      if (content === "video")   q = q.in("source", Array.from(VIDEO_SOURCES));
      if (content === "article") q = q.in("source", Array.from(ARTICLE_SOURCES));
      if (category !== "all")    q = q.eq("category", category);
      if (search)                q = q.ilike("title", `%${search}%`);

      q = q.range(page*PAGE_SIZE, (page+1)*PAGE_SIZE-1);
      const {data, count} = await q;
      setMemes(data||[]);
      setTotal(count||0);
      setLoading(false);
    }
    load();
  }, [platform, content, category, sort, page, search]);

  function change<T>(setter: (v:T)=>void, val:T) {
    setter(val); setPage(0);
  }

  const totalPages = Math.ceil(totalCount/PAGE_SIZE);
  const bg="#0a0a0a", surface="#111111", border="#1e1e1e", dim="#6b6b6b", soft="#a0a0a0", primary="#e8e8e8";

  return (
    <div style={{background:bg,minHeight:"100vh",color:primary,fontFamily:"monospace"}}>
      <div style={{borderBottom:`1px solid ${border}`,padding:"1rem 1.5rem",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:bg,zIndex:10}}>
        <span style={{fontSize:"1.1rem"}}>밈레이더</span>
        <span style={{fontSize:"0.75rem",color:dim}}>{new Date().toLocaleTimeString("ko-KR")}</span>
      </div>

      <div style={{maxWidth:"900px",margin:"0 auto",padding:"2rem 1.5rem"}}>

        {/* 통계 */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"0.75rem",marginBottom:"1.5rem"}}>
          {[
            {label:"전체 수집",value:stats.total,   color:primary},
            {label:"국내",     value:stats.domestic,color:"#10b981"},
            {label:"해외",     value:stats.global,  color:"#3b82f6"},
          ].map(x=>(
            <div key={x.label} style={{background:surface,border:`1px solid ${border}`,borderRadius:"12px",padding:"1rem"}}>
              <div style={{fontSize:"0.7rem",color:dim,marginBottom:"0.25rem"}}>{x.label}</div>
              <div style={{fontSize:"1.5rem",fontWeight:300,color:x.color}}>{x.value.toLocaleString()}</div>
            </div>
          ))}
        </div>

        {/* 국내/해외 */}
        <div style={{display:"flex",gap:"0.25rem",background:surface,border:`1px solid ${border}`,borderRadius:"12px",padding:"0.25rem",marginBottom:"0.75rem"}}>
          {[{key:"all",label:"전체"},{key:"domestic",label:"국내"},{key:"global",label:"해외"}].map(t=>(
            <button key={t.key} onClick={()=>change(setPlatform,t.key as any)}
              style={{flex:1,padding:"0.5rem",fontSize:"0.75rem",border:"none",borderRadius:"8px",cursor:"pointer",
                background:platform===t.key?border:"transparent",color:platform===t.key?primary:dim}}>
              {t.label}
            </button>
          ))}
        </div>

        {/* 전체/영상/기사및정보 */}
        <div style={{display:"flex",gap:"0.25rem",background:surface,border:`1px solid ${border}`,borderRadius:"12px",padding:"0.25rem",marginBottom:"0.75rem"}}>
          {[{key:"all",label:"전체"},{key:"video",label:"영상"},{key:"article",label:"기사 및 정보"}].map(t=>(
            <button key={t.key} onClick={()=>change(setContent,t.key as any)}
              style={{flex:1,padding:"0.5rem",fontSize:"0.75rem",border:"none",borderRadius:"8px",cursor:"pointer",
                background:content===t.key?border:"transparent",color:content===t.key?primary:dim}}>
              {t.label}
            </button>
          ))}
        </div>

        {/* 카테고리 */}
        <div style={{display:"flex",gap:"0.25rem",flexWrap:"wrap",marginBottom:"0.75rem"}}>
          {[
            {key:"all",label:"전체"},
            {key:"trend",label:"트렌드검색어"},
            {key:"food",label:"푸드"},
            {key:"celeb",label:"셀럽"},
            {key:"fashion",label:"패션"},
            {key:"travel",label:"여행"},
            {key:"broadcast",label:"방송및연예"},
          ].map(t=>{
            const active = category===t.key;
            const color  = t.key==="all" ? primary : CAT_COLOR[t.key]||primary;
            return (
              <button key={t.key} onClick={()=>change(setCategory,t.key)}
                style={{padding:"0.35rem 0.75rem",fontSize:"0.7rem",
                  border:`1px solid ${active?color:border}`,borderRadius:"20px",cursor:"pointer",
                  background:active?`${color}20`:"transparent",color:active?color:dim}}>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* 정렬 + 검색 */}
        <div style={{display:"flex",gap:"0.5rem",marginBottom:"0.5rem",alignItems:"center"}}>
          <input type="text" placeholder="검색..." value={search}
            onChange={e=>{setSearch(e.target.value);setPage(0);}}
            style={{flex:1,background:surface,border:`1px solid ${border}`,borderRadius:"12px",
              padding:"0.75rem 1rem",fontSize:"0.875rem",color:soft,outline:"none",fontFamily:"monospace"}} />
          <div style={{display:"flex",gap:"0.25rem",background:surface,border:`1px solid ${border}`,borderRadius:"12px",padding:"0.25rem",flexShrink:0}}>
            {[
              {key:"view_count",   label:"조회순"},
              {key:"collected_at", label:"최신순"},
            ].map(s=>(
              <button key={s.key} onClick={()=>change(setSort,s.key as SortKey)}
                style={{padding:"0.4rem 0.75rem",fontSize:"0.7rem",border:"none",borderRadius:"8px",cursor:"pointer",
                  background:sort===s.key?border:"transparent",color:sort===s.key?primary:dim}}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{fontSize:"0.7rem",color:dim,marginBottom:"1rem",display:"flex",justifyContent:"space-between"}}>
          <span>48시간 이내</span>
          <span>{totalCount.toLocaleString()}건 · {page+1}/{totalPages||1}페이지</span>
        </div>

        {/* 목록 */}
        {loading ? (
          <div style={{textAlign:"center",color:dim,padding:"4rem",fontSize:"0.875rem"}}>로딩 중...</div>
        ) : memes.length===0 ? (
          <div style={{textAlign:"center",color:dim,padding:"4rem",fontSize:"0.875rem"}}>데이터 없음</div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
            {memes.map((m,i)=>{
              const catColor = CAT_COLOR[m.category]||dim;
              const isVideo  = VIDEO_SOURCES.has(m.source);
              return (
                <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer"
                  style={{display:"flex",alignItems:"center",gap:"0.75rem",background:surface,
                    border:`1px solid ${border}`,borderRadius:"12px",padding:"0.75rem 1rem",textDecoration:"none"}}
                  onMouseEnter={e=>(e.currentTarget.style.borderColor="#3a3a3a")}
                  onMouseLeave={e=>(e.currentTarget.style.borderColor=border)}>
                  <span style={{fontSize:"0.7rem",color:"#3a3a3a",width:"2rem",textAlign:"right",flexShrink:0}}>
                    {page*PAGE_SIZE+i+1}
                  </span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:"0.875rem",color:primary,marginBottom:"0.2rem",
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {isVideo && <span style={{color:"#f97316",marginRight:"0.3rem",fontSize:"0.7rem"}}>▶</span>}
                      {m.title}
                    </div>
                    <div style={{fontSize:"0.7rem",color:dim}}>
                      {SOURCE_LABEL[m.source]||m.source} · {timeAgo(m.collected_at)}
                      {m.view_count>0 && " · "+m.view_count.toLocaleString()}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:"0.4rem",flexShrink:0}}>
                    {m.category && m.category!=="general" && (
                      <span style={{fontSize:"0.65rem",padding:"0.15rem 0.5rem",borderRadius:"4px",
                        border:`1px solid ${catColor}40`,color:catColor,background:`${catColor}10`}}>
                        {CAT_LABEL[m.category]||m.category}
                      </span>
                    )}
                    <span style={{fontSize:"0.65rem",padding:"0.15rem 0.5rem",borderRadius:"4px",
                      border:`1px solid ${m.platform==="domestic"?"#10b98140":"#3b82f640"}`,
                      color:m.platform==="domestic"?"#10b981":"#3b82f6",
                      background:m.platform==="domestic"?"#10b98110":"#3b82f610"}}>
                      {m.platform==="domestic"?"국내":"해외"}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages>1 && (
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:"0.5rem",marginTop:"1.5rem"}}>
            <button onClick={()=>setPage(0)} disabled={page===0}
              style={{padding:"0.4rem 0.75rem",fontSize:"0.7rem",border:`1px solid ${border}`,
                borderRadius:"8px",cursor:page===0?"default":"pointer",background:"transparent",
                color:page===0?dim:primary}}>처음</button>
            <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0}
              style={{padding:"0.4rem 0.75rem",fontSize:"0.75rem",border:`1px solid ${border}`,
                borderRadius:"8px",cursor:page===0?"default":"pointer",background:"transparent",
                color:page===0?dim:primary}}>이전</button>
            <span style={{fontSize:"0.75rem",color:dim,minWidth:"4rem",textAlign:"center"}}>
              {page+1} / {totalPages}
            </span>
            <button onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} disabled={page>=totalPages-1}
              style={{padding:"0.4rem 0.75rem",fontSize:"0.75rem",border:`1px solid ${border}`,
                borderRadius:"8px",cursor:page>=totalPages-1?"default":"pointer",background:"transparent",
                color:page>=totalPages-1?dim:primary}}>다음</button>
            <button onClick={()=>setPage(totalPages-1)} disabled={page>=totalPages-1}
              style={{padding:"0.4rem 0.75rem",fontSize:"0.7rem",border:`1px solid ${border}`,
                borderRadius:"8px",cursor:page>=totalPages-1?"default":"pointer",background:"transparent",
                color:page>=totalPages-1?dim:primary}}>마지막</button>
          </div>
        )}
      </div>
    </div>
  );
}
