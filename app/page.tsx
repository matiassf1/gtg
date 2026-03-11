import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export default async function SplashPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    if (session.user.role === "EMPRESA") redirect("/empresa/dashboard");
    if (session.user.role === "CLIENTE") redirect("/cliente/explorar");
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">

      {/* Fondo con glow radial */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Logo central — clic lleva a bienvenida */}
      <Link
        href="/bienvenida"
        className="group z-10 transition-transform duration-500 hover:scale-105 active:scale-95"
        aria-label="Entrar a Club GTG"
      >
        <Logo size="xl" withGlow withAnimation />
      </Link>

      {/* Indicador sutil de que es clickeable */}
      <p className="mt-10 text-xs text-muted-foreground/50 tracking-widest uppercase z-10 animate-pulse">
        Tocá para entrar
      </p>
    </main>
  );
}
