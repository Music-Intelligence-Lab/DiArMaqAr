"use client";

import React from "react";
import Link from "next/link";
import useLanguageContext from "@/contexts/language-context";
import { stringifySource, Source, SourcePageReference } from "@/models/bibliography/Source";
import { useLocalizedHref } from "@/hooks/use-localized-href";

/**
 * The maqām's or jins's source attribution, rendered directly beneath its
 * taḥlīl table.
 *
 * Placement: it used to sit at the foot of the page, below every transposition
 * table — so the one fact describing the ENTITY sat behind an unbounded amount
 * of material describing its derivations, and a maqām with forty transpositions
 * buried its note forty tables down. And the obvious repair, repeating it under
 * each table, is worse: the note is per-maqām, so N tables would carry N copies
 * of one sentence. The taḥlīl table is the maqām itself; the transposition
 * tables below are derivations of it. So the note belongs to that table alone,
 * which puts it near the top of the page, once, and costs no permanent screen
 * space.
 *
 * The commentary column is currently HIDDEN (Khyam's ruling) — the block shows
 * sources only, and the lone sources section spans the full width. The comments
 * half was a `__comments-section` div holding an `<h3>{commentsLabel}:</h3>` and
 * a `<CommentText text={comments?.trim() ?? ""} className="maqam-jins-transpositions-shared__comments-text" />`,
 * at flex 3 against the sources column's flex 1. Its SCSS rules are still in
 * place (`_maqam-jins-shared-ui.scss`), as is the language pick the two call
 * sites made for the prop:
 *
 *   comments={language === "ar" ? data.getCommentsArabic()?.trim() || data.getCommentsEnglish() : data.getCommentsEnglish()}
 *
 * Note the fallback: Arabic falls back to the English comment when the Arabic
 * one is blank. Restoring means putting that div, that prop and `commentsLabel`
 * back, and folding the comment text into the empty-block guard below.
 *
 * The sayr and tuning-system pages carry their own commentary blocks (same
 * `comments-sources-container` mixin, different components) and are unaffected.
 */
export default function EntitySourceNote({
  sourcePageReferences,
  sources,
  sourcesLabel,
}: {
  sourcePageReferences: SourcePageReference[] | undefined;
  sources: Source[];
  sourcesLabel: string;
}) {
  const { language } = useLanguageContext();
  const lh = useLocalizedHref();

  const resolvedSources = (sourcePageReferences ?? []).flatMap((reference) => {
    const source = sources.find((s) => s.getId() === reference.sourceId);
    return source ? [{ source, page: reference.page }] : [];
  });

  // Nothing to attribute — the whole block goes rather than standing as a
  // heading over an empty box.
  if (resolvedSources.length === 0) return null;

  return (
    <div className="maqam-jins-transpositions-shared__comments-sources-container" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="maqam-jins-transpositions-shared__sources-section">
        <h3>{sourcesLabel}:</h3>
        <div className="maqam-jins-transpositions-shared__sources-text">
          {resolvedSources.map(({ source, page }, index) => (
            <React.Fragment key={source.getId() + index}>
              <Link href={lh(`/bibliography?source=${source.getId()}`)}>{stringifySource(source, language !== "ar", page)}</Link>
              <br />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
