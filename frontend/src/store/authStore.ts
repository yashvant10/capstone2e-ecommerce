import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/client';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken) => {
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        set({ user, accessToken });
      },
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (e) {
          // ignore
        }
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, accessToken: null });
        window.location.href = '/login';
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.accessToken}`;
        }
      },
    }
  )
);
