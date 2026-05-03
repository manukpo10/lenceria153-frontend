// Asigna un tono de color estable a cada rubro (mismo rubro → mismo color siempre).
const palette = [
  { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
  { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  { bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500" },
  { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
  { bg: "bg-cyan-50", text: "text-cyan-700", dot: "bg-cyan-500" },
  { bg: "bg-fuchsia-50", text: "text-fuchsia-700", dot: "bg-fuchsia-500" },
  { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-500" },
  { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
  { bg: "bg-lime-50", text: "text-lime-700", dot: "bg-lime-500" },
  { bg: "bg-pink-50", text: "text-pink-700", dot: "bg-pink-500" },
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function rubroColor(name: string) {
  return palette[hash(name) % palette.length];
}
