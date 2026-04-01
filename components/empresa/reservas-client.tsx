"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Flag,
  FilterX,
  StickyNote,
} from "lucide-react";
import { ReservationStatus } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReservationClient {
  id: string;
  restaurantId: string;
  clientId: string;
  date: string;
  guests: number;
  status: ReservationStatus;
  notes: string | null;
  rejectReason: string | null;
  createdAt: string;
  client: {
    user: { name: string | null; email: string; image: string | null };
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  }).format(new Date(iso));
}

function fmtTime(iso: string) {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

function isDateToday(iso: string) {
  const d = new Date(iso);
  const n = new Date();
  return (
    d.getDate() === n.getDate() &&
    d.getMonth() === n.getMonth() &&
    d.getFullYear() === n.getFullYear()
  );
}

function toLocalDateValue(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isSameLocalDate(iso: string, localDate: string) {
  return toLocalDateValue(iso) === localDate;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<ReservationStatus, string> = {
  PENDIENTE:  "Pendiente",
  CONFIRMADA: "Confirmada",
  RECHAZADA:  "Rechazada",
  COMPLETADA: "Completada",
  CANCELADA:  "Cancelada",
};

const STATUS_CLASS: Record<ReservationStatus, string> = {
  PENDIENTE:  "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  CONFIRMADA: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  RECHAZADA:  "bg-red-500/15 text-red-400 border-red-500/30",
  COMPLETADA: "bg-primary/15 text-primary border-primary/30",
  CANCELADA:  "bg-muted text-muted-foreground border-border",
};

// ─── Reservation card ─────────────────────────────────────────────────────────

interface CardProps {
  r: ReservationClient;
  onConfirm: (id: string) => void;
  onComplete: (id: string) => void;
  onReject: (id: string) => void;
  loadingId: string | null;
}

function ReservationCard({ r, onConfirm, onComplete, onReject, loadingId }: CardProps) {
  const name = r.client.user.name ?? r.client.user.email;
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const loading = loadingId === r.id;

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
      {/* Top row: client + status */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="w-9 h-9 shrink-0">
            <AvatarImage src={r.client.user.image ?? undefined} />
            <AvatarFallback className="text-xs bg-primary/20 text-primary font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{name}</p>
            <p className="text-xs text-muted-foreground truncate">{r.client.user.email}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${STATUS_CLASS[r.status]}`}>
          {STATUS_LABEL[r.status]}
        </span>
      </div>

      {/* Info row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          {fmtDate(r.date)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          {fmtTime(r.date)}
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 shrink-0" />
          {r.guests} {r.guests === 1 ? "persona" : "personas"}
        </span>
      </div>

      {/* Notes */}
      {r.notes && (
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          <StickyNote className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          {r.notes}
        </p>
      )}

      {/* Reject reason */}
      {r.rejectReason && (
        <p className="flex items-start gap-1.5 text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
          <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          Motivo: {r.rejectReason}
        </p>
      )}

      {/* Actions */}
      {r.status === "PENDIENTE" && (
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1 gap-1.5"
            disabled={loading}
            onClick={() => onConfirm(r.id)}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Confirmar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
            disabled={loading}
            onClick={() => onReject(r.id)}
          >
            <XCircle className="w-3.5 h-3.5" />
            Rechazar
          </Button>
        </div>
      )}

      {r.status === "CONFIRMADA" && (
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-1.5"
            disabled={loading}
            onClick={() => onComplete(r.id)}
          >
            <Flag className="w-3.5 h-3.5" />
            Marcar como completada
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
            disabled={loading}
            onClick={() => onReject(r.id)}
          >
            <XCircle className="w-3.5 h-3.5" />
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  initialReservations: ReservationClient[];
}

type Tab = "hoy" | "pendientes" | "historial";

export function ReservasClient({ initialReservations }: Props) {
  const { toast } = useToast();
  const [reservations, setReservations] = useState(initialReservations);
  const [activeTab, setActiveTab] = useState<Tab>("hoy");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "">("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Reject dialog
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    id: string;
    reason: string;
    isCancel: boolean;
  }>({ open: false, id: "", reason: "", isCancel: false });

  // ── Filtered lists per tab ─────────────────────────────────────────────────

  const tabData = useMemo(() => {
    const hoy = reservations.filter((r) => isDateToday(r.date));
    const pendientes = reservations.filter(
      (r) => r.status === "PENDIENTE" && !isDateToday(r.date)
    );
    const historial = reservations.filter(
      (r) => ["COMPLETADA", "RECHAZADA", "CANCELADA"].includes(r.status) ||
        (!isDateToday(r.date) && new Date(r.date) < new Date() && r.status !== "PENDIENTE")
    );
    return { hoy, pendientes, historial };
  }, [reservations]);

  const displayed = useMemo(() => {
    let list = tabData[activeTab];
    if (dateFilter) list = list.filter((r) => isSameLocalDate(r.date, dateFilter));
    if (statusFilter) list = list.filter((r) => r.status === statusFilter);
    return list;
  }, [tabData, activeTab, dateFilter, statusFilter]);

  // ── API call ───────────────────────────────────────────────────────────────

  async function updateStatus(
    id: string,
    status: ReservationStatus,
    rejectReason?: string
  ) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/empresa/reservas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejectReason }),
      });
      if (!res.ok) throw new Error();
      const updated: ReservationClient = await res.json();
      setReservations((prev) => prev.map((r) => (r.id === id ? updated : r)));
      toast({ title: `Reserva ${STATUS_LABEL[status].toLowerCase()}` });
    } catch {
      toast({ title: "Error al actualizar la reserva", variant: "destructive" });
    } finally {
      setLoadingId(null);
    }
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleConfirm(id: string) {
    updateStatus(id, "CONFIRMADA");
  }

  function handleComplete(id: string) {
    updateStatus(id, "COMPLETADA");
  }

  function handleReject(id: string) {
    const r = reservations.find((x) => x.id === id);
    const isCancel = r?.status === "CONFIRMADA";
    setRejectDialog({ open: true, id, reason: "", isCancel });
  }

  function handleRejectConfirm() {
    const status: ReservationStatus = rejectDialog.isCancel ? "CANCELADA" : "RECHAZADA";
    updateStatus(rejectDialog.id, status, rejectDialog.reason || undefined);
    setRejectDialog({ open: false, id: "", reason: "", isCancel: false });
  }

  // ── Counts ────────────────────────────────────────────────────────────────

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: "hoy",        label: "Hoy",        count: tabData.hoy.length },
    { key: "pendientes", label: "Pendientes",  count: tabData.pendientes.filter((r) => r.status === "PENDIENTE").length },
    { key: "historial",  label: "Historial",   count: tabData.historial.length },
  ];

  const hasFilters = dateFilter !== "" || statusFilter !== "";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reservas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gestiona las reservas de tu restaurante
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
            {count > 0 && (
              <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${
                activeTab === key
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-11 rounded-md border border-input bg-background px-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReservationStatus | "")}
          className="h-11 rounded-md border border-input bg-background px-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Todos los estados</option>
          {(Object.keys(STATUS_LABEL) as ReservationStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={() => { setDateFilter(""); setStatusFilter(""); }}
          >
            <FilterX className="w-3.5 h-3.5" />
            Limpiar
          </Button>
        )}
      </div>

      {/* List */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Calendar className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-medium">
            {hasFilters
              ? "No hay reservas con esos filtros"
              : activeTab === "hoy"
              ? "No hay reservas para hoy"
              : activeTab === "pendientes"
              ? "No hay reservas pendientes"
              : "No hay historial aún"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayed.map((r) => (
            <ReservationCard
              key={r.id}
              r={r}
              onConfirm={handleConfirm}
              onComplete={handleComplete}
              onReject={handleReject}
              loadingId={loadingId}
            />
          ))}
        </div>
      )}

      {/* Reject / Cancel dialog */}
      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) =>
          !open && setRejectDialog({ open: false, id: "", reason: "", isCancel: false })
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {rejectDialog.isCancel ? "Cancelar reserva" : "Rechazar reserva"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              {rejectDialog.isCancel
                ? "¿Querés cancelar esta reserva confirmada? Podés agregar un motivo opcional."
                : "¿Querés rechazar esta solicitud? Podés agregar un motivo opcional."}
            </p>
            <textarea
              rows={3}
              placeholder="Motivo (opcional)..."
              value={rejectDialog.reason}
              onChange={(e) =>
                setRejectDialog((prev) => ({ ...prev, reason: e.target.value }))
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setRejectDialog({ open: false, id: "", reason: "", isCancel: false })
              }
            >
              Volver
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm}>
              {rejectDialog.isCancel ? "Sí, cancelar" : "Sí, rechazar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
