"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, CalendarCheck, CalendarX, Star, Tag, Info } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationType =
  | "RESERVA_NUEVA"
  | "RESERVA_CONFIRMADA"
  | "RESERVA_RECHAZADA"
  | "NUEVA_RESENA"
  | "PROMOCION";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data: Record<string, unknown> | null;
  createdAt: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<NotificationType, { icon: React.ElementType; color: string; href: string }> = {
  RESERVA_NUEVA:      { icon: CalendarCheck, color: "text-primary",      href: "/empresa/reservas" },
  RESERVA_CONFIRMADA: { icon: CalendarCheck, color: "text-emerald-400",  href: "/cliente/reservas" },
  RESERVA_RECHAZADA:  { icon: CalendarX,     color: "text-destructive",  href: "/cliente/reservas" },
  NUEVA_RESENA:       { icon: Star,          color: "text-yellow-400",   href: "/empresa/resenas"  },
  PROMOCION:          { icon: Tag,           color: "text-primary",      href: "/empresa/promociones" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return "hace un momento";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return `hace ${Math.floor(diff / 86400)} día${Math.floor(diff / 86400) !== 1 ? "s" : ""}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface NotificationBellProps {
  variant?: "empresa" | "cliente";
}

export function NotificationBell({ variant = "cliente" }: NotificationBellProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch {
      // silently fail — non-critical UI
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Poll every 60s
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Refresh when dropdown opens
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  async function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
  }

  async function markAllAsRead() {
    setMarkingAll(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await fetch("/api/notifications/read-all", { method: "POST" });
    setMarkingAll(false);
  }

  function handleClick(n: Notification) {
    if (!n.read) markAsRead(n.id);
    const cfg = TYPE_CONFIG[n.type];
    setOpen(false);
    router.push(cfg.href);
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative shrink-0"
          aria-label="Notificaciones"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 rounded-full bg-primary text-[10px] font-bold text-black px-1 leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 max-h-[480px] flex flex-col p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border shrink-0">
          <DropdownMenuLabel className="p-0 font-semibold text-sm">
            Notificaciones
            {unreadCount > 0 && (
              <span className="ml-2 text-xs font-normal text-primary">{unreadCount} nueva{unreadCount !== 1 ? "s" : ""}</span>
            )}
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={markingAll}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <CheckCheck className="size-3.5" />
              Marcar todas
            </button>
          )}
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-4">
              <Bell className="size-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Sin notificaciones</p>
            </div>
          ) : (
            notifications.map((n) => {
              const cfg = TYPE_CONFIG[n.type] ?? { icon: Info, color: "text-muted-foreground", href: "/" };
              const Icon = cfg.icon;
              return (
                <DropdownMenuItem
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 px-3 py-3 cursor-pointer rounded-none border-b border-border/40 last:border-0 focus:bg-accent",
                    !n.read && "bg-primary/5"
                  )}
                  onClick={() => handleClick(n)}
                >
                  {/* Icon */}
                  <div className={cn("shrink-0 mt-0.5 size-8 rounded-full bg-muted flex items-center justify-center", cfg.color)}>
                    <Icon className="size-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm leading-snug line-clamp-1", !n.read ? "font-semibold text-foreground" : "font-normal text-foreground/80")}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="size-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 pt-0.5">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                </DropdownMenuItem>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
