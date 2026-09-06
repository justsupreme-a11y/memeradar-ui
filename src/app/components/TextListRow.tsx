"use client";

import { useState } from "react";

// 썸네일 확보가 구조적으로 어려운 소스(검색 API·커뮤니티 게시판)를 위한
// 콤팩트 텍스트 리스트 행 — 그리드에 빈 썸네일 박스가 섞이는 것을 방지
const CATEGORY_DOT: Record<string, string> = {
  trend:     "#f97316",
  general:   "#6b6b6b",
  food:      "#eab308",
  celeb:     "#a855f7",
  fashion:   "#ec4899",
  travel:    "#06b6d4",
  broadcast: "#3b82f6",
  fb:        "#10b981",
};

type Props = {
  meme: {
    id: number;
    title: string;
    url: string;
    source: string;
    view_count: number;
    category?: string | null;
    collected_at: string;
  };
  sourceLabel: string;
  onClick: () => void;
};

export default function TextListRow({ meme, sourceLabel, onClick }: Props) {
  const [copied, setCopied] = useState(false);
  const dot = CATEGORY_DOT[meme.category || ""] || "#3a3a3a";

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
      className="group flex items-center gap-3 bg-surface border border-border hover:border-muted rounded-lg px-3 py-2.5 transition-colors cursor-pointer"
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: dot }}
      />
      <p className="flex-1 min-w-0 text-sm text-primary group-hover:text-white transition-colors truncate">
        {meme.title}
      </p>
      <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-dim flex-shrink-0">
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
      <button
        onClick={handleCopy}
        className="flex-shrink-0 text-xs font-mono w-6 h-6 flex items-center justify-center rounded-md border border-border text-dim hover:text-primary hover:border-muted transition-colors"
        title="링크 복사"
      >
        {copied ? "✓" : "🔗"}
      </button>
    </div>
  );
}
