import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Combina clsx (toggles condicionales) + tailwind-merge (resuelve conflictos
// de utilidades Tailwind de forma determinística: text-white gana a text-ink-muted, etc.)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
