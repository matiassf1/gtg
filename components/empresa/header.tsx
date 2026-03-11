"use client";

import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, LogOut, User, Settings, ChevronDown } from "lucide-react";
import Link from "next/link";

const MOCK_NOTIFICATIONS = [
  { id: 1, text: "Nueva reserva de María García", time: "hace 5 min", unread: true },
  { id: 2, text: "Reseña de 5 estrellas recibida", time: "hace 20 min", unread: true },
  { id: 3, text: "Promoción 'Almuerzo 2x1' vence mañana", time: "hace 1h", unread: false },
];

interface HeaderProps {
  restaurantName: string;
  userName: string;
  userImage?: string | null;
}

export function Header({ restaurantName, userName, userImage }: HeaderProps) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">

      {/* Restaurant name */}
      <div>
        <h1 className="font-bold text-foreground truncate max-w-xs">{restaurantName}</h1>
        <p className="text-xs text-muted-foreground">Panel de gestión</p>
      </div>

      <div className="flex items-center gap-3">

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notificaciones
              {unreadCount > 0 && (
                <span className="text-xs font-normal text-primary">{unreadCount} nuevas</span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {MOCK_NOTIFICATIONS.map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2.5">
                <div className="flex items-start gap-2 w-full">
                  {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />}
                  <span className={cn("text-sm", !n.unread && "ml-3.5", n.unread && "font-medium")}>{n.text}</span>
                </div>
                <span className="text-xs text-muted-foreground ml-3.5">{n.time}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center justify-center text-primary text-xs">
              Ver todas
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
              <Avatar className="w-7 h-7">
                <AvatarImage src={userImage ?? undefined} />
                <AvatarFallback className="text-xs bg-primary/20 text-primary font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium max-w-[120px] truncate hidden sm:block">
                {userName}
              </span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <p className="font-medium text-sm">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{restaurantName}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/empresa/perfil" className="cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                Mi perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/empresa/configuracion" className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

// cn necesario en este archivo
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
