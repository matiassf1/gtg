import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReservationStatus } from "@prisma/client";
import { createNotification } from "@/lib/notifications";

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
    select: { id: true, name: true },
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
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      },
    },
  });

  // Notify client on confirmation or rejection
  if (status === "CONFIRMADA" || status === "RECHAZADA") {
    const formattedDate = updated.date.toLocaleDateString("es-AR", {
      weekday: "long", day: "numeric", month: "long",
    });

    if (status === "CONFIRMADA") {
      await createNotification({
        userId: updated.client.user.id,
        type: "RESERVA_CONFIRMADA",
        title: "Reserva confirmada",
        message: `Tu reserva en ${restaurant.name} para el ${formattedDate} fue confirmada.`,
        data: { reservationId: params.id, restaurantId: restaurant.id, restaurantName: restaurant.name },
      });
    } else {
      await createNotification({
        userId: updated.client.user.id,
        type: "RESERVA_RECHAZADA",
        title: "Reserva rechazada",
        message: `Tu reserva en ${restaurant.name} para el ${formattedDate} fue rechazada.${rejectReason ? ` Motivo: ${rejectReason}` : ""}`,
        data: { reservationId: params.id, restaurantId: restaurant.id, restaurantName: restaurant.name, rejectReason },
      });
    }
  }

  return NextResponse.json(updated);
}
