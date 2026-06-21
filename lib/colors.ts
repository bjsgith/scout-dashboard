// Shared palette for application statuses — one source of truth for the
// StatusBadge (Tailwind utility classes) and the analytics charts (raw hex,
// since SVG fills can't use Tailwind tokens).
import type { ApplicationStatus } from "@/lib/enums";

// Tailwind utility strings for the pill-style status badge.
export const STATUS_BADGE: Record<ApplicationStatus, string> = {
  Saved: "bg-[#E8E4D6] text-[#6B6550] ring-[#D6D1BD]", // stone / staged
  Applied: "bg-[#D9E4E1] text-[#355F60] ring-[#C2D3CF]", // lake blue
  Interviewing: "bg-[#F1E3C2] text-[#876326] ring-[#E2CE9A]", // amber / on the move
  Offer: "bg-[#D9E7CE] text-[#3F6233] ring-[#C2D6B2]", // fern
  Accepted: "bg-[#C8DCC3] text-[#234E2F] ring-[#A9C6A2]", // deep pine — summit
  Rejected: "bg-rust-soft text-rust-deep ring-[#DDBBA6]", // clay
  Withdrawn: "bg-[#E6E3DA] text-[#928C7C] ring-[#D5D1C3]", // faded
};

export const STATUS_BADGE_FALLBACK = "bg-[#E8E4D6] text-[#6B6550] ring-[#D6D1BD]";

// Solid fill hex per status — the darker companion to each badge tint, tuned
// to read clearly as chart segments against the paper surfaces.
export const STATUS_FILL: Record<ApplicationStatus, string> = {
  Saved: "#A7A088", // stone
  Applied: "#5E8F8C", // lake
  Interviewing: "#C99A3A", // amber
  Offer: "#6E9A57", // fern
  Accepted: "#2F6B3D", // pine summit
  Rejected: "#A8482A", // rust / clay
  Withdrawn: "#B4AE9E", // faded
};

export function statusFill(status: string): string {
  return STATUS_FILL[status as ApplicationStatus] ?? "#A7A088";
}

// Field Log accent ramp (sage → rust) for choropleth / density shading.
export const RAMP = ["#ECE7D8", "#D7DBC6", "#C3C9AE", "#9DA889", "#A8482A"];

// Neutral surfaces & accents pulled from tailwind.config.js for SVG use.
export const INK = {
  pine: "#22372B",
  moss: "#54624E",
  mossLight: "#7C8B73",
  sage: "#D7DBC6",
  sageDeep: "#9DA889",
  rust: "#A8482A",
  rustSoft: "#EDDBCF",
  paper: "#F3EFE4",
  paperRaised: "#FBF9F1",
  paperSunk: "#ECE7D8",
} as const;
