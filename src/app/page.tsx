"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { fmtARS, fmtFecha, fmtNum } from "@/lib/format";
import { labelMedio } from "@/lib/mockVentas";
import { DollarSign, ShoppingBag, Package, AlertTriangle, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, StatCard, Badge } from "@/components/ui";

function esHoy(s: string) {
  const d = new Date(s);
  const hoy = new Date();
  return d.toDateString() === hoy.toDateString();
}

export default function DashboardPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.productos.list().catch(() => []),
      api.ventas.list().catch(() => []),
    ]).then(([prods, vs]) => {
      setProductos(prods);
      setVentas(vs);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-6 text-ink-muted">Cargando…</div>;
  }

  const ventasHoy = ventas.filter((v: any) => esHoy(v.fecha));
  const totalHoy = ventasHoy.reduce((s: number, v: any) => s + v.total, 0);
  const itemsHoy = ventasHoy.reduce(
    (s: number, v: any) => s + v.items.reduce((x: number, i: any) => x + i.cantidad, 0),
    0
  );
  const stockBajo = productos.filter((p: any) => p.stock > 0 && p.stock <= 3).length;
  const sinStock = productos.filter((p: any) => p.stock === 0).length;

  const conteo = new Map<string, { desc: string; cant: number; total: number }>();
  for (const v of ventas as any[]) {
    for (const it of v.items) {
      const e = conteo.get(it.codigo) ?? { desc: it.descripcion, cant: 0, total: 0 };
      e.cant += it.cantidad;
      e.total += it.precio * it.cantidad;
      conteo.set(it.codigo, e);
    }
  }
  const top = Array.from(conteo.entries()).sort((a, b) => b[1].cant - a[1].cant).slice(0, 6);

  const dias: { label: string; total: number }[] = [];
  const hoy = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() - i);
    const total = (ventas as any[])
      .filter((v: any) => new Date(v.fecha).toDateString() === d.toDateString())
      .reduce((s: number, v: any) => s + v.total, 0);
    dias.push({
      label: d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }),
      total,
    });
  }
  const maxDia = Math.max(...dias.map((d) => d.total), 1);
  const totalSemanal = dias.slice(-7).reduce((s, d) => s + d.total, 0);
  const totalSemanalAnterior = dias.slice(0, 7).reduce((s, d) => s + d.total, 0);
  const trendPct = totalSemanalAnterior > 0 ? ((totalSemanal - totalSemanalAnterior) / totalSemanalAnterior) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          accent="accent"
          label="Ventas hoy"
          value={fmtARS(totalHoy)}
          hint={`${ventasHoy.length} operaciones`}
          icon={<DollarSign size={18} />}
          trend={{ value: `${Math.abs(trendPct).toFixed(1)}%`, positive: trendPct >= 0 }}
        />
        <StatCard
          accent="sky"
          label="Productos vendidos"
          value={fmtNum(itemsHoy)}
          hint="Hoy"
          icon={<ShoppingBag size={18} />}
        />
        <StatCard
          accent="brand"
          label="Catálogo"
          value={fmtNum(productos.length)}
          hint={`${new Set(productos.map((p: any) => p.rubro)).size} rubros`}
          icon={<Package size={18} />}
        />
        <StatCard
          accent="warning"
          label="Reposición"
          value={`${stockBajo + sinStock}`}
          hint={`${sinStock} sin stock · ${stockBajo} bajo`}
          icon={<AlertTriangle size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
<Card className="lg:col-span-2">
           <CardHeader
             title="Ventas — últimos 14 días"
             subtitle={`Total: ${fmtARS(totalSemanal)} · Promedio: ${fmtARS(Math.round(totalSemanal / 7))}/día`}
             action={
               <div className="flex items-center gap-1.5 text-[11px] text-ink-soft">
                 <TrendingUp size={12} className="text-brand-500" />
                 <span>Monto de ventas por día</span>
               </div>
             }
           />
           <div className="p-5 pt-3">
             <div className="flex gap-2">
               {/* Y Axis */}
               <div className="flex flex-col justify-between h-44 text-[10px] text-ink-soft text-right pr-2 select-none">
                 <span>{fmtARS(maxDia)}</span>
                 <span>{fmtARS(Math.round(maxDia * 0.75))}</span>
                 <span>{fmtARS(Math.round(maxDia * 0.5))}</span>
                 <span>{fmtARS(Math.round(maxDia * 0.25))}</span>
                 <span>$0</span>
               </div>
               {/* Bars */}
               <div className="flex-1 flex items-end gap-1.5 h-44">
                 {dias.map((d, i) => {
                   const pct = Math.max((d.total / maxDia) * 100, 4);
                   const isToday = dias.length - 1 === i;
                   return (
                     <div key={i} className="group flex-1 h-full flex flex-col justify-end items-center relative">
                       <div className="w-full rounded-md transition-all relative cursor-pointer"
                         style={{
                           height: `${pct}%`,
                           background: isToday
                             ? 'linear-gradient(to top, #2563eb, #3b82f6)'
                             : 'linear-gradient(to top, #94a3b8, #cbd5e1)'
                         }}>
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-ink text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 shadow-md">
                           {fmtARS(d.total)}
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
             </div>
             <div className="flex justify-between text-[10px] text-ink-soft px-2 mt-2">
               {dias.filter((_, i) => i % 2 === 0 || i === dias.length - 1).map((d, i) => (
                 <span key={i} className={dias[dias.length - 1] === d ? "text-brand-600 font-medium" : ""}>{d.label}</span>
               ))}
             </div>
             <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-line">
               <div className="flex items-center gap-2 text-xs">
                 <div className="w-3 h-3 rounded bg-brand-500" />
                 <span className="text-ink-soft">Hoy</span>
               </div>
               <div className="flex items-center gap-2 text-xs">
                 <div className="w-3 h-3 rounded bg-slate-400" />
                 <span className="text-ink-soft">Días anteriores</span>
               </div>
             </div>
           </div>
         </Card>

<Card>
           <CardHeader title="Medios de pago" subtitle="Ventas de hoy" />
           <div className="p-5 pt-0">
             {ventasHoy.length === 0 ? (
               <p className="text-sm text-ink-muted">Sin ventas todavía hoy.</p>
             ) : (
               <ul className="space-y-3">
                 {Object.entries(
                   ventasHoy.reduce<Record<string, number>>((acc: Record<string, number>, v: any) => {
                     acc[v.medioPago] = (acc[v.medioPago] ?? 0) + v.total;
                     return acc;
                   }, {})
                 )
                   .sort((a, b) => b[1] - a[1])
                   .map(([m, t]) => {
                     const pct = (t / totalHoy) * 100;
                     return (
                       <li key={m}>
                         <div className="flex justify-between text-sm">
                           <span className="text-ink">{labelMedio[m as keyof typeof labelMedio]}</span>
                           <span className="font-medium text-ink num">{fmtARS(t)}</span>
                         </div>
                         <div className="h-1.5 bg-surface-subtle rounded-full mt-1.5 overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-brand-500 to-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                         </div>
                       </li>
                     );
                   })}
               </ul>
             )}
           </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Más vendidos" subtitle="Últimos 30 días" />
          <ul className="divide-y divide-line">
            {top.map(([codigo, info], i) => (
              <li key={codigo} className="flex items-center gap-3 px-5 py-3">
                <div className="w-6 h-6 rounded-md text-xs font-semibold grid place-items-center bg-amber-100 text-amber-700">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-ink truncate">{info.desc}</div>
                  <div className="text-[11px] text-ink-soft">Cód. {codigo}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold text-ink num">{info.cant} u.</div>
                  <div className="text-[11px] text-ink-soft num">{fmtARS(info.total)}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

<Card>
           <CardHeader title="Últimas ventas" />
           <ul className="divide-y divide-line">
             {(ventas as any[]).slice(0, 6).map((v: any) => (
               <li key={v.id} className="flex items-center justify-between px-5 py-3">
                 <div className="min-w-0">
                   <div className="text-sm font-medium text-ink">#{v.numeroVenta ?? v.id.slice(0, 8)}</div>
                   <div className="text-[11px] text-ink-soft">{fmtFecha(v.fecha)} · {labelMedio[v.medioPago as keyof typeof labelMedio]}</div>
                 </div>
                 <div className="text-sm font-semibold text-ink num">{fmtARS(v.total)}</div>
               </li>
             ))}
           </ul>
         </Card>
      </div>
    </div>
  );
}