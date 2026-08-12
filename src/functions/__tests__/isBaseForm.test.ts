import { test } from "node:test";
import assert from "node:assert/strict";
import { getMaqamat, getAjnas, getTuningSystems } from "@/functions/import";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { calculateJinsTranspositions, calculateMaqamTranspositions } from "@/functions/transpose";

function buildContext() {
  const ts = getTuningSystems().find((t) => t.getId() === "angloeuropean_1800");
  if (!ts) throw new Error("angloeuropean_1800 tuning system not found");
  const pitchClasses = getTuningSystemPitchClasses(ts, "yegāh" as any);
  const ajnas = getAjnas();
  const maqamat = getMaqamat();
  return { pitchClasses, ajnas, maqamat };
}

// isBaseForm exists because `transposition` cannot answer "which one is the
// tahlil?": a register shift is not taswir, so every octave sibling of the
// tahlil also carries transposition=false. These tests pin that distinction.

test("isBaseForm: exactly one jins transposition per jins is the base form", () => {
  const { pitchClasses, ajnas } = buildContext();
  const noteNames = pitchClasses.map((pc) => pc.noteName);
  let checked = 0;

  for (const jinsData of ajnas) {
    if (!jinsData.isJinsPossible(noteNames)) continue;
    const transpositions = calculateJinsTranspositions(pitchClasses, jinsData, true, 5);
    if (transpositions.length === 0) continue;
    checked++;

    const baseForms = transpositions.filter((t) => t.isBaseForm);
    assert.equal(baseForms.length, 1, `${jinsData.getName()} must have exactly one base form, got ${baseForms.length}`);
    assert.equal(baseForms[0], transpositions[0], `${jinsData.getName()}: the base form must be the tahlil returned first`);
    assert.equal(baseForms[0].transposition, false, `${jinsData.getName()}: the base form is never a taswir`);
    assert.equal(
      baseForms[0].jinsPitchClasses[0].noteName,
      jinsData.getNoteNames()[0],
      `${jinsData.getName()}: the base form must sit on the canonical first note`
    );
  }

  assert.ok(checked > 0, "expected at least one jins to be possible in this tuning system");
});

test("isBaseForm: octave siblings of the tahlil are not base forms", () => {
  const { pitchClasses, ajnas } = buildContext();
  const noteNames = pitchClasses.map((pc) => pc.noteName);
  let siblingsSeen = 0;

  for (const jinsData of ajnas) {
    if (!jinsData.isJinsPossible(noteNames)) continue;
    const transpositions = calculateJinsTranspositions(pitchClasses, jinsData, true, 5);
    // transposition=false covers the tahlil AND its register siblings; only the
    // first is the base form.
    const untransposed = transpositions.filter((t) => !t.transposition);
    for (const sibling of untransposed.slice(1)) {
      siblingsSeen++;
      assert.equal(sibling.isBaseForm, false, `${sibling.name} is an octave sibling, not the base form`);
    }
  }

  assert.ok(siblingsSeen > 0, "this tuning system must expose octave siblings for the test to mean anything");
});

test("isBaseForm: exactly one maqam transposition per maqam is the base form", () => {
  const { pitchClasses, ajnas, maqamat } = buildContext();
  const noteNames = pitchClasses.map((pc) => pc.noteName);
  let checked = 0;

  for (const maqamData of maqamat) {
    if (!maqamData.isMaqamPossible(noteNames)) continue;
    const transpositions = calculateMaqamTranspositions(pitchClasses, ajnas, maqamData, true, 5);
    if (transpositions.length === 0) continue;
    checked++;

    const baseForms = transpositions.filter((t) => t.isBaseForm);
    assert.equal(baseForms.length, 1, `${maqamData.getName()} must have exactly one base form, got ${baseForms.length}`);
    assert.equal(baseForms[0], transpositions[0], `${maqamData.getName()}: the base form must be the tahlil returned first`);
    assert.equal(baseForms[0].transposition, false, `${maqamData.getName()}: the base form is never a taswir`);

    for (const sibling of transpositions.filter((t) => !t.transposition).slice(1)) {
      assert.equal(sibling.isBaseForm, false, `${sibling.name} is an octave sibling, not the base form`);
    }
  }

  assert.ok(checked > 0, "expected at least one maqam to be possible in this tuning system");
});

test("isBaseForm: withTahlil=false yields no base form at all", () => {
  const { pitchClasses, ajnas, maqamat } = buildContext();
  const noteNames = pitchClasses.map((pc) => pc.noteName);

  for (const jinsData of ajnas) {
    if (!jinsData.isJinsPossible(noteNames)) continue;
    const transpositions = calculateJinsTranspositions(pitchClasses, jinsData, false, 5);
    assert.equal(transpositions.filter((t) => t.isBaseForm).length, 0, `${jinsData.getName()}: tahlil excluded, so no base form`);
  }

  for (const maqamData of maqamat) {
    if (!maqamData.isMaqamPossible(noteNames)) continue;
    const transpositions = calculateMaqamTranspositions(pitchClasses, ajnas, maqamData, false, 5);
    assert.equal(transpositions.filter((t) => t.isBaseForm).length, 0, `${maqamData.getName()}: tahlil excluded, so no base form`);
  }
});
