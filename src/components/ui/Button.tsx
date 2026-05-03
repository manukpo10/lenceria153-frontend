import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent" | "outline";
type Size = "sm" | "md" | "lg" | "xl";

const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all no-tap-highlight " +
  "disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-surface active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 shadow-brand focus-visible:ring-brand-500/40",
  secondary:
    "bg-surface text-ink border border-line hover:bg-surface-muted focus-visible:ring-ink/15",
  ghost:
    "bg-transparent text-ink-muted hover:bg-surface-subtle hover:text-ink focus-visible:ring-ink/10",
  outline:
    "bg-transparent text-ink border border-line hover:bg-surface-muted focus-visible:ring-ink/15",
  danger:
    "bg-red-600 text-white hover:bg-red-700 shadow-soft focus-visible:ring-red-500/30",
  accent:
    "bg-accent text-white hover:bg-accent-hover shadow-soft focus-visible:ring-accent/30",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-3.5 text-sm",
  lg: "h-11 px-5 text-sm",
  xl: "h-14 px-6 text-base",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", size = "md", full, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], full && "w-full", className)}
      {...rest}
    />
  );
});
