"use client";

const FLOW_META: Record<string, { label: string; color: string }> = {
  inflow:      { label: "유입",   color: "#3b82f6" },
  independent: { label: "독립",   color: "#10b981" },
  export:      { label: "역수출", color: "#f97316" },
};

const STAGE_COLOR: Record<string, string> = {
  seed:   "#10b981",
  spread: "#3b82f6",
  peak:   "#f97316",
  fade:   "#3a3a3a",
};

type Props = {
  meme: {
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
  index: number;
  stageLabel: string;
  sourceLabel: string;
};

export default function MemeCard({ meme, index, stageLabel, sourceLabel }: Props) {
  const flow  = FLOW_META[meme.flow_type || ""] || null;
  const stage = meme.lifecycle_stage || "";

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (h > 24) return `${Math.floor(h / 24)}일 전`;
    if (h > 0) return `${h}시간 전`;
    return `${m}분 전`;
  };

  return (
    <a
      href={meme.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 bg-surface border border-border hover:border-muted rounded-xl px-4 py-3 transition-all fade-up"
      style={{ animationDelay: `${index * 20}ms` }}
    >
      {/* 인덱스 */}
      <span className="text-xs font-mono text-muted w-6 text-right flex-shrink-0">
        {index + 1}
      </span>

      {/* 본문 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-primary group-hover:text-white transition-colors truncate mb-1">
          {meme.title}
        </p>
        <div className="flex items-center gap-2 text-xs font-mono text-dim">
          <span>{sourceLabel}</span>
          <span className="text-border">·</span>
          <span>{timeAgo(meme.collected_at)}</span>
          {meme.view_count > 0 && (
            <>
              <span className="text-border">·</span>
              <span>조회 {meme.view_count.toLocaleString()}</span>
            </>
          )}
        </div>
      </div>

      {/* 뱃지들 */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* 생애주기 */}
        <span
          className="text-xs font-mono px-2 py-0.5 rounded-md border"
          style={{
            color:            STAGE_COLOR[stage] || "#6b6b6b",
            borderColor:      STAGE_COLOR[stage] || "#3a3a3a",
            backgroundColor:  (STAGE_COLOR[stage] || "#3a3a3a") + "18",
          }}
        >
          {stageLabel}
        </span>

        {/* 흐름 분류 */}
        {flow && (
          <span
            className="text-xs font-mono px-2 py-0.5 rounded-md border"
            style={{
              color:           flow.color,
              borderColor:     flow.color,
              backgroundColor: flow.color + "18",
            }}
          >
            {flow.label}
          </span>
        )}
      </div>
    </a>
  );
}
