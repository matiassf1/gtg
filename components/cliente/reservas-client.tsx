"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CalendarDays, Clock, Users, Store, CheckCircle2, XCircle,
  AlertCircle, Hourglass, Ban, Star, ChevronRight, CalendarX,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Restaurant = { id: string; name: string; photos: string[]; category: string; address: string; city: string };
type Reservation = {
  id: string;
  date: string;
  guests: number;
  status: "PENDIENTE" | "CONFIRMADA" | "RECHAZADA" | "COMPLETADA" | "CANCELADA";
  notes: string | null;
  rejectReason: string | null;
  createdAt: string;
  restaurant: Restaurant;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  PENDIENTE:  { label: "Pendiente",  icon: Hourglass,     color: "text-amber-400",    bg: "bg-amber-500/10 border-amber-500/20" },
  CONFIRMADA: { label: "Confirmada", icon: CheckCircle2,  color: "text-emerald-400",  bg: "bg-emerald-500/10 border-emerald-500/20" },
  RECHAZADA:  { label: "Rechazada",  icon: XCircle,       color: "text-destructive",  bg: "bg-destructive/10 border-destructive/20" },
  COMPLETADA: { label: "Completada", icon: CheckCircle2,  color: "text-blue-400",     bg: "bg-blue-500/10 border-blue-500/20" },
  CANCELADA:  { label: "Cancelada",  icon: Ban,           color: "text-muted-foreground", bg: "bg-muted/30 border-border" },
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    time: d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
  };
}

function isFuture(iso: string) {
  return new Date(iso) > new Date();
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Reservation["status"] }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", cfg.bg, cfg.color)}>
      <Icon className="size-3.5" />
      {cfg.label}
    </span>
  );
}

// ─── ReservationCard ──────────────────────────────────────────────────────────

