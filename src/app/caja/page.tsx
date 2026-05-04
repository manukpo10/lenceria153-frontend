"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { fmtARS, fmtFecha } from "@/lib/format";
import { labelMedio, MedioPago } from "@/lib/mockVentas";
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
  Input,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  Wallet,
  Plus,
  Minus,
  Lock,
  Unlock,
  ChevronDown,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

type CajaEstado = {
  estado: "abierta" | "cerrada" | "pendiente_cierre";
  caja: any | null;
};

type Movimiento = {
  id: string;
  tipo: "ingreso" | "retiro" | "apertura" | "cierre" | "venta" | "gasto";
  monto: number;
  descripcion: string;
  usuarioNombre: string;
  createdAt: string;
};

type ArqueoData = {
  caja: any;
  movimientos: Movimiento[];
  resumen: Record<string, number>;
  ventasPorMedio: Record<string, { count: number; total: number }>;
  cantidadVentas: number;
  itemsVendidos: number;
};

const tipoLabels: Record<string, string> = {
  apertura: "Apertura",
  cierre: "Cierre",
  ingreso: "Ingreso",
  retiro: "Retiro",
  venta: "Venta",
  gasto: "Gasto",
};

const tipoColors: Record<string, string> = {
  apertura: "bg-emerald-50 text-emerald-700",
  cierre: "bg-slate-100 text-slate-700",
  ingreso: "bg-blue-50 text-blue-700",
  retiro: "bg-amber-50 text-amber-700",
  venta: "bg-accent-soft text-accent",
  gasto: "bg-rose-50 text-rose-700",
};

