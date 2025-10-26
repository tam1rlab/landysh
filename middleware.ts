import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// защищаем только страницы (не /api, /_next, /public)
export const config = {
  matcher: ["/((?!api|_next|public|favicon.ico).*)"],
};

const SECRET_STRING = process.env.JWT_SECRET || "pharmacy-secret-key";
const SECRET = new TextEncoder().encode(SECRET_STRING);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Публичные маршруты
  if (pathname === "/login") return NextResponse.next();

  const token = req.cookies.get("token")?.value;

  // Нет токена → на /login
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  try {
    // ВАЖНО: проверяем JWT через jose (Edge-friendly)
    const { payload } = await jwtVerify(token, SECRET);

    // Проверка роли на /admin
    if (pathname.startsWith("/admin") && payload.role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch {
    // Невалидный/просроченный токен → на /login
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
}
