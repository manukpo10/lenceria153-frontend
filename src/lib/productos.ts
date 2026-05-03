import data from "@/data/productos.json";

export type Producto = {
  id: string;
  codigo: string;
  descripcion: string;
  rubro: string;
  costo: number | null;
  precio: number;
  precioVenta: number | null;
  precioUnidad: number | null;
  precioUnidadLista: number | null;
  precioUnidadVenta: number | null;
  pack: number;
  stock: number;
  activo: boolean;
};

export const productos: Producto[] = (data as any[]).map((p, i) => ({
  ...p,
  id: p.id ?? `mock-${i + 1}`,
  activo: true,
}));

export const mockProductos = productos;

export const rubros: string[] = Array.from(
  new Set(productos.map((p) => p.rubro))
).sort();

export function buscarProductos(q: string, rubro?: string, limit = 50): Producto[] {
  const term = q.trim().toLowerCase();
  let res = productos;
  if (rubro && rubro !== "TODOS") res = res.filter((p) => p.rubro === rubro);
  if (term) {
    res = res.filter(
      (p) =>
        p.codigo.includes(term) ||
        p.descripcion.toLowerCase().includes(term)
    );
  }
  return res.slice(0, limit);
}