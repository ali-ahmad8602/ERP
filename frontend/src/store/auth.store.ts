import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "@/lib/api";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login:    (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout:   () => void;
  fetchMe:  () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:    null,
      token:   null,
      loading: false,

      login: async (email, password) => {
        set({ loading: true });
        try {
          const { token, user } = await authApi.login(email, password);
          localStorage.setItem("token", token);
          set({ token, user });
        } finally {
          set({ loading: false });
        }
      },

      register: async (name, email, password) => {
        set({ loading: true });
        try {
          const { token, user } = await authApi.register(name, email, password);
          localStorage.setItem("token", token);
          set({ token, user });
        } finally {
          set({ loading: false });
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null });
      },

      fetchMe: async () => {
        try {
          const { user } = await authApi.me();
          set({ user });
        } catch {
          set({ user: null, token: null });
          localStorage.removeItem("token");
        }
      },
    }),
    {
      name: "im-auth",
      partialize: (s) => ({ token: s.token }),
    }
  )
);
