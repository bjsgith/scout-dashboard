// Pipeline funnel — centered bars showing how leads narrow from Saved through
// Accepted, with the conversion rate from the top of the funnel at each stage.
import { statusFill } from "@/lib/colors";

export type FunnelStage = { label: string; value: number };

export default function Funnel({ stages }: { stages: FunnelStage[] }) {
  const top = stages[0]?.value ?? 0;
  const max = Math.max(...stages.map((s) => s.value), 1);

  if (top === 0) {
    return (
      <p className="text-sm text-moss-light">No applications in the pipeline yet.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {stages.map((s) => {
        const pctOfMax = (s.value / max) * 100;
        const pctOfTop = Math.round((s.value / top) * 100);
        return (
          <li key={s.label} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-right font-display text-[0.7rem] font-medium uppercase tracking-[0.08em] text-moss">
              {s.label}
            </span>
            <div className="relative flex h-7 flex-1 items-center">
              <div
                className="flex h-full items-center justify-end rounded-[3px] px-2"
                style={{
                  width: `${Math.max(pctOfMax, 6)}%`,
                  backgroundColor: statusFill(s.label),
                }}
              >
                <span className="font-display text-xs font-semibold tabular-nums text-paper-raised">
                  {s.value}
                </span>
              </div>
              <span className="ml-2 shrink-0 text-xs tabular-nums text-moss-light">
                {pctOfTop}%
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
