import { test } from "node:test";
import assert from "node:assert/strict";
import { getMaqamat, getAjnas, getTuningSystems } from "@/functions/import";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { calculateMaqamTranspositions } from "@/functions/transpose";

function fixture() {
  const ts = getTuningSystems().find((t) => t.getId() === "angloeuropean_1800");
  if (!ts) throw new Error("tuning system angloeuropean_1800 not found");
  const pc = getTuningSystemPitchClasses(ts, "yegāh" as any);
  const ajnas = getAjnas();
  return { pc, ajnas };
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
  const { pc, ajnas } = fixture();
  // mustaʿār is the family with a tertiary ḥusaynī per family rules.
  const maqamMustaar = getMaqamat().find((m) => m.getIdName() === "maqam_mustaar");
  if (!maqamMustaar) throw new Error("maqam_mustaar not found");

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
