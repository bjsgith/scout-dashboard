"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { str, url } from "@/lib/form";

function companyData(formData: FormData) {
  const name = str(formData.get("name"));
  if (!name) throw new Error("Company name is required.");
  return {
    name,
    website: url(formData.get("website")),
    industry: str(formData.get("industry")),
    location: str(formData.get("location")),
    notes: str(formData.get("notes")),
  };
}

export async function createCompany(formData: FormData) {
  const company = await prisma.company.create({ data: companyData(formData) });
  revalidatePath("/companies");
  redirect(`/companies/${company.id}`);
}

export async function updateCompany(id: string, formData: FormData) {
  await prisma.company.update({ where: { id }, data: companyData(formData) });
  revalidatePath("/companies");
  revalidatePath(`/companies/${id}`);
  redirect(`/companies/${id}`);
}

export async function deleteCompany(id: string) {
  await prisma.company.delete({ where: { id } });
  revalidatePath("/companies");
  redirect("/companies");
}

/**
 * Create a company and return its id/name — used by the inline "add company"
 * control on the new-application form. Does not redirect.
 */
export async function createCompanyInline(
  name: string
): Promise<{ id: string; name: string }> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Company name is required.");
  const company = await prisma.company.create({ data: { name: trimmed } });
  revalidatePath("/companies");
  return { id: company.id, name: company.name };
}
