// US application-density map, drawn as a tile-grid cartogram (one labeled
// square per state). Tiles shade from sage (few) to rust (many) by application
// count; states with none stay on the sunk-paper base. Fully server-rendered
// SVG from bundled coordinates — no geocoding, no external assets.
import { INK } from "@/lib/colors";
import { STATE_TILES, GRID_COLS, GRID_ROWS } from "@/lib/us-states";

// Sage → rust density ramp for states that have at least one application.
const DENSITY = ["#C7CFB2", "#A9B58C", "#C98A5E", "#B55E37", "#A8482A"];

export default function USStateMap({
  counts,
}: {
  counts: Map<string, number>;
}) {
  const max = Math.max(0, ...counts.values());
  const total = [...counts.values()].reduce((a, b) => a + b, 0);

  const cell = 40;
  const gap = 5;
  const pitch = cell + gap;
  const w = GRID_COLS * pitch - gap;
  const h = GRID_ROWS * pitch - gap;

  function fillFor(count: number): string {
    if (count <= 0) return INK.paperSunk;
    if (max <= 0) return DENSITY[0];
    const idx = Math.round((count / max) * (DENSITY.length - 1));
    return DENSITY[idx];
  }

  function isDark(count: number): boolean {
    if (count <= 0 || max <= 0) return false;
    return Math.round((count / max) * (DENSITY.length - 1)) >= 3;
  }

  if (total === 0) {
    return (
      <p className="text-sm text-moss-light">
        No application locations recorded yet. Add a state to an application to
        see the map fill in.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label="Application density by state"
        className="w-full"
      >
        {STATE_TILES.map((t) => {
          const count = counts.get(t.abbr) ?? 0;
          const x = t.col * pitch;
          const y = t.row * pitch;
          const dark = isDark(count);
          return (
            <g key={t.abbr}>
              <rect
                x={x}
                y={y}
                width={cell}
                height={cell}
                rx={4}
                fill={fillFor(count)}
                stroke={INK.paperRaised}
                strokeWidth={1}
              />
              <text
                x={x + cell / 2}
                y={y + cell / 2 - (count > 0 ? 4 : 0)}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  fill: dark ? INK.paperRaised : INK.pine,
                }}
              >
                {t.abbr}
              </text>
              {count > 0 && (
                <text
                  x={x + cell / 2}
                  y={y + cell / 2 + 9}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontSize: 10,
                    fill: dark ? INK.paperRaised : INK.moss,
                  }}
                >
                  {count}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-moss-light">
        <span>Fewer</span>
        {DENSITY.map((c) => (
          <span
            key={c}
            aria-hidden
            className="h-3 w-5 rounded-[2px]"
            style={{ backgroundColor: c }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
