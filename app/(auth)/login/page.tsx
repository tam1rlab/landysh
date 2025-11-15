"use client";

import { useEffect, useState } from "react";

type Role = "admin" | "user";
type User = {
  id: number;
  username: string;
  role: Role;
};

type MeResponse = { user: User | null };
type LoginResponse = { success?: boolean; error?: string };

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Если уже залогинен — сразу в /dashboard
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (res.ok) {
          const data: MeResponse = await res.json();
          if (data?.user) {
            window.location.href = "/dashboard";
          }
        }
      } catch {}
    })();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ username, password }),
      });

      const data: LoginResponse = await res
        .json()
        .catch(() => ({ success: false }));
      if (!res.ok) {
        setError(data.error || "Ошибка входа");
        setLoading(false);
        return;
      }

      // Идём сразу на /dashboard
      window.location.href = "/dashboard";
    } catch {
      setError("Сетевая ошибка");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-svh flex items-center justify-center bg-[var(--bg-subtle)] p-6">
      <form
        onSubmit={handleLogin}
        className="card w-full max-w-sm p-6 shadow-soft space-y-4"
      >
        <h1 className="text-2xl font-extrabold text-center">
          <span className="text-[var(--primary)]">Landysh</span> Practice
        </h1>
        <p className="text-center text-sm opacity-70">
          Вход в систему
        </p>

        <input
          type="text"
          placeholder="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input w-full"
          autoComplete="username"
          required
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input w-full"
          autoComplete="current-password"
          required
        />

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 text-center">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn w-full disabled:opacity-50"
        >
          {loading ? "Входим..." : "Войти"}
        </button>

        <div className="pt-2 text-center text-xs opacity-60">
          <strong>ТОО CES Trade</strong>
        </div>
      </form>
    </div>
  );
}
