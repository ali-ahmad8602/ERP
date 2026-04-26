"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AddDeptModal } from "@/components/dept/AddDeptModal";
import { useAuth } from "@/hooks/useAuth";
import { useDeptStore } from "@/store/dept.store";
import { useNotificationStore } from "@/store/notification.store";
import { useAuthStore } from "@/store/auth.store";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth({ required: true });
  const { token } = useAuthStore();
  const { departments, fetchDepts } = useDeptStore();
  const { connectSocket, disconnectSocket } = useNotificationStore();
  const [addDeptOpen, setAddDeptOpen] = useState(false);

  useEffect(() => {
    if (user) fetchDepts();
  }, [user, fetchDepts]);

  useEffect(() => {
    if (user && token) {
      connectSocket(token);
      return () => disconnectSocket();
    }
  }, [user, token, connectSocket, disconnectSocket]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#09090B]">
      <Sidebar
        departments={departments}
        userOrgRole={user?.orgRole ?? "user"}
        onAddDept={() => setAddDeptOpen(true)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {addDeptOpen && (
        <AddDeptModal onClose={() => setAddDeptOpen(false)} />
      )}
    </div>
  );
}