function ReservationCard({
  r,
  onCancel,
  hasReview,
}: {
  r: Reservation;
  onCancel: (id: string) => void;
  hasReview: boolean;
}) {
  const { date, time } = formatDateTime(r.date);
  const photo = r.restaurant.photos?.[0];
  const canCancel = isFuture(r.date) && (r.status === "PENDIENTE" || r.status === "CONFIRMADA");
  const canReview = r.status === "COMPLETADA" && !hasReview;

  return (
    <div className="rounded-2xl border bg-card overflow-hidden transition-all hover:border-border/80">
      <div className="flex gap-0">
        {/* Photo strip */}
        <div className="relative w-24 sm:w-32 shrink-0 bg-muted">
          {photo ? (
            <Image src={photo} alt={r.restaurant.name} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Store className="size-8 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col gap-3 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/cliente/restaurante/${r.restaurant.id}`}
                className="font-bold text-foreground hover:text-primary transition-colors line-clamp-1 text-sm sm:text-base"
              >
                {r.restaurant.name}
              </Link>
              <p className="text-xs text-muted-foreground mt-0.5">{r.restaurant.category} · {r.restaurant.city}</p>
            </div>
            <StatusBadge status={r.status} />
          </div>

          {/* Info row */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5 text-primary/60 shrink-0" />
              <span className="capitalize">{date}</span>
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5 text-primary/60 shrink-0" />
              {time} hs
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="size-3.5 text-primary/60 shrink-0" />
              {r.guests} {r.guests === 1 ? "persona" : "personas"}
            </span>
          </div>

          {/* Notes / reject reason */}
          {r.notes && (
            <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 italic">
              "{r.notes}"
            </p>
          )}
          {r.status === "RECHAZADA" && r.rejectReason && (
            <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/5 rounded-lg px-3 py-2 border border-destructive/10">
              <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
              <span><span className="font-semibold">Motivo:</span> {r.rejectReason}</span>
            </div>
          )}

          {/* Actions */}
          {(canCancel || canReview) && (
            <div className="flex flex-wrap gap-2 pt-1">
              {canReview && (
                <Link href={`/cliente/restaurante/${r.restaurant.id}`}>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10">
                    <Star className="size-3.5" />
                    Dejar reseña
                  </Button>
                </Link>
              )}
              {canCancel && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40"
                  onClick={() => onCancel(r.id)}
                >
                  <Ban className="size-3.5" />
                  Cancelar reserva
                </Button>
              )}
            </div>
          )}

          {r.status === "COMPLETADA" && hasReview && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              Ya dejaste tu reseña
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Cancel Modal ─────────────────────────────────────────────────────────────

function CancelModal({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Ban className="size-5" />
            Cancelar reserva
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres cancelar esta reserva? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Volver</Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Cancelando..." : "Sí, cancelar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ type }: { type: "proximas" | "historial" }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
        <CalendarX className="size-8 text-primary/60" />
      </div>
      <div>
        <p className="font-semibold text-foreground">
          {type === "proximas" ? "No tienes reservas próximas" : "Sin historial de reservas"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {type === "proximas"
            ? "Explora restaurantes y haz tu primera reserva."
            : "Las reservas pasadas aparecerán acá."}
        </p>
      </div>
      {type === "proximas" && (
        <Link href="/cliente/explorar">
          <Button size="sm" className="bg-primary text-black hover:bg-primary/90 font-semibold gap-1.5">
            Explorar restaurantes
            <ChevronRight className="size-4" />
          </Button>
        </Link>
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function ReservasClient({
  initialReservations,
  reviewedIds,
}: {
  initialReservations: Reservation[];
  reviewedIds: string[]; // restaurantIds that the client has already reviewed
}) {
  const [reservations, setReservations] = useState(initialReservations);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const proximas = useMemo(
    () => reservations.filter((r) => isFuture(r.date) && r.status !== "CANCELADA" && r.status !== "RECHAZADA"),
    [reservations]
  );
  const historial = useMemo(
    () => reservations.filter((r) => !isFuture(r.date) || r.status === "CANCELADA" || r.status === "RECHAZADA"),
    [reservations]
  );

  async function handleCancel() {
    if (!cancelId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cliente/reservas/${cancelId}/cancelar`, { method: "PATCH" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Error al cancelar");
        return;
      }
      setReservations((prev) =>
        prev.map((r) => r.id === cancelId ? { ...r, status: "CANCELADA" } : r)
      );
      setCancelId(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3 mb-1">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CalendarDays className="size-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Mis reservas</h1>
          </div>
          <p className="text-muted-foreground text-sm ml-[52px]">
            Próximas visitas e historial de reservas
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">{proximas.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Próximas</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {reservations.filter((r) => r.status === "COMPLETADA").length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Completadas</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {reservations.filter((r) => r.status === "CANCELADA").length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Canceladas</p>
          </div>
        </div>

        <Tabs defaultValue="proximas">
          <TabsList className="mb-6 bg-muted">
            <TabsTrigger value="proximas" className="gap-2">
              <CalendarDays className="size-4" />
              Próximas
              {proximas.length > 0 && (
                <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-px text-xs font-semibold text-primary">
                  {proximas.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="historial" className="gap-2">
              <Clock className="size-4" />
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="proximas">
            {proximas.length === 0 ? (
              <EmptyState type="proximas" />
            ) : (
              <div className="flex flex-col gap-3">
                {proximas.map((r) => (
                  <ReservationCard
                    key={r.id}
                    r={r}
                    onCancel={setCancelId}
                    hasReview={reviewedIds.includes(r.restaurant.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="historial">
            {historial.length === 0 ? (
              <EmptyState type="historial" />
            ) : (
              <div className="flex flex-col gap-3">
                {historial.map((r) => (
                  <ReservationCard
                    key={r.id}
                    r={r}
                    onCancel={setCancelId}
                    hasReview={reviewedIds.includes(r.restaurant.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CancelModal
        open={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={handleCancel}
        loading={loading}
      />
    </div>
  );
}