export default function CajaPage() {
  const [estado, setEstado] = useState<CajaEstado>({ estado: "cerrada", caja: null });
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [arqueoData, setArqueoData] = useState<ArqueoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showArqueo, setShowArqueo] = useState(false);
  const [showMovimiento, setShowMovimiento] = useState(false);
  const [showCierreResumen, setShowCierreResumen] = useState(false);
  const [cierreData, setCierreData] = useState<any>(null);
  const [movimientoTipo, setMovimientoTipo] = useState<"ingreso" | "retiro" | "gasto">("ingreso");
  const [movimientoMonto, setMovimientoMonto] = useState("");
  const [movimientoDesc, setMovimientoDesc] = useState("");
  const [aperturaMonto, setAperturaMonto] = useState("");
  const [cierreMonto, setCierreMonto] = useState("");
  const [toast, setToast] = useState<{ title: string; description: string } | null>(null);

  useEffect(() => {
    loadEstado();
  }, []);

  async function loadEstado() {
    try {
      const est: CajaEstado = await api.caja.estado() as CajaEstado;
      setEstado(est);
      if (est.estado === "abierta") {
        const movs = await api.caja.movimientos();
        setMovimientos(movs.slice(0, 50));
      }
    } catch {
      showToast("Error", "No se pudo cargar el estado de caja");
    }
  }

  async function handleAbrir() {
    setLoading(true);
    try {
      await api.caja.abrir(parseFloat(aperturaMonto) || 0);
      setAperturaMonto("");
      await loadEstado();
      showToast("Caja abierta", "La caja se abrió correctamente");
    } catch (err: any) {
      showToast("Error", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCerrar() {
    if (!cierreMonto) return;
    setLoading(true);
    try {
      const res = await api.caja.cerrar(parseFloat(cierreMonto));
      setCierreData(res);
      setShowCierreResumen(true);
    } catch (err: any) {
      showToast("Error", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmarCierre() {
    setShowCierreResumen(false);
    setLoading(true);
    try {
      await api.caja.confirmarCierre();
      setCierreMonto("");
      setCierreData(null);
      await loadEstado();
      showToast("Caja cerrada", "El cierre fue confirmado");
    } catch (err: any) {
      showToast("Error", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelarCierre() {
    setShowCierreResumen(false);
    setLoading(true);
    try {
      await api.caja.cancelarCierre();
      setCierreMonto("");
      setCierreData(null);
      await loadEstado();
      showToast("Cierre cancelado", "La caja sigue abierta");
    } catch (err: any) {
      showToast("Error", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMovimiento() {
    if (!movimientoMonto || !movimientoDesc) return;
    setLoading(true);
    try {
      await api.caja.movimiento({
        tipo: movimientoTipo,
        monto: parseFloat(movimientoMonto),
        descripcion: movimientoDesc,
      });
      setMovimientoMonto("");
      setMovimientoDesc("");
      setShowMovimiento(false);
      const movs = await api.caja.movimientos();
      setMovimientos(movs.slice(0, 50));
      const est: CajaEstado = await api.caja.estado() as CajaEstado;
      setEstado(est);
      showToast("Movimiento registrado", `${tipoLabels[movimientoTipo]}: ${fmtARS(parseFloat(movimientoMonto))}`);
    } catch (err: any) {
      showToast("Error", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleArqueo() {
    setLoading(true);
    try {
      const data = await api.caja.arqueo();
      setArqueoData(data);
      setShowArqueo(true);
    } catch (err: any) {
      showToast("Error", err.message);
    } finally {
      setLoading(false);
    }
  }

  function showToast(title: string, description: string) {
    setToast({ title, description });
    setTimeout(() => setToast(null), 4000);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-ink-soft font-medium">Estado de caja</div>
          <div className="flex items-center gap-2 mt-2">
            {estado.estado === "abierta" ? (
              <Badge tone={toast?.title === "Error" ? "danger" : "success"} dot><Unlock size={12} /> Abierta</Badge>
            ) : (
              <Badge tone="neutral" dot><Lock size={12} /> Cerrada</Badge>
            )}
          </div>
          {estado.caja && (
            <div className="mt-2 text-sm text-ink-muted">
              Abrió: {estado.caja.usuarioApertura} · {fmtFecha(estado.caja.fechaApertura!)}
            </div>
          )}
        </Card>

        {estado.estado === "abierta" && estado.caja && (
          <>
            <Card className="p-4">
              <div className="text-[11px] uppercase tracking-wide text-ink-soft font-medium">Monto de apertura</div>
              <div className="text-xl font-semibold text-ink num mt-1">{fmtARS(estado.caja.montoApertura)}</div>
            </Card>
            <Card className="p-4">
              <div className="text-[11px] uppercase tracking-wide text-ink-soft font-medium">Monto sistema</div>
              <div className="text-xl font-semibold text-ink num mt-1">{fmtARS(estado.caja.montoSistema)}</div>
              <div className={cn(
                "text-xs font-medium mt-1 num",
                estado.caja.diferencia >= 0 ? "text-accent" : "text-rose-500"
              )}>
                {estado.caja.diferencia >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                Diferencia: {fmtARS(Math.abs(estado.caja.diferencia))}
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Action buttons */}
      <Card>
        <CardHeader title="Operaciones de caja" subtitle="Control de efectivo" />
        <div className="p-5 sm:pt-0 flex flex-wrap gap-2 sm:gap-3">
          {estado.estado === "cerrada" ? (
            <div className="flex items-end gap-3 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-medium text-ink-muted mb-1.5 block">Monto de apertura</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={aperturaMonto}
                  onChange={(e) => setAperturaMonto(e.target.value)}
                />
              </div>
              <Button variant="accent" onClick={handleAbrir} disabled={loading}>
                <Unlock size={16} /> Abrir caja
              </Button>
            </div>
          ) : estado.estado === "pendiente_cierre" ? (
            <div className="space-y-3">
              <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Hay un cierre pendiente sin confirmar. Cancelá el cierre para continuar.
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleCancelarCierre} disabled={loading}>
                  <Unlock size={16} /> Cancelar cierre
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => { setMovimientoTipo("ingreso"); setShowMovimiento(true); }}>
                <Plus size={15} /> Ingreso
              </Button>
              <Button variant="outline" onClick={() => { setMovimientoTipo("retiro"); setShowMovimiento(true); }}>
                <Minus size={15} /> Retiro
              </Button>
              <Button variant="outline" onClick={() => { setMovimientoTipo("gasto"); setShowMovimiento(true); }}>
                <Minus size={15} /> Gasto
              </Button>
              <Button variant="outline" onClick={handleArqueo} disabled={loading}>
                <TrendingUp size={15} /> Arqueo
              </Button>
            </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <div className="flex-1 min-w-[160px]">
                  <label className="text-xs font-medium text-ink-muted mb-1.5 block">Monto real en caja</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={cierreMonto}
                    onChange={(e) => setCierreMonto(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="danger" onClick={handleCerrar} disabled={loading || !cierreMonto} full className="h-10">
                    <Lock size={14} /> Cerrar caja
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Movements */}
      {estado.estado === "abierta" && (
        <Card>
          <CardHeader title="Movimientos" subtitle="Últimos movimientos del día" />
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Hora</TH>
                  <TH>Tipo</TH>
                  <TH>Descripción</TH>
                  <TH>Usuario</TH>
                  <TH className="text-right">Monto</TH>
                </TR>
              </THead>
              <TBody>
                {movimientos.map((m) => (
                  <TR key={m.id}>
                    <TD className="text-ink num">{new Date(m.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</TD>
                    <TD>
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", tipoColors[m.tipo])}>
                        {tipoLabels[m.tipo]}
                      </span>
                    </TD>
                    <TD className="text-ink text-sm max-w-[250px] truncate">{m.descripcion}</TD>
                    <TD className="text-ink-soft text-sm">{m.usuarioNombre}</TD>
                    <TD className={cn(
                      "text-right font-semibold num",
                      ["apertura", "ingreso", "venta"].includes(m.tipo) ? "text-accent" : "text-ink"
                    )}>
                      {["apertura", "ingreso", "venta"].includes(m.tipo) ? "+" : "−"}{fmtARS(m.monto)}
                    </TD>
                  </TR>
                ))}
                {movimientos.length === 0 && (
                  <TR>
                    <TD colSpan={5} className="text-center text-ink-soft py-8">Sin movimientos aún</TD>
                  </TR>
                )}
              </TBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Movimiento modal */}
      <Modal
        open={showMovimiento}
        onClose={() => setShowMovimiento(false)}
        title={movimientoTipo === "ingreso" ? "Registrar ingreso" : movimientoTipo === "retiro" ? "Registrar retiro" : "Registrar gasto"}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowMovimiento(false)}>Cancelar</Button>
            <Button
              variant="accent"
              onClick={handleMovimiento}
              disabled={loading || !movimientoMonto || !movimientoDesc}
            >
              Confirmar
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-ink mb-1.5">Monto</div>
            <Input
              type="number"
              placeholder="0.00"
              value={movimientoMonto}
              onChange={(e) => setMovimientoMonto(e.target.value)}
            />
          </div>
          <div>
            <div className="text-sm font-medium text-ink mb-1.5">Descripción</div>
            <Input
              placeholder="Motivo del movimiento"
              value={movimientoDesc}
              onChange={(e) => setMovimientoDesc(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Arqueo modal */}
      <Modal
        open={showArqueo}
        onClose={() => setShowArqueo(false)}
        title="Arqueo de caja"
        subtitle={arqueoData ? fmtFecha(arqueoData.caja.fechaApertura!) : ""}
        footer={
          <div className="flex justify-end">
            <Button variant="accent" onClick={() => setShowArqueo(false)}>Aceptar</Button>
          </div>
        }
      >
        {arqueoData && (
          <div className="space-y-5">
            {/* System amount banner */}
            <div className="bg-gradient-to-br from-brand-50 to-brand-100 border border-brand-200 rounded-2xl p-5 text-center">
              <div className="text-xs font-semibold uppercase text-brand-600 tracking-wider mb-1">Monto sistema</div>
              <div className="text-4xl font-bold text-brand-700 num">{fmtARS(arqueoData.caja.montoSistema)}</div>
              <div className="text-xs text-brand-500 mt-1">Según movimientos registrados</div>
            </div>

            {/* Day summary */}
            <div className="bg-surface-subtle rounded-xl p-4">
              <div className="text-xs font-semibold uppercase text-ink-soft tracking-wider mb-3">Resumen del día</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="text-[10px] uppercase text-ink-soft mb-2">Apertura</div>
                  <div className="text-lg font-bold text-ink num">{fmtARS(arqueoData.resumen.apertura)}</div>
                </div>
                <div className="text-center bg-accent-soft rounded-lg py-2">
                  <div className="text-[10px] uppercase text-accent mb-2">Ventas</div>
                  <div className="text-lg font-bold text-ink num">{fmtARS(arqueoData.resumen.ventas)}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] uppercase text-ink-soft mb-2">Ingresos</div>
                  <div className="text-lg font-bold text-ink num">{fmtARS(arqueoData.resumen.ingresos)}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] uppercase text-ink-soft mb-2">Retiros</div>
                  <div className="text-lg font-bold text-ink num">{fmtARS(arqueoData.resumen.retiros)}</div>
                </div>
              </div>
            </div>

            {/* Sales by payment method */}
            <div className="bg-surface-subtle rounded-xl p-4">
              <div className="text-xs font-semibold uppercase text-ink-soft tracking-wider mb-3">Ventas por medio de pago</div>
              <div className="space-y-2">
                {(Object.keys(arqueoData.ventasPorMedio) as MedioPago[]).map((m) => {
                  const v = arqueoData.ventasPorMedio[m];
                  if (!v || v.count === 0) return null;
                  return (
                    <div key={m} className="flex items-center justify-between py-2 px-3 bg-surface rounded-lg border border-line">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">
                          {labelMedio[m].charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-ink">{labelMedio[m]}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-ink-soft">{v.count} ventas</span>
                        <span className="text-sm font-bold text-ink num">{fmtARS(v.total)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
              <div className="bg-surface rounded-xl p-4 text-center border border-line">
                <div className="text-3xl sm:text-4xl font-bold text-ink mb-1">{arqueoData.cantidadVentas}</div>
                <div className="text-xs text-ink-soft uppercase tracking-wider">Ventas</div>
              </div>
              <div className="bg-surface rounded-xl p-4 text-center border border-line">
                <div className="text-3xl sm:text-4xl font-bold text-ink mb-1">{arqueoData.itemsVendidos}</div>
                <div className="text-xs text-ink-soft uppercase tracking-wider">Productos</div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Cierre Resumen modal */}
      <Modal
        open={showCierreResumen}
        onClose={() => setShowCierreResumen(false)}
        title="Cierre de caja"
        subtitle={cierreData ? `Apertura: ${fmtFecha(cierreData.caja.fechaApertura)}` : ""}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancelarCierre} disabled={loading}>Cancelar</Button>
            <Button variant="accent" onClick={handleConfirmarCierre} disabled={loading}>Confirmar cierre</Button>
          </div>
        }
      >
        {cierreData && (
          <div className="space-y-5">
            {/* Main result banner */}
            <div className={cn(
              "rounded-2xl p-6 text-center",
              cierreData.resumen.diferencia === 0 
                ? "bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200" 
                : "bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200"
            )}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {cierreData.resumen.diferencia === 0 ? (
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xl">✓</div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center text-xl">!</div>
                )}
                <span className="text-lg font-semibold text-ink">
                  {cierreData.resumen.diferencia === 0 ? "Caja cuadrada" : "Diferencia"}
                </span>
              </div>
              <div className={cn(
                "text-4xl font-bold num",
                cierreData.resumen.diferencia === 0 ? "text-emerald-600" : "text-amber-600"
              )}>
                {cierreData.resumen.diferencia === 0 ? fmtARS(cierreData.resumen.totalSistema) : fmtARS(cierreData.resumen.diferencia)}
              </div>
              {cierreData.resumen.diferencia !== 0 && (
                <div className="text-sm text-ink-soft mt-1">
                  Sistema: {fmtARS(cierreData.resumen.totalSistema)} · Real: {fmtARS(cierreData.resumen.totalReal)}
                </div>
              )}
            </div>

            {/* System vs Real */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface rounded-xl p-4 border border-line">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase text-ink-soft tracking-wider">Sistema</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">S</div>
                </div>
                <div className="text-2xl font-bold text-ink num">{fmtARS(cierreData.resumen.totalSistema)}</div>
              </div>
              <div className="bg-surface rounded-xl p-4 border border-line">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase text-ink-soft tracking-wider">Real</span>
                  <div className="w-8 h-8 rounded-lg bg-ink text-white flex items-center justify-center text-sm font-bold">R</div>
                </div>
                <div className="text-2xl font-bold text-ink num">{fmtARS(cierreData.resumen.totalReal)}</div>
              </div>
            </div>

            {/* Day summary */}
            <div className="bg-surface-subtle rounded-xl p-4">
              <div className="text-xs font-semibold uppercase text-ink-soft tracking-wider mb-3">Resumen del día</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="text-[10px] uppercase text-ink-soft mb-2">Apertura</div>
                  <div className="text-lg font-bold text-ink num">{fmtARS(cierreData.resumen.apertura)}</div>
                </div>
                <div className="text-center bg-accent-soft rounded-lg py-2">
                  <div className="text-[10px] uppercase text-accent mb-2">Ventas</div>
                  <div className="text-lg font-bold text-ink num">{fmtARS(cierreData.resumen.ventas)}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] uppercase text-ink-soft mb-2">Ingresos</div>
                  <div className="text-lg font-bold text-ink num">{fmtARS(cierreData.resumen.ingresos)}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] uppercase text-ink-soft mb-2">Retiros</div>
                  <div className="text-lg font-bold text-ink num">{fmtARS(cierreData.resumen.retiros)}</div>
                </div>
              </div>
            </div>

            {/* Sales by payment method */}
            <div className="bg-surface-subtle rounded-xl p-4">
              <div className="text-xs font-semibold uppercase text-ink-soft tracking-wider mb-3">Ventas por medio de pago</div>
              <div className="space-y-2">
                {(Object.keys(cierreData.ventasPorMedio) as MedioPago[]).map((m) => {
                  const v = cierreData.ventasPorMedio[m] as any;
                  if (!v || v.count === 0) return null;
                  return (
                    <div key={m} className="flex items-center justify-between py-2 px-3 bg-surface rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">
                          {labelMedio[m].charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-ink">{labelMedio[m]}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-ink-soft">{v.count} ventas</span>
                        <span className="text-sm font-bold text-ink num">{fmtARS(v.total)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
              <div className="bg-surface rounded-xl p-4 text-center border border-line">
                <div className="text-3xl sm:text-4xl font-bold text-ink mb-1">{cierreData.cantidadVentas}</div>
                <div className="text-xs text-ink-soft uppercase tracking-wider">Ventas</div>
              </div>
              <div className="bg-surface rounded-xl p-4 text-center border border-line">
                <div className="text-3xl sm:text-4xl font-bold text-ink mb-1">{cierreData.itemsVendidos}</div>
                <div className="text-xs text-ink-soft uppercase tracking-wider">Productos</div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-ink text-white px-4 py-3 rounded-xl shadow-pop max-w-sm">
          <div className="text-sm font-semibold">{toast.title}</div>
          <div className="text-xs text-ink-soft mt-0.5">{toast.description}</div>
        </div>
      )}
    </div>
  );
}