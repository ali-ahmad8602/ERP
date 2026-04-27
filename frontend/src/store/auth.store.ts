import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "@/lib/api";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,

      login: async (email: string, password: string) => {
        set({ loading: true });
        try {
          const { token, user } = await authApi.login(email, password);
          localStorage.setItem("token", token);
          set({ token, user, loading: false });
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ loading: true });
        try {
          await authApi.register(name, email, password);
          set({ loading: false });
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null });
      },

      fetchMe: async () => {
        set({ loading: true });
        try {
          const { user } = await authApi.me();
          set({ user, loading: false });
        } catch {
          localStorage.removeItem("token");
          set({ user: null, token: null, loading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ token: state.token }),
    }
  )
);
