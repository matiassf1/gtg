"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
  Menu, X, CheckCircle2, XCircle,
  Instagram, Twitter, Facebook,
  UtensilsCrossed, BookOpen, Award, BarChart3, Users, Star, RefreshCw,
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
const NOT_US = [
  "Groupon",
  "ElTenedor",
  "Un comparador de restaurantes",
  "Una app de descuentos",
  "Un sistema de reservas masivas",
];

const SISTEMA_G = [
  {
    icon: UtensilsCrossed,
    title: "Experiencias reales realizadas",
    desc: "Cada valoración parte de una visita verificada, registrada dentro del club.",
  },
  {
    icon: BarChart3,
    title: "Consistencia en el tiempo",
    desc: "El Sistema G mide la trayectoria gastronómica, no un momento puntual.",
  },
  {
    icon: Star,
    title: "Satisfacción cualificada",
    desc: "Sólo opinan quienes han vivido la experiencia como miembros del club.",
  },
  {
    icon: RefreshCw,
    title: "Repetición espontánea",
    desc: "La prueba más honesta de calidad: el comensal que regresa por voluntad propia.",
  },
];

const RESTAURANT_BENEFITS = [
  "Clientes nuevos en horas valle",
  "Contenido reputacional auténtico",
  "Posicionamiento en guía nacional selectiva",
  "Sin comisiones por reserva",
  "Sin descuentos agresivos",
  "Sin intermediarios",
];

const CLIENT_BENEFITS = [
  {
    icon: Award,
    title: "Experiencias exclusivas",
    desc: "Acceso a propuestas gastronómicas diseñadas directamente por los restaurantes del club, fuera del circuito habitual.",
  },
  {
    icon: Star,
    title: "Índice Gastro G®",
    desc: "Participas en la construcción de la primera guía gastronómica valorada únicamente por comensales verificados.",
  },
  {
    icon: BookOpen,
    title: "Propuestas con criterio",
    desc: "Los restaurantes diseñan para los miembros del club. No son descuentos: son experiencias a medida.",
  },
  {
    icon: Users,
    title: "Comunidad selecta",
    desc: "Formas parte de una comunidad de comensales activos con criterio gastronómico real.",
  },
];

