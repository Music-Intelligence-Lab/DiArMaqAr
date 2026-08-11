"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import useLanguageContext from "@/contexts/language-context";

export interface CarouselFilterItem {
  key: string;
  label: string;
  count: number;
}

/**
 * The shared carousel filter band: a one-row typographic index of the
 * collection's groups (name + count, active item as a black tab fused with
 * the carousel below), scrolling horizontally behind edge fades when it
 * overflows. Used above the jins, maqam, and tuning-system carousels;
 * page-specific trailing controls (e.g. the maqam group-by) render as
 * children at the band's end.
 */
export default function CarouselFilterRail({
  items,
  activeKey,
  onSelect,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  children,
}: {
  items: CarouselFilterItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  /** Current search text. Owned by the manager, which does the filtering. */
  searchQuery?: string;
  /** Providing this enables search; omitting it leaves the band as it was. */
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
}) {
  const { isRTL, t } = useLanguageContext();

  // Search replaces the groups rather than sitting beside them: the two are
  // alternative ways to narrow the same carousel, and a query runs across the
  // whole collection, so leaving a group tab visible-and-active while search
  // ignores it would misreport what is on screen.
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchEnabled = typeof onSearchChange === "function";

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    onSearchChange?.("");
  }, [onSearchChange]);

  // Scroll position drives the edge fades (data-fade uses physical sides —
  // RTL is mapped here, where scrollLeft is read). The chevron buttons
  // flank the rail outside its scroll area and outside the layout flow;
  // they render only while the rail overflows (hiding them causes no
  // layout shift), and at the extremes clicks no-op exactly like the
  // carousel arrows.
  const railRef = useRef<HTMLElement>(null);
  const [railFade, setRailFade] = useState<"none" | "left" | "right" | "both">("none");
  const [railOverflows, setRailOverflows] = useState(false);

  const updateRailState = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const maxScroll = rail.scrollWidth - rail.clientWidth;
    if (maxScroll <= 1) {
      setRailOverflows(false);
      setRailFade("none");
      return;
    }
    setRailOverflows(true);
    const pos = Math.abs(rail.scrollLeft);
    const atStart = pos <= 1;
    const atEnd = pos >= maxScroll - 1;
    const startSide: "left" | "right" = isRTL ? "right" : "left";
    const endSide: "left" | "right" = isRTL ? "left" : "right";
    setRailFade(atStart && atEnd ? "none" : atStart ? endSide : atEnd ? startSide : "both");
  }, [isRTL]);

  useEffect(() => {
    updateRailState();
    const rail = railRef.current;
    if (!rail) return;
    const observer = new ResizeObserver(updateRailState);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [updateRailState, items]);

  // Keep the active filter in view when it changes (e.g. restored from URL).
  // Scrolls the rail's own axis only — never scrollIntoView, which also
  // scrolls scrollable ANCESTORS vertically: this effect re-fires whenever
  // the manager re-renders (items gets a new identity on every played note),
  // and scrollIntoView would yank the page back up to the rail mid-playback.
  useEffect(() => {
    const rail = railRef.current;
    const tab = rail?.querySelector<HTMLElement>(".carousel-filter__tab_active");
    if (!rail || !tab) return;
    const railRect = rail.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();
    if (tabRect.left < railRect.left) {
      rail.scrollBy({ left: tabRect.left - railRect.left });
    } else if (tabRect.right > railRect.right) {
      rail.scrollBy({ left: tabRect.right - railRect.right });
    }
  }, [activeKey, items]);

  const scrollRail = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * rail.clientWidth * 0.7 * (isRTL ? -1 : 1), behavior: "smooth" });
  };

  return (
    <div className="carousel-filter">
      <div className="carousel-filter__rail-wrap">
        {searchOpen ? (
          <input
            ref={searchInputRef}
            type="search"
            className="carousel-filter__search-input"
            value={searchQuery ?? ""}
            placeholder={searchPlaceholder}
            onChange={(event) => onSearchChange?.(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") closeSearch();
            }}
          />
        ) : (
          <>
            {railOverflows && (
              <button className="carousel-filter__chevron carousel-filter__chevron_start" onClick={() => scrollRail(-1)}>
                ‹
              </button>
            )}
            <nav className="carousel-filter__rail" ref={railRef} data-fade={railFade === "none" ? undefined : railFade} onScroll={updateRailState}>
              {items.map((item) => (
                <button
                  key={item.key}
                  className={"carousel-filter__tab" + (activeKey === item.key ? " carousel-filter__tab_active" : "")}
                  onClick={() => onSelect(item.key)}
                >
                  {item.label}
                  <span className="carousel-filter__tab-count">{item.count}</span>
                </button>
              ))}
            </nav>
            {railOverflows && (
              <button className="carousel-filter__chevron carousel-filter__chevron_end" onClick={() => scrollRail(1)}>
                ›
              </button>
            )}
          </>
        )}
      </div>
      {searchEnabled && (
        <button
          className={"carousel-filter__search-toggle" + (searchOpen ? " carousel-filter__search-toggle_active" : "")}
          onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
          aria-label={searchOpen ? t("filter.closeSearch") : t("filter.search")}
          aria-expanded={searchOpen}
        >
          {searchOpen ? <CloseIcon fontSize="inherit" /> : <SearchIcon fontSize="inherit" />}
        </button>
      )}
      {children}
    </div>
  );
}
