"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerCliente } from "@/lib/actions/auth";
import {
  Loader2, Eye, EyeOff, Check, Lock, CreditCard,
  Utensils, Calendar, Trophy, Sparkles, Star, ChevronLeft,
} from "lucide-react";

const PREFERENCIAS = [
  "Tapas", "Cocina española", "Italiana", "Japonesa", "Asador",
  "Marisquería", "Cocina de autor", "Mexicana", "Vegetariana",
  "Pizza", "Hamburguesería", "Cafetería", "Pastelería", "Fusión", "Árabe",
];

const BENEFICIOS = [
  { icon: Utensils, text: "Acceso a restaurantes exclusivos" },
  { icon: Star, text: "Descuentos y promociones" },
  { icon: Calendar, text: "Reservas prioritarias" },
  { icon: Trophy, text: "Participación en el ranking de socios" },
  { icon: Sparkles, text: "Experiencias gastronómicas únicas" },
];

type FormValues = {
  name: string;
  email: string;
  password: string;
  preferences: string[];
};

// ─── Stepper ────────────────────────────────────────────────────────────────

function Stepper({ step }: { step: number }) {
  const steps = ["Datos", "Membresía", "Confirmación"];
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((label, i) => {
        const idx = i + 1;
        const isCompleted = idx < step;
        const isActive = idx === step;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                  isCompleted
                    ? "bg-primary border-primary text-black"
                    : isActive
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : idx}
              </div>
              <span
                className={`text-xs font-medium whitespace-nowrap ${
                  isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-[2px] w-14 mx-2 mb-5 transition-all duration-300 ${
                  isCompleted ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Payment Modal ───────────────────────────────────────────────────────────

function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  price,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  price: string;
  loading: boolean;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
      />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-border">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Pago seguro</h3>
            <p className="text-xs text-muted-foreground">Cifrado SSL 256-bit · Datos protegidos</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Número de tarjeta</label>
            <div className="relative">
              <Input placeholder="1234 5678 9012 3456" className="pr-10" maxLength={19} />
              <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Vencimiento</label>
              <Input placeholder="MM/AA" maxLength={5} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">CVC</label>
              <Input placeholder="123" maxLength={4} type="password" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Nombre en la tarjeta</label>
            <Input placeholder="Nombre Apellido" />
          </div>
        </div>

        <Button className="w-full mt-6 gap-2" onClick={onConfirm} disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Confirmar pago · {price}
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" />
          Pago simulado — ningún dato es procesado
        </p>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RegistroClientePage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({
    name: "",
    email: "",
    password: "",
    preferences: [],
  });

  function togglePreferencia(pref: string) {
    setSelected((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  }

  function handleStep1(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (selected.length === 0) {
      setError("Selecciona al menos una preferencia.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    setFormValues({
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      password: fd.get("password") as string,
      preferences: selected,
    });
    setStep(2);
  }

  async function handleConfirmPayment() {
    setLoading(true);
    const fd = new FormData();
    fd.append("name", formValues.name);
    fd.append("email", formValues.email);
    fd.append("password", formValues.password);
    formValues.preferences.forEach((p) => fd.append("preferences", p));
    fd.append("plan", "MEMBER");

    const result = await registerCliente(fd);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      setShowPaymentModal(false);
      return;
    }

    setStep(3);
    await signIn("credentials", {
      email: formValues.email,
      password: formValues.password,
      callbackUrl: "/cliente/explorar",
    });
  }

  const titles: Record<number, { title: string; subtitle: string }> = {
    1: { title: "Crea tu cuenta", subtitle: "Descubre los mejores restaurantes" },
    2: { title: "Membresía Club GTG", subtitle: "Un único pago para toda la vida" },
    3: { title: "¡Bienvenido al Club!", subtitle: "Procesando tu registro..." },
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <Link href="/"><Logo size="lg" /></Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">{titles[step].title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{titles[step].subtitle}</p>
          </div>
        </div>

        <Stepper step={step} />

        {/* ── Step 1: Datos personales ── */}
        {step === 1 && (
          <form onSubmit={handleStep1}>
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Nombre completo</label>
                <Input
                  name="name"
                  type="text"
                  placeholder="Ej: María García"
                  required
                  defaultValue={formValues.name}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  autoComplete="email"
                  defaultValue={formValues.email}
                />
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
                    defaultValue={formValues.password}
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Tus preferencias gastronómicas
                  <span className="text-muted-foreground font-normal ml-1">(al menos 1)</span>
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

              <Button type="submit" className="w-full">
                Siguiente →
              </Button>
            </div>
          </form>
        )}

        {/* ── Step 2: Membresía ── */}
        {step === 2 && (
          <div className="space-y-4">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Volver
            </button>

            {/* Membership card */}
            <div className="bg-card border-2 border-primary rounded-2xl p-6 shadow-[0_0_40px_rgba(57,255,20,0.12)]">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  Club GTG
                </div>
                <h2 className="text-xl font-bold text-foreground mb-3">Membresía Club GTG</h2>
                <div className="flex items-end justify-center gap-1">
                  <span
                    className="font-black leading-none"
                    style={{ fontSize: "3.5rem", color: "#39ff14" }}
                  >
                    9,99€
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Pago único · Acceso de por vida</p>
              </div>

              <div className="space-y-3 mb-6">
                {BENEFICIOS.map(({ text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{text}</span>
                  </div>
                ))}
              </div>

              <Button
                className="w-full gap-2"
                size="lg"
                onClick={() => setShowPaymentModal(true)}
              >
                <Lock className="w-4 h-4" />
                Pagar y unirme al Club
              </Button>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}
          </div>
        )}

        {/* ── Step 3: Loading/redirect ── */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <p className="text-foreground font-semibold">¡Registro exitoso!</p>
            <p className="text-sm text-muted-foreground">Ingresando al Club GTG...</p>
          </div>
        )}

        {step !== 3 && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        )}
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handleConfirmPayment}
        price="9,99€"
        loading={loading}
      />
    </div>
  );
}
