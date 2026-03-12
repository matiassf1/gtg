import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PromotionType } from "@prisma/client";

async function getRestaurantId(userId: string) {
  const r = await prisma.restaurant.findUnique({
    where: { userId },
    select: { id: true },
  });
  return r?.id ?? null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPRESA") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const restaurantId = await getRestaurantId(session.user.id);
  if (!restaurantId) return NextResponse.json({ error: "Restaurante no encontrado" }, { status: 404 });

  const promotions = await prisma.promotion.findMany({
    where: { restaurantId },
    orderBy: { validFrom: "desc" },
  });

  return NextResponse.json(promotions);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPRESA") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const restaurantId = await getRestaurantId(session.user.id);
  if (!restaurantId) return NextResponse.json({ error: "Restaurante no encontrado" }, { status: 404 });

  const body = await req.json();
  const { title, description, type, discountPercent, validFrom, validUntil, conditions, active } = body;

  if (!title?.trim() || !type || !validFrom || !validUntil) {
    return NextResponse.json({ error: "Campos requeridos incompletos" }, { status: 400 });
  }

  const VALID_TYPES: PromotionType[] = ["DESCUENTO", "DOS_X_UNO", "MENU_ESPECIAL", "OTRO"];
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  }

  const promotion = await prisma.promotion.create({
    data: {
      restaurantId,
      title: title.trim(),
      description: description?.trim() || null,
      type,
      discountPercent: type === "DESCUENTO" && discountPercent ? Number(discountPercent) : null,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      conditions: conditions?.trim() || null,
      active: active !== false,
    },
  });

  return NextResponse.json(promotion, { status: 201 });
}
