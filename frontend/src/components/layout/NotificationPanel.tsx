"use client";
import { useRouter } from "next/navigation";
import { useNotificationStore } from "@/store/notification.store";
import {
  UserPlus, MessageSquare, CheckCircle2, XCircle, Clock, ArrowRightLeft, Users, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { Notification } from "@/types";

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  task_assigned:      { icon: <UserPlus size={12} />,        color: "#0454FC" },
  comment_added:      { icon: <MessageSquare size={12} />,   color: "#F5A623" },
  approval_requested: { icon: <Clock size={12} />,           color: "#A855F7" },
  card_approved:      { icon: <CheckCircle2 size={12} />,    color: "#22C55E" },
  card_rejected:      { icon: <XCircle size={12} />,         color: "#FF4444" },
  due_date_reminder:  { icon: <Clock size={12} />,           color: "#FF4444" },
  card_moved:         { icon: <ArrowRightLeft size={12} />,  color: "#0EA5E9" },
  member_added:       { icon: <Users size={12} />,           color: "#22C55E" },
  mentioned:          { icon: <Shield size={12} />,          color: "#F5A623" },
};

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function groupByDate(notifications: Notification[]) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { label: string; items: Notification[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Earlier", items: [] },
  ];

  for (const n of notifications) {
    const d = new Date(n.createdAt);
    if (d.toDateString() === today.toDateString()) groups[0].items.push(n);
    else if (d.toDateString() === yesterday.toDateString()) groups[1].items.push(n);
    else groups[2].items.push(n);
  }

  return groups.filter(g => g.items.length > 0);
}

interface Props {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: Props) {
  const router = useRouter();
  const { notifications, unreadCount, markRead, markAllRead } = useNotificationStore();

  const groups = groupByDate(notifications);

  const handleClick = async (n: Notification) => {
    if (!n.isRead) await markRead(n._id);

    // Navigate based on entity type
    if (n.entityType === 'card' && n.department?.slug) {
      router.push(`/dept/${n.department.slug}`);
    } else if (n.entityType === 'department' && n.department?.slug) {
      router.push(`/dept/${n.department.slug}`);
    }
    onClose();
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-[380px] bg-bg-surface border border-border rounded-card shadow-modal animate-fade-up overflow-hidden z-[200]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-text-primary">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-[10px] font-semibold text-danger bg-danger/10 px-1.5 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead()}
            className="text-primary hover:text-primary-light text-[12px] font-medium transition-colors bg-transparent border-none cursor-pointer"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Content */}
      <div className="max-h-[420px] overflow-auto">
        {notifications.length === 0 && (
          <div className="py-10 px-4 text-center text-text-muted text-[13px]">
            You&apos;re all caught up!
          </div>
        )}

        {groups.map(group => (
          <div key={group.label}>
            <SectionLabel className="px-4 pt-2.5 pb-1 mb-0">
              {group.label}
            </SectionLabel>
            {group.items.map(n => {
              const config = TYPE_CONFIG[n.type] || { icon: null, color: "#555" };
              return (
                <button
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className={cn(
                    "w-full flex gap-3 px-4 py-3 bg-transparent border-none cursor-pointer text-left",
                    "hover:bg-bg-elevated transition-colors",
                    !n.isRead && "border-l-2 border-primary",
                    n.isRead && "border-l-2 border-transparent"
                  )}
                >
                  {/* Icon */}
                  <div
                    className="w-7 h-7 rounded-[7px] shrink-0 flex items-center justify-center"
                    style={{
                      backgroundColor: `${config.color}14`,
                      color: config.color,
                    }}
                  >
                    {config.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={cn(
                        "text-[12px] leading-[1.4]",
                        n.isRead
                          ? "text-text-muted font-normal"
                          : "text-text-primary font-medium"
                      )}
                    >
                      {n.title}
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
                      {n.message}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-text-muted">{formatTimeAgo(n.createdAt)}</span>
                      {n.sender && (
                        <span className="flex items-center gap-1 text-[10px] text-text-secondary">
                          <Avatar name={n.sender.name} size="xs" />
                          {n.sender.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Unread dot */}
                  {!n.isRead && (
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                      style={{ backgroundColor: config.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
