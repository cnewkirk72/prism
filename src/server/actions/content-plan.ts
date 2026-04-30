"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

const planInput = z.object({
  title: z.string().trim().min(1).max(140),
  shootDate: z.coerce.date().optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

const itemInput = z.object({
  contentPlanId: z.string().min(1),
  phase: z.enum(["BEFORE", "DURING", "AFTER"]),
  title: z.string().trim().min(1).max(200),
});

export async function createContentPlan(input: z.infer<typeof planInput>) {
  const userId = await requireUserId();
  const data = planInput.parse(input);
  const plan = await prisma.contentPlan.create({ data: { ...data, userId } });

  // Auto-seed common before/during/after items so users have a starting structure
  const template = [
    { phase: "BEFORE" as const, items: ["Charge camera + ring light", "Pick sound + reference", "Lay out outfit + accessories"] },
    { phase: "DURING" as const, items: ["Film 3 takes of hook", "Slow-mo b-roll", "Reaction shot to camera"] },
    { phase: "AFTER" as const,  items: ["Cut + sync to beat", "Add captions w/ keywords", "Schedule post"] },
  ];
  let position = 0;
  for (const group of template) {
    for (const title of group.items) {
      await prisma.checklistItem.create({
        data: { contentPlanId: plan.id, phase: group.phase, title, position: position++ },
      });
    }
  }

  revalidatePath("/create/content-plan");
  return plan.id;
}

export async function updateContentPlan(id: string, input: Partial<z.infer<typeof planInput>>) {
  const userId = await requireUserId();
  const partial = planInput.partial().parse(input);
  await prisma.contentPlan.updateMany({ where: { id, userId }, data: partial });
  revalidatePath("/create/content-plan");
}

export async function deleteContentPlan(id: string) {
  const userId = await requireUserId();
  await prisma.contentPlan.deleteMany({ where: { id, userId } });
  revalidatePath("/create/content-plan");
}

export async function addChecklistItem(input: z.infer<typeof itemInput>) {
  const userId = await requireUserId();
  const data = itemInput.parse(input);
  // Verify plan belongs to user
  const plan = await prisma.contentPlan.findFirst({ where: { id: data.contentPlanId, userId } });
  if (!plan) throw new Error("Content plan not found");
  const max = await prisma.checklistItem.aggregate({
    where: { contentPlanId: data.contentPlanId, phase: data.phase },
    _max: { position: true },
  });
  await prisma.checklistItem.create({
    data: { ...data, position: (max._max.position ?? -1) + 1 },
  });
  revalidatePath("/create/content-plan");
}

export async function toggleChecklistItem(itemId: string, done: boolean) {
  const userId = await requireUserId();
  // Verify ownership via the parent plan
  const item = await prisma.checklistItem.findFirst({
    where: { id: itemId, contentPlan: { userId } },
  });
  if (!item) return;
  await prisma.checklistItem.update({ where: { id: itemId }, data: { done } });
  revalidatePath("/create/content-plan");
}

export async function deleteChecklistItem(itemId: string) {
  const userId = await requireUserId();
  const item = await prisma.checklistItem.findFirst({
    where: { id: itemId, contentPlan: { userId } },
  });
  if (!item) return;
  await prisma.checklistItem.delete({ where: { id: itemId } });
  revalidatePath("/create/content-plan");
}

export async function attachSound(itemId: string, soundId: string) {
  const userId = await requireUserId();
  const [item, sound] = await Promise.all([
    prisma.checklistItem.findFirst({ where: { id: itemId, contentPlan: { userId } } }),
    prisma.sound.findFirst({ where: { id: soundId, userId } }),
  ]);
  if (!item || !sound) return;
  await prisma.checklistItemSound.upsert({
    where: { checklistItemId_soundId: { checklistItemId: itemId, soundId } },
    update: {},
    create: { checklistItemId: itemId, soundId },
  });
  revalidatePath("/create/content-plan");
}

export async function detachSound(itemId: string, soundId: string) {
  const userId = await requireUserId();
  const item = await prisma.checklistItem.findFirst({ where: { id: itemId, contentPlan: { userId } } });
  if (!item) return;
  await prisma.checklistItemSound.deleteMany({ where: { checklistItemId: itemId, soundId } });
  revalidatePath("/create/content-plan");
}

export async function attachInspiration(itemId: string, inspirationId: string) {
  const userId = await requireUserId();
  const [item, insp] = await Promise.all([
    prisma.checklistItem.findFirst({ where: { id: itemId, contentPlan: { userId } } }),
    prisma.inspiration.findFirst({ where: { id: inspirationId, userId } }),
  ]);
  if (!item || !insp) return;
  await prisma.checklistItemInspiration.upsert({
    where: { checklistItemId_inspirationId: { checklistItemId: itemId, inspirationId } },
    update: {},
    create: { checklistItemId: itemId, inspirationId },
  });
  revalidatePath("/create/content-plan");
}

export async function detachInspiration(itemId: string, inspirationId: string) {
  const userId = await requireUserId();
  const item = await prisma.checklistItem.findFirst({ where: { id: itemId, contentPlan: { userId } } });
  if (!item) return;
  await prisma.checklistItemInspiration.deleteMany({
    where: { checklistItemId: itemId, inspirationId },
  });
  revalidatePath("/create/content-plan");
}
