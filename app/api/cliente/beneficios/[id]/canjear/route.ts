import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
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

  const benefit = await prisma.benefit.findFirst({
    where: { id: params.id, clientId: client.id },
  });

  if (!benefit) return NextResponse.json({ error: "Beneficio no encontrado" }, { status: 404 });
  if (benefit.status !== "DISPONIBLE") {
    return NextResponse.json({ error: "Este beneficio ya no está disponible" }, { status: 409 });
  }

  // Check promotion is still valid
  const promotion = await prisma.promotion.findUnique({
    where: { id: benefit.promotionId },
  });
  const now = new Date();
  if (!promotion || !promotion.active || promotion.validUntil < now) {
    // Mark as expired
    await prisma.benefit.update({ where: { id: params.id }, data: { status: "EXPIRADO" } });
    return NextResponse.json({ error: "La promoción ya expiró" }, { status: 410 });
  }

  const updated = await prisma.benefit.update({
    where: { id: params.id },
    data: { status: "CANJEADO", redeemedAt: now },
  });

  // Increment promotion usage
  await prisma.promotion.update({
    where: { id: benefit.promotionId },
    data: { usageCount: { increment: 1 } },
  });

  return NextResponse.json(updated);
}
