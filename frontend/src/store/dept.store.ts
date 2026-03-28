import { create } from "zustand";
import { deptApi } from "@/lib/api";
import type { Department } from "@/types";

interface DeptState {
  departments:  Department[];
  activeDept:   Department | null;
  loading:      boolean;
  error:        string | null;

  fetchDepts:       () => Promise<void>;
  fetchDeptBySlug:  (slug: string) => Promise<Department>;
  createDept:       (data: { name: string; description?: string; icon?: string; color?: string }) => Promise<Department>;
  updateDept:       (deptId: string, data: Partial<{ name: string; description: string; icon: string; color: string }>) => Promise<void>;
  deleteDept:       (deptId: string) => Promise<void>;
  addMember:        (deptId: string, userId: string, role: string) => Promise<void>;
  removeMember:     (deptId: string, userId: string) => Promise<void>;
}

export const useDeptStore = create<DeptState>((set) => ({
  departments: [],
  activeDept:  null,
  loading:     false,
  error:       null,

  fetchDepts: async () => {
    set({ loading: true, error: null });
    try {
      const { departments } = await deptApi.list();
      set({ departments });
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : "Failed to fetch departments" });
    } finally {
      set({ loading: false });
    }
  },

  fetchDeptBySlug: async (slug: string): Promise<Department> => {
    // First check if already in local state
    const existing = useDeptStore.getState().departments.find((d: Department) => d.slug === slug);
    if (existing) {
      set({ activeDept: existing });
      return existing;
    }
    const { department } = await deptApi.getBySlug(slug);
    set({ activeDept: department });
    return department;
  },

  createDept: async (data) => {
    const { department } = await deptApi.create(data);
    set(s => ({ departments: [...s.departments, department] }));
    return department;
  },

  updateDept: async (deptId, data) => {
    const { department } = await deptApi.update(deptId, data);
    set(s => ({
      departments: s.departments.map(d => d._id === deptId ? department : d)
    }));
  },

  deleteDept: async (deptId) => {
    await deptApi.delete(deptId);
    set(s => ({ departments: s.departments.filter(d => d._id !== deptId) }));
  },

  addMember: async (deptId, userId, role) => {
    await deptApi.addMember(deptId, userId, role);
    // Re-fetch to get updated member list
    const { departments } = await deptApi.list();
    set({ departments });
  },

  removeMember: async (deptId, userId) => {
    await deptApi.removeMember(deptId, userId);
    const { departments } = await deptApi.list();
    set({ departments });
  },
}));
