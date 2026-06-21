import Link from "next/link";
import CompanyForm from "@/components/CompanyForm";
import { createCompany } from "../actions";

export default function NewCompanyPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/companies"
          className="link-quiet text-sm"
        >
          ← Companies
        </Link>
        <h1 className="page-title mt-2">
          New company
        </h1>
      </div>
      <CompanyForm
        action={createCompany}
        submitLabel="Create company"
        cancelHref="/companies"
      />
    </div>
  );
}
