// Horizontal bar list — ranked categories with a proportional fill and count.
// Used for city density, work mode, employment type, and interaction types.
import { INK } from "@/lib/colors";

export type BarDatum = { label: string; value: number; color?: string };

export default function BarList({
  data,
  emptyMessage = "No data yet.",
}: {
  data: BarDatum[];
  emptyMessage?: string;
}) {
  if (data.length === 0) {
    return <p className="text-sm text-moss-light">{emptyMessage}</p>;
  }
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="space-y-2.5">
      {data.map((d) => (
        <li key={d.label} className="space-y-1">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-sm text-moss">{d.label}</span>
            <span className="shrink-0 font-display text-sm font-medium tabular-nums text-pine">
              {d.value}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-paper-sunk">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max((d.value / max) * 100, 4)}%`,
                backgroundColor: d.color ?? INK.pine,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
