"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseDateInput } from "@/lib/format";
import { str, asEnum, url } from "@/lib/form";
import {
  APPLICATION_STATUSES,
  EMPLOYMENT_TYPES,
  WORK_MODES,
  type ApplicationStatus,
  type EmploymentType,
  type WorkMode,
} from "@/lib/enums";

function applicationData(formData: FormData) {
  const jobTitle = str(formData.get("jobTitle"));
  const companyId = str(formData.get("companyId"));
  if (!jobTitle) throw new Error("Job title is required.");
  if (!companyId) throw new Error("Company is required.");

  const status =
    asEnum<ApplicationStatus>(formData.get("status"), APPLICATION_STATUSES) ??
    "Active";

  const contactIds = formData
    .getAll("contactIds")
    .map((v) => String(v))
    .filter(Boolean);

  return {
    jobTitle,
    companyId,
    status,
    reachedInterview: formData.get("reachedInterview") != null,
    dateApplied: parseDateInput(formData.get("dateApplied")),
    platform: str(formData.get("platform")),
    employmentType: asEnum<EmploymentType>(
      formData.get("employmentType"),
      EMPLOYMENT_TYPES
    ),
    city: str(formData.get("city")),
    state: str(formData.get("state")),
    workMode: asEnum<WorkMode>(formData.get("workMode"), WORK_MODES),
    pay: str(formData.get("pay")),
    jobUrl: url(formData.get("jobUrl")),
    notes: str(formData.get("notes")),
    followUpDate: parseDateInput(formData.get("followUpDate")),
    contactIds,
  };
}

export async function createApplication(formData: FormData) {
  const { contactIds, ...data } = applicationData(formData);
  const app = await prisma.application.create({
    data: {
      ...data,
      lastActivityAt: new Date(),
      contacts: { connect: contactIds.map((id) => ({ id })) },
    },
  });
  revalidatePath("/applications");
  revalidatePath(`/companies/${data.companyId}`);
  redirect(`/applications/${app.id}`);
}

export async function updateApplication(id: string, formData: FormData) {
  const { contactIds, ...data } = applicationData(formData);
  await prisma.application.update({
    where: { id },
    data: {
      ...data,
      // Touch lastActivityAt on every edit.
      lastActivityAt: new Date(),
      contacts: { set: contactIds.map((cid) => ({ id: cid })) },
    },
  });
  revalidatePath("/applications");
  revalidatePath(`/applications/${id}`);
  revalidatePath(`/companies/${data.companyId}`);
  redirect(`/applications/${id}`);
}

export async function deleteApplication(id: string) {
  const app = await prisma.application.delete({ where: { id } });
  revalidatePath("/applications");
  revalidatePath(`/companies/${app.companyId}`);
  redirect("/applications");
}
