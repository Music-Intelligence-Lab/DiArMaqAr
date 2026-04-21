import { test } from "node:test";
import assert from "node:assert/strict";
import { validateRulesFile, validateNoteNamesInScale } from "../validate.js";

test("validateRulesFile: accepts a minimal valid file", () => {
  const result = validateRulesFile({
    _meta: {
      classifier: { tuningSystem: "angloeuropean_1800", startingNote: "yegah" },
      description: "ok",
    },
    families: {
      rast: {
        displayName: "rāst",
        secondaryJinsDegree: ["nawā"],
        tertiaryJinsDegree: [],
        ghammazDegree: ["nawā"],
        notes: "",
      },
    },
  });
  assert.deepEqual(result, { ok: true });
});

test("validateRulesFile: rejects a missing _meta block", () => {
  const result = validateRulesFile({ families: {} });
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /_meta/);
});

test("validateRulesFile: rejects a missing classifier block", () => {
  const result = validateRulesFile({ _meta: {}, families: {} });
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /classifier/);
});

test("validateRulesFile: rejects a family with wrong field types", () => {
  const result = validateRulesFile({
    _meta: { classifier: { tuningSystem: "x", startingNote: "y" }, description: "" },
    families: {
      rast: {
        displayName: "rāst",
        secondaryJinsDegree: "nawā", // should be array or null
        tertiaryJinsDegree: [],
        ghammazDegree: ["nawā"],
        notes: "",
      },
    },
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /rast.*secondaryJinsDegree/);
});

test("validateRulesFile: accepts null for degree fields (no_jins case)", () => {
  const result = validateRulesFile({
    _meta: { classifier: { tuningSystem: "x", startingNote: "y" }, description: "" },
    families: {
      no_jins: {
        displayName: "no jins",
        secondaryJinsDegree: null,
        tertiaryJinsDegree: null,
        ghammazDegree: null,
        notes: "",
      },
    },
  });
  assert.deepEqual(result, { ok: true });
});

test("validateNoteNamesInScale: accepts note names present in the scale", () => {
  const result = validateNoteNamesInScale(["nawā"], ["rāst", "dūgāh", "nawā"]);
  assert.deepEqual(result, { ok: true });
});

test("validateNoteNamesInScale: rejects note names missing from the scale", () => {
  const result = validateNoteNamesInScale(["nawā", "ghost"], ["rāst", "dūgāh", "nawā"]);
  assert.equal(result.ok, false);
  if (!result.ok) assert.deepEqual(result.missing, ["ghost"]);
});

test("validateNoteNamesInScale: empty list is valid (nothing to check)", () => {
  const result = validateNoteNamesInScale([], ["rāst"]);
  assert.deepEqual(result, { ok: true });
});
