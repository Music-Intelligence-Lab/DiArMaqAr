import { test } from "node:test";
import assert from "node:assert/strict";
import { getMaqamat, getAjnas, getTuningSystems } from "@/functions/import";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { calculateJinsTranspositions, calculateMaqamTranspositions } from "@/functions/transpose";

function fixtureFor(tuningSystemId: string, startingNote: string) {
  const ts = getTuningSystems().find((t) => t.getId() === tuningSystemId);
  if (!ts) throw new Error(`tuning system ${tuningSystemId} not found`);
  const pc = getTuningSystemPitchClasses(ts, startingNote as any);
  const ajnas = getAjnas();
  return { pc, ajnas };
}

function fixture() {
  return fixtureFor("angloeuropean_1800", "yegāh");
}

test("maqām rāst tahlil: degree fields match source exactly", () => {
  const { pc, ajnas } = fixture();
  const maqamRast = getMaqamat().find((m) => m.getId() === "1");
  if (!maqamRast) throw new Error("maqam_rast not found");

  const tp = calculateMaqamTranspositions(pc, ajnas, maqamRast, true, 5);
  const tahlil = tp.find((t) => !t.transposition);
  assert.ok(tahlil, "tahlil must exist");

  assert.deepEqual(tahlil!.primaryJinsNoteName, ["rāst"]);
  assert.deepEqual(tahlil!.secondaryJinsNoteName, ["nawā"]);
  assert.equal(tahlil!.tertiaryJinsNoteName, null);
  assert.deepEqual(tahlil!.ghammazNoteName, ["nawā"]);

  assert.ok(tahlil!.primaryJins && tahlil!.primaryJins.length >= 1, "primaryJins must have at least one entry");
  assert.equal(tahlil!.primaryJins![0].jinsPitchClasses[0].noteName, "rāst");

  assert.ok(tahlil!.secondaryJins && tahlil!.secondaryJins.length >= 1, "secondaryJins must have at least one entry");
  assert.equal(tahlil!.secondaryJins![0].jinsPitchClasses[0].noteName, "nawā");

  assert.deepEqual(tahlil!.tertiaryJins, []);
});

test("maqām rāst taswir on nawā: primary + secondary note names shift by the scale degree", () => {
  const { pc, ajnas } = fixture();
  const maqamRast = getMaqamat().find((m) => m.getId() === "1");
  if (!maqamRast) throw new Error("maqam_rast not found");

  const tp = calculateMaqamTranspositions(pc, ajnas, maqamRast, true, 5);
  const taswir = tp.find((t) => t.transposition && t.ascendingPitchClasses[0].noteName === "nawā");
  assert.ok(taswir, "expected a taswir starting on nawā");

  assert.deepEqual(taswir!.primaryJinsNoteName, ["nawā"]);

  // secondary was ["nawā"] at index 4 of rāst's ascendingNoteNames.
  // On the nawā-transposed scale, index 4 is the ascendingPitchClasses[4].
  const expectedSecondary = taswir!.ascendingPitchClasses[4].noteName;
  assert.deepEqual(taswir!.secondaryJinsNoteName, [expectedSecondary]);

  // ghammaz tracks secondary for rāst family.
  assert.deepEqual(taswir!.ghammazNoteName, [expectedSecondary]);

  assert.equal(taswir!.tertiaryJinsNoteName, null);

  // Jins lookups should have resolved to the transposed ajnas.
  assert.ok(taswir!.primaryJins && taswir!.primaryJins.length >= 1);
  assert.equal(taswir!.primaryJins![0].jinsPitchClasses[0].noteName, "nawā");
});

