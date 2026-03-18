"use client";

const SOURCE_LABEL: Record<string, string> = {
  reddit:   "Reddit",
  youtube:  "YouTube Shorts",
  ruliweb:  "루리웹",
  ucduk:    "웃긴대학",
  naver:    "네이버",
  dcinside: "디시인사이드",
  fmkorea:  "에펨코리아",
};

const SOURCE_COLOR: Record<string, string> = {
  reddit:   "#f97316",
  youtube:  "#ef4444",
  ruliweb:  "#3b82f6",
  ucduk:    "#10b981",
  naver:    "#06b6d4",
  dcinside: "#8b5cf6",
  fmkorea:  "#ec4899",
};

type Meme = { source: string };

export default function FlowChart({ memes }: { memes: Meme[] }) {
  // 소스별 카운트
  const counts: Record<string, number> = {};
  for (const m of memes) {
    counts[m.source] = (counts[m.source] || 0) + 1;
  }

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = entries[0]?.[1] || 1;

  if (entries.length === 0) {
    return <div className="text-xs text-dim font-mono py-4 text-center">데이터 없음</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map(([source, count]) => (
        <div key={source} className="flex items-center gap-3">
          <span className="text-xs font-mono text-dim w-24 flex-shrink-0">
            {SOURCE_LABEL[source] || source}
          </span>
          <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(count / max) * 100}%`,
                backgroundColor: SOURCE_COLOR[source] || "#6b6b6b",
              }}
            />
          </div>
          <span className="text-xs font-mono text-dim w-8 text-right">{count}</span>
        </div>
      ))}
    </div>
  );
}
