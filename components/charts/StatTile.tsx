// A single headline metric, styled to match the dashboard's status markers.
export default function StatTile({
  value,
  label,
  hint,
  accent,
}: {
  value: string | number;
  label: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="card flex flex-col gap-1 px-5 py-5">
      <span
        className={`font-display text-3xl font-semibold tabular-nums ${
          accent ? "text-rust" : "text-pine"
        }`}
      >
        {value}
      </span>
      <span className="font-display text-[0.7rem] font-medium uppercase tracking-[0.1em] text-moss">
        {label}
      </span>
      {hint && <span className="text-xs text-moss-light">{hint}</span>}
    </div>
  );
}
