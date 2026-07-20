"use client";

import React from "react";
import Link from "next/link";
import useLanguageContext from "@/contexts/language-context";
import { stringifySource, Source, SourcePageReference } from "@/models/bibliography/Source";
import { useLocalizedHref } from "@/hooks/use-localized-href";

/**
 * The maqām's or jins's own commentary and source attribution, rendered
 * directly beneath its taḥlīl table.
 *
 * Two things fixed at once. It used to sit at the foot of the page, below every
 * transposition table — so the one fact describing the ENTITY sat behind an
 * unbounded amount of material describing its derivations, and a maqām with
 * forty transpositions buried its commentary forty tables down. And the
 * obvious repair, repeating it under each table, is worse: the comment is
 * per-maqām, so N tables would carry N copies of one sentence.
 *
 * The taḥlīl table is the maqām itself; the transposition tables below are
 * derivations of it. So the commentary belongs to that table alone, which puts
 * it near the top of the page, once, and costs no permanent screen space.
 */
export default function EntitySourceNote({
  comments,
  sourcePageReferences,
  sources,
  commentsLabel,
  sourcesLabel,
}: {
  comments: string | undefined;
  sourcePageReferences: SourcePageReference[] | undefined;
  sources: Source[];
  commentsLabel: string;
  sourcesLabel: string;
}) {
  const { language } = useLanguageContext();
  const lh = useLocalizedHref();

  const text = comments?.trim();
  const resolvedSources = (sourcePageReferences ?? []).flatMap((reference) => {
    const source = sources.find((s) => s.getId() === reference.sourceId);
    return source ? [{ source, page: reference.page }] : [];
  });

  // Nothing to gloss at all — the whole block goes rather than standing as two
  // headings over two empty boxes.
  if (!text && resolvedSources.length === 0) return null;

  // Both columns render together whenever the block renders: the 3/1 split is
  // the layout's own signal about which of the two is the substance, and it
  // only reads that way when both are present to be compared.
  return (
    <div className="maqam-jins-transpositions-shared__comments-sources-container" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="maqam-jins-transpositions-shared__comments-section">
        <h3>{commentsLabel}:</h3>
        <div className="maqam-jins-transpositions-shared__comments-text">{text}</div>
      </div>

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
