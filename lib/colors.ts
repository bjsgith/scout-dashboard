// Shared palette for application statuses — one source of truth for the
// StatusBadge (Tailwind utility classes) and the analytics charts (raw hex,
// since SVG fills can't use Tailwind tokens).
import type { ApplicationStatus } from "@/lib/enums";

// Tailwind utility strings for the pill-style status badge. Semantic, traffic-
// light coloring so a status reads at a glance: blue = in the queue, greens =
// advancing / won, amber = decision pending, red = lost, gray = inactive.
export const STATUS_BADGE: Record<ApplicationStatus, string> = {
  Active: "bg-[#15374C] text-[#9DCBEA] ring-[#22506C]", // blue — submitted, waiting
  Interviewing: "bg-[#1B3D2A] text-[#9ED9A8] ring-[#2A5A3D]", // green — advancing
  Offer: "bg-[#433014] text-[#F0C674] ring-[#65471F]", // amber-gold — decision pending
  Accepted: "bg-[#14432A] text-[#7FD69B] ring-[#1F6440]", // deep green — won / summit
  Rejected: "bg-[#4A1F1A] text-[#F0A392] ring-[#6E2E25]", // red — lost
  Withdrawn: "bg-[#22323A] text-[#9BAAB2] ring-[#33474F]", // gray — inactive
  AssumedStale: "bg-[#3A3226] text-[#D3BC93] ring-[#544937]", // dusty tan — gone quiet
};

export const STATUS_BADGE_FALLBACK = "bg-[#22323A] text-[#93A4AC] ring-[#33474F]";

// Solid fill hex per status — the brighter companion to each badge tint, tuned
// to read clearly as chart segments against the deep-water surfaces.
export const STATUS_FILL: Record<ApplicationStatus, string> = {
  Active: "#5FB3C4", // shoal
  Interviewing: "#E2AE4E", // lantern
  Offer: "#8FCB6E", // kelp
  Accepted: "#46A45C", // deep kelp
  Rejected: "#E4694A", // coral
  Withdrawn: "#6E8593", // slate
  AssumedStale: "#C2A272", // dusty tan — gone quiet
};

export function statusFill(status: string): string {
  return STATUS_FILL[status as ApplicationStatus] ?? "#7E8F98";
}

// Density ramp (deep water → coral) for choropleth / density shading.
export const RAMP = ["#12303C", "#1C4A5C", "#2E6E80", "#4E97A6", "#E4694A"];

// Neutral surfaces & accents pulled from tailwind.config.js for SVG use.
export const INK = {
  pine: "#E8F3F4",
  moss: "#93AEB9",
  mossLight: "#7E9CAA",
  sage: "#1D3E4C",
  sageDeep: "#5E93A6",
  rust: "#E4694A",
  rustSoft: "#3B211A",
  paper: "#0B1E27",
  paperRaised: "#12303B",
  paperSunk: "#071720",
} as const;
