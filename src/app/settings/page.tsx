import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { listConnections } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "./profile-form";
import { ConnectionsList } from "./connections-list";

export const metadata = { title: "Settings" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { connected?: string; connect_error?: string };
}) {
  const userId = await requireUserId();
  const [user, connections] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    listConnections(userId),
  ]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <PageHeader title="Settings" description="Profile, connected platforms, and import preferences." />

      {searchParams.connected && (
        <div className="rounded-xl border border-prism-success/30 bg-prism-success/10 px-4 py-3 text-sm text-prism-success">
          ✓ {searchParams.connected.charAt(0).toUpperCase() + searchParams.connected.slice(1)} connected.
        </div>
      )}
      {searchParams.connect_error && (
        <div className="rounded-xl border border-prism-danger/30 bg-prism-danger/10 px-4 py-3 text-sm text-prism-danger">
          Couldn&apos;t connect: {searchParams.connect_error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>How you appear in your media kit and across the workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            initial={{
              name: user.name ?? "",
              handle: user.handle ?? "",
              bio: user.bio ?? "",
              image: user.image ?? "",
            }}
          />
        </CardContent>
      </Card>

      <Card id="connections">
        <CardHeader>
          <CardTitle>Connected platforms</CardTitle>
          <CardDescription>Pull live performance data from your TikTok and Instagram accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <ConnectionsList connections={connections} />
        </CardContent>
      </Card>
    </div>
  );
}
