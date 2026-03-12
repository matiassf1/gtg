"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Loader2, CheckCircle2, Plus, X, Lock, LogOut,
  AlertTriangle, Eye, EyeOff, Bell, Clock, Users, Calendar,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Shift = { start: string; end: string };
type DayConfig = { active: boolean; shift1: Shift; shift2?: Shift | null };
type Schedule = Record<string, DayConfig>;

export type ConfigData = {
  maxCapacity: number;
  maxReservationsPerSlot: number;
  reservationDuration: number;
  autoConfirm: boolean;
  minAdvance: number;
  maxAdvance: number;
  reservationSchedule: unknown;
  emailNewReservation: boolean;
  emailNewReview: boolean;
  emailDailySummary: boolean;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const DIAS = [
  { key: "lunes",     label: "Lunes"     },
  { key: "martes",    label: "Martes"    },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves",    label: "Jueves"    },
  { key: "viernes",   label: "Viernes"   },
  { key: "sabado",    label: "Sábado"    },
  { key: "domingo",   label: "Domingo"   },
];

const DURATION_OPTIONS = [
  { value: "60",  label: "1 hora"    },
  { value: "90",  label: "1.5 horas" },
  { value: "120", label: "2 horas"   },
  { value: "150", label: "2.5 horas" },
  { value: "180", label: "3 horas"   },
];

const MIN_ADVANCE_OPTIONS = [
  { value: "1",  label: "1 hora"    },
  { value: "2",  label: "2 horas"   },
  { value: "6",  label: "6 horas"   },
  { value: "12", label: "12 horas"  },
  { value: "24", label: "24 horas"  },
  { value: "48", label: "48 horas"  },
];

const MAX_ADVANCE_OPTIONS = [
  { value: "7",  label: "1 semana"  },
  { value: "14", label: "2 semanas" },
  { value: "30", label: "1 mes"     },
  { value: "60", label: "2 meses"   },
];

const DEFAULT_SHIFT1: Shift = { start: "12:00", end: "16:00" };
const DEFAULT_SHIFT2: Shift = { start: "20:00", end: "23:30" };

const SELECT_CLASS =
  "flex h-11 w-full rounded-md border border-input bg-background px-3 text-base sm:text-sm " +
  "ring-offset-background focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildDefaultSchedule(): Schedule {
  return Object.fromEntries(
    DIAS.map(({ key }) => [key, { active: key !== "domingo", shift1: { ...DEFAULT_SHIFT1 } }])
  );
}

function parseSchedule(raw: unknown): Schedule {
  const defaults = buildDefaultSchedule();
  if (!raw || typeof raw !== "object") return defaults;
  const src = raw as Record<string, unknown>;
  for (const { key } of DIAS) {
    const d = src[key] as Record<string, unknown> | undefined;
    if (!d) continue;
    const s1 = d.shift1 as Partial<Shift> | undefined;
    const s2 = d.shift2 as Partial<Shift> | undefined | null;
    defaults[key] = {
      active: Boolean(d.active ?? true),
      shift1: { start: s1?.start ?? "12:00", end: s1?.end ?? "16:00" },
      shift2: s2 ? { start: s2.start ?? "20:00", end: s2.end ?? "23:30" } : null,
    };
  }
  return defaults;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
      className={cn(
        "relative w-10 h-6 rounded-full transition-colors shrink-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        value ? "bg-primary" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200",
          value ? "left-5" : "left-1"
        )}
      />
    </button>
  );
}

function SectionHeader({
  title,
  sub,
  icon: Icon,
}: {
  title: string;
  sub: string;
  icon: React.ElementType;
}) {
  return (
    <>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
        </div>
      </div>
      <Separator />
    </>
  );
}

