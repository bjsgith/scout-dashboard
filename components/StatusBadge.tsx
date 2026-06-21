import { enumLabel, type ApplicationStatus } from "@/lib/enums";
import { STATUS_BADGE, STATUS_BADGE_FALLBACK } from "@/lib/colors";

// Earthy, natural tones — the pipeline reads like trail stages, not a tech
// stack. Colors live in lib/colors.ts so badges and charts stay in sync.
export default function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_BADGE[status as ApplicationStatus] ?? STATUS_BADGE_FALLBACK;
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-0.5 font-display text-xs font-medium uppercase tracking-[0.08em] ring-1 ring-inset ${cls}`}
    >
      {enumLabel(status)}
    </span>
  );
}
