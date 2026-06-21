// SVG area/line chart for a monthly time series. Server-rendered; no axes
// libraries — just a polyline, a soft fill, and sparse month labels.
import { INK } from "@/lib/colors";
import type { MonthPoint } from "@/lib/analytics";

export default function TrendLine({
  data,
  color = INK.rust,
  emptyMessage = "No dated activity yet.",
}: {
  data: MonthPoint[];
  color?: string;
  emptyMessage?: string;
}) {
  if (data.length === 0) {
    return <p className="text-sm text-moss-light">{emptyMessage}</p>;
  }

  const w = 640;
  const h = 180;
  const padX = 8;
  const padTop = 12;
  const padBottom = 26;
  const max = Math.max(...data.map((d) => d.value), 1);
  const innerW = w - padX * 2;
  const innerH = h - padTop - padBottom;

  // With a single point, center it; otherwise spread evenly across the width.
  const x = (i: number) =>
    data.length === 1
      ? w / 2
      : padX + (i / (data.length - 1)) * innerW;
  const y = (v: number) => padTop + innerH - (v / max) * innerH;

  const points = data.map((d, i) => `${x(i)},${y(d.value)}`);
  const linePath = `M ${points.join(" L ")}`;
  const areaPath =
    data.length === 1
      ? null
      : `${linePath} L ${x(data.length - 1)},${padTop + innerH} L ${x(
          0
        )},${padTop + innerH} Z`;

  // Show at most ~6 month labels to avoid crowding.
  const step = Math.max(1, Math.ceil(data.length / 6));

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label="Monthly trend"
      className="w-full"
      preserveAspectRatio="none"
    >
      {/* baseline */}
      <line
        x1={padX}
        y1={padTop + innerH}
        x2={w - padX}
        y2={padTop + innerH}
        stroke={INK.sage}
        strokeWidth={1}
      />
      {areaPath && <path d={areaPath} fill={color} opacity={0.12} />}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {data.map((d, i) => (
        <circle key={d.key} cx={x(i)} cy={y(d.value)} r={3} fill={color} />
      ))}
      {data.map((d, i) =>
        i % step === 0 || i === data.length - 1 ? (
          <text
            key={`lbl-${d.key}`}
            x={x(i)}
            y={h - 8}
            textAnchor="middle"
            style={{ fontSize: 10, fill: INK.mossLight }}
          >
            {d.label}
          </text>
        ) : null
      )}
    </svg>
  );
}