function SaveButton({ saving }: { saving: boolean }) {
  return (
    <div className="flex justify-end pt-2">
      <Button type="submit" disabled={saving} className="min-w-[160px]">
        {saving ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</>
        ) : (
          <><CheckCircle2 className="w-4 h-4 mr-2" />Guardar cambios</>
        )}
      </Button>
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="pr-10"
        required
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ConfigForm({ config: initial }: { config: ConfigData }) {
  const { toast } = useToast();

  // ── Section 1: Capacidad y Reservas
  const [maxCapacity,  setMaxCapacity]  = useState(String(initial.maxCapacity));
  const [maxPerSlot,   setMaxPerSlot]   = useState(String(initial.maxReservationsPerSlot));
  const [duration,     setDuration]     = useState(String(initial.reservationDuration));
  const [autoConfirm,  setAutoConfirm]  = useState(initial.autoConfirm);
  const [minAdvance,   setMinAdvance]   = useState(String(initial.minAdvance));
  const [maxAdvance,   setMaxAdvance]   = useState(String(initial.maxAdvance));

  // ── Section 2: Horarios
  const [schedule, setSchedule] = useState<Schedule>(() =>
    parseSchedule(initial.reservationSchedule)
  );

  // ── Section 3: Notificaciones
  const [emailNewReservation, setEmailNewReservation] = useState(initial.emailNewReservation);
  const [emailNewReview,      setEmailNewReview]      = useState(initial.emailNewReview);
  const [emailDailySummary,   setEmailDailySummary]   = useState(initial.emailDailySummary);

  // ── Saving states
  const [saving, setSaving] = useState<null | "reservas" | "horarios" | "notificaciones">(null);

  // ── Modals
  const [changePwOpen,   setChangePwOpen]   = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  // ── Change password fields
  const [currentPw,    setCurrentPw]    = useState("");
  const [newPw,        setNewPw]        = useState("");
  const [confirmPw,    setConfirmPw]    = useState("");
  const [savingPw,     setSavingPw]     = useState(false);

  // ── Deactivate
  const [deactivating, setDeactivating] = useState(false);

  // ─── API helpers ────────────────────────────────────────────────────────────

  async function putConfig(data: Record<string, unknown>, section: "reservas" | "horarios" | "notificaciones") {
    setSaving(section);
    try {
      const res = await fetch("/api/empresa/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Cambios guardados" });
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  }

  // ─── Section handlers ────────────────────────────────────────────────────────

  function handleReservas(e: React.FormEvent) {
    e.preventDefault();
    putConfig({
      maxCapacity:            Number(maxCapacity),
      maxReservationsPerSlot: Number(maxPerSlot),
      reservationDuration:    Number(duration),
      autoConfirm,
      minAdvance:             Number(minAdvance),
      maxAdvance:             Number(maxAdvance),
    }, "reservas");
  }

  function handleHorarios(e: React.FormEvent) {
    e.preventDefault();
    putConfig({ reservationSchedule: schedule }, "horarios");
  }

  function handleNotificaciones(e: React.FormEvent) {
    e.preventDefault();
    putConfig({ emailNewReservation, emailNewReview, emailDailySummary }, "notificaciones");
  }

  // ─── Change password ─────────────────────────────────────────────────────────

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) {
      toast({ title: "Las contraseñas no coinciden", variant: "destructive" });
      return;
    }
    if (newPw.length < 8) {
      toast({ title: "La nueva contraseña debe tener al menos 8 caracteres", variant: "destructive" });
      return;
    }
    setSavingPw(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      if (res.status === 400) {
        const body = await res.json();
        if (body.error === "No password set for this account") {
          toast({ title: "Tu cuenta usa Google, no tiene contraseña propia", variant: "destructive" });
        } else {
          toast({ title: "Contraseña actual incorrecta", variant: "destructive" });
        }
        return;
      }
      if (!res.ok) throw new Error();
      toast({ title: "Contraseña actualizada correctamente" });
      setChangePwOpen(false);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch {
      toast({ title: "Error al cambiar la contraseña", variant: "destructive" });
    } finally {
      setSavingPw(false);
    }
  }

  // ─── Deactivate account ───────────────────────────────────────────────────────

  async function handleDeactivate() {
    setDeactivating(true);
    try {
      const res = await fetch("/api/empresa/config/deactivate", { method: "POST" });
      if (!res.ok) throw new Error();
      await signOut({ callbackUrl: "/" });
    } catch {
      toast({ title: "Error al desactivar la cuenta", variant: "destructive" });
      setDeactivating(false);
    }
  }

  // ─── Schedule helpers ─────────────────────────────────────────────────────────

  function toggleDay(key: string) {
    setSchedule((p) => ({ ...p, [key]: { ...p[key], active: !p[key].active } }));
  }

  function updateShift(key: string, shiftKey: "shift1" | "shift2", field: "start" | "end", value: string) {
    setSchedule((p) => ({
      ...p,
      [key]: { ...p[key], [shiftKey]: { ...(p[key][shiftKey] ?? {}), [field]: value } },
    }));
  }

  function addShift2(key: string) {
    setSchedule((p) => ({ ...p, [key]: { ...p[key], shift2: { ...DEFAULT_SHIFT2 } } }));
  }

  function removeShift2(key: string) {
    setSchedule((p) => ({ ...p, [key]: { ...p[key], shift2: null } }));
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-3xl">

      {/* ══ SECCIÓN 1: Capacidad y Reservas ══ */}
      <form onSubmit={handleReservas}>
        <section className="bg-card border border-border rounded-xl p-6 space-y-5">
          <SectionHeader
            icon={Users}
            title="Capacidad y Reservas"
            sub="Controlá cómo se gestionan las reservas de tu restaurante"
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Capacidad máxima del local</label>
              <p className="text-xs text-muted-foreground">Total de personas que puede recibir el local</p>
              <Input
                type="number"
                min={1}
                max={9999}
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Reservas simultáneas por franja</label>
              <p className="text-xs text-muted-foreground">Máximo de reservas aceptadas por horario</p>
              <Input
                type="number"
                min={1}
                max={999}
                value={maxPerSlot}
                onChange={(e) => setMaxPerSlot(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Duración promedio de reserva</label>
            <p className="text-xs text-muted-foreground">Tiempo estimado que ocupa una mesa por reserva</p>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={SELECT_CLASS}
            >
              {DURATION_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border bg-background">
            <div>
              <p className="text-sm font-medium text-foreground">Confirmación automática</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Si está activo, las reservas se confirman sin revisión manual. Si está inactivo, cada reserva requiere tu aprobación.
              </p>
            </div>
            <Toggle value={autoConfirm} onChange={setAutoConfirm} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Anticipación mínima</label>
              <p className="text-xs text-muted-foreground">Con cuánto tiempo de antelación se puede reservar</p>
              <select
                value={minAdvance}
                onChange={(e) => setMinAdvance(e.target.value)}
                className={SELECT_CLASS}
              >
                {MIN_ADVANCE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Anticipación máxima</label>
              <p className="text-xs text-muted-foreground">Hasta cuánto tiempo en el futuro se puede reservar</p>
              <select
                value={maxAdvance}
                onChange={(e) => setMaxAdvance(e.target.value)}
                className={SELECT_CLASS}
              >
                {MAX_ADVANCE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <SaveButton saving={saving === "reservas"} />
        </section>
      </form>

      {/* ══ SECCIÓN 2: Horarios de Reserva ══ */}
      <form onSubmit={handleHorarios}>
        <section className="bg-card border border-border rounded-xl p-6 space-y-5">
          <SectionHeader
            icon={Clock}
            title="Horarios de Reserva"
            sub="Configurá en qué días y horarios aceptás reservas (podés tener 2 turnos por día)"
          />

          <div className="space-y-2">
            {DIAS.map(({ key, label }) => {
              const day = schedule[key];
              return (
                <div
                  key={key}
                  className={cn(
                    "rounded-lg border p-3 transition-colors",
                    day.active ? "border-border bg-background" : "border-border bg-muted/20"
                  )}
                >
                  {/* Row: toggle + day name */}
                  <div className="flex items-center gap-3 mb-0">
                    <Toggle value={day.active} onChange={() => toggleDay(key)} />
                    <span className={cn(
                      "text-sm font-medium w-24 shrink-0",
                      !day.active && "text-muted-foreground"
                    )}>
                      {label}
                    </span>

                    {!day.active ? (
                      <span className="text-xs text-muted-foreground italic">Cerrado</span>
                    ) : (
                      <div className="flex-1 space-y-2">
                        {/* Shift 1 */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground w-16 shrink-0">Turno 1</span>
                          <input
                            type="time"
                            value={day.shift1.start}
                            onChange={(e) => updateShift(key, "shift1", "start", e.target.value)}
                            className="h-8 rounded border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                          <span className="text-xs text-muted-foreground">–</span>
                          <input
                            type="time"
                            value={day.shift1.end}
                            onChange={(e) => updateShift(key, "shift1", "end", e.target.value)}
                            className="h-8 rounded border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                          {!day.shift2 && (
                            <button
                              type="button"
                              onClick={() => addShift2(key)}
                              className="ml-1 flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <Plus className="w-3 h-3" /> Turno 2
                            </button>
                          )}
                        </div>

                        {/* Shift 2 (optional) */}
                        {day.shift2 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-muted-foreground w-16 shrink-0">Turno 2</span>
                            <input
                              type="time"
                              value={day.shift2.start}
                              onChange={(e) => updateShift(key, "shift2", "start", e.target.value)}
                              className="h-8 rounded border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                            <span className="text-xs text-muted-foreground">–</span>
                            <input
                              type="time"
                              value={day.shift2.end}
                              onChange={(e) => updateShift(key, "shift2", "end", e.target.value)}
                              className="h-8 rounded border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                            <button
                              type="button"
                              onClick={() => removeShift2(key)}
                              className="ml-1 w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors"
                              aria-label="Eliminar turno 2"
                            >
                              <X className="w-3 h-3 text-destructive" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <SaveButton saving={saving === "horarios"} />
        </section>
      </form>

      {/* ══ SECCIÓN 3: Notificaciones ══ */}
      <form onSubmit={handleNotificaciones}>
        <section className="bg-card border border-border rounded-xl p-6 space-y-5">
          <SectionHeader
            icon={Bell}
            title="Notificaciones"
            sub="Elegí qué alertas querés recibir por email"
          />

          {[
            {
              value: emailNewReservation,
              onChange: setEmailNewReservation,
              label: "Nueva reserva",
              sub: "Recibir un email cada vez que un cliente hace una reserva",
            },
            {
              value: emailNewReview,
              onChange: setEmailNewReview,
              label: "Nueva reseña",
              sub: "Recibir un email cuando un cliente deja una reseña sobre tu restaurante",
            },
            {
              value: emailDailySummary,
              onChange: setEmailDailySummary,
              label: "Resumen diario",
              sub: "Recibir un resumen cada mañana con las reservas del día",
            },
          ].map(({ value, onChange, label, sub }) => (
            <div
              key={label}
              className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border bg-background"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
              </div>
              <Toggle value={value} onChange={onChange} />
            </div>
          ))}

          <SaveButton saving={saving === "notificaciones"} />
        </section>
      </form>

      {/* ══ SECCIÓN 4: Cuenta ══ */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-5">
        <SectionHeader
          icon={Calendar}
          title="Cuenta"
          sub="Seguridad y gestión de tu cuenta"
        />

        <div className="space-y-3">
          {/* Change password */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
            <div>
              <p className="text-sm font-medium text-foreground">Contraseña</p>
              <p className="text-xs text-muted-foreground mt-0.5">Actualizá tu contraseña de acceso</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setChangePwOpen(true)}
            >
              <Lock className="w-4 h-4 mr-2" />
              Cambiar contraseña
            </Button>
          </div>

          {/* Sign out */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
            <div>
              <p className="text-sm font-medium text-foreground">Cerrar sesión</p>
              <p className="text-xs text-muted-foreground mt-0.5">Salir de tu cuenta en este dispositivo</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>

          {/* Deactivate */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5">
            <div>
              <p className="text-sm font-medium text-destructive">Desactivar cuenta</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tu restaurante dejará de ser visible en la plataforma
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setDeactivateOpen(true)}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Desactivar
            </Button>
          </div>
        </div>
      </section>

      {/* ══ MODAL: Cambiar contraseña ══ */}
      <Dialog open={changePwOpen} onOpenChange={setChangePwOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
            <DialogDescription>
              Ingresá tu contraseña actual y luego la nueva contraseña.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleChangePassword} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Contraseña actual</label>
              <PasswordInput
                value={currentPw}
                onChange={setCurrentPw}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Nueva contraseña</label>
              <PasswordInput
                value={newPw}
                onChange={setNewPw}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Confirmar nueva contraseña</label>
              <PasswordInput
                value={confirmPw}
                onChange={setConfirmPw}
                placeholder="Repetí la nueva contraseña"
                autoComplete="new-password"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setChangePwOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={savingPw}>
                {savingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : "Actualizar contraseña"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ══ MODAL: Desactivar cuenta ══ */}
      <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Desactivar cuenta</DialogTitle>
            <DialogDescription>
              Esta acción desactivará tu cuenta. Tu restaurante dejará de aparecer en la plataforma
              y los clientes no podrán hacer nuevas reservas. Podés reactivarla en cualquier momento
              contactando al soporte de GTG.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5 my-2">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">
              Tus datos, reservas, menú y configuración se conservarán. Solo se pausará la visibilidad del restaurante.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={deactivating}
            >
              {deactivating
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Desactivando...</>
                : "Confirmar desactivación"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
