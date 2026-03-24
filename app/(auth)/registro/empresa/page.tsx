"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerEmpresa } from "@/lib/actions/auth";
import {
  Loader2, Eye, EyeOff, Check, Lock, CreditCard,
  LayoutDashboard, Calendar, Tag, BarChart2, Users,
  Headphones, ChevronLeft, Phone, MessageSquare,
} from "lucide-react";

const CATEGORIAS = [
  "Parrilla", "Italiana", "Japonesa", "Mexicana", "Americana",
  "Vegetariana", "Mariscos", "Pizza", "Hamburguesas", "Cafetería",
  "Pastelería", "Fusión", "Española", "China", "Árabe",
];

const CIUDADES = [
  "Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata",
  "Mar del Plata", "San Miguel de Tucumán", "Salta", "Santa Fe", "Otra",
];

const BENEFICIOS = [
  { icon: LayoutDashboard, text: "Perfil en la plataforma" },
  { icon: Calendar, text: "Gestión de reservas" },
  { icon: Tag, text: "Sistema de promociones" },
  { icon: BarChart2, text: "Dashboard de métricas" },
  { icon: Users, text: "Visibilidad ante socios del club" },
  { icon: Headphones, text: "Soporte prioritario" },
];

type FormValues = {
  name: string;
  email: string;
  password: string;
  restaurantName: string;
  category: string;
  city: string;
};

type PlanType = "STANDARD" | "FORMACION_BONIFICADA";

const SELECT_CLASS =
  "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

// ─── Stepper ────────────────────────────────────────────────────────────────

