import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function EmpresaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "EMPRESA") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
