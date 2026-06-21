import Link from "next/link";
import { prisma } from "@/lib/db";
import ContactForm from "@/components/ContactForm";
import { createContact } from "../actions";

export default async function NewContactPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string }>;
}) {
  const { companyId } = await searchParams;
  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/contacts"
          className="link-quiet text-sm"
        >
          ← Contacts
        </Link>
        <h1 className="page-title mt-2">
          New contact
        </h1>
      </div>
      <ContactForm
        action={createContact}
        companies={companies}
        defaultCompanyId={companyId}
        submitLabel="Create contact"
        cancelHref="/contacts"
      />
    </div>
  );
}
