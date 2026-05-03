"use client";

import { Bell, Search, UserCircle2, Sun, Moon, Database, TestTube, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Kbd } from "@/components/ui";
import { useMockMode } from "@/lib/mockContext";

const titles: Record<string, string> = {
  "/": "Inicio",
  "/pos": "Punto de Venta",
  "/productos": "Productos",
  "/ventas": "Ventas",
  "/caja": "Caja",
};

export default function Topbar() {
  const path = usePathname();
  const router = useRouter();
  const title = titles[path] ?? "Mercería 153";
  const [dark, setDark] = useState(false);
  const { user, logout } = useAuth();
  const { useMock, toggle } = useMockMode();

  useEffect(() => {
    const meta = document.documentElement;
    setDark(meta.classList.contains("dark"));
  }, []);

  function toggleDark() {
    const meta = document.documentElement;
    meta.classList.toggle("dark");
    setDark(meta.classList.contains("dark"));
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      const map: Record<string, string> = {
        "1": "/", "2": "/pos", "3": "/productos", "4": "/ventas", "5": "/caja",
      };
      const dest = map[e.key];
      if (dest) {
        e.preventDefault();
        router.push(dest);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  const fecha = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <header className="h-14 bg-surface border-b border-line sticky top-0 z-20 flex items-center justify-between px-4 md:px-6">
      <div className="min-w-0 flex items-center gap-3">
        <h1 className="text-base font-semibold text-ink truncate">{title}</h1>
        <span className="hidden md:inline text-xs text-ink-muted capitalize">· {fecha}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="hidden sm:flex h-9 items-center gap-2 px-3 rounded-lg border text-sm transition-colors"
          title={useMock ? "Modo demo activo" : "Modo normal"}
          style={{
            borderColor: useMock ? "#d97706" : "#cbd5e1",
            color: useMock ? "#d97706" : "#64748b",
            backgroundColor: useMock ? "#fffbeb" : "#f8fafc",
          }}
        >
          {useMock ? <TestTube size={15} /> : <Database size={15} />}
          <span>{useMock ? "Demo" : "Normal"}</span>
        </button>
        <button
          onClick={toggleDark}
          className="h-9 w-9 grid place-items-center rounded-lg text-ink-muted hover:bg-surface-muted transition-colors"
          aria-label="Alternar modo oscuro"
        >
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button className="hidden sm:flex h-9 items-center gap-2 px-3 rounded-lg border border-line bg-surface-muted hover:bg-surface-subtle text-sm text-ink-muted">
          <Search size={15} />
          <span>Buscar</span>
          <Kbd>Alt</Kbd>
          <Kbd>1-5</Kbd>
        </button>
        <button
          className="h-9 w-9 grid place-items-center rounded-lg text-ink-muted hover:bg-surface-muted"
          aria-label="Notificaciones"
        >
          <Bell size={17} />
        </button>
        <div className="h-6 w-px bg-line mx-1" />
        <div className="hidden md:flex items-center gap-2 pr-1">
          <div className="w-8 h-8 rounded-full bg-surface-subtle grid place-items-center">
            <UserCircle2 size={20} className="text-ink-muted" />
          </div>
          <div className="hidden md:block text-sm leading-tight">
            <div className="font-medium text-ink">{user?.nombre ?? "Usuario"}</div>
            <div className="text-[11px] text-ink-muted capitalize">{user?.role === "admin" ? "Administrador" : "Vendedor"}</div>
          </div>
          <button
            onClick={logout}
            className="ml-1 h-8 w-8 grid place-items-center rounded-lg text-ink-muted hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}