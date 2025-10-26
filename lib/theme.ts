export type ThemeVariant = "default" | "bigpharma";

export const DEFAULT_THEME: ThemeVariant =
  (process.env.THEME_VARIANT as ThemeVariant) || "default";
