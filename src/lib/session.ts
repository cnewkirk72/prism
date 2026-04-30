import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Server-side helper to get the current user's id, redirecting to sign-in if absent.
 * Use at the top of every server component / server action that needs auth.
 */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  return session.user.id;
}

export async function getUser() {
  const session = await auth();
  return session?.user ?? null;
}
