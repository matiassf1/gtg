import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPRESA") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { userId: session.user.id },
  });

  if (!restaurant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: { active: false },
  });

  return NextResponse.json({ ok: true });
}
