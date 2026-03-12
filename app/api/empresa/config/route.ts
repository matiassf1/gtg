import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getRestaurant(userId: string) {
  return prisma.restaurant.findUnique({ where: { userId } });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPRESA") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const restaurant = await getRestaurant(session.user.id);
  if (!restaurant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const config = await prisma.restaurantConfig.upsert({
    where: { restaurantId: restaurant.id },
    create: { restaurantId: restaurant.id },
    update: {},
  });

  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPRESA") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const restaurant = await getRestaurant(session.user.id);
  if (!restaurant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();

  // Only pick known fields to avoid mass-assignment
  const allowed = [
    "maxCapacity",
    "maxReservationsPerSlot",
    "reservationDuration",
    "autoConfirm",
    "minAdvance",
    "maxAdvance",
    "reservationSchedule",
    "emailNewReservation",
    "emailNewReview",
    "emailDailySummary",
  ] as const;

  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  const config = await prisma.restaurantConfig.upsert({
    where: { restaurantId: restaurant.id },
    create: { restaurantId: restaurant.id, ...data },
    update: data,
  });

  return NextResponse.json(config);
}
