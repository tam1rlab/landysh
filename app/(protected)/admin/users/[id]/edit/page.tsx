import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

type Props = { params: { id: string } };
type Role = "admin" | "user";

/** UPDATE */
async function updateUser(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const username = String(formData.get("username") ?? "").trim();
  const role = (String(formData.get("role") ?? "user") as Role);
  const newPassword = String(formData.get("password") ?? "");

  if (!Number.isFinite(id) || !username) return;

  const updateData: { username: string; role: Role; password?: string } = {
    username,
    role,
  };
  if (newPassword) {
    updateData.password = await bcrypt.hash(newPassword, 10);
  }

  await prisma.user.update({ where: { id }, data: updateData });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export default async function EditUserPage({ params }: Props) {
  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, username: true, role: true },
  });
  if (!user) notFound();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-xl space-y-6 bg-white border rounded-xl p-6">
        <h1 className="text-2xl font-bold">Редактировать пользователя</h1>

        <form action={updateUser} className="space-y-3">
          <input type="hidden" name="id" value={user.id} />

          <div className="space-y-1">
            <label className="text-sm font-medium">Логин</label>
            <input
              name="username"
              defaultValue={user.username}
              className="w-full border rounded-md p-2"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Роль</label>
            <select name="role" defaultValue={user.role} className="w-full border rounded-md p-2">
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Новый пароль (необязательно)</label>
            <input
              name="password"
              type="password"
              placeholder="Оставь пустым — чтобы не менять"
              className="w-full border rounded-md p-2"
            />
          </div>

          <div className="flex gap-2">
            <button className="rounded-md bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">
              Сохранить
            </button>
            <Link href="/admin/users" className="px-4 py-2 rounded-md border">
              Отмена
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
