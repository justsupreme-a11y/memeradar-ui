"use client";

import { useEffect, useRef } from "react";

const FLOW_META: Record<string, { label: string; color: string }> = {
  inflow:      { label: "🌐 유입",   color: "#3b82f6" },
  independent: { label: "🇰🇷 독립",  color: "#10b981" },
  export:      { label: "📤 역수출", color: "#f97316" },
};

const CATEGORY_LABEL: Record<string, string> = {
  trend:     "트렌드",
  general:   "일반",
  food:      "푸드",
  celeb:     "셀럽",
  fashion:   "패션",
  travel:    "여행",
  broadcast: "방송·연예",
  fb:        "F&B",
};

type Meme = {
  id: number;
  title: string;
  url: string;
  source: string;
  platform: string;
  image_url: string;
  view_count: number;
  like_count: number;
  flow_type: string | null;
  velocity_score: number | null;
  category: string | null;
  collected_at: string;
  extra?: { video_id?: string; description?: string } | null;
};

type Props = {
  meme: Meme | null;
  sourceLabel: string;
  velocityGrade: number;
  onClose: () => void;
};

function VelocityBar({ grade }: { grade: number }) {
  if (grade === 0) return null;
  const labels = ["", "미온", "확산", "상승", "급상승", "폭발"];
  const colors  = ["", "#6b6b6b", "#eab308", "#eab308", "#f97316", "#f97316"];
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono text-dim">확산 속도</span>
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="w-4 h-1.5 rounded-full"
            style={{ background: i < grade ? colors[grade] : "#2a2a2a" }}
          />
        ))}
      </div>
      <span className="text-xs font-mono" style={{ color: colors[grade] }}>
        {labels[grade]}
      </span>
    </div>
  );
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h / 24)}일 전`;
  if (h > 0)  return `${h}시간 전`;
  return `${m}분 전`;
}

export default function MemeDrawer({ meme, sourceLabel, velocityGrade, onClose }: Props) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const flow      = FLOW_META[meme?.flow_type || ""] || null;
  const category  = CATEGORY_LABEL[meme?.category || ""] || null;
  // 유튜브 소스는 원문 이탈 없이 드로어 안에서 바로 재생 — 클릭 후에도
  // 얻는 게 없어 바로 이탈하던 문제를 영상 임베드로 해소
  const videoId    = meme?.source?.startsWith("youtube") ? meme?.extra?.video_id : "";
  const description = meme?.extra?.description?.trim();

  // ESC 키로 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // 열릴 때 body 스크롤 잠금
  useEffect(() => {
    if (meme) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [meme]);

  if (!meme) return null;

  return (
    <>
      {/* 딤 배경 */}
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* 모바일: 하단 드로어 / PC: 우측 사이드패널 */}
      <div
        ref={drawerRef}
        className={`
          fixed z-50 bg-bg border-border
          transition-transform duration-300 ease-out
          flex flex-col
          /* 모바일: 하단 */
          bottom-0 left-0 right-0 rounded-t-2xl border-t max-h-[75vh]
          /* PC: 우측 패널 */
          md:bottom-0 md:top-0 md:left-auto md:right-0 md:w-[420px] md:rounded-none md:rounded-l-2xl md:border-t-0 md:border-l md:max-h-full md:h-full
        `}
      >
        {/* 핸들 (모바일만) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {category && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-surface border border-border text-dim">
                {category}
              </span>
            )}
            {flow && (
              <span
                className="text-xs font-mono px-2 py-0.5 rounded-md border"
                style={{ color: flow.color, borderColor: flow.color, backgroundColor: flow.color + "18" }}
              >
                {flow.label}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-dim hover:text-primary transition-colors text-lg leading-none ml-3 flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* 본문 — 스크롤 가능 */}
        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-5">

          {/* 제목 */}
          <h2 className="text-base font-medium text-primary leading-snug">
            {meme.title}
          </h2>

          {/* 유튜브: 원문 이동 없이 바로 재생 */}
          {videoId ? (
            <div className="rounded-xl overflow-hidden bg-surface border border-border aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={meme.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : meme.image_url ? (
            <div className="rounded-xl overflow-hidden bg-surface border border-border">
              <img
                src={meme.image_url}
                alt={meme.title}
                className="w-full object-cover max-h-52"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          ) : null}

          {/* 설명 — 원문을 열지 않아도 내용을 파악할 수 있도록 */}
          {description && (
            <p className="text-sm text-soft leading-relaxed whitespace-pre-line">
              {description}
            </p>
          )}

          {/* 메타 정보 */}
          <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-dim">소스</span>
              <span className="text-soft">{sourceLabel}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-dim">수집 시각</span>
              <span className="text-soft">{timeAgo(meme.collected_at)}</span>
            </div>
            {meme.view_count > 0 && (
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-dim">조회수</span>
                <span className="text-soft">{meme.view_count.toLocaleString()}</span>
              </div>
            )}
            {meme.like_count > 0 && (
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-dim">좋아요</span>
                <span className="text-soft">{meme.like_count.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* velocity */}
          <VelocityBar grade={velocityGrade} />

        </div>

        {/* 푸터 — 원본 보기 버튼 */}
        <div className="px-5 py-4 border-t border-border flex-shrink-0">
          <a
            href={meme.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center text-sm font-mono py-3 rounded-xl border border-border text-soft hover:text-primary hover:border-muted transition-colors"
          >
            원본 보기 →
          </a>
        </div>
      </div>
    </>
  );
}
