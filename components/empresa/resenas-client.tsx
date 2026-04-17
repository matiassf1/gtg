"use client";

import { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Star, MessageSquare, Reply, Filter } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReviewClient {
  id: string;
  rating: number;
  comment: string | null;
  response: string | null;
  createdAt: string;
  client: {
    user: { name: string | null; email: string; image: string | null };
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(iso));
}

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const sz = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sz} ${i <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

// ─── Review card ──────────────────────────────────────────────────────────────

interface CardProps {
  r: ReviewClient;
  onRespond: (id: string, text: string) => Promise<void>;
}

function ReviewCard({ r, onRespond }: CardProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(r.response ?? "");
  const [saving, setSaving] = useState(false);

  const name = r.client.user.name ?? r.client.user.email;
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  async function submit() {
    if (!text.trim()) return;
    setSaving(true);
    await onRespond(r.id, text.trim());
    setSaving(false);
    setOpen(false);
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10 shrink-0">
          <AvatarImage src={r.client.user.image ?? undefined} />
          <AvatarFallback className="text-xs bg-primary/20 text-primary font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="font-semibold text-sm text-foreground">{name}</p>
            <span className="text-xs text-muted-foreground">{fmtDate(r.createdAt)}</span>
          </div>
          <Stars rating={r.rating} />
        </div>
      </div>

      {/* Comment */}
      {r.comment && (
        <p className="text-sm text-foreground/90 leading-relaxed">{r.comment}</p>
      )}

      {/* Existing response */}
      {r.response && !open && (
        <div className="border-l-2 border-primary/40 pl-3 space-y-1">
          <p className="text-xs font-semibold text-primary flex items-center gap-1">
            <Reply className="w-3 h-3" /> Tu respuesta
          </p>
          <p className="text-sm text-muted-foreground">{r.response}</p>
          <button
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
            onClick={() => { setText(r.response ?? ""); setOpen(true); }}
          >
            Editar respuesta
          </button>
        </div>
      )}

      {/* Respond form */}
      {open ? (
        <div className="space-y-2">
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribí tu respuesta al cliente..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={submit} disabled={saving || !text.trim()}>
              {saving ? "Guardando..." : "Publicar respuesta"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : !r.response ? (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={() => setOpen(true)}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Responder
        </Button>
      ) : null}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  initialReviews: ReviewClient[];
}

type RatingFilter = 0 | 1 | 2 | 3 | 4 | 5;
type ResponseFilter = "all" | "responded" | "pending";

export function ResenasClient({ initialReviews }: Props) {
  const { toast } = useToast();
  const [reviews, setReviews] = useState(initialReviews);
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>(0);
  const [responseFilter, setResponseFilter] = useState<ResponseFilter>("all");

  // ── Stats ──────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    if (reviews.length === 0) return { avg: 0, total: 0, dist: [0, 0, 0, 0, 0] };
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    const dist = [5, 4, 3, 2, 1].map(
      (n) => reviews.filter((r) => r.rating === n).length
    );
    return { avg, total: reviews.length, dist };
  }, [reviews]);

  // ── Filtered ───────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return reviews
      .filter((r) => ratingFilter === 0 || r.rating === ratingFilter)
      .filter((r) => {
        if (responseFilter === "responded") return !!r.response;
        if (responseFilter === "pending") return !r.response;
        return true;
      });
  }, [reviews, ratingFilter, responseFilter]);

  // ── Respond ────────────────────────────────────────────────────────────────

  async function handleRespond(id: string, text: string) {
    try {
      const res = await fetch(`/api/empresa/resenas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: text }),
      });
      if (!res.ok) throw new Error();
      const updated: ReviewClient = await res.json();
      setReviews((prev) => prev.map((r) => (r.id === id ? updated : r)));
      toast({ title: "Respuesta publicada" });
    } catch {
      toast({ title: "Error al publicar respuesta", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reseñas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Lo que dicen tus clientes
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Average */}
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="text-5xl font-black text-foreground">
            {stats.avg > 0 ? stats.avg.toFixed(1) : "—"}
          </div>
          <div className="space-y-1">
            <Stars rating={Math.round(stats.avg)} size="lg" />
            <p className="text-sm text-muted-foreground">
              {stats.total} {stats.total === 1 ? "reseña" : "reseñas"}
            </p>
          </div>
        </div>

        {/* Distribution */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-1.5">
          {[5, 4, 3, 2, 1].map((n, i) => {
            const count = stats.dist[i];
            const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
            return (
              <div key={n} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-muted-foreground text-right">{n}</span>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 shrink-0" />
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-5 text-muted-foreground text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filtrar:</span>
        </div>
        <div className="flex items-center gap-1">
          {([0, 5, 4, 3, 2, 1] as RatingFilter[]).map((n) => (
            <button
              key={n}
              onClick={() => setRatingFilter(n)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                ratingFilter === n
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {n === 0 ? "Todas" : (
                <>{n} <Star className="w-3 h-3 fill-current" /></>
              )}
            </button>
          ))}
        </div>
        <select
          value={responseFilter}
          onChange={(e) => setResponseFilter(e.target.value as ResponseFilter)}
          className="h-8 rounded-full border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">Todas</option>
          <option value="responded">Respondidas</option>
          <option value="pending">Sin responder</option>
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MessageSquare className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-medium">
            {reviews.length === 0
              ? "Todavía no recibiste reseñas"
              : "No hay reseñas con esos filtros"}
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {filtered.map((r) => (
            <ReviewCard key={r.id} r={r} onRespond={handleRespond} />
          ))}
        </div>
      )}
    </div>
  );
}
