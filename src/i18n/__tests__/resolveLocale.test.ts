import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveLocale } from "@/middleware";

test("resolveLocale picks the first supported locale from Accept-Language", () => {
  assert.equal(resolveLocale("ar-EG,ar;q=0.9,en;q=0.8"), "ar");
  assert.equal(resolveLocale("fr-FR,fr;q=0.9"), "fr");
  assert.equal(resolveLocale("en-US,en;q=0.9"), "en");
});

test("resolveLocale skips unsupported languages to find a supported one", () => {
  assert.equal(resolveLocale("de-DE,de;q=0.9,fr;q=0.5"), "fr");
});

test("resolveLocale falls back to default (en) when none match or header empty", () => {
  assert.equal(resolveLocale("de-DE,es;q=0.9"), "en");
  assert.equal(resolveLocale(""), "en");
});
