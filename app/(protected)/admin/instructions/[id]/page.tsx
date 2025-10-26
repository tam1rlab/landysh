import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) return {};
  const item = await prisma.instruction.findUnique({ where: { id } });
  return {
    title: item ? `${item.title} — Инструкция` : "Инструкция",
  };
}

function extractFirstUrl(text?: string): string | null {
  if (!text) return null;
  const m = text.match(/https?:\/\/\S+/i);
  return m ? m[0] : null;
}

function getYouTubeEmbed(url: string): string | null {
  // поддержка https://www.youtube.com/watch?v=ID и https://youtu.be/ID
  const y1 = url.match(/youtube\.com\/watch\?v=([^&\s]+)/i);
  const y2 = url.match(/youtu\.be\/([^?\s]+)/i);
  const id = y1?.[1] || y2?.[1];
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

function getVimeoEmbed(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/i);
  return m ? `https://player.vimeo.com/video/${m[1]}` : null;
}

function isImage(url: string) {
  return /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(url);
}
function isPdf(url: string) {
  return /\.pdf$/i.test(url);
}

export default async function InstructionViewPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const item = await prisma.instruction.findUnique({ where: { id } });
  if (!item) notFound();

  const firstUrlInContent = extractFirstUrl(item.content || "");
  const yt = firstUrlInContent ? getYouTubeEmbed(firstUrlInContent) : null;
  const vimeo = firstUrlInContent ? getVimeoEmbed(firstUrlInContent) : null;
  const hasVideo = Boolean(yt || vimeo);

  return (
    <main className="min-h-svh bg-[var(--bg-subtle)]">
      <header className="sticky top-0 z-10 border-b bg-[var(--bg)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-[var(--primary-100)]" />
            <span className="font-bold">Pharmacy Training — Инструкция</span>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <a className="rounded-lg border px-3 py-1 hover:opacity-80" href="/instructions">📚 Список</a>
            <a className="rounded-lg border px-3 py-1 hover:opacity-80" href="/dashboard">🏠 Главная</a>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-8">
        <article className="card p-6 shadow-soft">
          <div className="text-sm opacity-70">
            {new Date(item.createdAt).toLocaleDateString()}
          </div>
          <h1 className="mt-1 text-2xl font-semibold">{item.title}</h1>

          {/* Видео по ссылке из контента */}
          {hasVideo && (
            <div className="mt-6 aspect-video overflow-hidden rounded-xl border">
              <iframe
                src={yt || vimeo || undefined}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Видео"
              />
            </div>
          )}

          {/* Текст инструкции */}
          {item.content && (
            <div className="prose prose-sm mt-6 max-w-none">
              <p style={{ whiteSpace: "pre-wrap" }}>{item.content}</p>
              {firstUrlInContent && !hasVideo && (
                <p className="mt-2">
                  Ссылка:{" "}
                  <a className="text-[var(--primary)] underline" href={firstUrlInContent} target="_blank">
                    {firstUrlInContent}
                  </a>
                </p>
              )}
            </div>
          )}

          {/* Привязанный файл */}
          {item.fileUrl && (
            <div className="mt-6">
              <div className="text-sm opacity-70 mb-2">Прикреплённый файл</div>

              {isImage(item.fileUrl) ? (
                <img
                  src={item.fileUrl}
                  alt="attached"
                  className="max-h-[60vh] w-full rounded-xl border object-contain"
                />
              ) : isPdf(item.fileUrl) ? (
                <object
                  data={item.fileUrl}
                  type="application/pdf"
                  className="h-[70vh] w-full rounded-xl border"
                >
                  <p className="p-4 text-sm">
                    Не удалось отобразить PDF.{" "}
                    <a className="text-[var(--primary)] underline" href={item.fileUrl} target="_blank" rel="noreferrer">
                      Открыть в новой вкладке
                    </a>
                  </p>
                </object>
              ) : (
                <a
                  className="btn inline-flex"
                  href={item.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Скачать файл
                </a>
              )}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
