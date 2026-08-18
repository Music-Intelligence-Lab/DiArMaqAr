"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useAppContext from "@/contexts/app-context";
import useLanguageContext from "@/contexts/language-context";
import PitchClass from "@/models/PitchClass";
import NoteName from "@/models/NoteName";
import getFretboardDivisions, {
  FRETBOARD_MAX_POSITION,
  FretboardUnavailability,
} from "@/functions/getFretboardDivisions";
import {
  CUSTOM_PRESET_ID,
  DEFAULT_PRESET_ID,
  MAX_STRINGS,
  MIN_STRINGS,
  fretboardPresets,
  openStringNoteNameOptions,
} from "@/models/FretboardPreset";
import noteNameWithBreaks from "@/functions/noteNameWithBreaks";

/** What each dastān is labelled with. One at a time. */
type LabelMode = "pao" | "ipn" | "solfege" | "ratio" | "cents" | "fretDivision";

const LABEL_MODES: LabelMode[] = ["pao", "ipn", "solfege", "ratio", "cents", "fretDivision"];

/** Modes whose labels are numeric: narrow, symmetrical, centred on the tick. */
const NUMERIC_MODES: LabelMode[] = ["ratio", "cents", "fretDivision"];

/** A perfect fourth, the interval an ʿūd is ordinarily tuned in. */
const FOURTH_CENTS = 1200 * Math.log2(4 / 3);

const centsOf = (pitchClass: PitchClass) => parseFloat(pitchClass.cents);

/**
 * Typography and spacing facts the measured layout depends on. Each mirrors a
 * declaration in oud-fretboard.scss — the stylesheet remains the one place
 * that styles labels; these constants only let the layout PREDICT the result
 * without touching DOM that React owns. If the stylesheet changes, change these.
 */
const NAME_FONT = '300 11px "Readex Pro", sans-serif'; // __label: $font-size-xs at $font-weight 300
const NUMERIC_FONT = '300 10px "Readex Pro", sans-serif'; // __label_numeric: one step down
const NAME_LINE_HEIGHT = 12.1; // 11px × line-height 1.1
const NUMERIC_LABEL_HEIGHT = 11; // one 10px line at line-height 1.1
const FRACTION_LABEL_HEIGHT = 23; // two 10px lines at 1.05, plus the 1px rule and its padding
const LABEL_GAP = 22; // the ±22px label offsets from the string
const LANE_PADDING = 13; // a lane's outer margin beyond its labels
const TICK_HALF = 9; // half the 18px tick
const LABEL_CLEARANCE = 4; // air between neighbouring labels in a band
const MIN_LABEL_WIDTH = 38; // narrower than this even a short name breaks badly
const MAX_LABEL_WIDTH = 240;

/** One measuring context for the module; created lazily, client-side only. */
let measuringContext: CanvasRenderingContext2D | null = null;
function textWidth(text: string, font: string): number {
  if (!measuringContext) {
    measuringContext = document.createElement("canvas").getContext("2d");
  }
  if (!measuringContext) return 0;
  measuringContext.font = font;
  return measuringContext.measureText(text).width;
}

/**
 * How many lines a name occupies inside maxWidth, breaking exactly where the
 * DOM can: at spaces, and after slashes (noteNameWithBreaks supplies the
 * <wbr>). Greedy, like the browser's own inline layout.
 */
function wrappedLineCount(text: string, maxWidth: number, font: string): number {
  const atoms: { text: string; spaceBefore: boolean }[] = [];
  text.split(" ").forEach((word, wordIndex) => {
    const parts = word.split("/");
    parts.forEach((part, partIndex) => {
      atoms.push({
        text: partIndex < parts.length - 1 ? `${part}/` : part,
        spaceBefore: partIndex === 0 && wordIndex > 0,
      });
    });
  });

  const spaceWidth = textWidth(" ", font);
  let lines = 1;
  let lineWidth = 0;
  for (const atom of atoms) {
    const atomWidth = textWidth(atom.text, font);
    const joined = lineWidth === 0 ? atomWidth : lineWidth + (atom.spaceBefore ? spaceWidth : 0) + atomWidth;
    if (lineWidth > 0 && joined > maxWidth) {
      lines += 1;
      lineWidth = atomWidth;
    } else {
      lineWidth = joined;
    }
  }
  return lines;
}

/** The plan for one division's label: what to draw and how much room it has. */
interface LabelPlan {
  text: string;
  band: "above" | "below";
  wrap: boolean;
  maxWidth: number | null;
}

