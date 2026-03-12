"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Plus,
  Pencil,
  Trash2,
  Tag,
  CalendarRange,
  Percent,
  FileText,
  Loader2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { PromotionType } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Promo {
  id: string;
  restaurantId: string;
  title: string;
  description: string | null;
  type: PromotionType;
  discountPercent: number | null;
  validFrom: string;
  validUntil: string;
  conditions: string | null;
  active: boolean;
  usageCount: number;
  createdAt: string;
}

type Vigencia = "vigente" | "programada" | "expirada" | "inactiva";

// ─── Helpers & config ─────────────────────────────────────────────────────────

const TYPE_LABEL: Record<PromotionType, string> = {
  DESCUENTO:    "Descuento",
  DOS_X_UNO:   "2×1",
  MENU_ESPECIAL:"Menú especial",
  OTRO:        "Otro",
};

const TYPE_CLASS: Record<PromotionType, string> = {
  DESCUENTO:    "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  DOS_X_UNO:   "bg-blue-500/15 text-blue-400 border-blue-500/30",
  MENU_ESPECIAL:"bg-purple-500/15 text-purple-400 border-purple-500/30",
  OTRO:        "bg-muted text-muted-foreground border-border",
};

const VIGENCIA_CONFIG: Record<Vigencia, { label: string; class: string }> = {
  vigente:   { label: "Vigente",    class: "bg-primary/15 text-primary border-primary/30" },
  programada:{ label: "Programada", class: "bg-sky-500/15 text-sky-400 border-sky-500/30" },
  expirada:  { label: "Expirada",   class: "bg-red-500/15 text-red-400 border-red-500/30" },
  inactiva:  { label: "Inactiva",   class: "bg-muted text-muted-foreground border-border" },
};

function getVigencia(p: Promo): Vigencia {
  if (!p.active) return "inactiva";
  const now = Date.now();
  const from = new Date(p.validFrom).getTime();
  const until = new Date(p.validUntil).getTime();
  if (now > until) return "expirada";
  if (now < from) return "programada";
  return "vigente";
}

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric", month: "short", year: "numeric",
  }).format(new Date(iso));
}

