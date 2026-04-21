import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeMaqam, type MergeInput } from "../merge.js";
import type { FamilyRule } from "../validate.js";

const rastRule: FamilyRule = {
  displayName: "rāst",
  secondaryJinsDegree: ["nawā"],
  tertiaryJinsDegree: [],
  ghammazDegree: ["nawā"],
  notes: "",
};

const noJinsRule: FamilyRule = {
  displayName: "no jins",
  secondaryJinsDegree: null,
  tertiaryJinsDegree: null,
  ghammazDegree: null,
  notes: "",
};

test("mergeMaqam: sets primaryJinsDegree from ascending[0] when absent", () => {
  const input: MergeInput = {
    maqam: {
      idName: "maqam_rast",
      ascendingNoteNames: ["rāst", "dūgāh", "nawā"],
    },
    familyIdName: "rast",
    rule: rastRule,
  };
  const { updated } = mergeMaqam(input);
  assert.deepEqual(updated.primaryJinsDegree, ["rāst"]);
});

test("mergeMaqam: applies family rule to null secondaryJinsDegree", () => {
  const input: MergeInput = {
    maqam: {
      idName: "maqam_rast",
      ascendingNoteNames: ["rāst", "dūgāh", "nawā"],
      secondaryJinsDegree: null,
    },
    familyIdName: "rast",
    rule: rastRule,
  };
  const { updated } = mergeMaqam(input);
  assert.deepEqual(updated.secondaryJinsDegree, ["nawā"]);
});

test("mergeMaqam: leaves already-set secondaryJinsDegree untouched (override)", () => {
  const input: MergeInput = {
    maqam: {
      idName: "maqam_rast",
      ascendingNoteNames: ["rāst", "dūgāh", "nawā", "ḥusaynī"],
      secondaryJinsDegree: ["ḥusaynī"],
    },
    familyIdName: "rast",
    rule: rastRule,
  };
  const { updated, log } = mergeMaqam(input);
  assert.deepEqual(updated.secondaryJinsDegree, ["ḥusaynī"]);
  assert.ok(log.skippedFields.includes("secondaryJinsDegree"));
});

test("mergeMaqam: empty tertiary array in rule writes nothing", () => {
  const input: MergeInput = {
    maqam: {
      idName: "maqam_rast",
      ascendingNoteNames: ["rāst", "dūgāh", "nawā"],
    },
    familyIdName: "rast",
    rule: rastRule,
  };
  const { updated } = mergeMaqam(input);
  assert.equal(updated.tertiaryJinsDegree, null);
});

test("mergeMaqam: no_jins leaves secondary/tertiary/ghammaz as null", () => {
  const input: MergeInput = {
    maqam: {
      idName: "maqam_x",
      ascendingNoteNames: ["a", "b", "c"],
    },
    familyIdName: "no_jins",
    rule: noJinsRule,
  };
  const { updated, log } = mergeMaqam(input);
  assert.deepEqual(updated.primaryJinsDegree, ["a"]);
  assert.equal(updated.secondaryJinsDegree, null);
  assert.equal(updated.tertiaryJinsDegree, null);
  assert.equal(updated.ghammaz, null);
  assert.equal(log.category, "no_jins");
});

test("mergeMaqam: unknown family (no rule) leaves secondary/tertiary/ghammaz as null", () => {
  const input: MergeInput = {
    maqam: {
      idName: "maqam_x",
      ascendingNoteNames: ["a", "b"],
    },
    familyIdName: "mystery",
    rule: null,
  };
  const { updated, log } = mergeMaqam(input);
  assert.deepEqual(updated.primaryJinsDegree, ["a"]);
  assert.equal(updated.secondaryJinsDegree, null);
  assert.equal(log.category, "unknown_family");
});

test("mergeMaqam: ghammazDegree rule maps to ghammaz field", () => {
  const input: MergeInput = {
    maqam: {
      idName: "maqam_rast",
      ascendingNoteNames: ["rāst", "nawā"],
    },
    familyIdName: "rast",
    rule: rastRule,
  };
  const { updated } = mergeMaqam(input);
  assert.deepEqual(updated.ghammaz, ["nawā"]);
});

test("mergeMaqam: validation error when rule references a note not in scale", () => {
  const input: MergeInput = {
    maqam: {
      idName: "maqam_rast",
      ascendingNoteNames: ["rāst", "dūgāh"], // no "nawā"
    },
    familyIdName: "rast",
    rule: rastRule,
  };
  const { log } = mergeMaqam(input);
  assert.equal(log.category, "validation_error");
  assert.ok(log.validationErrors);
  assert.ok(log.validationErrors.some((e) => e.field === "secondaryJinsDegree"));
});
