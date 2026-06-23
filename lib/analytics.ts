// Pure aggregation helpers for the Analytics page. These take already-fetched
// records (no Prisma here) and return chart-ready shapes, so the page stays a
// thin layout and the math is easy to reason about.
import { APPLICATION_STATUSES, INTERACTION_TYPES, enumLabel } from "@/lib/enums";
import { normalizeState } from "@/lib/us-states";

// Minimal shapes — just the fields the analytics actually read.
export type AppLike = {
  status: string;
  reachedInterview: boolean;
  city: string | null;
  state: string | null;
  workMode: string | null;
  employmentType: string | null;
  dateApplied: Date | null;
  createdAt: Date;
};

export type InteractionLike = {
  type: string;
  date: Date;
};

// Closed/terminal statuses — used to separate the live pipeline from outcomes.
export const TERMINAL_STATUSES = new Set([
  "Accepted",
  "Rejected",
  "Withdrawn",
  "AssumedStale",
]);

// Statuses that imply an interview happened, even if the explicit flag was
// never ticked (you can't be Interviewing/Offer/Accepted without one).
const INTERVIEW_STATUSES = new Set(["Interviewing", "Offer", "Accepted"]);

/**
 * True when an application reached the interview stage — either the explicit
 * `reachedInterview` flag (the only signal once a lead is Rejected / went stale)
 * or a current status at/past Interviewing. Single source of truth so the
 * interview rate and the conversion funnel always agree.
 */
export function reachedInterviewStage(a: AppLike): boolean {
  return a.reachedInterview || INTERVIEW_STATUSES.has(a.status);
}

export type Slice = { label: string; value: number; key: string };

/** Count applications per status, in canonical pipeline order. */
export function statusCounts(apps: AppLike[]): Slice[] {
  const counts = new Map<string, number>();
  for (const a of apps) counts.set(a.status, (counts.get(a.status) ?? 0) + 1);
  return APPLICATION_STATUSES.map((s) => ({
    key: s,
    label: enumLabel(s),
    value: counts.get(s) ?? 0,
  }));
}

/** Headline rates. Guards divide-by-zero so an empty DB renders 0%, not NaN. */
export function rates(apps: AppLike[]) {
  const total = apps.length;
  const by = (s: string) => apps.filter((a) => a.status === s).length;
  const active = apps.filter((a) => !TERMINAL_STATUSES.has(a.status)).length;
  // "Responded" = the search moved past the initial active stage. An assumed-
  // stale lead never got a reply, so it doesn't count as a response.
  const responded = apps.filter(
    (a) => a.status !== "Active" && a.status !== "AssumedStale"
  ).length;
  const offers = by("Offer") + by("Accepted");
  const reached = apps.filter(reachedInterviewStage).length;
  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));
  return {
    total,
    active,
    rejectionRate: pct(by("Rejected")),
    offerRate: pct(offers),
    responseRate: pct(responded),
    interviewRate: pct(reached),
  };
}

/**
 * Interview reach split out for rejections — distinguishes "interviewed then
 * passed on" from "never got past the application".
 */
export function rejectionBreakdown(apps: AppLike[]): Slice[] {
  const rejected = apps.filter((a) => a.status === "Rejected");
  const afterInterview = rejected.filter((a) => a.reachedInterview).length;
  const noInterview = rejected.length - afterInterview;
  return [
    { key: "after", label: "After interview", value: afterInterview },
    { key: "none", label: "Without interview", value: noInterview },
  ].filter((s) => s.value > 0);
}

/**
 * Historical conversion funnel: how far *every* application got, regardless of
 * where it landed. Unlike a status snapshot, an app that interviewed and was
 * then rejected (or went stale) is still counted at "Interviewed". Each stage is
 * a superset of the next, so the funnel narrows monotonically.
 */
