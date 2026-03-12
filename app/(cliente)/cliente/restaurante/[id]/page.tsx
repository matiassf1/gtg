import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RestauranteDetail } from "@/components/cliente/restaurante-detail";

export default async function RestaurantePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "CLIENTE") redirect("/login");

  const now = new Date();

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: params.id },
    include: {
      menuItems: { orderBy: [{ category: "asc" }, { order: "asc" }] },
      reviews: {
        include: {
          client: {
            include: { user: { select: { name: true, email: true, image: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      promotions: {
        where: { active: true, validFrom: { lte: now }, validUntil: { gte: now } },
        select: { id: true, title: true, type: true, discountPercent: true, validUntil: true },
      },
    },
  });

  if (!restaurant) notFound();

  // Check if the current user has favorited and reviewed this restaurant
  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
    include: { favorites: { where: { id: params.id }, select: { id: true } } },
  });

  const isFavorited = (client?.favorites.length ?? 0) > 0;

  const hasReviewed = client
    ? (await prisma.review.count({
        where: { restaurantId: params.id, clientId: client.id },
      })) > 0
    : false;

  // Serialize dates
  const data = {
    ...restaurant,
    menuItems: restaurant.menuItems,
    reviews: restaurant.reviews.map((r) => ({
      ...r,
      createdAt:  r.createdAt.toISOString(),
      updatedAt:  r.updatedAt.toISOString(),
    })),
    activePromos: restaurant.promotions.map((p) => ({
      ...p,
      validUntil: p.validUntil.toISOString(),
    })),
  };

  return (
    <RestauranteDetail
      restaurant={data}
      isFavorited={isFavorited}
      hasReviewed={hasReviewed}
      isLoggedIn={!!client}
    />
  );
}
