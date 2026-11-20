"use client";

import React, { useEffect, useRef, useState } from "react";
import useLanguageContext from "@/contexts/language-context";
import { SourceOud, SourceOudAttribution, SourceOudFret, SourceOudString } from "@/models/SourceOud";
import { Source } from "@/models/bibliography/Source";
import PageReferenceChips from "./page-reference-chips";

/** The ʿūd being edited: who gives the strings and the frets may not be chosen yet. */
type Attribution = SourceOudAttribution | "";
type DraftOud = Omit<SourceOud, "stringsAttribution" | "fretsAttribution"> & { stringsAttribution: Attribution; fretsAttribution: Attribution };

const RATIO = /^[1-9]\d*\/[1-9]\d*$/;

/** An ASCII key from a transliterated name: "wusṭā fārisiyya" → "wusta_farisiyya". */
function slug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[ʿʾ'’]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function uniqueId(base: string, taken: string[]): string {
  const root = base || "item";
  let id = root;
  for (let n = 2; taken.includes(id); n++) id = `${root}_${n}`;
  return id;
}

/** Why the draft cannot become the ʿūd yet, or null when it can. */
function problemOf(draft: DraftOud, t: (key: string) => string): string | null {
  if (!draft.strings.length) return t("sourceOud.needsString");
  if (!draft.frets.length) return t("sourceOud.needsFret");
  if (draft.pageReferences.some((ref) => !ref.sourceId)) return t("sourceOud.needsSource");
  if (!draft.stringsAttribution) return t("sourceOud.needsAttribution").replace("{item}", t("sourceOud.strings"));
  if (!draft.fretsAttribution) return t("sourceOud.needsAttribution").replace("{item}", t("sourceOud.frets"));
  for (const item of [...draft.strings, ...draft.frets]) {
    const ratio = "openRatio" in item ? item.openRatio : item.ratio;
    const label = item.nameEnglish || item.id;
    if (!item.nameEnglish.trim() || !item.nameArabic.trim()) return t("sourceOud.needsNames").replace("{item}", label);
    if (!RATIO.test(ratio.trim())) return t("sourceOud.needsRatio").replace("{item}", label).replace("{value}", ratio);
  }
  return null;
}

/**
 * The admin editor for the ʿūd a tuning system's source describes: its strings
 * with their names and open ratios, its frets with their names and ratios, who
 * gives the strings and who gives the frets, and where the whole ʿūd is given. A string or fret keeps every field this editor
 * does not show (the construction quotes, which strings carry which frets), and
 * keeps its id; only a new one is given an id, from its English name.
 *
 * The draft becomes the live ʿūd (shown in the strings view and saved) only
 * while every field reads; until then the problem is shown and the tuning system
 * cannot be saved (onValidityChange).
 */
