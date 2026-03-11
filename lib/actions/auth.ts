"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const empresaSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  restaurantName: z.string().min(2),
  category: z.string().min(1),
  city: z.string().min(2),
});

const clienteSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  preferences: z.array(z.string()).min(1),
});

export async function registerEmpresa(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    restaurantName: formData.get("restaurantName") as string,
    category: formData.get("category") as string,
    city: formData.get("city") as string,
  };

  const parsed = empresaSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Datos inválidos. Revisá los campos." };
  }

  const exists = await prisma.user.findUnique({ where: { email: raw.email } });
  if (exists) return { error: "Ya existe una cuenta con ese email." };

  const passwordHash = await bcrypt.hash(raw.password, 10);

  await prisma.user.create({
    data: {
      name: raw.name,
      email: raw.email,
      password: passwordHash,
      role: "EMPRESA",
      restaurant: {
        create: {
          name: raw.restaurantName,
          category: raw.category,
          city: raw.city,
          address: "",
        },
      },
    },
  });

  return { success: true };
}

export async function registerCliente(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    preferences: formData.getAll("preferences") as string[],
  };

  const parsed = clienteSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Datos inválidos. Revisá los campos." };
  }

  const exists = await prisma.user.findUnique({ where: { email: raw.email } });
  if (exists) return { error: "Ya existe una cuenta con ese email." };

  const passwordHash = await bcrypt.hash(raw.password, 10);

  await prisma.user.create({
    data: {
      name: raw.name,
      email: raw.email,
      password: passwordHash,
      role: "CLIENTE",
      client: {
        create: {
          preferences: raw.preferences,
        },
      },
    },
  });

  return { success: true };
}
