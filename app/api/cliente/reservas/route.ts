import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "CLIENTE") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!client) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });

  const reservations = await prisma.reservation.findMany({
    where: { clientId: client.id },
    include: {
      restaurant: { select: { id: true, name: true, photos: true, category: true, address: true, city: true } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(reservations);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "CLIENTE") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!client) return NextResponse.json({ error: "Perfil de cliente no encontrado" }, { status: 404 });

  const { restaurantId, date, time, guests, notes } = await req.json();

  if (!restaurantId || !date || !time || !guests) {
    return NextResponse.json({ error: "Campos requeridos incompletos" }, { status: 400 });
  }

  const dateTime = new Date(`${date}T${time}:00`);
  if (isNaN(dateTime.getTime())) {
    return NextResponse.json({ error: "Fecha u hora inválida" }, { status: 400 });
  }
  if (dateTime < new Date()) {
    return NextResponse.json({ error: "La fecha debe ser en el futuro" }, { status: 400 });
  }

  const reservation = await prisma.reservation.create({
    data: {
      restaurantId,
      clientId: client.id,
      date: dateTime,
      guests: Number(guests),
      notes: notes?.trim() || null,
      status: "PENDIENTE",
    },
  });

  return NextResponse.json(reservation, { status: 201 });
}