export function conversionFunnel(apps: AppLike[]): { label: string; value: number }[] {
  const interviewed = apps.filter(reachedInterviewStage).length;
  const offer = apps.filter(
    (a) => a.status === "Offer" || a.status === "Accepted"
  ).length;
  const accepted = apps.filter((a) => a.status === "Accepted").length;
  return [
    { label: "Active", value: apps.length },
    { label: "Interviewed", value: interviewed },
    { label: "Offer", value: offer },
    { label: "Accepted", value: accepted },
  ];
}

/** Per-state counts keyed by upper-cased state value (for the choropleth). */
export function byState(apps: AppLike[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const a of apps) {
    const st = normalizeState(a.state);
    if (!st) continue;
    m.set(st, (m.get(st) ?? 0) + 1);
  }
  return m;
}

/** Ranked "City, ST" buckets, most applications first. */
export function byCity(apps: AppLike[]): Slice[] {
  const m = new Map<string, number>();
  for (const a of apps) {
    const city = a.city?.trim();
    const st = a.state?.trim();
    const label = [city, st].filter(Boolean).join(", ");
    // Skip applications with no location, matching byState's null handling, so
    // "Top locations" never ranks an "Unspecified" aggregate above real cities.
    if (!label) continue;
    m.set(label, (m.get(label) ?? 0) + 1);
  }
  return [...m.entries()]
    .map(([label, value]) => ({ key: label, label, value }))
    .sort((a, b) => b.value - a.value);
}

/** Count an enum-valued field (workMode / employmentType), labelled & ranked. */
export function byEnumField(
  apps: AppLike[],
  field: "workMode" | "employmentType"
): Slice[] {
  const m = new Map<string, number>();
  for (const a of apps) {
    const v = a[field];
    if (!v) continue;
    m.set(v, (m.get(v) ?? 0) + 1);
  }
  return [...m.entries()]
    .map(([key, value]) => ({ key, label: enumLabel(key), value }))
    .sort((a, b) => b.value - a.value);
}

export type MonthPoint = { key: string; label: string; value: number };

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Build a continuous monthly series (no gaps) from a set of dates, spanning the
 * earliest date through today so the trend line reads correctly.
 */
function monthlySeries(dates: Date[]): MonthPoint[] {
  if (dates.length === 0) return [];
  const counts = new Map<string, number>();
  let min = dates[0];
  for (const d of dates) {
    counts.set(monthKey(d), (counts.get(monthKey(d)) ?? 0) + 1);
    if (d < min) min = d;
  }
  const out: MonthPoint[] = [];
  const cursor = new Date(min.getFullYear(), min.getMonth(), 1);
  const end = new Date();
  // Cap the span so a stray old date can't explode the axis.
  let guard = 0;
  while (
    (cursor.getFullYear() < end.getFullYear() ||
      (cursor.getFullYear() === end.getFullYear() &&
        cursor.getMonth() <= end.getMonth())) &&
    guard++ < 120
  ) {
    const key = monthKey(cursor);
    out.push({
      key,
      label: `${MONTHS[cursor.getMonth()]} ${String(
        cursor.getFullYear()
      ).slice(2)}`,
      value: counts.get(key) ?? 0,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return out;
}

/** Applications applied-to per month (falls back to createdAt when unset). */
export function monthlyApplied(apps: AppLike[]): MonthPoint[] {
  return monthlySeries(apps.map((a) => a.dateApplied ?? a.createdAt));
}

/** Logged interactions per month. */
export function monthlyInteractions(items: InteractionLike[]): MonthPoint[] {
  return monthlySeries(items.map((i) => i.date));
}

/** Interactions grouped by type, in canonical order, ranked by count. */
export function interactionsByType(items: InteractionLike[]): Slice[] {
  const m = new Map<string, number>();
  for (const i of items) m.set(i.type, (m.get(i.type) ?? 0) + 1);
  return INTERACTION_TYPES.map((t) => ({
    key: t,
    label: t,
    value: m.get(t) ?? 0,
  })).filter((s) => s.value > 0);
}
