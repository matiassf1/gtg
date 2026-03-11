"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerCliente } from "@/lib/actions/auth";
import { Loader2, Eye, EyeOff, Check } from "lucide-react";

const PREFERENCIAS = [
  "Parrilla", "Italiana", "Japonesa", "Mexicana", "Americana",
  "Vegetariana", "Vegana", "Mariscos", "Pizza", "Hamburguesas",
  "Cafetería", "Pastelería", "Fusión", "Española", "Árabe",
];

export default function RegistroClientePage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  function togglePreferencia(pref: string) {
    setSelected((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (selected.length === 0) {
      setError("Seleccioná al menos una preferencia.");
      return;
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    selected.forEach((p) => formData.append("preferences", p));

    const result = await registerCliente(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    await signIn("credentials", { email, password, callbackUrl: "/cliente/explorar" });
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <Link href="/"><Logo size="lg" /></Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Creá tu cuenta</h1>
            <p className="text-sm text-muted-foreground mt-1">Descubrí los mejores restaurantes</p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Nombre completo</label>
              <Input name="name" type="text" placeholder="Ej: María García" required />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input name="email" type="email" placeholder="tu@email.com" required autoComplete="email" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Contraseña</label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Preferencias */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Tus preferencias gastronómicas
                <span className="text-muted-foreground font-normal ml-1">(seleccioná al menos 1)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {PREFERENCIAS.map((pref) => {
                  const isSelected = selected.includes(pref);
                  return (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => togglePreferencia(pref)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      {pref}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear cuenta"}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
