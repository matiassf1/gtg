import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReservasClient } from "@/components/cliente/reservas-client";

export default async function ReservasPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "CLIENTE") redirect("/login");

  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!client) {
    return <ReservasClient initialReservations={[]} reviewedIds={[]} />;
  }

  const [reservations, reviews] = await Promise.all([
    prisma.reservation.findMany({
      where: { clientId: client.id },
      include: {
        restaurant: {
          select: { id: true, name: true, photos: true, category: true, address: true, city: true },
        },
      },
      orderBy: { date: "desc" },
    }),
    prisma.review.findMany({
      where: { clientId: client.id },
      select: { restaurantId: true },
    }),
  ]);

  const reviewedIds = reviews.map((r) => r.restaurantId);

  const data = reservations.map((r) => ({
    ...r,
    date: r.date.toISOString(),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return <ReservasClient initialReservations={data} reviewedIds={reviewedIds} />;
}
