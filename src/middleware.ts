import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale, isLocale, type Locale } from "@/i18n/config";

/** Pick the first supported locale from an Accept-Language header, else default. */
export function resolveLocale(acceptLanguage: string): Locale {
  const preferred = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0].trim().split("-")[0].toLowerCase());
  return (preferred.find((l) => (locales as readonly string[]).includes(l)) as Locale) ?? defaultLocale;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1];

  // Already localized — do nothing (prevents /en -> /en/en loops).
  if (isLocale(first)) return NextResponse.next();

  const locale = resolveLocale(req.headers.get("accept-language") ?? "");
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url); // 307 temporary — locale is browser-derived, unpersisted.
}

export const config = {
  matcher: [
    // Run on everything EXCEPT api, docs, the openapi/llms aliases, Next internals,
    // named static roots, and any path with a file extension (static assets).
    "/((?!api|docs|_next/static|_next/image|llms\\.txt|llms-full\\.txt|openapi\\.json|openapi\\.yaml|robots\\.txt|sitemap\\.xml|favicon\\.ico|opengraph-image|.*\\.[\\w]+$).*)",
  ],
};
