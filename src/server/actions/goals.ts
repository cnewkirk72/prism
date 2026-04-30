"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

const goalInput = z.object({
  kind: z.enum(["FOLLOWERS_TIKTOK", "FOLLOWERS_INSTAGRAM", "VIEWS_MONTHLY", "REVENUE_MONTHLY"]),
  target: z.coerce.number().int().min(1),
  current: z.coerce.number().int().min(0).default(0),
  targetDate: z.coerce.date().optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
});

export async function upsertGoal(input: z.infer<typeof goalInput> & { id?: string }) {
  const userId = await requireUserId();
  const data = goalInput.parse(input);
  if (input.id) {
    await prisma.goal.updateMany({ where: { id: input.id, userId }, data });
  } else {
    await prisma.goal.create({ data: { ...data, userId } });
  }
  revalidatePath("/create/goals");
}

export async function deleteGoal(id: string) {
  const userId = await requireUserId();
  await prisma.goal.deleteMany({ where: { id, userId } });
  revalidatePath("/create/goals");
}
