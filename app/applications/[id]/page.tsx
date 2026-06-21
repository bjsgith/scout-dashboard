import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import StatusBadge from "@/components/StatusBadge";
import DeleteButton from "@/components/DeleteButton";
import { formatDate } from "@/lib/format";
import { daysSince } from "@/lib/staleness";
import { enumLabel } from "@/lib/enums";
import { deleteApplication } from "../actions";

// Statuses that are closed out — no "days since applied" nudge for these.
const TERMINAL_STATUSES = new Set([
  "Accepted",
  "Rejected",
  "Withdrawn",
  "AssumedStale",
]);

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const app = await prisma.application.findUnique({
    where: { id },
    include: {
      company: { select: { id: true, name: true } },
      contacts: { orderBy: { name: "asc" }, select: { id: true, name: true } },
    },
  });

  if (!app) notFound();

  const location = [app.city, app.state].filter(Boolean).join(", ");
  const days = daysSince(app.dateApplied);
  const showDaysHint =
    app.dateApplied && !TERMINAL_STATUSES.has(app.status) && days !== null;

  // Read-only field rows — only the populated ones are shown.
  const fields: Array<{ label: string; value: React.ReactNode }> = [];
  if (app.dateApplied) {
    fields.push({
      label: "Applied",
      value: (
        <>
          {formatDate(app.dateApplied)}
          {showDaysHint && days > 0 && (
            <span className="text-moss-light"> · {days}d ago</span>
          )}
        </>
      ),
    });
  }
  if (app.reachedInterview)
    fields.push({ label: "Interview", value: "Reached interview stage" });
  if (app.platform) fields.push({ label: "Platform", value: app.platform });
  if (app.employmentType)
    fields.push({
      label: "Employment",
      value: enumLabel(app.employmentType),
    });
  if (app.workMode)
    fields.push({ label: "Work mode", value: enumLabel(app.workMode) });
  if (location) fields.push({ label: "Location", value: location });
  if (app.pay) fields.push({ label: "Pay", value: app.pay });
  if (app.followUpDate)
    fields.push({ label: "Follow-up", value: formatDate(app.followUpDate) });
  if (app.jobUrl)
    fields.push({
      label: "Listing",
      value: (
        <a
          href={app.jobUrl}
          target="_blank"
          rel="noreferrer"
          className="link-quiet underline"
        >
          View posting
        </a>
      ),
    });

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/applications" className="link-quiet text-sm">
            ← Applications
          </Link>
          <h1 className="page-title mt-2">{app.jobTitle}</h1>
          <div className="mt-3 flex items-center gap-3 text-sm text-moss">
            <Link
              href={`/companies/${app.company.id}`}
              className="font-medium text-pine underline underline-offset-2 hover:text-rust"
            >
              {app.company.name}
            </Link>
            <StatusBadge status={app.status} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/applications/${app.id}/edit`}
            className="btn-outline btn-sm"
          >
            Edit
          </Link>
          <DeleteButton
            action={deleteApplication.bind(null, app.id)}
            confirmMessage={`Delete the application for "${app.jobTitle}"?`}
          />
        </div>
      </div>

      {fields.length > 0 && (
        <dl className="card grid grid-cols-2 gap-x-6 gap-y-4 p-5 sm:grid-cols-3">
          {fields.map((f) => (
            <div key={f.label}>
              <dt className="font-display text-[0.7rem] font-medium uppercase tracking-[0.1em] text-moss-light">
                {f.label}
              </dt>
              <dd className="mt-0.5 text-sm text-pine">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {app.contacts.length > 0 && (
        <section className="space-y-3">
          <h2 className="section-title">
            People involved ({app.contacts.length})
          </h2>
          <ul className="card divide-y divide-sage/70 overflow-hidden">
            {app.contacts.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/contacts/${c.id}`}
                  className="block px-4 py-3 font-medium text-pine transition-colors hover:bg-paper-sunk/60"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {app.notes && (
        <section className="space-y-3">
          <h2 className="section-title">Notes</h2>
          <p className="card whitespace-pre-wrap p-4 text-sm text-moss">
            {app.notes}
          </p>
        </section>
      )}
    </div>
  );
}
