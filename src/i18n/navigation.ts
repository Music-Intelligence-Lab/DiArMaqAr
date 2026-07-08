// Internal roots that must NEVER be localized (served outside the [lang] tree).
const UNPREFIXED = /^\/(api|docs)(\/|$)/;

// Matches a leading locale segment at a path boundary: "/en", "/en/...", but not "/enormous".
const LEADING_LOCALE = /^\/(en|ar|fr)(?=\/|$)/;

/**
 * Prefix an internal page href with the active locale.
 * Leaves external URLs, hash-only links, and /api & /docs paths untouched.
 * FUTURE (multilingual docs): to point docs links at localized docs, change the
 * /docs handling here to return `/docs/${lang}${rest}` — this is the single hook.
 */
export function localizedHref(href: string, lang: string): string {
  if (!href.startsWith("/") || UNPREFIXED.test(href)) return href;
  const splitAt = href.search(/[?#]/);
  const path = splitAt === -1 ? href : href.slice(0, splitAt);
  const rest = splitAt === -1 ? "" : href.slice(splitAt);
  // For root path "/", return just "/{lang}", not "/{lang}/"
  if (path === "/") return `/${lang}${rest}`;
  return `/${lang}${path}${rest}`;
}

/**
 * Strip a leading locale segment for pathname comparisons.
 * "/en" -> "/", "/en/app" -> "/app", "/app" -> "/app".
 */
export function stripLocale(pathname: string): string {
  const m = pathname.match(LEADING_LOCALE);
  const rest = m ? pathname.slice(m[0].length) : pathname;
  return rest === "" ? "/" : rest;
}
