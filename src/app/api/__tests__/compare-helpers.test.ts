import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveTuningSystemsParam } from "@/app/api/compare-helpers";

const ALL = ["ibnsina_1037", "alfarabi_950g", "alsabbagh_1954"];

test("'all' expands to every system id in order", () => {
  const r = resolveTuningSystemsParam("all", ALL);
  assert.deepEqual(r, { ok: true, ids: ALL });
});

test("'all' is case-insensitive and trimmed", () => {
  assert.deepEqual(resolveTuningSystemsParam("  ALL ", ALL), { ok: true, ids: ALL });
});

test("explicit list passes through, trimmed and empties dropped", () => {
  const r = resolveTuningSystemsParam("ibnsina_1037, alfarabi_950g ,", ALL);
  assert.deepEqual(r, { ok: true, ids: ["ibnsina_1037", "alfarabi_950g"] });
});

test("'all' mixed with other ids is rejected (exclusive sentinel)", () => {
  const r = resolveTuningSystemsParam("all,ibnsina_1037", ALL);
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.match(r.error, /tuningSystems/);
    assert.match(r.hint, /by itself|without 'all'/);
  }
});

test("'all' mixed regardless of case/position is rejected", () => {
  assert.equal(resolveTuningSystemsParam("ibnsina_1037,ALL", ALL).ok, false);
});
