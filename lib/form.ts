// Shared FormData parsing helpers for Server Actions. Keeps the parse step
// consistent across the per-route actions.ts files (see CLAUDE.md).

/** Trim a form value to a non-empty string, or null when empty/absent. */
export function str(value: FormDataEntryValue | null): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s === "" ? null : s;
}

/** Return the value only when it's one of `allowed`, else null. */
export function asEnum<T extends string>(
  value: FormDataEntryValue | null,
  allowed: readonly T[]
): T | null {
  const s = str(value);
  return s && (allowed as readonly string[]).includes(s) ? (s as T) : null;
}

/**
 * Normalize a user-entered URL to a safe http(s) value, or null. Schemeless
 * input (e.g. "example.com") is assumed https; dangerous schemes such as
 * `javascript:` or `data:` are rejected so stored links are always safe to
 * render into an href.
 */
export function url(value: FormDataEntryValue | null): string | null {
  const s = str(value);
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return null; // reject javascript:, data:, etc.
  return `https://${s}`;
}
