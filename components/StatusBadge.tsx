import type { ApplicationStatus } from "@/lib/enums";

// Earthy, natural tones — the pipeline reads like trail stages, not a tech stack.
const STYLES: Record<ApplicationStatus, string> = {
  Saved: "bg-[#E8E4D6] text-[#6B6550] ring-[#D6D1BD]", // stone / staged
  Applied: "bg-[#D9E4E1] text-[#355F60] ring-[#C2D3CF]", // lake blue
  Interviewing: "bg-[#F1E3C2] text-[#876326] ring-[#E2CE9A]", // amber / on the move
  Offer: "bg-[#D9E7CE] text-[#3F6233] ring-[#C2D6B2]", // fern
  Accepted: "bg-[#C8DCC3] text-[#234E2F] ring-[#A9C6A2]", // deep pine — summit
  Rejected: "bg-rust-soft text-rust-deep ring-[#DDBBA6]", // clay
  Withdrawn: "bg-[#E6E3DA] text-[#928C7C] ring-[#D5D1C3]", // faded
};

export default function StatusBadge({ status }: { status: string }) {
  const cls =
    STYLES[status as ApplicationStatus] ??
    "bg-[#E8E4D6] text-[#6B6550] ring-[#D6D1BD]";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-display text-xs font-medium uppercase tracking-[0.08em] ring-1 ring-inset ${cls}`}
    >
      {status}
    </span>
  );
}
