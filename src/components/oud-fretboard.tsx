"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useAppContext from "@/contexts/app-context";
import useLanguageContext from "@/contexts/language-context";
import PitchClass from "@/models/PitchClass";
import NoteName from "@/models/NoteName";
import getFretboardDivisions, {
  centsAtPosition,
  FRETBOARD_MAX_POSITION,
  FretboardString,
  FretboardUnavailability,
  getSourceOudDivisions,
  ratioValue,
} from "@/functions/getFretboardDivisions";
import { SourceOudFret } from "@/models/SourceOud";
import CentsToleranceInput from "./cents-tolerance-input";
import {
  CUSTOM_PRESET_ID,
  MAX_STRINGS,
  MIN_STRINGS,
  FretboardPreset,
  SOURCE_PRESET_ID,
  fretboardPresets,
  resolveDuzan,
  openStringNoteNameOptions,
} from "@/models/FretboardPreset";
import noteNameWithBreaks from "@/functions/noteNameWithBreaks";
import { isExactOctave, octaveEquivalentIndex } from "@/functions/octaveLayout";

/** What each dastān is labelled with. One at a time. */
type LabelMode = "pao" | "ipn" | "solfege" | "ratio" | "cents" | "fretDivision";

const LABEL_MODES: LabelMode[] = ["pao", "ipn", "solfege", "ratio", "cents", "fretDivision"];

/** The dūzān that draws the ʿūd the tuning system's source describes (see SourceOud). */
/** Half the string's length from the anf: the octave of the open string. */
const HALF_STRING = 0.5;

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

/** The widest piece a name cannot be broken inside (between spaces and after slashes). */
function longestWordWidth(text: string, font: string): number {
  return Math.max(0, ...text.split(" ").flatMap((word) => word.split("/").map((part, i, parts) => textWidth(i < parts.length - 1 ? `${part}/` : part, font))));
}

/** The plan for one division's label: what to draw and how much room it has. */
interface LabelPlan {
  text: string;
  band: "above" | "below";
  wrap: boolean;
  maxWidth: number | null;
  /** Ends at its tick instead of starting there: the last name in a band, with no room left to its right */
  endAligned: boolean;
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
  const { allPitchClasses, selectedTuningSystem, sourceOud, duzanChoice, setDuzanChoice, centsTolerance } = useAppContext();
  /** The dotted fret being hovered, read off on its own watar */
  const [probe, setProbe] = useState<{ stringIndex: number; position: number } | null>(null);
  const { t, getDisplayName, language } = useLanguageContext();

  const [labelMode, setLabelMode] = useState<LabelMode>("pao");
  /**
   * The dūzān (see DuzanChoice, kept in the app context so the URL carries it).
   * Without a choice for this tuning system, one whose source describes its ʿūd
   * opens on that ʿūd, so what is drawn is what the theorist gives; any other
   * opens on the default dūzān. A "source" choice whose ʿūd has since been
   * removed in the admin falls to the default too.
   */
  const tuningSystemId = selectedTuningSystem?.getId() ?? "";
  const { presetId, openStringNoteNames } = useMemo(
    () => resolveDuzan(duzanChoice, tuningSystemId, !!sourceOud),
    [duzanChoice, tuningSystemId, sourceOud]
  );

  const showingSource = presetId === SOURCE_PRESET_ID && !!sourceOud;
  const fretName = useCallback(
    (fret: SourceOudFret) => (language === "ar" ? fret.nameArabic : fret.nameEnglish),
    [language]
  );
  const choose = (nextPresetId: string, customOpenStrings: NoteName[] = []) =>
    setDuzanChoice({ tuningSystemId, presetId: nextPresetId, customOpenStrings });

