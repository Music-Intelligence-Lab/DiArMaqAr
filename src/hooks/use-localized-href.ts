"use client";
import { useCallback } from "react";
import useLanguageContext from "@/contexts/language-context";
import { localizedHref } from "@/i18n/navigation";

/** Returns a function that prefixes internal hrefs with the current locale. */
export function useLocalizedHref(): (href: string) => string {
  const { language } = useLanguageContext();
  return useCallback((href: string) => localizedHref(href, language), [language]);
}
