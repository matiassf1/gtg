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
import { LogOut, User, Settings, ChevronDown } from "lucide-react";
import Link from "next/link";
import { NotificationBell } from "@/components/shared/notification-bell";

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

  return (
    <header className="h-14 md:h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 shrink-0">

      {/* Restaurant name */}
      <div className="min-w-0">
        <h1 className="font-bold text-foreground truncate max-w-[160px] sm:max-w-xs text-sm md:text-base">{restaurantName}</h1>
        <p className="text-xs text-muted-foreground hidden sm:block">Panel de gestión</p>
      </div>

      <div className="flex items-center gap-2">

        {/* Notification bell */}
        <NotificationBell variant="empresa" />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-11 px-2">
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
