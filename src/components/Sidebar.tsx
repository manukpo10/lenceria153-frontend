"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Receipt,
  Wallet,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Kbd } from "@/components/ui";

const items = [
  { href: "/", label: "Inicio", icon: LayoutDashboard, kbd: "1" },
  { href: "/pos", label: "Punto de Venta", icon: ShoppingCart, kbd: "2" },
  { href: "/productos", label: "Productos", icon: Package, kbd: "3" },
  { href: "/ventas", label: "Ventas", icon: Receipt, kbd: "4" },
  { href: "/caja", label: "Caja", icon: Wallet, kbd: "5" },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="hidden md:flex w-64 shrink-0 bg-surface-dark text-ink-dark h-screen sticky top-0 flex-col">
      <div className="px-5 py-5 flex items-center gap-3">
        <div className="w-9 h-9 relative">
          <Image src="/logo.png" alt="Mercería 153" fill className="object-contain" />
        </div>
        <div className="min-w-0">
          <div className="font-semibold leading-tight">Mercería 153</div>
          <div className="text-xs text-ink-dark-soft">La Plata</div>
        </div>
      </div>

      <div className="px-3 mt-2">
        <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-dark-soft">
          Operación
        </div>
        <nav className="space-y-0.5">
          {items.map((it) => {
            const active = path === it.href || (it.href !== "/" && path.startsWith(it.href));
            const Icon = it.icon;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "group relative flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-brand-700 text-white"
                    : "text-ink-dark-muted hover:bg-surface-dark-muted hover:text-ink-dark"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-brand-500" />
                )}
                <Icon size={17} className={cn(active ? "text-white" : "text-ink-dark-soft group-hover:text-ink-dark-muted")} />
                <span className="flex-1">{it.label}</span>
                <Kbd className="opacity-0 group-hover:opacity-100 transition-opacity">{it.kbd}</Kbd>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-3 border-t border-line-dark">
        <Link
          href="#"
          className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm text-ink-dark-soft hover:bg-surface-dark-muted hover:text-ink-dark"
        >
          <Settings size={17} className="text-ink-dark-soft" />
          <span>Configuración</span>
        </Link>
        <div className="px-2.5 pt-3 pb-1 text-[11px] text-ink-dark-soft">
          Datos de demostración
        </div>
      </div>
    </aside>
  );
}