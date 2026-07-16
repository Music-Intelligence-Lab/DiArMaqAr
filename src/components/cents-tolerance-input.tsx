"use client";

import useAppContext from "@/contexts/app-context";
import React, { useEffect, useState } from "react";

/**
 * Cents-tolerance input that only commits (and thereby triggers transposition
 * recalculation) on Enter or blur — never per keystroke. Renders as the
 * shared 27px black value box (same as the Hz and string-length fields) with
 * the ± and ¢ symbols inside the box.
 */
export default function CentsToleranceInput() {
  const { centsTolerance, setCentsTolerance } = useAppContext();
  const [draft, setDraft] = useState(String(centsTolerance ?? 0));

  // Stay in sync when tolerance changes elsewhere (e.g. restored from the URL)
  useEffect(() => {
    setDraft(String(centsTolerance ?? 0));
  }, [centsTolerance]);

  const commit = () => {
    const parsed = Number(draft);
    if (draft.trim() !== "" && !isNaN(parsed) && parsed >= 0) {
      setCentsTolerance(parsed);
    } else {
      setDraft(String(centsTolerance ?? 0));
    }
  };

  return (
    <span className="maqam-jins-transpositions-shared__cents-tolerance-box">
      <span className="maqam-jins-transpositions-shared__cents-tolerance-unit">±</span>
      <input
        className="maqam-jins-transpositions-shared__cents-tolerance-input"
        type="number"
        onFocus={(e) => e.target.select()}
        min={0}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            commit();
            e.currentTarget.blur();
          }
        }}
      />
      <span className="maqam-jins-transpositions-shared__cents-tolerance-unit">¢</span>
    </span>
  );
}
