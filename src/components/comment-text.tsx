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
 *     is styled apart from ours. A quotation may quote something itself, and may
 *     run across paragraphs (al-Ṣabbāgh 1954), so the depth is carried through
 *     the whole comment.
 *
 * Suyūr stay plain: a sayr is entirely a quotation, and its own « » and ملاحظه
 * belong to the source (several open a « the printed page never closes).
 *
 * Written once and shared because several pages display comments; every one of
 * them previously dropped the string into a single element, where HTML collapses
 * the newlines to spaces.
 */
const NOTE_OPENING = /^\s*(NOTE:|Note:|ملاحظة:)/;

/** Quotation depth carried across lines and paragraphs: 0 is our own words. */
type QuoteState = { depth: number };

const OPENING_MARKS = new Set(["«", "“"]);
const CLOSING_MARKS = new Set(["»", "”"]);

/**
 * Whether a straight " opens a quotation or closes one. The same mark does both,
 * so it is read from its surroundings as a reader does: outside any quotation it
 * opens; inside one it opens a quotation within the quotation when it follows a
 * space (or the start, or an opening bracket or dash) and comes before a
 * character, and otherwise closes. Telling the two apart is what lets a quoted
 * passage quote something itself (the note "rāst" inside Shawqī's words).
 */
function straightQuoteOpens(previous: string | undefined, next: string | undefined, depth: number): boolean {
  if (depth === 0) return true;
  const afterBreak = previous === undefined || /[\s(\[«“—–]/.test(previous);
  const beforeCharacter = next !== undefined && !/[\s.,;:!?)\]]/.test(next);
  return afterBreak && beforeCharacter;
}

/** Splits one line into runs of our words and the source's (quoted) words. */
function quoteRuns(line: string, state: QuoteState): { text: string; quoted: boolean }[] {
  const runs: { text: string; quoted: boolean }[] = [];
  const characters = Array.from(line);
  let current = "";
  const flush = (quoted: boolean) => {
    if (current) runs.push({ text: current, quoted });
    current = "";
  };
  const open = (ch: string) => {
    if (state.depth === 0) flush(false);
    current += ch;
    state.depth += 1;
  };
  const close = (ch: string) => {
    current += ch;
    state.depth -= 1;
    if (state.depth === 0) flush(true);
  };
  characters.forEach((ch, i) => {
    if (ch === '"') {
      if (straightQuoteOpens(characters[i - 1], characters[i + 1], state.depth)) open(ch);
      else close(ch);
    } else if (OPENING_MARKS.has(ch)) open(ch);
    else if (CLOSING_MARKS.has(ch) && state.depth > 0) close(ch);
    else current += ch;
  });
  flush(state.depth > 0);
  return runs;
}

export default function CommentText({ text, className, editorial = false }: { text: string; className?: string; editorial?: boolean }) {
  const paragraphs = text.split(/\n\s*\n/).filter((paragraph) => paragraph.trim() !== "");
  const state: QuoteState = { depth: 0 };

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
