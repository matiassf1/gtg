import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BeneficiosClient } from "@/components/cliente/beneficios-client";

export default async function BeneficiosPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "CLIENTE") redirect("/login");

  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const benefits = client
    ? await prisma.benefit.findMany({
        where: { clientId: client.id },
        include: {
          promotion: {
            include: {
              restaurant: { select: { id: true, name: true, photos: true, category: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  // Serialize dates
  const data = benefits.map((b) => ({
    ...b,
    redeemedAt: b.redeemedAt?.toISOString() ?? null,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    promotion: {
      ...b.promotion,
      validFrom: b.promotion.validFrom.toISOString(),
      validUntil: b.promotion.validUntil.toISOString(),
      createdAt: b.promotion.createdAt.toISOString(),
      updatedAt: b.promotion.updatedAt.toISOString(),
    },
  }));

  return <BeneficiosClient initialBenefits={data} />;
}
