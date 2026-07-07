export const locales = ["en", "ar", "fr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isLocale(x: string): x is Locale {
  return (locales as readonly string[]).includes(x);
}

export function dir(l: Locale): "rtl" | "ltr" {
  return l === "ar" ? "rtl" : "ltr";
}