interface RowPlan {
  /** Indexed like the string's divisions; null where there is no label. */
  labels: (LabelPlan | null)[];
  /** Measured lane height, or null until the track width is known. */
  trackHeight: number | null;
}

/**
 * The dasātīn (ʿūd fretboard) view of a tanghīm: the same pitches as the dīwān
 * tables, laid out as fret divisions on virtual awtār.
 *
 * All layout is computed as data and rendered by React. Nothing here writes to
 * the DOM — the first cut of this component rewrote label nodes directly, and
 * React's reconciler does not tolerate foreign writes: recovering from them
 * (especially across fast refresh) can leave the whole page duplicated. The
 * only DOM access left is read-only measurement.
 *
 * @param highlightPitchClasses - pitch classes to mark. Tuning systems pass the
 *   reader's selection; ajnās and maqāmāt will later pass their own, which is
 *   why this is a prop rather than read from context here.
 */
export default function OudFretboard({
  highlightPitchClasses = [],
}: {
  highlightPitchClasses?: PitchClass[];
}) {
  const { allPitchClasses } = useAppContext();
  const { t, getDisplayName } = useLanguageContext();

  const [labelMode, setLabelMode] = useState<LabelMode>("pao");
  const [presetId, setPresetId] = useState<string>(DEFAULT_PRESET_ID);
  const [openStringNoteNames, setOpenStringNoteNames] = useState<NoteName[]>(
    () => fretboardPresets.find((p) => p.id === DEFAULT_PRESET_ID)!.openStringNoteNames
  );

  /** Open-string names that actually resolve in this tanghīm, lowest first. */
  const availableOpenNotes = useMemo(() => {
    const byName = new Map<string, number>();
    allPitchClasses.forEach((pc) => {
      if (!pc.noteName || pc.noteName === "none") return;
      const hasOctave = allPitchClasses.some(
        (other) => Math.abs(centsOf(other) - (centsOf(pc) + 1200)) < 1e-6
      );
      if (!hasOctave) return;
      const existing = byName.get(pc.noteName);
      if (existing === undefined || centsOf(pc) < existing) byName.set(pc.noteName, centsOf(pc));
    });
    return openStringNoteNameOptions
      .filter((noteName) => byName.has(noteName))
      .map((noteName) => ({ noteName, cents: byName.get(noteName)! }))
      .sort((a, b) => a.cents - b.cents);
  }, [allPitchClasses]);

  /**
   * A starting suggestion for a custom dūzān: the tanghīm's own 1/1, then
   * fourths upward wherever an available open note sits at one. Only a default
   * for a newly added watar — every string is individually overridable, and
   * nothing here resolves a value the reader explicitly asked for.
   */
  const customTuning = useMemo(
    () =>
      (count: number): NoteName[] => {
        if (!availableOpenNotes.length) return [];
        const tonic = allPitchClasses.find((pc) => pc.pitchClassIndex === 0 && pc.octave === 1);
        const start =
          (tonic && availableOpenNotes.find((o) => o.noteName === tonic.noteName)) ||
          availableOpenNotes[0];

        const chosen = [start];
        while (chosen.length < count) {
          const previous = chosen[chosen.length - 1];
          const higher = availableOpenNotes.filter((o) => o.cents > previous.cents + 1e-6);
          if (!higher.length) break;
          const target = previous.cents + FOURTH_CENTS;
          const atAFourth = higher.reduce((best, o) =>
            Math.abs(o.cents - target) < Math.abs(best.cents - target) ? o : best
          );
          chosen.push(atAFourth);
        }
        return chosen.map((o) => o.noteName);
      },
    [availableOpenNotes, allPitchClasses]
  );

  const fretboard = useMemo(
    () => getFretboardDivisions(allPitchClasses, openStringNoteNames),
    [allPitchClasses, openStringNoteNames]
  );

  const highlighted = useMemo(
    () => new Set(highlightPitchClasses.map((pc) => `${pc.pitchClassIndex}:${pc.octave}`)),
    [highlightPitchClasses]
  );

  /**
   * The DOM facts the layout needs: how wide a track is, and the tail width
   * the stylesheet declares. Read-only — React alone writes the tree.
   */
  const plotRef = useRef<HTMLDivElement>(null);
  const [plotMetrics, setPlotMetrics] = useState({ trackWidth: 0, tail: 0 });
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    const plot = plotRef.current;
    if (!plot) return;

    const measure = () => {
      const track = plot.querySelector<HTMLElement>(".oud-fretboard__track");
      if (!track) return;
      const next = {
        trackWidth: Math.round(track.getBoundingClientRect().width),
        tail: parseFloat(getComputedStyle(plot).getPropertyValue("--fretboard-tail")) || 0,
      };
      setPlotMetrics((previous) =>
        previous.trackWidth === next.trackWidth && previous.tail === next.tail ? previous : next
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(plot);

    /* Widths measured against the fallback font would make wrap decisions the
       loaded font then contradicts. */
    let cancelled = false;
    document.fonts?.ready
      ?.then(() => {
        if (!cancelled) setFontsReady(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [fretboard]);

  const isNumeric = NUMERIC_MODES.includes(labelMode);

  /**
   * A tanghīm may leave pitch classes unnamed — the literal "none". Those are
   * still real divisions and still drawn, as a shorter tick, but they carry no
   * label in any mode.
   */
  const labelFor = useCallback(
    (pitchClass: PitchClass): string => {
      if (!pitchClass.noteName || pitchClass.noteName === "none") return "";
      switch (labelMode) {
        case "ipn":
          return pitchClass.englishName && pitchClass.englishName !== "--" ? pitchClass.englishName : "";
        case "solfege":
          return pitchClass.solfege && pitchClass.solfege !== "--" ? pitchClass.solfege : "";
        case "ratio":
          return pitchClass.fraction || "";
        case "cents":
          return String(Math.round(parseFloat(pitchClass.cents)));
        case "fretDivision":
          return String(Math.round(parseFloat(pitchClass.fretDivision)));
        default:
          return getDisplayName(pitchClass.noteName, "note");
      }
    },
    [labelMode, getDisplayName]
  );

  /**
   * The whole label layout as pure data: band assignment, wrap decisions and
   * lane heights. A label may take all the room to its nearest neighbour in
   * its own band and wraps only when its natural width genuinely exceeds it;
   * names anchor their left edge to the tick and need room rightward only,
   * numeric labels centre on the tick and are narrow enough to go unbounded.
   */
  const plan = useMemo<RowPlan[] | null>(() => {
    if (!fretboard.ok) return null;
    const { trackWidth, tail } = plotMetrics;
    const measurable = trackWidth > 0 && typeof document !== "undefined";
    const font = isNumeric ? NUMERIC_FONT : NAME_FONT;
    void fontsReady; // re-plan once real font metrics are available

    return fretboard.strings.map((string) => {
      /* Bands alternate over labelled divisions only: counting unnamed ones
         would break the above/below alternation. */
      let labelSequence = 0;
      const labels: (LabelPlan | null)[] = string.divisions.map((division) => {
        const text = labelFor(division.pitchClass);
        if (!text) return null;
        return {
          text,
          band: labelSequence++ % 2 === 0 ? ("above" as const) : ("below" as const),
          wrap: false,
          maxWidth: null,
        };
      });

      if (!measurable) return { labels, trackHeight: null };

      let tallestAbove = 0;
      let tallestBelow = 0;

      (["above", "below"] as const).forEach((bandName) => {
        const band: { index: number; x: number }[] = [];
        string.divisions.forEach((division, index) => {
          if (labels[index]?.band === bandName) {
            band.push({ index, x: (division.position / FRETBOARD_MAX_POSITION) * trackWidth });
          }
        });

        band.forEach((entry, position) => {
          const label = labels[entry.index]!;
          let height: number;

          if (isNumeric) {
            height =
              labelMode === "ratio" && label.text.includes("/")
                ? FRACTION_LABEL_HEIGHT
                : NUMERIC_LABEL_HEIGHT;
          } else {
            const roomRight =
              position < band.length - 1 ? band[position + 1].x - entry.x : trackWidth + tail - entry.x;
            const width = Math.max(
              MIN_LABEL_WIDTH,
              Math.min(roomRight - LABEL_CLEARANCE, MAX_LABEL_WIDTH)
            );
            if (textWidth(label.text, font) > width + 0.5) {
              label.wrap = true;
              label.maxWidth = Math.ceil(width);
              height = wrappedLineCount(label.text, width, font) * NAME_LINE_HEIGHT;
            } else {
              height = NAME_LINE_HEIGHT;
            }
          }

          if (bandName === "above") tallestAbove = Math.max(tallestAbove, height);
          else tallestBelow = Math.max(tallestBelow, height);
        });
      });

      const needed = Math.max(TICK_HALF, LABEL_GAP + tallestAbove, LABEL_GAP + tallestBelow);
      return { labels, trackHeight: Math.ceil(2 * (needed + LANE_PADDING)) };
    });
  }, [fretboard, labelFor, isNumeric, labelMode, plotMetrics, fontsReady]);

  function selectPreset(id: string) {
    setPresetId(id);
    if (id === CUSTOM_PRESET_ID) {
      setOpenStringNoteNames(customTuning(MIN_STRINGS));
      return;
    }
    const preset = fretboardPresets.find((p) => p.id === id);
    if (preset) setOpenStringNoteNames(preset.openStringNoteNames);
  }

  /** Changing the count is a customisation of whatever preset was showing. */
  function selectStringCount(count: number) {
    setPresetId(CUSTOM_PRESET_ID);
    setOpenStringNoteNames((current) => {
      if (count <= current.length) return current.slice(0, count);
      const grown = [...current];
      while (grown.length < count) {
        const previousCents =
          availableOpenNotes.find((o) => o.noteName === grown[grown.length - 1])?.cents ?? -Infinity;
        const higher = availableOpenNotes.filter((o) => o.cents > previousCents + 1e-6);
        if (!higher.length) break;
        const target = previousCents + FOURTH_CENTS;
        grown.push(
          higher.reduce((best, o) =>
            Math.abs(o.cents - target) < Math.abs(best.cents - target) ? o : best
          ).noteName
        );
      }
      return grown;
    });
  }

  function selectOpenString(index: number, noteName: NoteName) {
    setPresetId(CUSTOM_PRESET_ID);
    setOpenStringNoteNames((current) => current.map((n, i) => (i === index ? noteName : n)));
  }

  function reasonText(reason: FretboardUnavailability): string {
    if (reason.kind === "fretDivisionValueType") return t("fretboard.fretDivisionUnsupported");
    const watar = `${t("fretboard.watar")} ${openStringNoteNames.length - reason.stringIndex}`;
    const note = getDisplayName(reason.noteName, "note");
    const why =
      reason.kind === "noteNotInSystem"
        ? t("fretboard.noteNotInSystem")
        : reason.kind === "notAscending"
        ? t("fretboard.notAscending")
        : t("fretboard.noOctaveAbove");
    return `${watar} — ${note} ${why}`;
  }

  return (
    <div className="oud-fretboard">
      <div className="oud-fretboard__controls">
        <div className="oud-fretboard__control">
          <span className="oud-fretboard__control-label">{t("fretboard.duzan")}</span>
          <select
            className="oud-fretboard__select"
            value={presetId}
            onChange={(e) => selectPreset(e.target.value)}
          >
            <option value={CUSTOM_PRESET_ID}>{t("fretboard.custom")}</option>
            {fretboardPresets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {t(`fretboard.preset.${preset.id}`)}
              </option>
            ))}
          </select>

          <span className="oud-fretboard__control-label">{t("fretboard.awtar")}</span>
          <select
            className="oud-fretboard__select oud-fretboard__select_narrow"
            value={openStringNoteNames.length}
            onChange={(e) => selectStringCount(Number(e.target.value))}
          >
            {Array.from({ length: MAX_STRINGS - MIN_STRINGS + 1 }, (_, i) => MIN_STRINGS + i).map(
              (n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              )
            )}
          </select>
        </div>

        <div className="oud-fretboard__control">
          <span className="oud-fretboard__control-label">{t("fretboard.labels")}</span>
          <div className="oud-fretboard__segments" role="group">
            {LABEL_MODES.map((mode) => (
              <button
                key={mode}
                className={
                  "oud-fretboard__segment" +
                  (labelMode === mode ? " oud-fretboard__segment_active" : "")
                }
                aria-pressed={labelMode === mode}
                onClick={() => setLabelMode(mode)}
              >
                {t(`fretboard.label.${mode}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!fretboard.ok ? (
        <div className="oud-fretboard__unavailable">
          <p className="oud-fretboard__unavailable-title">{t("fretboard.unavailable")}</p>
          {fretboard.reasons.map((reason, i) => (
            <p key={i} className="oud-fretboard__unavailable-item">
              {reasonText(reason)}
            </p>
          ))}
        </div>
      ) : (
        /* Direction-locked: the anf is always at the left and the octave always
           at the right, in every language. Only the chrome above mirrors. */
        <div className="oud-fretboard__plot" style={{ direction: "ltr" }} ref={plotRef}>
          <div className="oud-fretboard__scale">
            <span className="oud-fretboard__scale-gutter" />
            <span className="oud-fretboard__scale-head" />
            <span className="oud-fretboard__scale-track">
              <span className="oud-fretboard__scale-mark oud-fretboard__scale-mark_start">
                {t("fretboard.anf")}
              </span>
              <span className="oud-fretboard__scale-mark" style={{ left: "50%" }}>
                {t("fretboard.quarterString")}
              </span>
              <span className="oud-fretboard__scale-mark oud-fretboard__scale-mark_end">
                {t("fretboard.halfString")}
              </span>
            </span>
            <span className="oud-fretboard__scale-tail" />
          </div>

          {fretboard.strings.map((string, stringIndex) => {
            const row = plan![stringIndex];
            return (
              <div className="oud-fretboard__row" key={stringIndex}>
                <div className="oud-fretboard__gutter">
                  <select
                    className="oud-fretboard__open-select"
                    value={string.openPitchClass.noteName}
                    onChange={(e) => selectOpenString(stringIndex, e.target.value as NoteName)}
                  >
                    {availableOpenNotes.map((option) => (
                      <option key={option.noteName} value={option.noteName}>
                        {getDisplayName(option.noteName, "note")}
                      </option>
                    ))}
                  </select>
                  <span className="oud-fretboard__course">
                    <span className="oud-fretboard__course-number">{string.courseNumber}</span>
                    {string.openPitchClass.fraction && (
                      <span className="oud-fretboard__course-value">
                        {string.openPitchClass.fraction}
                      </span>
                    )}
                  </span>
                </div>

                <div className="oud-fretboard__head" />

                <div
                  className="oud-fretboard__track"
                  style={row.trackHeight ? { height: `${row.trackHeight}px` } : undefined}
                >
                  <span className="oud-fretboard__string" />
                  <span className="oud-fretboard__anf" />
                  <span className="oud-fretboard__octave-end" />

                  {string.divisions.map((division, divisionIndex) => {
                    const { pitchClass } = division;
                    const label = row.labels[divisionIndex];
                    const isHighlighted = highlighted.has(
                      `${pitchClass.pitchClassIndex}:${pitchClass.octave}`
                    );
                    return (
                      <span
                        key={`d${divisionIndex}`}
                        className={
                          "oud-fretboard__division" +
                          (label ? "" : " oud-fretboard__division_unnamed") +
                          (division.beyondHandover ? " oud-fretboard__division_beyond" : "") +
                          (division.isOpen ? " oud-fretboard__division_open" : "") +
                          (division.isOctave ? " oud-fretboard__division_octave" : "") +
                          (isHighlighted ? " oud-fretboard__division_highlighted" : "")
                        }
                        style={{ left: `${(division.position / FRETBOARD_MAX_POSITION) * 100}%` }}
                        data-tooltip={`${getDisplayName(pitchClass.noteName, "note")}  ·  ${
                          pitchClass.fraction
                        }  ·  ${Math.round(
                          parseFloat(pitchClass.cents) - centsOf(string.openPitchClass)
                        )}¢ ${t("fretboard.aboveOpen")}`}
                      >
                        <span className="oud-fretboard__hit" />
                        <span className="oud-fretboard__tick" />
                        {label && (
                          <span
                            className={
                              "oud-fretboard__label" +
                              (isNumeric ? " oud-fretboard__label_numeric" : "") +
                              (label.band === "above"
                                ? " oud-fretboard__label_above"
                                : " oud-fretboard__label_below")
                            }
                            style={
                              label.wrap
                                ? { whiteSpace: "normal", maxWidth: `${label.maxWidth}px` }
                                : undefined
                            }
                          >
                            {labelMode === "ratio" ? (
                              <Fraction value={label.text} />
                            ) : label.wrap ? (
                              noteNameWithBreaks(label.text)
                            ) : (
                              label.text
                            )}
                          </span>
                        )}
                      </span>
                    );
                  })}

                  {/* A dastān is tied across the neck, so it crosses awtār on
                      which it lands on no pitch of the tanghīm. */}
                  {string.phantomPositions.map((position, i) => (
                    <span
                      key={`p${i}`}
                      className="oud-fretboard__division oud-fretboard__division_phantom"
                      style={{ left: `${(position / FRETBOARD_MAX_POSITION) * 100}%` }}
                    >
                      <span className="oud-fretboard__tick" />
                    </span>
                  ))}
                </div>

                <div className="oud-fretboard__tail" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** A ratio reads as a true fraction: numerator over denominator with a rule. */
function Fraction({ value }: { value: string }) {
  const parts = value.split("/");
  if (parts.length !== 2) return <>{value}</>;
  return (
    <span className="oud-fretboard__fraction">
      <span className="oud-fretboard__fraction-numerator">{parts[0]}</span>
      <span className="oud-fretboard__fraction-denominator">{parts[1]}</span>
    </span>
  );
}
