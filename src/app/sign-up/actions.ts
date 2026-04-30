"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

export async function signUp(input: { name: string; email: string; password: string }) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Please fill out every field with a valid email and 8+ char password." };
  }
  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { ok: false as const, error: "An account with this email already exists." };

  const hash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: hash,
    },
  });
  return { ok: true as const };
}
