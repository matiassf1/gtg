import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ResenasClient } from "@/components/empresa/resenas-client";

export default async function ResenasPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPRESA") redirect("/login");

  const restaurant = await prisma.restaurant.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!restaurant) redirect("/empresa/dashboard");

  const reviews = await prisma.review.findMany({
    where: { restaurantId: restaurant.id },
    include: {
      client: {
        include: {
          user: { select: { name: true, email: true, image: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = reviews.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return <ResenasClient initialReviews={serialized} />;
}
