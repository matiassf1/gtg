import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ClienteHeader } from "@/components/cliente/header";

export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "CLIENTE") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <ClienteHeader
        userName={session.user.name ?? "Usuario"}
        userImage={session.user.image}
      />
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
