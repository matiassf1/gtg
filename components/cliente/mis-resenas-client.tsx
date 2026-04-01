"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Store, MessageSquare, MessageSquareReply, ChevronDown, ChevronUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Restaurant = { id: string; name: string; photos: string[]; category: string };
type Review = {
  id: string;
  rating: number;
  comment: string | null;
  response: string | null;
  createdAt: string;
  restaurant: Restaurant;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RATING_LABELS: Record<number, string> = {
  1: "Muy malo",
  2: "Malo",
  3: "Regular",
  4: "Bueno",
  5: "Excelente",
};

const RATING_COLORS: Record<number, string> = {
  1: "text-red-400",
  2: "text-orange-400",
  3: "text-amber-400",
  4: "text-lime-400",
  5: "text-emerald-400",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

// ─── StarRow ──────────────────────────────────────────────────────────────────

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              "size-4",
              i <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20"
            )}
          />
        ))}
      </div>
      <span className={cn("text-sm font-semibold", RATING_COLORS[rating])}>
        {RATING_LABELS[rating]}
      </span>
    </div>
  );
}

// ─── ReviewCard ───────────────────────────────────────────────────────────────

function ReviewCard({ r }: { r: Review }) {
  const [expanded, setExpanded] = useState(false);
  const photo = r.restaurant.photos?.[0];

  return (
    <div className="rounded-2xl border bg-card overflow-hidden transition-all hover:border-border/80">
      {/* Restaurant header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-muted/20">
        <Link href={`/cliente/restaurante/${r.restaurant.id}`} className="flex items-center gap-3 flex-1 min-w-0 group">
          <div className="relative size-10 rounded-lg overflow-hidden shrink-0 bg-muted">
            {photo ? (
              <Image src={photo} alt={r.restaurant.name} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Store className="size-5 text-muted-foreground/40" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {r.restaurant.name}
            </p>
            <p className="text-xs text-muted-foreground">{r.restaurant.category}</p>
          </div>
        </Link>

        <div className="shrink-0 text-right">
          <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
          {r.response && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary mt-0.5">
              <MessageSquareReply className="size-3" />
              Respondida
            </span>
          )}
        </div>
      </div>

      {/* Review body */}
      <div className="p-4 flex flex-col gap-3">
        <StarRow rating={r.rating} />

        {r.comment && (
          <div>
            <p className={cn("text-sm text-foreground/90 leading-relaxed", !expanded && "line-clamp-3")}>
              {r.comment}
            </p>
            {r.comment.length > 180 && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1 text-xs text-primary hover:underline underline-offset-2 mt-1.5"
              >
                {expanded ? <><ChevronUp className="size-3.5" /> Ver menos</> : <><ChevronDown className="size-3.5" /> Ver más</>}
              </button>
            )}
          </div>
        )}

        {!r.comment && (
          <p className="text-sm text-muted-foreground italic">Sin comentario escrito</p>
        )}

        {/* Restaurant response */}
        {r.response && (
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 mt-1">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquareReply className="size-4 text-primary shrink-0" />
              <span className="text-xs font-semibold text-primary">Respuesta del restaurante</span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{r.response}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sort + Filter bar ────────────────────────────────────────────────────────

type SortKey = "recent" | "best" | "worst";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Más recientes" },
  { value: "best",   label: "Mejor calificación" },
  { value: "worst",  label: "Peor calificación" },
];

// ─── Root ─────────────────────────────────────────────────────────────────────

export function MisResenasClient({ initialReviews }: { initialReviews: Review[] }) {
  const [sort, setSort] = useState<SortKey>("recent");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let r = initialReviews.filter(
      (v) =>
        !search ||
        v.restaurant.name.toLowerCase().includes(search.toLowerCase()) ||
        v.comment?.toLowerCase().includes(search.toLowerCase())
    );
    if (sort === "best")   r = [...r].sort((a, b) => b.rating - a.rating);
    if (sort === "worst")  r = [...r].sort((a, b) => a.rating - b.rating);
    if (sort === "recent") r = [...r].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return r;
  }, [initialReviews, sort, search]);

  // Stats
  const avg = initialReviews.length
    ? (initialReviews.reduce((s, r) => s + r.rating, 0) / initialReviews.length).toFixed(1)
    : null;
  const withResponse = initialReviews.filter((r) => r.response).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3 mb-1">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="size-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Mis reseñas</h1>
          </div>
          <p className="text-muted-foreground text-sm ml-[52px]">
            Opiniones que dejaste en los restaurantes
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {initialReviews.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="size-8 text-primary/60" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Todavía no escribiste reseñas</p>
              <p className="text-sm text-muted-foreground mt-1">
                Después de visitar un restaurante, puedes dejar tu opinión desde la página del local.
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
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="rounded-xl border bg-card p-4 text-center">
                <p className="text-2xl font-bold text-primary">{initialReviews.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Reseñas</p>
              </div>
              <div className="rounded-xl border bg-card p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <p className="text-2xl font-bold text-foreground">{avg}</p>
                  <Star className="size-4 fill-yellow-400 text-yellow-400 mb-0.5" />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Promedio</p>
              </div>
              <div className="rounded-xl border bg-card p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{withResponse}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Respondidas</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por restaurante o comentario..."
                  className="w-full h-11 pl-9 pr-3 rounded-lg bg-card border border-input text-base sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-11 rounded-lg border border-input bg-card px-3 text-base sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 shrink-0"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Results */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-3 text-center">
                <Search className="size-10 text-muted-foreground/30" />
                <p className="text-muted-foreground">Sin resultados para "{search}"</p>
                <Button variant="outline" size="sm" onClick={() => setSearch("")}>Limpiar</Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filtered.map((r) => <ReviewCard key={r.id} r={r} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
