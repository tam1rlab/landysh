import { prisma } from "@/lib/prisma";

export default async function InstructionsListPage() {
  const items = await prisma.instruction.findMany({
    orderBy: { id: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold">Инструкции</h1>

        {items.length === 0 ? (
          <p className="text-gray-500">Пока нет материалов.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((it) => (
              <li key={it.id} className="bg-white border rounded-xl p-3">
                <a className="font-medium hover:underline" href={`/instructions/${it.id}`}>
                  {it.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
