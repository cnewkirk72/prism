"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

const input = z.object({
  brand: z.string().trim().min(1).max(80),
  programName: z.string().trim().min(1).max(80),
  commissionBps: z.coerce.number().int().min(0).max(10_000).optional().nullable(),
  commissionNote: z.string().trim().max(80).optional().nullable(),
  status: z.enum(["TO_APPLY","APPLIED","APPROVED","REJECTED","ACTIVE","PAUSED"]).default("TO_APPLY"),
  link: z.string().url().optional().nullable(),
});

export async function upsertAffiliate(data: z.infer<typeof input> & { id?: string }) {
  const userId = await requireUserId();
  const parsed = input.parse(data);
  if (data.id) {
    await prisma.affiliateProgram.updateMany({ where: { id: data.id, userId }, data: parsed });
  } else {
    await prisma.affiliateProgram.create({ data: { ...parsed, userId } });
  }
  revalidatePath("/brand/monetization");
}

export async function setAffiliateStatus(id: string, status: z.infer<typeof input>["status"]) {
  const userId = await requireUserId();
  const patch: Record<string, unknown> = { status };
  if (status === "APPLIED") patch.appliedAt = new Date();
  if (status === "APPROVED" || status === "ACTIVE") patch.approvedAt = new Date();
  await prisma.affiliateProgram.updateMany({ where: { id, userId }, data: patch });
  revalidatePath("/brand/monetization");
}

export async function deleteAffiliate(id: string) {
  const userId = await requireUserId();
  await prisma.affiliateProgram.deleteMany({ where: { id, userId } });
  revalidatePath("/brand/monetization");
}
