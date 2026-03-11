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
      name: "La Parrilla del Norte",
      email: "parrilla@gtg.com",
      password: passwordHash,
      role: Role.EMPRESA,
      restaurant: {
        create: {
          name: "La Parrilla del Norte",
          description: "Especialistas en carnes a la parrilla con mas de 20 años de experiencia. Ambiente familiar y acogedor.",
          category: "Parrilla",
          address: "Av. Corrientes 1234",
          city: "Buenos Aires",
          phone: "+54 11 4567-8901",
          photos: [
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
            "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
          ],
          latitude: -34.6037,
          longitude: -58.3816,
          openingHours: {
            lunes:    { abre: "12:00", cierra: "23:00" },
            martes:   { abre: "12:00", cierra: "23:00" },
            miercoles:{ abre: "12:00", cierra: "23:00" },
            jueves:   { abre: "12:00", cierra: "23:00" },
            viernes:  { abre: "12:00", cierra: "00:00" },
            sabado:   { abre: "11:00", cierra: "00:00" },
            domingo:  { abre: "11:00", cierra: "22:00" },
          },
          capacity: 80,
          averageRating: 4.5,
        },
      },
    },
    include: { restaurant: true },
  });

  const empresaUser2 = await prisma.user.create({
    data: {
      name: "Sushi Zen",
      email: "sushizen@gtg.com",
      password: passwordHash,
      role: Role.EMPRESA,
      restaurant: {
        create: {
          name: "Sushi Zen",
          description: "Autentica cocina japonesa en el corazon de Palermo. Rolls artesanales y sashimi fresco todos los dias.",
          category: "Japonesa",
          address: "Thames 2050",
          city: "Buenos Aires",
          phone: "+54 11 4832-1122",
          photos: [
            "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800",
            "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800",
          ],
          latitude: -34.5849,
          longitude: -58.4329,
          openingHours: {
            lunes:    { cerrado: true },
            martes:   { abre: "13:00", cierra: "23:00" },
            miercoles:{ abre: "13:00", cierra: "23:00" },
            jueves:   { abre: "13:00", cierra: "23:00" },
            viernes:  { abre: "13:00", cierra: "00:00" },
            sabado:   { abre: "12:00", cierra: "00:00" },
            domingo:  { abre: "12:00", cierra: "22:00" },
          },
          capacity: 45,
          averageRating: 4.8,
        },
      },
    },
    include: { restaurant: true },
  });

  // ─── Usuarios cliente ───────────────────────────────────────────────────
  const clienteUser1 = await prisma.user.create({
    data: {
      name: "Juan Perez",
      email: "juan@gtg.com",
      password: passwordHash,
      role: Role.CLIENTE,
      client: {
        create: {
          preferences: ["Parrilla", "Italiana", "Hamburguesas"],
          favorites: {
            connect: [{ id: empresaUser1.restaurant!.id }],
          },
        },
      },
    },
  });

  const clienteUser2 = await prisma.user.create({
    data: {
      name: "Maria Garcia",
      email: "maria@gtg.com",
      password: passwordHash,
      role: Role.CLIENTE,
      client: {
        create: {
          preferences: ["Japonesa", "Vegana", "Sushi"],
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
  console.log(`   🍖 Restaurante: ${empresaUser1.restaurant?.name} (${empresaUser1.email})`);
  console.log(`   🍣 Restaurante: ${empresaUser2.restaurant?.name} (${empresaUser2.email})`);
  console.log(`   👤 Cliente: ${clienteUser1.name} (${clienteUser1.email})`);
  console.log(`   👤 Cliente: ${clienteUser2.name} (${clienteUser2.email})`);
  console.log("");
  console.log("   Password de todos: password123");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
