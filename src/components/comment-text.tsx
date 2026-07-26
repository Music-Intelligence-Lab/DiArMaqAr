"use client";

import React from "react";

/**
 * Renders a comment field's two structural marks, and nothing else.
 *
 * Comment strings in `data/` carry exactly two pieces of structure:
 *
 *   - a blank line (`\n\n`) is a paragraph break
 *   - a single `\n` is a line break inside a paragraph
 *
 * The second exists because some sources break their own text structurally.
 * al-Shawwā's suyūr set a ‹ملاحظه› note off from the sayr proper on its own
 * line, and since sayr comments are stored verbatim, that break is part of the
 * quotation rather than our formatting — 8 fields depend on it surviving.
 *
 * Nothing else is interpreted. No markdown, no HTML, no lists: a comment is
 * prose plus these two marks, so the data stays legible as data and there is no
 * markup dialect to keep in sync between the archive and the app.
 *
 * Written once and shared because three pages display comments — maqām/jins via
 * EntitySourceNote, the suyūr list, and tuning systems — and every one of them
 * previously dropped the string into a single element, where HTML collapses the
 * newlines to spaces. That silently flattened 99 fields across three data files.
 */
export default function CommentText({ text, className }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n\s*\n/).filter((paragraph) => paragraph.trim() !== "");

  return (
    <div className={className}>
      {paragraphs.map((paragraph, paragraphIndex) => (
        <p key={paragraphIndex}>
          {paragraph.split("\n").map((line, lineIndex, lines) => (
            <React.Fragment key={lineIndex}>
              {line}
              {lineIndex < lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}
