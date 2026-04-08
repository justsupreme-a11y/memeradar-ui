"use client";

import { useState } from "react";

const FLOW_META: Record<string, { label: string; color: string; tooltip: string }> = {
  inflow:      { label: "🌐 유입",  color: "#3b82f6", tooltip: "해외에서 국내로 유입된 트렌드" },
  independent: { label: "🇰🇷 독립", color: "#10b981", tooltip: "국내에서 독립적으로 생성된 밈" },
  export:      { label: "📤 역수출", color: "#f97316", tooltip: "국내에서 해외로 역수출된 밈" },
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
    collected_at: string;
  };
  index: number;
  sourceLabel: string;
  velocityGrade: number; // 0~5
};

// 불꽃 시각화: 등급에 따라 🔥 개수 + 색상
function VelocityBadge({ grade }: { grade: number }) {
  if (grade === 0) return null;
  const flames = "🔥".repeat(Math.min(grade, 5));
  const label = ["", "미온", "확산", "상승", "급상승", "폭발"][grade] || "";
  return (
    <span
      className="text-xs font-mono px-2 py-0.5 rounded-md border"
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

export default function MemeCard({ meme, index, sourceLabel, velocityGrade }: Props) {
  const [copied, setCopied] = useState(false);
  const flow = FLOW_META[meme.flow_type || ""] || null;

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (h > 24) return `${Math.floor(h / 24)}일 전`;
    if (h > 0)  return `${h}시간 전`;
    return `${m}분 전`;
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(meme.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
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

      {/* 뱃지 + 복사 버튼 */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* velocity 불꽃 뱃지 */}
        <VelocityBadge grade={velocityGrade} />

        {/* flow_type 뱃지 */}
        {flow && (
          <span
            className="text-xs font-mono px-2 py-0.5 rounded-md border cursor-default"
            style={{
              color:           flow.color,
              borderColor:     flow.color,
              backgroundColor: flow.color + "18",
            }}
            title={flow.tooltip}
          >
            {flow.label}
          </span>
        )}

        {/* 링크 복사 버튼 */}
        <button
          onClick={handleCopy}
          className="text-xs font-mono px-2 py-0.5 rounded-md border border-border text-dim hover:text-primary hover:border-muted transition-colors"
          title="링크 복사"
        >
          {copied ? "✓" : "🔗"}
        </button>

      </div>
    </a>
  );
}
