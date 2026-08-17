import MaqamData from "@/models/Maqam";
import NoteName, { getNoteNameIndexAndOctave, sameModalDegreeSlot } from "@/models/NoteName";
import { getMaqamat } from "@/functions/import";

/**
 * Ordering for the ajnās that match a single maqām degree.
 *
 * A degree frequently matches several ajnās, and 91% of those collisions are
 * between ajnās with *identical* interval patterns — jins rāst and jins yegāh are
 * one shape that tradition names for where it is seated, not two shapes a tighter
 * cents tolerance could separate. Something has to decide which reading leads.
 *
 * The suyūr decide. Their stops record `type: "jins"` with a jins id and a
 * startingNote: the sources naming a jins at a note, 555 times across the corpus.
 * That is evidence. Structural seating — "this jins's canonical first note is this
 * degree" — is only inference, and where the two disagree the evidence wins. The
 * clearest case: the suyūr name jins rāst at nawā 44 times, while jins yegāh is
 * structurally seated there and never attested at all.
 */
export interface SuyurAttestation {
  /** `${jinsId}@${noteName}` → stops naming that jins at that exact note, register included */
  perNote: Map<string, number>;
  /** `${jinsId}@${modalDegreeSlot}` → the same counts folded across registers */
  perSlot: Map<string, number>;
  /** jinsId → stops naming that jins anywhere in the corpus */
  corpusWide: Map<string, number>;
}

export interface JinsCandidate {
  jinsId: string;
  /** The jins's canonical first note — where tradition seats it */
  firstNoteName: string;
  noteCount: number;
}

export function buildSuyurAttestation(allMaqamat: MaqamData[]): SuyurAttestation {
  const perNote = new Map<string, number>();
  const perSlot = new Map<string, number>();
  const corpusWide = new Map<string, number>();
  const bump = (table: Map<string, number>, key: string) => table.set(key, (table.get(key) ?? 0) + 1);

  for (const maqamData of allMaqamat) {
    for (const sayr of maqamData.getSuyur()) {
      for (const stop of sayr.stops) {
        if (stop.type !== "jins" || !stop.value) continue;
        bump(corpusWide, stop.value);
        if (!stop.startingNote) continue;
        bump(perNote, `${stop.value}@${stop.startingNote}`);
        const slot = getNoteNameIndexAndOctave(stop.startingNote as NoteName).index;
        if (slot >= 0) bump(perSlot, `${stop.value}@${slot}`);
      }
    }
  }

  return { perNote, perSlot, corpusWide };
}

let memoized: SuyurAttestation | null = null;

/** The corpus-wide tables, built once. The maqāmāt data is static for a process. */
export function getSuyurAttestation(): SuyurAttestation {
  if (!memoized) memoized = buildSuyurAttestation(getMaqamat());
  return memoized;
}

/**
 * Ranking tiers, most significant first. Negated counts so that "more attested"
 * sorts earlier under a plain ascending comparison.
 */
function tiersFor(candidate: JinsCandidate, degreeNoteName: string, attestation: SuyurAttestation): number[] {
  const slot = getNoteNameIndexAndOctave(degreeNoteName as NoteName).index;
  return [
    // 1. Attested at this exact note. MUST precede the folded tier: ʿirāq and awj
    //    are one shape an octave apart recorded as two entries, and folding their
    //    counts lets awj's 7 mentions outvote ʿirāq's 5 at the note ʿirāq —
    //    erasing the register distinction the two entries exist to make.
    -(attestation.perNote.get(`${candidate.jinsId}@${degreeNoteName}`) ?? 0),
    // 2. Attested at this modal degree slot, registers pooled. As a tiebreak below
    //    tier 1 this stops a degree and its own octave leading with different
    //    names: nikrīz is attested 9 times at rāst but only twice at kurdān, where
    //    it would otherwise tie with nawā athar and lose.
    -(attestation.perSlot.get(`${candidate.jinsId}@${slot}`) ?? 0),
    // 3. Attested anywhere. transposeSayr shifts stored note names by the
    //    transposition offset, which means suyūr are recorded at each maqām's
    //    tahlil position — so tiers 1 and 2 cannot speak to taṣwīr degrees at all,
    //    and this corpus-wide count is what carries the signal there.
    -(attestation.corpusWide.get(candidate.jinsId) ?? 0),
    // 4. Structurally seated on this degree. Inference, not evidence, so it ranks
    //    below all three attestation tiers.
    sameModalDegreeSlot(candidate.firstNoteName, degreeNoteName) ? 0 : 1,
    // 5. Longer first, so a nested fragment never outranks the jins containing it
    //    (nawā athar is nikrīz's first four notes). A guard: the suyūr already
    //    separate that pair, so this tier currently decides nothing.
    -candidate.noteCount,
  ];
}

/**
 * Total order over the ajnās matching one degree. Tier 6 — a numeric-aware id
 * comparison — is terminal and guarantees determinism, deliberately independent of
 * the order entries happen to appear in data/ajnas.json.
 */
export function compareJinsCandidates(
  a: JinsCandidate,
  b: JinsCandidate,
  degreeNoteName: string,
  attestation: SuyurAttestation
): number {
  const tiersA = tiersFor(a, degreeNoteName, attestation);
  const tiersB = tiersFor(b, degreeNoteName, attestation);
  for (let i = 0; i < tiersA.length; i++) {
    if (tiersA[i] !== tiersB[i]) return tiersA[i] - tiersB[i];
  }
  return a.jinsId.localeCompare(b.jinsId, "en", { numeric: true });
}
