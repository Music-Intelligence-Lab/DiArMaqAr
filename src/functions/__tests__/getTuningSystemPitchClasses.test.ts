import { test } from "node:test";
import assert from "node:assert/strict";
import { getTuningSystems } from "@/functions/import";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { octaveOneNoteNames, octaveTwoNoteNames } from "@/models/NoteName";

const O1 = octaveOneNoteNames.length;

function tuningSystem(id: string) {
  const ts = getTuningSystems().find((t) => t.getId() === id);
  if (!ts) throw new Error(`tuning system ${id} not found`);
  return ts;
}

/** Combined octave-one/octave-two index, the encoding the admin grid stores. */
function indexOf(noteName: string) {
  const i1 = octaveOneNoteNames.indexOf(noteName as any);
  if (i1 >= 0) return i1;
  const i2 = octaveTwoNoteNames.indexOf(noteName as any);
  if (i2 >= 0) return O1 + i2;
  return -1;
}

test("a starting note that is not one of the tuning system's own sets throws", () => {
  const ts = tuningSystem("aldik_1926a");
  assert.deepEqual(
    ts.getNoteNameSets().map((s) => s[0]),
    ["yegāh"],
    "fixture assumes aldik_1926a defines yegāh only"
  );

  assert.throws(() => getTuningSystemPitchClasses(ts, "dūgāh" as any), /is not a starting note/);
});

test("an explicit note-name selection is used verbatim, without consulting the saved sets", () => {
  const ts = tuningSystem("aldik_1926a");
  const saved = ts.getNoteNameSets()[0];
  const indices = saved.map((n) => indexOf(n));

  const fromSavedSet = getTuningSystemPitchClasses(ts, "yegāh" as any);
  const fromIndices = getTuningSystemPitchClasses(ts, "yegāh" as any, [], 0, {}, indices);

  assert.deepEqual(
    fromIndices.map((pc) => pc.noteName),
    fromSavedSet.map((pc) => pc.noteName),
    "the same selection expressed as indices must produce the same note names"
  );
});

test("a selection the tuning system has never been saved with is honoured, not rejected", () => {
  // What the admin does when it renames the notes of an existing tuning system:
  // the grid holds a set whose starting note matches nothing in the saved data.
  const ts = tuningSystem("aldik_1926a");
  const saved = ts.getNoteNameSets()[0];
  const edited = saved.map((n) => indexOf(n) + 1);

  const pitchClasses = getTuningSystemPitchClasses(ts, octaveOneNoteNames[edited[0]] as any, [], 0, {}, edited);

  assert.ok(pitchClasses.length > 0, "editing the starting note must not wipe the pitch classes");
  const first = pitchClasses.find((pc) => pc.octave === 1 && pc.pitchClassIndex === 0);
  assert.ok(first, "the edited set must still have a first pitch class in octave one");
  assert.equal(first!.noteName, octaveOneNoteNames[edited[0]]);
  assert.notEqual(first!.noteName, saved[0], "the edited name must win over the saved one");
});

test("an unselected starting note still yields nothing, selection array or not", () => {
  const ts = tuningSystem("aldik_1926a");
  const blank = ts.getNoteNameSets()[0].map(() => -1);

  assert.deepEqual(getTuningSystemPitchClasses(ts, "none" as any, [], 0, {}, blank), []);
  assert.deepEqual(getTuningSystemPitchClasses(ts, "" as any, [], 0, {}, blank), []);
});
