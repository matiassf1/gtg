import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

async function getRestaurantForUser(userId: string) {
  return prisma.restaurant.findUnique({ where: { userId } });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPRESA") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const restaurant = await getRestaurantForUser(session.user.id);
  if (!restaurant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const items = await prisma.menuItem.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPRESA") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const restaurant = await getRestaurantForUser(session.user.id);
  if (!restaurant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const fd = await req.formData();
  const name        = fd.get("name") as string;
  const description = fd.get("description") as string;
  const price       = parseFloat(fd.get("price") as string);
  const category    = fd.get("category") as string;
  const available   = fd.get("available") === "true";
  const order       = parseInt(fd.get("order") as string) || 0;
  const imageFile   = fd.get("image") as File | null;

  let imagePath: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "menu", restaurant.id);
    await mkdir(uploadDir, { recursive: true });
    const ext      = (imageFile.name.split(".").pop() ?? "jpg").toLowerCase();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    await writeFile(path.join(uploadDir, filename), Buffer.from(await imageFile.arrayBuffer()));
    imagePath = `/uploads/menu/${restaurant.id}/${filename}`;
  }

  const item = await prisma.menuItem.create({
    data: {
      restaurantId: restaurant.id,
      name,
      description: description || null,
      price,
      category,
      available,
      order,
      image: imagePath,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