export default function SourceOudEditor({
  sourceOud,
  onChange,
  onValidityChange,
  sources,
}: {
  sourceOud: SourceOud | null;
  onChange: (sourceOud: SourceOud | null) => void;
  onValidityChange: (valid: boolean) => void;
  sources: Source[];
}) {
  const { t } = useLanguageContext();
  const [draft, setDraft] = useState<DraftOud | null>(sourceOud);
  /** Ids given in this session, which may still follow their English name */
  const newIds = useRef(new Set<string>());

  const problem = draft ? problemOf(draft, t) : null;
  useEffect(() => onValidityChange(!problem), [problem]);

  function commit(next: DraftOud | null) {
    setDraft(next);
    if (!next) return onChange(null);
    if (!problemOf(next, t)) onChange(next as SourceOud);
  }

  if (!draft) {
    return (
      <div className="source-oud-editor">
        <button type="button" className="source-oud-editor__add" onClick={() => commit({ strings: [], frets: [], pageReferences: [], stringsAttribution: "", fretsAttribution: "", noteEnglish: "", noteArabic: "" })}>
          {t("sourceOud.add")}
        </button>
      </div>
    );
  }

  const allIds = () => [...draft.strings.map((s) => s.id), ...draft.frets.map((f) => f.id)];

  function updateString(index: number, change: Partial<SourceOudString>) {
    const strings = [...draft!.strings];
    const before = strings[index];
    const next = { ...before, ...change };
    if (change.nameEnglish !== undefined && newIds.current.has(before.id)) {
      newIds.current.delete(before.id);
      next.id = uniqueId(slug(change.nameEnglish), allIds().filter((id) => id !== before.id));
      newIds.current.add(next.id);
    }
    strings[index] = next;
    commit({ ...draft!, strings });
  }

  function updateFret(index: number, change: Partial<SourceOudFret>) {
    const frets = [...draft!.frets];
    const before = frets[index];
    const next = { ...before, ...change };
    let strings = draft!.strings;
    if (change.nameEnglish !== undefined && newIds.current.has(before.id)) {
      newIds.current.delete(before.id);
      next.id = uniqueId(slug(change.nameEnglish), allIds().filter((id) => id !== before.id));
      newIds.current.add(next.id);
      strings = strings.map((s) => (s.frets ? { ...s, frets: s.frets.map((id) => (id === before.id ? next.id : id)) } : s));
    }
    frets[index] = next;
    commit({ ...draft!, strings, frets });
  }

  function addString() {
    const id = uniqueId("string", allIds());
    newIds.current.add(id);
    commit({ ...draft!, strings: [...draft!.strings, { id, nameEnglish: "", nameArabic: "", openRatio: "" }] });
  }

  function addFret() {
    const id = uniqueId("fret", allIds());
    newIds.current.add(id);
    commit({
      ...draft!,
      frets: [...draft!.frets, { id, nameEnglish: "", nameArabic: "", ratio: "", constructionEnglish: "", constructionArabic: "" }],
    });
  }

  function removeFret(index: number) {
    const id = draft!.frets[index].id;
    commit({
      ...draft!,
      frets: draft!.frets.filter((_, i) => i !== index),
      strings: draft!.strings.map((s) => (s.frets ? { ...s, frets: s.frets.filter((f) => f !== id) } : s)),
    });
  }

  /** One table row's last cell: remove */
  const removeCell = (remove: () => void, removeLabel: string) => (
    <td>
      <button type="button" className="source-oud-editor__remove" aria-label={removeLabel} title={removeLabel} onClick={remove}>
        ×
      </button>
    </td>
  );

  /** Who gives the strings, or the frets: one choice for the whole group */
  const givenBy = (value: Attribution, onChange: (next: Attribution) => void) => (
    <label className="source-oud-editor__given-by">
      {t("sourceOud.attribution")}
      <select className="source-oud-editor__field" value={value} onChange={(e) => onChange(e.target.value as Attribution)}>
        <option value="">{t("sourceOud.chooseAttribution")}</option>
        <option value="source">{t("sourceOud.attributionSource")}</option>
        <option value="secondary">{t("sourceOud.attributionSecondary")}</option>
      </select>
    </label>
  );

  const head = (ratioLabel: string) => (
    <thead>
      <tr>
        <th>{t("sourceOud.nameEnglish")}</th>
        <th>{t("sourceOud.nameArabic")}</th>
        <th>{ratioLabel}</th>
        <th />
      </tr>
    </thead>
  );

  return (
    <div className="source-oud-editor">
      <div className="tuning-system-manager__input-container">
        <span className="tuning-system-manager__label">{t("adminSection.references")}</span>
        <PageReferenceChips references={draft.pageReferences} sources={sources} onChange={(pageReferences) => commit({ ...draft, pageReferences })} />
      </div>

      <div className="source-oud-editor__group-head">
        <h4 className="source-oud-editor__subheading">{t("sourceOud.strings")}</h4>
        {givenBy(draft.stringsAttribution, (stringsAttribution) => commit({ ...draft, stringsAttribution }))}
      </div>
      <table className="source-oud-editor__table">
        {head(t("sourceOud.openRatio"))}
        <tbody>
          {draft.strings.map((string, i) => (
            <tr key={i}>
              <td>
                <input className="source-oud-editor__field" value={string.nameEnglish} onChange={(e) => updateString(i, { nameEnglish: e.target.value })} />
              </td>
              <td>
                <input className="source-oud-editor__field" dir="rtl" value={string.nameArabic} onChange={(e) => updateString(i, { nameArabic: e.target.value })} />
              </td>
              <td>
                <input className="source-oud-editor__field" value={string.openRatio} onChange={(e) => updateString(i, { openRatio: e.target.value })} />
              </td>
              {removeCell(() => commit({ ...draft, strings: draft.strings.filter((_, j) => j !== i) }), t("sourceOud.removeString"))}
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="source-oud-editor__add" onClick={addString}>
        {t("sourceOud.addString")}
      </button>

      <div className="source-oud-editor__group-head">
        <h4 className="source-oud-editor__subheading">{t("sourceOud.frets")}</h4>
        {givenBy(draft.fretsAttribution, (fretsAttribution) => commit({ ...draft, fretsAttribution }))}
      </div>
      <table className="source-oud-editor__table">
        {head(t("sourceOud.fretRatio"))}
        <tbody>
          {draft.frets.map((fret, i) => (
            <tr key={i}>
              <td>
                <input className="source-oud-editor__field" value={fret.nameEnglish} onChange={(e) => updateFret(i, { nameEnglish: e.target.value })} />
              </td>
              <td>
                <input className="source-oud-editor__field" dir="rtl" value={fret.nameArabic} onChange={(e) => updateFret(i, { nameArabic: e.target.value })} />
              </td>
              <td>
                <input className="source-oud-editor__field" value={fret.ratio} onChange={(e) => updateFret(i, { ratio: e.target.value })} />
              </td>
              {removeCell(() => removeFret(i), t("sourceOud.removeFret"))}
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="source-oud-editor__add" onClick={addFret}>
        {t("sourceOud.addFret")}
      </button>

      <div className="tuning-system-manager__group source-oud-editor__notes">
        <div className="tuning-system-manager__input-container">
          <label className="tuning-system-manager__label">{t("sourceOud.noteEnglish")}</label>
          <textarea className="tuning-system-manager__input" rows={3} value={draft.noteEnglish} onChange={(e) => commit({ ...draft, noteEnglish: e.target.value })} />
        </div>
        <div className="tuning-system-manager__input-container">
          <label className="tuning-system-manager__label">{t("sourceOud.noteArabic")}</label>
          <textarea className="tuning-system-manager__input" rows={3} dir="rtl" value={draft.noteArabic} onChange={(e) => commit({ ...draft, noteArabic: e.target.value })} />
        </div>
      </div>

      {problem && (
        <p className="tuning-system-manager__save-error" role="alert">
          {problem}
        </p>
      )}
      <button type="button" className="source-oud-editor__remove-all" onClick={() => commit(null)}>
        {t("sourceOud.remove")}
      </button>
    </div>
  );
}
