import { mockProductos } from "./productos";
import { ventas as mockVentas } from "./mockVentas";
import { apiClient } from "./apiClient";

function getMockFlag(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("mockMode") === "true";
}

export const api = {
  auth: {
    login: async (username: string, password: string) => {
      if (!getMockFlag()) {
        return apiClient.auth.login(username, password);
      }
      if (username === "admin" && password === "admin123") {
        return { token: "mock-token", user: { id: "1", username: "admin", role: "admin", nombre: "Tío" } };
      }
      throw new Error("Credenciales inválidas");
    },
    seed: async () => ({ message: "Mock - no backend" }),
  },

  productos: {
    list: async (params?: { q?: string; rubro?: string; activo?: boolean }) => {
      if (!getMockFlag()) {
        return apiClient.productos.list(params);
      }
      return mockProductos;
    },
    get: async (id: string) => {
      if (!getMockFlag()) {
        return apiClient.productos.get(id);
      }
      return mockProductos.find((p: any) => p.id === id) ?? null;
    },
    create: async (data: any) => {
      if (!getMockFlag()) {
        return apiClient.productos.create(data);
      }
      return { id: `mock-${Date.now()}`, ...data };
    },
    update: async (id: string, data: any) => {
      if (!getMockFlag()) {
        return apiClient.productos.update(id, data);
      }
      return { id, ...data };
    },
    delete: async (id: string) => {
      if (!getMockFlag()) {
        return apiClient.productos.delete(id);
      }
      return { id };
    },
    cleanup: async (dias: number) => {
      if (!getMockFlag()) {
        return apiClient.productos.cleanup(dias);
      }
      return { message: "Mock - no backend" };
    },
    getRubros: async () => {
      if (!getMockFlag()) {
        return apiClient.productos.getRubros();
      }
      return Array.from(new Set(mockProductos.map((p: any) => p.rubro))).sort();
    },
    seed: async () => ({ message: "Mock - no backend" }),
    importPdf: async (formData: FormData) => {
      if (!getMockFlag()) {
        return apiClient.productos.importPdf(formData);
      }
      return { productos: [], total: 0 };
    },
    importConfirm: async (productos: any[], modo: string = "all") => {
      if (!getMockFlag()) {
        return apiClient.productos.importConfirm(productos, modo);
      }
      return { created: 0, updated: 0, skipped: 0 };
    },
    setStock: async (id: string, stock: number) => {
      if (!getMockFlag()) {
        return apiClient.productos.setStock(id, stock);
      }
      const p = mockProductos.find((x: any) => x.id === id);
      if (p) (p as any).stock = stock;
      return p;
    },
exportStockCsv: async () => {
      if (!getMockFlag()) {
        return apiClient.productos.exportStockCsv();
      }
      const csv = "sep=,\ncodigo,descripcion,stock\n" +
        mockProductos.map((p: any) => `${p.codigo},"${p.descripcion}",${p.stock ?? 0}`).join("\n");
      return new Blob([csv], { type: "text/csv" });
    },
    resetStock: async (stock: number = 999) => {
      if (!getMockFlag()) {
        return apiClient.productos.resetStock(stock);
      }
      mockProductos.forEach((p: any) => { p.stock = stock; });
      return { actualizados: mockProductos.length, stock };
    },
    importStockCsv: async (formData: FormData) => {
      if (!getMockFlag()) {
        return apiClient.productos.importStockCsv(formData);
      }
      return { updated: 0, notFound: 0, invalid: 0 };
    },
  },

  ventas: {
    list: async (params?: { desde?: string; hasta?: string; medio?: string }) => {
      if (!getMockFlag()) {
        return apiClient.ventas.list(params);
      }
      return mockVentas;
    },
    create: async (data: any) => {
      if (!getMockFlag()) {
        return apiClient.ventas.create(data);
      }
      const id = `V${Math.floor(Math.random() * 90000 + 10000)}`;
      return { id, ...data, total: data.items.reduce((s: number, i: any) => s + i.cantidad * 100, 0) };
    },
    delete: async (id: string) => {
      if (!getMockFlag()) {
        return apiClient.ventas.delete(id);
      }
      return { success: true };
    },
    stats: async () => {
      if (!getMockFlag()) {
        return apiClient.ventas.stats();
      }
      return { ventasHoy: 5, totalHoy: 45000, itemsHoy: 12, stockBajo: 3, sinStock: 1 };
    },
  },

  caja: {
    estado: async () => {
      if (!getMockFlag()) return apiClient.caja.estado();
      return {
        estado: "abierta" as const,
        caja: {
          id: "mock-caja-1",
          nombre: "Caja Principal",
          estado: "abierta",
          montoApertura: 5000,
          montoSistema: 12340,
          diferencia: 7340,
          usuarioApertura: "Tío",
          fechaApertura: new Date().toISOString(),
        },
      };
    },
    abrir: async (montoApertura = 0) => {
      if (!getMockFlag()) return apiClient.caja.abrir(montoApertura);
      return { message: "Caja abierta mock", caja: { id: "mock-caja-1", montoApertura } };
    },
    cerrar: async (montoReal: number) => {
      if (!getMockFlag()) return apiClient.caja.cerrar(montoReal);
      return { message: "Caja cerrada mock", montoReal };
    },
    confirmarCierre: async () => {
      if (!getMockFlag()) return apiClient.caja.confirmarCierre();
      return { message: "Cierre confirmado mock" };
    },
    cancelarCierre: async () => {
      if (!getMockFlag()) return apiClient.caja.cancelarCierre();
      return { message: "Cierre cancelado mock" };
    },
    movimiento: async (data: { tipo: string; monto: number; descripcion: string; medioPago?: string }) => {
      if (!getMockFlag()) return apiClient.caja.movimiento(data);
      return {
        id: `mock-mov-${Date.now()}`,
        cajaId: "mock-caja-1",
        tipo: data.tipo,
        monto: data.monto,
        descripcion: data.descripcion,
        medioPago: data.medioPago,
        userId: "1",
        usuarioNombre: "Tío",
        createdAt: new Date().toISOString(),
      };
    },
    movimientos: async () => {
      if (!getMockFlag()) return apiClient.caja.movimientos();
      return [
        { id: "m1", cajaId: "mock-caja-1", tipo: "apertura", monto: 5000, descripcion: "Apertura de caja", userId: "1", usuarioNombre: "Tío", createdAt: new Date(Date.now() - 3600000 * 6).toISOString() },
        { id: "m2", cajaId: "mock-caja-1", tipo: "ingreso", monto: 2000, descripcion: "Venta adicional mostrador", userId: "1", usuarioNombre: "Tío", createdAt: new Date(Date.now() - 3600000 * 4).toISOString() },
        { id: "m3", cajaId: "mock-caja-1", tipo: "venta", monto: 3240, medioPago: "efectivo", descripcion: "Venta #V00042", userId: "1", usuarioNombre: "Tío", createdAt: new Date(Date.now() - 3600000 * 3).toISOString() },
        { id: "m4", cajaId: "mock-caja-1", tipo: "venta", monto: 1800, medioPago: "debito", descripcion: "Venta #V00043", userId: "1", usuarioNombre: "Tío", createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
        { id: "m5", cajaId: "mock-caja-1", tipo: "retiro", monto: 1000, descripcion: "Retiro para reposición stock", userId: "1", usuarioNombre: "Tío", createdAt: new Date(Date.now() - 3600000).toISOString() },
      ];
    },
    arqueo: async () => {
      if (!getMockFlag()) return apiClient.caja.arqueo();
      return {
        caja: { id: "mock-caja-1", montoApertura: 5000, montoSistema: 12340, usuarioApertura: "Tío", fechaApertura: new Date(Date.now() - 3600000 * 6).toISOString() },
        movimientos: [],
        resumen: { apertura: 5000, ventas: 7340, ingresos: 2000, retiros: 1000, cierre: 0 },
        ventasPorMedio: {
          efectivo: { count: 2, total: 5040 },
          debito: { count: 1, total: 1800 },
          credito: { count: 1, total: 1100 },
          transferencia: { count: 1, total: 1400 },
          qr: { count: 1, total: 800 },
        },
        cantidadVentas: 6,
        itemsVendidos: 14,
      };
    },
    historial: async () => {
      if (!getMockFlag()) return apiClient.caja.historial();
      return [
        { id: "h1", nombre: "Caja del 28/04", estado: "cerrada", montoApertura: 3000, montoSistema: 4520, diferencia: 520, usuarioApertura: "Tío", fechaApertura: new Date(Date.now() - 86400000 * 2).toISOString(), usuarioCierre: "Tío", fechaCierre: new Date(Date.now() - 86400000).toISOString() },
        { id: "h2", nombre: "Caja del 29/04", estado: "cerrada", montoApertura: 5000, montoSistema: 4880, diferencia: -120, usuarioApertura: "Tío", fechaApertura: new Date(Date.now() - 86400000).toISOString(), usuarioCierre: "Tío", fechaCierre: new Date().toISOString() },
      ];
    },
  },
};