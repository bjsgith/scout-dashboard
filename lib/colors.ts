// Shared palette for application statuses — one source of truth for the
// StatusBadge (Tailwind utility classes) and the analytics charts (raw hex,
// since SVG fills can't use Tailwind tokens).
import type { ApplicationStatus } from "@/lib/enums";

// Tailwind utility strings for the pill-style status badge. Semantic, traffic-
// light coloring so a status reads at a glance: blue = in the queue, greens =
// advancing / won, amber = decision pending, red = lost, gray = inactive.
export const STATUS_BADGE: Record<ApplicationStatus, string> = {
  Active: "bg-[#CFE0F0] text-[#235581] ring-[#A9C8E4]", // blue — submitted, waiting
  Interviewing: "bg-[#D4EBC2] text-[#3C6B1F] ring-[#B2D89B]", // green — advancing
  Offer: "bg-[#F6E0A6] text-[#86570E] ring-[#E7C97D]", // amber-gold — decision pending
  Accepted: "bg-[#B6DFB4] text-[#1C5A28] ring-[#8CC58B]", // deep green — won / summit
  Rejected: "bg-[#F3CDC5] text-[#9C281A] ring-[#E2A89B]", // red — lost
  Withdrawn: "bg-[#E2E0DA] text-[#6D695F] ring-[#CECABE]", // gray — inactive
  AssumedStale: "bg-[#E7DAC4] text-[#7C6A45] ring-[#D6C4A4]", // dusty tan — gone quiet
};

export const STATUS_BADGE_FALLBACK = "bg-[#E8E4D6] text-[#6B6550] ring-[#D6D1BD]";

// Solid fill hex per status — the darker companion to each badge tint, tuned
// to read clearly as chart segments against the paper surfaces.
export const STATUS_FILL: Record<ApplicationStatus, string> = {
  Active: "#5E8F8C", // lake
  Interviewing: "#C99A3A", // amber
  Offer: "#6E9A57", // fern
  Accepted: "#2F6B3D", // pine summit
  Rejected: "#A8482A", // rust / clay
  Withdrawn: "#B4AE9E", // faded
  AssumedStale: "#B79B6C", // dusty tan — gone quiet
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