function toDateInput(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ─── Form state ───────────────────────────────────────────────────────────────

type PromoForm = {
  title: string;
  description: string;
  type: PromotionType;
  discountPercent: string;
  validFrom: string;
  validUntil: string;
  conditions: string;
  active: boolean;
};

const EMPTY_FORM: PromoForm = {
  title: "",
  description: "",
  type: "DESCUENTO",
  discountPercent: "",
  validFrom: "",
  validUntil: "",
  conditions: "",
  active: true,
};

function promoToForm(p: Promo): PromoForm {
  return {
    title: p.title,
    description: p.description ?? "",
    type: p.type,
    discountPercent: p.discountPercent != null ? String(p.discountPercent) : "",
    validFrom: toDateInput(p.validFrom),
    validUntil: toDateInput(p.validUntil),
    conditions: p.conditions ?? "",
    active: p.active,
  };
}

// ─── Promo card ───────────────────────────────────────────────────────────────

interface CardProps {
  p: Promo;
  onToggle: (id: string, active: boolean) => void;
  onEdit: (p: Promo) => void;
  onDelete: (id: string) => void;
  loadingId: string | null;
}

function PromoCard({ p, onToggle, onEdit, onDelete, loadingId }: CardProps) {
  const vig = getVigencia(p);
  const loading = loadingId === p.id;

  return (
    <div className={`bg-card border rounded-xl p-5 flex flex-col gap-3 transition-opacity ${!p.active ? "opacity-60" : ""} ${loading ? "pointer-events-none" : ""}`}
      style={{ borderColor: p.active && vig === "vigente" ? "rgba(57,255,20,0.25)" : undefined }}>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${TYPE_CLASS[p.type]}`}>
              {TYPE_LABEL[p.type]}
              {p.type === "DESCUENTO" && p.discountPercent != null && ` ${p.discountPercent}%`}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${VIGENCIA_CONFIG[vig].class}`}>
              {VIGENCIA_CONFIG[vig].label}
            </span>
          </div>
          <h3 className="font-bold text-foreground leading-tight">{p.title}</h3>
          {p.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{p.description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggle(p.id, !p.active)}
            className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            title={p.active ? "Desactivar" : "Activar"}
          >
            {p.active
              ? <ToggleRight className="w-5 h-5 text-primary" />
              : <ToggleLeft className="w-5 h-5" />}
          </button>
          <button
            onClick={() => onEdit(p)}
            className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(p.id)}
            className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dates */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CalendarRange className="w-3.5 h-3.5 shrink-0" />
        {fmtDate(p.validFrom)} → {fmtDate(p.validUntil)}
      </div>

      {/* Conditions */}
      {p.conditions && (
        <div className="flex items-start gap-1.5 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
          <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          {p.conditions}
        </div>
      )}

      {/* Usage */}
      {p.usageCount > 0 && (
        <p className="text-xs text-muted-foreground">
          Usada {p.usageCount} {p.usageCount === 1 ? "vez" : "veces"}
        </p>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  initialPromos: Promo[];
}

export function PromocionesClient({ initialPromos }: Props) {
  const { toast } = useToast();
  const [promos, setPromos] = useState(initialPromos);
  const [activeTab, setActiveTab] = useState<"activas" | "inactivas">("activas");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [modal, setModal] = useState<{
    open: boolean;
    mode: "create" | "edit";
    editId: string;
    form: PromoForm;
  }>({ open: false, mode: "create", editId: "", form: EMPTY_FORM });

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string }>({
    open: false, id: "",
  });

  // ── Lists ──────────────────────────────────────────────────────────────────

  const { activas, inactivas } = useMemo(() => {
    const activas = promos.filter((p) => {
      const v = getVigencia(p);
      return v === "vigente" || v === "programada";
    });
    const inactivas = promos.filter((p) => {
      const v = getVigencia(p);
      return v === "inactiva" || v === "expirada";
    });
    return { activas, inactivas };
  }, [promos]);

  const displayed = activeTab === "activas" ? activas : inactivas;

  // ── API helpers ────────────────────────────────────────────────────────────

  async function apiPatch(id: string, body: object) {
    const res = await fetch(`/api/empresa/promociones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error();
    return res.json() as Promise<Promo>;
  }

  // ── Toggle ─────────────────────────────────────────────────────────────────

  async function handleToggle(id: string, active: boolean) {
    setLoadingId(id);
    // Optimistic
    setPromos((prev) => prev.map((p) => (p.id === id ? { ...p, active } : p)));
    try {
      await apiPatch(id, { active });
    } catch {
      setPromos((prev) => prev.map((p) => (p.id === id ? { ...p, active: !active } : p)));
      toast({ title: "Error al actualizar", variant: "destructive" });
    } finally {
      setLoadingId(null);
    }
  }

  // ── Edit ───────────────────────────────────────────────────────────────────

  function openCreate() {
    setModal({ open: true, mode: "create", editId: "", form: EMPTY_FORM });
  }

  function openEdit(p: Promo) {
    setModal({ open: true, mode: "edit", editId: p.id, form: promoToForm(p) });
  }

  function setField<K extends keyof PromoForm>(key: K, value: PromoForm[K]) {
    setModal((prev) => ({ ...prev, form: { ...prev.form, [key]: value } }));
  }

  async function handleSave() {
    const { form, mode, editId } = modal;
    if (!form.title.trim() || !form.validFrom || !form.validUntil) {
      toast({ title: "Completá los campos requeridos", variant: "destructive" });
      return;
    }
    if (new Date(form.validFrom) > new Date(form.validUntil)) {
      toast({ title: "La fecha de inicio debe ser antes que la de fin", variant: "destructive" });
      return;
    }

    const body = {
      title: form.title.trim(),
      description: form.description,
      type: form.type,
      discountPercent: form.type === "DESCUENTO" ? form.discountPercent : null,
      validFrom: new Date(form.validFrom).toISOString(),
      validUntil: new Date(form.validUntil + "T23:59:59").toISOString(),
      conditions: form.conditions,
      active: form.active,
    };

    setSaving(true);
    try {
      if (mode === "create") {
        const res = await fetch("/api/empresa/promociones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
        const created: Promo = await res.json();
        setPromos((prev) => [created, ...prev]);
        toast({ title: "Promoción creada" });
      } else {
        const updated = await apiPatch(editId, body);
        setPromos((prev) => prev.map((p) => (p.id === editId ? updated : p)));
        toast({ title: "Promoción actualizada" });
      }
      setModal((prev) => ({ ...prev, open: false }));
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  async function handleDeleteConfirm() {
    const id = deleteDialog.id;
    setDeleteDialog({ open: false, id: "" });
    setLoadingId(id);
    try {
      const res = await fetch(`/api/empresa/promociones/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setPromos((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Promoción eliminada" });
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" });
    } finally {
      setLoadingId(null);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const { form } = modal;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Promociones</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestioná las promociones de tu restaurante
          </p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Nueva promoción
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {(["activas", "inactivas"] as const).map((tab) => {
          const count = tab === "activas" ? activas.length : inactivas.length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px capitalize ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "activas" ? "Vigentes y programadas" : "Inactivas y expiradas"}
              {count > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${
                  activeTab === tab ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Tag className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-medium">
            {activeTab === "activas"
              ? "No hay promociones vigentes"
              : "No hay promociones inactivas"}
          </p>
          {activeTab === "activas" && (
            <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={openCreate}>
              <Plus className="w-3.5 h-3.5" />
              Crear primera promoción
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayed.map((p) => (
            <PromoCard
              key={p.id}
              p={p}
              onToggle={handleToggle}
              onEdit={openEdit}
              onDelete={(id) => setDeleteDialog({ open: true, id })}
              loadingId={loadingId}
            />
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <Dialog open={modal.open} onOpenChange={(open) => !open && setModal((prev) => ({ ...prev, open: false }))}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modal.mode === "create" ? "Nueva promoción" : "Editar promoción"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Título <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="Ej: 20% en toda la carta"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Descripción</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Descripción breve de la promoción..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {/* Type + discount */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Tipo <span className="text-destructive">*</span>
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setField("type", e.target.value as PromotionType)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {(Object.keys(TYPE_LABEL) as PromotionType[]).map((t) => (
                    <option key={t} value={t}>{TYPE_LABEL[t]}</option>
                  ))}
                </select>
              </div>

              {form.type === "DESCUENTO" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    <span className="flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5" />
                      Porcentaje
                    </span>
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={form.discountPercent}
                    onChange={(e) => setField("discountPercent", e.target.value)}
                    placeholder="20"
                  />
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Válida desde <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  value={form.validFrom}
                  onChange={(e) => setField("validFrom", e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Válida hasta <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  value={form.validUntil}
                  onChange={(e) => setField("validUntil", e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Conditions */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Condiciones</label>
              <textarea
                rows={3}
                value={form.conditions}
                onChange={(e) => setField("conditions", e.target.value)}
                placeholder="Ej: Válido de lunes a jueves. No acumulable con otras promociones."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Activar promoción</p>
                <p className="text-xs text-muted-foreground">Los clientes podrán verla</p>
              </div>
              <button
                type="button"
                onClick={() => setField("active", !form.active)}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                style={{ backgroundColor: form.active ? "hsl(var(--primary))" : "hsl(var(--muted))" }}
              >
                <span
                  className="inline-block h-5 w-5 rounded-full bg-white shadow transition-all duration-200 absolute"
                  style={{ left: form.active ? "22px" : "2px" }}
                />
              </button>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setModal((prev) => ({ ...prev, open: false }))}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {modal.mode === "create" ? "Crear promoción" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && setDeleteDialog({ open: false, id: "" })}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar promoción</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Esta acción no se puede deshacer. ¿Querés eliminar esta promoción?
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, id: "" })}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
