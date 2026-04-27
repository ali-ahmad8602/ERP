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
      const [overviewRes, deptRes, activityRes] = await Promise.allSettled([
        analyticsApi.overview(),
        analyticsApi.departments(),
        analyticsApi.activity(30),
      ]);
      set({
        overview: overviewRes.status === "fulfilled" ? overviewRes.value : null,
        deptStats: deptRes.status === "fulfilled" ? (deptRes.value.departments ?? []) : [],
        activities: activityRes.status === "fulfilled" ? (activityRes.value.activities ?? []) : [],
        loading: false,
      });
      // If all failed, surface one error
      const allFailed = [overviewRes, deptRes, activityRes].every(r => r.status === "rejected");
      if (allFailed) {
        const firstErr = overviewRes.status === "rejected" ? overviewRes.reason : null;
        set({ error: firstErr?.message || "Failed to load dashboard data" });
      }
    } catch (err: any) {
      set({ error: err.message || "Failed to load dashboard data", loading: false });
    }
  },
}));
