import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PerfilForm } from "@/components/empresa/perfil-form";

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPRESA") redirect("/login");

  const restaurant = await prisma.restaurant.findUnique({
    where: { userId: session.user.id },
  });

  if (!restaurant) redirect("/empresa/dashboard");

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Mi Perfil</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Actualizá la información pública de tu restaurante
        </p>
      </div>
      <PerfilForm restaurant={restaurant} />
    </div>
  );
}
