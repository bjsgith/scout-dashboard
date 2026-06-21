// Follow-up / staleness helpers. Used by the dashboard follow-up widget and the
// contacts rolodex "last spoken" highlighting in later shots.

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Whole days elapsed between `from` and now (or `to`). Returns null if `from` is null. */
export function daysSince(from: Date | null | undefined, to: Date = new Date()): number | null {
  if (!from) return null;
  return Math.floor((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/**
 * True when the elapsed time since `lastActivity` exceeds `staleDays`.
 * A null `lastActivity` is treated as stale (nothing has happened yet).
 */
export function isStale(
  lastActivity: Date | null | undefined,
  staleDays: number,
  now: Date = new Date()
): boolean {
  if (!lastActivity) return true;
  const days = daysSince(lastActivity, now);
  return days !== null && days >= staleDays;
}

/**
 * True when an explicit follow-up date is set and is today or in the past.
 */
export function isFollowUpDue(
  followUpDate: Date | null | undefined,
  now: Date = new Date()
): boolean {
  if (!followUpDate) return false;
  return followUpDate.getTime() <= now.getTime();
}

/** Most recent date in a list of interactions (their `date`), or null if none. */
export function lastSpoken(
  interactions: Array<{ date: Date }>
): Date | null {
  if (!interactions || interactions.length === 0) return null;
  return interactions.reduce<Date>(
    (max, i) => (i.date > max ? i.date : max),
    interactions[0].date
  );
}
