import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const username = "testuser";
  const plain = "user123";
  const hashed = await bcrypt.hash(plain, 10);

  // upsert — создаст или обновит, если такой username уже есть
  await prisma.user.upsert({
    where: { username },
    update: {
      password: hashed,
      role: "user",
    },
    create: {
      username,
      password: hashed,
      role: "user",
    },
  });

  console.log("✅ Test user created:", username, "/", plain);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
