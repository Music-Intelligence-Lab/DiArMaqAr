import { test } from "node:test";
import assert from "node:assert/strict";
import { getTuningSystems } from "@/functions/import";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { octaveOneNoteNames, octaveTwoNoteNames } from "@/models/NoteName";

const O1 = octaveOneNoteNames.length;

/**
 * The archive's data is editable through the admin, so nothing here names a
 * tuning system or a note: every fixture is derived from whatever is in the
 * data at the time. A test that hard-codes a starting note starts failing the
 * moment someone renames it, which says nothing about this function.
 */
function fixture() {
  const ts = getTuningSystems().find((t) => t.getNoteNameSets().length > 0);
  if (!ts) throw new Error("no tuning system with a note-name set");
  return { ts, saved: ts.getNoteNameSets()[0], startingNotes: ts.getNoteNameSets().map((s) => s[0]) };
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
  const { ts, startingNotes } = fixture();
  const notAStartingNote = octaveOneNoteNames.find((n) => !startingNotes.includes(n));
  assert.ok(notAStartingNote, "octave one must have a note this system does not start on");

  assert.throws(() => getTuningSystemPitchClasses(ts, notAStartingNote!), /is not a starting note/);
});

test("an explicit note-name selection is used verbatim, without consulting the saved sets", () => {
  const { ts, saved } = fixture();
  const indices = saved.map((n) => indexOf(n));

  const fromSavedSet = getTuningSystemPitchClasses(ts, saved[0]);
  const fromIndices = getTuningSystemPitchClasses(ts, saved[0], [], 0, {}, indices);

  assert.ok(fromSavedSet.length > 0, "the saved set must produce pitch classes to compare against");
  assert.deepEqual(
    fromIndices.map((pc) => pc.noteName),
    fromSavedSet.map((pc) => pc.noteName),
    "the same selection expressed as indices must produce the same note names"
  );
});

test("a selection the tuning system has never been saved with is honoured, not rejected", () => {
  // What the admin does when it renames the notes of an existing tuning system:
  // the grid holds a set whose starting note matches nothing in the saved data.
  const { ts, saved } = fixture();
  const edited = saved.map((n) => indexOf(n) + 1);
  const editedFirst = octaveOneNoteNames[edited[0]];
  assert.ok(editedFirst, "the shifted starting note must still be an octave-one note");

  const pitchClasses = getTuningSystemPitchClasses(ts, editedFirst, [], 0, {}, edited);

  assert.ok(pitchClasses.length > 0, "editing the starting note must not wipe the pitch classes");
  const first = pitchClasses.find((pc) => pc.octave === 1 && pc.pitchClassIndex === 0);
  assert.ok(first, "the edited set must still have a first pitch class in octave one");
  assert.equal(first!.noteName, editedFirst);
  assert.notEqual(first!.noteName, saved[0], "the edited name must win over the saved one");
});

test("an unselected starting note still yields nothing, selection array or not", () => {
  const { ts, saved } = fixture();
  const blank = saved.map(() => -1);

  assert.deepEqual(getTuningSystemPitchClasses(ts, "none", [], 0, {}, blank), []);
  assert.deepEqual(getTuningSystemPitchClasses(ts, "", [], 0, {}, blank), []);
});
