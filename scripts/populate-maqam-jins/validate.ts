export type ValidationResult<E = { ok: false; error: string }> =
  | { ok: true }
  | E;

export type FamilyRule = {
  displayName: string;
  secondaryJinsDegree: string[] | null;
  tertiaryJinsDegree: string[] | null;
  ghammazDegree: string[] | null;
  notes: string;
};

export type RulesFile = {
  _meta: {
    classifier: { tuningSystem: string; startingNote: string };
    description: string;
  };
  families: Record<string, FamilyRule>;
};

function isStringArrayOrNull(v: unknown): v is string[] | null {
  if (v === null) return true;
  if (!Array.isArray(v)) return false;
  return v.every((x) => typeof x === "string");
}

export function validateRulesFile(
  raw: unknown
): { ok: true } | { ok: false; error: string } {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "Rules file must be a JSON object" };
  }
  const r = raw as Record<string, unknown>;

  if (!r._meta || typeof r._meta !== "object") {
    return { ok: false, error: "Rules file is missing _meta block" };
  }
  const meta = r._meta as Record<string, unknown>;
  if (!meta.classifier || typeof meta.classifier !== "object") {
    return { ok: false, error: "_meta is missing classifier block" };
  }
  const c = meta.classifier as Record<string, unknown>;
  if (typeof c.tuningSystem !== "string" || typeof c.startingNote !== "string") {
    return {
      ok: false,
      error: "_meta.classifier must have string tuningSystem and startingNote",
    };
  }

  if (!r.families || typeof r.families !== "object") {
    return { ok: false, error: "Rules file is missing families object" };
  }

  for (const [familyKey, rawRule] of Object.entries(
    r.families as Record<string, unknown>
  )) {
    if (typeof rawRule !== "object" || rawRule === null) {
      return { ok: false, error: `families.${familyKey} must be an object` };
    }
    const rule = rawRule as Record<string, unknown>;
    if (typeof rule.displayName !== "string") {
      return {
        ok: false,
        error: `families.${familyKey}.displayName must be a string`,
      };
    }
    for (const field of [
      "secondaryJinsDegree",
      "tertiaryJinsDegree",
      "ghammazDegree",
    ] as const) {
      if (!isStringArrayOrNull(rule[field])) {
        return {
          ok: false,
          error: `families.${familyKey}.${field} must be a string[] or null`,
        };
      }
    }
    if (typeof rule.notes !== "string") {
      return {
        ok: false,
        error: `families.${familyKey}.notes must be a string`,
      };
    }
  }

  return { ok: true };
}

export function validateNoteNamesInScale(
  noteNames: string[],
  scale: string[]
): { ok: true } | { ok: false; missing: string[] } {
  const missing = noteNames.filter((n) => !scale.includes(n));
  if (missing.length === 0) return { ok: true };
  return { ok: false, missing };
}
