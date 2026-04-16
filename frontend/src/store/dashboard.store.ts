import { create } from "zustand";
import { analyticsApi } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import type { OrgOverview, DeptStats, ActivityEntry } from "@/types";

interface DashboardState {
  overview:    OrgOverview | null;
  deptStats:   DeptStats[];
  activities:  ActivityEntry[];
  loading:     boolean;
  error:       string | null;

  fetchOverview:   () => Promise<void>;
  fetchDeptStats:  () => Promise<void>;
  fetchActivity:   (limit?: number) => Promise<void>;
  fetchAll:        () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  overview:   null,
  deptStats:  [],
  activities: [],
  loading:    false,
  error:      null,

  fetchOverview: async () => {
    try {
      const overview = await analyticsApi.overview();
      set({ overview });
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : "Failed to fetch overview" });
    }
  },

  fetchDeptStats: async () => {
    try {
      const { departments } = await analyticsApi.departments();
      set({ deptStats: departments });
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : "Failed to fetch department stats" });
    }
  },

  fetchActivity: async (limit = 30) => {
    try {
      const { activities } = await analyticsApi.activity(limit);
      set({ activities });
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : "Failed to fetch activity" });
    }
  },

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const [overview, { departments }, { activities }] = await Promise.all([
        analyticsApi.overview(),
        analyticsApi.departments(),
        analyticsApi.activity(30),
      ]);
      set({ overview, deptStats: departments, activities });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch dashboard data";
      set({ error: msg });
      toast("error", msg);
    } finally {
      set({ loading: false });
    }
  },
}));
