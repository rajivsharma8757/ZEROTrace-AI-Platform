import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared";
import { useAppData } from "@/hooks/use-app-data";
import { api } from "@/lib/api";

export default function Notifications() {
  const { data, refresh, update } = useAppData();
  const [filterUnread, setFilterUnread] = useState(false);
  const [loading, setLoading] = useState(false);

  const visible = filterUnread
    ? data.notifications.filter((n) => !n.read && !n.isRead)
    : data.notifications;

  const unreadCount = data.notifications.filter((n) => !n.read && !n.isRead).length;

  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      await api.notifications.markAllRead();
      await refresh();
    } catch {
      update((d) => {
        d.notifications.forEach((n) => {
          n.read = true;
          n.isRead = true;
        });
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.notifications.markAsRead(id);
      await refresh();
    } catch {
      update((d) => {
        const found = d.notifications.find((n) => n.id === id);
        if (found) {
          found.read = true;
          found.isRead = true;
        }
      });
    }
  };

  return (
    <>
      <PageHeader
        title="Notifications & Operations Alerts"
        description="System events, sanitization job state changes, verification updates, and certificate notifications."
        action={
          unreadCount > 0 ? (
            <Button
              onClick={handleMarkAllRead}
              disabled={loading}
              variant="outline"
              className="border-slate-700 bg-slate-900/60 text-slate-200 hover:text-white"
            >
              <CheckCheck className="mr-2 h-4 w-4 text-cyan-300" /> Mark All as Read
            </Button>
          ) : undefined
        }
      />

      {/* Filter Tabs */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={!filterUnread ? "default" : "outline"}
            className={!filterUnread ? "bg-cyan-400 text-slate-950 font-semibold" : "border-slate-800 text-slate-400"}
            onClick={() => setFilterUnread(false)}
          >
            All Alerts ({data.notifications.length})
          </Button>
          <Button
            size="sm"
            variant={filterUnread ? "default" : "outline"}
            className={filterUnread ? "bg-cyan-400 text-slate-950 font-semibold" : "border-slate-800 text-slate-400"}
            onClick={() => setFilterUnread(true)}
          >
            Unread ({unreadCount})
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardContent className="divide-y divide-slate-800/80 p-0">
          {visible.map((n) => {
            const isUnread = !n.read && !n.isRead;
            const isAlert = n.type === "WARNING" || n.type === "ALERT";
            const isSuccess = n.type === "SUCCESS";

            return (
              <div
                key={n.id}
                className={`flex items-start justify-between gap-4 p-5 transition ${
                  isUnread ? "bg-cyan-500/5 hover:bg-cyan-500/10" : "hover:bg-slate-800/30"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`mt-0.5 rounded-lg p-2 ${
                      isAlert
                        ? "bg-rose-500/10 text-rose-400"
                        : isSuccess
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-cyan-500/10 text-cyan-400"
                    }`}
                  >
                    {isAlert ? (
                      <AlertTriangle size={18} />
                    ) : isSuccess ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <Bell size={18} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white text-sm">{n.title}</h3>
                      {isUnread && (
                        <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                      {n.body || n.message}
                    </p>
                    <span className="mt-2 block font-mono text-[11px] text-slate-500">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {isUnread && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMarkRead(n.id)}
                    className="shrink-0 text-xs text-slate-400 hover:text-white"
                  >
                    Mark read
                  </Button>
                )}
              </div>
            );
          })}

          {visible.length === 0 && (
            <div className="py-16 text-center text-sm text-slate-400">
              <Bell className="mx-auto mb-2 text-slate-600" size={32} />
              No notifications to display.
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
