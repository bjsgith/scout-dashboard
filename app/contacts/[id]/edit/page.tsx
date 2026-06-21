import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ContactForm from "@/components/ContactForm";
import { updateContact } from "../../actions";

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [contact, companies] = await Promise.all([
    prisma.contact.findUnique({ where: { id } }),
    prisma.company.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!contact) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/contacts/${contact.id}`}
          className="link-quiet text-sm"
        >
          ← {contact.name}
        </Link>
        <h1 className="page-title mt-2">
          Edit contact
        </h1>
      </div>
      <ContactForm
        action={updateContact.bind(null, contact.id)}
        companies={companies}
        defaults={{
          name: contact.name,
          title: contact.title,
          companyId: contact.companyId,
          email: contact.email,
          phone: contact.phone,
          linkedinUrl: contact.linkedinUrl,
          notes: contact.notes,
        }}
        submitLabel="Save changes"
        cancelHref={`/contacts/${contact.id}`}
      />
    </div>
  );
}
