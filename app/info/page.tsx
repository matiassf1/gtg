"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
  Menu, X, BarChart3, Users, Tag, TrendingUp,
  Star, Clock, Utensils, Gift, Instagram, Twitter, Facebook,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Scroll-animation hook + wrapper
───────────────────────────────────────────── */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

function FadeIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Static data
───────────────────────────────────────────── */
const RESTAURANT_BENEFITS = [
  {
    icon: TrendingUp,
    title: "Gestiona tu negocio",
    desc: "Administra reservas, menú y promociones desde un panel centralizado e intuitivo.",
  },
  {
    icon: Users,
    title: "Atrae nuevos clientes",
    desc: "Conéctate con miles de socios del club que buscan experiencias gastronómicas únicas.",
  },
  {
    icon: Tag,
    title: "Promociones inteligentes",
    desc: "Crea beneficios exclusivos para los miembros del club y mide su impacto en tiempo real.",
  },
  {
    icon: BarChart3,
    title: "Métricas en tiempo real",
    desc: "Visualiza el rendimiento de tu negocio con datos claros sobre reservas, reseñas y más.",
  },
];

const CLIENT_BENEFITS = [
  {
    icon: Star,
    title: "Descuentos exclusivos",
    desc: "Accede a beneficios especiales en los mejores restaurantes de la ciudad, solo para socios.",
  },
  {
    icon: Clock,
    title: "Reservas prioritarias",
    desc: "Sáltate las listas de espera con acceso prioritario en todos los restaurantes afiliados.",
  },
  {
    icon: Utensils,
    title: "Descubre nuevos sabores",
    desc: "Explora una selección de restaurantes elegidos por su calidad y propuesta gastronómica.",
  },
  {
    icon: Gift,
    title: "Acumula beneficios",
    desc: "Cada visita suma puntos que puedes canjear en experiencias y descuentos futuros.",
  },
];