const MOCK_RESTAURANTS = [
  { name: "Diverxo",        category: "Cocina de autor",  photo: "photo-1414235077428-338989a2e8c0" },
  { name: "El Club Allard", category: "Alta cocina",      photo: "photo-1544025162-d76538748e34" },
  { name: "Casa Botín",     category: "Cocina española",  photo: "photo-1555396273-367ea4eb4db5" },
  { name: "Barra M",        category: "Tapas",            photo: "photo-1579871494447-9811cf80d66c" },
  { name: "Alabaster",      category: "Contemporánea",    photo: "photo-1551218808-94e220e084d2" },
  { name: "El Paraguas",    category: "Marisquería",      photo: "photo-1559339352-11d035aa65de" },
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

          {/* Desktop: 4 buttons */}
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

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-4 grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" asChild className="border-primary text-primary hover:bg-primary/10" onClick={() => setMenuOpen(false)}>
              <Link href="/registro/empresa">Afiliar Restaurante</Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="border-primary text-primary hover:bg-primary/10" onClick={() => setMenuOpen(false)}>
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
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80"
            alt=""
            className="w-full h-full object-cover opacity-[0.07]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/80" />
        </div>
        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full bg-primary/4 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto animate-fade-in">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-[0.2em] uppercase mb-8">
            Club Gastronómico Privado · España
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-[3.75rem] font-bold leading-[1.1] mb-7 tracking-tight">
            Bienvenido al {" "}
            <span className="text-primary">Club GTG</span>{" "}
            
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            GTG es un club para{" "}
            <em className="text-foreground/80 not-italic">vivir la gastronomia desde dentro.</em>
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild className="px-8">
              <Link href="/registro/cliente">Solicitar membresía</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-primary/40 text-primary hover:bg-primary/10 px-8">
              <Link href="/registro/empresa">Afiliar mi restaurante</Link>
            </Button>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/40">
          <span className="text-xs tracking-widest uppercase">Descubre más</span>
          <div className="w-px h-8 bg-gradient-to-b from-muted-foreground/40 to-transparent" />
        </div>
      </section>

      {/* ══ LO QUE NO SOMOS ══ */}
      <section className="py-24 px-4 bg-card/20">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Lo que <span className="text-red-500">no</span> somos</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Antes de explicar qué es GTG, conviene aclarar qué no es.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {NOT_US.map((item, i) => (
              <FadeIn key={item} delay={i * 70}>
                <div className="flex items-center gap-4 bg-card border border-red-500/15 rounded-2xl px-6 py-5 hover:border-red-500/30 transition-colors duration-300">
                  <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <span className="font-medium text-foreground/80">{item}</span>
                </div>
              </FadeIn>
            ))}
          </div>

        </div>
      </section>

      {/* ══ QUÉ ES GTG ══ */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <FadeIn>
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-widest uppercase mb-6">
                Qué es GTG
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold mb-8 leading-tight">
                Un club con criterio
              </h2>
              <div className="space-y-5 text-muted-foreground leading-relaxed">
                <p>
                  GTG es un club privado de comensales que accede a experiencias gastronómicas diseñadas exclusivamente por los restaurantes afiliados. No hay intermediarios. No hay algoritmos. Sólo cocina real y comensales que saben apreciarla.
                </p>
                <p>
                  Los socios participan activamente en la construcción del{" "}
                  <strong className="text-foreground">Índice Gastro G®</strong>, la primera guía gastronómica española valorada exclusivamente por clientes reales y verificados —no por críticos anónimos ni por usuarios aleatorios de internet.
                </p>
                <p>
                  Para los restaurantes, el club representa visibilidad selectiva donde la escasez genera valor: un número limitado de afiliados por provincia, una reputación construida sobre experiencia real, y acceso a comensales cualificados durante franjas horarias de menor afluencia.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={150}>
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
                  alt="Interior de restaurante de alta cocina"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══ SISTEMA G ══ */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Subtle differentiated background */}
        <div className="absolute inset-0 bg-card/40 border-y border-primary/10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <FadeIn className="text-center mb-6">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-widest uppercase mb-6">
              Reputación real
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Índice Gastro G<span className="text-primary align-super text-xl">®</span>
              {" "}— Sistema G
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              La reputación se construye comiendo, no opinando.
            </p>
          </FadeIn>

          {/* Featured quote */}
          <FadeIn delay={80}>
            <blockquote className="text-center max-w-3xl mx-auto mb-16 mt-4">
              <p className="text-2xl sm:text-3xl font-semibold text-foreground/90 leading-snug">
                &ldquo;El Sistema G no se basa en opiniones abiertas,{" "}
                <span className="text-primary">sino en vivencias reales</span>{" "}
                organizadas dentro del club.&rdquo;
              </p>
            </blockquote>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SISTEMA_G.map(({ icon: Icon, title, desc }, i) => (
              <FadeIn key={title} delay={i * 80}>
                <div className="bg-background/60 border border-primary/15 rounded-2xl p-6 h-full hover:border-primary/35 transition-colors duration-300">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2 text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CÓMO FUNCIONA ══ */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-widest uppercase mb-6">
              El modelo
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold">Cómo funciona</h2>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6">
            {/* La Guía */}
            <FadeIn delay={0}>
              <div className="bg-card border border-border rounded-2xl p-8 h-full hover:border-primary/30 transition-colors duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">La Guía</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Una guía nacional selectiva de restaurantes. Máximo cincuenta establecimientos por provincia. Cada restaurante se ha ganado su lugar a través del Sistema G —no mediante suscripción, sino mediante excelencia verificada.
                </p>
              </div>
            </FadeIn>

            {/* El Club */}
            <FadeIn delay={120}>
              <div className="bg-card border border-border rounded-2xl p-8 h-full hover:border-primary/30 transition-colors duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">El Club</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Un club privado de comensales que participa en experiencias gastronómicas programadas. Los restaurantes ofrecen un número limitado de experiencias entre semana, en formato controlado, dirigidas exclusivamente a miembros del club.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══ PARA RESTAURANTES ══ */}
      <section className="py-24 px-4 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-widest uppercase mb-6">
              Restaurantes
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Para restaurantes</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Un modelo diseñado para que el restaurante recupere el control de su reputación y de su clientela.
            </p>
          </FadeIn>

          <FadeIn delay={80}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-12">
              {RESTAURANT_BENEFITS.map((benefit, i) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 bg-card border border-border rounded-xl px-5 py-4 hover:border-primary/30 transition-colors duration-300"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild className="px-8">
              <Link href="/registro/empresa">Afiliar mi restaurante</Link>
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* ══ PARA SOCIOS ══ */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-widest uppercase mb-6">
              Socios
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Para comensales</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Accede a experiencias que no encontrarás en ninguna otra plataforma.
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
            <Button size="lg" asChild className="px-10">
              <Link href="/registro/cliente">Hacerme socio · 9,99€/mes</Link>
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* ══ RESTAURANTES DESTACADOS ══ */}
      <section className="py-24 px-4 bg-card/20">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-widest uppercase mb-6">
              Red GTG
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold">Restaurantes que ya forman parte</h2>
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
            <p className="text-muted-foreground text-sm">La red crece cada semana. Máximo cincuenta establecimientos por provincia.</p>
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
                La reputación se construye comiendo, no opinando.
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
