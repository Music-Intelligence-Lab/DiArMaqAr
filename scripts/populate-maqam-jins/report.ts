import type { ActionLog } from "./merge";

export function printSummary(logs: ActionLog[]): void {
  const byCategory: Record<ActionLog["category"], ActionLog[]> = {
    populated: [],
    no_jins: [],
    unknown_family: [],
    validation_error: [],
  };
  for (const log of logs) byCategory[log.category].push(log);

  const fieldCounts: Record<string, { set: number; skipped: number }> = {
    primaryJinsDegree: { set: 0, skipped: 0 },
    secondaryJinsDegree: { set: 0, skipped: 0 },
    tertiaryJinsDegree: { set: 0, skipped: 0 },
    ghammaz: { set: 0, skipped: 0 },
  };
  for (const log of logs) {
    for (const f of log.setFields) {
      if (fieldCounts[f]) fieldCounts[f].set++;
    }
    for (const f of log.skippedFields) {
      if (fieldCounts[f]) fieldCounts[f].skipped++;
    }
  }

  const newlyPopulated = byCategory.populated.filter((l) => l.setFields.length > 0);
  const alreadyPopulated = byCategory.populated.filter((l) => l.setFields.length === 0);

  console.log("");
  console.log(`Newly populated: ${newlyPopulated.length} maqāmāt received family-rule defaults`);
  console.log(`Already populated (no changes): ${alreadyPopulated.length} maqāmāt`);
  console.log(`Flagged for manual entry: ${byCategory.no_jins.length + byCategory.unknown_family.length + byCategory.validation_error.length}`);
  console.log(`  - no_jins (${byCategory.no_jins.length}): ${byCategory.no_jins.map((l) => l.idName).join(", ") || "none"}`);
  console.log(`  - unknown family (${byCategory.unknown_family.length}): ${byCategory.unknown_family.map((l) => `${l.idName} [family=${l.familyIdName}]`).join(", ") || "none"}`);
  console.log(`  - validation errors (${byCategory.validation_error.length}):`);
  for (const l of byCategory.validation_error) {
    for (const ve of l.validationErrors ?? []) {
      console.log(`      ${l.idName} (family=${l.familyIdName}): ${ve.field} references missing notes ${JSON.stringify(ve.missing)}`);
    }
  }
  console.log("");
  console.log("Per-field breakdown:");
  for (const [field, c] of Object.entries(fieldCounts)) {
    console.log(`  ${field}: ${c.set} set, ${c.skipped} skipped`);
  }
  console.log("");
}
