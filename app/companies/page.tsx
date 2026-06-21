import Link from "next/link";
import { prisma } from "@/lib/db";
import CompaniesTable, { type CompanyRow } from "@/components/CompaniesTable";

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { applications: true, contacts: true } } },
  });

  const rows: CompanyRow[] = companies.map((c) => ({
    id: c.id,
    name: c.name,
    industry: c.industry,
    location: c.location,
    applications: c._count.applications,
    contacts: c._count.contacts,
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">The territory</p>
          <h1 className="page-title mt-1">Companies</h1>
        </div>
        <Link href="/companies/new" className="btn-primary btn-sm">
          New company
        </Link>
      </div>
      <CompaniesTable rows={rows} />
    </div>
  );
}
