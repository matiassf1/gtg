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
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/empresa/dashboard",     label: "Dashboard",     icon: LayoutDashboard },
  { href: "/empresa/perfil",        label: "Mi Perfil",     icon: User },
  { href: "/empresa/menu",          label: "Menú",          icon: UtensilsCrossed },
  { href: "/empresa/reservas",      label: "Reservas",      icon: CalendarDays },
  { href: "/empresa/promociones",   label: "Promociones",   icon: Tag },
  { href: "/empresa/resenas",       label: "Reseñas",       icon: Star },
  { href: "/empresa/estadisticas",  label: "Estadísticas",  icon: BarChart3 },
  { href: "/empresa/configuracion", label: "Configuración", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) setCollapsed(saved === "true");
  }, []);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  }

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen bg-card border-r border-border transition-all duration-300 shrink-0",
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

      {/* Collapse button */}
      <button
        onClick={toggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
