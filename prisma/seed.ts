import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // ─── Limpiar tablas en orden por dependencias ───────────────────────────
  await prisma.client.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // ─── Usuarios empresa (restaurantes) ───────────────────────────────────
  const empresaUser1 = await prisma.user.create({
    data: {
      name: "El Asador de Malasaña",
      email: "asador@gtg.com",
      password: passwordHash,
      role: Role.EMPRESA,
      restaurant: {
        create: {
          name: "El Asador de Malasaña",
          description: "Especialistas en carnes a la brasa y cocina castellana con más de 20 años de experiencia. Ambiente familiar y acogedor en pleno corazón de Malasaña.",
          category: "Asador",
          address: "Calle Fuencarral 42, 28004 Madrid",
          city: "Madrid",
          phone: "+34 912 345 678",
          photos: [
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
            "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
          ],
          latitude: 40.4233,
          longitude: -3.7027,
          openingHours: {
            lunes:    { abre: "13:00", cierra: "16:00" },
            martes:   { abre: "13:00", cierra: "16:00" },
            miercoles:{ abre: "13:00", cierra: "16:00" },
            jueves:   { abre: "13:00", cierra: "23:30" },
            viernes:  { abre: "13:00", cierra: "00:00" },
            sabado:   { abre: "12:00", cierra: "00:00" },
            domingo:  { abre: "12:00", cierra: "17:00" },
          },
          capacity: 80,
          averageRating: 4.5,
          plan: "STANDARD",
        },
      },
    },
    include: { restaurant: true },
  });

  const empresaUser2 = await prisma.user.create({
    data: {
      name: "Sushi Nishiki",
      email: "nishiki@gtg.com",
      password: passwordHash,
      role: Role.EMPRESA,
      restaurant: {
        create: {
          name: "Sushi Nishiki",
          description: "Auténtica cocina japonesa en pleno barrio de Salamanca. Niguiris artesanales y sashimi de primera calidad todos los días.",
          category: "Japonesa",
          address: "Calle Goya 71, 28001 Madrid",
          city: "Madrid",
          phone: "+34 914 567 890",
          photos: [
            "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800",
            "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800",
          ],
          latitude: 40.4266,
          longitude: -3.6817,
          openingHours: {
            lunes:    { cerrado: true },
            martes:   { abre: "13:30", cierra: "23:30" },
            miercoles:{ abre: "13:30", cierra: "23:30" },
            jueves:   { abre: "13:30", cierra: "23:30" },
            viernes:  { abre: "13:30", cierra: "00:00" },
            sabado:   { abre: "13:00", cierra: "00:00" },
            domingo:  { abre: "13:00", cierra: "22:00" },
          },
          capacity: 45,
          averageRating: 4.8,
          plan: "STANDARD",
        },
      },
    },
    include: { restaurant: true },
  });

  // ─── Usuarios cliente ───────────────────────────────────────────────────
  const clienteUser1 = await prisma.user.create({
    data: {
      name: "Carlos García",
      email: "carlos@gtg.com",
      password: passwordHash,
      role: Role.CLIENTE,
      client: {
        create: {
          preferences: ["Asador", "Italiana", "Hamburguesería"],
          favorites: {
            connect: [{ id: empresaUser1.restaurant!.id }],
          },
        },
      },
    },
  });

  const clienteUser2 = await prisma.user.create({
    data: {
      name: "María López",
      email: "maria@gtg.com",
      password: passwordHash,
      role: Role.CLIENTE,
      client: {
        create: {
          preferences: ["Japonesa", "Vegetariana", "Cocina de autor"],
          favorites: {
            connect: [
              { id: empresaUser1.restaurant!.id },
              { id: empresaUser2.restaurant!.id },
            ],
          },
        },
      },
    },
  });

  console.log("✅ Seed completado:");
  console.log(`   🥩 Restaurante: ${empresaUser1.restaurant?.name} (${empresaUser1.email})`);
  console.log(`   🍣 Restaurante: ${empresaUser2.restaurant?.name} (${empresaUser2.email})`);
  console.log(`   👤 Cliente: ${clienteUser1.name} (${clienteUser1.email})`);
  console.log(`   👤 Cliente: ${clienteUser2.name} (${clienteUser2.email})`);
  console.log("");
  console.log("   Contraseña de todos: password123");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
