import "./globals.css";
import { DEFAULT_THEME } from "@/lib/theme";

export const metadata = {
  title: "Pharmacy Training Portal",
  description: "Внутренний портал обучения сотрудников аптеки",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" data-theme={DEFAULT_THEME}>
      <body>{children}</body>
    </html>
  );
}
