import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

type Props = { params: { id: string } };

export default async function InstructionViewPage({ params }: Props) {
  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  const it = await prisma.instruction.findUnique({ where: { id } });
  if (!it) notFound();

  const isImage = it.fileUrl?.match(/\.(png|jpe?g|gif|webp)$/i);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl space-y-4 bg-white border rounded-xl p-6">
        <h1 className="text-2xl font-bold">{it.title}</h1>

        {it.content ? (
          <div className="prose max-w-none whitespace-pre-wrap">{it.content}</div>
        ) : (
          <p className="text-gray-500">Без описания.</p>
        )}

        {it.fileUrl && (
          <div className="mt-4">
            {isImage ? (
              // простая картинка
              // (в проде лучше <Image>, но для скорости так ок)
              <img src={it.fileUrl} alt="attachment" className="max-w-full rounded border" />
            ) : (
              <a href={it.fileUrl} target="_blank" className="text-blue-600 hover:underline">
                📎 Открыть файл
              </a>
            )}
          </div>
        )}

        <a className="text-blue-600 hover:underline inline-block mt-2" href="/instructions">
          ← Назад к списку
        </a>
      </div>
    </div>
  );
}
