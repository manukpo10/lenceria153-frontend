"use client";

import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

type Tone = "success" | "error" | "info";

const toneClasses: Record<Tone, string> = {
  success: "border-emerald-200 bg-emerald-50",
  error: "border-red-200 bg-red-50",
  info: "border-line bg-surface",
};
const toneIcon: Record<Tone, React.ReactNode> = {
  success: <CheckCircle2 className="text-emerald-600" size={20} />,
  error: <AlertCircle className="text-red-600" size={20} />,
  info: <Info className="text-blue-600" size={20} />,
};

export function Toast({
  open,
  tone = "success",
  title,
  description,
  onClose,
  duration = 3500,
}: {
  open: boolean;
  tone?: Tone;
  title: string;
  description?: string;
  onClose: () => void;
  duration?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-start gap-3 pl-4 pr-3 py-3",
        "rounded-xl border shadow-pop min-w-[280px] max-w-md animate-slide-up",
        toneClasses[tone]
      )}
      role="status"
    >
      <div className="mt-0.5">{toneIcon[tone]}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-ink">{title}</div>
        {description && (
          <div className="text-xs text-ink-muted mt-0.5">{description}</div>
        )}
      </div>
      <button
        onClick={onClose}
        className="p-1 text-ink-soft hover:text-ink rounded-md"
        aria-label="Cerrar"
      >
        <X size={14} />
      </button>
    </div>
  );
}
