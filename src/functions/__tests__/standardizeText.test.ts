import { test } from "node:test";
import assert from "node:assert/strict";
import { createEntityToken, createEntityTokenFromName, entityToken, standardizeText, TONIC_SEPARATOR } from "@/functions/export";
import { getMaqamat, getAjnas, getTuningSystems } from "@/functions/import";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { calculateMaqamTranspositions } from "@/functions/transpose";
import { allNotes } from "@/models/NoteName";

/** Every display name and note name the archive holds. */
function allDisplayNames(): string[] {
  const names: string[] = [];

  for (const maqam of getMaqamat()) {
    names.push(maqam.getName(), ...maqam.getAscendingNoteNames(), ...maqam.getDescendingNoteNames());
  }
  for (const jins of getAjnas()) {
    names.push(jins.getName(), ...jins.getNoteNames());
  }
  for (const tuningSystem of getTuningSystems()) {
    for (const set of tuningSystem.getNoteNameSets()) names.push(...set);
  }
  names.push(...allNotes);

  return [...new Set(names.filter(Boolean))];
}

test("standardizeText: output is URL-safe and one double-clickable word", () => {
  for (const name of allDisplayNames()) {
    assert.match(standardizeText(name), /^[a-z0-9_]*$/, `${name} standardizes to a form needing encoding`);
  }
});

test("standardizeText: is idempotent, so a parsed identifier re-standardizes to itself", () => {
  for (const name of allDisplayNames()) {
    const once = standardizeText(name);
    assert.equal(standardizeText(once), once, `${name} is not stable under a second pass`);
  }
});

test("standardizeText: brackets, slashes and the article's hyphen all close up", () => {
  assert.equal(standardizeText("maqām ḥiṣār (ʿAbbās)"), "maqam_hisar_abbas");
  assert.equal(standardizeText("maqām rāst (al-Ṣabbāgh)"), "maqam_rast_alsabbagh");
  assert.equal(standardizeText("maqām ʿajam/ʿajam murassaʿ"), "maqam_ajam_ajam_murassa");
  assert.equal(standardizeText("maqām ḥijāz kār (al-Ṣabbāgh/ʿAbbās)"), "maqam_hijaz_kar_alsabbagh_abbas");
});

test("standardizeText: no identifier contains 'al' as a word, so the tonic separator is unambiguous", () => {
  for (const name of allDisplayNames()) {
    assert.ok(!standardizeText(name).split("_").includes("al"), `${name} would collide with the tonic separator`);
  }
});

test("idNames stay distinct once brackets and slashes are folded away", () => {
  for (const [label, idNames] of [
    ["maqamat", getMaqamat().map((m) => m.getIdName())],
    ["ajnas", getAjnas().map((j) => j.getIdName())],
  ] as const) {
    assert.equal(new Set(idNames).size, idNames.length, `${label} idNames collide`);
  }
});

test("createEntityToken: the taḥlīl is the bare idName, a transposition names its tonic", () => {
  assert.equal(createEntityToken("maqam_rast"), "maqam_rast");
  assert.equal(createEntityToken("maqam_rast", "nawā"), "maqam_rast_al_nawa");
  assert.equal(createEntityToken("maqam_hijaz_kar_alsabbagh_abbas", "qarār dūgāh"), "maqam_hijaz_kar_alsabbagh_abbas_al_qarar_dugah");
});

test("createEntityToken: the tonic survives a round trip through the separator", () => {
  for (const maqam of getMaqamat()) {
    for (const tonic of allNotes) {
      const token = createEntityToken(maqam.getIdName(), tonic);
      const separatorIndex = token.indexOf(TONIC_SEPARATOR);

      assert.notEqual(separatorIndex, -1, `${token} lost its separator`);
      assert.equal(token.slice(0, separatorIndex), maqam.getIdName(), `${token} does not split back to its idName`);
      assert.equal(token.slice(separatorIndex + TONIC_SEPARATOR.length), standardizeText(tonic), `${token} does not split back to its tonic`);
    }
  }
});

test("entityToken: a rendered taḥlīl names itself exactly as its own idName", () => {
  // Every swept call site derives the identifier from a rendered entity's
  // display name. If the suffix strip ever bit into a base name, the API would
  // emit an idName no route resolves — so assert the two agree everywhere.
  for (const maqam of getMaqamat()) {
    const tonic = maqam.getAscendingNoteNames()[0];
    if (!tonic) continue;
    assert.equal(createEntityTokenFromName(maqam.getName(), tonic), maqam.getIdName(), `${maqam.getName()} does not name itself`);
  }
  for (const jins of getAjnas()) {
    const tonic = jins.getNoteNames()[0];
    if (!tonic) continue;
    assert.equal(createEntityTokenFromName(jins.getName(), tonic), jins.getIdName(), `${jins.getName()} does not name itself`);
  }
});

test("entityToken: a real transposition names its base idName plus its tonic", () => {
  const tuningSystem = getTuningSystems().find((t) => t.getId() === "allami_2025");
  if (!tuningSystem) throw new Error("allami_2025 tuning system not found");
  const pitchClasses = getTuningSystemPitchClasses(tuningSystem, "rāst" as never);
  const ajnas = getAjnas();

  let checked = 0;
  for (const maqamData of getMaqamat()) {
    for (const transposition of calculateMaqamTranspositions(pitchClasses, ajnas, maqamData, true, 5)) {
      const tonic = transposition.ascendingPitchClasses[0].noteName;
      const token = entityToken(transposition);

      // The taḥlīl carries no tonic in its name, so it is the bare idName.
      const expected = transposition.name === maqamData.getName() ? maqamData.getIdName() : createEntityToken(maqamData.getIdName(), tonic);
      assert.equal(token, expected, `${transposition.name} is not named canonically`);

      // The property the URL and every API response depend on: whatever is
      // emitted splits back to the maqām it came from.
      assert.equal(token.split(TONIC_SEPARATOR)[0], maqamData.getIdName(), `${token} does not resolve back to its maqām`);
      checked++;
    }
  }

  assert.ok(checked > 0, "no transpositions were checked");
});

test("createEntityTokenFromName: strips the transposition suffix without cutting into the article", () => {
  // The tonic of the taḥlīl is not part of its name, so nothing is stripped.
  assert.equal(createEntityTokenFromName("maqām rāḥat al-arwāḥ", "ʿirāq"), "maqam_rahat_alarwah");
  // Transposed, the same maqām keeps its whole name and gains a tonic.
  assert.equal(createEntityTokenFromName("maqām rāḥat al-arwāḥ al-nawā", "nawā"), "maqam_rahat_alarwah_al_nawa");
  assert.equal(createEntityTokenFromName("maqām rāst", "rāst"), "maqam_rast");
  assert.equal(createEntityTokenFromName("maqām rāst al-nawā", "nawā"), "maqam_rast_al_nawa");
});
