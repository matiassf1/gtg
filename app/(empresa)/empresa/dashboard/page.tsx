import { CalendarDays, Star, Users, Tag, Clock, CheckCircle2, XCircle, TrendingUp, MessageSquare, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const STATS = [
  {
    title: "Reservas hoy",
    value: "12",
    sub: "+3 vs ayer",
    icon: CalendarDays,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    trend: "up",
  },
  {
    title: "Valoración media",
    value: "4.7",
    sub: "↑ 0.2 este mes",
    icon: Star,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    trend: "up",
  },
  {
    title: "Clientes este mes",
    value: "284",
    sub: "+18% vs anterior",
    icon: Users,
    color: "text-primary",
    bg: "bg-primary/10",
    trend: "up",
  },
  {
    title: "Promociones activas",
    value: "2",
    sub: "Vencen en 5 días",
    icon: Tag,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    trend: "neutral",
  },
];

const RESERVAS_HOY = [
  { id: 1, name: "María García",   time: "12:30", guests: 4, status: "confirmada", phone: "+54 11 4567-8901" },
  { id: 2, name: "Carlos López",   time: "13:00", guests: 2, status: "pendiente",  phone: "+54 11 5678-9012" },
  { id: 3, name: "Ana Rodríguez",  time: "13:30", guests: 6, status: "confirmada", phone: "+54 11 6789-0123" },
  { id: 4, name: "Juan Martínez",  time: "14:00", guests: 3, status: "pendiente",  phone: "+54 11 7890-1234" },
  { id: 5, name: "Laura Sánchez",  time: "14:30", guests: 2, status: "confirmada", phone: "+54 11 8901-2345" },
  { id: 6, name: "Diego Fernández",time: "20:00", guests: 5, status: "pendiente",  phone: "+54 11 9012-3456" },
  { id: 7, name: "Sofía Morales",  time: "20:30", guests: 2, status: "confirmada", phone: "+54 11 0123-4567" },
];

const ACTIVIDAD = [
  { id: 1, type: "reserva",    icon: CalendarDays,  text: "Nueva reserva de Sofía Morales para 2 personas (20:30)",   time: "hace 5 min",  color: "text-blue-400" },
  { id: 2, type: "reseña",     icon: Star,          text: "Reseña de 5 estrellas de Ana Rodríguez: \"Excelente atención\"", time: "hace 22 min", color: "text-yellow-400" },
  { id: 3, type: "notif",      icon: Bell,          text: "Promoción 'Almuerzo 2x1' vence en 5 días",                 time: "hace 1h",     color: "text-purple-400" },
  { id: 4, type: "reserva",    icon: CalendarDays,  text: "Reserva cancelada por Pedro Gómez (13:00)",                time: "hace 2h",     color: "text-destructive" },
  { id: 5, type: "estadistica",icon: TrendingUp,    text: "Alcanzaste 100 clientes este mes, nuevo récord",           time: "hace 3h",     color: "text-primary" },
  { id: 6, type: "reseña",     icon: MessageSquare, text: "Nueva reseña de 4 estrellas de Luis Herrera",             time: "hace 5h",     color: "text-yellow-400" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === "confirmada") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
        <CheckCircle2 className="w-3 h-3" /> Confirmada
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-400">
      <Clock className="w-3 h-3" /> Pendiente
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmpresaDashboardPage() {
  const pendientes = RESERVAS_HOY.filter((r) => r.status === "pendiente").length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Page title */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-card border border-border rounded-xl p-4 space-y-3 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{stat.title}</span>
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Reservas del día */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h3 className="font-semibold text-foreground">Reservas de hoy</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{RESERVAS_HOY.length} reservas · {pendientes} pendientes</p>
            </div>
            <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
              {new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })}
            </Badge>
          </div>

          <div className="divide-y divide-border">
            {RESERVAS_HOY.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-3 hover:bg-accent/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                    {r.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{r.time}</p>
                    <p className="text-xs text-muted-foreground">{r.guests} personas</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Actividad reciente</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Últimos eventos</p>
          </div>

          <div className="divide-y divide-border">
            {ACTIVIDAD.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={a.id} className="flex gap-3 px-5 py-3">
                  <div className={`mt-0.5 shrink-0 ${a.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-foreground leading-relaxed line-clamp-2">{a.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{a.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
