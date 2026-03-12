import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FavoritosClient } from "@/components/cliente/favoritos-client";

export default async function FavoritosPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "CLIENTE") redirect("/login");

  const now = new Date();
  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
    include: {
      favorites: {
        select: {
          id: true,
          name: true,
          category: true,
          city: true,
          address: true,
          photos: true,
          priceRange: true,
          averageRating: true,
          _count: { select: { reviews: true } },
          promotions: {
            where: { active: true, validFrom: { lte: now }, validUntil: { gte: now } },
            select: { id: true },
            take: 1,
          },
        },
        orderBy: { name: "asc" },
      },
    },
  });

  const favorites = (client?.favorites ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    city: r.city,
    address: r.address,
    photos: r.photos,
    priceRange: r.priceRange,
    averageRating: r.averageRating,
    reviewCount: r._count.reviews,
    hasActivePromo: r.promotions.length > 0,
  }));

  return <FavoritosClient initialFavorites={favorites} />;
}
