'use client';
import { useEffect } from 'react';
import { LogOut, Sun, Moon, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export function Topbar({ title }: { title: string }) {
  const { user, logout, hydrate } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => { hydrate(); }, [hydrate]);

  const handleRefresh = () => {
    queryClient.invalidateQueries();
    toast.success('Dados atualizados');
  };

  const toggleTheme = () => {
    document.documentElement.classList.toggle('light');
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="h-16 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] flex items-center justify-between px-6">
      <h1 className="text-base font-semibold text-[hsl(var(--foreground))]">{title}</h1>

      <div className="flex items-center gap-2">
        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          title="Atualizar dados"
        >
          <RefreshCw size={15} />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          title="Alternar tema"
        >
          <Sun size={15} className="hidden dark:block" />
          <Moon size={15} className="block dark:hidden" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-[hsl(var(--border))] mx-1" />

        {/* Admin info */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <span className="text-xs font-medium text-blue-400">
              {user?.username?.charAt(0).toUpperCase() ?? 'A'}
            </span>
          </div>
          <span className="text-sm text-[hsl(var(--foreground))]">{user?.username ?? 'Admin'}</span>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
        >
          <LogOut size={13} />
          Sair
        </button>
      </div>
    </header>
  );
}
