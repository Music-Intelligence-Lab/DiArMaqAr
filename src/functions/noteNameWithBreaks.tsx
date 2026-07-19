import React from "react";

/**
 * Renders a note name with a line-break opportunity after each slash.
 *
 * Note names carry alternates joined by a slash ("sunbuleh/zawāl"). A slash
 * sitting between letters is NOT a break opportunity in CSS, so a compound
 * name overflows its cell rather than wrapping onto a second line, and no
 * combination of white-space/word-break fixes it — the only alternatives
 * break mid-word instead. `<wbr>` offers the break explicitly, exactly where
 * the name divides.
 *
 * Display only. The underlying string is untouched, so clipboard copy, the
 * export builders, and search all keep the plain "a/b" form.
 */
export default function noteNameWithBreaks(name: string): React.ReactNode {
  if (!name.includes("/")) return name;

  const parts = name.split("/");
  return parts.map((part, index) => (
    <React.Fragment key={index}>
      {part}
      {index < parts.length - 1 && (
        <>
          {"/"}
          <wbr />
        </>
      )}
    </React.Fragment>
  ));
}
