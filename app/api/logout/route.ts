import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();           // ⬅️
  cookieStore.set("token", "", {                 // удаляем
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });
  return NextResponse.json({ success: true });
}
