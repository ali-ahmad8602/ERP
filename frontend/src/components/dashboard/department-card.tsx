"use client";

import { cn } from "@/lib/utils";
import { Users, Clock } from "lucide-react";
import Link from "next/link";

type StatusType = "at-risk" | "active" | "on-track" | "planning";

interface DepartmentCardProps {
  emoji: string;
  name: string;
  slug: string;
  status: StatusType;
  progress: number;
  members: number;
  lastActivity?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  "at-risk": { label: "At Risk", className: "bg-[#EF4444]/10 text-[#EF4444]" },
  "active": { label: "Active", className: "bg-[#3B82F6]/10 text-[#3B82F6]" },
  "on-track": { label: "On Track", className: "bg-[#22C55E]/10 text-[#22C55E]" },
  "planning": { label: "Planning", className: "bg-[#71717A]/10 text-[#71717A]" },
};

const progressColors: Record<StatusType, string> = {
  "at-risk": "bg-[#EF4444]",
  "active": "bg-[#3B82F6]",
  "on-track": "bg-[#22C55E]",
  "planning": "bg-[#71717A]",
};

export function DepartmentCard({ emoji, name, slug, status, progress, members, lastActivity }: DepartmentCardProps) {
  const si = statusConfig[status];
  const pc = progressColors[status];

  return (
    <Link href={`/dept/${slug}`} className="no-underline">
      <div className="bg-[#0F0F11] border border-[#ffffff10] rounded-lg p-3 hover:border-[#ffffff18] transition-colors cursor-pointer">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[14px]">{emoji}</span>
            <span className="text-[13px] font-medium text-[#FAFAFA]">{name}</span>
          </div>
          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-[4px]", si.className)}>{si.label}</span>
        </div>

        <div className="h-[2px] bg-[#27272A] rounded-full mb-3">
          <div className={cn("h-full rounded-full transition-all", pc)} style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#52525B]">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" strokeWidth={1.5} />
            <span>{members}</span>
          </div>
          {lastActivity && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" strokeWidth={1.5} />
              <span>{lastActivity}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
