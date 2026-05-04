"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Receipt,
  Wallet,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const items = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/pos", label: "POS", icon: ShoppingCart },
  { href: "/productos", label: "Productos", icon: Package },
  { href: "/ventas", label: "Ventas", icon: Receipt },
  { href: "/caja", label: "Caja", icon: Wallet },
];

export default function MobileNav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-ink/50 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Hamburger button - solo visible en mobile */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-4 z-40 md:hidden h-12 w-12 rounded-full bg-brand-600 text-white shadow-lg grid place-items-center"
        aria-label="Menú"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Drawer sidebar en mobile */}
      <aside
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40 md:hidden bg-surface-dark text-ink-dark border-t border-line-dark transition-transform duration-300",
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="p-3">
          <div className="flex items-center gap-3 px-2 pb-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-brand-700 grid place-items-center">
              <span className="text-white font-bold text-sm">153</span>
            </div>
            <div>
              <div className="font-semibold text-sm leading-tight text-white">Mercería 153</div>
              <div className="text-xs text-ink-dark-soft">La Plata</div>
            </div>
          </div>
          <nav className="flex justify-around">
            {items.map((it) => {
              const active = path === it.href || (it.href !== "/" && path.startsWith(it.href));
              const Icon = it.icon;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-[10px] transition-colors",
                    active
                      ? "text-white"
                      : "text-ink-dark-muted hover:text-ink-dark"
                  )}
                >
                  <Icon size={18} className={active ? "text-white" : ""} />
                  <span>{it.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}