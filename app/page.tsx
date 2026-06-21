import Link from "next/link";
import { prisma } from "@/lib/db";
import StatusBadge from "@/components/StatusBadge";
import { getSettings } from "@/lib/settings";
import { lastSpoken, isStale, isFollowUpDue, daysSince } from "@/lib/staleness";
import { formatDate } from "@/lib/format";
import { APPLICATION_STATUSES } from "@/lib/enums";

// Closed statuses don't need follow-up nudges.
const TERMINAL_STATUSES = new Set(["Accepted", "Rejected", "Withdrawn"]);

export default async function DashboardPage() {
  const [apps, contacts, settings] = await Promise.all([
    prisma.application.findMany({
      orderBy: { lastActivityAt: "desc" },
      include: { company: { select: { name: true } } },
    }),
    prisma.contact.findMany({
      orderBy: { name: "asc" },
      include: {
        company: { select: { name: true } },
        interactions: { orderBy: { date: "desc" } },
      },
    }),
    getSettings(),
  ]);

  // Status summary counts.
  const counts = new Map<string, number>();
  for (const a of apps) counts.set(a.status, (counts.get(a.status) ?? 0) + 1);

  // Follow-up widget: open applications that have either gone stale (no activity)
  // or have reached an explicit follow-up date.
  const staleApps = apps.filter(
    (a) =>
      !TERMINAL_STATUSES.has(a.status) &&
      (isStale(a.lastActivityAt, settings.applicationStaleDays) ||
        isFollowUpDue(a.followUpDate))
  );

  // Follow-up widget: contacts not spoken to recently.
  const staleContacts = contacts
    .map((c) => ({ contact: c, spoken: lastSpoken(c.interactions) }))
    .filter(({ spoken }) => isStale(spoken, settings.contactStaleDays))
    .sort((a, b) => {
      const at = a.spoken ? a.spoken.getTime() : 0;
      const bt = b.spoken ? b.spoken.getTime() : 0;
      return at - bt; // oldest / never first
    });

  // Recent activity: merge application updates and logged interactions.
  type Activity = { key: string; when: Date; href: string; text: string };
  const activity: Activity[] = [
    ...apps.map((a) => ({
      key: `app-${a.id}`,
      when: a.lastActivityAt,
      href: `/applications/${a.id}`,
      text: `${a.jobTitle} at ${a.company.name} — ${a.status}`,
    })),
    ...contacts.flatMap((c) =>
      c.interactions.map((i) => ({
        key: `int-${i.id}`,
        when: i.date,
        href: `/contacts/${c.id}`,
        text: `${i.type} with ${c.name}`,
      }))
    ),
  ]
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
                } across the pipeline. Follow-ups and recent sign below.`
              : "Your pipeline, follow-ups, and recent activity — once you log your first lead."}
          </p>
        </div>
        {/* The ridge: each status is a stamped marker along the trail. */}
        {/* Uniform hairlines; the card's overflow-hidden trims the outer edges. */}
        <ol className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
          {APPLICATION_STATUSES.map((s) => {
            const n = counts.get(s) ?? 0;
            return (
              <li key={s} className="border-b border-r border-sage">
                <Link
                  href="/applications"
                  className="group flex h-full flex-col gap-1 px-5 py-5 transition-colors hover:bg-paper-sunk/60"
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
                  <span className="font-display text-[0.7rem] font-medium uppercase tracking-[0.1em] text-moss">
                    {s}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Follow-up widgets — flagged with the blaze. */}
      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-baseline gap-2.5">
            <span className="blaze" aria-hidden />
            <h2 className="section-title">Follow up</h2>
            <span className="font-display text-sm text-moss">
              {staleApps.length}
            </span>
          </div>
          <p className="text-xs text-moss-light">
            Open, no activity in {settings.applicationStaleDays}+ days or past a
            set follow-up date.
          </p>
          {staleApps.length === 0 ? (
            <p className="card p-4 text-sm text-moss-light">
              Nothing&rsquo;s gone cold. Good tracking.
            </p>
          ) : (
            <ul className="card divide-y divide-sage/70 overflow-hidden border-l-2 border-l-rust">
              {staleApps.map((a) => {
                const days = daysSince(a.lastActivityAt);
                const dueByDate = isFollowUpDue(a.followUpDate);
                return (
                  <li key={a.id}>
                    <Link
                      href={`/applications/${a.id}`}
                      className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-rust-soft/40"
                    >
                      <div>
                        <div className="font-medium text-pine">
                          {a.jobTitle}
                        </div>
                        <div className="text-xs text-moss">
                          {a.company.name}
                          {dueByDate
                            ? ` · follow-up due ${formatDate(a.followUpDate)}`
                            : days !== null && ` · ${days}d since activity`}
                        </div>
                      </div>
                      <StatusBadge status={a.status} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline gap-2.5">
            <span className="blaze" aria-hidden />
            <h2 className="section-title">Reach out</h2>
            <span className="font-display text-sm text-moss">
              {staleContacts.length}
            </span>
          </div>
          <p className="text-xs text-moss-light">
            No contact in {settings.contactStaleDays}+ days.
          </p>
          {staleContacts.length === 0 ? (
            <p className="card p-4 text-sm text-moss-light">
              All caught up. Nobody&rsquo;s waiting on you.
            </p>
          ) : (
            <ul className="card divide-y divide-sage/70 overflow-hidden border-l-2 border-l-rust">
              {staleContacts.map(({ contact: c, spoken }) => (
                <li key={c.id}>
                  <Link
                    href={`/contacts/${c.id}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-rust-soft/40"
                  >
                    <div>
                      <div className="font-medium text-pine">{c.name}</div>
                      <div className="text-xs text-moss">
                        {c.company?.name ?? "—"}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-rust">
                      {spoken ? `Last ${formatDate(spoken)}` : "Never"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
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
