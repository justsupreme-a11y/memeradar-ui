e={{textAlign:"center" as const, color:C.dim, padding:"4rem", fontSize:"0.875rem"}}>데이터 없음</div>
        ) : (
          <div style={{display:"flex", flexDirection:"column" as const, gap:"0.5rem"}}>
            {list.map((m, i) => {
              const flow  = FLOW[m.flow_type || ""];
              const stage = STAGE[m.lifecycle_stage || ""];
              const vel   = calcVelocity(m);
              return (
                <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer"
                  style={{display:"flex", alignItems:"center", gap:"0.75rem",
                    background:C.surface, border:`1px solid ${C.border}`, borderRadius:"12px",
                    padding:"0.75rem 1rem", textDecoration:"none"}}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "#3a3a3a")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}>
                  <span style={{fontSize:"0.7rem", color:"#3a3a3a", width:"1.5rem", textAlign:"right" as const, flexShrink:0}}>{i+1}</span>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:"0.875rem", color:C.primary, marginBottom:"0.2rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const}}>{m.title}</div>
                    <div style={{fontSize:"0.7rem", color:C.dim}}>
                      {SOURCE[m.source]||m.source} · {timeAgo(m.collected_at)}
                      {m.view_count > 0 && " · " + m.view_count.toLocaleString()}
                      {mainTab === "meme" && vel > 0 && <span style={{color:"#f97316"}}> · ⚡{vel.toLocaleString()}/h</span>}
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
