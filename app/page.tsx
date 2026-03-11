import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Redirigir según el rol del usuario
  if (session.user.role === "EMPRESA") {
    redirect("/empresa/dashboard");
  }

  if (session.user.role === "CLIENTE") {
    redirect("/cliente/dashboard");
  }

  redirect("/login");
}
