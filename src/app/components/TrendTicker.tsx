"use client";

// 구글트렌드·네이버데이터랩·네이버실검 — 개별 게시물이 아니라
// "검색어 + 수치" 시그널이라 콘텐츠 그리드/리스트와 성격이 다름.
// 클릭 시 원문(트렌드 그래프·검색결과 페이지)으로 바로 이동하는
// 태그 형태로 별도 노출.
const TREND_META: Record<string, { label: string; color: string }> = {
  google_trends:  { label: "구글트렌드",   color: "#3b82f6" },
  naver_datalab:  { label: "네이버데이터랩", color: "#10b981" },
  naver_realtime: { label: "네이버실검",   color: "#10b981" },
};

type TrendMeme = {
  id: number;
  title: string;
  url: string;
  source: string;
  view_count: number;
};

export default function TrendTicker({ items }: { items: TrendMeme[] }) {
  if (items.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-xl p-4 mb-6">
      <div className="text-xs text-dim font-mono mb-3">🔥 실시간 트렌드 키워드</div>
      <div className="flex flex-wrap gap-2">
        {items.map(item => {
          const meta = TREND_META[item.source] || { label: item.source, color: "#6b6b6b" };
          return (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`${meta.label}${item.view_count ? ` · ${item.view_count}` : ""}`}
              className="text-xs font-mono px-2.5 py-1 rounded-full border hover:opacity-75 transition-opacity"
              style={{
                borderColor:     meta.color,
                color:           meta.color,
                backgroundColor: `${meta.color}18`,
              }}
            >
              {item.title}
            </a>
          );
        })}
      </div>
    </div>
  );
}
