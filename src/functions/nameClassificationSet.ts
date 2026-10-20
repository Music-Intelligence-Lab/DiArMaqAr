import MaqamData, { Maqam } from "@/models/Maqam";
import { entityToken } from "@/functions/export";
import { classifyMaqamFamily } from "@/functions/classifyMaqamFamily";

/** One member of a classification set: a maqām transposition and its maqām. */
export interface ClassificationSetMember {
  maqam: Maqam;
  maqamData: MaqamData;
}

const NO_JINS_FAMILY = "no jins";

const maqamId = (member: ClassificationSetMember) => Number(member.maqamData.getId());
const tonicCents = (member: ClassificationSetMember) => parseFloat(member.maqam.ascendingPitchClasses[0].cents);
const lowestMaqamId = (members: ClassificationSetMember[]) => Math.min(...members.map(maqamId));

/** A tonic named without a qarār or jawāb prefix: dūgāh, not qarār dūgāh or jawāb dūgāh. */
const inBaseRegister = (member: ClassificationSetMember) =>
  !/^(qarār|jawāb) /.test(member.maqam.ascendingPitchClasses[0].noteName);

/**
 * The member a classification set is named after. The set's members do not
 * change; only which of them gives the set its name.
 *
 * 1. A set that holds a base form is named after a base form: the one whose
 *    maqām has the lowest id.
 * 2. A set with no base form is named after its commonest family (the jins on
 *    the first degree of each member's maqām; "no jins" is not a family). Of
 *    that family's members, the maqām with the lowest id names the set. Two
 *    families with the same count: the one whose lowest maqām id is lower.
 *    When every member is "no jins", the lowest maqām id of all names it.
 * 3. That maqām may be in the set more than once. The form whose tonic is in
 *    the base register (no qarār or jawāb) is taken, else any form; the lowest
 *    tonic in pitch decides between several.
 *
 * @param members - The set's members
 * @param familyOf - The family of a maqām, read from its untransposed form
 */
export function chooseSetNamesake(
  members: ClassificationSetMember[],
  familyOf: (maqamData: MaqamData) => string
): ClassificationSetMember {
  if (members.length === 0) throw new Error("A classification set has no members to be named after");

  const baseForms = members.filter((member) => member.maqam.isBaseForm);
  if (baseForms.length > 0) {
    return baseForms.reduce((a, b) => (maqamId(b) < maqamId(a) ? b : a));
  }

  const byFamily = new Map<string, ClassificationSetMember[]>();
  for (const member of members) {
    const family = familyOf(member.maqamData);
    if (family === NO_JINS_FAMILY) continue;
    byFamily.set(family, [...(byFamily.get(family) ?? []), member]);
  }
  const commonest = [...byFamily.values()].sort(
    (a, b) => b.length - a.length || lowestMaqamId(a) - lowestMaqamId(b)
  )[0] ?? members;

  const namesakeId = lowestMaqamId(commonest);
  const forms = members.filter((member) => maqamId(member) === namesakeId);
  const preferred = forms.some(inBaseRegister) ? forms.filter(inBaseRegister) : forms;
  return preferred.reduce((a, b) => (tonicCents(b) < tonicCents(a) ? b : a));
}

/**
 * A set's name and source, from the member it is named after: the member's
 * identifier plus "_set" (maqam_nairuz_set, maqam_qarjaghar_al_ushayran_set).
 */
export function setNamedAfter(member: ClassificationSetMember) {
  return {
    id: `${entityToken(member.maqam)}_set`,
    name: `${member.maqam.name} set`,
    sourceMaqam: {
      id: member.maqamData.getId(),
      idName: member.maqamData.getIdName(),
      name: member.maqamData.getName(),
    },
    sourceTransposition: member.maqam,
  };
}

/**
 * Reads a maqām's family from its untransposed form, as the families endpoint
 * does, once per maqām.
 *
 * @param transpositionsOf - The maqām's transpositions in the tuning system being classified
 */
export function maqamFamilyReader(transpositionsOf: (maqamData: MaqamData) => Maqam[]): (maqamData: MaqamData) => string {
  const familyByMaqamId = new Map<string, string>();
  return (maqamData) => {
    let family = familyByMaqamId.get(maqamData.getId());
    if (family === undefined) {
      const untransposed = transpositionsOf(maqamData).find((t) => !t.transposition);
      if (!untransposed) throw new Error(`${maqamData.getName()} has no untransposed form to read its family from`);
      family = classifyMaqamFamily(untransposed).familyName;
      familyByMaqamId.set(maqamData.getId(), family);
    }
    return family;
  };
}
