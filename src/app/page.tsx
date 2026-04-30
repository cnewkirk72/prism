import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function RootIndex() {
  const session = await auth();
  redirect(session?.user ? "/tiktok/overview" : "/sign-in");
}
