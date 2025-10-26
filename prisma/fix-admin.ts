import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const username = "admin";      // логин админа
  const plain = "1234";          // пароль админа (можно поменять)
  const hashed = await bcrypt.hash(plain, 10);

  // Создаст админа, либо обновит, если уже есть такой username
  await prisma.user.upsert({
    where: { username },
    update: {
      password: hashed,
      role: "admin",
    },
    create: {
      username,
      password: hashed,
      role: "admin",
    },
  });

  console.log(`✅ Admin ensured: ${username} / ${plain}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
