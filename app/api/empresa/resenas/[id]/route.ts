import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  if (!restaurant) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const review = await prisma.review.findUnique({
    where: { id: params.id },
    select: { restaurantId: true },
  });
  if (!review || review.restaurantId !== restaurant.id) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const { response } = await req.json();
  if (typeof response !== "string" || !response.trim()) {
    return NextResponse.json({ error: "Respuesta inválida" }, { status: 400 });
  }

  const updated = await prisma.review.update({
    where: { id: params.id },
    data: { response: response.trim() },
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
