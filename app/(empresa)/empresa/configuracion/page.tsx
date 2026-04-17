import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ConfigForm, type ConfigData } from "@/components/empresa/config-form";

export default async function ConfiguracionPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPRESA") redirect("/login");

  const restaurant = await prisma.restaurant.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!restaurant) redirect("/empresa/perfil");

  // Upsert: create config with defaults if it doesn't exist yet
  const config = await prisma.restaurantConfig.upsert({
    where: { restaurantId: restaurant.id },
    create: { restaurantId: restaurant.id },
    update: {},
  });

  const configData: ConfigData = {
    maxCapacity:            config.maxCapacity,
    maxReservationsPerSlot: config.maxReservationsPerSlot,
    reservationDuration:    config.reservationDuration,
    autoConfirm:            config.autoConfirm,
    minAdvance:             config.minAdvance,
    maxAdvance:             config.maxAdvance,
    reservationSchedule:    config.reservationSchedule,
    emailNewReservation:    config.emailNewReservation,
    emailNewReview:         config.emailNewReview,
    emailDailySummary:      config.emailDailySummary,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Configuración</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona las preferencias de reservas, horarios, notificaciones y tu cuenta
        </p>
      </div>

      <ConfigForm config={configData} />
    </div>
  );
}
