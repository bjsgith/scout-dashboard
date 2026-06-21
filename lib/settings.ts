import { prisma } from "@/lib/db";

/**
 * Fetch the single Settings row, creating it with schema defaults on first use.
 * The row is pinned to id = 1 so there is always exactly one.
 */
export async function getSettings() {
  return prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
}
