"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { apiClient } from "@/lib/apiClient";
import { fmtARS } from "@/lib/format";
import { Search, Plus, Pencil, AlertTriangle, CheckCircle2, XCircle, X, FileUp, Download, Upload, Minus, TrendingUp, RotateCcw, Eye, EyeOff, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import {
  Card,
  CardHeader,
  Button,
  Input,
  Badge,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  Modal,
} from "@/components/ui";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 25;

type Producto = {
  id?: string;
  codigo: string;
  descripcion: string;
  rubro: string;
  costo: number;
  precio: number;
  precioUnidad?: number;
  precioVenta?: number;
  precioUnidadLista?: number;
  precioUnidadVenta?: number;
  pack: number;
  unidad: number;
  stock: number;
  activo: boolean;
};

type ProductoErrors = Partial<Record<keyof Producto, string>>;

const RUBROS = [
  "ABROJOS","ALAMBRES","AGUJAS","BIES","BOTONES","CINTAS",
  "CIERRES","ELASTICOS","HILOS","LANAS","OTROS",
];

function ProductoModal({
  producto,
  onSave,
  onClose,
  loading,
}: {
  producto: Producto | null;
  onSave: (data: Producto) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}) {
  const [values, setValues] = useState<Producto>({
    codigo: "",
    descripcion: "",
    rubro: "ABROJOS",
    costo: 0,
    precio: 0,
    precioVenta: undefined,
    precioUnidadLista: undefined,
    precioUnidadVenta: undefined,
    unidad: 1,
    pack: 1,
    stock: 0,
    activo: true,
  });
  const [errors, setErrors] = useState<ProductoErrors>({});
  const [calcPercent, setCalcPercent] = useState("");
  const [calcLoading, setCalcLoading] = useState(false);

  useEffect(() => {
    if (producto) {
      setValues({
        codigo: producto.codigo ?? "",
        descripcion: producto.descripcion ?? "",
        rubro: producto.rubro ?? "ABROJOS",
        costo: producto.costo ?? 0,
        precio: producto.precio ?? 0,
        precioVenta: producto.precioVenta,
        precioUnidadLista: producto.precioUnidadLista,
        precioUnidadVenta: producto.precioUnidadVenta,
        unidad: producto.unidad ?? 1,
        pack: producto.pack ?? 1,
        stock: producto.stock ?? 0,
        activo: producto.activo ?? true,
      });
    } else {
      setValues({ codigo: "", descripcion: "", rubro: "ABROJOS", costo: 0, precio: 0, precioVenta: undefined, precioUnidadLista: undefined, precioUnidadVenta: undefined, unidad: 1, pack: 1, stock: 0, activo: true });
    }
    setErrors({});
  }, [producto]);

  function validate(): boolean {
    const e: ProductoErrors = {};
    if (!values.codigo.trim()) e.codigo = "Requerido";
    if (!values.descripcion.trim()) e.descripcion = "Requerido";
    if (!values.rubro) e.rubro = "Requerido";
    if (values.costo < 0) e.costo = "No puede ser negativo";
    if (values.precio <= 0) e.precio = "Debe ser mayor a 0";
    if (values.pack < 1) e.pack = "Mínimo 1";
    if (values.stock < 0) e.stock = "No puede ser negativo";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSave(values);
  }

  async function handleCalcularPrecio() {
    if (!producto?.id || !calcPercent) return;
    const pct = parseFloat(calcPercent);
    if (isNaN(pct) || pct <= 0) return;
    setCalcLoading(true);
    try {
      const result: any = await api.productos.calcularPrecioVenta(producto.id, pct);
      if (result.precioVenta) {
        setValues((v) => ({
          ...v,
          precioVenta: result.precioVenta,
          precioUnidadVenta: result.precioUnidadVenta,
        }));
        setCalcPercent("");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error al calcular: " + (err.message ?? "verifique"));
    } finally {
      setCalcLoading(false);
    }
  }

  function set(field: keyof Producto, value: any) {
    setValues((v) => {
      const next = { ...v, [field]: value };
      const pack = field === "pack" ? value : next.pack;
      const precio = field === "precio" ? value : next.precio;
      const precioVenta = field === "precioVenta" ? value : next.precioVenta;
      if (field === "pack" || field === "precio") {
        if (typeof precio === "number" && precio > 0 && typeof pack === "number" && pack > 0) {
          next.precioUnidadLista = Math.round((precio / pack) * 100) / 100;
        }
      }
      if (field === "pack" || field === "precioVenta") {
        if (typeof precioVenta === "number" && precioVenta > 0 && typeof pack === "number" && pack > 0) {
          next.precioUnidadVenta = Math.round((precioVenta / pack) * 100) / 100;
        }
      }
      return next;
    });
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  type FieldDef = {
  key: keyof Producto;
  label: string;
  type: string;
  placeholder?: string;
  col: string;
  step?: string;
  options?: string[];
};

  const fields: FieldDef[] = [
    { key: "codigo", label: "Código", type: "text", placeholder: "Ej: 322", col: "sm:col-span-2" },
    { key: "rubro", label: "Rubro", type: "select", options: RUBROS, col: "sm:col-span-2" },
    { key: "descripcion", label: "Descripción", type: "text", placeholder: "Nombre del producto", col: "col-span-4" },
    { key: "costo", label: "Costo ($)", type: "number", step: "0.01", col: "sm:col-span-2" },
    { key: "precio", label: "P. lista ($)", type: "number", step: "0.01", col: "sm:col-span-2" },
    { key: "precioVenta", label: "P. venta ($)", type: "number", step: "0.01", col: "sm:col-span-2" },
    { key: "precioUnidadLista", label: "P.U. lista ($)", type: "number", step: "0.01", col: "sm:col-span-2" },
    { key: "precioUnidadVenta", label: "P.U. venta ($)", type: "number", step: "0.01", col: "sm:col-span-2" },
    { key: "pack", label: "Pack", type: "number", step: "1", col: "sm:col-span-2" },
    { key: "unidad", label: "Unidades", type: "number", step: "1", col: "sm:col-span-2" },
    { key: "stock", label: "Stock", type: "number", step: "1", col: "sm:col-span-2" },
    { key: "activo", label: "Activo", type: "checkbox", col: "col-span-4" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-[#1e293b] border border-[#334155] rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh] animate-slide-up"
      >
        <div className="px-6 py-4 border-b border-[#334155] flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[#f1f5f9]">
              {producto?.id ? "Editar producto" : "Nuevo producto"}
            </h3>
            <p className="text-xs text-[#94a3b8] mt-0.5">
              {producto?.id ? "Modificá los datos del producto" : "Completá los datos del nuevo producto"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748b] hover:text-[#f1f5f9] hover:bg-[#334155] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 grid grid-cols-4 gap-4">
            {fields.map((f) => {
              if (f.type === "select") {
                return (
                  <div key={f.key} className={cn("flex flex-col gap-1", f.col)}>
                    <label className="text-xs font-medium text-[#cbd5e1] uppercase tracking-wider">{f.label}</label>
                    <select
                      value={values[f.key] as string}
                      onChange={(e) => set(f.key, e.target.value)}
                      className="bg-[#334155]/60 border border-[#475569]/60 rounded-xl px-3 py-2.5 text-sm text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    >
                      {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    {errors[f.key] && <span className="text-xs text-red-400">{errors[f.key]}</span>}
                  </div>
                );
              }
              if (f.type === "checkbox") {
                return (
                  <div key={f.key} className={cn("flex items-center gap-2 col-span-4", f.col)}>
                    <input
                      type="checkbox"
                      checked={values[f.key] as boolean}
                      onChange={(e) => set(f.key, e.target.checked)}
                      className="w-4 h-4 rounded border-[#475569] bg-[#334155] text-indigo-500 focus:ring-indigo-500/50"
                    />
                    <label className="text-sm text-[#cbd5e1]">{f.label}</label>
                  </div>
                );
              }
              return (
                <div key={f.key} className={cn("flex flex-col gap-1", f.col)}>
                  <label className="text-xs font-medium text-[#cbd5e1] uppercase tracking-wider">{f.label}</label>
                  <input
                    type={f.type}
                    step={f.step}
                    value={values[f.key] == null ? "" : (values[f.key] as string | number)}
                    onChange={(e) => set(f.key, f.type === "number" ? (e.target.value === "" ? undefined : parseFloat(e.target.value)) : e.target.value)}
                    placeholder={f.placeholder}
                    className="bg-[#334155]/60 border border-[#475569]/60 rounded-xl px-3 py-2.5 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                  {errors[f.key] && <span className="text-xs text-red-400">{errors[f.key]}</span>}
                </div>
              );
            })}
          </div>

          {producto?.id && (
            <div className="px-6 py-3 border-t border-[#334155] bg-[#0f172a]/30">
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#94a3b8]">Calcular precio de venta:</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={calcPercent}
                  onChange={(e) => setCalcPercent(e.target.value)}
                  placeholder="%"
                  className="w-20 bg-[#334155]/60 border border-[#475569]/60 rounded-lg px-2 py-1.5 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <span className="text-sm text-[#64748b]">%</span>
                <button
                  type="button"
                  onClick={handleCalcularPrecio}
                  disabled={calcLoading || !calcPercent || parseFloat(calcPercent) <= 0}
                  className="px-3 py-1.5 rounded-lg bg-[#6366f1]/20 text-[#818cf8] text-sm font-medium hover:bg-[#6366f1]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {calcLoading ? "Calculando..." : "Aplicar"}
                </button>
              </div>
            </div>
          )}

          <div className="px-6 py-4 border-t border-[#334155] flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading} className="border-[#475569] text-[#94a3b8] hover:text-[#f1f5f9]">
              Cancelar
            </Button>
            <Button type="submit" variant="accent" disabled={loading}>
              {producto?.id ? "Guardar cambios" : "Crear producto"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StockCell({ producto, onSet }: { producto: Producto; onSet: (p: Producto, n: number) => Promise<void> }) {
  const [valor, setValor] = useState<string>(String(producto.stock ?? 0));
  const [editing, setEditing] = useState(false);

  useEffect(() => { if (!editing) setValor(String(producto.stock ?? 0)); }, [producto.stock, editing]);

  const guardar = async () => {
    setEditing(false);
    const n = parseInt(valor, 10);
    if (Number.isNaN(n) || n === producto.stock) {
      setValor(String(producto.stock ?? 0));
      return;
    }
    await onSet(producto, n);
  };

  const ajustar = (delta: number) => onSet(producto, (producto.stock ?? 0) + delta);

  const stock = producto.stock ?? 0;
  const tono = stock === 0 ? "border-red-300 text-red-700" : stock <= 3 ? "border-amber-300 text-amber-700" : "border-emerald-300 text-emerald-700";

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => ajustar(-1)}
        disabled={stock <= 0}
        className="w-6 h-6 inline-flex items-center justify-center rounded border border-line text-ink-muted hover:text-ink hover:border-line-strong disabled:opacity-30"
        aria-label="Restar 1"
      >
        <Minus size={12} />
      </button>
      <input
        type="number"
        min={0}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        onFocus={(e) => { setEditing(true); e.target.select(); }}
        onBlur={guardar}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") { setValor(String(producto.stock ?? 0)); setEditing(false); (e.target as HTMLInputElement).blur(); }
        }}
        className={cn(
          "w-14 h-6 px-1.5 text-center text-xs font-medium num rounded border bg-surface focus:outline-none focus:ring-1 focus:ring-brand-400",
          tono
        )}
      />
      <button
        type="button"
        onClick={() => ajustar(1)}
        className="w-6 h-6 inline-flex items-center justify-center rounded border border-line text-ink-muted hover:text-ink hover:border-line-strong"
        aria-label="Sumar 1"
      >
        <Plus size={12} />
      </button>
    </div>
  );
}

function SortableTH({
  label,
  sortKey,
  current,
  dir,
  onClick,
  align,
  className,
}: {
  label: string;
  sortKey: keyof Producto;
  current: keyof Producto | null;
  dir: "asc" | "desc";
  onClick: (k: keyof Producto) => void;
  align?: "left" | "right" | "center";
  className?: string;
}) {
  const active = current === sortKey;
  const alignClass = align === "right" ? "text-right" : align === "center" ? "text-center" : "";
  const justifyClass = align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";
  return (
    <TH className={cn(alignClass, className)}>
      <button
        type="button"
        onClick={() => onClick(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 select-none hover:text-ink transition-colors w-full",
          justifyClass,
          active ? "text-ink" : "text-ink-muted"
        )}
      >
        <span>{label}</span>
        {active ? (
          dir === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
        )}
      </button>
    </TH>
  );
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [rubro, setRubro] = useState<string>("TODOS");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof Producto | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const toggleSort = (key: keyof Producto) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else { setSortKey(null); setSortDir("asc"); }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };
  const [showInactive, setShowInactive] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProducto, setEditProducto] = useState<Producto | null>(null);
  const [saving, setSaving] = useState(false);
  const [rubrosList, setRubrosList] = useState<string[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);
  const [importFullResponse, setImportFullResponse] = useState<any>({});
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState(false);
  const [importMode, setImportMode] = useState<"all" | "create_only" | "update_only" | "update_precio">("all");
  const [showCalcPrecios, setShowCalcPrecios] = useState(false);
  const [calcPorcentaje, setCalcPorcentaje] = useState("50");
  const [calcLoading, setCalcLoading] = useState(false);

  useEffect(() => {
    const params = showInactive ? { activo: false } : {};
    api.productos.list(params).catch(() => []).then((data: any[]) => {
      setProductos(data);
      setLoading(false);
    });
    api.productos.getRubros().catch(() => []).then((data: string[]) => {
      setRubrosList(data);
    });
  }, [showInactive]);

  const reload = useCallback(() => {
    setLoading(true);
    api.productos.list().catch(() => []).then((data: any[]) => {
      setProductos(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async (values: Producto) => {
    setSaving(true);
    try {
      if (editProducto?.id) {
        await api.productos.update(editProducto.id, values);
      } else {
        await api.productos.create(values);
      }
      setModalOpen(false);
      setEditProducto(null);
      reload();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (producto: Producto) => {
    setEditProducto(producto);
    setModalOpen(true);
  };

  const handleNew = () => {
    setEditProducto(null);
    setModalOpen(true);
  };

  const handleDelete = async (producto: Producto) => {
    if (!producto.id || !confirm(`Eliminar "${producto.descripcion}"?`)) return;
    try {
      await api.productos.delete(producto.id);
      reload();
    } catch (err: any) {
      alert("Error al eliminar: " + (err.message ?? "verifique"));
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!confirm(`Eliminar ${ids.length} producto${ids.length === 1 ? "" : "s"}? Esta acción no se puede deshacer.`)) return;
    setBulkDeleting(true);
    try {
      const results = await Promise.allSettled(ids.map((id) => api.productos.delete(id)));
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) alert(`${ids.length - failed} eliminados, ${failed} con error.`);
      setSelectedIds(new Set());
      reload();
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectPage = (visibles: Producto[]) => {
    const ids = visibles.map((p) => p.id).filter((x): x is string => !!x);
    const allSelected = ids.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const selectAllFiltered = (filtrados: Producto[]) => {
    const ids = filtrados.map((p) => p.id).filter((x): x is string => !!x);
    setSelectedIds(new Set(ids));
  };

  const handleReactivate = async (producto: Producto) => {
    if (!producto.id) return;
    try {
      await api.productos.update(producto.id, { ...producto, activo: true });
      reload();
    } catch (err: any) {
      alert("Error al activar: " + (err.message ?? "verifique"));
    }
  };

  const handleCleanup = async () => {
    if (!confirm("Eliminar definitivamente todos los productos inactivos de la base de datos?")) return;
    try {
      const res: any = await api.productos.cleanup(0);
      alert(res.message ?? "Limpieza completada");
      setShowInactive(false);
      reload();
    } catch (err: any) {
      alert("Error en cleanup: " + (err.message ?? "verifique"));
    }
  };

  const handleResetStock = async () => {
    if (!confirm("Resetear stock a 999 en todos los productos?")) return;
    try {
      const res: any = await api.productos.resetStock(999);
      alert(`Stock reseteado: ${res.actualizados} productos a stock ${res.stock}`);
      reload();
    } catch (err: any) {
      alert("Error al resetear stock: " + (err.message ?? "verifique"));
    }
  };

  const handleExportStockCsv = async () => {
    try {
      const blob: Blob = await api.productos.exportStockCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stock-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Error al exportar: " + err.message);
    }
  };

  const handleImportStockCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm(`Importar stock desde ${file.name}? Va a actualizar el stock de los productos cuyo código exista.`)) {
      e.target.value = "";
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result: any = await api.productos.importStockCsv(formData);
      const partes = [`${result.updated ?? 0} actualizados`];
      if (result.notFound) partes.push(`${result.notFound} sin código`);
      if (result.invalid) partes.push(`${result.invalid} inválidos`);
      alert("Stock importado: " + partes.join(", "));
      reload();
    } catch (err: any) {
      alert("Error al importar stock: " + err.message);
    } finally {
      e.target.value = "";
    }
  };

  const handleCalcPrecios = async () => {
    const pct = parseFloat(calcPorcentaje);
    if (isNaN(pct)) { alert("Porcentaje inválido"); return; }
    setCalcLoading(true);
    try {
      const result: any = await apiClient.productos.calcularPreciosVenta(pct);
      alert(`Precios de venta calculados: ${result.actualizados} productos actualizados con ${pct}%`);
      setShowCalcPrecios(false);
      reload();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setCalcLoading(false);
    }
  };

  const handleSetStock = async (producto: Producto, nuevoStock: number) => {
    if (!producto.id) return;
    const stock = Math.max(0, Math.floor(nuevoStock));
    const previo = producto.stock;
    setProductos((prev) => prev.map((p) => (p.id === producto.id ? { ...p, stock } : p)));
    try {
      await api.productos.setStock(producto.id, stock);
    } catch (err: any) {
      setProductos((prev) => prev.map((p) => (p.id === producto.id ? { ...p, stock: previo } : p)));
      alert("Error al guardar stock: " + err.message);
    }
  };

  const handleImportPDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const data: any = await api.productos.importPdf(formData);
      console.log("RESPUESTA COMPLETA:", JSON.stringify(data, null, 2));
      if ((data.productos || []).length === 0 && data.debug_texto) {
        alert("No se detectaron productos. Texto extraído del PDF:\n\n" + data.debug_texto);
      }
      setImportData(data.productos || []);
      setImportFullResponse(data);
      setImportPreview(true);
      setShowImportModal(true);
    } catch (err: any) {
      alert("Error al importar: " + err.message);
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const handleConfirmImport = async () => {
    setImporting(true);
    try {
      const result: any = await api.productos.importConfirm(importData, importMode);
      const partes = [
        `${result.created ?? 0} nuevos`,
        `${result.updated ?? 0} actualizados`,
      ];
      if (result.skipped) partes.push(`${result.skipped} omitidos`);
      alert("Importación: " + partes.join(", "));
      setShowImportModal(false);
      setImportPreview(false);
      setImportData([]);
      reload();
    } catch (err: any) {
      alert("Error al confirmar import: " + err.message);
    } finally {
      setImporting(false);
    }
  };

  const rubros = useMemo(() => {
    const all = [...new Set([...rubrosList, ...productos.map((p) => p.rubro)])];
    return all.sort();
  }, [productos, rubrosList]);

  const filtrados = useMemo(() => {
    let res = productos;
    if (rubro !== "TODOS") res = res.filter((p) => p.rubro === rubro);
    if (q.trim()) {
      const term = q.toLowerCase();
      res = res.filter((p) => p.codigo.includes(term) || p.descripcion.toLowerCase().includes(term));
    }
    if (sortKey) {
      const dir = sortDir === "asc" ? 1 : -1;
      res = [...res].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
        return String(av).localeCompare(String(bv), "es", { numeric: true }) * dir;
      });
    }
    return res;
  }, [productos, q, rubro, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const visibles = filtrados.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const sinStockCount = productos.filter((p) => p.stock === 0).length;
  const stockBajoCount = productos.filter((p) => p.stock > 0 && p.stock <= 3).length;

  const chips = ["TODOS", ...rubros];

  const rubroBgColors: Record<string, string> = {
    ABROJOS: "bg-amber-50", ALAMBRES: "bg-gray-100", AGUJAS: "bg-red-50",
    BIES: "bg-pink-50", BOTONES: "bg-orange-50", CINTAS: "bg-yellow-50",
    CIERRES: "bg-green-50", ELASTICOS: "bg-emerald-50", HILOS: "bg-blue-50",
    LANAS: "bg-violet-50", OTROS: "bg-slate-100",
  };
  const rubroDotColors: Record<string, string> = {
    ABROJOS: "bg-amber-400", ALAMBRES: "bg-gray-400", AGUJAS: "bg-red-400",
    BIES: "bg-pink-400", BOTONES: "bg-orange-400", CINTAS: "bg-yellow-400",
    CIERRES: "bg-green-400", ELASTICOS: "bg-emerald-400", HILOS: "bg-blue-400",
    LANAS: "bg-violet-400", OTROS: "bg-slate-400",
  };
  const rubroTextColors: Record<string, string> = {
    ABROJOS: "text-amber-700", ALAMBRES: "text-gray-700", AGUJAS: "text-red-700",
    BIES: "text-pink-700", BOTONES: "text-orange-700", CINTAS: "text-yellow-700",
    CIERRES: "text-green-700", ELASTICOS: "text-emerald-700", HILOS: "text-blue-700",
    LANAS: "text-violet-700", OTROS: "text-slate-700",
  };

  if (loading) return <div className="p-6 text-ink-muted">Cargando…</div>;

  if (importing) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-line"></div>
          <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
        </div>
        <div>
          <p className="text-base font-medium text-ink">Importando productos</p>
          <p className="text-sm text-ink-muted mt-1">Esto puede tardar unos segundos…</p>
        </div>
      </div>
    </div>
  );

  if (calcLoading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-line"></div>
          <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
        </div>
        <div>
          <p className="text-base font-medium text-ink">Calculando precios de venta</p>
          <p className="text-sm text-ink-muted mt-1">Esto puede tardar unos segundos…</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-ink-soft font-medium">Catálogo</div>
          <div className="text-xl font-semibold text-ink num mt-1">{productos.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-ink-soft font-medium">Rubros</div>
          <div className="text-xl font-semibold text-ink num mt-1">{rubros.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-ink-soft font-medium">Stock bajo</div>
          <div className="text-xl font-semibold text-amber-600 num mt-1">{stockBajoCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-ink-soft font-medium">Sin stock</div>
          <div className="text-xl font-semibold text-red-600 num mt-1">{sinStockCount}</div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader
          title="Productos"
          subtitle={`${filtrados.length} de ${productos.length}${showInactive ? ' (incluye inactivos)' : ''}`}
          action={
            <div className="flex flex-wrap gap-1.5">
              <label className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-line text-xs font-medium text-ink-muted hover:text-ink hover:border-line-strong cursor-pointer transition-colors">
                <FileUp size={13} />
                <span className="hidden sm:inline">Importar PDF</span>
                <span className="sm:hidden">PDF</span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleImportPDF}
                  disabled={importing}
                />
              </label>
              <Button variant="outline" size="sm" onClick={handleExportStockCsv} title="Descargar CSV con codigo,descripcion,stock">
                <Download size={13} /> <span className="hidden sm:inline">Exportar stock</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowCalcPrecios(true)} title="Calcular precios de venta">
                <TrendingUp size={13} /> <span className="hidden sm:inline">Calcular precios</span>
              </Button>
              <label className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-line text-xs font-medium text-ink-muted hover:text-ink hover:border-line-strong cursor-pointer transition-colors" title="Subir CSV con codigo,stock">
                <Upload size={13} />
                <span className="hidden sm:inline">Importar stock</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleImportStockCsv}
                />
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInactive(!showInactive)}
              >
                {showInactive ? <EyeOff size={13} /> : <Eye size={13} />}
                <span className="hidden sm:inline">{showInactive ? "Ocultar inactivos" : "Ver inactivos"}</span>
              </Button>
              {showInactive && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleCleanup}
                >
                  <Trash2 size={13} />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetStock}
                title="Resetear stock a 999 en todos los productos"
              >
                <RotateCcw size={13} />
              </Button>
              <Button onClick={handleNew} size="sm"><Plus size={14} /><span className="hidden sm:inline">Nuevo</span></Button>
            </div>
          }
        />

        <div className="px-5 py-4 border-b border-line space-y-3">
          <Input
            sizeVariant="md"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Buscar por código o descripción…"
            leading={<Search size={16} />}
          />
          <div className="flex gap-1.5 flex-wrap">
            {chips.map((c) => {
              const active = rubro === c;
              return (
                <button
                  key={c}
                  onClick={() => { setRubro(c); setPage(1); }}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                    active
                      ? "bg-brand-600 text-white border-brand-600 shadow-brand"
                      : "bg-surface text-ink-muted border-line hover:text-ink hover:border-line-strong"
                  )}
                >
                  {c === "TODOS" ? "Todos" : c}
                </button>
              );
            })}
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="px-5 py-2.5 border-b border-line bg-amber-50 dark:bg-amber-900/10 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-ink font-medium">{selectedIds.size} seleccionado{selectedIds.size === 1 ? "" : "s"}</span>
              {selectedIds.size < filtrados.filter((p) => p.id).length && (
                <button
                  type="button"
                  onClick={() => selectAllFiltered(filtrados)}
                  className="text-accent hover:underline"
                >
                  Seleccionar todos los {filtrados.filter((p) => p.id).length} filtrados
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="text-ink-muted hover:text-ink hover:underline"
              >
                Limpiar selección
              </button>
            </div>
            <Button variant="danger" size="sm" onClick={handleBulkDelete} disabled={bulkDeleting}>
              <Trash2 size={13} />
              {bulkDeleting ? "Eliminando..." : `Eliminar ${selectedIds.size}`}
            </Button>
          </div>
        )}

        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
          <Table>
            <THead>
              <TR>
                <TH className="w-8">
                  <input
                    type="checkbox"
                    aria-label="Seleccionar todos los filtrados"
                    title="Seleccionar todos los filtrados"
                    checked={(() => {
                      const ids = filtrados.map((p) => p.id).filter((x): x is string => !!x);
                      return ids.length > 0 && ids.every((id) => selectedIds.has(id));
                    })()}
                    onChange={() => {
                      const ids = filtrados.map((p) => p.id).filter((x): x is string => !!x);
                      const allSelected = ids.length > 0 && ids.every((id) => selectedIds.has(id));
                      if (allSelected) setSelectedIds(new Set());
                      else setSelectedIds(new Set(ids));
                    }}
                    className="w-4 h-4 rounded border-line cursor-pointer"
                  />
                </TH>
                <SortableTH label="Código" sortKey="codigo" current={sortKey} dir={sortDir} onClick={toggleSort} />
                <SortableTH label="Descripción" sortKey="descripcion" current={sortKey} dir={sortDir} onClick={toggleSort} />
                <SortableTH label="Rubro" sortKey="rubro" current={sortKey} dir={sortDir} onClick={toggleSort} className="hidden sm:table-cell" />
                <SortableTH label="P. lista" sortKey="precio" current={sortKey} dir={sortDir} onClick={toggleSort} align="right" />
                <SortableTH label="P. venta" sortKey="precioVenta" current={sortKey} dir={sortDir} onClick={toggleSort} align="right" />
                <SortableTH label="P.U. lista" sortKey="precioUnidadLista" current={sortKey} dir={sortDir} onClick={toggleSort} align="right" className="hidden md:table-cell" />
                <SortableTH label="P.U. venta" sortKey="precioUnidadVenta" current={sortKey} dir={sortDir} onClick={toggleSort} align="right" className="hidden md:table-cell" />
                <SortableTH label="Pack" sortKey="pack" current={sortKey} dir={sortDir} onClick={toggleSort} align="center" className="hidden sm:table-cell" />
                <SortableTH label="Stock" sortKey="stock" current={sortKey} dir={sortDir} onClick={toggleSort} />
                <TH></TH>
              </TR>
            </THead>
            <TBody>
              {visibles.map((p) => {
                const bg = rubroBgColors[p.rubro] ?? "bg-slate-100";
                const dot = rubroDotColors[p.rubro] ?? "bg-slate-400";
                const txt = rubroTextColors[p.rubro] ?? "text-slate-700";
                return (
                  <TR key={p.id ?? p.codigo} className={cn(p.id && selectedIds.has(p.id) && "bg-amber-50/40 dark:bg-amber-900/5")}>
                    <TD className="w-8">
                      {p.id && (
                        <input
                          type="checkbox"
                          aria-label={`Seleccionar ${p.descripcion}`}
                          checked={selectedIds.has(p.id)}
                          onChange={() => toggleSelect(p.id!)}
                          className="w-4 h-4 rounded border-line cursor-pointer"
                        />
                      )}
                    </TD>
                    <TD className="font-mono text-xs text-ink-muted">{p.codigo}</TD>
                    <TD className="text-ink max-w-[160px] sm:max-w-none">
                      <span className="truncate block">{p.descripcion}</span>
                    </TD>
                    <TD className="hidden sm:table-cell">
                      <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium", bg, txt)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />
                        {p.rubro}
                      </span>
                    </TD>
                    <TD className="text-right font-medium text-ink num">{fmtARS(p.precio)}</TD>
                    <TD className="text-right font-medium text-ink num">{p.precioVenta != null ? fmtARS(p.precioVenta) : "—"}</TD>
                    <TD className="hidden md:table-cell text-right text-ink num font-medium">{p.precioUnidadLista ? fmtARS(p.precioUnidadLista) : "—"}</TD>
                    <TD className="hidden md:table-cell text-right text-ink num font-medium">{p.precioUnidadVenta ? fmtARS(p.precioUnidadVenta) : "—"}</TD>
                    <TD className="hidden sm:table-cell text-center text-ink-soft text-xs">{p.pack && p.pack > 1 ? `x${p.pack}` : "—"}</TD>
                    <TD>
                      {p.id ? (
                        <StockCell producto={p} onSet={handleSetStock} />
                      ) : p.stock === 0 ? (
                        <Badge tone="danger" dot><XCircle size={11} />Sin stock</Badge>
                      ) : p.stock <= 3 ? (
                        <Badge tone="warning" dot><AlertTriangle size={11} />{p.stock} u.</Badge>
                      ) : (
                        <Badge tone="success" dot><CheckCircle2 size={11} />{p.stock} u.</Badge>
                      )}
                    </TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {p.activo === false && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReactivate(p)}
                            title="Reactivar"
                            className="text-emerald-600 hover:text-emerald-500"
                          >
                            <CheckCircle2 size={14} />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(p)} aria-label="Editar">
                          <Pencil size={14} />
                        </Button>
                        {p.id && (
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(p)} aria-label="Eliminar" className="hover:text-red-500">
                            <XCircle size={14} />
                          </Button>
                        )}
                      </div>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-line flex items-center justify-between text-sm">
          <span className="text-ink-soft">Página {page} de {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente</Button>
          </div>
        </div>
      </Card>

      {modalOpen && (
        <ProductoModal
          producto={editProducto}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditProducto(null); }}
          loading={saving}
        />
      )}

      {showImportModal ? (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-2xl shadow-pop w-full max-w-3xl flex flex-col max-h-[85vh] animate-slide-up">
            <div className="px-5 py-4 border-b border-line flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-ink">Importar productos desde PDF</h3>
                <p className="text-xs text-ink-muted mt-0.5">{importData.length} productos detectados</p>
              </div>
              <button onClick={() => { setShowImportModal(false); setImportData([]); }} className="p-1.5 rounded-md text-ink-muted hover:bg-surface-subtle hover:text-ink" aria-label="Cerrar">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {importData.length === 0 ? (
                <div>
                  {importFullResponse?.debug_texto ? (
                    <pre className="text-xs font-mono text-amber-800 bg-amber-50 p-3 rounded border border-amber-200 whitespace-pre-wrap max-h-64 overflow-auto mb-4">
                      {importFullResponse.debug_texto}
                    </pre>
                  ) : null}
                  {importFullResponse?.debug_lineas ? (
                    <pre className="text-xs font-mono text-blue-800 bg-blue-50 p-3 rounded border border-blue-200 whitespace-pre-wrap max-h-48 overflow-auto">
                      {importFullResponse.debug_lineas.join("\n")}
                    </pre>
                  ) : null}
                  <div className="text-center text-ink-muted py-4">No se detectaron productos</div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl border border-line bg-surface-subtle/40 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Modo de importación</div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {[
                        { v: "all", t: "Crear y actualizar", d: "Agrega los nuevos y actualiza todos los campos de los existentes" },
                        { v: "update_precio", t: "Solo actualizar precios", d: "No crea nuevos. Solo cambia el precio de los códigos que ya existen" },
                        { v: "update_only", t: "Actualizar existentes (todo)", d: "No crea nuevos. Actualiza precio, descripción, rubro, costo y stock" },
                        { v: "create_only", t: "Solo crear nuevos", d: "Ignora los códigos que ya existen. Solo agrega los productos nuevos" },
                      ].map((opt) => {
                        const active = importMode === opt.v;
                        return (
                          <label
                            key={opt.v}
                            className={cn(
                              "flex gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                              active ? "border-brand-500 bg-brand-50/40" : "border-line hover:border-line-strong"
                            )}
                          >
                            <input
                              type="radio"
                              name="importMode"
                              value={opt.v}
                              checked={active}
                              onChange={() => setImportMode(opt.v as any)}
                              className="mt-0.5"
                            />
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-ink">{opt.t}</div>
                              <div className="text-xs text-ink-muted">{opt.d}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-line">
                        <th className="text-left py-2 px-1 font-medium text-ink-muted">Codigo</th>
                        <th className="text-left py-2 px-1 font-medium text-ink-muted">Descripcion</th>
                        <th className="text-left py-2 px-1 font-medium text-ink-muted">Rubro</th>
                        <th className="text-right py-2 px-1 font-medium text-ink-muted">Costo</th>
                        <th className="text-right py-2 px-1 font-medium text-ink-muted">Precio de lista</th>
                        <th className="text-center py-2 px-1 font-medium text-ink-muted">Pack</th>
                        <th className="text-right py-2 px-1 font-medium text-ink-muted">P.U. lista</th>
                        <th className="text-right py-2 px-1 font-medium text-ink-muted">P.U. venta</th>
                        <th className="text-center py-2 px-1 font-medium text-ink-muted">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importData.map((p: any, idx: number) => (
                        <tr key={idx} className="border-b border-line/50">
                          <td className="py-2 px-1 font-mono text-xs text-ink-muted">{p.codigo}</td>
                          <td className="py-2 px-1 text-ink">{p.descripcion}</td>
                          <td className="py-2 px-1"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{p.rubro || "OTROS"}</span></td>
                          <td className="py-2 px-1 text-right text-ink-muted">{p.costo ? fmtARS(p.costo) : "—"}</td>
                          <td className="py-2 px-1 text-right font-medium text-ink">{p.precio ? fmtARS(p.precio) : "—"}</td>
                          <td className="py-2 px-1 text-center text-ink-soft">{p.pack && p.pack > 1 ? `x${p.pack}` : "—"}</td>
                          <td className="py-2 px-1 text-right text-ink-soft">{p.precioUnidadLista ? fmtARS(p.precioUnidadLista) : "—"}</td>
                          <td className="py-2 px-1 text-right text-ink-soft">{p.precioUnidadVenta ? fmtARS(p.precioUnidadVenta) : "—"}</td>
                          <td className="py-2 px-1 text-center text-ink-soft">{p.stock ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t border-line flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setShowImportModal(false); setImportData([]); }}>Cancelar</Button>
              <Button variant="primary" onClick={handleConfirmImport} disabled={importing || importData.length === 0}>
                {importing ? "Importando..." : "Importar " + importData.length + " productos"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {showCalcPrecios ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-surface rounded-2xl shadow-pop w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-ink">Calcular precios de venta</h3>
                <p className="text-xs text-ink-muted mt-0.5">Sube un porcentaje sobre el precio actual</p>
              </div>
              <button onClick={() => setShowCalcPrecios(false)} className="p-1.5 rounded-md text-ink-muted hover:bg-surface-subtle hover:text-ink" aria-label="Cerrar">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-ink-muted">Porcentaje a agregar (%)</label>
                <Input
                  sizeVariant="md"
                  type="number"
                  value={calcPorcentaje}
                  onChange={(e) => setCalcPorcentaje(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-ink-soft mt-1">Ej: 50 → precio + 50% = precioVenta</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowCalcPrecios(false)} className="flex-1">Cancelar</Button>
                <Button variant="primary" onClick={handleCalcPrecios} disabled={calcLoading} className="flex-1">
                  {calcLoading ? "Calculando..." : "Aplicar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}