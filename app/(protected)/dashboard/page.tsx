"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Role = "admin" | "user";
type User = {
  id: number;
  username: string;
  role: Role;
};
type MeResponse = { user: User | null };

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) {
          window.location.href = "/login";
          return;
        }
        const data: MeResponse = await res.json();
        setUser(data.user);
        if (!data.user) window.location.href = "/login";
      } catch {
        window.location.href = "/login";
      }
    })();
  }, []);

  if (!user) return null;

  // Локализация роли без изменения бизнес-логики
  const roleLabel = user.role === "admin" ? "администратор" : "фармацевт";

  return (
    <main className="min-h-svh bg-[var(--bg-subtle)]">
      {/* Шапка (визуальный блок, логика не меняется) */}
      <header className="sticky top-0 z-10 border-b bg-[var(--bg)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-[var(--primary-100)]" />
            <span className="font-bold">Landysh Practice</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="rounded-lg border px-2 py-1">{user.username}</span>
            <span className="rounded-lg border px-2 py-1">{roleLabel}</span>
            <button
              onClick={async () => {
                await fetch("/api/logout", { method: "POST" });
                window.location.href = "/login";
              }}
              className="btn px-3 py-1 text-sm"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      {/* Контент */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="card p-6 shadow-soft space-y-2">
          <h1 className="text-2xl font-bold">
            Привет, <span className="text-[var(--primary)]">{user.username}</span> 👋
          </h1>
          <p className="text-[15px] opacity-80">
            Ваша роль: <b>{roleLabel}</b>
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Link
            className="card p-5 shadow-soft hover:shadow-md transition"
            href="/instructions"
          >
            <h3 className="text-lg font-semibold">Инструкции</h3>
            <p className="mt-1 text-sm opacity-75">
              Просматривайте и скачивайте материалы.
            </p>
            <div className="mt-4">
              <span className="btn">Открыть</span>
            </div>
          </Link>

          {/* Только для админа — логику не меняем, только стиль */}
          {user.role === "admin" && (
            <Link
              className="card p-5 shadow-soft hover:shadow-md transition"
              href="/admin"
            >
              <h3 className="text-lg font-semibold">Админ-панель</h3>
              <p className="mt-1 text-sm opacity-75">
                Управляйте пользователями и инструкциями.
              </p>
              <div className="mt-4">
                <span className="btn">Перейти</span>
              </div>
            </Link>
          )}

          <div className="card p-5 shadow-soft">
            <h3 className="text-lg font-semibold">Профиль</h3>
            <p className="mt-1 text-sm opacity-75">Данные и безопасность.</p>
            <div className="mt-4">
              <span className="btn">Открыть</span>
            </div>
          </div>
        </div>

        {/* Инфо-блок (статический, без изменения логики) */}
        <div className="mt-8 card p-6 shadow-soft">
          <h2 className="text-xl font-semibold">Последние обновления</h2>
          <p className="mt-2 text-sm opacity-70">
            Здесь будут отображаться новые инструкции и изменения.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border p-4">
              <div className="text-sm opacity-70">Сегодня</div>
              <div className="mt-1 font-medium">Обновление интерфейса</div>
              <div className="text-sm opacity-70">Тема Big Pharma активна.</div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="text-sm opacity-70">Недавно</div>
              <div className="mt-1 font-medium">
                Добавлены инструкции по приёму поставок
              </div>
              <div className="text-sm opacity-70">Склад → Приёмка</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
