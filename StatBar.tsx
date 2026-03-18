"use client";

type Props = {
  label: string;
  color: string;
  count: number;
  total: number;
};

export default function StatBar({ label, color, count, total }: Props) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="flex-1">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-mono text-dim">{label}</span>
        <span className="text-xs font-mono" style={{ color }}>{count}</span>
      </div>
      <div className="h-1 bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
