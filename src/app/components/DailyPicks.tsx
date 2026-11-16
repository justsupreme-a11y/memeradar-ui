"use client";

import MemeCard from "./MemeCard";

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
  extra?: { cross_verified?: boolean; matched_trends?: string[] } | null;
};

type Props = {
  picks: Meme[];
  sourceLabel: (source: string) => string;
  velocityGrade: (score: number | null) => number;
  onClick: (meme: Meme) => void;
};

// "오늘의 찐밈" — raw 피드를 다 훑지 않아도 되도록, 유머 커뮤니티·밈채널
// 가중치 + 확산 속도 + 실시간 검색어 교차검증을 합산해 상위 5건만 먼저 보여준다.
// 선정 로직(SOURCE_FIT_WEIGHT, NON_MEME_PATTERN, dailyPicks 계산)은 page.tsx 참고.
export default function DailyPicks({ picks, sourceLabel, velocityGrade, onClick }: Props) {
  if (picks.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-baseline justify-between mb-2 flex-wrap gap-1">
        <h2 className="text-sm font-mono text-primary flex items-center gap-1.5">
          🏆 오늘의 찐밈
        </h2>
        <span className="text-[11px] font-mono text-dim">
          커뮤니티 반응 · 확산 속도 · 실시간 검색어 교차검증 기준
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {picks.map((meme, i) => (
          <MemeCard
            key={meme.id}
            meme={meme}
            index={i}
            sourceLabel={sourceLabel(meme.source)}
            velocityGrade={velocityGrade(meme.velocity_score)}
            onClick={() => onClick(meme)}
          />
        ))}
      </div>
    </div>
  );
}
