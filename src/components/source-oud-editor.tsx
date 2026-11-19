"use client";

import React, { useEffect, useRef, useState } from "react";
import useLanguageContext from "@/contexts/language-context";
import { SourceOud, SourceOudAttribution, SourceOudFret, SourceOudString } from "@/models/SourceOud";
import { Source, SourcePageReference } from "@/models/bibliography/Source";
import { compareNormalized } from "@/functions/normalizeForSort";

/** An item being edited: its attribution may not be chosen yet. */
type Draft<T> = Omit<T, "attribution"> & { attribution: SourceOudAttribution | "" };
type DraftOud = Omit<SourceOud, "strings" | "frets"> & { strings: Draft<SourceOudString>[]; frets: Draft<SourceOudFret>[] };

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
  for (const item of [...draft.strings, ...draft.frets]) {
    const ratio = "openRatio" in item ? item.openRatio : item.ratio;
    const label = item.nameEnglish || item.id;
    if (!item.nameEnglish.trim() || !item.nameArabic.trim()) return t("sourceOud.needsNames").replace("{item}", label);
    if (!RATIO.test(ratio.trim())) return t("sourceOud.needsRatio").replace("{item}", label).replace("{value}", ratio);
    if (!item.attribution) return t("sourceOud.needsAttribution").replace("{item}", label);
    if (item.pageReferences.some((ref) => !ref.sourceId)) return t("sourceOud.needsSource").replace("{item}", label);
  }
  return null;
}

