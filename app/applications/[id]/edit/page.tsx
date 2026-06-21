import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ApplicationForm from "@/components/ApplicationForm";
import { toDateInputValue } from "@/lib/format";
import { updateApplication } from "../../actions";

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [app, companies, contacts] = await Promise.all([
    prisma.application.findUnique({
      where: { id },
      include: { contacts: { select: { id: true } } },
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
    <div className="space-y-6">
      <div>
        <Link href={`/applications/${app.id}`} className="link-quiet text-sm">
          ← {app.jobTitle}
        </Link>
        <h1 className="page-title mt-2">Edit application</h1>
      </div>
      <ApplicationForm
        action={updateApplication.bind(null, app.id)}
        companies={companies}
        contacts={contacts}
        defaults={{
          jobTitle: app.jobTitle,
          companyId: app.companyId,
          status: app.status,
          reachedInterview: app.reachedInterview,
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
  );
}
