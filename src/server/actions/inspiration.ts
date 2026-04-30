"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

const saveInput = z.object({
  sourceUrl: z.string().url(),
  platform: z.enum(["TIKTOK", "INSTAGRAM"]),
  thumbnailUrl: z.string().url(),
  note: z.string().trim().max(500).optional().nullable(),
  tagNames: z.array(z.string().trim().min(1).max(40)).max(8),
});

export async function saveInspiration(input: z.infer<typeof saveInput>) {
  const userId = await requireUserId();
  const data = saveInput.parse(input);

  // upsert tags
  const tags = await Promise.all(
    data.tagNames.map((name) =>
      prisma.inspirationTag.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  await prisma.inspiration.create({
    data: {
      userId,
      sourceUrl: data.sourceUrl,
      platform: data.platform,
      thumbnailUrl: data.thumbnailUrl,
      note: data.note ?? null,
      tags: { connect: tags.map((t) => ({ id: t.id })) },
    },
  });
  revalidatePath("/create/inspiration");
}

export async function deleteInspiration(id: string) {
  const userId = await requireUserId();
  await prisma.inspiration.deleteMany({ where: { id, userId } });
  revalidatePath("/create/inspiration");
}
