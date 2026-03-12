import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/empresa/sidebar";
import { Header } from "@/components/empresa/header";

export default async function EmpresaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "EMPRESA") {
    redirect("/login");
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { userId: session.user.id },
    select: { name: true },
  });

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header
          restaurantName={restaurant?.name ?? "Mi Restaurante"}
          userName={session.user.name ?? "Usuario"}
          userImage={session.user.image}
        />
        {/* pb-14 on mobile reserves space above the fixed bottom nav */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
