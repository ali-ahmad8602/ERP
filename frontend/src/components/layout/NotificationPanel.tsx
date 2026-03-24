"use client";
import { useRouter } from "next/navigation";
import { useNotificationStore } from "@/store/notification.store";
import {
  UserPlus, MessageSquare, CheckCircle2, XCircle, Clock, ArrowRightLeft, Users, Shield,
} from "lucide-react";
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
    <div style={{
      position: "absolute", top: "calc(100% + 8px)", right: 0, width: 380,
      background: "#0C0C0C", border: "1px solid #1E1E1E", borderRadius: 14,
      boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
      zIndex: 200, overflow: "hidden",
      animation: "fadeUp 0.15s cubic-bezier(0.16,1,0.3,1)",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px", borderBottom: "1px solid #1A1A1A",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#E0E0E0" }}>Notifications</span>
          {unreadCount > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: "#FF4444",
              background: "rgba(255,68,68,0.12)", padding: "2px 7px", borderRadius: 10,
            }}>
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead()}
            style={{
              fontSize: 11, color: "#0454FC", background: "none", border: "none",
              cursor: "pointer", fontWeight: 500,
            }}
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ maxHeight: 420, overflow: "auto" }}>
        {notifications.length === 0 && (
          <div style={{ padding: "40px 16px", textAlign: "center", color: "#444", fontSize: 13 }}>
            You&apos;re all caught up!
          </div>
        )}

        {groups.map(group => (
          <div key={group.label}>
            <div style={{ padding: "10px 16px 4px", fontSize: 10, fontWeight: 700, color: "#3A3A3A", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {group.label}
            </div>
            {group.items.map(n => {
              const config = TYPE_CONFIG[n.type] || { icon: null, color: "#555" };
              return (
                <button
                  key={n._id}
                  onClick={() => handleClick(n)}
                  style={{
                    width: "100%", display: "flex", gap: 10, padding: "10px 16px",
                    background: "none", border: "none", cursor: "pointer", textAlign: "left",
                    borderLeft: n.isRead ? "3px solid transparent" : `3px solid ${config.color}`,
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#111111"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {/* Icon */}
                  <div style={{
                    width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                    background: `${config.color}14`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: config.color,
                  }}>
                    {config.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: n.isRead ? "#666" : "#D0D0D0", fontWeight: n.isRead ? 400 : 500, lineHeight: 1.4 }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: 11, color: "#555", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {n.message}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 10, color: "#444" }}>{formatTimeAgo(n.createdAt)}</span>
                      {n.sender && (
                        <span style={{ fontSize: 10, color: "#555" }}>by {n.sender.name}</span>
                      )}
                    </div>
                  </div>

                  {/* Unread dot */}
                  {!n.isRead && (
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: config.color, flexShrink: 0, marginTop: 6 }} />
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
