"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Clock, CheckCircle2, XCircle, Tag, CalendarDays, Store, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Restaurant = { id: string; name: string; photos: string[]; category: string };
type Promotion = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  discountPercent: number | null;
  validUntil: string;
  conditions: string | null;
  restaurant: Restaurant;
};
type Benefit = {
  id: string;
  status: "DISPONIBLE" | "CANJEADO" | "EXPIRADO";
  redeemedAt: string | null;
  createdAt: string;
  promotion: Promotion;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  DESCUENTO: "Descuento",
  DOS_X_UNO: "2×1",
  MENU_ESPECIAL: "Menú especial",
  OTRO: "Beneficio",
};

const TYPE_COLORS: Record<string, string> = {
  DESCUENTO: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  DOS_X_UNO: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  MENU_ESPECIAL: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  OTRO: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
}

function daysLeft(iso: string) {
  const diff = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
  return diff;
}

// ─── BenefitCard ─────────────────────────────────────────────────────────────

function BenefitCard({
  benefit,
  onRedeem,
}: {
  benefit: Benefit;
  onRedeem: (b: Benefit) => void;
}) {
  const { promotion } = benefit;
  const photo = promotion.restaurant.photos?.[0];
  const days = daysLeft(promotion.validUntil);
  const isUrgent = days <= 3 && days >= 0;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-card overflow-hidden transition-all duration-200",
        benefit.status === "DISPONIBLE"
          ? "border-border hover:border-primary/40 hover:shadow-[0_0_20px_rgba(57,255,20,0.08)]"
          : "border-border/50 opacity-60"
      )}
    >
      {/* Restaurant photo strip */}
      <div className="relative h-28 bg-muted overflow-hidden">
        {photo ? (
          <Image src={photo} alt={promotion.restaurant.name} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <Store className="size-10 text-primary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-2 right-2">
          {benefit.status === "DISPONIBLE" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/90 px-2 py-0.5 text-xs font-semibold text-black">
              <Sparkles className="size-3" /> Disponible
            </span>
          )}
          {benefit.status === "CANJEADO" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              <CheckCircle2 className="size-3" /> Canjeado
            </span>
          )}
          {benefit.status === "EXPIRADO" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/80 px-2 py-0.5 text-xs font-semibold text-white">
              <XCircle className="size-3" /> Expirado
            </span>
          )}
        </div>

        {/* Restaurant name */}
        <p className="absolute bottom-2 left-3 text-sm font-semibold text-white drop-shadow">
          {promotion.restaurant.name}
        </p>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Promotion type badge */}
        <span
          className={cn(
            "inline-flex w-fit items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
            TYPE_COLORS[promotion.type] ?? TYPE_COLORS.OTRO
          )}
        >
          <Tag className="size-3" />
          {TYPE_LABELS[promotion.type] ?? "Beneficio"}
          {promotion.discountPercent ? ` ${promotion.discountPercent}%` : ""}
        </span>

        <h3 className="font-semibold text-foreground leading-snug">{promotion.title}</h3>

        {promotion.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{promotion.description}</p>
        )}

        {/* Expiry */}
        <div
          className={cn(
            "flex items-center gap-1.5 text-xs",
            isUrgent && benefit.status === "DISPONIBLE" ? "text-amber-400" : "text-muted-foreground"
          )}
        >
          <CalendarDays className="size-3.5 shrink-0" />
          {benefit.status === "CANJEADO" && benefit.redeemedAt ? (
            <span>Canjeado el {formatDate(benefit.redeemedAt)}</span>
          ) : benefit.status === "EXPIRADO" ? (
            <span>Venció el {formatDate(promotion.validUntil)}</span>
          ) : (
            <span>
              Válido hasta {formatDate(promotion.validUntil)}
              {isUrgent && days > 0 && ` · ¡Solo ${days} día${days !== 1 ? "s" : ""}!`}
              {days === 0 && " · ¡Vence hoy!"}
            </span>
          )}
        </div>

        {/* Canjear button */}
        {benefit.status === "DISPONIBLE" && (
          <Button
            size="sm"
            className="mt-auto w-full bg-primary text-black hover:bg-primary/90 font-semibold"
            onClick={() => onRedeem(benefit)}
          >
            <Gift className="size-4 mr-1.5" />
            Canjear beneficio
          </Button>
        )}

        {benefit.status === "CANJEADO" && (
          <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            Beneficio ya utilizado
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Redeem Modal ─────────────────────────────────────────────────────────────

function RedeemModal({
  benefit,
  onClose,
  onConfirm,
  loading,
}: {
  benefit: Benefit | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  if (!benefit) return null;
  const { promotion } = benefit;

  return (
    <Dialog open={!!benefit} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="size-5 text-primary" />
            Canjear beneficio
          </DialogTitle>
          <DialogDescription>
            Estás por canjear este beneficio en{" "}
            <span className="font-semibold text-foreground">{promotion.restaurant.name}</span>.
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
          <p className="font-semibold text-foreground">{promotion.title}</p>
          {promotion.description && (
            <p className="text-sm text-muted-foreground">{promotion.description}</p>
          )}
          {promotion.conditions && (
            <p className="text-xs text-muted-foreground border-t border-border pt-2 mt-2">
              <span className="font-medium">Condiciones:</span> {promotion.conditions}
            </p>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
            <Clock className="size-3.5" />
            Válido hasta {formatDate(promotion.validUntil)}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            className="bg-primary text-black hover:bg-primary/90 font-semibold"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Canjeando..." : "Confirmar canje"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ type }: { type: "disponibles" | "historial" }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
        {type === "disponibles" ? (
          <Gift className="size-8 text-primary/60" />
        ) : (
          <Clock className="size-8 text-primary/60" />
        )}
      </div>
      <div>
        <p className="font-semibold text-foreground">
          {type === "disponibles" ? "No tenés beneficios disponibles" : "Sin historial aún"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {type === "disponibles"
            ? "Los beneficios aparecen cuando los restaurantes activan promociones especiales para vos."
            : "Acá vas a ver los beneficios que ya canjeaste o que expiraron."}
        </p>
      </div>
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export function BeneficiosClient({ initialBenefits }: { initialBenefits: Benefit[] }) {
  const [benefits, setBenefits] = useState<Benefit[]>(initialBenefits);
  const [selected, setSelected] = useState<Benefit | null>(null);
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  const disponibles = useMemo(
    () => benefits.filter((b) => b.status === "DISPONIBLE"),
    [benefits]
  );
  const historial = useMemo(
    () => benefits.filter((b) => b.status !== "DISPONIBLE"),
    [benefits]
  );

  async function handleRedeem() {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cliente/beneficios/${selected.id}/canjear`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Error al canjear");
        return;
      }
      const updated = await res.json();
      setBenefits((prev) =>
        prev.map((b) =>
          b.id === selected.id
            ? { ...b, status: updated.status, redeemedAt: updated.redeemedAt }
            : b
        )
      );
      setSuccessId(selected.id);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-1">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Gift className="size-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Mis beneficios</h1>
          </div>
          <p className="text-muted-foreground text-sm ml-[52px]">
            Promociones y descuentos exclusivos para vos
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">{disponibles.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Disponibles</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {benefits.filter((b) => b.status === "CANJEADO").length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Canjeados</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {benefits.filter((b) => b.status === "EXPIRADO").length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Expirados</p>
          </div>
        </div>

        <Tabs defaultValue="disponibles">
          <TabsList className="mb-6 bg-muted">
            <TabsTrigger value="disponibles" className="gap-2">
              <Sparkles className="size-4" />
              Disponibles
              {disponibles.length > 0 && (
                <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-px text-xs font-semibold text-primary">
                  {disponibles.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="historial" className="gap-2">
              <Clock className="size-4" />
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="disponibles">
            {disponibles.length === 0 ? (
              <EmptyState type="disponibles" />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {disponibles.map((b) => (
                  <div key={b.id} className="relative">
                    {successId === b.id && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-2 text-emerald-400">
                          <CheckCircle2 className="size-10" />
                          <p className="font-semibold text-sm">¡Canjeado!</p>
                        </div>
                      </div>
                    )}
                    <BenefitCard benefit={b} onRedeem={setSelected} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="historial">
            {historial.length === 0 ? (
              <EmptyState type="historial" />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {historial.map((b) => (
                  <BenefitCard key={b.id} benefit={b} onRedeem={() => {}} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Redeem Modal */}
      <RedeemModal
        benefit={selected}
        onClose={() => setSelected(null)}
        onConfirm={handleRedeem}
        loading={loading}
      />
    </div>
  );
}
