"use client";

import React, { useEffect, useState } from "react";

/**
 * One foldable section of an admin form. Its header shows the title and a
 * one-line summary of what is inside, so a folded section still says what it
 * holds. Whether it is open is remembered in this browser (per section id);
 * where storage is unavailable the section simply starts at its default.
 * forceOpen keeps it open regardless (e.g. a tuning system not yet saved).
 */
export default function AdminSection({
  id,
  title,
  summary,
  defaultOpen,
  forceOpen = false,
  children,
}: {
  id: string;
  title: string;
  summary: React.ReactNode;
  defaultOpen: boolean;
  forceOpen?: boolean;
  children: React.ReactNode;
}) {
  const key = `adminSection:${id}`;
  const [open, setOpen] = useState(defaultOpen);

  // Read after mount so the server render and the first client render agree
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) setOpen(stored === "open");
    } catch {
      // Storage unavailable: keep the default
    }
  }, [key]);

  function toggle(next: boolean) {
    setOpen(next);
    try {
      window.localStorage.setItem(key, next ? "open" : "closed");
    } catch {
      // Storage unavailable: the choice lasts until the page reloads
    }
  }

  return (
    <details
      className="admin-section"
      open={forceOpen || open}
      onToggle={(e) => {
        const isOpen = (e.currentTarget as HTMLDetailsElement).open;
        // While forced open, a click is not a preference to remember
        if (!forceOpen && isOpen !== open) toggle(isOpen);
      }}
    >
      <summary
        onClick={(e) => {
          // Forced open (a new tuning system, or a problem inside): the click does not fold it
          if (forceOpen) e.preventDefault();
        }}
      >
        <h3 className="admin-section__title">{title}</h3>
        <span className="admin-section__summary">{summary}</span>
      </summary>
      {children}
    </details>
  );
}
