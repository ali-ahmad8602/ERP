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
    <div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 28, height: 28, border: "2px solid #1A1A1A", borderTopColor: "#0454FC", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );
}
