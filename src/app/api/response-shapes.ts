import { addArabicFields } from "@/app/api/arabic-helpers";

type Nullable<T> = T | null | undefined;

/** Canonical production URL - prevents branch/deploy URLs from leaking into API responses */
const CANONICAL_BASE = "https://diarmaqar.net";

/**
 * Returns the canonical production URL for links.self.
 * Netlify branch deploys (main--, deploy-id--) would otherwise leak into responses,
 * breaking LLM API chaining and navigation.
 */
export function getCanonicalSelfUrl(request: Request): string {
  const url = new URL(request.url);
  return `${CANONICAL_BASE}${url.pathname}${url.search}`;
}

/** Build canonical URL from path (with optional query string).
 *  Idempotent: an input that is already an absolute http(s) URL is returned
 *  unchanged, so it is safe to run over link values that may already have
 *  been absolutized (e.g. `self` via getCanonicalSelfUrl). */
export function getCanonicalApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${CANONICAL_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

function stripUndefined<T extends Record<string, unknown>>(input: T): T {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  ) as T;
}

export interface EntityNamespace {
  id: string;
  idName: string;
  displayName: string;
  version?: string | null;
  [key: string]: unknown;
}

interface BuildEntityOptions {
  version?: Nullable<string>;
  extras?: Record<string, unknown>;
  inArabic?: boolean;
  displayNameAr?: Nullable<string>;
}

export function buildEntityNamespace(
  base: { id: string; idName: string; displayName: string },
  options: BuildEntityOptions = {}
): EntityNamespace {
  const { version, extras = {}, inArabic = false, displayNameAr } = options;

  const namespace: EntityNamespace = {
    id: base.id,
    idName: base.idName,
    displayName: base.displayName,
    ...stripUndefined({ version }),
    ...extras
  };

  if (inArabic && displayNameAr) {
    namespace.displayNameAr = displayNameAr;
  }

  return namespace;
}

interface BuildIdentifierOptions {
  inArabic?: boolean;
  displayAr?: Nullable<string>;
  extras?: Record<string, unknown>;
}

export interface IdentifierNamespace {
  id?: string;
  idName: string;
  displayName: string;
  [key: string]: unknown;
}

export function buildIdentifierNamespace(
  base: { id?: string; idName: string; displayName: string },
  options: BuildIdentifierOptions = {}
): IdentifierNamespace {
  const { inArabic = false, displayAr, extras = {} } = options;

  const namespace: IdentifierNamespace = stripUndefined({
    id: base.id,
    idName: base.idName,
    displayName: base.displayName,
    ...extras
  });

  if (inArabic && displayAr) {
    namespace.displayNameAr = displayAr;
  }

  return namespace;
}

interface BuildStringArrayOptions {
  inArabic?: boolean;
  displayNames?: Nullable<string[]>;
  displayNamesAr?: Nullable<string[]>;
}

export function buildStringArrayNamespace(
  ids: string[],
  options: BuildStringArrayOptions = {}
) {
  const { inArabic = false, displayNames, displayNamesAr } = options;

  const namespace: Record<string, unknown> = { idNames: ids };

  if (displayNames) {
    namespace.displayNames = displayNames;
  }

  if (inArabic && displayNamesAr) {
    namespace.displayNamesAr = displayNamesAr;
  }

  return namespace;
}

export interface LinksNamespace {
  self?: string;
  detail?: string;
  compare?: string;
  availability?: string;
  playground?: string;
  [key: string]: unknown;
}

/**
 * Absolutize every link value to a canonical https://diarmaqar.net/… URL.
 *
 * Call sites pass relative `/api/…` path literals (with `self` sometimes
 * already absolute via getCanonicalSelfUrl/getCanonicalApiUrl). Many LLM HTTP
 * fetch tools can only request an absolute URL that has appeared verbatim in
 * context — a relative onward link like `/api/maqamat/{id}/availability` is
 * unreachable for them, which silently breaks the list → availability → detail
 * discovery chain one hop in. Absolutizing here (idempotent for values that are
 * already absolute) fixes every route's links at the root, in one place.
 */
export function buildLinksNamespace(links: LinksNamespace): LinksNamespace {
  const absolutized: LinksNamespace = {};
  for (const [key, value] of Object.entries(links)) {
    absolutized[key] = typeof value === "string" ? getCanonicalApiUrl(value) : value;
  }
  return stripUndefined(absolutized);
}

interface BuildListResponseOptions {
  meta?: Record<string, unknown>;
}

export interface ListResponse<T> {
  count: number;
  data: T[];
  [key: string]: unknown;
}

export function buildListResponse<T>(
  items: T[],
  options: BuildListResponseOptions = {}
): ListResponse<T> {
  const { meta } = options;
  const baseMeta: Record<string, unknown> = { count: items.length };
  const allMeta = stripUndefined({ ...baseMeta, ...meta });

  return {
    count: items.length,
    ...allMeta,
    data: items,
  };
}

export function withArabicFields<T extends Record<string, unknown>>(
  base: T,
  inArabic: boolean,
  fields: Record<string, Nullable<string>>
): T {
  if (!inArabic) return base;
  // Filter out undefined values to match addArabicFields signature
  const filteredFields: Record<string, string | null> = Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined)
  ) as Record<string, string | null>;
  return addArabicFields(base, true, filteredFields);
}


