import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MenuClient } from "@/components/empresa/menu-client";

export default async function MenuPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPRESA") redirect("/login");

  const restaurant = await prisma.restaurant.findUnique({
    where: { userId: session.user.id },
    include: {
      menuItems: {
        orderBy: [{ category: "asc" }, { order: "asc" }],
      },
    },
  });

  if (!restaurant) redirect("/empresa/dashboard");

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Menú</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {restaurant.menuItems.length === 0
            ? "Todavía no tenés platos — agregá el primero"
            : `${restaurant.menuItems.length} plato${restaurant.menuItems.length !== 1 ? "s" : ""} · arrastrá para reordenar`
          }
        </p>
      </div>
      <MenuClient
        restaurantId={restaurant.id}
        initialItems={restaurant.menuItems}
      />
    </div>
  );
}
