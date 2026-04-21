import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getMaqamat, getAjnas, getTuningSystems } from "@/functions/import";
import { shiftNoteName } from "@/models/NoteName";
import { validateRulesFile, validateNoteNamesInScale, type RulesFile } from "./validate";
import { mergeMaqam, type MaqamEntry, type ActionLog } from "./merge";
import { buildClassifyContext, classifyMaqamToFamilyIdName } from "./classify";
import { printSummary } from "./report";

/**
 * Expand a scale with its adjacent-octave equivalents so a jins degree that
 * lies one octave above or below the written scale (e.g. ḥusaynī as the octave
 * of ʿushayrān) counts as in-scale. Matches the pattern used by
 * TuningSystem.getNoteNameSetsWithAdjacentOctaves.
 */
function expandWithAdjacentOctaves(scale: string[]): string[] {
  const below: string[] = [];
  const above: string[] = [];
  for (const n of scale) {
    try {
      below.push(shiftNoteName(n as any, -1));
      above.push(shiftNoteName(n as any, 1));
    } catch {
      // A note without a defined octave neighbour (rare) is simply omitted
      // from the expansion; the literal note is still present via `scale`.
    }
  }
  return [...below, ...scale, ...above];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const MAQAMAT_JSON = path.join(REPO_ROOT, "data", "maqamat.json");
const RULES_JSON = path.join(REPO_ROOT, "data", "maqamat-family-rules.json");

const KEY_ORDER_HINT = [
  "id",
  "idName",
  "name",
  "ascendingNoteNames",
  "descendingNoteNames",
  "primaryJinsDegree",
  "secondaryJinsDegree",
  "tertiaryJinsDegree",
  "ghammaz",
  "suyur",
  "commentsEnglish",
  "commentsArabic",
  "sourcePageReferences",
  "version",
];

function orderKeys(entry: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of KEY_ORDER_HINT) {
    if (k in entry) out[k] = entry[k];
  }
  for (const k of Object.keys(entry)) {
    if (!(k in out)) out[k] = entry[k];
  }
  return out;
}

async function runMerge(): Promise<void> {
  const rawRules = JSON.parse(await fs.readFile(RULES_JSON, "utf8")) as unknown;
  const vr = validateRulesFile(rawRules);
  if (!vr.ok) {
    console.error(`ERROR: ${RULES_JSON} failed validation: ${vr.error}`);
    process.exit(1);
  }
  const rules = rawRules as RulesFile;

  const rawMaqamat = JSON.parse(await fs.readFile(MAQAMAT_JSON, "utf8")) as MaqamEntry[];
  const maqamatForClassify = getMaqamat();
  const ajnas = getAjnas();
  const tuningSystems = getTuningSystems();

  const ctx = buildClassifyContext(
    tuningSystems,
    ajnas,
    rules._meta.classifier.tuningSystem,
    rules._meta.classifier.startingNote
  );

  const idToFamily = new Map<string, string | null>();
  for (const m of maqamatForClassify) {
    idToFamily.set(m.getId(), classifyMaqamToFamilyIdName(m, ctx));
  }

  const updated: MaqamEntry[] = [];
  const logs: ActionLog[] = [];
  for (const entry of rawMaqamat) {
    const familyIdName = idToFamily.get(String(entry.id)) ?? "unknown";
    const rule = rules.families[familyIdName] ?? null;
    const validationScale = expandWithAdjacentOctaves(entry.ascendingNoteNames);
    const { updated: u, log } = mergeMaqam({ maqam: entry, familyIdName, rule, validationScale });
    updated.push(orderKeys(u as Record<string, unknown>) as MaqamEntry);
    logs.push(log);
  }

  const validationErrors = logs.filter((l) => l.category === "validation_error");
  if (validationErrors.length > 0) {
    console.error("ABORTING: validation errors detected — maqamat.json NOT written.");
    printSummary(logs);
    process.exit(1);
  }

  await fs.writeFile(MAQAMAT_JSON, JSON.stringify(updated, null, 2) + "\n", "utf8");
  printSummary(logs);
  console.log(`${MAQAMAT_JSON} written. Run \`git diff data/maqamat.json\` to review.`);
}

async function runVerify(): Promise<void> {
  const rawMaqamat = JSON.parse(await fs.readFile(MAQAMAT_JSON, "utf8")) as MaqamEntry[];
  const errors: string[] = [];

  for (const entry of rawMaqamat) {
    const id = entry.idName ?? String(entry.id);
    const required = [
      "primaryJinsDegree",
      "secondaryJinsDegree",
      "tertiaryJinsDegree",
      "ghammaz",
    ] as const;
    for (const k of required) {
      if (!(k in entry)) errors.push(`${id}: missing key ${k}`);
    }

    if (entry.primaryJinsDegree === null) {
      errors.push(`${id}: primaryJinsDegree must be a non-null array (got null)`);
    }

    const validationScale = expandWithAdjacentOctaves(entry.ascendingNoteNames);
    for (const field of ["primaryJinsDegree", "secondaryJinsDegree", "tertiaryJinsDegree", "ghammaz"] as const) {
      const v = entry[field];
      if (v == null) continue;
      if (!Array.isArray(v)) {
        errors.push(`${id}: ${field} must be array or null`);
        continue;
      }
      if (field === "primaryJinsDegree" && v.length !== 1) {
        errors.push(`${id}: primaryJinsDegree must be a single-element array (got ${v.length})`);
      }
      const vr = validateNoteNamesInScale(v, validationScale);
      if (!vr.ok) {
        errors.push(
          `${id}: ${field} references notes not in scale: ${JSON.stringify(vr.missing)}`
        );
      }
    }
  }

  if (errors.length === 0) {
    console.log(`OK — all ${rawMaqamat.length} entries pass structural invariants.`);
    return;
  }
  console.error(`FAIL — ${errors.length} issues found:`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}

const verify = process.argv.includes("--verify");

(verify ? runVerify() : runMerge()).catch((err) => {
  console.error(err);
  process.exit(1);
});
