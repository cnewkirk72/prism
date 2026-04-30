import Link from "next/link";
import { Suspense } from "react";
import { PrismLogo } from "@/components/icons/PrismLogo";
import { SignInForm } from "./sign-in-form";

export const metadata = { title: "Sign in" };

export default function SignInPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string; verify?: string };
}) {
  const callbackUrl = searchParams.callbackUrl ?? "/tiktok/overview";
  const error = searchParams.error;
  const verify = searchParams.verify;

  return (
    <div className="min-h-screen grid place-items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-10">
          <PrismLogo size={32} />
          <span className="font-display text-2xl font-semibold tracking-tight prism-gradient-text">
            Prism
          </span>
        </div>

        <div className="prism-card p-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-prism-text-muted">
            Sign in to your creator workspace.
          </p>

          {error && (
            <div className="mt-5 rounded-lg border border-prism-danger/30 bg-prism-danger/10 px-3 py-2.5 text-sm text-prism-danger">
              {errorMessage(error)}
            </div>
          )}
          {verify && (
            <div className="mt-5 rounded-lg border border-prism-info/30 bg-[hsl(188_86%_43%/0.08)] px-3 py-2.5 text-sm text-prism-info">
              Check your inbox for a sign-in link.
            </div>
          )}

          <Suspense fallback={null}>
            <SignInForm callbackUrl={callbackUrl} />
          </Suspense>

          <p className="mt-6 text-center text-sm text-prism-text-muted">
            New to Prism?{" "}
            <Link href="/sign-up" className="text-prism-purple-bright hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function errorMessage(code: string) {
  switch (code) {
    case "CredentialsSignin":
      return "That email and password didn't match. Try again.";
    case "OAuthAccountNotLinked":
      return "This email is already registered with a different sign-in method.";
    case "EmailSignin":
      return "Couldn't send the sign-in email. Check your SMTP setup.";
    default:
      return "Something went wrong signing you in. Please try again.";
  }
}
