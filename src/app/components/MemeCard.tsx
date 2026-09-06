"use client";

import { useState } from "react";

const FLOW_META: Record<string, { label: string; color: string; tooltip: string }> = {
  inflow:      { label: "🌐 유입",   color: "#3b82f6", tooltip: "해외에서 국내로 유입된 트렌드" },
  independent: { label: "🇰🇷 독립",  color: "#10b981", tooltip: "국내에서 독립적으로 생성된 밈" },
  export:      { label: "📤 역수출", color: "#f97316", tooltip: "국내에서 해외로 역수출된 밈" },
};

// 썸네일이 없는 소스를 위한 카테고리별 플레이스홀더 — 이미지가 없어도
// 그리드 전체가 텍스트 나열처럼 보이지 않도록 카테고리색 + 아이콘으로 시각 리듬을 맞춘다
const CATEGORY_PLACEHOLDER: Record<string, { emoji: string; tint: string }> = {
  trend:     { emoji: "🔥", tint: "#f97316" },
  general:   { emoji: "💬", tint: "#6b6b6b" },
  food:      { emoji: "🍔", tint: "#eab308" },
  celeb:     { emoji: "👑", tint: "#a855f7" },
  fashion:   { emoji: "👗", tint: "#ec4899" },
  travel:    { emoji: "✈️", tint: "#06b6d4" },
  broadcast: { emoji: "📺", tint: "#3b82f6" },
  fb:        { emoji: "🍽️", tint: "#10b981" },
};
const DEFAULT_PLACEHOLDER = { emoji: "📰", tint: "#3a3a3a" };

type Props = {
  meme: {
    id: number;
    title: string;
    url: string;
    source: string;
    image_url?: string | null;
    view_count: number;
    like_count: number;
    flow_type: string | null;
    category?: string | null;
    collected_at: string;
  };
  index: number;
  sourceLabel: string;
  velocityGrade: number;
  onClick: () => void;
};

function VelocityBadge({ grade }: { grade: number }) {
  if (grade === 0) return null;
  const flames = "🔥".repeat(Math.min(grade, 5));
  const label  = ["", "미온", "확산", "상승", "급상승", "폭발"][grade] || "";
  return (
    <span
      className="text-[11px] font-mono px-1.5 py-0.5 rounded-md border leading-none"
      style={{
        color:           grade >= 4 ? "#f97316" : grade >= 2 ? "#eab308" : "#6b6b6b",
        borderColor:     grade >= 4 ? "#f97316" : grade >= 2 ? "#eab308" : "#3a3a3a",
        backgroundColor: grade >= 4 ? "#f9731618" : grade >= 2 ? "#eab30818" : "#3a3a3a18",
      }}
      title={`확산 속도 ${label} (${grade}/5)`}
    >
      {flames}
    </span>
  );
}

export default function MemeCard({ meme, index, sourceLabel, velocityGrade, onClick }: Props) {
  const [copied, setCopied]     = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const flow = FLOW_META[meme.flow_type || ""] || null;
  const placeholder = CATEGORY_PLACEHOLDER[meme.category || ""] || DEFAULT_PLACEHOLDER;
  const showImage = !!meme.image_url && !imgFailed;

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (h > 24) return `${Math.floor(h / 24)}일 전`;
    if (h > 0)  return `${h}시간 전`;
    return `${m}분 전`;
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(meme.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div
      onClick={onClick}
      className="group flex flex-col bg-surface border border-border hover:border-muted rounded-xl overflow-hidden transition-all fade-up cursor-pointer"
      style={{ animationDelay: `${Math.min(index, 24) * 20}ms` }}
    >
      {/* 썸네일 영역 */}
      <div className="relative w-full aspect-[4/3] bg-bg overflow-hidden flex-shrink-0">
        {showImage ? (
          <img
            src={meme.image_url!}
            alt={meme.title}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${placeholder.tint}26, transparent)` }}
          >
            <span className="text-3xl opacity-70">{placeholder.emoji}</span>
          </div>
        )}

        {/* 순번 뱃지 */}
        <span className="absolute top-1.5 left-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-soft leading-none">
          {index + 1}
        </span>

        {/* 흐름 뱃지 */}
        {flow && (
          <span
            className="absolute top-1.5 right-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded-md border backdrop-blur-sm leading-none"
            style={{
              color:           flow.color,
              borderColor:     flow.color,
              backgroundColor: "rgba(0,0,0,0.55)",
            }}
            title={flow.tooltip}
          >
            {flow.label}
          </span>
        )}

        {/* 확산 속도 — 이미지 하단 오버레이 */}
        {velocityGrade > 0 && (
          <span className="absolute bottom-1.5 left-1.5">
            <VelocityBadge grade={velocityGrade} />
          </span>
        )}
      </div>

      {/* 본문 */}
      <div className="flex flex-col flex-1 px-3 py-2.5 gap-1.5">
        <p className="text-sm text-primary group-hover:text-white transition-colors leading-snug line-clamp-2 min-h-[2.5em]">
          {meme.title}
        </p>

        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-center gap-1 text-[11px] font-mono text-dim min-w-0">
            <span className="truncate">{sourceLabel}</span>
            <span className="text-border flex-shrink-0">·</span>
            <span className="flex-shrink-0">{timeAgo(meme.collected_at)}</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 text-xs font-mono w-6 h-6 flex items-center justify-center rounded-md border border-border text-dim hover:text-primary hover:border-muted transition-colors"
            title="링크 복사"
          >
            {copied ? "✓" : "🔗"}
          </button>
        </div>

        {meme.view_count > 0 && (
          <div className="text-[11px] font-mono text-dim">
            조회 {meme.view_count.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
