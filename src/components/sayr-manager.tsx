"use client";

import React, { FormEvent, useEffect, useState } from "react";
import useAppContext from "@/contexts/app-context";
import useLanguageContext from "@/contexts/language-context";
import useSoundContext from "@/contexts/sound-context";
import { Sayr, SayrStop } from "@/models/Maqam";
import NoteName, {
  octaveZeroNoteNames,
  octaveOneNoteNames,
  octaveTwoNoteNames,
  octaveThreeNoteNames,
  getNoteNameIndex,
  getNoteNameIndexAndOctave,
} from "@/models/NoteName";
import PitchClass from "@/models/PitchClass";
import { updateMaqamat } from "@/functions/update";
import { transposeSayr } from "@/functions/transpose";
import JinsData from "@/models/Jins";
import Link from "next/link";
import { calculateJinsTranspositions, calculateMaqamTranspositions } from "@/functions/transpose";
import shiftPitchClassByOctave from "@/functions/shiftPitchClassByOctave";
import { stringifySource } from "@/models/bibliography/Source";
import { useLocalizedHref } from "@/hooks/use-localized-href";

export default function SayrManager({ admin }: { admin: boolean }) {
  const { t, getDisplayName, language } = useLanguageContext();
  const lh = useLocalizedHref();
  const { 
    selectedMaqamData, setSelectedMaqamData, ajnas, maqamSayrId, setMaqamSayrId, sources, maqamat, setMaqamat, selectedMaqam, allPitchClasses, 
    centsTolerance
  } = useAppContext();
  const { playSequence, noteOn, noteOff } = useSoundContext();

  const [creatorEnglish, setCreatorEnglish] = useState("");
  const [creatorArabic, setCreatorArabic] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [page, setPage] = useState("");
  const [commentsEnglish, setCommentsEnglish] = useState("");
  const [commentsArabic, setCommentsArabic] = useState("");
  const [stops, setStops] = useState<SayrStop[]>([]);
  const [hasTranspositionIssues, setHasTranspositionIssues] = useState(false);
  
  // Track the last manually selected sayr ID to avoid re-running effect on context changes
  const resetForm = () => {
    setCreatorEnglish("");
    setCreatorArabic("");
    setSourceId("");
    setPage("");
    setCommentsEnglish("");
    setCommentsArabic("");
    setStops([]);
    setHasTranspositionIssues(false);
  };

  // Load sayr data when manually selected (not when context changes)
  const loadSayrData = () => {
    if (selectedMaqamData && maqamSayrId) {
      let sel: Sayr | undefined = selectedMaqamData.getSuyur().find((s) => s.id === maqamSayrId);

      if (sel) {
        if (!admin && selectedMaqam && allPitchClasses) {
          try {
            const transpositionResult = transposeSayr(sel, allPitchClasses, selectedMaqamData, selectedMaqam);
            sel = transpositionResult.transposedSayr;
            setHasTranspositionIssues(transpositionResult.hasOutOfBoundsNotes);
          } catch (error) {
            console.warn("Failed to transpose sayr:", error);
            setHasTranspositionIssues(true);
          }
        } else {
          setHasTranspositionIssues(false);
        }
        
        setCreatorEnglish(sel.creatorEnglish ?? "");
        setCreatorArabic(sel.creatorArabic ?? "");
        setSourceId(sel.sourceId ?? "");
        setPage(sel.page ?? "");
        setCommentsEnglish(sel.commentsEnglish ?? "");
        setCommentsArabic(sel.commentsArabic ?? "");
        setStops(sel.stops.map((s) => ({ ...s })));
        return;
      }
    }
    resetForm();
  };

  useEffect(() => {
    // Only run if this is a manual sayr ID change, not a context change
      loadSayrData();
  }, [maqamSayrId, selectedMaqamData, selectedMaqam]);

  // Initial load
  useEffect(() => {
    loadSayrData();
  }, []);

  // Click handlers for sayr stops in non-admin mode - simplified to just play sequences
  const handleJinsStopClick = (jinsData: JinsData, startingNote?: string) => {
    if (admin || !allPitchClasses) return;
    
    let pitchClasses: PitchClass[] = [];
    
    if (startingNote) {
      // Find the transposition that starts with the specified note
      const jinsTranspositions = calculateJinsTranspositions(allPitchClasses, jinsData, true, centsTolerance);
      const targetTransposition = jinsTranspositions.find(jins => jins.jinsPitchClasses[0].noteName === startingNote);
      
      if (targetTransposition) {
        pitchClasses = targetTransposition.jinsPitchClasses;
      }
    }
    
    // Fallback to default behavior (tahlil) - get all notes of the jins
    if (pitchClasses.length === 0) {
      const jinsNoteNames = jinsData.getNoteNames();
      for (const pitchClass of allPitchClasses) {
        if (jinsNoteNames.includes(pitchClass.noteName)) pitchClasses.push(pitchClass);
      }
    }
    
    // Play the sequence
    if (pitchClasses.length > 0) {
      playSequence(pitchClasses);
    }
  };

  const handleMaqamStopClick = (maqamId: string, startingNote?: string) => {
    if (admin || !allPitchClasses) return;
    
    // Find the maqam data
    const maqamData = maqamat.find(m => m.getId() === maqamId);
    if (!maqamData) return;
    
    let pitchClasses: PitchClass[] = [];
    
    if (startingNote) {
      // Find the transposition that starts with the specified note
      const maqamTranspositions = calculateMaqamTranspositions(allPitchClasses, ajnas, maqamData, true, centsTolerance);
      const targetTransposition = maqamTranspositions.find(m => m.ascendingPitchClasses[0].noteName === startingNote);
      
      if (targetTransposition) {
        pitchClasses = targetTransposition.ascendingPitchClasses;
      }
    }
    
    // Fallback to default behavior (tahlil) - get all notes of the maqam
    if (pitchClasses.length === 0) {
      const maqamNoteNames = maqamData.getAscendingNoteNames();
      for (const pitchClass of allPitchClasses) {
        if (maqamNoteNames.includes(pitchClass.noteName)) pitchClasses.push(pitchClass);
      }
    }

    if (pitchClasses.length === 7) pitchClasses = [...pitchClasses, shiftPitchClassByOctave(allPitchClasses, pitchClasses[0], 1)];
    
    // Play the sequence
    if (pitchClasses.length > 0) {
      playSequence(pitchClasses);
    }
  };

  const handleNoteStopClick = (noteName: string) => {
    if (admin || !allPitchClasses) return;
    
    // Find the pitch class for this note name
    const pitchClass = allPitchClasses.find(pc => pc.noteName === noteName);
    if (pitchClass) {
      noteOn(pitchClass);
    }
  };

  const handleNoteStopRelease = (noteName: string) => {
    if (admin || !allPitchClasses) return;
    
    // Find the pitch class for this note name
    const pitchClass = allPitchClasses.find(pc => pc.noteName === noteName);
    if (pitchClass) {
      noteOff(pitchClass);
    }
  };

  if (!selectedMaqamData) return null;
  const existingSuyur = selectedMaqamData.getSuyur();

  // The reader-facing sayr is a melodic path, so it is drawn as one: every
  // stop that names a pitch (a note, or a jins/maqām anchored on a starting
  // note) is placed on a row of a pitch ladder, and the "ascending"/
  // "descending" stops stop being boxes of their own — they become the rise
  // and fall of the track between the stops they join. Stops with no pitch
  // (a jins with no starting note) inherit the previous stop's height, so
  // the line stays continuous instead of dropping to zero.

  // A stop only earns a chip if it names something. data/maqamat.json holds
  // at least one empty note stop (maqām ḥijāz kār's last stop is
  // {type: "note", value: ""}), which used to render as a blank chip parked
  // at the previous stop's height and to count toward the stop tally.
  const namesSomething = (s: SayrStop) => s.type !== "direction" && Boolean(s.value);

  // "ascending" and "descending" are the only two words the data means as a
  // direction. It ALSO stores "none" and "" on 25 stops across the corpus,
  // and the old truthiness check (`if (prev.direction)`) let "none" through
  // as if it were a stated direction — which produced data-direction="none",
  // matched no rule, and drew an invisible connector. Everything that is not
  // one of the two words is "no direction stated".
  type StatedDirection = "ascending" | "descending" | null;
  const statedDirection = (raw: string | null | undefined): StatedDirection =>
    raw === "ascending" || raw === "descending" ? raw : null;

  const buildContour = (source: SayrStop[]) => {
    // One forward pass, and direction stops are CONSUMED rather than emitted.
    // A direction — whether it arrives as its own stop or as the `direction`
    // field on a stop — describes the motion LEAVING that point, which is the
    // motion ARRIVING at the next pitched stop. Binding it to arrival is the
    // off-by-one fix: the connector drawn between stop i and stop i+1 takes
    // stop i+1's arrival word, never stop i's. This also retires the old
    // backward `source.indexOf` scan, whose body broke on its first iteration
    // (so it was never a loop) and which depended on stop objects being
    // reference-unique.
    const pitched: { stop: SayrStop; arrival: StatedDirection }[] = [];
    let pending: StatedDirection = null;
    for (const stop of source) {
      if (stop.type === "direction") {
        // Last stated direction wins where two direction stops sit adjacent
        // (maqām rāst, nikrīz and majlis afrūz all do this); a direction stop
        // that names nothing carries no information and leaves `pending` be.
        pending = statedDirection(stop.value) ?? pending;
        continue;
      }
      if (!namesSomething(stop)) continue;
      pitched.push({ stop, arrival: pending });
      pending = statedDirection(stop.direction);
    }

    // Height comes from the note's GLOBAL index across the octave arrays
    // (getNoteNameIndex walks octaves 0→4 in order), so qarār yegāh, yegāh
    // and jawāb yegāh are three different heights an octave apart rather
    // than one. A sayr that closes an octave above where it opened must
    // read as having climbed, not as having returned to its own start.
    let carried: number | null = null;
    const withHeights = pitched.map(({ stop, arrival }) => {
      const noteName = (stop.type === "note" ? stop.value : stop.startingNote ?? "") as NoteName;
      // Two different things used to collapse into one here. A stop that
      // names NO pitch (a jins with no starting note) legitimately inherits
      // the running height. A stop that names a pitch the note tables do not
      // carry (data/maqamat.json has maqām shaṭ ʿarabān's "nīm kawasht/
      // rahāwī") is a data fault: it still inherits, so the track stays
      // continuous, but it is flagged rather than passed off as a real pitch.
      // Note also that `allNotes` is de-duplicated by a Set and exactly one
      // name — "jawāb saham/ramal tūtī" — is both the last of octave 3 and
      // the first of octave 4, so it always resolves to its octave-3 height.
      // Unreachable from the authoring selects today (they stop at octave 3);
      // extending them to octave 4 would introduce a silent octave error.
      const index = noteName && getNoteNameIndexAndOctave(noteName).octave !== -1 ? getNoteNameIndex(noteName) : -1;
      const unresolvedPitch = Boolean(noteName) && index === -1;
      const pitchIndex = index !== -1 ? index : carried;
      if (index !== -1) carried = index;
      return { stop, arrival, pitchIndex, unresolvedPitch };
    });

    // Backfill any leading stops that had no pitch to the first known one, so
    // the contour never opens with an arbitrary floor.
    const firstKnown = withHeights.find((s) => s.pitchIndex !== null)?.pitchIndex ?? 0;
    const resolved = withHeights.map((s) => ({ ...s, pitchIndex: s.pitchIndex ?? firstKnown }));

    // RANK-BASED ROWS. Every DISTINCT pitch this sayr visits gets exactly one
    // row, in pitch order; row 1 is the highest, since grid rows count down.
    //
    // Two consequences, both deliberate:
    //   1. No two different pitches can share a row, so a flat connector
    //      always means a genuinely repeated pitch. The old fixed 7-row
    //      ladder — row = ROWS - round(((p - low) / span) * (ROWS - 1)) —
    //      quantized distinct pitches together: shahnāz (93) and muḥayyar
    //      (95) both landed on row 1 in maqām awj ʿārā, and bayyātī
    //      ʿushayrān's eleven-stop descent flattened into almost no movement.
    //   2. Row distance is ORDER, not interval size. That is the honest
    //      reading of the underlying value: getNoteNameIndex returns an
    //      ordinal position in the note tables, not cents, so spacing rows
    //      proportionally would claim a precision the data does not have.
    //      The contour asserts which stop is higher than which, and no more —
    //      which is why it carries no axis, gridlines or interval readout.
    //
    // The degenerate cases need no guard: a sayr on a single pitch yields one
    // row and sits on it, and an empty sayr yields zero rows and renders
    // nothing (the caller returns early).
    const ladder = [...new Set(resolved.map((s) => s.pitchIndex as number))].sort((a, b) => a - b);
    const rows = ladder.length;

    const steps = resolved.map((entry, i) => ({
      ...entry,
      row: rows - ladder.indexOf(entry.pitchIndex as number),
      isFirst: i === 0,
      isLast: i === resolved.length - 1,
    }));

    const links = steps.slice(0, -1).map((step, i) => {
      const next = steps[i + 1];
      const span = next.row - step.row; // positive = the next stop sits lower
      // Slope follows the PITCHES, always. The stated word cannot be allowed
      // to drive it: maqām bayyātī ʿushayrān (al-Shawwā 1946:25) descends
      // through eleven consecutive stops with no stated direction at all, and
      // a word-driven track would draw that whole descent flat — deleting the
      // one thing that sayr is about.
      const motion = span < 0 ? "ascending" : span > 0 ? "descending" : "level";
      const stated = next.arrival;
      // A CONTRADICTION is the source naming one direction while the pitches
      // move the OPPOSITE way — an octave displacement, or an inconsistency
      // in the source itself. Neither party is overruled: the line goes where
      // the pitches are, because that is where the chips are, and the
      // source's word is printed on the arriving stop with the connector
      // marked. Eight transitions in the corpus are like this.
      //
      // A stated direction over a LEVEL move is deliberately NOT counted
      // (fourteen more transitions). There the source names a direction and
      // the next stop it names is the same pitch — the motion happened
      // through notes the source did not stop on. That is a gap in what was
      // written down, not a disagreement about it, and flagging it would
      // spend the accent on noise and blunt the eight that matter.
      const conflict = stated !== null && motion !== "level" && stated !== motion;
      return { span, stated, motion, conflict };
    });

    return { steps, links, rows };
  };

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSayrId = e.target.value;
    setMaqamSayrId(newSayrId);
    loadSayrData();
  };
  const addStop = () => setStops((prev) => [...prev, { type: "note", value: "" }]);
  const removeStop = (i: number) => setStops((prev) => prev.filter((_, idx) => idx !== i));
  const updateStop = (i: number, field: keyof SayrStop, val: string) => {
    setStops((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const idUse = `sayr${sourceId}`;

    const newSayr: Sayr = {
      id: idUse,
      creatorEnglish,
      creatorArabic,
      sourceId,
      page,
      commentsEnglish,
      commentsArabic,
      stops,
      version: new Date().toISOString(), // Always update sayr version on save
    };

    // Update suyur list: if exists replace it, otherwise add it
    const updated = existingSuyur.some((s) => s.id === idUse)
      ? existingSuyur.map((s) => (s.id === idUse ? newSayr : s))
      : [...existingSuyur, newSayr];

    const updatedMaqam = selectedMaqamData.createMaqamWithNewSuyur(updated);
    setSelectedMaqamData(updatedMaqam);
    setMaqamSayrId(idUse);

    const others = maqamat.filter((m) => m.getId() !== updatedMaqam.getId());
    await updateMaqamat([...others, updatedMaqam], [updatedMaqam.getId()]);
    setMaqamat([...others, updatedMaqam]);
  };

  const handleDelete = async () => {
    if (!maqamSayrId) return;
    const filtered = existingSuyur.filter((s) => s.id !== maqamSayrId);
    const updatedMaqam = selectedMaqamData.createMaqamWithNewSuyur(filtered);
    setSelectedMaqamData(updatedMaqam);
    setMaqamSayrId("");

    const others = maqamat.filter((m) => m.getId() !== updatedMaqam.getId());
    await updateMaqamat([...others, updatedMaqam], [updatedMaqam.getId()]);
    setMaqamat([...others, updatedMaqam]);
  };

  return (
    <div className="sayr-manager">
      {/* Header band: the same transpositions-header-surface the Ajnās/
          Maqāmāt taḥlīl headers use ($secondary fill, $grey border) — a
          run-in furniture-eyebrow + entity-name row, not stacked, so Suyūr
          reads as one more analysis surface instead of a page of its own. */}
      <header className="sayr-manager__header">
        <div className="sayr-manager__title-row" dir={language === "ar" ? "rtl" : "ltr"}>
          <span className="sayr-manager__section-furniture">{t("tabs.suyur")}</span>
          <span className="sayr-manager__entity-name">{getDisplayName(selectedMaqamData?.getName() || "", "maqam")}</span>
        </div>
      </header>

      {admin && (
        <div className="sayr-manager__group">
          <div className="sayr-manager__input-container">
            <label className="sayr-manager__label" htmlFor="sayrSelect">
              {t("sayr.selectOrCreate")}
            </label>
            <select id="sayrSelect" className="sayr-manager__select" value={maqamSayrId} onChange={handleSelect}>
              <option value="">{t("sayr.newSayr")}</option>
              {existingSuyur.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.creatorEnglish}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {!admin && (
        <div className="sayr-manager__list">
          {existingSuyur.length === 0 ? (
            <p className="sayr-manager__empty">{t("sayr.noSuyurAvailable")}</p>
          ) : (
            existingSuyur.map((sayr, index) => {
              const source = sources.find((s) => s.getId() === sayr.sourceId);
              const isSelected = sayr.id === maqamSayrId;
              // One source-string builder app-wide; the old hand-rolled
              // author/date concatenation here produced an unbalanced paren.
              const attribution = source ? stringifySource(source, language !== "ar", sayr.page) : t("sayr.noSource");
              // Same predicate the contour uses, so the tally can never
              // disagree with the number of chips the reader is shown.
              const stopCount = sayr.stops.filter(namesSomething).length;

              return (
                <button
                  type="button"
                  key={index}
                  className={"sayr-manager__item" + (isSelected ? " sayr-manager__item_selected" : "")}
                  // A single-select, not six independent toggles: aria-pressed
                  // announced five "not pressed" states alongside one choice.
                  aria-current={isSelected ? "true" : undefined}
                  onClick={() => setMaqamSayrId(sayr.id)}
                >
                  <span className="sayr-manager__item-name">{attribution}</span>
                  <span className="sayr-manager__item-count">
                    {stopCount} {t("sayr.stops")}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}

      <form className="sayr-manager__form" onSubmit={handleSave}>
        {admin && (
          <div className="sayr-manager__group">
            <div className="sayr-manager__input-container">
              <label className="sayr-manager__label">{t("sayr.source")}</label>
              <select className="sayr-manager__select" value={sourceId} onChange={(e) => setSourceId(e.target.value)}>
                <option value="">{t("sayr.selectSource")}</option>
                {[...sources]
                  .sort((a, b) => {
                    // Sort alphabetically by last name, or by title if no contributors
                    const aContribs = a.getContributors();
                    const bContribs = b.getContributors();
                    const aKey = aContribs && aContribs.length > 0 ? aContribs[0].lastNameEnglish.toLowerCase() : a.getTitleEnglish().toLowerCase();
                    const bKey = bContribs && bContribs.length > 0 ? bContribs[0].lastNameEnglish.toLowerCase() : b.getTitleEnglish().toLowerCase();
                    return aKey.localeCompare(bKey);
                  })
                  .map((s) => {
                    const contribs = s.getContributors();
                    const firstContributor = contribs && contribs.length > 0 ? contribs[0] : null;
                    const lastName = firstContributor ? firstContributor.lastNameEnglish : "n.a.";
                    return (
                      <option key={s.getId()} value={s.getId()}>
                        {`${lastName} (${s.getPublicationDateEnglish()}) ${s.getTitleEnglish()} (${s.getSourceType()})`}
                      </option>
                    );
                  })}
              </select>
            </div>
            <div className="sayr-manager__input-container">
              <label className="sayr-manager__label">{t("sayr.page")}</label>
              <input className="sayr-manager__input" type="text" value={page} onChange={(e) => setPage(e.target.value)} />
            </div>
          </div>
        )}

        {admin && (
          <div className="sayr-manager__group">
            <div className="sayr-manager__input-container">
              <label className="sayr-manager__label">{t("sayr.commentsEnglish")}</label>
              <textarea className="sayr-manager__textarea" rows={3} value={commentsEnglish} onChange={(e) => setCommentsEnglish(e.target.value)} />
            </div>
            <div className="sayr-manager__input-container">
              <label className="sayr-manager__label">{t("sayr.commentsArabic")}</label>
              <textarea className="sayr-manager__textarea" rows={3} dir="rtl" value={commentsArabic} onChange={(e) => setCommentsArabic(e.target.value)} />
            </div>
          </div>
        )}

        <div className="sayr-manager__stops-section">
          {!admin && hasTranspositionIssues && (
            // role=status so the warning is announced as one message; the
            // glyph is decorative, and announcing it would prepend a second
            // "warning" to the sentence that already says so.
            <div className="sayr-manager__transposition-warning" role="status">
              <span aria-hidden="true">⚠️</span> {t('sayr.transpositionWarning')}
            </div>
          )}
          
          {admin && (
            <h3 className="sayr-manager__stops-header">
              {t("sayr.stops")}{" "}
              <button type="button" className="sayr-manager__add-stop" onClick={addStop}>
                {t("sayr.addStop")}
              </button>
            </h3>
          )}

          <div className="sayr-manager__admin-stops">
            {admin &&
              stops.map((stop, i) => (
                <div key={i} className="sayr-manager__admin-stop">
                  <select className="sayr-manager__stop-type" value={stop.type} onChange={(e) => updateStop(i, "type", e.target.value)}>
                    <option value="note">{t("sayr.note")}</option>
                    <option value="jins">{t("sayr.jins")}</option>
                    <option value="maqam">{t("sayr.maqam")}</option>
                    <option value="direction">{t("sayr.direction")}</option>
                  </select>

                  {/* --- note stop --- */}
                  {stop.type === "note" && (
                    <>
                      <select className="sayr-manager__stop-value" value={stop.value} onChange={(e) => updateStop(i, "value", e.target.value)}>
                        <option value="">{t("sayr.none")}</option>
                        {octaveZeroNoteNames.map((n) => (
                          <option key={n} value={n}>
                            {getDisplayName(n, "note")}
                          </option>
                        ))}
                        <option disabled>---</option>
                        {octaveOneNoteNames.map((n) => (
                          <option key={n} value={n}>
                            {getDisplayName(n, "note")}
                          </option>
                        ))}
                        <option disabled>---</option>
                        {octaveTwoNoteNames.map((n) => (
                          <option key={n} value={n}>
                            {getDisplayName(n, "note")}
                          </option>
                        ))}
                        <option disabled>---</option>
                        {octaveThreeNoteNames.map((n) => (
                          <option key={n} value={n}>
                            {getDisplayName(n, "note")}
                          </option>
                        ))}
                      </select>
                      {/* Optional direction for note stop */}
                      <select className="sayr-manager__stop-value" value={stop.direction ?? ""} onChange={(e) => updateStop(i, "direction", e.target.value)}>
                        <option value="">{t("sayr.noDirection")}</option>
                        <option value="ascending">{t("sayr.ascending")}</option>
                        <option value="descending">{t("sayr.descending")}</option>
                      </select>
                    </>
                  )}

                  {/* --- jins stop (updated) --- */}
                  {stop.type === "jins" && (
                    <>
                      {/* 1) select which jins */}
                      <select className="sayr-manager__stop-value" value={stop.value} onChange={(e) => updateStop(i, "value", e.target.value)}>
                        <option value="">{t("sayr.none")}</option>
                        {[...ajnas]
                          .sort((a, b) => a.getName().localeCompare(b.getName()))
                          .map((j) => (
                            <option key={j.getId()} value={j.getId()}>
                              {getDisplayName(j.getName(), "jins")}
                            </option>
                          ))}
                      </select>

                      {/* 2) optional starting note for this jins */}
                      <select className="sayr-manager__stop-value" value={stop.startingNote ?? ""} onChange={(e) => updateStop(i, "startingNote", e.target.value)}>
                        <option value="">{t("sayr.none")}</option>
                        {octaveOneNoteNames.map((n) => (
                          <option key={n} value={n}>
                            {getDisplayName(n, "note")}
                          </option>
                        ))}
                        <option disabled>---</option>
                        {octaveTwoNoteNames.map((n) => (
                          <option key={n} value={n}>
                            {getDisplayName(n, "note")}
                          </option>
                        ))}
                      </select>

                      {/* 3) optional direction for this jins */}
                      <select className="sayr-manager__stop-value" value={stop.direction ?? ""} onChange={(e) => updateStop(i, "direction", e.target.value)}>
                        <option value="">{t("sayr.none")}</option>
                        <option value="ascending">{t("sayr.ascending")}</option>
                        <option value="descending">{t("sayr.descending")}</option>
                      </select>
                    </>
                  )}

                  {/* --- maqam stop (updated) --- */}
                  {stop.type === "maqam" && (
                    <>
                      {/* 1) select which maqam */}
                      <select className="sayr-manager__stop-value" value={stop.value} onChange={(e) => updateStop(i, "value", e.target.value)}>
                        <option value="">{t("sayr.none")}</option>
                        {[...maqamat]
                          .sort((a, b) => a.getName().localeCompare(b.getName()))
                          .map((m) => (
                            <option key={m.getId()} value={m.getId()}>
                              {getDisplayName(m.getName(), "maqam")}
                            </option>
                          ))}
                      </select>

                      {/* 2) optional starting note for this maqam */}
                      <select className="sayr-manager__stop-value" value={stop.startingNote ?? ""} onChange={(e) => updateStop(i, "startingNote", e.target.value)}>
                        <option value="">{t("sayr.none")}</option>
                        {octaveOneNoteNames.map((n) => (
                          <option key={n} value={n}>
                            {getDisplayName(n, "note")}
                          </option>
                        ))}
                        <option disabled>---</option>
                        {octaveTwoNoteNames.map((n) => (
                          <option key={n} value={n}>
                            {getDisplayName(n, "note")}
                          </option>
                        ))}
                      </select>

                      {/* 3) optional direction for this maqam */}
                      <select className="sayr-manager__stop-value" value={stop.direction ?? ""} onChange={(e) => updateStop(i, "direction", e.target.value)}>
                        <option value="">{t("sayr.none")}</option>
                        <option value="ascending">{t("sayr.ascending")}</option>
                        <option value="descending">{t("sayr.descending")}</option>
                      </select>
                    </>
                  )}

                  {/* --- direction stop --- */}
                  {stop.type === "direction" && (
                    <select className="sayr-manager__stop-value" value={stop.value} onChange={(e) => updateStop(i, "value", e.target.value)}>
                      <option value="">{t("sayr.none")}</option>
                      <option value="ascending">{t("sayr.ascending")}</option>
                      <option value="descending">{t("sayr.descending")}</option>
                    </select>
                  )}

                  {admin && (
                    <button type="button" className="sayr-manager__delete-stop" onClick={() => removeStop(i)}>
                      {t("sayr.delete")}
                    </button>
                  )}
                </div>
              ))}
          </div>
          {!admin && (() => {
            const { steps, links, rows } = buildContour(stops);
            if (steps.length === 0) return <p className="sayr-manager__empty">{t("sayr.noSuyurAvailable")}</p>;

            return (
            <ol
              className="sayr-manager__contour"
              // The path is an ordered sequence, so it is announced as one.
              // Connectors are list items too — they have to be, to be grid
              // items — but they are aria-hidden, so the list a screen reader
              // hears contains only the stops.
              aria-label={t("tabs.suyur")}
              style={{
                "--rows": rows,
                // n stops interleaved with n-1 runs. The run is a real TRACK,
                // not a gap, so each connector is a grid item that can span
                // rows instead of an absolutely-positioned box overflowing
                // its neighbour's cell.
                gridTemplateColumns: steps.map(() => "max-content").join(" var(--run) "),
              } as React.CSSProperties}
            >
              {steps.map((entry, i) => {
                const { stop, row, isLast, unresolvedPitch } = entry;
                const link = links[i];
                const inbound = links[i - 1]; // the move that arrived HERE

                let label = "";
                let jinsData: JinsData | undefined;
                if (stop.type === "note") {
                  label = getDisplayName(stop.value, "note");
                } else if (stop.type === "jins") {
                  jinsData = ajnas.find((j) => j.getId() === stop.value);
                  const jinsName = jinsData ? getDisplayName(jinsData.getName(), "jins") : getDisplayName(stop.value, "jins");
                  label = `${jinsName}${stop.startingNote ? t("sayr.definiteArticle") + getDisplayName(stop.startingNote, "note") : ""}`;
                } else if (stop.type === "maqam") {
                  const maqamData = maqamat.find((m) => m.getId() === stop.value);
                  const maqamName = maqamData ? getDisplayName(maqamData.getName(), "maqam") : getDisplayName(stop.value, "maqam");
                  label = `${maqamName}${stop.startingNote ? t("sayr.definiteArticle") + getDisplayName(stop.startingNote, "note") : ""}`;
                }

                // The pitch this stop names, shown quietly beneath it — the
                // reason the stop sits where it does on the track.
                const anchorNote = stop.type === "note" ? stop.value : stop.startingNote ?? "";

                // The contour states two of its three facts — pitch height and
                // melodic direction — in geometry alone, which no screen
                // reader can see. This sentence carries them in text, and it
                // is built from the PITCHES for the same reason the track is:
                // bayyātī ʿushayrān's eleven-stop descent states no direction
                // anywhere, so a word-driven phrase would go silent exactly
                // where the descent is the whole point. It is placed before
                // the label so the accessible name reads "descend to nawā".
                const motionPhrase = entry.isFirst
                  ? t("sayr.beginOn")
                  : inbound?.motion === "ascending"
                  ? t("sayr.ascendTo")
                  : inbound?.motion === "descending"
                  ? t("sayr.descendTo")
                  : t("sayr.remainOn");

                const isNote = stop.type === "note";
                // Note stops sound for as long as they are held, so the
                // keyboard needs the press and the release separately; a lone
                // onKeyDown would latch the note on. Jins/maqām stops fire one
                // sequence and get Enter/Space free from the native button.
                const holdKey = (e: React.KeyboardEvent) => e.key === " " || e.key === "Enter";

                return (
                  <React.Fragment key={i}>
                    <li
                      className="sayr-manager__contour-step"
                      // Vertical placement IS the pitch: the row is this
                      // pitch's rank among the distinct pitches the sayr
                      // visits, so equal pitches align exactly and no two
                      // different pitches can ever share a row.
                      style={{ gridRow: row, gridColumn: 2 * i + 1 } as React.CSSProperties}
                      // data-direction is gone: direction is a property of the
                      // MOVE, not of the stop, and leaving a stale off-by-one
                      // attribute in the DOM is how this bug survives a rewrite.
                    >
                      <button
                        // type="button" is load-bearing — this subtree sits
                        // inside <form onSubmit={handleSave}>, and a
                        // default-type button would write maqamat data from
                        // the reader-facing view.
                        type="button"
                        className="sayr-manager__stop"
                        data-type={stop.type}
                        data-unresolved={unresolvedPitch ? "true" : undefined}
                        onMouseDown={() => {
                          if (isNote) handleNoteStopClick(stop.value);
                        }}
                        onMouseUp={() => {
                          if (isNote) handleNoteStopRelease(stop.value);
                        }}
                        onMouseLeave={() => {
                          if (isNote) handleNoteStopRelease(stop.value);
                        }}
                        onKeyDown={(e) => {
                          if (!isNote || !holdKey(e)) return;
                          e.preventDefault(); // Space would scroll the page
                          if (e.repeat) return; // auto-repeat must not re-trigger noteOn
                          handleNoteStopClick(stop.value);
                        }}
                        onKeyUp={(e) => {
                          if (!isNote || !holdKey(e)) return;
                          e.preventDefault();
                          handleNoteStopRelease(stop.value);
                        }}
                        // Focus can leave mid-hold (tab, or a click elsewhere),
                        // and the keyup would then never arrive.
                        onBlur={() => {
                          if (isNote) handleNoteStopRelease(stop.value);
                        }}
                        onClick={() => {
                          if (stop.type === "jins" && jinsData) {
                            handleJinsStopClick(jinsData, stop.startingNote);
                          } else if (stop.type === "maqam" && stop.value) {
                            handleMaqamStopClick(stop.value, stop.startingNote);
                          }
                        }}
                      >
                        <span className="sayr-manager__stop-motion">{motionPhrase} </span>
                        <span className="sayr-manager__stop-label">{label}</span>
                        {anchorNote && stop.type !== "note" && (
                          <span className="sayr-manager__stop-anchor">{getDisplayName(anchorNote, "note")}</span>
                        )}
                        {inbound?.conflict && (
                          // The source's word for this move contradicts where
                          // the two pitches actually sit. Neither is silently
                          // resolved: the track follows the pitches, and the
                          // source's claim is printed here, attributed.
                          <span className="sayr-manager__stop-conflict">
                            {t("sayr.source")}: {t(`sayr.${inbound.stated}`)}
                          </span>
                        )}
                      </button>
                    </li>

                    {!isLast && link && (
                      // The connector is a STEP, not a diagonal: a horizontal
                      // run at this stop's pitch, one vertical riser, a
                      // horizontal run at the next stop's pitch. Only the
                      // riser carries anything — the runs are reading order.
                      // That is the honest form here, because the columns are
                      // max-content, so a diagonal's run would be the WIDTH OF
                      // A LABEL: "muḥayyar" and "awj" would draw two different
                      // slopes for the same interval.
                      <li
                        className="sayr-manager__contour-link"
                        aria-hidden="true"
                        data-motion={link.motion}
                        data-stated={link.stated ? "yes" : "no"}
                        data-conflict={link.conflict ? "true" : undefined}
                        style={{
                          gridColumn: 2 * i + 2,
                          // Top of the higher row to the bottom of the lower
                          // one, so both chip centre-lines sit exactly half a
                          // row in from an edge. All the vertical maths in the
                          // stylesheet follows from that.
                          gridRow: `${Math.min(row, steps[i + 1].row)} / ${Math.max(row, steps[i + 1].row) + 1}`,
                        } as React.CSSProperties}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </ol>
            );
          })()}

          {/* The commentary reads as a gloss ON the path above it, so it
              follows the path rather than preceding it. */}
          {!admin && (
            <div className="sayr-manager__comments-sources-container">
              <div className="sayr-manager__comments-section">
                <h3>{t("sayr.comments")}:</h3>
                <div className="sayr-manager__comments-text">
                  {language === "ar" ? commentsArabic?.trim() || commentsEnglish : commentsEnglish}
                </div>
              </div>
              <div className="sayr-manager__sources-section">
                {/* Singular deliberately: this column carries THIS sayr's one
                    source, not the parent maqām's list of source references. */}
                <h3>{t("sayr.source")}:</h3>
                <div className="sayr-manager__sources-text">
                  {(() => {
                    // This sayr's OWN source and page — not the parent maqām's
                    // source references, which describe a different claim.
                    const source = sources.find((s) => s.getId() === sourceId);
                    if (!source) return null;
                    return (
                      <Link href={lh(`/bibliography?source=${source.getId()}`)}>
                        {stringifySource(source, language !== "ar", page)}
                      </Link>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>

        {admin && (
          <div className="sayr-manager__buttons">
            <button type="submit" className="sayr-manager__save-button">
              {maqamSayrId ? t("sayr.updateSayr") : t("sayr.saveSayr")}
            </button>
            {maqamSayrId && (
              <button type="button" className="sayr-manager__delete-button" onClick={handleDelete}>
                {t("sayr.deleteSayr")}
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
