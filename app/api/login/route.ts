import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "pharmacy-secret-key";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { username: String(username).trim() } });
    if (!user) return NextResponse.json({ error: "Пользователь не найден" }, { status: 401 });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      SECRET,
      { expiresIn: "7d" }
    );

    // ⬇️ ВАЖНО: получаем cookieStore через await
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
      // secure: true, // включи на проде (https)
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[LOGIN]", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
