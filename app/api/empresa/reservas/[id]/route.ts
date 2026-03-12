import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReservationStatus } from "@prisma/client";

const VALID_STATUSES: ReservationStatus[] = [
  "PENDIENTE", "CONFIRMADA", "RECHAZADA", "COMPLETADA", "CANCELADA",
];

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPRESA") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurante no encontrado" }, { status: 404 });
  }

  // Verify ownership
  const reservation = await prisma.reservation.findUnique({
    where: { id: params.id },
    select: { restaurantId: true },
  });

  if (!reservation || reservation.restaurantId !== restaurant.id) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  }

  const body = await req.json();
  const { status, rejectReason } = body;

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const updated = await prisma.reservation.update({
    where: { id: params.id },
    data: {
      status,
      rejectReason: status === "RECHAZADA" ? (rejectReason ?? null) : null,
    },
    include: {
      client: {
        include: {
          user: { select: { name: true, email: true, image: true } },
        },
      },
    },
  });

  return NextResponse.json(updated);
}
