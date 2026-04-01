"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Star, MapPin, Phone, Clock, ChevronLeft, ChevronRight,
  Heart, CalendarDays, Tag, Loader2, MessageSquare,
  UtensilsCrossed, Map, ChevronDown, Check,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type DaySchedule  = { open: string; close: string; closed: boolean };
type OpeningHours = Record<string, DaySchedule>;

export interface MenuItemData {
  id: string; name: string; description: string | null;
  price: number; image: string | null; category: string; available: boolean;
}

export interface ReviewData {
  id: string; rating: number; comment: string | null; response: string | null;
  createdAt: string;
  client: { user: { name: string | null; email: string; image: string | null } };
}

export interface PromoData {
  id: string; title: string; type: string;
  discountPercent: number | null; validUntil: string;
}

export interface RestaurantDetailData {
  id: string; name: string; description: string | null;
  category: string; address: string; city: string;
  phone: string | null; photos: string[]; priceRange: number | null;
  averageRating: number; openingHours: unknown;
  menuItems: MenuItemData[];
  reviews: ReviewData[];
  activePromos: PromoData[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRICE_LABELS: Record<number, string> = { 1: "€", 2: "€€", 3: "€€€", 4: "€€€€" };

const DIAS = [
  { key: "lunes",     label: "Lun" },
  { key: "martes",    label: "Mar" },
  { key: "miercoles", label: "Mié" },
  { key: "jueves",    label: "Jue" },
  { key: "viernes",   label: "Vie" },
  { key: "sabado",    label: "Sáb" },
  { key: "domingo",   label: "Dom" },
];

const TYPE_LABEL: Record<string, string> = {
  DESCUENTO: "Descuento", DOS_X_UNO: "2×1",
  MENU_ESPECIAL: "Menú especial", OTRO: "Otro",
};

const TIME_SLOTS = Array.from({ length: 23 }, (_, i) => {
  const base = 12 * 2 + i;
  const h = Math.floor(base / 2);
  const m = base % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
}).filter((t) => parseInt(t) <= 22);

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(iso));
}

function fmtUntil(iso: string) {
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(new Date(iso));
}

const todayStr = new Date().toISOString().split("T")[0];

// ─── Stars ────────────────────────────────────────────────────────────────────

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "w-5 h-5" : size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn(sz, i <= Math.round(rating)
          ? "fill-yellow-400 text-yellow-400"
          : "fill-muted text-muted")} />
      ))}
    </div>
  );
}

// ─── Photo carousel ───────────────────────────────────────────────────────────

function PhotoCarousel({ photos, name }: { photos: string[]; name: string }) {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx((i) => (i + 1) % photos.length);

  if (photos.length === 0) {
    return (
      <div className="relative h-72 md:h-96 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
        <span className="text-8xl font-black text-white/10 select-none">{name[0]}</span>
      </div>
    );
  }

  return (
    <div className="relative h-72 md:h-96 overflow-hidden bg-black">
      <Image
        src={photos[idx]}
        alt={`${name} foto ${idx + 1}`}
        fill
        className="object-cover transition-opacity duration-300"
        priority={idx === 0}
      />
      {/* Gradient overlay bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Prev / Next */}
      {photos.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur
                       flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur
                       flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={cn(
                  "rounded-full transition-all",
                  i === idx ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"
                )}
              />
            ))}
          </div>
          {/* Counter */}
          <span className="absolute top-3 right-3 text-xs text-white bg-black/50 backdrop-blur px-2 py-0.5 rounded-full">
            {idx + 1} / {photos.length}
          </span>
        </>
      )}
    </div>
  );
}

// ─── Menu tab ─────────────────────────────────────────────────────────────────

