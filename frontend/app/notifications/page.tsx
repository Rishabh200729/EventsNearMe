'use client';
import useSWR from "swr";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle, XCircle, RefreshCw, Trash2, Bell, ArrowRight, CheckCheck, Loader2 } from "lucide-react";

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(res => res.json());

const typeConfig: Record<string, { icon: any; color: string }> = {
  booking_confirmed: { icon: CheckCircle, color: 'text-green-400' },
  booking_cancelled: { icon: XCircle, color: 'text-red-400' },
  event_updated: { icon: RefreshCw, color: 'text-blue-400' },
  event_deleted: { icon: Trash2, color: 'text-red-400' },
  event_reminder: { icon: Bell, color: 'text-yellow-400' },
};

function NotificationCard({ notif, onMarkRead }: { notif: any; onMarkRead: (id: string) => void }) {
  const cfg = typeConfig[notif.type] || { icon: Bell, color: 'text-muted-foreground' };
  const Icon = cfg.icon;

  return (
    <div className={`glass-card p-5 transition-all duration-300 ${notif.read ? 'opacity-60' : 'border-l-4 border-l-primary'}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl bg-white/5 ${cfg.color} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold">{notif.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
            </div>
            {!notif.read && (
              <button
                onClick={() => onMarkRead(notif._id)}
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors shrink-0"
              >
                Mark read
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground/60 mt-2">
            {new Date(notif.createdAt).toLocaleDateString("en-US", {
              month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { data, error, isLoading, mutate } = useSWR('/api/notifications', fetcher, {
    refreshInterval: 30000,
  });
  const [markingAll, setMarkingAll] = useState(false);

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PUT', credentials: 'include' });
    mutate();
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    await fetch('/api/notifications/read-all', { method: 'PUT', credentials: 'include' });
    await mutate();
    setMarkingAll(false);
  };

  return (
    <div className="min-h-screen p-6 pt-24 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tighter premium-gradient bg-clip-text text-transparent">
            Notifications
          </h1>
          {data?.unreadCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
              {data.unreadCount} unread
            </span>
          )}
        </div>
        {data?.unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            disabled={markingAll}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5"
          >
            {markingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
            Mark all as read
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      )}

      {error && (
        <div className="glass-card text-center py-20">
          <p className="text-muted-foreground">Failed to load notifications</p>
        </div>
      )}

      {data && data.data.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <div className="p-4 rounded-full bg-primary/10 text-primary w-fit mx-auto">
            <Bell className="w-8 h-8" />
          </div>
          <p className="text-muted-foreground text-lg">No notifications yet</p>
          <p className="text-muted-foreground text-sm">Notifications about your bookings and events will appear here.</p>
          <Link href="/explore" className="premium-button inline-flex items-center gap-2 py-3 px-6">
            Browse Events
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {data && data.data.length > 0 && (
        <div className="space-y-3">
          {data.data.map((notif: any) => (
            <NotificationCard key={notif._id} notif={notif} onMarkRead={markAsRead} />
          ))}
        </div>
      )}
    </div>
  );
}
