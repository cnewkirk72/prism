"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

const saveInput = z.object({
  title: z.string().trim().min(1).max(140),
  artist: z.string().trim().max(140).optional().nullable(),
  platform: z.enum(["TIKTOK", "INSTAGRAM"]),
  exampleUrl: z.string().url().optional().nullable(),
  thumbnailUrl: z.string().url(),
  status: z.enum(["SAVED", "TO_FILM", "USED", "SKIPPED"]).default("SAVED"),
});

export async function saveSound(input: z.infer<typeof saveInput>) {
  const userId = await requireUserId();
  const data = saveInput.parse(input);
  await prisma.sound.create({ data: { ...data, userId } });
  revalidatePath("/create/sounds");
}

export async function updateSoundStatus(id: string, status: z.infer<typeof saveInput>["status"]) {
  const userId = await requireUserId();
  await prisma.sound.updateMany({ where: { id, userId }, data: { status } });
  revalidatePath("/create/sounds");
}

export async function deleteSound(id: string) {
  const userId = await requireUserId();
  await prisma.sound.deleteMany({ where: { id, userId } });
  revalidatePath("/create/sounds");
}
