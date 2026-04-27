import { create } from "zustand";
import { analyticsApi } from "@/lib/api";
import type { OrgOverview, DeptStats, ActivityEntry } from "@/types";

interface DashboardState {
  overview: OrgOverview | null;
  deptStats: DeptStats[];
  activities: ActivityEntry[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  overview: null,
  deptStats: [],
  activities: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const [overviewRes, deptRes, activityRes] = await Promise.all([
        analyticsApi.overview(),
        analyticsApi.departments(),
        analyticsApi.activity(30),
      ]);
      set({
        overview: overviewRes,
        deptStats: deptRes.departments,
        activities: activityRes.activities,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message || "Failed to load dashboard data", loading: false });
    }
  },
}));
