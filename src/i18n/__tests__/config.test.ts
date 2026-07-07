import { test } from "node:test";
import assert from "node:assert/strict";
import { locales, defaultLocale, isLocale, dir } from "@/i18n/config";

test("locales are exactly en, ar, fr", () => {
  assert.deepEqual([...locales], ["en", "ar", "fr"]);
});

test("defaultLocale is en", () => {
  assert.equal(defaultLocale, "en");
});

test("isLocale accepts supported locales and rejects others", () => {
  assert.equal(isLocale("en"), true);
  assert.equal(isLocale("ar"), true);
  assert.equal(isLocale("fr"), true);
  assert.equal(isLocale("de"), false);
  assert.equal(isLocale(""), false);
  assert.equal(isLocale("EN"), false);
});

test("dir is rtl only for ar", () => {
  assert.equal(dir("ar"), "rtl");
  assert.equal(dir("en"), "ltr");
  assert.equal(dir("fr"), "ltr");
});
