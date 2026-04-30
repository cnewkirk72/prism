import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

type SessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
};

export function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header user={user} />
        <main className="flex-1 overflow-x-hidden px-6 py-6 lg:px-8 lg:py-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
