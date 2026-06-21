import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import StatusBadge from "@/components/StatusBadge";
import DeleteButton from "@/components/DeleteButton";
import { formatDate } from "@/lib/format";
import { enumLabel } from "@/lib/enums";
import { getSettings } from "@/lib/settings";
import { lastSpoken, isStale } from "@/lib/staleness";
import { deleteCompany } from "../actions";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [company, settings] = await Promise.all([
    prisma.company.findUnique({
      where: { id },
      include: {
        applications: { orderBy: { lastActivityAt: "desc" } },
        contacts: {
          orderBy: { name: "asc" },
          include: { interactions: { select: { date: true } } },
        },
      },
    }),
    getSettings(),
  ]);

  if (!company) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/companies" className="link-quiet text-sm">
            ← Companies
          </Link>
          <h1 className="page-title mt-2">{company.name}</h1>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-moss">
            {company.industry && <span>{company.industry}</span>}
            {company.location && <span>{company.location}</span>}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="link-quiet underline"
              >
                {company.website}
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/companies/${company.id}/edit`}
            className="btn-outline btn-sm"
          >
            Edit
          </Link>
          <DeleteButton
            action={deleteCompany.bind(null, company.id)}
            confirmMessage={`Delete ${company.name}? This also deletes its applications.`}
          />
        </div>
      </div>

      {company.notes && (
        <p className="card whitespace-pre-wrap p-4 text-sm text-moss">
          {company.notes}
        </p>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title">
            Applications ({company.applications.length})
          </h2>
          <Link
            href={`/applications/new?companyId=${company.id}`}
            className="font-display text-xs font-medium uppercase tracking-[0.08em] text-rust transition-colors hover:text-rust-deep"
          >
            + Add application
          </Link>
        </div>
        {company.applications.length === 0 ? (
          <p className="card p-4 text-sm text-moss-light">
            No applications at this company yet.
          </p>
        ) : (
          <ul className="card divide-y divide-sage/70 overflow-hidden">
            {company.applications.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/applications/${a.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-paper-sunk/60"
                >
                  <div>
                    <div className="font-medium text-pine">{a.jobTitle}</div>
                    <div className="text-xs text-moss">
                      {[enumLabel(a.employmentType), enumLabel(a.workMode)]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                      {a.dateApplied
                        ? ` · applied ${formatDate(a.dateApplied)}`
                        : ""}
                    </div>
                  </div>
                  <StatusBadge status={a.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title">
            Contacts ({company.contacts.length})
          </h2>
          <Link
            href={`/contacts/new?companyId=${company.id}`}
            className="font-display text-xs font-medium uppercase tracking-[0.08em] text-rust transition-colors hover:text-rust-deep"
          >
            + Add contact
          </Link>
        </div>
        {company.contacts.length === 0 ? (
          <p className="card p-4 text-sm text-moss-light">
            No contacts at this company yet.
          </p>
        ) : (
          <ul className="card divide-y divide-sage/70 overflow-hidden">
            {company.contacts.map((c) => {
              const spoken = lastSpoken(c.interactions);
              const stale = isStale(spoken, settings.contactStaleDays);
              return (
                <li key={c.id}>
                  <Link
                    href={`/contacts/${c.id}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-paper-sunk/60"
                  >
                    <div>
                      <div className="font-medium text-pine">{c.name}</div>
                      <div className="text-xs text-moss">{c.title ?? "—"}</div>
                    </div>
                    <span
                      className={`flex items-center gap-2 text-sm ${
                        stale ? "font-medium text-rust" : "text-moss"
                      }`}
                    >
                      {stale && <span className="blaze !h-3 !w-1.5" aria-hidden />}
                      {spoken ? `Last spoken ${formatDate(spoken)}` : "Never spoken"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
