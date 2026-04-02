import { create } from 'zustand';
import { setToken, removeToken, getToken } from '@/lib/auth';
import type { AuthUser } from '@/types';

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,

  hydrate: () => {
    const token = getToken();
    if (token) {
      // Reconstrói o user a partir do cookie existente
      set({ user: { username: 'admin', token } });
    }
  },

  login: async (username, password) => {
    set({ isLoading: true });
    try {
      // Chama a API Route do Next.js que valida credenciais
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        set({ isLoading: false });
        return false;
      }

      const { token } = await res.json();
      setToken(token);
      set({ user: { username, token }, isLoading: false });
      return true;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  logout: () => {
    removeToken();
    set({ user: null });
    window.location.href = '/login';
  },
}));
