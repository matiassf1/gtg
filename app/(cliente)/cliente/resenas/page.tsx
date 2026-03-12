import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MisResenasClient } from "@/components/cliente/mis-resenas-client";

export default async function MisResenasPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "CLIENTE") redirect("/login");

  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const reviews = client
    ? await prisma.review.findMany({
        where: { clientId: client.id },
        include: {
          restaurant: { select: { id: true, name: true, photos: true, category: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const data = reviews.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return <MisResenasClient initialReviews={data} />;
}
