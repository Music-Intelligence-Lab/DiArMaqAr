import fs from "fs";
import path from "path";

/**
 * The change log, read from CHANGELOG.md at the repository root: the one source
 * that GitHub shows as it is and the /changelog page is built from.
 *
 * The file follows Keep a Changelog (keepachangelog.com), dated rather than
 * versioned since the archive has no version numbers, and keeps to a small fixed
 * shape (described in its own header comment): a title, an introduction, then
 * entries as "## YYYY-MM-DD — Title" headings, each with an optional summary
 * paragraph and "### Added" (Changed, Deprecated, Removed, Fixed, Security)
 * sections of "- " lists, links as [text](url) and emphasis as **text**.
 * Anything outside that shape is refused with the line it is on, never skipped,
 * so the page cannot quietly drop part of an entry.
 */

/** A run of text inside a paragraph or list item. */
export type ChangelogInline = { kind: "text"; text: string } | { kind: "strong"; text: string } | { kind: "link"; text: string; href: string };

export type ChangelogBlock =
  | { kind: "paragraph"; inlines: ChangelogInline[] }
  | { kind: "list"; items: ChangelogInline[][] }
  | { kind: "section"; title: ChangelogSection };

/** The kinds of change Keep a Changelog names, in its order. */
export const CHANGELOG_SECTIONS = ["Added", "Changed", "Deprecated", "Removed", "Fixed", "Security"] as const;
export type ChangelogSection = (typeof CHANGELOG_SECTIONS)[number];

export interface ChangelogEntry {
  /** ISO date, YYYY-MM-DD */
  date: string;
  title: string;
  blocks: ChangelogBlock[];
}

export interface Changelog {
  intro: ChangelogBlock[];
  entries: ChangelogEntry[];
}

const ENTRY_HEADING = /^## (\d{4}-\d{2}-\d{2}) — (.+)$/;
const SECTION_HEADING = /^### (.+)$/;
const INLINE = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Splits text into plain runs, **emphasis** and [links](url). */
export function parseInlines(text: string): ChangelogInline[] {
  const inlines: ChangelogInline[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE)) {
    if (match.index! > last) inlines.push({ kind: "text", text: text.slice(last, match.index) });
    inlines.push(match[1] !== undefined ? { kind: "strong", text: match[1] } : { kind: "link", text: match[2], href: match[3] });
    last = match.index! + match[0].length;
  }
  if (last < text.length) inlines.push({ kind: "text", text: text.slice(last) });
  return inlines;
}

/** Parses the change log's markdown. Throws on anything outside its shape. */
export function parseChangelog(markdown: string): Changelog {
  const lines = markdown.replace(/<!--[\s\S]*?-->/g, "").split("\n");
  if (!lines[0]?.startsWith("# ")) throw new Error("CHANGELOG.md must open with a '# ' title");

  const intro: ChangelogBlock[] = [];
  const entries: ChangelogEntry[] = [];
  let blocks = intro;
  let paragraph: string[] = [];
  let list: string[] = [];

  const endParagraph = () => {
    if (paragraph.length) blocks.push({ kind: "paragraph", inlines: parseInlines(paragraph.join(" ")) });
    paragraph = [];
  };
  const endList = () => {
    if (list.length) blocks.push({ kind: "list", items: list.map(parseInlines) });
    list = [];
  };

  lines.slice(1).forEach((raw, i) => {
    const line = raw.trimEnd();
    const heading = ENTRY_HEADING.exec(line);
    if (heading) {
      endParagraph();
      endList();
      const entry: ChangelogEntry = { date: heading[1], title: heading[2], blocks: [] };
      entries.push(entry);
      blocks = entry.blocks;
    } else if (SECTION_HEADING.test(line)) {
      const title = SECTION_HEADING.exec(line)![1];
      if (blocks === intro) throw new Error(`CHANGELOG.md line ${i + 2}: a "### ${title}" section must sit inside a dated entry`);
      if (!(CHANGELOG_SECTIONS as readonly string[]).includes(title))
        throw new Error(`CHANGELOG.md line ${i + 2}: "### ${title}" is not one of ${CHANGELOG_SECTIONS.join(", ")}`);
      endParagraph();
      endList();
      blocks.push({ kind: "section", title: title as ChangelogSection });
    } else if (line.startsWith("#")) {
      throw new Error(`CHANGELOG.md line ${i + 2}: a heading must read "## YYYY-MM-DD — Title" or "### Added" (and so on)`);
    } else if (line.startsWith("- ")) {
      endParagraph();
      list.push(line.slice(2));
    } else if (line.trim() === "") {
      endParagraph();
      endList();
    } else {
      endList();
      paragraph.push(line.trim());
    }
  });
  endParagraph();
  endList();

  entries.forEach((entry, i) => {
    if (Number.isNaN(Date.parse(entry.date))) throw new Error(`CHANGELOG.md: "${entry.date}" is not a date`);
    if (i > 0 && entry.date > entries[i - 1].date) throw new Error(`CHANGELOG.md: entries must run newest first, but ${entry.date} follows ${entries[i - 1].date}`);
  });
  return { intro, entries };
}

/** The change log as the repository holds it. */
export function getChangelog(): Changelog {
  return parseChangelog(fs.readFileSync(path.join(process.cwd(), "CHANGELOG.md"), "utf8"));
}
