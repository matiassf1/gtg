import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "CLIENTE") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
    include: { favorites: { select: { id: true } } },
  });
  if (!client) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const { restaurantId } = await req.json();
  if (!restaurantId) return NextResponse.json({ error: "restaurantId requerido" }, { status: 400 });

  const alreadyFavorited = client.favorites.some((f) => f.id === restaurantId);

  await prisma.client.update({
    where: { id: client.id },
    data: {
      favorites: alreadyFavorited
        ? { disconnect: { id: restaurantId } }
        : { connect:    { id: restaurantId } },
    },
  });

  return NextResponse.json({ favorited: !alreadyFavorited });
}