function Stepper({ step }: { step: number }) {
  const steps = ["Datos", "Plan", "Confirmación"];
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

// ─── Formativa Modal ─────────────────────────────────────────────────────────

function FormativaModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (phone: string) => void;
  loading: boolean;
}) {
  const [phone, setPhone] = useState("");

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
      />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-border">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Bonificación Formativa</h3>
            <p className="text-xs text-muted-foreground">Te contactaremos en 24–48h</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-5">
          Un asesor se pondrá en contacto contigo para gestionar la bonificación formativa.
          Por favor dejá tu número de teléfono.
        </p>

        <div className="space-y-1.5 mb-6">
          <label className="text-sm font-medium text-foreground">Teléfono de contacto</label>
          <div className="relative">
            <Input
              placeholder="+54 11 1234-5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-10"
            />
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <Button className="w-full gap-2" onClick={() => onConfirm(phone)} disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Enviar solicitud"
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Plan Card ───────────────────────────────────────────────────────────────

function PlanCard({
  title,
  price,
  priceLabel,
  badge,
  benefits,
  isSelected,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  variant,
}: {
  title: string;
  price: string;
  priceLabel: string;
  badge?: string;
  benefits: string[];
  isSelected: boolean;
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
  variant: "solid" | "outline";
}) {
  return (
    <div
      className={`relative bg-card rounded-2xl p-5 flex flex-col transition-all duration-200 cursor-pointer border-2 ${
        isSelected
          ? "border-primary shadow-[0_0_30px_rgba(57,255,20,0.2)]"
          : "border-border hover:border-primary/50"
      }`}
      onClick={onPrimary}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary/10 border border-primary/30 text-primary text-xs font-semibold px-3 py-0.5 rounded-full whitespace-nowrap">
            {badge}
          </span>
        </div>
      )}

      <div className="text-center mb-4">
        <h3 className="font-bold text-foreground mb-3">{title}</h3>
        <div className="flex items-end justify-center gap-1">
          {price === "Crédito formativo" ? (
            <span className="text-xl font-bold text-primary leading-none">Crédito formativo</span>
          ) : (
            <span className="font-black leading-none" style={{ fontSize: "2.75rem", color: "#39ff14" }}>
              {price}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{priceLabel}</p>
      </div>

      <div className="space-y-2 mb-5 flex-1">
        {benefits.map((b) => (
          <div key={b} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Check className="w-2.5 h-2.5 text-primary" />
            </div>
            <span className="text-xs text-foreground">{b}</span>
          </div>
        ))}
      </div>

      {variant === "solid" ? (
        <Button className="w-full" size="sm" onClick={(e) => { e.stopPropagation(); onPrimary(); }}>
          {primaryLabel}
        </Button>
      ) : (
        <Button
          variant="outline"
          className="w-full border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
          size="sm"
          onClick={(e) => { e.stopPropagation(); onSecondary?.(); }}
        >
          {secondaryLabel || primaryLabel}
        </Button>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RegistroEmpresaPage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFormativaModal, setShowFormativaModal] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({
    name: "",
    email: "",
    password: "",
    restaurantName: "",
    category: "",
    city: "",
  });

  function handleStep1(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    setFormValues({
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      password: fd.get("password") as string,
      restaurantName: fd.get("restaurantName") as string,
      category: fd.get("category") as string,
      city: fd.get("city") as string,
    });
    setStep(2);
  }

  async function completeRegistration(plan: PlanType) {
    setLoading(true);
    const fd = new FormData();
    fd.append("name", formValues.name);
    fd.append("email", formValues.email);
    fd.append("password", formValues.password);
    fd.append("restaurantName", formValues.restaurantName);
    fd.append("category", formValues.category);
    fd.append("city", formValues.city);
    fd.append("plan", plan);

    const result = await registerEmpresa(fd);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      setShowPaymentModal(false);
      setShowFormativaModal(false);
      return;
    }

    setStep(3);
    await signIn("credentials", {
      email: formValues.email,
      password: formValues.password,
      callbackUrl: "/empresa/dashboard",
    });
  }

  const benefitTexts = BENEFICIOS.map((b) => b.text);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <Link href="/"><Logo size="lg" /></Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              {step === 1 ? "Registrá tu restaurante" : step === 2 ? "Elegí tu plan" : "¡Bienvenido!"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {step === 1
                ? "Creá tu cuenta como empresa"
                : step === 2
                ? "Seleccioná cómo querés afiliarte al Club"
                : "Procesando tu registro..."}
            </p>
          </div>
        </div>

        <Stepper step={step} />

        {/* ── Step 1: Datos del restaurante ── */}
        {step === 1 && (
          <form onSubmit={handleStep1}>
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Tu nombre completo</label>
                <Input
                  name="name"
                  type="text"
                  placeholder="Ej: Juan García"
                  required
                  defaultValue={formValues.name}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Nombre del restaurante</label>
                <Input
                  name="restaurantName"
                  type="text"
                  placeholder="Ej: La Parrilla del Norte"
                  required
                  defaultValue={formValues.restaurantName}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Categoría</label>
                  <select name="category" required className={SELECT_CLASS} defaultValue={formValues.category}>
                    <option value="">Seleccioná</option>
                    {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">Ciudad</label>
                  <select name="city" required className={SELECT_CLASS} defaultValue={formValues.city}>
                    <option value="">Seleccioná</option>
                    {CIUDADES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="restaurante@email.com"
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

        {/* ── Step 2: Plan selection ── */}
        {step === 2 && (
          <div className="space-y-4">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Volver
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {/* Plan Estándar */}
              <PlanCard
                title="Plan Estándar"
                price="400€"
                priceLabel="/ año"
                benefits={benefitTexts}
                isSelected={selectedPlan === "STANDARD"}
                primaryLabel="Seleccionar plan"
                variant="solid"
                onPrimary={() => {
                  setSelectedPlan("STANDARD");
                  setShowPaymentModal(true);
                }}
              />

              {/* Bonificación Formativa */}
              <PlanCard
                title="Bonificación Formativa"
                price="Crédito formativo"
                priceLabel="Bonificado por formación"
                badge="Consultar disponibilidad"
                benefits={benefitTexts}
                isSelected={selectedPlan === "FORMACION_BONIFICADA"}
                primaryLabel="Solicitar información"
                secondaryLabel="Solicitar información"
                variant="outline"
                onPrimary={() => {
                  setSelectedPlan("FORMACION_BONIFICADA");
                  setShowFormativaModal(true);
                }}
                onSecondary={() => {
                  setSelectedPlan("FORMACION_BONIFICADA");
                  setShowFormativaModal(true);
                }}
              />
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
            <p className="text-foreground font-semibold">¡Restaurante registrado!</p>
            <p className="text-sm text-muted-foreground">Ingresando al panel de gestión...</p>
          </div>
        )}

        {step !== 3 && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Iniciá sesión
            </Link>
          </p>
        )}
      </div>

      {/* Payment modal — Plan Estándar */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={() => completeRegistration("STANDARD")}
        price="400€"
        loading={loading}
      />

      {/* Inquiry modal — Bonificación Formativa */}
      <FormativaModal
        isOpen={showFormativaModal}
        onClose={() => setShowFormativaModal(false)}
        onConfirm={() => completeRegistration("FORMACION_BONIFICADA")}
        loading={loading}
      />
    </div>
  );
}
