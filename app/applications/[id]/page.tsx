import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import StatusBadge from "@/components/StatusBadge";
import DeleteButton from "@/components/DeleteButton";
import ApplicationForm from "@/components/ApplicationForm";
import { toDateInputValue } from "@/lib/format";
import { updateApplication, deleteApplication } from "../actions";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [app, companies, contacts] = await Promise.all([
    prisma.application.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true } },
        contacts: { select: { id: true } },
      },
    }),
    prisma.company.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.contact.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!app) notFound();

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
        <DeleteButton
          action={deleteApplication.bind(null, app.id)}
          confirmMessage={`Delete the application for "${app.jobTitle}"?`}
        />
      </div>

      <div>
        <h2 className="section-title mb-4">Edit application</h2>
        <ApplicationForm
          action={updateApplication.bind(null, app.id)}
          companies={companies}
          contacts={contacts}
          defaults={{
            jobTitle: app.jobTitle,
            companyId: app.companyId,
            status: app.status,
            dateApplied: toDateInputValue(app.dateApplied),
            platform: app.platform,
            employmentType: app.employmentType,
            city: app.city,
            state: app.state,
            workMode: app.workMode,
            pay: app.pay,
            jobUrl: app.jobUrl,
            notes: app.notes,
            followUpDate: toDateInputValue(app.followUpDate),
            contactIds: app.contacts.map((c) => c.id),
          }}
          submitLabel="Save changes"
          cancelHref={`/applications/${app.id}`}
        />
      </div>
    </div>
  );
}
