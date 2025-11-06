import { addArabicFields } from "@/app/api/arabic-helpers";

type Nullable<T> = T | null | undefined;

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

export function buildLinksNamespace(links: LinksNamespace): LinksNamespace {
  return stripUndefined(links);
}

interface BuildListResponseOptions<M extends Record<string, unknown>> {
  meta?: M;
}

export interface ListResponse<
  T,
  M extends Record<string, unknown> = { count: number }
> {
  meta: M;
  data: T[];
}

export function buildListResponse<
  T,
  M extends Record<string, unknown> = { count: number }
>(
  items: T[],
  options: BuildListResponseOptions<M> = {}
): ListResponse<T, M> {
  const { meta } = options;
  const baseMeta: Record<string, unknown> = { count: items.length };

  return {
    meta: stripUndefined({ ...baseMeta, ...meta }) as M,
    data: items,
  };
}

export function withArabicFields<T extends Record<string, unknown>>(
  base: T,
  inArabic: boolean,
  fields: Record<string, Nullable<string>>
): T {
  if (!inArabic) return base;
  return addArabicFields(base, true, fields);
}


