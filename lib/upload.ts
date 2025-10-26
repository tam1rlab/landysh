import fs from "fs";
import path from "path";
import { writeFile, mkdir } from "fs/promises";

export async function saveUploadedFile(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  // уникальное имя: timestamp + оригинальное
  const safeName = file.name.replace(/[^\w.\-]/g, "_");
  const filename = `${Date.now()}_${safeName}`;
  const filepath = path.join(uploadsDir, filename);

  await writeFile(filepath, buffer);

  // URL, по которому будет доступен файл с сайта
  return `/uploads/${filename}`;
}
