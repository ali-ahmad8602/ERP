"use client";

import { isToday, isYesterday, format } from "date-fns";
import type { ActivityEntry } from "@/types";

const ACTIONS: Record<string, string> = {
  card_created: "created", card_edited: "edited", card_moved: "moved",
  card_archived: "archived", comment_added: "commented on",
  card_approved: "approved", card_rejected: "rejected",
  board_created: "created", board_updated: "updated",
  member_added: "added member to", member_removed: "removed member from",
};

function relTime(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "now"; if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h`;
  const dy = Math.floor(h / 24); return dy < 7 ? `${dy}d` : format(new Date(d), "MMM d");
}

function dayLabel(d: string) {
  const dt = new Date(d);
  if (isToday(dt)) return "Today";
  if (isYesterday(dt)) return "Yesterday";
  return format(dt, "MMM d");
}

function initials(name: string) {
  const parts = name.split(" ");
  return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();
}

interface ActivityFeedProps {
  activities: ActivityEntry[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  // Group by day
  const groups: { label: string; items: ActivityEntry[] }[] = [];
  let currentLabel = "";

  for (const a of activities) {
    const label = dayLabel(a.createdAt);
    if (label !== currentLabel) {
      currentLabel = label;
      groups.push({ label, items: [] });
    }
    groups[groups.length - 1].items.push(a);
  }

  return (
    <div className="bg-[#0F0F11] border border-[#ffffff10] rounded-lg overflow-hidden">
      <div className="px-3 py-2.5 border-b border-[#ffffff08]">
        <h3 className="text-[13px] font-medium text-[#FAFAFA]">Activity</h3>
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        {activities.length === 0 && (
          <div className="px-3 py-8 text-center text-[12px] text-[#52525B]">No activity yet</div>
        )}

        {groups.map(group => (
          <div key={group.label}>
            <div className="px-3 py-1.5 bg-[#18181B]/50">
              <span className="text-[10px] uppercase tracking-wide text-[#52525B] font-medium">{group.label}</span>
            </div>

            {group.items.map(item => (
              <div key={item._id} className="px-3 py-2 border-b border-[#ffffff06] hover:bg-[#18181B]/30 transition-colors">
                <div className="flex items-start gap-2.5">
                  <div className="w-[18px] h-[18px] rounded-full bg-[#18181B] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[8px] font-medium text-[#71717A]">{initials(item.user.name)}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#FAFAFA] leading-snug">
                      <span className="font-medium">{item.user.name}</span>{" "}
                      <span className="text-[#71717A]">{ACTIONS[item.action] || item.action}</span>{" "}
                      <span className="font-medium">{item.entityTitle}</span>
                    </p>
                  </div>

                  <span className="text-[11px] text-[#3F3F46] flex-shrink-0">{relTime(item.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
