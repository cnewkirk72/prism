"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

const swatchInput = z.object({
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Hex like #A855F7"),
  role: z.enum(["outfit", "set", "accent", "grade", "hair", "other"]).default("accent"),
});

const paletteInput = z.object({
  name: z.string().trim().min(1).max(80),
  tag: z.string().trim().max(40).optional().nullable(),
  referenceUrl: z.string().url().optional().nullable(),
  swatches: z.array(swatchInput).min(1).max(10),
});

export async function createPalette(input: z.infer<typeof paletteInput>) {
  const userId = await requireUserId();
  const data = paletteInput.parse(input);
  await prisma.colorPalette.create({
    data: {
      userId,
      name: data.name,
      tag: data.tag ?? null,
      referenceUrl: data.referenceUrl ?? null,
      swatches: { create: data.swatches.map((s, i) => ({ ...s, position: i })) },
    },
  });
  revalidatePath("/create/color-plan");
}

export async function deletePalette(id: string) {
  const userId = await requireUserId();
  await prisma.colorPalette.deleteMany({ where: { id, userId } });
  revalidatePath("/create/color-plan");
}
