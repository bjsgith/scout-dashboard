// Date formatting helpers shared across pages and forms.

/** Locale-friendly date, e.g. "Jun 20, 2026". Returns "—" for null. */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** "YYYY-MM-DD" for prefilling <input type="date">. Returns "" for null. */
export function toDateInputValue(
  date: Date | string | null | undefined
): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  // Build from local components (not UTC) to mirror parseDateInput's local-noon
  // convention — toISOString() would roll the calendar day at far-east offsets.
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse a form date string ("YYYY-MM-DD") to a Date at local noon, avoiding
 * timezone-rollover that would shift the calendar day. Empty → null.
 */
export function parseDateInput(value: FormDataEntryValue | null): Date | null {
  if (!value || typeof value !== "string" || value.trim() === "") return null;
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}
