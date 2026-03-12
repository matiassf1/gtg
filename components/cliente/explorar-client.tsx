"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Search, Star, SlidersHorizontal, X, ChevronLeft, ChevronRight,
  MapPin, Tag, Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RestaurantCard {
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

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

const PRICE_LABELS: Record<number, string> = { 1: "$", 2: "$$", 3: "$$$", 4: "$$$$" };
const PRICE_DESC:   Record<number, string> = {
  1: "Económico", 2: "Moderado", 3: "Elevado", 4: "Premium",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function priceLabel(n: number | null) {
  if (!n) return null;
  return PRICE_LABELS[n] ?? null;
}

function Stars({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              "w-3 h-3",
              i <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30"
            )}
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

// ─── Restaurant card ──────────────────────────────────────────────────────────

function RestCard({ r }: { r: RestaurantCard }) {
  const photo = r.photos[0];
  const price = priceLabel(r.priceRange);

  // Gradient placeholder colors per category (deterministic via hash)
  const hash = r.id.charCodeAt(0) + r.id.charCodeAt(1);
  const gradients = [
    "from-emerald-900/80 to-green-950",
    "from-slate-800 to-zinc-900",
    "from-stone-800 to-neutral-900",
    "from-zinc-800 to-slate-900",
  ];
  const gradient = gradients[hash % gradients.length];

  return (
    <Link
      href={`/cliente/restaurante/${r.id}`}
      className="group bg-card border border-border rounded-xl overflow-hidden flex flex-col
                 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(57,255,20,0.07)]
                 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-44 bg-muted overflow-hidden">
        {photo ? (
          <Image
            src={photo}
            alt={r.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <span className="text-4xl font-black text-white/20 select-none">
              {r.name[0]}
            </span>
          </div>
        )}

        {/* Promo badge */}
        {r.hasActivePromo && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
            <Tag className="w-2.5 h-2.5" />
            Promo
          </div>
        )}

        {/* Category pill */}
        <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
          {r.category}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-1">
            {r.name}
          </h3>
          {price && (
            <span className="text-xs font-semibold text-muted-foreground shrink-0 pt-0.5">
              {price}
            </span>
          )}
        </div>

        <Stars rating={r.averageRating} count={r.reviewCount} />

        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-auto">
          <MapPin className="w-3 h-3 shrink-0" />
          {r.city}
        </p>
      </div>
    </Link>
  );
}

// ─── Filter panel (shared sidebar + drawer) ───────────────────────────────────

interface FilterPanelProps {
  allCategories: string[];
  allCities: string[];
  search: string;
  setSearch: (v: string) => void;
  categories: string[];
  toggleCategory: (c: string) => void;
  prices: number[];
  togglePrice: (p: number) => void;
  minRating: number;
  setMinRating: (v: number) => void;
  city: string;
  setCity: (v: string) => void;
  onClear: () => void;
  hasFilters: boolean;
}

function FilterPanel({
  allCategories, allCities,
  search, setSearch,
  categories, toggleCategory,
  prices, togglePrice,
  minRating, setMinRating,
  city, setCity,
  onClear, hasFilters,
}: FilterPanelProps) {
  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Buscar
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nombre del restaurante..."
            className="w-full h-9 pl-8 pr-3 rounded-lg bg-background border border-input text-sm
                       placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Categoría
        </label>
        <div className="flex flex-wrap gap-1.5">
          {allCategories.map((c) => (
            <button
              key={c}
              onClick={() => toggleCategory(c)}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                categories.includes(c)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Rango de precio
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[1, 2, 3, 4].map((p) => (
            <button
              key={p}
              onClick={() => togglePrice(p)}
              title={PRICE_DESC[p]}
              className={cn(
                "h-9 rounded-lg text-xs font-bold border transition-all",
                prices.includes(p)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {PRICE_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Min rating */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Valoración mínima
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setMinRating(minRating === n ? 0 : n)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "w-5 h-5 transition-colors",
                  n <= minRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground/30 hover:text-yellow-400/50"
                )}
              />
            </button>
          ))}
          {minRating > 0 && (
            <span className="text-xs text-muted-foreground ml-1">o más</span>
          )}
        </div>
      </div>

      {/* City */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Ciudad / Zona
        </label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
        >
          <option value="">Todas las ciudades</option>
          {allCities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Clear */}
      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-1.5 text-muted-foreground"
          onClick={onClear}
        >
          <X className="w-3.5 h-3.5" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  page, total, onChange,
}: {
  page: number; total: number; onChange: (p: number) => void;
}) {
  if (total <= 1) return null;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 py-8">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-lg border border-border text-muted-foreground disabled:opacity-30
                   hover:border-primary/40 hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="w-9 text-center text-muted-foreground text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={cn(
              "w-9 h-9 rounded-lg text-sm font-medium border transition-colors",
              page === p
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === total}
        className="p-2 rounded-lg border border-border text-muted-foreground disabled:opacity-30
                   hover:border-primary/40 hover:text-foreground transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  restaurants: RestaurantCard[];
  initialSearch: string;
}

export function ExplorarClient({ restaurants, initialSearch }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch]         = useState(initialSearch);
  const [categories, setCategories] = useState<string[]>([]);
  const [prices, setPrices]         = useState<number[]>([]);
  const [minRating, setMinRating]   = useState(0);
  const [city, setCity]             = useState("");
  const [page, setPage]             = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Sync URL ?q= param
  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    setSearch(q);
  }, [searchParams]);

  // Derived lists
  const allCategories = useMemo(
    () => [...new Set(restaurants.map((r) => r.category))].sort(),
    [restaurants]
  );
  const allCities = useMemo(
    () => [...new Set(restaurants.map((r) => r.city))].sort(),
    [restaurants]
  );

  const toggleCategory = useCallback(
    (c: string) =>
      setCategories((prev) =>
        prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
      ),
    []
  );

  const togglePrice = useCallback(
    (p: number) =>
      setPrices((prev) =>
        prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
      ),
    []
  );

  const hasFilters =
    search !== "" || categories.length > 0 || prices.length > 0 ||
    minRating > 0 || city !== "";

  function clearFilters() {
    setSearch("");
    setCategories([]);
    setPrices([]);
    setMinRating(0);
    setCity("");
    router.replace("/cliente/explorar");
  }

  // Filter + paginate
  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      if (search && !r.name.toLowerCase().includes(search.toLowerCase()) &&
          !r.category.toLowerCase().includes(search.toLowerCase())) return false;
      if (categories.length && !categories.includes(r.category)) return false;
      if (prices.length && r.priceRange !== null && !prices.includes(r.priceRange!)) return false;
      if (minRating && r.averageRating < minRating) return false;
      if (city && r.city !== city) return false;
      return true;
    });
  }, [restaurants, search, categories, prices, minRating, city]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page on filter change
  useEffect(() => setPage(1), [search, categories, prices, minRating, city]);

  const filterProps = {
    allCategories, allCities,
    search, setSearch,
    categories, toggleCategory,
    prices, togglePrice,
    minRating, setMinRating,
    city, setCity,
    onClear: clearFilters,
    hasFilters,
  };

  return (
    <div className="flex gap-6 py-6 min-h-[calc(100vh-3.5rem)]">

      {/* ── Sidebar — desktop ─────────────────────────────────────────── */}
      <aside className="hidden lg:block w-60 shrink-0">
        <div className="sticky top-[calc(3.5rem+1.5rem)] bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-primary" />
              Filtros
            </h2>
          </div>
          <FilterPanel {...filterProps} />
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar restaurantes..."
              className="w-full h-9 pl-8 pr-3 rounded-lg bg-card border border-input text-sm
                         placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className={cn(
              "flex items-center gap-1.5 h-9 px-3 rounded-lg border text-sm font-medium transition-colors shrink-0",
              hasFilters
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtros
            {hasFilters && (
              <span className="bg-primary-foreground/20 text-primary-foreground text-xs rounded-full px-1.5">
                {[search, ...categories, ...prices.map(String), minRating > 0 ? "★" : "", city].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {filtered.length === 0 ? "Sin resultados" : (
              <><span className="font-semibold text-foreground">{filtered.length}</span> restaurante{filtered.length !== 1 ? "s" : ""}</>
            )}
            {hasFilters && " con esos filtros"}
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-primary hover:underline underline-offset-2"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Grid */}
        {paginated.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <Search className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-semibold text-foreground mb-1">No encontramos restaurantes</p>
            <p className="text-sm text-muted-foreground">
              {hasFilters
                ? "Probá cambiando los filtros de búsqueda"
                : "Pronto habrá restaurantes disponibles en tu zona"}
            </p>
            {hasFilters && (
              <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                Quitar filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginated.map((r) => <RestCard key={r.id} r={r} />)}
          </div>
        )}

        {/* Pagination */}
        <Pagination page={page} total={totalPages} onChange={setPage} />
      </div>

      {/* ── Filter drawer — mobile ────────────────────────────────────── */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Panel */}
          <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card border-t border-border rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-foreground flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                Filtros
              </h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterPanel {...filterProps} />
            <Button className="w-full mt-5" onClick={() => setDrawerOpen(false)}>
              Ver {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
