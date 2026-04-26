"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: string; positive: boolean };
  sparklineData?: number[];
}

function generateSparkline(data: number[]) {
  if (!data || data.length < 2) return "";
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 60, h = 16;
  const step = w / (data.length - 1);
  return data.map((v, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - ((v - min) / range) * h}`).join(" ");
}

export function KPICard({ icon: Icon, label, value, subtitle, trend, sparklineData }: KPICardProps) {
  return (
    <div className="bg-[#0F0F11] border border-[#ffffff15] rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-[#52525B]" strokeWidth={1.5} />
          <span className="text-[11px] uppercase tracking-wide text-[#52525B] font-medium">{label}</span>
        </div>
        {sparklineData && (
          <svg width="60" height="16" className="opacity-40">
            <path
              d={generateSparkline(sparklineData)}
              fill="none"
              stroke={trend?.positive !== false ? "#22C55E" : "#EF4444"}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <div className="text-[24px] font-semibold text-[#FAFAFA] leading-tight">{value}</div>
      <div className="flex items-center gap-2 mt-1">
        {trend && (
          <span className={cn("text-[11px] font-medium", trend.positive ? "text-[#22C55E]" : "text-[#EF4444]")}>
            {trend.positive ? "↑" : "↓"} {trend.value}
          </span>
        )}
        {subtitle && <span className="text-[11px] text-[#52525B]">{subtitle}</span>}
      </div>
    </div>
  );
}
