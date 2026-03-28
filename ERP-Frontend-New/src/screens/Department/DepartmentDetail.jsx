import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Settings, Plus, Users, LayoutGrid } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const DepartmentDetail = () => {
  const { id } = useParams();

  const { departments } = useAppStore();
  const dept = departments.find(d => d.id === id);

  if (!dept) return <div className="p-8">Department not found...</div>;

  // Enhance mock with defaults if members don't exist
  const members = dept.membersList || [
    { id: 1, name: "Alice K.", role: "Head", avatar: "" },
    { id: 2, name: "Bob M.", role: "Member", avatar: "" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center font-heading font-bold text-xl">
              EN
            </div>
            <h1 className="text-3xl font-heading font-bold tracking-tight">{dept.name}</h1>
          </div>
          <p className="text-sm text-[#888888]">{dept.description || 'Department workspace'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="gap-2"><Settings size={16} /> Manage</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-end mb-4 border-b border-[#1E1E1E] pb-2">
            <h2 className="text-[9.5px] uppercase tracking-[0.1em] text-[#888888] font-bold flex items-center gap-2">
              <LayoutGrid size={14} /> Active Boards
            </h2>
            <Button variant="ghost" size="sm" className="text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"><Plus size={14} className="mr-1" /> New Board</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dept.boards.map(b => (
              <Link to={`/boards/${b.id}`} key={b.id}>
                <Card hoverable className="p-6">
                  <h3 className="text-lg font-semibold text-[#F3F3F3] mb-4">{b.name}</h3>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#888]">{b.cards} Active Cards</span>
                    <span className="text-[var(--color-primary)] flex items-center gap-1 group-hover:translate-x-1 transition-transform">View <Plus size={14} className="rotate-45" /></span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end mb-4 border-b border-[#1E1E1E] pb-2">
            <h2 className="text-[9.5px] uppercase tracking-[0.1em] text-[#888888] font-bold flex items-center gap-2">
              <Users size={14} /> Team Members
            </h2>
            <Button variant="ghost" size="sm" className="text-[#888]">+</Button>
          </div>
          <Card className="p-0 border-0 overflow-hidden divide-y divide-[#1A1A1A]">
            {members.map(m => (
              <div key={m.id} className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar fallback={m.name} size="sm" />
                  <span className="text-sm text-[#F3F3F3]">{m.name}</span>
                </div>
                <span className="text-[10px] text-[#888] bg-[#0F0F0F] px-2 py-0.5 rounded">{m.role}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
};
