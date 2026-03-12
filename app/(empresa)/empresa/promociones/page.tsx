import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PromocionesClient } from "@/components/empresa/promociones-client";

export default async function PromocionesPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPRESA") redirect("/login");

  const restaurant = await prisma.restaurant.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!restaurant) redirect("/empresa/dashboard");

  const promotions = await prisma.promotion.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { validFrom: "desc" },
  });

  const serialized = promotions.map((p) => ({
    ...p,
    validFrom: p.validFrom.toISOString(),
    validUntil: p.validUntil.toISOString(),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return <PromocionesClient initialPromos={serialized} />;
}
