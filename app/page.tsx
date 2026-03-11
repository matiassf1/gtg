import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Building2, UtensilsCrossed, ChevronRight } from "lucide-react";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    if (session.user.role === "EMPRESA") redirect("/empresa/dashboard");
    if (session.user.role === "CLIENTE") redirect("/cliente/explorar");
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">

      {/* Glow de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex flex-col items-center gap-4 mb-12 z-10">
        <Logo size="lg" />
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Club <span className="text-primary">Gastronómico</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Conectamos restaurantes con clientes apasionados
          </p>
        </div>
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl z-10">

        {/* Card Empresas */}
        <div className="group bg-card border border-border rounded-2xl p-8 flex flex-col items-center text-center gap-4 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(57,255,20,0.1)]">
          <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Soy Empresa</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Registrá tu restaurante y llegá a miles de clientes gastronómicos
            </p>
          </div>
          <Link href="/registro/empresa" className="w-full mt-auto">
            <Button className="w-full gap-2">
              Registrar restaurante
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/login" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Ya tengo cuenta → Acceder
          </Link>
        </div>

        {/* Card Clientes */}
        <div className="group bg-card border border-border rounded-2xl p-8 flex flex-col items-center text-center gap-4 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(57,255,20,0.1)]">
          <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <UtensilsCrossed className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Soy Cliente</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Descubrí los mejores restaurantes según tus preferencias
            </p>
          </div>
          <Link href="/registro/cliente" className="w-full mt-auto">
            <Button className="w-full gap-2">
              Explorar restaurantes
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/login" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Ya tengo cuenta → Acceder
          </Link>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-12 text-xs text-muted-foreground z-10">
        © {new Date().getFullYear()} Club Gastronómico GTG
      </p>
    </main>
  );
}
