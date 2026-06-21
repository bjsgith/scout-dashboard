import Link from "next/link";
import { prisma } from "@/lib/db";
import ContactsTable, { type ContactRow } from "@/components/ContactsTable";
import { getSettings } from "@/lib/settings";
import { lastSpoken, isStale } from "@/lib/staleness";

export default async function ContactsPage() {
  const [contacts, settings] = await Promise.all([
    prisma.contact.findMany({
      orderBy: { name: "asc" },
      include: {
        company: { select: { name: true } },
        interactions: { select: { date: true } },
      },
    }),
    getSettings(),
  ]);

  const rows: ContactRow[] = contacts.map((c) => {
    const spoken = lastSpoken(c.interactions);
    return {
      id: c.id,
      name: c.name,
      title: c.title,
      companyName: c.company?.name ?? null,
      lastSpoken: spoken ? spoken.toISOString() : null,
      stale: isStale(spoken, settings.contactStaleDays),
    };
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">The rolodex</p>
          <h1 className="page-title mt-1">Contacts</h1>
        </div>
        <Link href="/contacts/new" className="btn-primary btn-sm">
          New contact
        </Link>
      </div>
      <p className="flex items-center gap-2 text-sm text-moss">
        <span className="blaze !h-3 !w-1.5" aria-hidden />
        The blaze marks contacts you haven&rsquo;t spoken to in{" "}
        {settings.contactStaleDays}+ days.
      </p>
      <ContactsTable rows={rows} />
    </div>
  );
}
