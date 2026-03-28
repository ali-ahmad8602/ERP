"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export function useAuth({ required = true } = {}) {
  const { user, token, fetchMe, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (token && !user) {
      fetchMe();
    }
    if (required && !token && !loading) {
      router.push("/login");
    }
  }, [token, user, required, loading, fetchMe, router]);

  return { user, loading, isAdmin: ["super_admin", "org_admin"].includes(user?.orgRole ?? "") };
}
