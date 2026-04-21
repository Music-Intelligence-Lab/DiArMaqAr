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
  const updated: MaqamEntry = { ...maqam };
  const setFields: string[] = [];
  const skippedFields: string[] = [];
  const validationErrors: { field: string; missing: string[] }[] = [];

  // primaryJinsDegree: always derivable from ascendingNoteNames[0]
  const firstNote = maqam.ascendingNoteNames[0];
  if (updated.primaryJinsDegree == null && firstNote) {
    updated.primaryJinsDegree = [firstNote];
    setFields.push("primaryJinsDegree");
  } else if (updated.primaryJinsDegree != null) {
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
    const current = updated[targetField] as string[] | null | undefined;

    if (current != null) {
      skippedFields.push(targetField as string);
      continue;
    }

    if (ruleValue === null || ruleValue.length === 0) {
      // Pad with null so the field appears in output
      if (current === undefined) (updated as any)[targetField] = null;
      continue;
    }

    const vr = validateNoteNamesInScale(ruleValue, maqam.ascendingNoteNames);
    if (!vr.ok) {
      validationErrors.push({ field: targetField as string, missing: vr.missing });
      if (current === undefined) (updated as any)[targetField] = null;
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
