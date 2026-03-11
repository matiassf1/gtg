import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPRESA") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { userId: session.user.id },
  });
  if (!restaurant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { items } = (await req.json()) as { items: { id: string; order: number }[] };

  await Promise.all(
    items.map(({ id, order }) =>
      prisma.menuItem.updateMany({
        where: { id, restaurantId: restaurant.id },
        data: { order },
      })
    )
  );

  return NextResponse.json({ success: true });
}