  /** Open-string names that actually resolve in this tanghīm, lowest first. */
  const availableOpenNotes = useMemo(() => {
    const byName = new Map<string, number>();
    allPitchClasses.forEach((pc) => {
      if (!pc.noteName || pc.noteName === "none") return;
      // An open watar needs the tuning system's own octave of its note (octaveLayout)
      if (octaveEquivalentIndex(allPitchClasses, pc, 1) === -1) return;
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
    () =>
      showingSource
        ? getSourceOudDivisions(allPitchClasses, sourceOud!, centsTolerance)
        : getFretboardDivisions(allPitchClasses, openStringNoteNames, centsTolerance),
    [allPitchClasses, openStringNoteNames, showingSource, sourceOud, centsTolerance]
  );

  /**
   * The drawn window's far end: half the string, or further when a watar's own
   * octave lies beyond it. The source's ʿūd keeps the half-string window too, so
   * its frets sit where they sit on the same neck as every other dūzān.
   */
  const windowEnd = Math.max(FRETBOARD_MAX_POSITION, fretboard.ok ? fretboard.maxPosition : 0);

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
          endAligned: false,
        };
      });

      if (!measurable) return { labels, trackHeight: null };

      let tallestAbove = 0;
      let tallestBelow = 0;

      (["above", "below"] as const).forEach((bandName) => {
        const band: { index: number; x: number }[] = [];
        string.divisions.forEach((division, index) => {
          if (labels[index]?.band === bandName) {
            band.push({ index, x: (division.position / windowEnd) * trackWidth });
          }
        });

        /* At the far end a name would run past the band. That last name is
           settled first: it reads leftward from its tick, at its full width,
           and the name before it gets room only up to where it begins. */
        const lastEntry = band[band.length - 1];
        const previousEntry = band.length > 1 ? band[band.length - 2] : null;
        const lastNatural = lastEntry && !isNumeric ? textWidth(labels[lastEntry.index]!.text, font) : 0;
        const lastEndAligned = !!lastEntry && !isNumeric && lastNatural > trackWidth + tail - lastEntry.x - LABEL_CLEARANCE;
        /* The last name and the one before it share what is left between the
           earlier tick and the band's end: the last name at most half of it
           (more only if one word needs it), wrapping onto lines as needed */
        const sharedSpan = previousEntry ? trackWidth + tail - previousEntry.x : Infinity;
        const lastWidth = lastEndAligned
          ? Math.min(lastNatural, MAX_LABEL_WIDTH, Math.max(sharedSpan / 2, longestWordWidth(labels[lastEntry.index]!.text, font)))
          : 0;
        const lastStart = lastEndAligned ? lastEntry.x - lastWidth : Infinity;
        band.forEach((entry, position) => {
          const label = labels[entry.index]!;
          let height: number;

          if (isNumeric) {
            height =
              labelMode === "ratio" && label.text.includes("/")
                ? FRACTION_LABEL_HEIGHT
                : NUMERIC_LABEL_HEIGHT;
          } else {
            const last = position === band.length - 1;
            label.endAligned = last && lastEndAligned;
            const nextStart = last ? trackWidth + tail : position === band.length - 2 ? Math.min(band[position + 1].x, lastStart) : band[position + 1].x;
            const room = label.endAligned ? lastWidth + LABEL_CLEARANCE : nextStart - entry.x;
            const natural = textWidth(label.text, font);
            const width = Math.max(MIN_LABEL_WIDTH, Math.min(room - LABEL_CLEARANCE, MAX_LABEL_WIDTH));
            if (natural > width + 0.5) {
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
  }, [fretboard, windowEnd, labelFor, isNumeric, labelMode, plotMetrics, fontsReady]);

  /** A preset's name in the picker (see FretboardPreset.label). */
  function presetName(preset: FretboardPreset): string {
    if ("key" in preset.label) return t(preset.label.key);
    const notes = preset.openStringNoteNames;
    const name = t(`fretboard.preset.range.${notes.length}`)
      .replace("{first}", getDisplayName(notes[0], "note"))
      .replace("{last}", getDisplayName(notes[notes.length - 1], "note"));
    const shown = preset.label.showString;
    if (!shown) return name;
    // Tablature numbering: string n is the n-th from the top, so the lowest is string notes.length
    const note = notes[notes.length - shown];
    return `${name} ${t("fretboard.preset.withString").replace("{note}", getDisplayName(note, "note")).replace("{string}", String(shown))}`;
  }

  function selectPreset(id: string) {
    choose(id, id === CUSTOM_PRESET_ID ? customTuning(MIN_STRINGS) : []);
  }

  /** Changing the count is a customisation of whatever preset was showing. */
  function selectStringCount(count: number) {
    choose(CUSTOM_PRESET_ID, (() => {
      const current = openStringNoteNames;
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
    })());
  }

  function selectOpenString(index: number, noteName: NoteName) {
    choose(CUSTOM_PRESET_ID, openStringNoteNames.map((n, i) => (i === index ? noteName : n)));
  }

  function reasonText(reason: FretboardUnavailability): string {
    if (reason.kind === "fretDivisionValueType") return t("fretboard.fretDivisionUnsupported");
    if (reason.kind === "sourcePitchNotInSystem")
      return `${reason.stringName}, ${reason.fretName} (${reason.ratio}) ${t("fretboard.sourcePitchNotInSystem")}`;
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

  /**
   * How far a dotted fret (tied for another watar) falls from this watar's
   * nearest pitch: the pitch, and how many cents the fret sounds above (+) or
   * below (−) it.
   */
  function probeReading(string: FretboardString, position: number) {
    const cents = centsAtPosition(position);
    const nearest = string.divisions.reduce((best, d) =>
      Math.abs(centsAtPosition(d.position) - cents) < Math.abs(centsAtPosition(best.position) - cents) ? d : best
    );
    const difference = cents - centsAtPosition(nearest.position);
    const { pitchClass } = nearest;
    const name =
      pitchClass.noteName && pitchClass.noteName !== "none"
        ? getDisplayName(pitchClass.noteName, "note")
        : pitchClass.fraction || `${Math.round(parseFloat(pitchClass.cents))}¢`;
    const rounded = Math.round(difference * 10) / 10;
    return `${name} ${rounded > 0 ? "+" : "−"}${Math.abs(rounded).toFixed(1)}¢`;
  }

  return (
    <div className={"oud-fretboard" + (showingSource ? "" : " oud-fretboard_choosing-notes")}>
      <div className="oud-fretboard__controls">
        <div className="oud-fretboard__control">
          <span className="oud-fretboard__control-label">{t("fretboard.duzan")}</span>
          <select
            className="oud-fretboard__select"
            value={presetId}
            onChange={(e) => selectPreset(e.target.value)}
          >
            {sourceOud && <option value={SOURCE_PRESET_ID}>{t("fretboard.sourceOud")}</option>}
            <option value={CUSTOM_PRESET_ID}>{t("fretboard.custom")}</option>
            {fretboardPresets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {presetName(preset)}
              </option>
            ))}
          </select>

          <span className="oud-fretboard__control-label">{t("fretboard.awtar")}</span>
          <select
            className="oud-fretboard__select oud-fretboard__select_narrow"
            value={showingSource ? sourceOud!.strings.length : openStringNoteNames.length}
            disabled={showingSource}
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
          <span className="oud-fretboard__control-label">{t("maqam.centsTolerance")}</span>
          <span className="oud-fretboard__tolerance">
            <CentsToleranceInput />
          </span>
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
          {/* The anf and the half-string mark, at their real place on the string.
              With the source's frets shown they share the fret names' line;
              otherwise they have a line of their own. */}
          {(() => {
            const scaleMarks = (
              <>
                <span className="oud-fretboard__scale-mark oud-fretboard__scale-mark_start">{t("fretboard.anf")}</span>
                {HALF_STRING <= windowEnd + 1e-9 &&
                  (Math.abs(HALF_STRING - windowEnd) < 1e-9 ? (
                    <span className="oud-fretboard__scale-mark oud-fretboard__scale-mark_end">{t("fretboard.halfString")}</span>
                  ) : (
                    <span className="oud-fretboard__scale-mark" style={{ left: `${(HALF_STRING / windowEnd) * 100}%` }}>
                      {t("fretboard.halfString")}
                    </span>
                  ))}
              </>
            );
            return showingSource ? (
              /* The source's frets are tied across the neck, so their names sit
                 once above the awtār, not on each watar. */
              <div className="oud-fretboard__fret-names">
                <span className="oud-fretboard__scale-gutter" />
                <span className="oud-fretboard__scale-head" />
                <span className="oud-fretboard__fret-names-track">
                  {scaleMarks}
                  {/* The anf and the half-string get the frets' marker too, at their exact place */}
                  <span className="oud-fretboard__fret-name" style={{ left: 0 }} />
                  {HALF_STRING <= windowEnd + 1e-9 && <span className="oud-fretboard__fret-name" style={{ left: `${(HALF_STRING / windowEnd) * 100}%` }} />}
                  {sourceOud?.frets.map((fret) => (
                    <span
                      key={fret.id}
                      className="oud-fretboard__fret-name"
                      style={{ left: `${((1 - 1 / ratioValue(fret.ratio)) / windowEnd) * 100}%` }}
                    >
                      <span className="oud-fretboard__fret-name-text">{fretName(fret)}</span>
                    </span>
                  ))}
                </span>
                <span className="oud-fretboard__scale-tail" />
              </div>
            ) : (
              <div className="oud-fretboard__scale">
                <span className="oud-fretboard__scale-gutter" />
                <span className="oud-fretboard__scale-head" />
                <span className="oud-fretboard__scale-track">{scaleMarks}</span>
                <span className="oud-fretboard__scale-tail" />
              </div>
            );
          })()}

          {fretboard.strings.map((string, stringIndex) => {
            const row = plan![stringIndex];
            return (
              <div className="oud-fretboard__row" key={stringIndex}>
                <div className="oud-fretboard__gutter">
                  {/* The open note is chosen only in a custom dūzān; the source's ʿūd
                      shows its own string names, a preset its open notes */}
                  {string.sourceString ? (
                    <span className="oud-fretboard__string-name">
                      {language === "ar" ? string.sourceString.nameArabic : string.sourceString.nameEnglish}
                    </span>
                  ) : presetId !== CUSTOM_PRESET_ID ? (
                    <span className="oud-fretboard__string-name">{getDisplayName(string.openPitchClass.noteName, "note")}</span>
                  ) : (
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
                  )}
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
                          (isHighlighted ? " oud-fretboard__division_highlighted" : "") +
                          (isExactOctave(allPitchClasses, pitchClass) ? "" : " oud-fretboard__division_not-exact-octave")
                        }
                        style={{ left: `${(division.position / windowEnd) * 100}%` }}
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
                                : " oud-fretboard__label_below") +
                              (label.endAligned ? " oud-fretboard__label_end" : "")
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
                      style={{ left: `${(position / windowEnd) * 100}%` }}
                      onMouseEnter={() => setProbe({ stringIndex, position })}
                      onMouseLeave={() => setProbe(null)}
                    >
                      <span className="oud-fretboard__hit" />
                      <span className="oud-fretboard__tick" />
                    </span>
                  ))}

                  {/* The hovered dotted fret, read off on this watar */}
                  {probe && probe.stringIndex === stringIndex && (() => {
                    const reading = probeReading(string, probe.position);
                    const at = probe.position / windowEnd;
                    return (
                      <span className="oud-fretboard__probe" style={{ left: `${at * 100}%` }}>
                        <span className="oud-fretboard__probe-line" />
                        <span
                          className={
                            "oud-fretboard__probe-reading" +
                            (at < 0.1 ? " oud-fretboard__probe-reading_start" : at > 0.9 ? " oud-fretboard__probe-reading_end" : "")
                          }
                        >
                          {reading}
                        </span>
                      </span>
                    );
                  })()}
                </div>

                <div className="oud-fretboard__tail" />
              </div>
            );
          })}
        </div>
      )}

      {/* The key to the marks, read after the strings it explains */}
      {fretboard.ok &&
        fretboard.strings.some((s) => s.divisions.some((d) => !isExactOctave(allPitchClasses, d.pitchClass))) && (
          <p className="oud-fretboard__not-exact-octave-legend">{t("octave.notExactOctaveLegend")}</p>
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
