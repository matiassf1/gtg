import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExplorarClient } from "@/components/cliente/explorar-client";

export default async function ExplorarPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "CLIENTE") redirect("/login");

  const now = new Date();

  const restaurants = await prisma.restaurant.findMany({
    select: {
      id:            true,
      name:          true,
      category:      true,
      city:          true,
      address:       true,
      photos:        true,
      priceRange:    true,
      averageRating: true,
      promotions: {
        where: {
          active:    true,
          validFrom: { lte: now },
          validUntil:{ gte: now },
        },
        select: { id: true },
      },
      _count: { select: { reviews: true } },
    },
    orderBy: { averageRating: "desc" },
  });

  const data = restaurants.map((r) => ({
    id:            r.id,
    name:          r.name,
    category:      r.category,
    city:          r.city,
    address:       r.address,
    photos:        r.photos,
    priceRange:    r.priceRange,
    averageRating: r.averageRating,
    reviewCount:   r._count.reviews,
    hasActivePromo: r.promotions.length > 0,
  }));

  return (
    <ExplorarClient
      restaurants={data}
      initialSearch={searchParams.q ?? ""}
    />
  );
}
