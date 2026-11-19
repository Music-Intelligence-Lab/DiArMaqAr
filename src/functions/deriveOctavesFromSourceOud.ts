import { SourceOud } from "@/models/SourceOud";

/**
 * Works out octaves 0 and 3 of a tuning system from the ʿūd its source
 * describes, by continuing that ʿūd beyond its own strings.
 *
 * A source such as Ibn Sīnā gives an ʿūd whose strings and frets cover octaves
 * 1 and 2 only. To fill the octave below and the octave above, strings are added
 * a pure fourth (4/3) apart below the lowest string and above the highest one,
 * as an ʿūd tuned in fourths would continue. Each added string carries the same
 * frets as the outermost real string on its side. Every pitch those strings
 * sound inside an octave belongs to that octave.
 *
 * The added strings are an extrapolation, not something the source states, so
 * the tuning system's comment must say so wherever these values are stored.
 *
 * Before anything is returned, the same ʿūd must reproduce the tuning system's
 * own octaves 1 and 2 exactly. If it does not, the ʿūd and the tuning system
 * disagree, and this throws, naming the difference, rather than derive from a
 * mismatch.
 *
 * All arithmetic is on exact fractions, so a value is either exactly what the
 * ʿūd sounds or it is not produced at all. Values are written as reduced
 * fractions such as "1053/2048".
 */

/** The interval between each added string and the string next to it. */
export const ADDED_STRING_INTERVAL = "4/3";

type Fraction = { n: bigint; d: bigint };

const gcd = (a: bigint, b: bigint): bigint => (b === BigInt(0) ? a : gcd(b, a % b));

function reduce(n: bigint, d: bigint): Fraction {
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

function parse(text: string, where: string): Fraction {
  const match = /^\s*([1-9]\d*)\s*[/:]\s*([1-9]\d*)\s*$/.exec(text);
  if (!match) throw new Error(`${where}: "${text}" is not a ratio such as 4/3`);
  return reduce(BigInt(match[1]), BigInt(match[2]));
}

const times = (a: Fraction, b: Fraction) => reduce(a.n * b.n, a.d * b.d);
const over = (a: Fraction, b: Fraction) => reduce(a.n * b.d, a.d * b.n);
const compare = (a: Fraction, b: Fraction) => {
  const left = a.n * b.d;
  const right = b.n * a.d;
  return left < right ? -1 : left > right ? 1 : 0;
};
const text = (f: Fraction) => `${f.n}/${f.d}`;
const power = (two: number): Fraction => (two >= 0 ? { n: BigInt(2) ** BigInt(two), d: BigInt(1) } : { n: BigInt(1), d: BigInt(2) ** BigInt(-two) });

/** The pitches from base × 2^(octave−1) up to, not including, base × 2^octave, lowest first. */
function inOctave(pitches: Fraction[], base: Fraction, octave: number): Fraction[] {
  const low = times(base, power(octave - 1));
  const high = times(base, power(octave));
  return pitches.filter((p) => compare(p, low) >= 0 && compare(p, high) < 0);
}

function sameValues(label: string, fromOud: Fraction[], given: Fraction[]): void {
  const oud = new Set(fromOud.map(text));
  const tuning = new Set(given.map(text));
  const notGiven = [...oud].filter((v) => !tuning.has(v));
  const notSounded = [...tuning].filter((v) => !oud.has(v));
  if (!notGiven.length && !notSounded.length) return;
  const parts = [];
  if (notGiven.length) parts.push(`the ʿūd sounds ${notGiven.join(", ")}, which ${label} does not have`);
  if (notSounded.length) parts.push(`${label} has ${notSounded.join(", ")}, which the ʿūd does not sound`);
  throw new Error(`The source ʿūd does not reproduce ${label}: ${parts.join(", and ")}`);
}

export default function deriveOctavesFromSourceOud(
  octaveOne: string[],
  octaveTwo: string[] | null,
  oud: SourceOud
): { 0: string[]; 3: string[] } {
  if (!octaveOne.length) throw new Error("Octave 1 has no values");
  if (!oud.strings.length) throw new Error("The source ʿūd has no strings");
  if (!oud.frets.length) throw new Error("The source ʿūd has no frets");

  const one = octaveOne.map((v, i) => parse(v, `Octave 1, value ${i + 1}`));
  const two = octaveTwo ? octaveTwo.map((v, i) => parse(v, `Octave 2, value ${i + 1}`)) : one.map((v) => times(v, power(1)));
  const base = one[0];

  const fretRatios = new Map(oud.frets.map((fret) => [fret.id, parse(fret.ratio, `Fret "${fret.nameEnglish}"`)]));
  const strings = oud.strings.map((string) => ({
    open: parse(string.openRatio, `String "${string.nameEnglish}"`),
    frets: (string.frets ?? oud.frets.map((f) => f.id)).map((id) => {
      const ratio = fretRatios.get(id);
      if (!ratio) throw new Error(`String "${string.nameEnglish}" names a fret "${id}" that is not among the frets`);
      return ratio;
    }),
  }));

  const interval = parse(ADDED_STRING_INTERVAL, "The added-string interval");
  const highestStop = (s: (typeof strings)[number]) => s.frets.reduce((top, f) => (compare(f, top) > 0 ? f : top), { n: BigInt(1), d: BigInt(1) });

  // Below: add strings until the lowest one sounds nothing above octave 0's floor
  const floor = times(base, power(-1));
  while (compare(times(strings[0].open, highestStop(strings[0])), floor) > 0) {
    strings.unshift({ open: over(strings[0].open, interval), frets: strings[0].frets });
  }
  // Above: add strings until the highest one starts at or beyond octave 3's ceiling
  const ceiling = times(base, power(3));
  while (compare(strings[strings.length - 1].open, ceiling) < 0) {
    const top = strings[strings.length - 1];
    strings.push({ open: times(top.open, interval), frets: top.frets });
  }

  const unique = new Map<string, Fraction>();
  for (const string of strings) {
    for (const pitch of [string.open, ...string.frets.map((f) => times(string.open, f))]) unique.set(text(pitch), pitch);
  }
  const pitches = [...unique.values()].sort(compare);

  sameValues("octave 1", inOctave(pitches, base, 1), one);
  sameValues("octave 2", inOctave(pitches, base, 2), two);

  return { 0: inOctave(pitches, base, 0).map(text), 3: inOctave(pitches, base, 3).map(text) };
}
