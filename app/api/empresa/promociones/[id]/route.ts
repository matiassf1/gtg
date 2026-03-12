import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PromotionType } from "@prisma/client";

async function verifyOwnership(promoId: string, userId: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!restaurant) return false;

  const promo = await prisma.promotion.findUnique({
    where: { id: promoId },
    select: { restaurantId: true },
  });
  return promo?.restaurantId === restaurant.id;
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPRESA") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!(await verifyOwnership(params.id, session.user.id))) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const body = await req.json();

  // Toggle shortcut: { active: boolean }
  if (Object.keys(body).length === 1 && "active" in body) {
    const updated = await prisma.promotion.update({
      where: { id: params.id },
      data: { active: body.active },
    });
    return NextResponse.json(updated);
  }

  // Full update
  const { title, description, type, discountPercent, validFrom, validUntil, conditions, active } = body;

  const VALID_TYPES: PromotionType[] = ["DESCUENTO", "DOS_X_UNO", "MENU_ESPECIAL", "OTRO"];
  if (type && !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  }

  const updated = await prisma.promotion.update({
    where: { id: params.id },
    data: {
      ...(title && { title: title.trim() }),
      description: description?.trim() || null,
      ...(type && { type }),
      discountPercent: type === "DESCUENTO" && discountPercent ? Number(discountPercent) : null,
      ...(validFrom && { validFrom: new Date(validFrom) }),
      ...(validUntil && { validUntil: new Date(validUntil) }),
      conditions: conditions?.trim() || null,
      ...(active !== undefined && { active }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPRESA") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!(await verifyOwnership(params.id, session.user.id))) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await prisma.promotion.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
