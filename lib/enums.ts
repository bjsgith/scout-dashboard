// Enum option lists + display labels, shared by forms, tables, and badges.
// Values mirror prisma/schema.prisma exactly.

export const APPLICATION_STATUSES = [
  "Active",
  "Interviewing",
  "Offer",
  "Accepted",
  "Rejected",
  "Withdrawn",
  "AssumedStale",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const EMPLOYMENT_TYPES = [
  "FullTime",
  "PartTime",
  "Internship",
  "Contract",
  "Temporary",
] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const WORK_MODES = ["InPerson", "Remote", "Hybrid"] as const;
export type WorkMode = (typeof WORK_MODES)[number];

export const INTERACTION_TYPES = [
  "Call",
  "Email",
  "Text",
  "Coffee",
  "LinkedIn",
  "Meeting",
  "Other",
] as const;
export type InteractionType = (typeof INTERACTION_TYPES)[number];

const LABELS: Record<string, string> = {
  AssumedStale: "Assumed Stale",
  FullTime: "Full-time",
  PartTime: "Part-time",
  Internship: "Internship",
  Contract: "Contract",
  Temporary: "Temporary",
  InPerson: "In-person",
  Remote: "Remote",
  Hybrid: "Hybrid",
};

/** Human-friendly label for an enum value (falls back to the raw value). */
export function enumLabel(value: string | null | undefined): string {
  if (!value) return "";
  return LABELS[value] ?? value;
}

/** Build `{ value, label }` options for a <select>. */
export function options(values: readonly string[]) {
  return values.map((value) => ({ value, label: enumLabel(value) }));
}
