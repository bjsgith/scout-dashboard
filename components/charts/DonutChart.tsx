// SVG donut chart — applications by status. Pure server-rendered SVG: each
// slice is an arc drawn with stroke-dasharray on a single circle, with a legend
// beside it and the total in the center.
import { INK } from "@/lib/colors";

export type DonutDatum = { label: string; value: number; color: string };

export default function DonutChart({
  data,
  centerLabel = "total",
  emptyMessage = "No applications yet.",
}: {
  data: DonutDatum[];
  centerLabel?: string;
  emptyMessage?: string;
}) {
  const slices = data.filter((d) => d.value > 0);
  const total = slices.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return <p className="text-sm text-moss-light">{emptyMessage}</p>;
  }

  const size = 180;
  const stroke = 26;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  let offset = 0;
  const arcs = slices.map((d) => {
    const len = (d.value / total) * c;
    const arc = {
      ...d,
      dash: len,
      gap: c - len,
      // Rotate each arc to start where the previous ended; -90° puts 0 at top.
      rotate: (offset / c) * 360 - 90,
    };
    offset += len;
    return arc;
  });

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Applications by status"
        className="shrink-0"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={INK.paperSunk}
          strokeWidth={stroke}
        />
        {arcs.map((a) => (
          <circle
            key={a.label}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={a.color}
            strokeWidth={stroke}
            strokeDasharray={`${a.dash} ${a.gap}`}
            transform={`rotate(${a.rotate} ${size / 2} ${size / 2})`}
          />
        ))}
        <text
          x="50%"
          y="48%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-display"
          style={{ fontSize: 30, fontWeight: 600, fill: INK.pine }}
        >
          {total}
        </text>
        <text
          x="50%"
          y="62%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fill: INK.moss,
          }}
        >
          {centerLabel}
        </text>
      </svg>

      <ul className="grid flex-1 grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
        {slices.map((d) => (
          <li key={d.label} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-moss">{d.label}</span>
            <span className="ml-auto font-display tabular-nums text-pine">
              {d.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
