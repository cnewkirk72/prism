import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 });

  const { platform } = (await req.json()) as { platform?: "TIKTOK" | "INSTAGRAM" };
  if (!platform) return NextResponse.json({ ok: false }, { status: 400 });

  await prisma.platformConnection.deleteMany({
    where: { userId: session.user.id, platform },
  });
  return NextResponse.json({ ok: true });
}
