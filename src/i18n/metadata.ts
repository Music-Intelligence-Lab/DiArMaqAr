import type { Locale } from "@/i18n/config";

/** Single source of truth for localized <head> metadata copy (server-side). */
export const localeMeta: Record<Locale, { title: string; description: string; ogLocale: string }> = {
  en: {
    title: "Digital Arabic Maqām Archive (DiArMaqAr)",
    description:
      "Open-source, multilingual, browser-based computational platform and machine-readable corpus of Arabic maqām theory spanning over one thousand years of documentation.",
    ogLocale: "en_US",
  },
  ar: {
    title: "أرشيف المقام العربي الرقمي (DiArMaqAr)",
    description:
      "منصّة حاسوبية مفتوحة المصدر ومتعددة اللغات تعمل في المتصفّح، ومُدوَّنة قابلة للقراءة الآلية لنظرية المقام العربي تغطّي أكثر من ألف عام من التوثيق.",
    ogLocale: "ar_AR",
  },
  fr: {
    title: "Archive numérique du maqām arabe (DiArMaqAr)",
    description:
      "Plateforme informatique open source et multilingue, et corpus lisible par machine de la théorie du maqām arabe, couvrant plus de mille ans de documentation.",
    ogLocale: "fr_FR",
  },
};
