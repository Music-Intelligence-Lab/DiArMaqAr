"use client";

import React, { useState } from "react";
import useLanguageContext from "@/contexts/language-context";
import { Source, SourcePageReference, stringifySource } from "@/models/bibliography/Source";
import { compareNormalized } from "@/functions/normalizeForSort";

/**
 * Page references shown as short chips in the archive's citation form
 * ("Farmer (1937:257)"). Clicking a chip opens its source and page for
 * editing in place; "+" adds a reference and opens it. A reference whose
 * source is not chosen yet stays visible as "Choose a source".
 */
export default function PageReferenceChips({
  references,
  sources,
  onChange,
}: {
  references: SourcePageReference[];
  sources: Source[];
  onChange: (next: SourcePageReference[]) => void;
}) {
  const { t } = useLanguageContext();
  const [editing, setEditing] = useState<number | null>(null);
  const sorted = [...sources].sort((a, b) => compareNormalized(a.getTitleEnglish(), b.getTitleEnglish()));

  const label = (ref: SourcePageReference) => {
    const source = sources.find((s) => s.getId() === ref.sourceId);
    if (!source) return t("references.chooseSource");
    // Always the English citation form: a page list such as "251–255, 257"
    // reads wrongly when mixed into right-to-left text
    return stringifySource(source, true, ref.page || null) || source.getTitleEnglish();
  };

  const update = (index: number, change: Partial<SourcePageReference>) =>
    onChange(references.map((ref, i) => (i === index ? { ...ref, ...change } : ref)));

  return (
    <span className="reference-chips">
      {references.map((ref, i) =>
        editing === i ? (
          <span key={i} className="reference-chips__editor">
            <select className="reference-chips__field" value={ref.sourceId} onChange={(e) => update(i, { sourceId: e.target.value })}>
              <option value="">{t("references.chooseSource")}</option>
              {sorted.map((s) => (
                <option key={s.getId()} value={s.getId()}>
                  {s.getTitleEnglish()}
                </option>
              ))}
            </select>
            <input
              className="reference-chips__field reference-chips__page"
              type="text"
              value={ref.page}
              placeholder={t("tuningSystem.page")}
              onChange={(e) => update(i, { page: e.target.value })}
            />
            <button type="button" className="reference-chips__done" onClick={() => setEditing(null)}>
              {t("references.done")}
            </button>
            <button
              type="button"
              className="reference-chips__remove"
              onClick={() => {
                onChange(references.filter((_, j) => j !== i));
                setEditing(null);
              }}
            >
              {t("tuningSystem.delete")}
            </button>
          </span>
        ) : (
          <button key={i} type="button" dir="ltr" className={"reference-chips__chip" + (ref.sourceId ? "" : " reference-chips__chip_unset")} onClick={() => setEditing(i)}>
            {label(ref)}
          </button>
        )
      )}
      <button
        type="button"
        className="reference-chips__chip reference-chips__add"
        aria-label={t("references.add")}
        title={t("references.add")}
        onClick={() => {
          onChange([...references, { sourceId: "", page: "" }]);
          setEditing(references.length);
        }}
      >
        +
      </button>
    </span>
  );
}
