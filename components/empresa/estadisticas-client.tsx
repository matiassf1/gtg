"use client";

import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MONTHS = ["Sep", "Oct", "Nov", "Dic", "Ene", "Feb"];

const reservasPorMes = [
  { mes: "Sep", reservas: 38 },
  { mes: "Oct", reservas: 52 },
  { mes: "Nov", reservas: 61 },
  { mes: "Dic", reservas: 84 },
  { mes: "Ene", reservas: 47 },
  { mes: "Feb", reservas: 59 },
];

const ratingPorMes = [
  { mes: "Sep", rating: 3.8 },
  { mes: "Oct", rating: 4.1 },
  { mes: "Nov", rating: 4.0 },
  { mes: "Dic", rating: 4.4 },
  { mes: "Ene", rating: 4.2 },
  { mes: "Feb", rating: 4.6 },
];

const platosPopulares = [
  { nombre: "Chuletón de buey",   pedidos: 143 },
  { nombre: "Croquetas de jamón", pedidos: 118 },
  { nombre: "Tortilla de patata", pedidos: 97  },
  { nombre: "Pulpo a la gallega", pedidos: 84  },
  { nombre: "Patatas bravas",     pedidos: 76  },
];

const clientesTipo = [
  { name: "Nuevos",      value: 134, color: "#39ff14" },
  { name: "Recurrentes", value: 207, color: "#22c55e" },
];

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, accent = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className={`bg-card border rounded-xl p-5 ${accent ? "border-primary/40" : "border-border"}`}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-3xl font-black mt-1 ${accent ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

// ─── Chart wrapper ────────────────────────────────────────────────────────────

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

const TooltipStyle = {
  contentStyle: {
    backgroundColor: "hsl(0 0% 8%)",
    border: "1px solid hsl(0 0% 14.9%)",
    borderRadius: "8px",
    fontSize: "12px",
    color: "hsl(0 0% 98%)",
  },
  cursor: { fill: "rgba(57,255,20,0.05)" },
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export function EstadisticasClient() {
  const totalReservas = reservasPorMes.reduce((s, d) => s + d.reservas, 0);
  const avgRating = (ratingPorMes.reduce((s, d) => s + d.rating, 0) / ratingPorMes.length).toFixed(1);
  const totalClientes = clientesTipo.reduce((s, d) => s + d.value, 0);
  const pctRecurrentes = Math.round((clientesTipo[1].value / totalClientes) * 100);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Estadísticas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Resumen de los últimos 6 meses
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Reservas totales" value={totalReservas} sub="últimos 6 meses" />
        <StatCard label="Valoración media" value={avgRating} sub="sobre 5 estrellas" accent />
        <StatCard label="Clientes únicos" value={totalClientes} sub="últimos 6 meses" />
        <StatCard label="Fidelización" value={`${pctRecurrentes}%`} sub="clientes recurrentes" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Reservas por mes */}
        <ChartCard title="Reservas por mes">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={reservasPorMes} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14.9%)" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "hsl(0 0% 63.9%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(0 0% 63.9%)" }} axisLine={false} tickLine={false} />
              <Tooltip {...TooltipStyle} formatter={(v: any) => [v ?? 0, "Reservas"]} />
              <Bar dataKey="reservas" fill="#39ff14" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Rating mensual */}
        <ChartCard title="Valoración media mensual">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ratingPorMes} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14.9%)" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "hsl(0 0% 63.9%)" }} axisLine={false} tickLine={false} />
              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: "hsl(0 0% 63.9%)" }} axisLine={false} tickLine={false} />
              <Tooltip {...TooltipStyle} formatter={(v: any) => [v?.toFixed(1) ?? "0.0", "Estrellas"]} />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="#39ff14"
                strokeWidth={2.5}
                dot={{ fill: "#39ff14", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#39ff14" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Platos más pedidos */}
        <ChartCard title="Platos más pedidos">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              layout="vertical"
              data={platosPopulares}
              margin={{ top: 4, right: 16, bottom: 0, left: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14.9%)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(0 0% 63.9%)" }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="nombre"
                width={150}
                tick={{ fontSize: 11, fill: "hsl(0 0% 63.9%)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip {...TooltipStyle} formatter={(v: any) => [v, "Pedidos"]} />
              <Bar dataKey="pedidos" fill="#39ff14" fillOpacity={0.85} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Clientes nuevos vs recurrentes */}
        <ChartCard title="Clientes nuevos vs recurrentes">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={clientesTipo}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {clientesTipo.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.9} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={TooltipStyle.contentStyle}
                formatter={(v: any, name: any) => [v, name]}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ fontSize: 12, color: "hsl(0 0% 63.9%)" }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 text-sm">
            {clientesTipo.map((d) => (
              <div key={d.name} className="text-center">
                <p className="text-2xl font-bold" style={{ color: d.color }}>{d.value}</p>
                <p className="text-xs text-muted-foreground">{d.name}</p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground/60 text-center pb-4">
        * Datos de ejemplo — se reemplazarán con datos reales a medida que el restaurante reciba actividad
      </p>
    </div>
  );
}