/**
 * The admin editor for the ʿūd a tuning system's source describes: its strings
 * with their names and open ratios, its frets with their names and ratios, who
 * gives each one, and where. A string or fret keeps every field this editor
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
        <h3 className="source-oud-editor__heading">{t("sourceOud.heading")}</h3>
        <button type="button" className="tuning-system-manager__source-add-button" onClick={() => commit({ strings: [], frets: [], noteEnglish: "", noteArabic: "" })}>
          {t("sourceOud.add")}
        </button>
      </div>
    );
  }

  const allIds = () => [...draft.strings.map((s) => s.id), ...draft.frets.map((f) => f.id)];

  function updateString(index: number, change: Partial<Draft<SourceOudString>>) {
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

  function updateFret(index: number, change: Partial<Draft<SourceOudFret>>) {
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
    commit({ ...draft!, strings: [...draft!.strings, { id, nameEnglish: "", nameArabic: "", openRatio: "", attribution: "", pageReferences: [] }] });
  }

  function addFret() {
    const id = uniqueId("fret", allIds());
    newIds.current.add(id);
    commit({
      ...draft!,
      frets: [...draft!.frets, { id, nameEnglish: "", nameArabic: "", ratio: "", constructionEnglish: "", constructionArabic: "", attribution: "", pageReferences: [] }],
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

  const sortedSources = [...sources].sort((a, b) => compareNormalized(a.getTitleEnglish(), b.getTitleEnglish()));

  /** Attribution and page references, the same for strings and frets */
  const provenance = (item: Draft<SourceOudString> | Draft<SourceOudFret>, update: (change: { attribution?: SourceOudAttribution | ""; pageReferences?: SourcePageReference[] }) => void) => (
    <>
      <select
        className="tuning-system-manager__source-select"
        value={item.attribution}
        aria-label={t("sourceOud.attribution")}
        onChange={(e) => update({ attribution: e.target.value as SourceOudAttribution | "" })}
      >
        <option value="">{t("sourceOud.attribution")}</option>
        <option value="source">{t("sourceOud.attributionSource")}</option>
        <option value="secondary">{t("sourceOud.attributionSecondary")}</option>
      </select>
      {item.pageReferences.map((ref, r) => (
        <span key={r} className="source-oud-editor__reference">
          <select
            className="tuning-system-manager__source-select"
            value={ref.sourceId}
            onChange={(e) => update({ pageReferences: item.pageReferences.map((x, i) => (i === r ? { ...x, sourceId: e.target.value } : x)) })}
          >
            <option value="">{t("tuningSystem.selectSource")}</option>
            {sortedSources.map((s) => (
              <option key={s.getId()} value={s.getId()}>
                {s.getTitleEnglish()}
              </option>
            ))}
          </select>
          <input
            className="tuning-system-manager__source-input"
            type="text"
            value={ref.page}
            placeholder={t("tuningSystem.page")}
            onChange={(e) => update({ pageReferences: item.pageReferences.map((x, i) => (i === r ? { ...x, page: e.target.value } : x)) })}
          />
          <button type="button" className="jins-manager__source-delete-button" onClick={() => update({ pageReferences: item.pageReferences.filter((_, i) => i !== r) })}>
            {t("tuningSystem.delete")}
          </button>
        </span>
      ))}
      <button type="button" className="tuning-system-manager__source-add-button" onClick={() => update({ pageReferences: [...item.pageReferences, { sourceId: "", page: "" }] })}>
        {t("tuningSystem.addSource")}
      </button>
    </>
  );

  return (
    <div className="source-oud-editor">
      <h3 className="source-oud-editor__heading">{t("sourceOud.heading")}</h3>

      <h4 className="source-oud-editor__subheading">{t("sourceOud.strings")}</h4>
      {draft.strings.map((string, i) => (
        <div key={i} className="source-oud-editor__row">
          <input className="tuning-system-manager__input" placeholder={t("sourceOud.nameEnglish")} value={string.nameEnglish} onChange={(e) => updateString(i, { nameEnglish: e.target.value })} />
          <input className="tuning-system-manager__input" dir="rtl" placeholder={t("sourceOud.nameArabic")} value={string.nameArabic} onChange={(e) => updateString(i, { nameArabic: e.target.value })} />
          <input className="tuning-system-manager__input source-oud-editor__ratio" placeholder={t("sourceOud.openRatio")} value={string.openRatio} onChange={(e) => updateString(i, { openRatio: e.target.value })} />
          {provenance(string, (change) => updateString(i, change))}
          <button type="button" className="jins-manager__source-delete-button" onClick={() => commit({ ...draft, strings: draft.strings.filter((_, j) => j !== i) })}>
            {t("sourceOud.removeString")}
          </button>
        </div>
      ))}
      <button type="button" className="tuning-system-manager__source-add-button" onClick={addString}>
        {t("sourceOud.addString")}
      </button>

      <h4 className="source-oud-editor__subheading">{t("sourceOud.frets")}</h4>
      {draft.frets.map((fret, i) => (
        <div key={i} className="source-oud-editor__row">
          <input className="tuning-system-manager__input" placeholder={t("sourceOud.nameEnglish")} value={fret.nameEnglish} onChange={(e) => updateFret(i, { nameEnglish: e.target.value })} />
          <input className="tuning-system-manager__input" dir="rtl" placeholder={t("sourceOud.nameArabic")} value={fret.nameArabic} onChange={(e) => updateFret(i, { nameArabic: e.target.value })} />
          <input className="tuning-system-manager__input source-oud-editor__ratio" placeholder={t("sourceOud.fretRatio")} value={fret.ratio} onChange={(e) => updateFret(i, { ratio: e.target.value })} />
          {provenance(fret, (change) => updateFret(i, change))}
          <button type="button" className="jins-manager__source-delete-button" onClick={() => removeFret(i)}>
            {t("sourceOud.removeFret")}
          </button>
        </div>
      ))}
      <button type="button" className="tuning-system-manager__source-add-button" onClick={addFret}>
        {t("sourceOud.addFret")}
      </button>

      <div className="tuning-system-manager__group">
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
      <button type="button" className="jins-manager__source-delete-button" onClick={() => commit(null)}>
        {t("sourceOud.remove")}
      </button>
    </div>
  );
}
