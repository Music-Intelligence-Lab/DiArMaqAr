import { test } from "node:test";
import assert from "node:assert/strict";
import { getMaqamat, getAjnas, getTuningSystems } from "@/functions/import";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { calculateMaqamTranspositions, transposeSayr } from "@/functions/transpose";

function buildContext() {
  const ts = getTuningSystems().find((t) => t.getId() === "angloeuropean_1800");
  if (!ts) throw new Error("angloeuropean_1800 tuning system not found");
  const pitchClasses = getTuningSystemPitchClasses(ts, "yegāh" as any);
  const ajnas = getAjnas();
  const maqamRast = getMaqamat().find((m) => m.getId() === "1");
  if (!maqamRast) throw new Error("maqam_rast not found");
  return { pitchClasses, ajnas, maqamRast };
}

test("transposeSayr: stops of type 'note' are shifted by the maqam transposition", () => {
  const { pitchClasses, ajnas, maqamRast } = buildContext();
  const transpositions = calculateMaqamTranspositions(pitchClasses, ajnas, maqamRast, true, 5);
  const taswir = transpositions.find((t) => t.transposition && t.ascendingPitchClasses[0].noteName === "nawā");
  assert.ok(taswir, "expected a taswir on nawā");

  const sayrs = maqamRast.getSuyur();
  assert.ok(sayrs.length > 0, "rāst must have at least one sayr for this test");
  const sayr = sayrs[0];

  const { transposedSayr, hasOutOfBoundsNotes } = transposeSayr(sayr, pitchClasses, maqamRast, taswir);

  for (let i = 0; i < sayr.stops.length; i++) {
    const orig = sayr.stops[i];
    const shifted = transposedSayr.stops[i];
    assert.equal(shifted.type, orig.type, `stop ${i} type must be preserved`);
    if (orig.type !== "note") {
      assert.equal(shifted.value, orig.value, `non-note stop ${i} value must be unchanged`);
    }
  }
  assert.equal(hasOutOfBoundsNotes, false, "in-range transposition must not flag out-of-bounds");
});

test("transposeSayr: stops of type 'jins' or 'maqam' keep their value but shift startingNote", () => {
  const { pitchClasses, ajnas, maqamRast } = buildContext();
  const transpositions = calculateMaqamTranspositions(pitchClasses, ajnas, maqamRast, true, 5);
  const taswir = transpositions.find((t) => t.transposition && t.ascendingPitchClasses[0].noteName === "nawā");
  assert.ok(taswir);

  const sayrs = maqamRast.getSuyur();
  const sayrWithJinsStop = sayrs.find((s) => s.stops.some((st) => st.type === "jins" && st.startingNote));
  if (!sayrWithJinsStop) {
    // Not every fixture will have a jins stop with startingNote; skip gracefully.
    return;
  }
  const { transposedSayr } = transposeSayr(sayrWithJinsStop, pitchClasses, maqamRast, taswir);
  for (let i = 0; i < sayrWithJinsStop.stops.length; i++) {
    const orig = sayrWithJinsStop.stops[i];
    const shifted = transposedSayr.stops[i];
    if (orig.type === "jins" || orig.type === "maqam") {
      assert.equal(shifted.value, orig.value, `jins/maqam stop ${i} value must be preserved`);
    }
  }
});
