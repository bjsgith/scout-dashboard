import Link from "next/link";
import { prisma } from "@/lib/db";
import StatusBadge from "@/components/StatusBadge";
import { daysSince, isStale, isFollowUpDue } from "@/lib/staleness";
import { formatDate } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { APPLICATION_STATUSES, enumLabel } from "@/lib/enums";

// Local single-user dashboard: always render fresh so new data and
// date-based staleness never serve from the Full Route Cache.
export const dynamic = "force-dynamic";

// Open statuses still waiting on the other side to respond.
const AWAITING_STATUSES = new Set(["Active", "Interviewing"]);

export default async function DashboardPage() {
  const [apps, settings] = await Promise.all([
    prisma.application.findMany({
      orderBy: { lastActivityAt: "desc" },
      include: { company: { select: { name: true } } },
    }),
    getSettings(),
  ]);

  // Status summary counts.
  const counts = new Map<string, number>();
  for (const a of apps) counts.set(a.status, (counts.get(a.status) ?? 0) + 1);

  // Awaiting response: open applications you're still waiting to hear back on,
  // longest-waiting first — a feel for which leads have gone quiet.
  const awaiting = apps
    .filter((a) => AWAITING_STATUSES.has(a.status))
    .sort((a, b) => {
      const at = a.dateApplied ? a.dateApplied.getTime() : Infinity;
      const bt = b.dateApplied ? b.dateApplied.getTime() : Infinity;
      return at - bt; // oldest applied first; undated sink to the bottom
    });

  // Recent activity: application updates only.
  const activity = apps
    .map((a) => ({
      key: `app-${a.id}`,
      when: a.lastActivityAt,
      href: `/applications/${a.id}`,
      text: `${a.jobTitle} at ${a.company.name} — ${enumLabel(a.status)}`,
    }))
    .sort((a, b) => b.when.getTime() - a.when.getTime())
    .slice(0, 8);

  const totalApps = apps.length;

  return (
    <div className="space-y-10">
      {/* Trailhead — the hero. Your pipeline laid out like a ridge of markers. */}
      <section className="topo card overflow-hidden">
        <div className="border-b border-sage px-6 py-6 sm:px-8">
          <p className="eyebrow">Scout · Field Log</p>
          <h1 className="page-title mt-1.5">Trailhead</h1>
          <p className="mt-2 max-w-prose text-sm text-moss">
            {totalApps > 0
              ? `Tracking ${totalApps} ${
                  totalApps === 1 ? "lead" : "leads"
                } across the pipeline. Awaiting responses and recent sign below.`
              : "Your pipeline, open leads, and recent activity — once you log your first application."}
          </p>
        </div>
        {/* The ridge: each status is a stamped marker along the trail. */}
        {/* Uniform hairlines; the card's overflow-hidden trims the outer edges. */}
        <ol className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
          {APPLICATION_STATUSES.map((s) => {
            const n = counts.get(s) ?? 0;
            return (
              <li key={s} className="border-b border-r border-sage">
                <Link
                  href="/applications"
                  className="group flex h-full flex-col gap-1 px-3 py-5 transition-colors hover:bg-paper-sunk/60"
                >
                  <span
                    className={`font-display text-3xl font-semibold tabular-nums transition-colors ${
                      n > 0
                        ? "text-pine group-hover:text-rust"
                        : "text-sage-deep"
                    }`}
                  >
                    {n}
                  </span>
                  <span className="whitespace-nowrap font-display text-[0.65rem] font-medium uppercase tracking-[0.05em] text-moss">
                    {enumLabel(s)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Awaiting response — open leads, longest-waiting first. */}
      <section className="space-y-3">
        <div className="flex items-baseline gap-2.5">
          <span className="blaze" aria-hidden />
          <h2 className="section-title">Awaiting response</h2>
          <span className="font-display text-sm text-moss">
            {awaiting.length}
          </span>
        </div>
        <p className="text-xs text-moss-light">
          Open applications you&rsquo;re still waiting to hear back on — longest
          since applying first. The blaze marks ones with no activity in{" "}
          {settings.applicationStaleDays}+ days or a follow-up date that&rsquo;s
          come due.
        </p>
        {awaiting.length === 0 ? (
          <p className="card p-4 text-sm text-moss-light">
            No open leads. Log an application to start tracking.
          </p>
        ) : (
          <ul className="card divide-y divide-sage/70 overflow-hidden">
            {awaiting.map((a) => {
              const days = daysSince(a.dateApplied);
              const stale =
                isStale(a.lastActivityAt, settings.applicationStaleDays) ||
                isFollowUpDue(a.followUpDate);
              return (
                <li key={a.id}>
                  <Link
                    href={`/applications/${a.id}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-paper-sunk/60"
                  >
                    <div className="flex items-center gap-2.5">
                      {stale && <span className="blaze !h-3 !w-1.5" aria-hidden />}
                      <div>
                        <div className="font-medium text-pine">{a.jobTitle}</div>
                        <div className="text-xs text-moss">{a.company.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`shrink-0 text-xs ${
                          stale ? "font-medium text-rust" : "text-moss-light"
                        }`}
                      >
                        {days !== null
                          ? `${days}d since applied`
                          : "no apply date"}
                      </span>
                      <StatusBadge status={a.status} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Recent sign — tracks left along the trail. */}
      <section className="space-y-3">
        <div className="flex items-baseline gap-3">
          <h2 className="section-title">Recent sign</h2>
          <span className="text-xs text-moss-light">latest activity</span>
        </div>
        {activity.length === 0 ? (
          <p className="card p-4 text-sm text-moss-light">
            No tracks yet. Log an application or an interaction to get started.
          </p>
        ) : (
          <ul className="card divide-y divide-sage/70 overflow-hidden">
            {activity.map((a) => (
              <li key={a.key}>
                <Link
                  href={a.href}
                  className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-paper-sunk/60"
                >
                  <span className="text-sm text-moss">{a.text}</span>
                  <span className="shrink-0 text-xs text-moss-light">
                    {formatDate(a.when)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
