import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Search, Bell, Settings, LayoutGrid, Users, CheckCircle } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';
import { Card } from '../../components/ui/Card';
import { useClickOutside } from '../../hooks/useClickOutside';

const Sidebar = () => {
  const { departments } = useAppStore(); // dynamically mapped user depts
  
  return (
    <aside className="w-[228px] fixed inset-y-0 left-0 bg-[#0F0F0F] border-r border-[#1E1E1E] flex flex-col pt-[56px]">
      <div className="p-4 flex-1 overflow-y-auto">
        <p className="text-[9.5px] uppercase tracking-[0.1em] text-[#888888] font-bold mb-3 px-2">Navigation</p>
        <nav className="space-y-1">
          <NavLink to="/" className={({ isActive }) => cn("flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm font-medium transition-colors", isActive ? "bg-[#151515] text-[#F3F3F3] border-l-2 border-[var(--color-primary)]" : "text-[#888888] hover:bg-[#1A1A1A] hover:text-[#F3F3F3]")}>
            <LayoutGrid size={16} /> Dashboard
          </NavLink>
          {departments?.map(dept => (
            <NavLink key={dept.id} to={`/departments/${dept.id}`} className={({ isActive }) => cn("flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm font-medium transition-colors", isActive ? "bg-[#151515] text-[#F3F3F3] border-l-2 border-[var(--color-primary)]" : "text-[#888888] hover:bg-[#1A1A1A] hover:text-[#F3F3F3]")}>
              <Users size={16} /> {dept.name}
            </NavLink>
          ))}
          <NavLink to="/settings" className={({ isActive }) => cn("flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm font-medium transition-colors", isActive ? "bg-[#151515] text-[#F3F3F3] border-l-2 border-[var(--color-primary)]" : "text-[#888888] hover:bg-[#1A1A1A] hover:text-[#F3F3F3]")}>
            <Settings size={16} /> Settings
          </NavLink>
        </nav>
      </div>
    </aside>
  );
};

const NotificationTray = ({ isOpen, onClose }) => {
  const { notifications } = useAppStore();
  const trayRef = useClickOutside(onClose);
  
  if (!isOpen) return null;
  
  return (
    <Card ref={trayRef} className="absolute top-14 right-4 w-80 max-h-[80vh] overflow-y-auto p-4 z-50">
      <h3 className="text-sm font-bold tracking-tight mb-4">Notifications</h3>
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <p className="text-xs text-[#888]">No new notifications.</p>
        ) : (
          notifications.map((n, i) => (
            <div key={i} className="flex gap-3 text-sm p-3 rounded-md bg-[#1c1b1b] border border-white/5">
              <CheckCircle size={16} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[#F3F3F3]">{n.message}</p>
                <span className="text-[10px] text-[#888]">{n.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

const Topbar = () => {
  const { user } = useAppStore(); // mapped to GET /api/users/me
  const [showNotifs, setShowNotifs] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 h-[56px] bg-[#0F0F0F]/80 backdrop-blur-xl border-b border-[#1E1E1E] z-40 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        {/* Cmd+K placeholder styling */}
        <div className="flex items-center gap-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-[8px] px-3 py-1.5 w-64 cursor-text transition-colors hover:border-[#333]">
          <Search size={14} className="text-[#888]" />
          <span className="text-xs text-[#555] flex-1">Search (Cmd+K)</span>
        </div>
      </div>
      <div className="flex items-center gap-4 relative">
        <button className="relative w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#1A1A1A]" onClick={() => setShowNotifs(!showNotifs)}>
          <Bell size={16} className="text-[#888]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-primary)] rounded-full"></span>
        </button>
        <NotificationTray isOpen={showNotifs} onClose={() => setShowNotifs(false)} />
        <Avatar src={user?.avatar} fallback={user?.name || "AD"} size="md" />
      </div>
    </header>
  );
};

export const AppShell = () => {
  const { fetchInitialData, isInitializing } = useAppStore();

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center bg-[#050505] text-[#888]">Loading workspace...</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] text-[#F3F3F3] flex flex-col font-sans">
      <Topbar />
      <Sidebar />
      <main className="pl-[228px] pt-[56px] min-h-screen flex flex-col">
        <div className="flex-1 p-8 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
