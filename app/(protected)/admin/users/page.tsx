import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

type Role = "admin" | "user";

/** CREATE */
async function createUser(formData: FormData) {
  "use server";
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = (String(formData.get("role") ?? "user") as Role);

  if (!username || !password) return;

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { username, password: hashed, role },
  });

  revalidatePath("/admin/users");
}

/** DELETE */
async function deleteUser(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
}

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { id: "asc" },
    select: { id: true, username: true, role: true },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <h1 className="text-2xl font-bold">Пользователи</h1>

        {/* Добавление */}
        <form action={createUser} className="bg-white p-4 rounded-xl border space-y-3">
          <h2 className="text-lg font-semibold">Добавить пользователя</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              name="username"
              placeholder="Логин"
              className="border rounded-md p-2"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Пароль"
              className="border rounded-md p-2"
              required
            />
            <select name="role" className="border rounded-md p-2" defaultValue="user">
              <option value="фармацевт">user</option>
              <option value="admin">admin</option>
            </select>
          </div>

          <button className="rounded-md bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">
            Добавить
          </button>
        </form>

        {/* Список */}
        <div className="bg-white p-4 rounded-xl border">
          <h2 className="text-lg font-semibold mb-3">Список пользователей</h2>

          {users.length === 0 ? (
            <p className="text-gray-500">Пока пусто.</p>
          ) : (
            <ul className="space-y-2">
              {users.map((u) => (
                <li key={u.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <div className="font-medium">{u.username}</div>
                    <div className="text-sm text-gray-600">роль: {u.role}</div>
                  </div>
                  <div className="flex gap-3">
                    <a
                      className="text-blue-600 hover:underline text-sm"
                      href={`/admin/users/${u.id}/edit`}
                    >
                      ✏️ Редактировать
                    </a>
                    <form action={deleteUser}>
                      <input type="hidden" name="id" value={u.id} />
                      <button className="text-red-600 hover:underline text-sm">
                        🗑 Удалить
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <a className="inline-block text-sm text-blue-600 hover:underline" href="/admin">
          ← Назад в админ-панель
        </a>
      </div>
    </div>
  );
}
