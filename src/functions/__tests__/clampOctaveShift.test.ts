import { test } from "node:test";
import assert from "node:assert/strict";
import clampOctaveShift, { OCTAVE_SHIFT_MIN, OCTAVE_SHIFT_MAX } from "@/functions/clampOctaveShift";

test("clampOctaveShift passes through values inside the range", () => {
  assert.equal(clampOctaveShift(0), 0);
  assert.equal(clampOctaveShift(1), 1);
  assert.equal(clampOctaveShift(-2), -2);
});

test("clampOctaveShift holds at the boundaries", () => {
  assert.equal(clampOctaveShift(OCTAVE_SHIFT_MAX), 3);
  assert.equal(clampOctaveShift(OCTAVE_SHIFT_MIN), -3);
});

test("clampOctaveShift clamps values beyond the range", () => {
  assert.equal(clampOctaveShift(4), 3);
  assert.equal(clampOctaveShift(99), 3);
  assert.equal(clampOctaveShift(-4), -3);
  assert.equal(clampOctaveShift(-99), -3);
});

test("clampOctaveShift range constants are -3..3", () => {
  assert.equal(OCTAVE_SHIFT_MIN, -3);
  assert.equal(OCTAVE_SHIFT_MAX, 3);
});
