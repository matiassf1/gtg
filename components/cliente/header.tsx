"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Search, Heart, User, LogOut, ChevronDown,
  CalendarDays, Gift, X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/cliente/explorar",   label: "Explorar",     icon: Search      },
  { href: "/cliente/reservas",   label: "Mis Reservas", icon: CalendarDays },
  { href: "/cliente/beneficios", label: "Beneficios",   icon: Gift        },
  { href: "/cliente/favoritos",  label: "Favoritos",    icon: Heart       },
];

interface ClienteHeaderProps {
  userName: string;
  userImage?: string | null;
}

export function ClienteHeader({ userName, userImage }: ClienteHeaderProps) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [query, setQuery]       = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef  = useRef<HTMLInputElement>(null);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/cliente/explorar?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
    }
  }

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  return (
    <header className="h-14 border-b border-border bg-card/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center gap-4">

        {/* Logo */}
        <Link href="/cliente/explorar" className="flex items-center gap-2 shrink-0">
          <Logo size="sm" />
          <span className="font-black text-sm text-primary tracking-wide hidden md:block">
            Club GTG
          </span>
        </Link>

        {/* Search bar — desktop */}
        <form
          onSubmit={handleSearch}
          className="hidden sm:flex flex-1 max-w-sm relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar restaurantes..."
            className="w-full h-8 pl-8 pr-3 rounded-full bg-background border border-input text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          />
        </form>

        {/* Nav links — desktop */}
        <nav className="hidden md:flex items-center gap-0.5 ml-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile: search icon */}
        <button
          className="sm:hidden ml-auto p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          onClick={() => setSearchOpen((o) => !o)}
        >
          {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
        </button>

        {/* Avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 rounded-full hover:bg-accent px-2 py-1 transition-colors shrink-0">
              <Avatar className="w-7 h-7">
                <AvatarImage src={userImage ?? undefined} />
                <AvatarFallback className="text-xs bg-primary/20 text-primary font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <p className="font-semibold text-sm truncate">{userName}</p>
              <p className="text-xs text-muted-foreground">Cliente</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/cliente/perfil" className="cursor-pointer">
                <User className="w-4 h-4 mr-2" /> Mi perfil
              </Link>
            </DropdownMenuItem>
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <DropdownMenuItem key={href} asChild className="md:hidden">
                <Link href={href} className="cursor-pointer">
                  <Icon className="w-4 h-4 mr-2" /> {label}
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile search bar — expandable */}
      {searchOpen && (
        <form
          onSubmit={handleSearch}
          className="sm:hidden border-t border-border px-4 py-2 bg-card"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar restaurantes..."
              className="w-full h-9 pl-8 pr-3 rounded-full bg-background border border-input text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </form>
      )}
    </header>
  );
}
