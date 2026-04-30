"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

const ideaInput = z.object({
  title: z.string().trim().min(1).max(140),
  description: z.string().trim().max(1000).optional().nullable(),
  status: z.enum(["SPARK", "DRAFTED", "READY", "FILMED", "POSTED"]).default("SPARK"),
  categoryTags: z.string().trim().max(200).optional().nullable(),
});

export async function createIdea(input: z.infer<typeof ideaInput>) {
  const userId = await requireUserId();
  const data = ideaInput.parse(input);
  const max = await prisma.idea.aggregate({
    where: { userId, status: data.status },
    _max: { position: true },
  });
  await prisma.idea.create({
    data: { ...data, userId, position: (max._max.position ?? 0) + 1 },
  });
  revalidatePath("/create/ideas");
}

export async function updateIdea(id: string, input: Partial<z.infer<typeof ideaInput>>) {
  const userId = await requireUserId();
  const partial = ideaInput.partial().parse(input);
  await prisma.idea.updateMany({ where: { id, userId }, data: partial });
  revalidatePath("/create/ideas");
}

export async function moveIdea(id: string, status: z.infer<typeof ideaInput>["status"], position: number) {
  const userId = await requireUserId();
  // Verify ownership
  const existing = await prisma.idea.findFirst({ where: { id, userId } });
  if (!existing) return;

  // Move the card and re-pack positions in the affected column(s) atomically
  await prisma.$transaction(async (tx) => {
    // 1. Pull all other cards already in the target column, sort by current position.
    const targetSiblings = await tx.idea.findMany({
      where: { userId, status, NOT: { id } },
      orderBy: { position: "asc" },
    });
    // 2. Insert the moved card at the requested index, clamped to bounds.
    const idx = Math.max(0, Math.min(position, targetSiblings.length));
    targetSiblings.splice(idx, 0, { ...existing, status, position: idx });
    // 3. Re-pack 0..N
    await Promise.all(
      targetSiblings.map((card, newPos) =>
        tx.idea.update({
          where: { id: card.id },
          data: { position: newPos, status: card.id === id ? status : card.status },
        }),
      ),
    );
    // 4. If the card moved between columns, also re-pack its old column.
    if (existing.status !== status) {
      const sourceSiblings = await tx.idea.findMany({
        where: { userId, status: existing.status },
        orderBy: { position: "asc" },
      });
      await Promise.all(
        sourceSiblings.map((card, newPos) =>
          tx.idea.update({ where: { id: card.id }, data: { position: newPos } }),
        ),
      );
    }
  });

  revalidatePath("/create/ideas");
}

export async function deleteIdea(id: string) {
  const userId = await requireUserId();
  await prisma.idea.deleteMany({ where: { id, userId } });
  revalidatePath("/create/ideas");
}
