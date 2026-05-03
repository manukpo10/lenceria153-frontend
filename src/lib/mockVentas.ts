import { productos } from "./productos";

export type MedioPago = "efectivo" | "debito" | "credito" | "transferencia" | "qr";

export type ItemVenta = {
  codigo: string;
  descripcion: string;
  cantidad: number;
  precio: number;
};

export type Venta = {
  id: string;
  fecha: string;
  items: ItemVenta[];
  total: number;
  medio: MedioPago;
};

// Genera ventas pseudo-aleatorias deterministas para los últimos 30 días.
function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generarVentas(): Venta[] {
  const ventas: Venta[] = [];
  const r = rand(42);
  const medios: MedioPago[] = ["efectivo", "debito", "credito", "transferencia", "qr"];
  const hoy = new Date();
  for (let d = 0; d < 30; d++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() - d);
    const cantidad = 8 + Math.floor(r() * 18);
    for (let i = 0; i < cantidad; i++) {
      const itemsCount = 1 + Math.floor(r() * 4);
      const items: ItemVenta[] = [];
      let total = 0;
      for (let k = 0; k < itemsCount; k++) {
        const p = productos[Math.floor(r() * productos.length)];
        if (!p) continue;
        const cant = 1 + Math.floor(r() * 3);
        items.push({
          codigo: p.codigo,
          descripcion: p.descripcion,
          cantidad: cant,
          precio: p.precio,
        });
        total += p.precio * cant;
      }
      const f = new Date(fecha);
      f.setHours(9 + Math.floor(r() * 11), Math.floor(r() * 60));
      ventas.push({
        id: `V${(ventas.length + 1).toString().padStart(5, "0")}`,
        fecha: f.toISOString(),
        items,
        total,
        medio: medios[Math.floor(r() * medios.length)],
      });
    }
  }
  return ventas.sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export const ventas: Venta[] = generarVentas();

export const labelMedio: Record<MedioPago, string> = {
  efectivo: "Efectivo",
  debito: "Débito",
  credito: "Crédito",
  transferencia: "Transferencia",
  qr: "QR / Mercado Pago",
};
