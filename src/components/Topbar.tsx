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
    <header className="h-14 bg-surface border-b border-line sticky top-0 z-20 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <h1 className="text-base font-semibold text-ink truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={toggle}
          className="h-8 sm:h-9 flex items-center gap-1.5 px-2 sm:px-3 rounded-lg border text-xs sm:text-sm transition-colors"
          title={useMock ? "Modo demo activo" : "Modo normal"}
          style={{
            borderColor: useMock ? "#d97706" : "#cbd5e1",
            color: useMock ? "#d97706" : "#64748b",
            backgroundColor: useMock ? "#fffbeb" : "#f8fafc",
          }}
        >
          {useMock ? <TestTube size={13} /> : <Database size={13} />}
          <span className="hidden xs:inline">{useMock ? "Demo" : "Normal"}</span>
        </button>
        <button
          onClick={toggleDark}
          className="h-8 w-8 sm:h-9 sm:w-9 grid place-items-center rounded-lg text-ink-muted hover:bg-surface-muted transition-colors"
          aria-label="Alternar modo oscuro"
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button
          onClick={logout}
          className="h-8 w-8 sm:h-9 sm:w-9 grid place-items-center rounded-lg text-ink-muted hover:bg-rose-50 hover:text-rose-600 transition-colors"
          title="Cerrar sesión"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}