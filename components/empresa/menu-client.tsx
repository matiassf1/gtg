"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  Plus, Pencil, Trash2, GripVertical, ImagePlus, X,
  Eye, EyeOff, Loader2, UtensilsCrossed,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type MenuItem = {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category: string;
  available: boolean;
  order: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ["Entrantes", "Principales", "Postres", "Bebidas", "Otros"];

const SELECT_CLASS =
  "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

// ─── ItemCard ─────────────────────────────────────────────────────────────────

function ItemCard({
  item,
  onEdit,
  onDelete,
  onToggleAvailable,
  isDragOver,
}: {
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  onToggleAvailable: () => Promise<void>;
  isDragOver: boolean;
}) {
  const [deleting,  setDeleting]  = useState(false);
  const [toggling,  setToggling]  = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await onDelete();
    setDeleting(false);
  }

  async function handleToggle() {
    setToggling(true);
    await onToggleAvailable();
    setToggling(false);
  }

  return (
    <div className={cn(
      "group flex gap-3 p-3 bg-card border border-border rounded-lg transition-all",
      isDragOver  && "border-primary/60 bg-primary/5 scale-[1.01]",
      !item.available && "opacity-60",
    )}>

      {/* Drag handle */}
      <div className="flex items-center text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing shrink-0 mt-1 touch-none">
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Image */}
      <div className="w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-muted-foreground/40" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>
          <span className="text-sm font-bold text-primary shrink-0 tabular-nums">
            ${item.price.toFixed(2)}
          </span>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-1.5 mt-2.5">

          {/* Available quick toggle */}
          <button
            type="button"
            onClick={handleToggle}
            disabled={toggling}
            className={cn(
              "inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors",
              item.available
                ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
                : "border-border bg-muted/60 text-muted-foreground hover:bg-accent",
            )}
          >
            {toggling ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : item.available ? (
              <Eye className="w-3 h-3" />
            ) : (
              <EyeOff className="w-3 h-3" />
            )}
            {item.available ? "Disponible" : "No disponible"}
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Edit — visible on hover */}
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {/* Delete — visible on hover */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
          >
            {deleting
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Trash2 className="w-3.5 h-3.5" />
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ItemModal ────────────────────────────────────────────────────────────────

function ItemModal({
  open,
  item,
  defaultCategory,
  onClose,
  onSave,
}: {
  open: boolean;
  item: MenuItem | null;
  defaultCategory: string;
  onClose: () => void;
  onSave: (fd: FormData) => Promise<void>;
}) {
  const [name,         setName]         = useState(item?.name         ?? "");
  const [description,  setDescription]  = useState(item?.description  ?? "");
  const [price,        setPrice]        = useState(item?.price?.toString() ?? "");
  const [category,     setCategory]     = useState(item?.category     ?? defaultCategory);
  const [available,    setAvailable]    = useState(item?.available    ?? true);
  const [imagePreview, setImagePreview] = useState<string | null>(item?.image ?? null);
  const [imageFile,    setImageFile]    = useState<File | null>(null);
  const [saving,       setSaving]       = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imageFile) URL.revokeObjectURL(imagePreview!);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    if (imageFile) URL.revokeObjectURL(imagePreview!);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    fd.append("name",        name);
    fd.append("description", description);
    fd.append("price",       price);
    fd.append("category",    category);
    fd.append("available",   String(available));
    if (imageFile) {
      fd.append("image", imageFile);
    } else if (imagePreview && item?.image) {
      fd.append("keepImage", "true");
    }
    await onSave(fd);
    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Editar plato" : "Nuevo plato"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nombre</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={80}
              placeholder="Ej: Milanesa napolitana"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Descripción{" "}
              <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              maxLength={300}
              placeholder="Ingredientes, alérgenos, información adicional..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          {/* Price + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Precio ($)</label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className={SELECT_CLASS}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Available */}
          <div className="flex items-center justify-between py-0.5">
            <div>
              <p className="text-sm font-medium">Disponible</p>
              <p className="text-xs text-muted-foreground">El plato aparece en la carta</p>
            </div>
            <button
              type="button"
              onClick={() => setAvailable(!available)}
              className={cn(
                "relative w-10 h-6 rounded-full transition-colors shrink-0",
                available ? "bg-primary" : "bg-muted",
              )}
            >
              <span className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200",
                available ? "left-5" : "left-1",
              )} />
            </button>
          </div>

          <Separator />

          {/* Image */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Foto{" "}
              <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>

            {imagePreview ? (
              <div className="relative w-full h-36 rounded-lg overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-primary/40 hover:bg-accent/20 transition-colors"
              >
                <ImagePlus className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Subir foto</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Footer buttons */}
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : item ? "Guardar cambios" : "Crear plato"
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── MenuClient (main export) ─────────────────────────────────────────────────

export function MenuClient({
  restaurantId,
  initialItems,
}: {
  restaurantId: string;
  initialItems: MenuItem[];
}) {
  const { toast }         = useToast();
  const [items,           setItems]           = useState<MenuItem[]>(initialItems);
  const [activeCategory,  setActiveCategory]  = useState(CATEGORIES[0]);
  const [modalOpen,       setModalOpen]       = useState(false);
  const [editingItem,     setEditingItem]     = useState<MenuItem | null>(null);
  const [dragId,          setDragId]          = useState<string | null>(null);
  const [dragOverId,      setDragOverId]      = useState<string | null>(null);

  const categoryItems = items
    .filter((i) => i.category === activeCategory)
    .sort((a, b) => a.order - b.order);

  const counts = Object.fromEntries(
    CATEGORIES.map((c) => [c, items.filter((i) => i.category === c).length])
  );

  // ── Modal helpers ──────────────────────────────────────────────────────────

  function openCreate() { setEditingItem(null); setModalOpen(true); }
  function openEdit(item: MenuItem) { setEditingItem(item); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditingItem(null); }

  // ── CRUD ───────────────────────────────────────────────────────────────────

  async function handleSave(fd: FormData) {
    try {
      if (editingItem) {
        const res = await fetch(`/api/empresa/menu/${editingItem.id}`, {
          method: "PATCH",
          body: fd,
        });
        if (!res.ok) throw new Error();
        const updated: MenuItem = await res.json();
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        toast({ title: "Plato actualizado" });
      } else {
        const catItems = items.filter((i) => i.category === fd.get("category"));
        fd.append("restaurantId", restaurantId);
        fd.append("order", String(catItems.length));
        const res = await fetch("/api/empresa/menu", { method: "POST", body: fd });
        if (!res.ok) throw new Error();
        const created: MenuItem = await res.json();
        setItems((prev) => [...prev, created]);
        toast({ title: "Plato creado" });
      }
      closeModal();
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/empresa/menu/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast({ title: "Plato eliminado" });
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" });
    }
  }

  async function handleToggleAvailable(item: MenuItem) {
    try {
      const res = await fetch(`/api/empresa/menu/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !item.available }),
      });
      if (!res.ok) throw new Error();
      const updated: MenuItem = await res.json();
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  // ── Drag & Drop ────────────────────────────────────────────────────────────

  async function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setDragOverId(null);
      return;
    }

    const catItems   = [...categoryItems];
    const fromIndex  = catItems.findIndex((i) => i.id === dragId);
    const toIndex    = catItems.findIndex((i) => i.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const [moved] = catItems.splice(fromIndex, 1);
    catItems.splice(toIndex, 0, moved);

    const reordered = catItems.map((item, idx) => ({ ...item, order: idx }));

    // Optimistic update
    setItems((prev) =>
      prev.map((i) => reordered.find((r) => r.id === i.id) ?? i)
    );
    setDragId(null);
    setDragOverId(null);

    try {
      await fetch("/api/empresa/menu/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: reordered.map(({ id, order }) => ({ id, order })) }),
      });
    } catch {
      toast({ title: "Error al reordenar", variant: "destructive" });
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Category tabs */}
      <div className="flex gap-0 border-b border-border overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
              activeCategory === cat
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
            )}
          >
            {cat}
            {counts[cat] > 0 && (
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-full",
                activeCategory === cat
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground",
              )}>
                {counts[cat]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Items list */}
      <div className="space-y-2">
        {categoryItems.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <UtensilsCrossed className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Sin platos en {activeCategory}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Agregá el primero haciendo clic abajo
              </p>
            </div>
          </div>
        ) : (
          categoryItems.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => setDragId(item.id)}
              onDragOver={(e) => { e.preventDefault(); if (dragId !== item.id) setDragOverId(item.id); }}
              onDrop={() => handleDrop(item.id)}
              onDragEnd={() => { setDragId(null); setDragOverId(null); }}
              className={cn(dragId === item.id && "opacity-40")}
            >
              <ItemCard
                item={item}
                onEdit={() => openEdit(item)}
                onDelete={() => handleDelete(item.id)}
                onToggleAvailable={() => handleToggleAvailable(item)}
                isDragOver={dragOverId === item.id}
              />
            </div>
          ))
        )}
      </div>

      {/* Add button */}
      <Button
        variant="outline"
        onClick={openCreate}
        className="w-full border-dashed hover:border-primary/40 hover:text-primary"
      >
        <Plus className="w-4 h-4 mr-1.5" />
        Agregar plato en {activeCategory}
      </Button>

      {/* Modal — key forces reset of internal state when switching between create/edit */}
      <ItemModal
        key={editingItem?.id ?? "new-item"}
        open={modalOpen}
        item={editingItem}
        defaultCategory={activeCategory}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
}