test("maqām mustaʿār tahlil: tertiary resolves to a non-empty array", () => {
  // Not the shared angloeuropean_1800 fixture: mustaʿār's DESCENDING sequence
  // needs nīm māhūr, which that tuning system lacks, so mustaʿār is not
  // buildable there and calculateMaqamTranspositions correctly returns [].
  const { pc, ajnas } = fixtureFor("ronzevalle_1904", "ʿushayrān");
  // mustaʿār is the family with a tertiary ḥusaynī per family rules.
  const maqamMustaar = getMaqamat().find((m) => m.getIdName() === "maqam_mustaar");
  if (!maqamMustaar) throw new Error("maqam_mustaar not found");
  assert.ok(
    maqamMustaar.isMaqamPossible(pc.map((p) => p.noteName) as any),
    "fixture must be a tuning system that can actually build mustaʿār"
  );

  const tp = calculateMaqamTranspositions(pc, ajnas, maqamMustaar, true, 5);
  const tahlil = tp.find((t) => !t.transposition);
  assert.ok(tahlil);

  assert.deepEqual(tahlil!.tertiaryJinsNoteName, ["ḥusaynī"]);
  // tertiaryJins may or may not have a matching jins depending on which ajnas
  // the analysis happens to find on the ḥusaynī degree. Array existence is enough.
  assert.ok(Array.isArray(tahlil!.tertiaryJins));
});

test("maqām dilkeshīdah tahlil: primary is ['dūgāh'] (the documented exception)", () => {
  const { pc, ajnas } = fixture();
  const maqamDilkeshidah = getMaqamat().find((m) => m.getIdName() === "maqam_dilkeshidah");
  if (!maqamDilkeshidah) throw new Error("maqam_dilkeshidah not found");

  const tp = calculateMaqamTranspositions(pc, ajnas, maqamDilkeshidah, true, 5);
  const tahlil = tp.find((t) => !t.transposition);
  assert.ok(tahlil);

  assert.deepEqual(tahlil!.primaryJinsNoteName, ["dūgāh"]);
  assert.equal(tahlil!.ghammazNoteName, null);
});

test("degree field is null when source is null (tertiary unset on rāst)", () => {
  const { pc, ajnas } = fixture();
  const maqamRast = getMaqamat().find((m) => m.getId() === "1");
  if (!maqamRast) throw new Error("maqam_rast not found");

  const tp = calculateMaqamTranspositions(pc, ajnas, maqamRast, true, 5);
  for (const m of tp) {
    assert.equal(m.tertiaryJinsNoteName, null, `tertiary should be null for every transposition of rāst`);
    assert.deepEqual(m.tertiaryJins, [], `tertiaryJins must be empty when tertiary note is null`);
  }
});

// A maqām/jins the tuning system cannot build must yield nothing at all. Before
// the buildability guard, the missing notes were silently filtered out and an
// interval pattern was derived from the survivors, producing transpositions of
// a maqām that does not exist in that tuning system.

test("a maqām the tuning system cannot build yields no transpositions", () => {
  const { pc, ajnas } = fixture();
  const maqamMustaar = getMaqamat().find((m) => m.getIdName() === "maqam_mustaar");
  if (!maqamMustaar) throw new Error("maqam_mustaar not found");

  // angloeuropean_1800 has every ascending note of mustaʿār but lacks nīm māhūr
  // from its descending sequence — exactly the partial-presence case.
  assert.equal(maqamMustaar.isMaqamPossible(pc.map((p) => p.noteName) as any), false, "fixture must not be able to build mustaʿār");
  assert.deepEqual(calculateMaqamTranspositions(pc, ajnas, maqamMustaar, true, 5), []);
  assert.deepEqual(calculateMaqamTranspositions(pc, ajnas, maqamMustaar, false, 5), []);
});

test("a jins the tuning system cannot build yields no transpositions", () => {
  const { pc, ajnas } = fixture();
  const noteNames = pc.map((p) => p.noteName) as any;
  const unbuildable = ajnas.filter((j) => !j.isJinsPossible(noteNames));
  assert.ok(unbuildable.length > 0, "fixture must contain at least one unbuildable jins");

  for (const jinsData of unbuildable) {
    assert.deepEqual(calculateJinsTranspositions(pc, jinsData, true, 5), [], `${jinsData.getName()} is not buildable here`);
  }
});
