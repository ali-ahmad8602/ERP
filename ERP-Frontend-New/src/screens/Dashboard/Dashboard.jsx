import React from 'react';
import { Card } from '../../components/ui/Card';
import { Activity, Clock, FileCheck, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

const KPI = ({ label, value, icon: Icon, color }) => (
  <Card className="p-6">
    <div className="flex justify-between items-start mb-4">
      <div className="text-[9.5px] uppercase tracking-[0.1em] text-[#888888] font-bold">{label}</div>
      <div className={`p-2 rounded-md ${color} bg-white/5`}>
        <Icon size={16} />
      </div>
    </div>
    <div className="text-3xl font-heading font-bold text-[#F3F3F3]">{value}</div>
  </Card>
);

export const Dashboard = () => {
  const { dashboardMetrics, departments } = useAppStore();

  if (!dashboardMetrics) return null;

  // mapped from getters
  const kpis = [
    { label: "Total Tasks", value: dashboardMetrics.kpis[0].value, icon: Activity, color: "text-[var(--color-primary)]" },
    { label: "Overdue", value: dashboardMetrics.kpis[1].value, icon: Clock, color: "text-[var(--color-danger)]" },
    { label: "Pending Approvals", value: dashboardMetrics.kpis[2].value, icon: FileCheck, color: "text-[var(--color-warning)]" },
    { label: "Compliance", value: dashboardMetrics.kpis[3].value, icon: CheckCircle2, color: "text-[var(--color-accent)]" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-heading font-bold mb-1 tracking-tight">Organization Overview</h1>
        <p className="text-sm text-[#888888]">Real-time metrics across all departments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map(k => <KPI key={k.label} {...k} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-[9.5px] uppercase tracking-[0.1em] text-[#888888] font-bold mb-4">Department Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map(dept => (
              <Link to={`/departments/${dept.id}`} key={dept.id}>
                <Card hoverable className="p-5 h-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-semibold">{dept.name}</h3>
                    <span className="text-xs text-[#888]">{dept.members} Members</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#888]">Task Progress</span>
                      <span className="text-[#F3F3F3]">{dept.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: `${dept.progress}%` }} />
                    </div>
                  </div>
                  {dept.overdue > 0 && (
                    <div className="mt-4 text-[11px] text-[var(--color-danger)] flex items-center gap-1.5 bg-[#FF4444]/10 w-fit px-2 py-1 border border-[#FF4444]/20 rounded-md">
                      <Clock size={12} /> {dept.overdue} Overdue items
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-[9.5px] uppercase tracking-[0.1em] text-[#888888] font-bold mb-4">Activity Stream</h2>
          <Card className="p-0 border-0 h-[400px] overflow-y-auto">
            {/* mapped from GET /api/analytics/activity */}
            <div className="divide-y divide-white/5">
              {dashboardMetrics.activity.map(item => (
                <div key={item.id} className="p-4 hover:bg-white/5 transition-colors">
                  <p className="text-sm"><span className="font-semibold text-[var(--color-primary)]">{item.user}</span> {item.text}</p>
                  <span className="text-[10px] text-[#888]">{item.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
