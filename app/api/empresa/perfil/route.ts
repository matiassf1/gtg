import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPRESA") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { userId: session.user.id },
  });

  if (!restaurant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(restaurant);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPRESA") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { userId: session.user.id },
  });

  if (!restaurant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const formData = await req.formData();

  const name        = formData.get("name") as string;
  const description = formData.get("description") as string;
  const category    = formData.get("category") as string;
  const phone       = formData.get("phone") as string;
  const address     = formData.get("address") as string;
  const city        = formData.get("city") as string;
  const hoursRaw    = formData.get("openingHours") as string;
  const existing    = formData.getAll("existingPhotos") as string[];
  const files       = formData.getAll("photos") as File[];

  let openingHours = {};
  try { openingHours = JSON.parse(hoursRaw); } catch { /* invalid json → keep empty */ }

  // Persist new photo files to public/uploads
  const uploadDir = path.join(
    process.cwd(), "public", "uploads", "restaurants", restaurant.id
  );
  await mkdir(uploadDir, { recursive: true });

  const newPaths: string[] = [];
  for (const file of files) {
    if (!file || file.size === 0) continue;
    const bytes = await file.arrayBuffer();
    const ext   = (file.name.split(".").pop() ?? "jpg").toLowerCase();
    const name_ = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    await writeFile(path.join(uploadDir, name_), Buffer.from(bytes));
    newPaths.push(`/uploads/restaurants/${restaurant.id}/${name_}`);
  }

  const photos = [...existing, ...newPaths].slice(0, 8);

  const updated = await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: { name, description, category, phone, address, city, openingHours, photos },
  });

  return NextResponse.json(updated);
}
