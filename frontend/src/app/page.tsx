"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function Home() {
  const router = useRouter();
  const { token, user, fetchMe } = useAuthStore();

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }
    if (!user) { fetchMe(); return; }
    router.replace("/dashboard");
  }, [token, user, fetchMe, router]);

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-border-subtle border-t-primary rounded-full animate-spin" />
    </div>
  );
}
