import { AuthedSectionLayout } from "@/components/layout/AuthedSectionLayout";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthedSectionLayout>{children}</AuthedSectionLayout>;
}
