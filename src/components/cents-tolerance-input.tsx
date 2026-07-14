"use client";

import useAppContext from "@/contexts/app-context";
import React, { useEffect, useState } from "react";

/**
 * Cents-tolerance input that only commits (and thereby triggers transposition
 * recalculation) on Enter or blur — never per keystroke.
 */
export default function CentsToleranceInput({ className }: { className: string }) {
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
    <input
      className={className}
      type="number"
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
  );
}
