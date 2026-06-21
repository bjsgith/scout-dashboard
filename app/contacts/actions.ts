"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseDateInput } from "@/lib/format";
import { INTERACTION_TYPES, type InteractionType } from "@/lib/enums";

function str(value: FormDataEntryValue | null): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s === "" ? null : s;
}

function asEnum<T extends string>(
  value: FormDataEntryValue | null,
  allowed: readonly T[]
): T | null {
  const s = str(value);
  return s && (allowed as readonly string[]).includes(s) ? (s as T) : null;
}

function contactData(formData: FormData) {
  const name = str(formData.get("name"));
  if (!name) throw new Error("Contact name is required.");
  return {
    name,
    title: str(formData.get("title")),
    companyId: str(formData.get("companyId")),
    email: str(formData.get("email")),
    phone: str(formData.get("phone")),
    linkedinUrl: str(formData.get("linkedinUrl")),
    notes: str(formData.get("notes")),
  };
}

export async function createContact(formData: FormData) {
  const contact = await prisma.contact.create({ data: contactData(formData) });
  revalidatePath("/contacts");
  if (contact.companyId) revalidatePath(`/companies/${contact.companyId}`);
  redirect(`/contacts/${contact.id}`);
}

export async function updateContact(id: string, formData: FormData) {
  const data = contactData(formData);
  // Capture the previous company so its page refreshes if the link moved.
  const prev = await prisma.contact.findUnique({
    where: { id },
    select: { companyId: true },
  });
  await prisma.contact.update({ where: { id }, data });
  revalidatePath("/contacts");
  revalidatePath(`/contacts/${id}`);
  if (prev?.companyId) revalidatePath(`/companies/${prev.companyId}`);
  if (data.companyId) revalidatePath(`/companies/${data.companyId}`);
  redirect(`/contacts/${id}`);
}

export async function deleteContact(id: string) {
  const contact = await prisma.contact.delete({ where: { id } });
  revalidatePath("/contacts");
  if (contact.companyId) revalidatePath(`/companies/${contact.companyId}`);
  redirect("/contacts");
}

/**
 * Append an interaction to a contact. "Last spoken" is derived from the most
 * recent interaction date, so adding one here updates it everywhere.
 */
export async function logInteraction(contactId: string, formData: FormData) {
  const type =
    asEnum<InteractionType>(formData.get("type"), INTERACTION_TYPES) ?? "Other";
  await prisma.interaction.create({
    data: {
      contactId,
      type,
      date: parseDateInput(formData.get("date")) ?? new Date(),
      notes: str(formData.get("notes")),
    },
  });
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    select: { companyId: true },
  });
  revalidatePath("/contacts");
  revalidatePath(`/contacts/${contactId}`);
  revalidatePath("/");
  if (contact?.companyId) revalidatePath(`/companies/${contact.companyId}`);
}
