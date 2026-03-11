"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerEmpresa } from "@/lib/actions/auth";
import { Loader2, Eye, EyeOff } from "lucide-react";

const CATEGORIAS = [
  "Parrilla", "Italiana", "Japonesa", "Mexicana", "Americana",
  "Vegetariana", "Mariscos", "Pizza", "Hamburguesas", "Cafetería",
  "Pastelería", "Fusión", "Española", "China", "Árabe",
];

const CIUDADES = [
  "Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata",
  "Mar del Plata", "San Miguel de Tucumán", "Salta", "Santa Fe", "Otra",
];

export default function RegistroEmpresaPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerEmpresa(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Auto login después del registro
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    await signIn("credentials", { email, password, callbackUrl: "/empresa/dashboard" });
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <Link href="/"><Logo size="md" /></Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Registrá tu restaurante</h1>
            <p className="text-sm text-muted-foreground mt-1">Creá tu cuenta como empresa</p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Tu nombre completo</label>
              <Input name="name" type="text" placeholder="Ej: Juan García" required />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Nombre del restaurante</label>
              <Input name="restaurantName" type="text" placeholder="Ej: La Parrilla del Norte" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Categoría</label>
                <select
                  name="category"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Seleccioná</option>
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Ciudad</label>
                <select
                  name="city"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Seleccioná</option>
                  {CIUDADES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input name="email" type="email" placeholder="restaurante@email.com" required autoComplete="email" />
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
