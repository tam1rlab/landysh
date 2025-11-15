import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { saveUploadedFile } from "@/lib/upload";

// --- настройки загрузки ---
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const ALLOWED_EXT = /\.(pdf|png|jpe?g|webp|gif)$/i;

// CREATE
async function createInstruction(formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const file = formData.get("file") as File | null;

  if (!title) return;

  let fileUrl: string | null = null;

  // загрузка (если есть файл)
  if (file && typeof file === "object" && file.size > 0) {
    if (file.size > MAX_FILE_SIZE) {
      console.warn("Файл слишком большой:", file.name, file.size);
    } else if (!ALLOWED_EXT.test(file.name)) {
      console.warn("Недопустимый тип файла:", file.name);
    } else {
      fileUrl = await saveUploadedFile(file);
    }
  }

  await prisma.instruction.create({
    data: {
      title,
      content,
      ...(fileUrl ? { fileUrl } : {}),
    },
  });

  revalidatePath("/admin");
  revalidatePath("/instructions");
}

// DELETE
async function deleteInstruction(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;

  await prisma.instruction.delete({ where: { id } });

  revalidatePath("/admin");
  revalidatePath("/instructions");
}

export default async function AdminPage() {
  const items = await prisma.instruction.findMany({
    orderBy: { id: "desc" },
  });

  return (
    <main className="min-h-svh bg-[var(--bg-subtle)]">
      {/* Шапка / брендинг */}
      <header className="sticky top-0 z-10 border-b bg-[var(--bg)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-[var(--primary-100)]" />
            <span className="font-bold">Pharmacy Training — Админ</span>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <Link className="rounded-lg border px-3 py-1 hover:opacity-80" href="/admin/users">
              👤 Пользователи
            </Link>
            <Link className="rounded-lg border px-3 py-1 hover:opacity-80" href="/instructions">
              📚 Инструкции
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8">
        {/* Форма создания */}
        <div className="card p-6 shadow-soft">
          <h1 className="text-xl font-semibold">Добавить инструкцию</h1>
          <p className="mt-1 text-sm opacity-70">
            Поддерживаются PDF и изображения. Размер до 20&nbsp;MB.
          </p>

          <form
            action={createInstruction}
            className="mt-5 grid grid-cols-1 gap-4"
            encType="multipart/form-data"
          >
            <div>
              <label className="mb-1 block text-sm">Заголовок</label>
              <input
                name="title"
                className="input w-full"
                placeholder="Например: Приём товара по накладной"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm">Содержимое</label>
              <textarea
                name="content"
                className="input w-full h-40"
                placeholder="Шаги, примечания…"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm">Файл (PDF/изображение)</label>
              <input
                name="file"
                type="file"
                className="block w-full text-sm"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.gif"
              />
              <p className="mt-1 text-xs opacity-70">
                Допустимые: PDF, PNG, JPG, WebP, GIF. До 20&nbsp;MB.
              </p>
            </div>

            <div className="pt-2">
              <button className="btn">Добавить</button>
            </div>
          </form>
        </div>

        {/* Список инструкций */}
        <div className="mt-8 card p-6 shadow-soft">
          <h2 className="text-lg font-semibold">Инструкции</h2>

          {items.length === 0 ? (
            <p className="mt-3 text-sm opacity-70">Пока пусто.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {items.map((it) => (
                <li
                  key={it.id}
                  className="rounded-2xl border p-4 flex items-start justify-between gap-4"
                  style={{ borderColor: "var(--border)", background: "var(--card)" }}
                >
                  <div className="min-w-0">
                    <Link className="font-medium hover:underline break-words" href={`/instructions/${it.id}`}>
                      {it.title}
                    </Link>

                    {it.content ? (
                      <p className="mt-1 text-sm opacity-80 break-words">
                        {it.content}
                      </p>
                    ) : null}

                    {it.fileUrl ? (
                      <div className="mt-2">
                        <a
                          className="text-sm text-[var(--primary)] hover:underline"
                          href={it.fileUrl}
                          target="_blank"
                        >
                          📎 Файл
                        </a>
                      </div>
                    ) : null}

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                      <Link
                        className="rounded-lg border px-3 py-1 hover:opacity-80"
                        href={`/admin/instructions/${it.id}/edit`}
                      >
                        ✏️ Редактировать
                      </Link>
                    </div>
                  </div>

                  <form action={deleteInstruction} className="shrink-0">
                    <input type="hidden" name="id" value={it.id} />
                    <button className="rounded-lg border px-3 py-1 text-red-600 hover:bg-red-50">
                      🗑 Удалить
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
