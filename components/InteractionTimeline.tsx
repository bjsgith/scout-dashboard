import { formatDate } from "@/lib/format";

export type TimelineItem = {
  id: string;
  type: string;
  date: Date;
  notes: string | null;
};

export default function InteractionTimeline({
  interactions,
}: {
  interactions: TimelineItem[];
}) {
  if (interactions.length === 0) {
    return (
      <p className="card p-4 text-sm text-moss-light">
        No interactions logged yet.
      </p>
    );
  }

  return (
    <ol className="relative space-y-5 border-l-2 border-sage pl-6">
      {interactions.map((i) => (
        <li key={i.id} className="relative">
          <span
            className="absolute -left-[1.65rem] top-1 h-2.5 w-2.5 rounded-full border-2 border-paper bg-pine-soft"
            aria-hidden
          />
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-display text-sm font-medium uppercase tracking-[0.08em] text-pine">
              {i.type}
            </span>
            <span className="text-xs text-moss">{formatDate(i.date)}</span>
          </div>
          {i.notes && (
            <p className="mt-1 whitespace-pre-wrap text-sm text-moss">
              {i.notes}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
