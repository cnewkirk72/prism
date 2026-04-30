"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

const profileInput = z.object({
  name: z.string().trim().max(80).optional().nullable(),
  handle: z.string().trim().max(40).regex(/^@?[a-zA-Z0-9._]*$/, "Letters, numbers, dots, underscores").optional().nullable(),
  bio: z.string().trim().max(280).optional().nullable(),
  image: z.string().url().optional().nullable(),
});

export async function updateProfile(input: z.infer<typeof profileInput>) {
  const userId = await requireUserId();
  const data = profileInput.parse(input);
  if (data.handle && !data.handle.startsWith("@")) data.handle = `@${data.handle}`;
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name ?? undefined,
      handle: data.handle ?? undefined,
      bio: data.bio ?? undefined,
      image: data.image ?? undefined,
    },
  });
  revalidatePath("/settings");
  revalidatePath("/brand/media-kit");
}
