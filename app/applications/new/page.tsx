import Link from "next/link";
import { prisma } from "@/lib/db";
import ApplicationForm from "@/components/ApplicationForm";
import { createApplication } from "../actions";

export default async function NewApplicationPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string }>;
}) {
  const { companyId } = await searchParams;
  const [companies, contacts] = await Promise.all([
    prisma.company.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.contact.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/applications"
          className="link-quiet text-sm"
        >
          ← Applications
        </Link>
        <h1 className="page-title mt-2">
          New application
        </h1>
      </div>
      <ApplicationForm
        action={createApplication}
        companies={companies}
        contacts={contacts}
        defaultCompanyId={companyId}
        submitLabel="Create application"
        cancelHref="/applications"
      />
    </div>
  );
}
