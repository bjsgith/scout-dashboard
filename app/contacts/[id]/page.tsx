import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import DeleteButton from "@/components/DeleteButton";
import StatusBadge from "@/components/StatusBadge";
import InteractionTimeline from "@/components/InteractionTimeline";
import LogInteractionForm from "@/components/LogInteractionForm";
import { getSettings } from "@/lib/settings";
import { lastSpoken, isStale, daysSince } from "@/lib/staleness";
import { formatDate } from "@/lib/format";
import { deleteContact, logInteraction } from "../actions";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [contact, settings] = await Promise.all([
    prisma.contact.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true } },
        interactions: { orderBy: { date: "desc" } },
        applications: {
          orderBy: { lastActivityAt: "desc" },
          select: { id: true, jobTitle: true, status: true },
        },
      },
    }),
    getSettings(),
  ]);

  if (!contact) notFound();

  const spoken = lastSpoken(contact.interactions);
  const stale = isStale(spoken, settings.contactStaleDays);
  const days = daysSince(spoken);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/contacts" className="link-quiet text-sm">
            ← Contacts
          </Link>
          <h1 className="page-title mt-2">{contact.name}</h1>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-moss">
            {contact.title && <span>{contact.title}</span>}
            {contact.company && (
              <Link
                href={`/companies/${contact.company.id}`}
                className="link-quiet underline"
              >
                {contact.company.name}
              </Link>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="link-quiet underline">
                {contact.email}
              </a>
            )}
            {contact.phone && <span>{contact.phone}</span>}
            {contact.linkedinUrl && (
              <a
                href={contact.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="link-quiet underline"
              >
                LinkedIn
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/contacts/${contact.id}/edit`}
            className="btn-outline btn-sm"
          >
            Edit
          </Link>
          <DeleteButton
            action={deleteContact.bind(null, contact.id)}
            confirmMessage={`Delete ${contact.name}? This also deletes their interactions.`}
          />
        </div>
      </div>

      <div
        className={`flex items-center gap-2.5 rounded-lg border p-4 text-sm ${
          stale
            ? "border-rust/30 border-l-2 border-l-rust bg-rust-soft/40 text-rust-deep"
            : "card text-moss"
        }`}
      >
        {stale && <span className="blaze" aria-hidden />}
        <span>
          <span className="font-display font-medium uppercase tracking-[0.08em]">
            Last spoken:{" "}
          </span>
          {spoken ? (
            <>
              {formatDate(spoken)}
              {days !== null && days > 0 && ` · ${days} days ago`}
            </>
          ) : (
            "Never"
          )}
          {stale && (
            <span className="ml-2 font-medium">
              — overdue (threshold {settings.contactStaleDays} days)
            </span>
          )}
        </span>
      </div>

      {contact.notes && (
        <p className="card whitespace-pre-wrap p-4 text-sm text-moss">
          {contact.notes}
        </p>
      )}

      {contact.applications.length > 0 && (
        <section className="space-y-3">
          <h2 className="section-title">
            Linked applications ({contact.applications.length})
          </h2>
          <ul className="card divide-y divide-sage/70 overflow-hidden">
            {contact.applications.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/applications/${a.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-paper-sunk/60"
                >
                  <span className="font-medium text-pine">{a.jobTitle}</span>
                  <StatusBadge status={a.status} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="section-title">Log an interaction</h2>
        <LogInteractionForm action={logInteraction.bind(null, contact.id)} />
      </section>

      <section className="space-y-3">
        <h2 className="section-title">
          Interaction history ({contact.interactions.length})
        </h2>
        <InteractionTimeline interactions={contact.interactions} />
      </section>
    </div>
  );
}
