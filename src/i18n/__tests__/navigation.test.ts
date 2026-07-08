import { test } from "node:test";
import assert from "node:assert/strict";
import { localizedHref, stripLocale } from "@/i18n/navigation";

test("localizedHref prefixes internal page paths", () => {
  assert.equal(localizedHref("/app", "ar"), "/ar/app");
  assert.equal(localizedHref("/about", "en"), "/en/about");
  assert.equal(localizedHref("/", "fr"), "/fr");
});

test("localizedHref preserves query and hash", () => {
  assert.equal(localizedHref("/bibliography?source=123", "fr"), "/fr/bibliography?source=123");
  assert.equal(localizedHref("/about#team", "ar"), "/ar/about#team");
});

test("localizedHref leaves /api and /docs untouched", () => {
  assert.equal(localizedHref("/docs/", "ar"), "/docs/");
  assert.equal(localizedHref("/docs/api/", "fr"), "/docs/api/");
  assert.equal(localizedHref("/api/maqamat", "en"), "/api/maqamat");
});

test("localizedHref leaves external, hash-only, and non-slash hrefs untouched", () => {
  assert.equal(localizedHref("https://example.com", "ar"), "https://example.com");
  assert.equal(localizedHref("mailto:a@b.com", "ar"), "mailto:a@b.com");
  assert.equal(localizedHref("#section", "ar"), "#section");
});

test("stripLocale removes a leading supported locale", () => {
  assert.equal(stripLocale("/en"), "/");
  assert.equal(stripLocale("/ar"), "/");
  assert.equal(stripLocale("/en/app"), "/app");
  assert.equal(stripLocale("/ar/bibliography"), "/bibliography");
});

test("stripLocale leaves paths without a leading locale unchanged", () => {
  assert.equal(stripLocale("/"), "/");
  assert.equal(stripLocale("/app"), "/app");
  assert.equal(stripLocale("/enormous"), "/enormous"); // not a locale boundary
});
