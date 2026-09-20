"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { markNotificationRead, markAllNotificationsRead } from "@/app/dashboard/notifications-actions";

type Notification = {
  id: string;
  type: string;
  message: string;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export function NotificationBell({ profileId, initialNotifications }: { profileId: string; initialNotifications: Notification[] }) {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  useEffect(() => {
    const channel = supabase
      .channel(`notifications:${profileId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `profile_id=eq.${profileId}` },
        (payload) => {
          setNotifications((current) => [payload.new as Notification, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, supabase]);

  async function handleItemClick(notification: Notification) {
    if (!notification.read_at) {
      setNotifications((current) =>
        current.map((n) => (n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      await markNotificationRead(notification.id);
    }
    setOpen(false);
  }

  async function handleMarkAllRead() {
    setNotifications((current) => current.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    await markAllNotificationsRead();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <p className="font-semibold">Notifications</p>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover">
                  <Check size={14} /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-6 text-center text-sm text-slate-500">No notifications yet.</p>
              ) : (
                notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.link || "/dashboard"}
                    onClick={() => handleItemClick(n)}
                    className={"block border-b border-slate-50 p-4 text-sm hover:bg-slate-50 " + (!n.read_at ? "bg-primary-light/50" : "")}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read_at && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
                      <div className="min-w-0 flex-1">
                        <p className={!n.read_at ? "font-semibold text-slate-900" : "text-slate-600"}>{n.message}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(n.created_at))}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}