"use client";

import React from "react";

/**
 * Renders a comment field. Comment strings in `data/` carry two structural marks:
 *
 *   - a blank line (`\n\n`) is a paragraph break
 *   - a single `\n` is a line break inside a paragraph
 *
 * The second exists because some sources break their own text structurally.
 * al-Shawwā's suyūr set a ‹ملاحظه› note off from the sayr proper on its own
 * line, and since sayr comments are stored verbatim, that break is part of the
 * quotation rather than our formatting — 8 fields depend on it surviving.
 *
 * Our own commentary (`editorial`: tuning-system, maqām and jins comments, never
 * suyūr) also shows two things the house style already writes into the text, so
 * the data needs no markup and reads the same through the API:
 *
 *   - a NOTE: a paragraph that opens with "NOTE:" / "Note:" (Arabic "ملاحظة:")
 *     is set apart as a note. It runs to the next blank line; inside it, each
 *     single line break starts a new paragraph of the note.
 *   - a quotation: text inside "…" (English) or «…» (Arabic) is the source's
 *     words (the comment rules reserve those marks for verbatim quotation), so it
 *     is styled apart from ours. A quotation may run across paragraphs (al-Ṣabbāgh
 *     1954), so the open/closed state is carried through the whole comment.
 *
 * Suyūr stay plain: a sayr is entirely a quotation, and its own « » and ملاحظه
 * belong to the source (several open a « the printed page never closes).
 *
 * Written once and shared because several pages display comments; every one of
 * them previously dropped the string into a single element, where HTML collapses
 * the newlines to spaces.
 */
const NOTE_OPENING = /^\s*(NOTE:|Note:|ملاحظة:)/;

/** Quotation state carried across lines and paragraphs. */
type QuoteState = { straight: boolean; guillemets: number };

/** Splits one line into runs of our words and the source's (quoted) words. */
function quoteRuns(line: string, state: QuoteState): { text: string; quoted: boolean }[] {
  const runs: { text: string; quoted: boolean }[] = [];
  let current = "";
  const inside = () => state.straight || state.guillemets > 0;
  const flush = (quoted: boolean) => {
    if (current) runs.push({ text: current, quoted });
    current = "";
  };
  for (const ch of line) {
    if (ch === '"' && !state.straight && state.guillemets === 0) {
      flush(false);
      state.straight = true;
      current = ch;
    } else if (ch === '"' && state.straight) {
      current += ch;
      state.straight = false;
      flush(true);
    } else if (ch === "«") {
      if (!inside()) flush(false);
      current += ch;
      state.guillemets += 1;
    } else if (ch === "»" && state.guillemets > 0) {
      current += ch;
      state.guillemets -= 1;
      if (!inside()) flush(true);
    } else {
      current += ch;
    }
  }
  flush(inside());
  return runs;
}

export default function CommentText({ text, className, editorial = false }: { text: string; className?: string; editorial?: boolean }) {
  const paragraphs = text.split(/\n\s*\n/).filter((paragraph) => paragraph.trim() !== "");
  const state: QuoteState = { straight: false, guillemets: 0 };

  const renderLine = (line: string, key: React.Key) =>
    editorial ? (
      <React.Fragment key={key}>
        {quoteRuns(line, state).map((run, i) =>
          run.quoted ? (
            <span key={i} className="comment-text__quote">
              {run.text}
            </span>
          ) : (
            <React.Fragment key={i}>{run.text}</React.Fragment>
          )
        )}
      </React.Fragment>
    ) : (
      <React.Fragment key={key}>{line}</React.Fragment>
    );

  return (
    <div className={className}>
      {paragraphs.map((paragraph, paragraphIndex) => {
        const lines = paragraph.split("\n");
        const note = editorial && NOTE_OPENING.exec(lines[0]);
        if (note) {
          return (
            <div key={paragraphIndex} className="comment-text__note">
              {lines.map((line, lineIndex) => (
                <p key={lineIndex}>
                  {lineIndex === 0 ? (
                    <>
                      <strong className="comment-text__note-label">{note[1]}</strong>
                      {renderLine(line.slice(note[0].length), "rest")}
                    </>
                  ) : (
                    renderLine(line, "line")
                  )}
                </p>
              ))}
            </div>
          );
        }
        return (
          <p key={paragraphIndex}>
            {lines.map((line, lineIndex) => (
              <React.Fragment key={lineIndex}>
                {renderLine(line, "line")}
                {lineIndex < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
