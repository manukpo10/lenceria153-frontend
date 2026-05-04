import { InputHTMLAttributes, ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  leading?: ReactNode;
  trailing?: ReactNode;
  sizeVariant?: "sm" | "md" | "lg" | "xl";
}

const sizes = {
  sm: "h-9 text-sm",
  md: "h-10 text-sm",
  lg: "h-12 text-base",
  xl: "h-12 sm:h-14 text-base sm:text-lg",
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className, leading, trailing, sizeVariant = "md", ...rest },
  ref
) {
  return (
    <div
      className={cn(
        "group relative flex items-center bg-surface border border-line rounded-xl",
        "transition-all focus-within:border-ink/40 focus-within:shadow-soft",
        sizes[sizeVariant]
      )}
    >
      {leading && (
        <span className="pl-3.5 text-ink-soft group-focus-within:text-ink-muted transition-colors">
          {leading}
        </span>
      )}
      <input
        ref={ref}
        className={cn(
          "flex-1 bg-transparent outline-none px-3.5 placeholder:text-ink-soft text-ink min-w-0",
          className
        )}
        {...rest}
      />
      {trailing && <span className="pr-3 text-ink-soft">{trailing}</span>}
    </div>
  );
});
