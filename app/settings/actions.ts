"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

function posInt(
  value: FormDataEntryValue | null,
  fallback: number
): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.floor(n);
}

export async function updateSettings(formData: FormData) {
  const applicationStaleDays = posInt(formData.get("applicationStaleDays"), 7);
  const contactStaleDays = posInt(formData.get("contactStaleDays"), 30);

  await prisma.settings.upsert({
    where: { id: 1 },
    update: { applicationStaleDays, contactStaleDays },
    create: { id: 1, applicationStaleDays, contactStaleDays },
  });

  revalidatePath("/settings");
  revalidatePath("/");
  revalidatePath("/contacts");
  redirect("/settings?saved=1");
}
