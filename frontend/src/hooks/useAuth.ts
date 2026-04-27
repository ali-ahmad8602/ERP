"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

interface UseAuthOptions {
  required?: boolean;
}

export function useAuth({ required = false }: UseAuthOptions = {}) {
  const router = useRouter();
  const { user, token, loading, fetchMe } = useAuthStore();

  useEffect(() => {
    if (token && !user && !loading) {
      fetchMe().catch(() => {
        // fetchMe already clears token on failure in the store;
        // no additional handling needed here.
      });
    }
  }, [token, user, loading, fetchMe]);

  useEffect(() => {
    if (required && !token && !loading) {
      router.replace("/login");
    }
  }, [required, token, loading, router]);

  const orgRole = user?.orgRole ?? "user";
  const isAdmin = orgRole === "admin" || orgRole === "super_admin" || orgRole === "org_admin";

  return { user, loading, isAdmin };
}
