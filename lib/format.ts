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
  return d.toISOString().slice(0, 10);
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
