import type MaqamData from "@/models/Maqam";
import type JinsData from "@/models/Jins";
import type TuningSystem from "@/models/TuningSystem";
import { standardizeText } from "@/functions/export";
import { calculateMaqamTranspositions } from "@/functions/transpose";
import { classifyMaqamFamily } from "@/functions/classifyMaqamFamily";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";

export type ClassifyContext = {
  tuningSystem: TuningSystem;
  startingNote: string;
  ajnas: JinsData[];
};

export function buildClassifyContext(
  tuningSystems: TuningSystem[],
  ajnas: JinsData[],
  tuningSystemId: string,
  startingNoteParam: string
): ClassifyContext {
  const tuningSystem = tuningSystems.find(
    (ts) => standardizeText(ts.getId()) === standardizeText(tuningSystemId)
  );
  if (!tuningSystem) {
    throw new Error(
      `Canonical tuning system '${tuningSystemId}' not found in data/tuningSystems.json`
    );
  }
  const noteNameSets = tuningSystem.getNoteNameSets();
  const found = noteNameSets.find(
    (set) => set[0] && standardizeText(set[0]) === standardizeText(startingNoteParam)
  );
  if (!found || !found[0]) {
    throw new Error(
      `Canonical starting note '${startingNoteParam}' not available in '${tuningSystemId}'`
    );
  }
  return { tuningSystem, startingNote: found[0], ajnas };
}

/**
 * Returns the family idName (standardized) for a single MaqamData, using the
 * canonical tuning system/starting note. Returns null if the maqām cannot be
 * classified (e.g. not possible under this tuning system).
 */
export function classifyMaqamToFamilyIdName(
  maqamData: MaqamData,
  ctx: ClassifyContext
): string | null {
  try {
    const pitchClasses = getTuningSystemPitchClasses(
      ctx.tuningSystem,
      ctx.startingNote as any
    );
    const transpositions = calculateMaqamTranspositions(
      pitchClasses,
      ctx.ajnas,
      maqamData,
      true,
      5
    );
    const tahlil = transpositions.find((t) => !t.transposition);
    if (!tahlil) return null;
    const classification = classifyMaqamFamily(tahlil);
    return standardizeText(classification.familyName);
  } catch {
    return null;
  }
}
