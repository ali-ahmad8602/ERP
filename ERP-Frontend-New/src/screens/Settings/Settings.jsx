import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Label } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { Shield, UserPlus, Trash2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const Settings = () => {
  const { user } = useAppStore();
  const isAdmin = user?.role === 'Super Admin' || user?.role === 'Org Admin';

  // mapped to GET /api/users
  const [users] = useState([
    { id: 1, name: "Admin User", email: "admin@invoicemate.com", role: "Super Admin", status: "Active" },
    { id: 2, name: "Bob M.", email: "bob@invoicemate.com", role: "Org Admin", status: "Active" },
  ]);

  const [inviteEmail, setInviteEmail] = useState('');

  const handleInvite = (e) => {
    e.preventDefault();
    // mapped to POST /api/invites
    console.log('Sending invite to:', inviteEmail);
    setInviteEmail('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-heading font-bold mb-1 tracking-tight">Organization Settings</h1>
        <p className="text-sm text-[#888888]">Manage workspace access, members, and security.</p>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-2">
            <h2 className="text-lg font-semibold text-[#F3F3F3] flex items-center gap-2"><UserPlus size={18} className="text-[var(--color-primary)]"/> Invite Members</h2>
            <p className="text-sm text-[#888]">Send an email link to instantly onboard new staff directly to respective departments.</p>
          </div>
          <Card className="md:col-span-2 p-6">
            <form onSubmit={handleInvite} className="flex gap-4 items-end">
              <div className="flex-1">
                <Label>Email Address</Label>
                <Input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@company.com" required />
              </div>
              <div className="flex-1">
                <Label>Assign Org Role</Label>
                <select className="flex h-10 w-full rounded-[8px] bg-[#1A1A1A] border-b-[2px] border-transparent px-4 py-2 text-sm text-[#F3F3F3] focus-visible:outline-none focus:border-[var(--color-secondary)]">
                  <option value="user">User</option>
                  <option value="org_admin">Org Admin</option>
                  <option value="top_management">Top Management</option>
                </select>
              </div>
              <Button type="submit" className="shrink-0 mb-[2px]">Send Invite</Button>
            </form>
          </Card>
        </div>
      )}

      {isAdmin && <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#2A2A2A] to-transparent my-8" />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <h2 className="text-lg font-semibold text-[#F3F3F3] flex items-center gap-2"><Shield size={18} className="text-[var(--color-primary)]"/> Active Directory</h2>
          <p className="text-sm text-[#888]">Overview of all registered users. Soft-deactivate accounts here to retain audit trails.</p>
        </div>
        <Card className="md:col-span-2 p-0 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#1A1A1A]/50 text-[#888] text-[9.5px] uppercase tracking-[0.1em]">
                <th className="font-bold py-3 px-4">User</th>
                <th className="font-bold py-3 px-4">Role</th>
                <th className="font-bold py-3 px-4">Status</th>
                {isAdmin && <th className="font-bold py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar fallback={u.name} size="sm" />
                      <div>
                        <div className="font-semibold text-[#F3F3F3]">{u.name}</div>
                        <div className="text-[11px] text-[#888]">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#888]">{u.role}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-secondary)]"><span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)] block"/> {u.status}</span>
                  </td>
                  {isAdmin && (
                    <td className="py-3 px-4 text-right">
                      <button className="text-[#888] hover:text-[#FF4444] transition-colors p-1" title="Deactivate">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};