const MOCK_RESTAURANTS = [
  { name: "Diverxo",          category: "Cocina de autor",  photo: "photo-1414235077428-338989a2e8c0" },
  { name: "El Club Allard",   category: "Alta cocina",      photo: "photo-1544025162-d76538748e34" },
  { name: "Casa Botín",       category: "Cocina española",  photo: "photo-1555396273-367ea4eb4db5" },
  { name: "Barra M",          category: "Tapas",            photo: "photo-1579871494447-9811cf80d66c" },
  { name: "Alabaster",        category: "Contemporánea",    photo: "photo-1551218808-94e220e084d2" },
  { name: "El Paraguas",      category: "Marisquería",      photo: "photo-1559339352-11d035aa65de" },
];

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function InfoPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ══ STICKY HEADER ══ */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">

          <Link href="/" aria-label="Inicio">
            <Logo size="sm" withGlow={false} />
          </Link>

          {/* Desktop: 4 buttons in a row */}
          <nav className="hidden md:flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" asChild className="border-primary text-primary hover:bg-primary/10">
              <Link href="/registro/empresa">Afiliar Restaurante</Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="border-primary text-primary hover:bg-primary/10">
              <Link href="/registro/cliente">Hacerme Socio</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/login?role=empresa">Ingreso Restaurante</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/login?role=cliente">Ingreso Socio</Link>
            </Button>
          </nav>

          {/* Mobile: hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown: 2×2 grid */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-4 grid grid-cols-2 gap-2">
            <Button
              variant="outline" size="sm" asChild
              className="border-primary text-primary hover:bg-primary/10"
              onClick={() => setMenuOpen(false)}
            >
              <Link href="/registro/empresa">Afiliar Restaurante</Link>
            </Button>
            <Button
              variant="outline" size="sm" asChild
              className="border-primary text-primary hover:bg-primary/10"
              onClick={() => setMenuOpen(false)}
            >
              <Link href="/registro/cliente">Hacerme Socio</Link>
            </Button>
            <Button size="sm" asChild onClick={() => setMenuOpen(false)}>
              <Link href="/login?role=empresa">Ingreso Restaurante</Link>
            </Button>
            <Button size="sm" asChild onClick={() => setMenuOpen(false)}>
              <Link href="/login?role=cliente">Ingreso Socio</Link>
            </Button>
          </div>
        )}
      </header>

      {/* ══ HERO ══ */}
      <section className="relative min-h-[88vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80"
            alt=""
            className="w-full h-full object-cover opacity-[0.08]"
          />
        </div>
        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto animate-fade-in">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium tracking-widest uppercase mb-6">
            Club Gastronómico Exclusivo
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            Bienvenido al{" "}
            <span className="text-primary">Club Gastronómico</span>{" "}
            GTG
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            La comunidad exclusiva que conecta los mejores restaurantes con los comensales más exigentes
          </p>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/40">
          <span className="text-xs tracking-widest uppercase">Descubre más</span>
          <div className="w-px h-8 bg-gradient-to-b from-muted-foreground/40 to-transparent" />
        </div>
      </section>

      {/* ══ QUÉ ES EL CLUB ══ */}
      <section className="py-20 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">¿Qué es el Club GTG?</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  El Club Gastronómico GTG es una plataforma de fidelización y descubrimiento culinario que une a los mejores restaurantes de Madrid con una comunidad de comensales apasionados. Nuestro modelo crea un ecosistema donde todos ganan: los restaurantes crecen y los socios disfrutan de experiencias únicas.
                </p>
                <p>
                  A través de GTG, los socios acceden a beneficios exclusivos, reservas prioritarias y descuentos en una red cuidadosamente seleccionada de establecimientos madrileños. Cada visita se transforma en una experiencia gastronómica memorable, respaldada por la calidad y el compromiso de los restaurantes afiliados.
                </p>
                <p>
                  Para los restaurantes, GTG es mucho más que una plataforma de reservas. Es una herramienta de gestión integral que les permite conocer mejor a sus clientes, crear promociones inteligentes y construir una base de comensales fieles y comprometidos con la propuesta gastronómica del establecimiento.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={150}>
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
                  alt="Interior de restaurante"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══ PARA RESTAURANTES ══ */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium tracking-widest uppercase mb-4">
              Restaurantes
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold">Para Restaurantes</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Unirte al club te abre las puertas a una nueva forma de gestionar y hacer crecer tu negocio gastronómico.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {RESTAURANT_BENEFITS.map(({ icon: Icon, title, desc }, i) => (
              <FadeIn key={title} delay={i * 80}>
                <div className="bg-card border border-border rounded-2xl p-6 h-full hover:border-primary/40 transition-colors duration-300">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn className="text-center">
            <Button size="lg" asChild>
              <Link href="/registro/empresa">Afiliar mi restaurante</Link>
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* ══ PARA SOCIOS ══ */}
      <section className="py-20 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium tracking-widest uppercase mb-4">
              Socios
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold">Para Socios</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Ser socio del Club GTG es acceder a un universo de experiencias gastronómicas con beneficios pensados para los comensales más exigentes.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {CLIENT_BENEFITS.map(({ icon: Icon, title, desc }, i) => (
              <FadeIn key={title} delay={i * 80}>
                <div className="bg-card border border-border rounded-2xl p-6 h-full hover:border-primary/40 transition-colors duration-300">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn className="text-center">
            <Button size="lg" asChild>
              <Link href="/registro/cliente">Hacerme socio</Link>
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* ══ RESTAURANTES DESTACADOS ══ */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium tracking-widest uppercase mb-4">
              Red GTG
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold">Restaurantes que ya son parte</h2>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            {MOCK_RESTAURANTS.map(({ name, category, photo }, i) => (
              <FadeIn key={name} delay={i * 60}>
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group cursor-default">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://images.unsplash.com/${photo}?w=600&q=80`}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-semibold text-sm">{name}</p>
                    <p className="text-white/60 text-xs">{category}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn className="text-center">
            <p className="text-muted-foreground text-sm">Y muchos más restaurantes sumándose cada semana...</p>
          </FadeIn>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="border-t border-border py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10 mb-10">

            {/* Brand */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <Logo size="sm" withGlow />
              <p className="text-sm text-muted-foreground text-center md:text-left max-w-xs">
                La comunidad que eleva la experiencia gastronómica a otro nivel.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { Icon: Instagram, label: "Instagram" },
                  { Icon: Twitter,   label: "Twitter"   },
                  { Icon: Facebook,  label: "Facebook"  },
                ].map(({ Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary/50 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center md:justify-end gap-x-12 gap-y-6 text-sm">
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Club</p>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Sobre nosotros</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contacto</a>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Legal</p>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Términos y condiciones</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Política de privacidad</a>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6 text-center">
            <p className="text-xs text-muted-foreground">© 2026 Club Gastronómico GTG. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
