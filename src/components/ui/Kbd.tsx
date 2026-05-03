import { cn } from "@/lib/utils";

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5",
        "rounded border border-line bg-surface text-[10px] font-medium text-ink-muted",
        "shadow-[inset_0_-1px_0_rgb(15_23_42_/_0.06)]",
        className
      )}
    >
      {children}
    </kbd>
  );
}
