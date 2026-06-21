import Link from "next/link";
import { prisma } from "@/lib/db";
import ApplicationsTable, { type AppRow } from "@/components/ApplicationsTable";

export default async function ApplicationsPage() {
  const apps = await prisma.application.findMany({
    orderBy: { lastActivityAt: "desc" },
    include: { company: { select: { name: true } } },
  });

  const rows: AppRow[] = apps.map((a) => ({
    id: a.id,
    jobTitle: a.jobTitle,
    companyName: a.company.name,
    status: a.status,
    employmentType: a.employmentType,
    workMode: a.workMode,
    location: [a.city, a.state].filter(Boolean).join(", "),
    pay: a.pay,
    dateApplied: a.dateApplied ? a.dateApplied.toISOString() : null,
    lastActivity: a.lastActivityAt.toISOString(),
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">The hunt</p>
          <h1 className="page-title mt-1">Applications</h1>
        </div>
        <Link href="/applications/new" className="btn-primary btn-sm">
          New application
        </Link>
      </div>
      <ApplicationsTable rows={rows} />
    </div>
  );
}
