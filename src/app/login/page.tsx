"use client";

import { useState, useId } from "react";
import { Lock, Eye, EyeOff, Loader2, Mail } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const id = useId();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Completá usuario y contraseña");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message ?? "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  const disabled = loading || !username.trim() || !password.trim();

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(79,70,229,0.15),transparent)]" />

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="relative w-16 h-16 mb-5">
            <Image src="/logo.png" alt="Mercería 153" fill className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#f1f5f9] tracking-tight">Mercería 153</h1>
          <p className="text-[#cbd5e1] text-sm mt-1.5">Tu sistema de gestión comercial</p>
        </div>

        <div className="relative bg-[#1e293b] border border-[#334155] rounded-2xl p-8 shadow-2xl shadow-black/50">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

          <div className="relative">
            <h2 className="text-lg font-semibold text-[#f1f5f9] mb-1.5">Iniciar sesión</h2>
            <p className="text-sm text-[#cbd5e1] mb-6">Ingresá tus credenciales para continuar</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor={`${id}-user`} className="text-xs font-medium text-[#cbd5e1] uppercase tracking-wider">
                  Usuario
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" size={16} />
                  <input
                    id={`${id}-user`}
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="tu usuario"
                    autoComplete="username"
                    disabled={loading}
                    className="w-full bg-[#334155]/60 border border-[#475569]/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor={`${id}-pass`} className="text-xs font-medium text-[#cbd5e1] uppercase tracking-wider">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" size={16} />
                  <input
                    id={`${id}-pass`}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="tu contraseña"
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full bg-[#334155]/60 border border-[#475569]/60 rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#94a3b8] transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={disabled}
                className="w-full bg-[#4f46e5] hover:bg-[#4338ca] disabled:bg-[#4f46e5]/50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl py-2.5 mt-2 transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Ingresando…</span>
                  </>
                ) : (
                  <span>Ingresar</span>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-[#64748b]">
            ¿Olvidaste tu contraseña?{" "}
            <span className="text-[#818cf8] hover:text-[#a5b4fc] cursor-pointer transition-colors">
              Recuperala aquí
            </span>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-[#334155]/60 text-center">
          <p className="text-xs text-[#475569]">
            Demo: <span className="font-mono text-[#94a3b8]">admin</span> /{" "}
            <span className="font-mono text-[#94a3b8]">admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
}