import Link from "next/link";
import { PrismLogo } from "@/components/icons/PrismLogo";
import { SignUpForm } from "./sign-up-form";

export const metadata = { title: "Create your account" };

export default function SignUpPage() {
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
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Create your workspace
          </h1>
          <p className="mt-1 text-sm text-prism-text-muted">
            Build your creator system in one place.
          </p>
          <SignUpForm />
          <p className="mt-6 text-center text-sm text-prism-text-muted">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-prism-purple-bright hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
