import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

async function verifyOwnership(userId: string, itemId: string) {
  const restaurant = await prisma.restaurant.findUnique({ where: { userId } });
  if (!restaurant) return null;
  const item = await prisma.menuItem.findFirst({
    where: { id: itemId, restaurantId: restaurant.id },
  });
  return item ? { restaurant, item } : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPRESA") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ownership = await verifyOwnership(session.user.id, params.id);
  if (!ownership) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { restaurant, item } = ownership;
  const contentType = req.headers.get("content-type") ?? "";

  // JSON body → quick partial update (e.g. toggle available)
  if (contentType.includes("application/json")) {
    const body = await req.json();
    const updated = await prisma.menuItem.update({
      where: { id: item.id },
      data: body,
    });
    return NextResponse.json(updated);
  }

  // FormData → full update with optional new image
  const fd = await req.formData();
  const name        = fd.get("name") as string;
  const description = fd.get("description") as string;
  const price       = parseFloat(fd.get("price") as string);
  const category    = fd.get("category") as string;
  const available   = fd.get("available") === "true";
  const keepImage   = fd.get("keepImage") === "true";
  const imageFile   = fd.get("image") as File | null;

  let imagePath: string | null = keepImage ? item.image : null;

  if (imageFile && imageFile.size > 0) {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "menu", restaurant.id);
    await mkdir(uploadDir, { recursive: true });
    const ext      = (imageFile.name.split(".").pop() ?? "jpg").toLowerCase();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    await writeFile(path.join(uploadDir, filename), Buffer.from(await imageFile.arrayBuffer()));
    imagePath = `/uploads/menu/${restaurant.id}/${filename}`;
  }

  const updated = await prisma.menuItem.update({
    where: { id: item.id },
    data: {
      name,
      description: description || null,
      price,
      category,
      available,
      image: imagePath,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPRESA") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ownership = await verifyOwnership(session.user.id, params.id);
  if (!ownership) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.menuItem.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
