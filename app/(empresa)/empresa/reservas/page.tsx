import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReservasClient } from "@/components/empresa/reservas-client";

export default async function ReservasPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPRESA") redirect("/login");

  const restaurant = await prisma.restaurant.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!restaurant) redirect("/empresa/dashboard");

  const reservations = await prisma.reservation.findMany({
    where: { restaurantId: restaurant.id },
    include: {
      client: {
        include: {
          user: { select: { name: true, email: true, image: true } },
        },
      },
    },
    orderBy: { date: "asc" },
  });

  // Serialize dates to ISO strings for the client component
  const serialized = reservations.map((r) => ({
    ...r,
    date: r.date.toISOString(),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return <ReservasClient initialReservations={serialized} />;
}
