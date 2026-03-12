import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

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

  const reviews = await prisma.review.findMany({
    where: { clientId: client.id },
    include: {
      restaurant: { select: { id: true, name: true, photos: true, category: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    reviews.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }))
  );
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

  const { restaurantId, rating, comment } = await req.json();

  if (!restaurantId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const existing = await prisma.review.findFirst({
    where: { restaurantId, clientId: client.id },
  });
  if (existing) {
    return NextResponse.json({ error: "Ya dejaste una reseña para este restaurante" }, { status: 409 });
  }

  const review = await prisma.review.create({
    data: {
      restaurantId,
      clientId: client.id,
      rating: Number(rating),
      comment: comment?.trim() || null,
    },
    include: {
      client: { include: { user: { select: { name: true, email: true, image: true } } } },
    },
  });

  // Recalculate average rating
  const allRatings = await prisma.review.findMany({
    where: { restaurantId },
    select: { rating: true },
  });
  const avg = allRatings.reduce((s, r) => s + r.rating, 0) / allRatings.length;
  await prisma.restaurant.update({
    where: { id: restaurantId },
    data: { averageRating: Math.round(avg * 10) / 10 },
  });

  // Notify restaurant owner
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { userId: true, name: true },
  });
  if (restaurant) {
    const stars = "★".repeat(Number(rating)) + "☆".repeat(5 - Number(rating));
    await createNotification({
      userId: restaurant.userId,
      type: "NUEVA_RESENA",
      title: "Nueva reseña recibida",
      message: `${session.user.name ?? "Un cliente"} dejó una reseña de ${stars} (${rating}/5)${review.comment ? `: "${review.comment.slice(0, 80)}${review.comment.length > 80 ? "…" : ""}"` : "."}`,
      data: { reviewId: review.id, restaurantId, rating: Number(rating), clientName: session.user.name },
    });
  }

  return NextResponse.json({ ...review, createdAt: review.createdAt.toISOString(), updatedAt: review.updatedAt.toISOString() }, { status: 201 });
}
