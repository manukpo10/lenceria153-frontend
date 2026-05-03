import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "./Card";

type Accent = "accent" | "brand" | "warning" | "rose" | "sky" | "violet";

const accents: Record<Accent, { bar: string; icon: string }> = {
  accent:  { bar: "bg-accent",     icon: "bg-accent-soft text-accent" },
  brand:   { bar: "bg-brand-600", icon: "bg-brand-50 text-brand-600" },
  warning: { bar: "bg-warning",   icon: "bg-warning-soft text-warning" },
  rose:    { bar: "bg-rose-500",  icon: "bg-rose-50 text-rose-600" },
  sky:     { bar: "bg-sky-500",    icon: "bg-sky-50 text-sky-600" },
  violet:  { bar: "bg-violet-500",icon: "bg-violet-50 text-violet-600" },
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  trend,
  accent = "brand",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  trend?: { value: string; positive?: boolean };
  accent?: Accent;
}) {
  const a = accents[accent];
  return (
    <Card className="p-5 relative overflow-hidden">
      <div className={cn("absolute top-0 left-0 right-0 h-0.5", a.bar)} />
      <div className="flex items-start justify-between">
        <div className="text-xs font-medium text-ink-muted uppercase tracking-wide">
          {label}
        </div>
        {icon && (
          <div className={cn("w-9 h-9 rounded-xl grid place-items-center", a.icon)}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-2xl font-semibold text-ink num tracking-tight">{value}</div>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center text-xs font-medium",
              trend.positive ? "text-accent" : "text-rose-500"
            )}
          >
            {trend.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend.value}
          </span>
        )}
      </div>
      {hint && <div className="mt-1 text-xs text-ink-soft">{hint}</div>}
    </Card>
  );
}