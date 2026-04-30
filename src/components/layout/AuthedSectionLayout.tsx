import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/layout/AppShell";

/**
 * Wraps a top-level authenticated route section with AppShell.
 * Used by tiktok/, instagram/, create/, brand/, and settings/ section layouts.
 *
 * Middleware already redirects unauthenticated users to /sign-in, but we
 * double-check here so a deployment misconfig can't bypass auth.
 */
export async function AuthedSectionLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  return <AppShell user={session.user}>{children}</AppShell>;
}
