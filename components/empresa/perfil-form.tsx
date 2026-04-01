"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Loader2, ImagePlus, X, Clock, CheckCircle2 } from "lucide-react";
import type { Restaurant } from "@prisma/client";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIAS = [
  "Tapas", "Cocina española", "Asador", "Marisquería", "Italiana",
  "Japonesa", "Mexicana", "Cocina de autor", "Vegetariana",
  "Pizza", "Hamburguesería", "Cafetería", "Pastelería", "Fusión", "Árabe",
];

const CIUDADES = [
  "Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao",
  "Málaga", "Zaragoza", "Murcia", "Palma", "Las Palmas", "Otra",
];

const DIAS = [
  { key: "lunes",     label: "Lunes"     },
  { key: "martes",    label: "Martes"    },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves",    label: "Jueves"    },
  { key: "viernes",   label: "Viernes"   },
  { key: "sabado",    label: "Sábado"    },
  { key: "domingo",   label: "Domingo"   },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type DaySchedule  = { open: string; close: string; closed: boolean };
type OpeningHours = Record<string, DaySchedule>;
type PhotoItem    = { url: string; file?: File };

function buildDefaultHours(): OpeningHours {
  return Object.fromEntries(
    DIAS.map(({ key }) => [key, { open: "09:00", close: "22:00", closed: key === "domingo" }])
  );
}

function parseHours(raw: unknown): OpeningHours {
  const defaults = buildDefaultHours();
  if (!raw || typeof raw !== "object") return defaults;
  const src = raw as Record<string, Record<string, unknown>>;
  for (const key of Object.keys(defaults)) {
    if (src[key]) {
      defaults[key] = {
        open:   String(src[key].open  ?? "09:00"),
        close:  String(src[key].close ?? "22:00"),
        closed: Boolean(src[key].closed ?? false),
      };
    }
  }
  return defaults;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </div>
      <Separator />
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PerfilForm({ restaurant }: { restaurant: Restaurant }) {
  const router      = useRouter();
  const { toast }   = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Básicos
  const [name,        setName]        = useState(restaurant.name        ?? "");
  const [description, setDescription] = useState(restaurant.description ?? "");
  const [category,    setCategory]    = useState(restaurant.category    ?? "");
  const [phone,       setPhone]       = useState(restaurant.phone       ?? "");

  // ── Ubicación
  const [address, setAddress] = useState(restaurant.address ?? "");
  const [city,    setCity]    = useState(restaurant.city    ?? "");

  // ── Horarios
  const [hours, setHours] = useState<OpeningHours>(() =>
    parseHours(restaurant.openingHours)
  );

  // ── Fotos
  const [photos,     setPhotos]     = useState<PhotoItem[]>(
    (restaurant.photos ?? []).map((url) => ({ url }))
  );
  const [isDragging, setIsDragging] = useState(false);

  // ── Loading
  const [saving, setSaving] = useState(false);

  // ─── Photo handlers ──────────────────────────────────────────────────────

  function addFiles(files: FileList | null) {
    if (!files) return;
    const remaining = 8 - photos.length;
    if (remaining <= 0) {
      toast({ title: "Máximo 8 fotos", description: "Elimina alguna para agregar más.", variant: "destructive" });
      return;
    }
    const incoming: PhotoItem[] = [];
    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      incoming.push({ url: URL.createObjectURL(file), file });
    }
    setPhotos((prev) => [...prev, ...incoming]);
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      const next = [...prev];
      const item = next[index];
      if (item.file) URL.revokeObjectURL(item.url);
      next.splice(index, 1);
      return next;
    });
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }

  // ─── Hours handler ───────────────────────────────────────────────────────

  function updateDay(key: string, field: keyof DaySchedule, value: string | boolean) {
    setHours((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  }

  // ─── Submit ──────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const fd = new FormData();
    fd.append("name",         name);
    fd.append("description",  description);
    fd.append("category",     category);
    fd.append("phone",        phone);
    fd.append("address",      address);
    fd.append("city",         city);
    fd.append("openingHours", JSON.stringify(hours));

    for (const photo of photos) {
      if (photo.file) {
        fd.append("photos", photo.file);
      } else {
        fd.append("existingPhotos", photo.url);
      }
    }

    try {
      const res = await fetch("/api/empresa/perfil", { method: "PATCH", body: fd });
      if (!res.ok) throw new Error();
      toast({ title: "¡Perfil guardado!", description: "Los cambios se han aplicado correctamente." });
      router.refresh();
    } catch {
      toast({ title: "Error al guardar", description: "Inténtalo de nuevo.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">

      {/* ── Datos básicos ──────────────────────────────────────────────────── */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-5">
        <SectionHeader
          title="Datos básicos"
          sub="Información principal de tu restaurante"
        />

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Nombre del restaurante</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={80}
            placeholder="Ej: La Parrilla del Norte"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Descripción</label>
            <span className={cn(
              "text-xs transition-colors",
              description.length > 450 ? "text-destructive" : "text-muted-foreground"
            )}>
              {description.length}/500
            </span>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder="Cuenta la historia de tu restaurante, tu propuesta gastronómica, qué te hace único..."
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className={SELECT_CLASS}
            >
              <option value="">Selecciona</option>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Teléfono</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+34 612 345 678"
              type="tel"
            />
          </div>
        </div>
      </section>

      {/* ── Ubicación ──────────────────────────────────────────────────────── */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-5">
        <SectionHeader
          title="Ubicación"
          sub="Dónde encontrar tu restaurante"
        />

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Dirección</label>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ej: Calle Gran Vía 28, 28013 Madrid"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Ciudad</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className={SELECT_CLASS}
          >
            <option value="">Selecciona</option>
            {CIUDADES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </section>

      {/* ── Horarios ───────────────────────────────────────────────────────── */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-5">
        <SectionHeader
          title="Horarios de atención"
          sub="Configura los días y horarios en que atiendes"
        />

        <div className="space-y-2">
          {DIAS.map(({ key, label }) => {
            const day = hours[key];
            return (
              <div
                key={key}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-lg border transition-colors",
                  day.closed ? "border-border bg-muted/20" : "border-border bg-background"
                )}
              >
                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => updateDay(key, "closed", !day.closed)}
                  aria-label={day.closed ? `Abrir ${label}` : `Cerrar ${label}`}
                  className={cn(
                    "relative w-9 h-5 rounded-full transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    day.closed ? "bg-muted" : "bg-primary"
                  )}
                >
                  <span className={cn(
                    "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200",
                    day.closed ? "left-0.5" : "left-[18px]"
                  )} />
                </button>

                {/* Day name */}
                <span className={cn(
                  "text-sm font-medium w-24 shrink-0 transition-colors",
                  day.closed && "text-muted-foreground"
                )}>
                  {label}
                </span>

                {/* Hours or "Cerrado" */}
                {day.closed ? (
                  <span className="text-xs text-muted-foreground italic">Cerrado</span>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <input
                        type="time"
                        value={day.open}
                        onChange={(e) => updateDay(key, "open", e.target.value)}
                        className="h-8 rounded border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">hasta</span>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <input
                        type="time"
                        value={day.close}
                        onChange={(e) => updateDay(key, "close", e.target.value)}
                        className="h-8 rounded border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Fotos ──────────────────────────────────────────────────────────── */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Fotos del restaurante</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Máximo 8 fotos · JPG, PNG o WEBP · La primera es la imagen principal
            </p>
          </div>
          <span className={cn(
            "text-xs font-semibold mt-1",
            photos.length >= 8 ? "text-destructive" : "text-muted-foreground"
          )}>
            {photos.length}/8
          </span>
        </div>
        <Separator />

        {/* Drop zone — only shown when under limit */}
        {photos.length < 8 && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all select-none",
              isDragging
                ? "border-primary bg-primary/5 scale-[0.99]"
                : "border-border hover:border-primary/40 hover:bg-accent/20"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
              isDragging ? "bg-primary/20" : "bg-muted"
            )}>
              <ImagePlus className={cn(
                "w-6 h-6 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {isDragging ? "Suelta para subir" : "Arrastra las fotos aquí"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                o haz clic para seleccionar · quedan {8 - photos.length} lugares
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </div>
        )}

        {/* Preview grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {photos.map((photo, i) => (
              <div
                key={i}
                className="relative group aspect-square rounded-lg overflow-hidden border border-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={`Foto ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-full bg-destructive flex items-center justify-center transition-opacity"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded font-medium pointer-events-none">
                    Principal
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Guardar ────────────────────────────────────────────────────────── */}
      <div className="flex justify-end pb-4">
        <Button type="submit" disabled={saving} size="lg" className="min-w-[160px]">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
