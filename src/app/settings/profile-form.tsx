"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "@/server/actions/profile";

export function ProfileForm({
  initial,
}: {
  initial: { name: string; handle: string; bio: string; image: string };
}) {
  const [form, setForm] = useState(initial);
  const [pending, start] = useTransition();

  function field<K extends keyof typeof form>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((s) => ({ ...s, [key]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      try {
        await updateProfile({
          name: form.name || null,
          handle: form.handle || null,
          bio: form.bio || null,
          image: form.image || null,
        });
        toast.success("Profile saved");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Couldn't save profile");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-prism-text-secondary">Display name</label>
        <Input value={form.name} onChange={field("name")} placeholder="Christian" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-prism-text-secondary">Handle</label>
        <Input value={form.handle} onChange={field("handle")} placeholder="@christian" />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label className="text-xs font-medium text-prism-text-secondary">Bio</label>
        <Textarea value={form.bio} onChange={field("bio")} placeholder="One sentence about your work." rows={3} />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label className="text-xs font-medium text-prism-text-secondary">Avatar URL</label>
        <Input value={form.image} onChange={field("image")} placeholder="https://…" />
      </div>
      <div className="sm:col-span-2 flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
