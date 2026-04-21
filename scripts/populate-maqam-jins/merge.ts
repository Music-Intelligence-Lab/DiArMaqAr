import type { FamilyRule } from "./validate.js";
import { validateNoteNamesInScale } from "./validate.js";

export type MaqamEntry = {
  idName: string;
  ascendingNoteNames: string[];
  primaryJinsDegree?: string[] | null;
  secondaryJinsDegree?: string[] | null;
  tertiaryJinsDegree?: string[] | null;
  ghammaz?: string[] | null;
  [k: string]: unknown;
};

export type MergeInput = {
  maqam: MaqamEntry;
  familyIdName: string;
  rule: FamilyRule | null;
  /**
   * Optional expanded scale for note-name-in-scale validation. Lets callers
   * include adjacent-octave equivalents (e.g. ḥusaynī ≡ ʿushayrān + 1 octave)
   * so a legitimate octave-shifted jins degree isn't falsely flagged.
   * Defaults to `maqam.ascendingNoteNames`.
   */
  validationScale?: string[];
};

export type ActionLog = {
  idName: string;
  familyIdName: string;
  category: "populated" | "no_jins" | "unknown_family" | "validation_error";
  setFields: string[];
  skippedFields: string[];
  validationErrors?: { field: string; missing: string[] }[];
};

export type MergeResult = {
  updated: MaqamEntry;
  log: ActionLog;
};

export function mergeMaqam(input: MergeInput): MergeResult {
  const { maqam, familyIdName, rule } = input;
  const validationScale = input.validationScale ?? maqam.ascendingNoteNames;
  const updated: MaqamEntry = { ...maqam };
  const setFields: string[] = [];
  const skippedFields: string[] = [];
  const validationErrors: { field: string; missing: string[] }[] = [];

  // primaryJinsDegree: derivable from ascendingNoteNames[0].
  // Explicit `null` is treated as "manually unset, don't touch" — matches the
  // semantic for the other three fields. Only populate when the key is absent.
  const primarySet = Object.prototype.hasOwnProperty.call(maqam, "primaryJinsDegree");
  const firstNote = maqam.ascendingNoteNames[0];
  if (!primarySet && firstNote) {
    updated.primaryJinsDegree = [firstNote];
    setFields.push("primaryJinsDegree");
  } else if (primarySet) {
    skippedFields.push("primaryJinsDegree");
  }

  // no_jins: never write secondary/tertiary/ghammaz
  if (familyIdName === "no_jins") {
    if (updated.secondaryJinsDegree === undefined) updated.secondaryJinsDegree = null;
    if (updated.tertiaryJinsDegree === undefined) updated.tertiaryJinsDegree = null;
    if (updated.ghammaz === undefined) updated.ghammaz = null;
    return {
      updated,
      log: {
        idName: maqam.idName,
        familyIdName,
        category: "no_jins",
        setFields,
        skippedFields,
      },
    };
  }

  // Unknown family: pad fields to null, don't write
  if (rule === null) {
    if (updated.secondaryJinsDegree === undefined) updated.secondaryJinsDegree = null;
    if (updated.tertiaryJinsDegree === undefined) updated.tertiaryJinsDegree = null;
    if (updated.ghammaz === undefined) updated.ghammaz = null;
    return {
      updated,
      log: {
        idName: maqam.idName,
        familyIdName,
        category: "unknown_family",
        setFields,
        skippedFields,
      },
    };
  }

  // Known family: apply rule where currently null/absent. Empty arrays in rule are no-ops.
  const applications: { ruleField: keyof FamilyRule; targetField: keyof MaqamEntry }[] = [
    { ruleField: "secondaryJinsDegree", targetField: "secondaryJinsDegree" },
    { ruleField: "tertiaryJinsDegree", targetField: "tertiaryJinsDegree" },
    { ruleField: "ghammazDegree", targetField: "ghammaz" },
  ];

  for (const { ruleField, targetField } of applications) {
    const ruleValue = rule[ruleField] as string[] | null;
    const keyPresent = Object.prototype.hasOwnProperty.call(maqam, targetField);

    // Any pre-existing key (including explicit null) is a manual override — skip.
    if (keyPresent) {
      skippedFields.push(targetField as string);
      continue;
    }

    if (ruleValue === null || ruleValue.length === 0) {
      // Pad with null so the field appears in output.
      (updated as any)[targetField] = null;
      continue;
    }

    const vr = validateNoteNamesInScale(ruleValue, validationScale);
    if (!vr.ok) {
      validationErrors.push({ field: targetField as string, missing: vr.missing });
      (updated as any)[targetField] = null;
      continue;
    }

    (updated as any)[targetField] = ruleValue;
    setFields.push(targetField as string);
  }

  if (validationErrors.length > 0) {
    return {
      updated,
      log: {
        idName: maqam.idName,
        familyIdName,
        category: "validation_error",
        setFields,
        skippedFields,
        validationErrors,
      },
    };
  }

  return {
    updated,
    log: {
      idName: maqam.idName,
      familyIdName,
      category: "populated",
      setFields,
      skippedFields,
    },
  };
}
