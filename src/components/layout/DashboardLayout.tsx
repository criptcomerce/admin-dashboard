import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function DashboardLayout({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="flex h-screen bg-[hsl(var(--background))]">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-60 min-h-screen">
        <Topbar title={title} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
