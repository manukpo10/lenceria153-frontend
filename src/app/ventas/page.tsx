"use client";

import { useMemo, useState, useEffect } from "react";
import { api } from "@/lib/api";
import { fmtARS, fmtFecha } from "@/lib/format";
import { labelMedio, MedioPago } from "@/lib/mockVentas";
import { Eye, Download, Trash2 } from "lucide-react";
import {
  Card,
  CardHeader,
  Button,
  Badge,
  Modal,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "@/components/ui";

type Periodo = "hoy" | "7d" | "30d";

export default function VentasPage() {
  const [periodo, setPeriodo] = useState<Periodo>("7d");
  const [medio, setMedio] = useState<"todos" | MedioPago>("todos");
  const [sel, setSel] = useState<any | null>(null);
  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    api.ventas.list().catch(() => []).then((data) => {
      setVentas(data);
      setLoading(false);
    });
  };

  useEffect(() => { reload(); }, []);

  const desde = useMemo(() => {
    const d = new Date();
    if (periodo === "hoy") d.setHours(0, 0, 0, 0);
    if (periodo === "7d") d.setDate(d.getDate() - 7);
    if (periodo === "30d") d.setDate(d.getDate() - 30);
    return d;
  }, [periodo]);

  const lista = useMemo(
    () =>
      ventas.filter((v: any) => {
        if (new Date(v.fecha) < desde) return false;
        if (medio !== "todos" && v.medioPago !== medio) return false;
        return true;
      }),
    [desde, medio, ventas]
  );

  const total = lista.reduce((s: number, v: any) => s + v.total, 0);
  const itemsTotal = lista.reduce(
    (s: number, v: any) => s + v.items.reduce((x: number, i: any) => x + i.cantidad, 0),
    0
  );
  const ticketProm = lista.length ? total / lista.length : 0;

  const handleDelete = async (venta: any) => {
    if (!venta.id) return;
    if (!confirm(`¿Eliminar la venta #${venta.numeroVenta ? String(venta.numeroVenta).padStart(4, '0') : venta.id.slice(0, 8)}? Se revertirá el stock.`)) return;
    try {
      await api.ventas.delete(venta.id);
      reload();
    } catch (err: any) {
      alert("Error al eliminar: " + (err.message ?? "verifique"));
    }
  };

  if (loading) return <div className="p-6 text-ink-muted">Cargando…</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-ink-soft font-medium">Ventas</div>
          <div className="text-xl font-semibold text-ink num mt-1">{lista.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-ink-soft font-medium">Facturado</div>
          <div className="text-xl font-semibold text-ink num mt-1">{fmtARS(total)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-ink-soft font-medium">Productos</div>
          <div className="text-xl font-semibold text-ink num mt-1">{itemsTotal}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-ink-soft font-medium">Ticket promedio</div>
          <div className="text-xl font-semibold text-ink num mt-1">{fmtARS(ticketProm)}</div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader
          title="Historial de ventas"
          subtitle="Filtrá por período y medio de pago"
          action={
            <Button variant="outline" size="sm">
              <Download size={14} /> Exportar
            </Button>
          }
        />

        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-line flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3">
          <div className="inline-flex p-0.5 bg-surface-muted rounded-lg border border-line">
            {(["hoy", "7d", "30d"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  periodo === p ? "bg-surface text-ink shadow-soft" : "text-ink-muted hover:text-ink"
                }`}
              >
                {p === "hoy" ? "Hoy" : p === "7d" ? "7 días" : "30 días"}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setMedio("todos")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                medio === "todos"
                  ? "bg-brand-600 text-white border-brand-600 shadow-brand"
                  : "bg-surface text-ink-muted border-line hover:text-ink"
              }`}
            >
              Todos los medios
            </button>
            {(Object.keys(labelMedio) as MedioPago[]).map((m) => (
              <button
                key={m}
                onClick={() => setMedio(m)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  medio === m
                    ? "bg-ink text-white border-ink"
                    : "bg-surface text-ink-muted border-line hover:text-ink"
                }`}
              >
                {labelMedio[m]}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <THead>
              <TR>
                <TH>Venta</TH>
                <TH>Fecha</TH>
                <TH>Medio de pago</TH>
                <TH className="text-right">Ítems</TH>
                <TH className="text-right">Total</TH>
                <TH></TH>
              </TR>
            </THead>
            <TBody>
              {lista.slice(0, 100).map((v: any) => (
                <TR key={v.id}>
                  <TD className="font-mono text-xs text-ink-muted">#{v.numeroVenta ? String(v.numeroVenta).padStart(4, '0') : v.id.slice(0, 8)}</TD>
                  <TD className="text-ink">{fmtFecha(v.fecha)}</TD>
                  <TD>
                    <Badge tone="neutral">{labelMedio[v.medioPago as keyof typeof labelMedio]}</Badge>
                  </TD>
                  <TD className="text-right num">
                    {v.items.reduce((s: number, i: any) => s + i.cantidad, 0)}
                  </TD>
                  <TD className="text-right font-semibold text-ink num">
                    {fmtARS(v.total)}
                  </TD>
                  <TD className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setSel(v)}>
                        <Eye size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(v)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
        {lista.length > 100 && (
          <div className="px-5 py-3 text-xs text-ink-soft text-center border-t border-line">
            Mostrando 100 de {lista.length} ventas
          </div>
        )}
      </Card>

      <Modal
        open={!!sel}
        onClose={() => setSel(null)}
        title={sel ? `Venta #${sel.id}` : ""}
        subtitle={sel ? `${fmtFecha(sel.fecha)} · ${labelMedio[sel.medio as keyof typeof labelMedio]}` : ""}
        footer={
          sel && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-ink-muted">Total</span>
              <span className="text-xl font-bold text-ink num">{fmtARS(sel.total)}</span>
            </div>
          )
        }
      >
        {sel && (
          <ul className="divide-y divide-line">
            {sel.items.map((it: any, i: number) => (
              <li key={i} className="px-5 py-3 flex justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <div className="text-ink truncate">{it.descripcion}</div>
                  <div className="text-[11px] text-ink-soft num">
                    {it.cantidad} × {fmtARS(it.precio)}
                  </div>
                </div>
                <div className="font-medium text-ink num">
                  {fmtARS(it.precio * it.cantidad)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
}