function MenuTab({ items }: { items: MenuItemData[] }) {
  const grouped = items.reduce<Record<string, MenuItemData[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort();

  if (categories.length === 0) {
    return (
      <div className="py-12 text-center">
        <UtensilsCrossed className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-muted-foreground">Este restaurante todavía no publicó su menú</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {categories.map((cat) => (
        <div key={cat}>
          <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="flex-1 h-px bg-primary/20" />
            {cat}
            <span className="flex-1 h-px bg-primary/20" />
          </h3>
          <div className="space-y-3">
            {grouped[cat].map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex gap-3 bg-card border border-border rounded-xl p-3 transition-colors",
                  !item.available && "opacity-50"
                )}
              >
                {item.image && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("font-semibold text-sm text-foreground", !item.available && "line-through")}>
                      {item.name}
                    </p>
                    <span className="text-sm font-bold text-primary shrink-0">
                      {item.price.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                  )}
                  {!item.available && (
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded mt-1 inline-block">
                      No disponible
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Reviews tab ──────────────────────────────────────────────────────────────

type Sort = "recent" | "best" | "worst";

interface LeaveReviewModalProps {
  open: boolean;
  onClose: () => void;
  restaurantId: string;
  onSuccess: (review: ReviewData) => void;
}

function LeaveReviewModal({ open, onClose, restaurantId, onSuccess }: LeaveReviewModalProps) {
  const { toast } = useToast();
  const [rating, setRating]   = useState(0);
  const [hover, setHover]     = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving]   = useState(false);

  async function submit() {
    if (rating === 0) { toast({ title: "Elige una valoración", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/cliente/resenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, rating, comment }),
      });
      if (res.status === 409) { toast({ title: "Ya dejaste una reseña para este restaurante", variant: "destructive" }); return; }
      if (!res.ok) throw new Error();
      const data = await res.json();
      onSuccess(data);
      toast({ title: "¡Reseña publicada!" });
      onClose();
    } catch {
      toast({ title: "Error al publicar la reseña", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Dejá tu reseña</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">¿Cómo fue tu experiencia?</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(n)}
                  className="p-0.5 transition-transform hover:scale-125"
                >
                  <Star className={cn("w-8 h-8 transition-colors",
                    n <= (hover || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground/30"
                  )} />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-xs text-muted-foreground">
                {["", "Muy malo", "Malo", "Regular", "Bueno", "Excelente"][rating]}
              </p>
            )}
          </div>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Cuenta tu experiencia (opcional)..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={submit} disabled={saving || rating === 0} className="gap-2">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Publicar reseña
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReviewsTab({
  initialReviews, restaurantId, hasReviewed, canReview,
}: {
  initialReviews: ReviewData[];
  restaurantId: string;
  hasReviewed: boolean;
  canReview: boolean;
}) {
  const [reviews, setReviews]     = useState(initialReviews);
  const [sort, setSort]           = useState<Sort>("recent");
  const [modalOpen, setModalOpen] = useState(false);
  const [reviewed, setReviewed]   = useState(hasReviewed);

  const sorted = [...reviews].sort((a, b) => {
    if (sort === "recent") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sort === "best")   return b.rating - a.rating;
    return a.rating - b.rating;
  });

  function handleNewReview(r: ReviewData) {
    setReviews((prev) => [r, ...prev]);
    setReviewed(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="h-8 rounded-md border border-input bg-background px-3 text-sm focus:outline-none"
          >
            <option value="recent">Más recientes</option>
            <option value="best">Mejor valoradas</option>
            <option value="worst">Peor valoradas</option>
          </select>
          <span className="text-xs text-muted-foreground">{reviews.length} reseña{reviews.length !== 1 ? "s" : ""}</span>
        </div>
        {canReview && !reviewed && (
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setModalOpen(true)}>
            <MessageSquare className="w-3.5 h-3.5" /> Dejar reseña
          </Button>
        )}
        {reviewed && (
          <span className="text-xs text-primary flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Ya dejaste una reseña
          </span>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="py-10 text-center">
          <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">Todavía no hay reseñas. ¡Sé el primero!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((r) => {
            const name = r.client.user.name ?? r.client.user.email;
            const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
            return (
              <div key={r.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarImage src={r.client.user.image ?? undefined} />
                    <AvatarFallback className="text-xs bg-primary/20 text-primary font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{name}</p>
                      <span className="text-xs text-muted-foreground">{fmtDate(r.createdAt)}</span>
                    </div>
                    <Stars rating={r.rating} />
                  </div>
                </div>
                {r.comment && <p className="text-sm text-foreground/90 leading-relaxed">{r.comment}</p>}
                {r.response && (
                  <div className="border-l-2 border-primary/40 pl-3 space-y-0.5">
                    <p className="text-xs font-semibold text-primary">Respuesta del restaurante</p>
                    <p className="text-sm text-muted-foreground">{r.response}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <LeaveReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        restaurantId={restaurantId}
        onSuccess={handleNewReview}
      />
    </div>
  );
}

// ─── Map tab ──────────────────────────────────────────────────────────────────

function MapTab({ address, city }: { address: string; city: string }) {
  const query = encodeURIComponent(`${address}, ${city}, Argentina`);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="w-4 h-4 text-primary shrink-0" />
        {address}, {city}
      </div>
      <div className="rounded-xl overflow-hidden border border-border h-80 bg-muted">
        <iframe
          title="Ubicación del restaurante"
          width="100%"
          height="100%"
          loading="lazy"
          src={`https://maps.google.com/maps?q=${query}&output=embed&hl=es`}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}

// ─── Reserva modal ────────────────────────────────────────────────────────────

interface ReservaModalProps {
  open: boolean;
  onClose: () => void;
  restaurantId: string;
  restaurantName: string;
}

function ReservaModal({ open, onClose, restaurantId, restaurantName }: ReservaModalProps) {
  const { toast } = useToast();
  const [form, setForm] = useState({ date: "", time: TIME_SLOTS[0], guests: "2", notes: "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  function setF(k: keyof typeof form, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function submit() {
    if (!form.date) { toast({ title: "Elige una fecha", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/cliente/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setSuccess(true);
    } catch (e: unknown) {
      toast({ title: e instanceof Error ? e.message : "Error al crear la reserva", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    setSuccess(false);
    setForm({ date: "", time: TIME_SLOTS[0], guests: "2", notes: "" });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{success ? "¡Reserva enviada!" : `Reservar en ${restaurantName}`}</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-6 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center">
              <Check className="w-7 h-7 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Tu solicitud fue enviada al restaurante. Te confirmarán a la brevedad.
            </p>
            <Button className="mt-2 w-full" onClick={handleClose}>Cerrar</Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-2">
              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Fecha <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={form.date}
                    onChange={(e) => setF("date", e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Hora</label>
                  <select
                    value={form.time}
                    onChange={(e) => setF("time", e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Guests */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Personas</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setF("guests", String(Math.max(1, Number(form.guests) - 1)))}
                    className="w-9 h-9 rounded-md border border-input bg-background text-lg font-bold flex items-center justify-center hover:bg-accent transition-colors"
                  >−</button>
                  <span className="w-10 text-center font-semibold text-foreground">{form.guests}</span>
                  <button
                    type="button"
                    onClick={() => setF("guests", String(Math.min(20, Number(form.guests) + 1)))}
                    className="w-9 h-9 rounded-md border border-input bg-background text-lg font-bold flex items-center justify-center hover:bg-accent transition-colors"
                  >+</button>
                  <span className="text-xs text-muted-foreground ml-1">persona{Number(form.guests) !== 1 ? "s" : ""}</span>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Notas opcionales</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setF("notes", e.target.value)}
                  placeholder="Alergias, celebración especial, preferencia de mesa..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleClose} disabled={saving}>Cancelar</Button>
              <Button onClick={submit} disabled={saving} className="gap-2">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirmar reserva
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  restaurant: RestaurantDetailData;
  isFavorited: boolean;
  canReserve: boolean;
}

function Sidebar({ restaurant, isFavorited: initial, canReserve }: SidebarProps) {
  const { toast }     = useToast();
  const [fav, setFav] = useState(initial);
  const [favLoading, setFavLoading] = useState(false);
  const [reservaOpen, setReservaOpen] = useState(false);

  const promo = restaurant.activePromos[0] ?? null;

  async function toggleFav() {
    setFavLoading(true);
    try {
      const res = await fetch("/api/cliente/favoritos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId: restaurant.id }),
      });
      if (!res.ok) throw new Error();
      const { favorited } = await res.json();
      setFav(favorited);
      toast({ title: favorited ? "Guardado en favoritos" : "Eliminado de favoritos" });
    } catch {
      toast({ title: "Error al actualizar favoritos", variant: "destructive" });
    } finally {
      setFavLoading(false);
    }
  }

  return (
    <>
      <div className="space-y-3">
        {/* Reserve button */}
        {canReserve ? (
          <Button className="w-full h-12 text-base font-bold gap-2" onClick={() => setReservaOpen(true)}>
            <CalendarDays className="w-5 h-5" />
            Reservar mesa
          </Button>
        ) : (
          <Button className="w-full h-12 text-base font-bold gap-2" disabled>
            <CalendarDays className="w-5 h-5" />
            Reservar mesa
          </Button>
        )}

        {/* Favorite button */}
        <button
          onClick={toggleFav}
          disabled={favLoading}
          className={cn(
            "w-full h-10 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-all",
            fav
              ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
              : "border-border text-muted-foreground hover:border-red-500/30 hover:text-red-400"
          )}
        >
          <Heart className={cn("w-4 h-4", fav && "fill-red-400")} />
          {fav ? "Guardado en favoritos" : "Guardar en favoritos"}
        </button>

        {/* Active promo */}
        {promo && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-primary text-xs font-bold">
              <Tag className="w-3.5 h-3.5" />
              PROMOCIÓN ACTIVA
            </div>
            <p className="font-semibold text-foreground text-sm">{promo.title}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                {TYPE_LABEL[promo.type] ?? promo.type}
                {promo.discountPercent ? ` ${promo.discountPercent}%` : ""}
              </span>
              <span>hasta {fmtUntil(promo.validUntil)}</span>
            </div>
          </div>
        )}

        {/* Quick info */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3 text-sm">
          {restaurant.phone && (
            <a href={`tel:${restaurant.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <Phone className="w-4 h-4 text-primary shrink-0" />
              {restaurant.phone}
            </a>
          )}
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>{restaurant.address}, {restaurant.city}</span>
          </div>
          {restaurant.openingHours && (
            <HoursAccordion hours={restaurant.openingHours as OpeningHours} />
          )}
        </div>
      </div>

      <ReservaModal
        open={reservaOpen}
        onClose={() => setReservaOpen(false)}
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
      />
    </>
  );
}

function HoursAccordion({ hours }: { hours: OpeningHours }) {
  const [open, setOpen] = useState(false);
  const todayKey = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"][new Date().getDay()];
  const today = hours[todayKey];

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary shrink-0" />
          {today
            ? today.closed
              ? <span className="text-red-400">Cerrado hoy</span>
              : <span>{today.open} – {today.close}</span>
            : "Ver horarios"}
        </span>
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-2 space-y-1 pl-6">
          {DIAS.map(({ key, label }) => {
            const d = hours[key];
            if (!d) return null;
            return (
              <div key={key} className={cn("flex justify-between text-xs",
                key === todayKey ? "text-primary font-semibold" : "text-muted-foreground")}>
                <span>{label}</span>
                <span>{d.closed ? "Cerrado" : `${d.open} – ${d.close}`}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type Tab = "menu" | "resenas" | "ubicacion";

interface Props {
  restaurant: RestaurantDetailData;
  isFavorited: boolean;
  hasReviewed: boolean;
  isLoggedIn: boolean;
}

export function RestauranteDetail({ restaurant, isFavorited, hasReviewed, isLoggedIn }: Props) {
  const [tab, setTab] = useState<Tab>("menu");
  const price = restaurant.priceRange ? PRICE_LABELS[restaurant.priceRange] : null;

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "menu",     label: "Menú",      icon: <UtensilsCrossed className="w-4 h-4" /> },
    { key: "resenas",  label: "Reseñas",   icon: <Star className="w-4 h-4" /> },
    { key: "ubicacion",label: "Ubicación", icon: <Map className="w-4 h-4" /> },
  ];

  return (
    <div className="pb-12">
      {/* Carousel */}
      <div className="-mx-4">
        <PhotoCarousel photos={restaurant.photos} name={restaurant.name} />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        {/* ── Main content ───────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* Header info */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                    {restaurant.category}
                  </span>
                  {price && (
                    <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                      {price}
                    </span>
                  )}
                  {restaurant.activePromos.length > 0 && (
                    <span className="text-xs font-bold text-primary-foreground bg-primary px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Promoción
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-foreground">{restaurant.name}</h1>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <Stars rating={restaurant.averageRating} size="md" />
              <span className="font-bold text-foreground">
                {restaurant.averageRating > 0 ? restaurant.averageRating.toFixed(1) : "—"}
              </span>
              <span className="text-muted-foreground text-sm">
                ({restaurant.reviews.length} reseña{restaurant.reviews.length !== 1 ? "s" : ""})
              </span>
            </div>

            {/* Description */}
            {restaurant.description && (
              <p className="text-muted-foreground text-sm leading-relaxed">{restaurant.description}</p>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-border">
            <div className="flex gap-0">
              {TABS.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                    tab === key
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {icon}{label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          {tab === "menu"      && <MenuTab items={restaurant.menuItems} />}
          {tab === "resenas"   && (
            <ReviewsTab
              initialReviews={restaurant.reviews}
              restaurantId={restaurant.id}
              hasReviewed={hasReviewed}
              canReview={isLoggedIn}
            />
          )}
          {tab === "ubicacion" && <MapTab address={restaurant.address} city={restaurant.city} />}
        </div>

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside className="lg:w-72 shrink-0">
          <div className="sticky top-[calc(3.5rem+1.5rem)]">
            <Sidebar restaurant={restaurant} isFavorited={isFavorited} canReserve={isLoggedIn} />
          </div>
        </aside>
      </div>
    </div>
  );
}
