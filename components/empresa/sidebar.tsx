"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  UtensilsCrossed,
  CalendarDays,
  Tag,
  Star,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/empresa/dashboard",     label: "Dashboard",    icon: LayoutDashboard },
  { href: "/empresa/perfil",        label: "Perfil",       icon: User },
  { href: "/empresa/menu",          label: "Menú",         icon: UtensilsCrossed },
  { href: "/empresa/reservas",      label: "Reservas",     icon: CalendarDays },
  { href: "/empresa/promociones",   label: "Promos",       icon: Tag },
  { href: "/empresa/resenas",       label: "Reseñas",      icon: Star },
  { href: "/empresa/estadisticas",  label: "Estadísticas", icon: BarChart3 },
  { href: "/empresa/configuracion", label: "Configuración", icon: Settings },
];

// 5 items in bottom bar, rest in "Más" drawer
const BOTTOM_ITEMS = NAV_ITEMS.slice(0, 5);
const DRAWER_ITEMS = NAV_ITEMS.slice(5);

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) setCollapsed(saved === "true");
  }, []);

  // Close "más" drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  }

  return (
    <>
      {/* ── Desktop sidebar (md+) ──────────────────────────────────────────── */}
      <aside
        className={cn(
          "relative hidden md:flex flex-col h-screen bg-card border-r border-border transition-all duration-300 shrink-0",
          collapsed ? "w-16" : "w-56"
        )}
      >
        {/* Logo */}
        <div className={cn("flex items-center h-16 px-3 border-b border-border", collapsed ? "justify-center" : "gap-3")}>
          <Logo size="sm" />
          {!collapsed && (
            <span className="font-black text-sm text-primary tracking-wide truncate">
              Club GTG
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  "hover:bg-accent hover:text-accent-foreground",
                  active
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={toggle}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all z-10"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* ── Mobile bottom nav (<md) ────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur border-t border-border safe-area-bottom">
        <div className="flex items-stretch h-14">
          {BOTTOM_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5 shrink-0", active && "drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]")} />
                <span className="truncate max-w-[52px] text-center leading-none">{label}</span>
              </Link>
            );
          })}

          {/* "Más" button */}
          <button
            onClick={() => setDrawerOpen((v) => !v)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
              drawerOpen ? "text-primary" : "text-muted-foreground"
            )}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span>Más</span>
          </button>
        </div>
      </nav>

      {/* ── Mobile "más" sheet ─────────────────────────────────────────────── */}
      {drawerOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/60"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="md:hidden fixed bottom-14 left-0 right-0 z-50 bg-card border-t border-border rounded-t-2xl animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <p className="text-sm font-semibold text-foreground">Más opciones</p>
              <button
                onClick={() => setDrawerOpen(false)}
                className="size-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 p-4">
              {DRAWER_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all",
                      active
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/20 hover:text-foreground"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-medium leading-tight">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
