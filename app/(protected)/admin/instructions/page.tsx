import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Инструкции — Pharmacy Training",
};

export default async function InstructionsListPage() {
  const items = await prisma.instruction.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-svh bg-[var(--bg-subtle)]">
      <header className="sticky top-0 z-10 border-b bg-[var(--bg)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-[var(--primary-100)]" />
            <span className="font-bold">Pharmacy Training — Инструкции</span>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <a className="rounded-lg border px-3 py-1 hover:opacity-80" href="/dashboard">🏠 Главная</a>
            <a className="rounded-lg border px-3 py-1 hover:opacity-80" href="/admin">🛠 Админ</a>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-semibold">Инструкции</h1>

        {items.length === 0 ? (
          <p className="mt-4 opacity-70">Пока нет материалов.</p>
        ) : (
          <ul className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {items.map((it) => (
              <li key={it.id} className="card p-5 shadow-soft hover:shadow-md transition">
                <a className="block" href={`/instructions/${it.id}`}>
                  <div className="text-sm opacity-70">
                    {new Date(it.createdAt).toLocaleDateString()}
                  </div>
                  <h3 className="mt-1 text-lg font-semibold">{it.title}</h3>
                  {it.content ? (
                    <p className="mt-2 text-sm opacity-80 line-clamp-3">
                      {it.content}
                    </p>
                  ) : null}
                  <div className="mt-4">
                    <span className="btn">Открыть</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
