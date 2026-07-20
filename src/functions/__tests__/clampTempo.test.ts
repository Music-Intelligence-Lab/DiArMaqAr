import { test } from "node:test";
import assert from "node:assert/strict";
import clampTempo, { TEMPO_MIN, TEMPO_MAX } from "@/functions/clampTempo";

test("clampTempo passes through values inside the range", () => {
  assert.equal(clampTempo(120), 120);
  assert.equal(clampTempo(21), 21);
  assert.equal(clampTempo(299), 299);
});

test("clampTempo holds at the boundaries", () => {
  assert.equal(clampTempo(TEMPO_MIN), 20);
  assert.equal(clampTempo(TEMPO_MAX), 300);
});

test("clampTempo clamps values beyond the range", () => {
  assert.equal(clampTempo(19), 20);
  assert.equal(clampTempo(0), 20);
  assert.equal(clampTempo(-99), 20);
  assert.equal(clampTempo(301), 300);
  assert.equal(clampTempo(9999), 300);
});

test("clampTempo range constants are 20..300", () => {
  assert.equal(TEMPO_MIN, 20);
  assert.equal(TEMPO_MAX, 300);
});
