const BASE = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : "http://localhost:3001/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...options, headers });
  } catch (err) {
    throw new Error("No se pudo conectar al servidor");
  }
  const data = await res.json().catch(() => ({ error: "Respuesta inválida" }));

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
    }
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }
  return data as T;
}

export const apiClient = {
  auth: {
    login: (username: string, password: string) =>
      request<{ token: string; user: any }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),
    register: (data: { username: string; password: string; nombre: string; role?: string }) =>
      request<{ token: string; user: any }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    seed: () => request<any>("/auth/seed", { method: "POST" }),
  },
  productos: {
    list: (params?: { q?: string; rubro?: string; activo?: boolean }) => {
      const q = new URLSearchParams();
      if (params?.q) q.set("q", params.q);
      if (params?.rubro) q.set("rubro", params.rubro);
      if (params?.activo !== undefined) q.set("activo", String(params.activo));
      return request<any[]>(`/productos?${q.toString()}`);
    },
    get: (id: string) => request<any>(`/productos/${id}`),
    create: (data: any) =>
      request<any>("/productos", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/productos/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<any>(`/productos/${id}`, { method: "DELETE" }),
    cleanup: (dias = 0) =>
      request<any>(`/productos/cleanup?dias=${dias}`, { method: "POST" }),
    seed: () => request<any>("/productos/seed", { method: "POST" }),
    getRubros: () => request<string[]>("/productos/rubros"),
    importPdf: (formData: FormData) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/productos/import-pdf`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${getToken()}` },
        body: formData,
      }).then(r => r.json()),
    importConfirm: (productos: any[], modo: string = "all") =>
      request<any>("/productos/import-confirm", { method: "POST", body: JSON.stringify({ productos, modo }) }),
    setStock: (id: string, stock: number) =>
      request<any>(`/productos/${id}/stock`, { method: "PATCH", body: JSON.stringify({ stock }) }),
    exportStockCsv: () =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/productos/export-stock-csv`, {
        headers: { "Authorization": `Bearer ${getToken()}` },
      }).then(r => r.blob()),
    importStockCsv: (formData: FormData) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/productos/import-stock-csv`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${getToken()}` },
        body: formData,
      }).then(r => r.json()),
    calcularPreciosVenta: (porcentaje: number) =>
      request<any>("/productos/calcular-precios-venta", { method: "POST", body: JSON.stringify({ porcentaje }) }),
    resetStock: (stock: number = 999) =>
      request<any>("/productos/reset-stock", { method: "POST", body: JSON.stringify({ stock }) }),
  },
  ventas: {
    list: (params?: { desde?: string; hasta?: string; medio?: string }) => {
      const q = new URLSearchParams();
      if (params?.desde) q.set("desde", params.desde);
      if (params?.hasta) q.set("hasta", params.hasta);
      if (params?.medio) q.set("medio", params.medio);
      return request<any[]>(`/ventas?${q.toString()}`);
    },
    create: (data: { items: Array<{ productoId: string; cantidad: number }>; medioPago: string; descuento?: number }) =>
      request<any>("/ventas", { method: "POST", body: JSON.stringify(data) }),
    stats: () => request<any>("/ventas/stats/resumen"),
  },
  caja: {
    estado: () => request<any>("/caja/estado"),
    abrir: (montoApertura = 0) =>
      request<any>("/caja/abrir", { method: "POST", body: JSON.stringify({ montoApertura }) }),
    cerrar: (montoReal: number) =>
      request<any>("/caja/cerrar", { method: "POST", body: JSON.stringify({ montoReal }) }),
    confirmarCierre: () =>
      request<any>("/caja/confirmar-cierre", { method: "POST" }),
    cancelarCierre: () =>
      request<any>("/caja/cancelar-cierre", { method: "POST" }),
    movimiento: (data: { tipo: string; monto: number; descripcion: string; medioPago?: string }) =>
      request<any>("/caja/movimiento", { method: "POST", body: JSON.stringify(data) }),
    movimientos: (cajaId?: string) => {
      const q = cajaId ? `?cajaId=${cajaId}` : "";
      return request<any[]>(`/caja/movimientos${q}`);
    },
    arqueo: () => request<any>("/caja/arqueo"),
    historial: () => request<any[]>("/caja/historial"),
  },
};