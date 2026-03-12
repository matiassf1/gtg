"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Tag, Heart, Search, Store } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FavRestaurant {
  id: string;
  name: string;
  category: string;
  city: string;
  address: string;
  photos: string[];
  priceRange: number | null;
  averageRating: number;
  reviewCount: number;
  hasActivePromo: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PRICE_LABELS: Record<number, string> = { 1: "$", 2: "$$", 3: "$$$", 4: "$$$$" };

const GRADIENTS = [
  "from-emerald-900/80 to-green-950",
  "from-slate-800 to-zinc-900",
  "from-stone-800 to-neutral-900",
  "from-zinc-800 to-slate-900",
];

function Stars({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn("w-3 h-3", i <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30")}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {rating > 0 ? rating.toFixed(1) : "—"}
        {count > 0 && <span className="ml-0.5">({count})</span>}
      </span>
    </div>
  );
}

// ─── FavCard ──────────────────────────────────────────────────────────────────

function FavCard({
  r,
  onRemove,
  removing,
}: {
  r: FavRestaurant;
  onRemove: (id: string) => void;
  removing: boolean;
}) {
  const photo = r.photos[0];
  const hash = r.id.charCodeAt(0) + r.id.charCodeAt(1);
  const gradient = GRADIENTS[hash % GRADIENTS.length];

  return (
    <div className={cn(
      "group bg-card border border-border rounded-xl overflow-hidden flex flex-col transition-all duration-300",
      removing ? "opacity-50 scale-95 pointer-events-none" : "hover:border-primary/30 hover:shadow-[0_0_20px_rgba(57,255,20,0.07)]"
    )}>
      {/* Image */}
      <Link href={`/cliente/restaurante/${r.id}`} className="relative h-44 bg-muted overflow-hidden block">
        {photo ? (
          <Image
            src={photo}
            alt={r.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <Store className="size-10 text-white/20" />
          </div>
        )}

        {r.hasActivePromo && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
            <Tag className="w-2.5 h-2.5" />
            Promo
          </div>
        )}

        <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
          {r.category}
        </div>
      </Link>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/cliente/restaurante/${r.id}`}>
            <h3 className="font-bold text-foreground leading-tight hover:text-primary transition-colors line-clamp-1">
              {r.name}
            </h3>
          </Link>
          {r.priceRange && (
            <span className="text-xs font-semibold text-muted-foreground shrink-0 pt-0.5">
              {PRICE_LABELS[r.priceRange]}
            </span>
          )}
        </div>

        <Stars rating={r.averageRating} count={r.reviewCount} />

        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-auto">
          <MapPin className="w-3 h-3 shrink-0" />
          {r.city}
        </p>

        {/* Remove button */}
        <Button
          size="sm"
          variant="outline"
          className="mt-2 gap-1.5 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40 w-full"
          onClick={() => onRemove(r.id)}
          disabled={removing}
        >
          <Heart className="size-3.5 fill-current text-destructive" />
          Quitar de favoritos
        </Button>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function FavoritosClient({ initialFavorites }: { initialFavorites: FavRestaurant[] }) {
  const [favorites, setFavorites] = useState(initialFavorites);
  const [removing, setRemoving] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      favorites.filter(
        (r) =>
          !search ||
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.category.toLowerCase().includes(search.toLowerCase()) ||
          r.city.toLowerCase().includes(search.toLowerCase())
      ),
    [favorites, search]
  );

  async function handleRemove(restaurantId: string) {
    setRemoving(restaurantId);
    try {
      const res = await fetch("/api/cliente/favoritos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId }),
      });
      if (!res.ok) return;
      // Optimistically remove after slight delay (for animation)
      setTimeout(() => {
        setFavorites((prev) => prev.filter((r) => r.id !== restaurantId));
        setRemoving(null);
      }, 300);
    } catch {
      setRemoving(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-1">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Heart className="size-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Mis favoritos</h1>
          </div>
          <p className="text-muted-foreground text-sm ml-[52px]">
            {favorites.length} restaurante{favorites.length !== 1 ? "s" : ""} guardado{favorites.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        {favorites.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="size-8 text-primary/60" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No tenés favoritos aún</p>
              <p className="text-sm text-muted-foreground mt-1">
                Al explorar restaurantes, tocá el corazón para guardarlos acá.
              </p>
            </div>
            <Link href="/cliente/explorar">
              <Button size="sm" className="bg-primary text-black hover:bg-primary/90 font-semibold">
                Explorar restaurantes
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Search bar */}
            {favorites.length > 3 && (
              <div className="relative mb-6 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar en favoritos..."
                  className="w-full h-11 pl-9 pr-3 rounded-lg bg-card border border-input text-base sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            )}

            {/* Results count */}
            {search && (
              <p className="text-sm text-muted-foreground mb-4">
                <span className="font-semibold text-foreground">{filtered.length}</span> resultado{filtered.length !== 1 ? "s" : ""}
              </p>
            )}

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3 text-center">
                <Search className="size-10 text-muted-foreground/30" />
                <p className="text-muted-foreground">No encontramos "{search}" en tus favoritos</p>
                <Button variant="outline" size="sm" onClick={() => setSearch("")}>Limpiar búsqueda</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((r) => (
                  <FavCard
                    key={r.id}
                    r={r}
                    onRemove={handleRemove}
                    removing={removing === r.id}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
