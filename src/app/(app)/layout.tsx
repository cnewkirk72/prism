// Reserved route group — pages live in /tiktok, /instagram, /create, /brand, /settings.
// AppShell is applied per-section via each section's layout.tsx so /sign-in and /sign-up
// can render without it. This file is a passthrough.
export default function ReservedAppGroupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
