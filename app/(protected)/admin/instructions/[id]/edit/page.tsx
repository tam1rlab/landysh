import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

type Props = { params: { id: string } };

async function updateInstruction(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();
  if (!Number.isFinite(id) || !title) return;

  await prisma.instruction.update({
    where: { id },
    data: { title, content },
  });

  revalidatePath(`/instructions/${id}`);
  revalidatePath(`/admin`);
  redirect(`/instructions/${id}`);
}

export default async function EditInstructionPage({ params }: Props) {
  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  const it = await prisma.instruction.findUnique({ where: { id } });
  if (!it) notFound();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl space-y-6 bg-white border rounded-xl p-6">
        <h1 className="text-2xl font-bold">Редактировать инструкцию</h1>
        <form action={updateInstruction} className="space-y-3">
          <input type="hidden" name="id" value={it.id} />
          <div className="space-y-1">
            <label className="text-sm font-medium">Заголовок</label>
            <input name="title" defaultValue={it.title} className="w-full border rounded-md p-2" required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Содержимое</label>
            <textarea name="content" defaultValue={it.content ?? ""} className="w-full border rounded-md p-2 h-48" />
          </div>
          <div className="flex gap-2">
            <button className="rounded-md bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">
              Сохранить
            </button>
            <a href="/admin" className="px-4 py-2 rounded-md border">Отмена</a>
          </div>
        </form>
      </div>
    </div>
  );
}
