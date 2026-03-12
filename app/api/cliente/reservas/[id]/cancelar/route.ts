import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "CLIENTE") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!client) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });

  const reservation = await prisma.reservation.findFirst({
    where: { id: params.id, clientId: client.id },
  });
  if (!reservation) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });

  if (reservation.status === "CANCELADA" || reservation.status === "COMPLETADA") {
    return NextResponse.json({ error: "No se puede cancelar esta reserva" }, { status: 409 });
  }

  if (reservation.date < new Date()) {
    return NextResponse.json({ error: "No se puede cancelar una reserva pasada" }, { status: 409 });
  }

  const updated = await prisma.reservation.update({
    where: { id: params.id },
    data: { status: "CANCELADA" },
  });

  return NextResponse.json(updated);
}
