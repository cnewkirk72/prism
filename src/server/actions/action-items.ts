"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export async function createActionItem(input: { title: string }) {
  const userId = await requireUserId();
  const title = z.string().trim().min(1).max(200).parse(input.title);
  const max = await prisma.actionItem.aggregate({ where: { userId }, _max: { position: true } });
  await prisma.actionItem.create({
    data: { userId, title, position: (max._max.position ?? -1) + 1 },
  });
  revalidatePath("/brand/monetization");
}

export async function toggleActionItem(id: string, done: boolean) {
  const userId = await requireUserId();
  await prisma.actionItem.updateMany({ where: { id, userId }, data: { done } });
  revalidatePath("/brand/monetization");
}

export async function deleteActionItem(id: string) {
  const userId = await requireUserId();
  await prisma.actionItem.deleteMany({ where: { id, userId } });
  revalidatePath("/brand/monetization");
}
