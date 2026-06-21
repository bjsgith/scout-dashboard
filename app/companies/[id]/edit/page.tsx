import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import CompanyForm from "@/components/CompanyForm";
import { updateCompany } from "../../actions";

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/companies/${company.id}`}
          className="link-quiet text-sm"
        >
          ← {company.name}
        </Link>
        <h1 className="page-title mt-2">
          Edit company
        </h1>
      </div>
      <CompanyForm
        action={updateCompany.bind(null, company.id)}
        defaults={company}
        submitLabel="Save changes"
        cancelHref={`/companies/${company.id}`}
      />
    </div>
  );
}
