"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CornerDownLeft,
  X,
  Banknote,
  CreditCard,
  Smartphone,
  ArrowLeftRight,
  Wallet,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api";
import { fmtARS } from "@/lib/format";
import { labelMedio, MedioPago } from "@/lib/mockVentas";
import { Button, Card, Input, Badge, Kbd, Toast } from "@/components/ui";
import { cn } from "@/lib/utils";

type Item = { p: any; cant: number };

const medios: { id: MedioPago; icon: React.ReactNode }[] = [
  { id: "efectivo", icon: <Banknote size={16} /> },
  { id: "debito", icon: <CreditCard size={16} /> },
  { id: "credito", icon: <CreditCard size={16} /> },
  { id: "transferencia", icon: <ArrowLeftRight size={16} /> },
  { id: "qr", icon: <Smartphone size={16} /> },
];

export default function POSPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [medio, setMedio] = useState<MedioPago>("efectivo");
  const [active, setActive] = useState(0);
  const [toast, setToast] = useState<{ title: string; description: string } | null>(null);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    loadProductos();
  }, []);

  async function loadProductos() {
    try {
      const data = await api.productos.list({ activo: true }).catch(() => []);
      setProductos(data);
    } catch {
      setToast({ title: "Error", description: "No se pudieron cargar los productos" });
    }
  }

  const resultados = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return productos.slice(0, 30);
    return productos
      .filter((p) => p.codigo.includes(term) || p.descripcion.toLowerCase().includes(term))
      .slice(0, 30);
  }, [q, productos]);

  useEffect(() => setActive(0), [q]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const total = items.reduce((s, it) => s + (it.p.precioUnidadVenta ?? it.p.precioVenta ?? it.p.precio) * it.cant, 0);
  const cantidadTotal = items.reduce((s, it) => s + it.cant, 0);

  function agregar(producto: any) {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.p.id === producto.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], cant: next[idx].cant + 1 };
        return next;
      }
      return [...prev, { p: producto, cant: 1 }];
    });
  }

  function setCant(productoId: string, cant: number) {
    setItems((prev) =>
      cant <= 0
        ? prev.filter((i) => i.p.id !== productoId)
        : prev.map((i) => (i.p.id === productoId ? { ...i, cant } : i))
    );
  }

  const finalizar = useCallback(async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      await api.ventas.create({
        items: items.map((it) => ({ productoId: it.p.id, cantidad: it.cant })),
        medioPago: medio,
      });
      // Actualizar stock local
      setProductos((prev) =>
        prev.map((p) => {
          const it = items.find((i) => i.p.id === p.id);
          return it ? { ...p, stock: p.stock - it.cant } : p;
        })
      );
      setToast({
        title: "Venta registrada",
        description: `${items.length} productos · ${fmtARS(total)} · ${labelMedio[medio]}`,
      });
      setItems([]);
      setQ("");
      searchRef.current?.focus();
    } catch (err: any) {
      setToast({ title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  }, [items, medio, total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA";

      if (e.key === "/" && !isInput) {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key === "F9") {
        e.preventDefault();
        finalizar();
        return;
      }
      if (isInput && (e.target as HTMLInputElement).id === "pos-search") {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setActive((i) => Math.min(i + 1, resultados.length - 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setActive((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
          const p = resultados[active];
          if (p) { e.preventDefault(); agregar(p); }
        } else if (e.key === "Escape") {
          setQ("");
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finalizar, resultados, active]);

  return (
    <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 h-[calc(100vh-3.5rem)]">
      <section className="lg:col-span-8 flex flex-col min-h-0">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <Input
              id="pos-search"
              ref={searchRef}
              sizeVariant="xl"
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por código o descripción…"
              leading={<Search size={20} />}
              trailing={
                q ? (
                  <button onClick={() => setQ("")} className="p-1 rounded text-ink-soft hover:text-ink">
                    <X size={14} />
                  </button>
                ) : <Kbd>/</Kbd>
              }
            />
            <button onClick={loadProductos} className="ml-2 p-2 rounded-lg text-ink-muted hover:bg-surface-muted">
              <RefreshCw size={16} />
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs text-ink-soft">
            <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> navegar</span>
            <span className="flex items-center gap-1"><Kbd>↵</Kbd> agregar</span>
            <span className="flex items-center gap-1"><Kbd>Esc</Kbd> limpiar</span>
            <span className="flex items-center gap-1 ml-auto"><Kbd>F9</Kbd> cobrar</span>
          </div>
        </div>

        <Card className="flex-1 overflow-hidden flex flex-col">
          {resultados.length === 0 ? (
            <div className="flex-1 grid place-items-center text-center p-10">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-surface-subtle grid place-items-center mx-auto mb-3 text-ink-soft">
                  <Search size={20} />
                </div>
                <p className="text-sm text-ink-muted">Sin resultados para "{q}"</p>
              </div>
            </div>
          ) : (
            <ul ref={listRef} className="flex-1 overflow-y-auto divide-y divide-line">
              {resultados.map((p, idx) => {
                const isActive = idx === active;
                const stockTone = p.stock === 0 ? "danger" : p.stock <= 3 ? "warning" : "success";
                return (
                  <li
                    key={p.id}
                    data-idx={idx}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => agregar(p)}
                    className={cn(
                      "px-4 py-3 flex items-center gap-4 cursor-pointer transition-colors relative",
                      isActive ? "bg-brand-50" : "hover:bg-surface-muted"
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-brand-600 rounded-r-full" />
                    )}
                    <div className="w-14 shrink-0 font-mono text-[11px] text-ink-soft">{p.codigo}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-ink truncate">{p.descripcion}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge tone="neutral">{p.rubro}</Badge>
                        <Badge tone={stockTone} dot>
                          {p.stock === 0 ? "Sin stock" : `Stock ${p.stock}`}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold text-ink num">{p.precioUnidadVenta != null ? fmtARS(p.precioUnidadVenta) : p.precioVenta != null ? fmtARS(p.precioVenta) : fmtARS(p.precio)}</div>
                      {p.precioUnidadVenta != null && p.pack > 1 && (
                        <div className="text-[11px] text-ink-soft num">{fmtARS(p.precioUnidadVenta)} c/u</div>
                      )}
                    </div>
                    <div className={cn(
                      "shrink-0 w-9 h-9 rounded-lg grid place-items-center transition-all",
                      isActive ? "bg-brand-600 text-white shadow-brand" : "bg-surface-subtle text-ink-muted"
                    )}>
                      {isActive ? <CornerDownLeft size={16} /> : <Plus size={16} />}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </section>

      <aside className="lg:col-span-4 flex flex-col min-h-0">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-line flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-surface-subtle grid place-items-center">
                <ShoppingCart size={16} className="text-ink-muted" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-ink">Carrito</h2>
                <p className="text-[11px] text-ink-soft">{cantidadTotal} {cantidadTotal === 1 ? "producto" : "productos"}</p>
              </div>
            </div>
            {items.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setItems([])}>
                <Trash2 size={14} /> Vaciar
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="h-full grid place-items-center p-10 text-center">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-surface-subtle grid place-items-center mx-auto mb-3 text-ink-soft">
                    <ShoppingCart size={20} />
                  </div>
                  <p className="text-sm text-ink-muted">El carrito está vacío</p>
                  <p className="text-xs text-ink-soft mt-1">Usá <Kbd>/</Kbd> para buscar</p>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {items.map((it) => (
                  <li key={it.p.id} className="p-4">
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <div className="text-sm text-ink line-clamp-2">{it.p.descripcion}</div>
                        <div className="text-[11px] text-ink-soft mt-0.5 num">{fmtARS(it.p.precioUnidadVenta ?? it.p.precioVenta ?? it.p.precio)} c/u</div>
                      </div>
                      <button onClick={() => setCant(it.p.id, 0)} className="p-1 rounded text-ink-soft hover:text-red-600 hover:bg-red-50">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center bg-surface-muted rounded-lg p-0.5">
                        <button onClick={() => setCant(it.p.id, it.cant - 1)} className="w-7 h-7 grid place-items-center rounded-md text-ink-muted hover:bg-surface hover:text-ink">
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={it.cant}
                          onChange={(e) => setCant(it.p.id, parseInt(e.target.value) || 0)}
                          className="w-10 bg-transparent text-center text-sm font-medium num outline-none"
                        />
                        <button onClick={() => setCant(it.p.id, it.cant + 1)} className="w-7 h-7 grid place-items-center rounded-md text-ink-muted hover:bg-surface hover:text-ink">
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="font-semibold text-ink num">{fmtARS((it.p.precioUnidadVenta ?? it.p.precioVenta ?? it.p.precio) * it.cant)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-line p-4 space-y-4 bg-surface-muted/40">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Medio de pago</span>
                <Wallet size={14} className="text-ink-soft" />
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {medios.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMedio(m.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 px-2 py-2 rounded-lg border text-[11px] font-medium transition-colors",
                      medio === m.id
                        ? "bg-brand-600 text-white border-brand-600 shadow-brand"
                        : "bg-surface border-line text-ink-muted hover:text-ink hover:border-brand-400"
                    )}
                  >
                    {m.icon}
                    <span className="leading-none">{labelMedio[m.id]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end justify-between">
              <span className="text-sm text-ink-muted">Total</span>
              <span className="text-3xl font-bold text-ink num tracking-tight">{fmtARS(total)}</span>
            </div>

            <Button
              variant="accent"
              size="xl"
              full
              onClick={finalizar}
              disabled={items.length === 0 || loading}
              className="text-base"
            >
              {loading ? "Guardando…" : "Cobrar"}
              <Kbd className="bg-white/15 border-white/30 text-white ml-1">F9</Kbd>
            </Button>
          </div>
        </Card>
      </aside>

      <Toast
        open={!!toast}
        tone={toast?.title === "Error" ? "error" : "success"}
        title={toast?.title ?? ""}
        description={toast?.description}
        onClose={() => setToast(null)}
      />
    </div>
  );
}