import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "pharmacy-secret-key";

export async function GET() {
  try {
    const cookieStore = await cookies();              // ⬅️
    const token = cookieStore.get("token")?.value;    // ⬅️
    if (!token) return NextResponse.json({ user: null });

    const decoded = jwt.verify(token, SECRET) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, role: true },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
