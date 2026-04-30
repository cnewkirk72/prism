"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp } from "./actions";

export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await signUp({ name, email, password });
    if (!res.ok) {
      setError(res.error ?? "Couldn't create your account.");
      setSubmitting(false);
      return;
    }
    const signed = await signIn("credentials", {
      email, password, redirect: false, callbackUrl: "/tiktok/overview",
    });
    if (signed?.url) window.location.href = signed.url;
    else { setError("Account created — try signing in."); setSubmitting(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-prism-text-secondary">Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Christian" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-prism-text-secondary">Email</label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-prism-text-secondary">Password</label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} placeholder="At least 8 characters" />
      </div>
      {error && (
        <div className="rounded-lg border border-prism-danger/30 bg-prism-danger/10 px-3 py-2 text-sm text-prism-danger">
          {error}
        </div>
      )}
      <Button type="submit" disabled={submitting} className="mt-2">
        {submitting ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}
