"use client";

import useAppContext, { ModulationChainHop } from "@/contexts/app-context";
import useSoundContext from "@/contexts/sound-context";
import useLanguageContext from "@/contexts/language-context";
import React, { useState, useEffect } from "react";
import { MaqamatModulations, Maqam, shiftMaqamByOctaves } from "@/models/Maqam";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import calculateNumberOfModulations from "@/functions/calculateNumberOfModulations";
import { AjnasModulations, shiftJinsByOctaves, Jins } from "@/models/Jins";
import shiftPitchClassByOctave from "@/functions/shiftPitchClassByOctave";
import modulate from "@/functions/modulate";
import { calculateMaqamTranspositions } from "@/functions/transpose";
import { standardizeText } from "@/functions/export";
type ModulationsPair = { ajnas: AjnasModulations; maqamat: MaqamatModulations };

export default function Modulations() {
  const { t, getDisplayName, language } = useLanguageContext();
  const {
    maqamat,
    ajnas,
    selectedMaqamData,
    setSelectedMaqamData,
    selectedMaqam,
    setSelectedMaqam,
    selectedJins,
    setSelectedJins,
    setSelectedJinsData,
    allPitchClasses,
    setSelectedPitchClasses,
    handleClickMaqam,
    centsTolerance,
    modulationChain,
    setModulationChain,
  } = useAppContext();

  const [modulationModes, setModulationModes] = useState<boolean[]>([false]);
  const [octaveShiftEnabled, setOctaveShiftEnabled] = useState<boolean[]>([false]);

  // Which hop in the chain is currently open below the breadcrumb. The chain
  // is a breadcrumb trail now (not a vertical stack of expandable hops), so
  // exactly one hop's modulation columns show at a time — the active one.
  const [activeHopIndex, setActiveHopIndex] = useState(0);
  const { clearHangingNotes } = useSoundContext();

  const [sourceMaqamStack, setSourceMaqamStack] = useState<Maqam[]>([]);
  const [modulationsStack, setModulationsStack] = useState<ModulationsPair[]>([]);

  function getBothModulations(transposition: Maqam, stackIdx: number = 0, overrideOctaveShift?: boolean): ModulationsPair {
    const ajnasMods = modulate(allPitchClasses, ajnas, maqamat, transposition, true) as AjnasModulations;
    const maqamatMods = modulate(allPitchClasses, ajnas, maqamat, transposition, false) as MaqamatModulations;

    // Apply octave shift if enabled for this stack index
    const shouldShift = overrideOctaveShift ?? (octaveShiftEnabled[stackIdx] || false);
    if (shouldShift) {
      // Shift all ajnas modulations down by one octave
      const shiftedAjnasMods = {
        ...ajnasMods,
        modulationsOnFirstDegree: ajnasMods.modulationsOnFirstDegree.map(jins => shiftJinsByOctaves(allPitchClasses, jins, -1)).filter((jins): jins is Jins => jins !== null),
        modulationsOnThirdDegree: ajnasMods.modulationsOnThirdDegree.map(jins => shiftJinsByOctaves(allPitchClasses, jins, -1)).filter((jins): jins is Jins => jins !== null),
        modulationsOnAltThirdDegree: ajnasMods.modulationsOnAltThirdDegree.map(jins => shiftJinsByOctaves(allPitchClasses, jins, -1)).filter((jins): jins is Jins => jins !== null),
        modulationsOnFourthDegree: ajnasMods.modulationsOnFourthDegree.map(jins => shiftJinsByOctaves(allPitchClasses, jins, -1)).filter((jins): jins is Jins => jins !== null),
        modulationsOnFifthDegree: ajnasMods.modulationsOnFifthDegree.map(jins => shiftJinsByOctaves(allPitchClasses, jins, -1)).filter((jins): jins is Jins => jins !== null),
        modulationsOnSixthDegreeAsc: ajnasMods.modulationsOnSixthDegreeAsc.map(jins => shiftJinsByOctaves(allPitchClasses, jins, -1)).filter((jins): jins is Jins => jins !== null),
        modulationsOnSixthDegreeDesc: ajnasMods.modulationsOnSixthDegreeDesc.map(jins => shiftJinsByOctaves(allPitchClasses, jins, -1)).filter((jins): jins is Jins => jins !== null),
        modulationsOnSixthDegreeIfNoThird: ajnasMods.modulationsOnSixthDegreeIfNoThird.map(jins => shiftJinsByOctaves(allPitchClasses, jins, -1)).filter((jins): jins is Jins => jins !== null),
      };

      // Shift all maqamat modulations down by one octave
      const shiftedMaqamatMods = {
        ...maqamatMods,
        modulationsOnFirstDegree: maqamatMods.modulationsOnFirstDegree.map(maqam => shiftMaqamByOctaves(allPitchClasses, maqam, -1)).filter((maqam): maqam is Maqam => maqam !== null),
        modulationsOnThirdDegree: maqamatMods.modulationsOnThirdDegree.map(maqam => shiftMaqamByOctaves(allPitchClasses, maqam, -1)).filter((maqam): maqam is Maqam => maqam !== null),
        modulationsOnAltThirdDegree: maqamatMods.modulationsOnAltThirdDegree.map(maqam => shiftMaqamByOctaves(allPitchClasses, maqam, -1)).filter((maqam): maqam is Maqam => maqam !== null),
        modulationsOnFourthDegree: maqamatMods.modulationsOnFourthDegree.map(maqam => shiftMaqamByOctaves(allPitchClasses, maqam, -1)).filter((maqam): maqam is Maqam => maqam !== null),
        modulationsOnFifthDegree: maqamatMods.modulationsOnFifthDegree.map(maqam => shiftMaqamByOctaves(allPitchClasses, maqam, -1)).filter((maqam): maqam is Maqam => maqam !== null),
        modulationsOnSixthDegreeAsc: maqamatMods.modulationsOnSixthDegreeAsc.map(maqam => shiftMaqamByOctaves(allPitchClasses, maqam, -1)).filter((maqam): maqam is Maqam => maqam !== null),
        modulationsOnSixthDegreeDesc: maqamatMods.modulationsOnSixthDegreeDesc.map(maqam => shiftMaqamByOctaves(allPitchClasses, maqam, -1)).filter((maqam): maqam is Maqam => maqam !== null),
        modulationsOnSixthDegreeIfNoThird: maqamatMods.modulationsOnSixthDegreeIfNoThird.map(maqam => shiftMaqamByOctaves(allPitchClasses, maqam, -1)).filter((maqam): maqam is Maqam => maqam !== null),
      };

      return {
        ajnas: shiftedAjnasMods,
        maqamat: shiftedMaqamatMods,
      };
    }

    return {
      ajnas: ajnasMods,
      maqamat: maqamatMods,
    };
  }

  function findMaqamInModulations(mods: MaqamatModulations, hop: ModulationChainHop): Maqam | null {
    const degreeArrays = [
      mods.modulationsOnFirstDegree,
      mods.modulationsOnThirdDegree,
      mods.modulationsOnAltThirdDegree,
      mods.modulationsOnFourthDegree,
      mods.modulationsOnFifthDegree,
      mods.modulationsOnSixthDegreeAsc,
      mods.modulationsOnSixthDegreeDesc,
      mods.modulationsOnSixthDegreeIfNoThird,
    ];
    for (const degreeArray of degreeArrays) {
      for (const maqam of degreeArray) {
        if (maqam.maqamId === hop.maqamId && standardizeText(maqam.ascendingPitchClasses[0]?.noteName ?? "") === hop.tonicIdName) {
          return maqam;
        }
      }
    }
    return null;
  }

  /**
   * Rebuilds the hop stack from a chain descriptor (restored from a shared URL or
   * kept in context across tab switches). Each hop after the first is validated by
   * looking it up in the previous hop's modulation options; an unreachable hop
   * truncates the chain there.
   */
  function replayModulationChain(chain: ModulationChainHop[]): { stack: Maqam[]; modulations: ModulationsPair[]; chain: ModulationChainHop[] } | null {
    const maqamData = maqamat.find((m) => m.getId() === chain[0].maqamId);
    if (!maqamData) return null;

    const transpositions = calculateMaqamTranspositions(allPitchClasses, ajnas, maqamData, true, centsTolerance);
    let first = transpositions.find((m) => standardizeText(m.ascendingPitchClasses[0]?.noteName ?? "") === chain[0].tonicIdName) || null;
    if (!first) {
      const tahlil = maqamData.getTahlil(allPitchClasses);
      if (standardizeText(tahlil.ascendingPitchClasses[0]?.noteName ?? "") === chain[0].tonicIdName) first = tahlil;
    }
    if (!first) return null;

    const stack: Maqam[] = [first];
    const modulations: ModulationsPair[] = [getBothModulations(first, 0, chain[0].octaveShift)];
    const appliedChain: ModulationChainHop[] = [chain[0]];

    for (let i = 1; i < chain.length; i++) {
      const target = findMaqamInModulations(modulations[i - 1].maqamat, chain[i]);
      if (!target) break;
      stack.push(target);
      modulations.push(getBothModulations(target, i, chain[i].octaveShift));
      appliedChain.push(chain[i]);
    }

    return { stack, modulations, chain: appliedChain };
  }

  useEffect(() => {
    if (sourceMaqamStack.length === 0 && selectedMaqamData) {
      let transposition: Maqam;
      if (selectedMaqam) transposition = selectedMaqam;
      else transposition = selectedMaqamData.getTahlil(allPitchClasses);

      // If a chain descriptor whose last hop matches the current selection exists,
      // replay the whole chain instead of seeding a fresh single-hop stack
      if (modulationChain && modulationChain.length > 0) {
        const tail = modulationChain[modulationChain.length - 1];
        const currentTonic = standardizeText(transposition.ascendingPitchClasses[0]?.noteName ?? "");
        if (tail.maqamId === selectedMaqamData.getId() && tail.tonicIdName === currentTonic) {
          const replayed = replayModulationChain(modulationChain);
          if (replayed) {
            setSourceMaqamStack(replayed.stack);
            setModulationsStack(replayed.modulations);
            setModulationModes(replayed.chain.map((hop) => hop.ajnasMode));
            setOctaveShiftEnabled(replayed.chain.map((hop) => hop.octaveShift));
            // Open the last hop of a restored chain; the rest wait in the breadcrumb
            setActiveHopIndex(replayed.chain.length - 1);
            return;
          }
        }
      }

      setSourceMaqamStack([transposition]);
      setModulationsStack([getBothModulations(transposition, 0)]);
      setModulationModes([false]); // default to maqamat for first hop
      setActiveHopIndex(0); // fresh single-hop chain: open the only hop
      setOctaveShiftEnabled([false]); // default to no octave shift
    }
  }, []);

  // Keep the shareable chain descriptor in app context (and thereby the URL) in
  // sync with the local hop stack
  useEffect(() => {
    if (sourceMaqamStack.length === 0) return;
    const descriptor: ModulationChainHop[] = sourceMaqamStack.map((maqam, idx) => ({
      maqamId: maqam.maqamId,
      tonicIdName: standardizeText(maqam.ascendingPitchClasses[0]?.noteName ?? ""),
      octaveShift: !!octaveShiftEnabled[idx],
      ajnasMode: !!modulationModes[idx],
    }));
    if (JSON.stringify(descriptor) !== JSON.stringify(modulationChain)) {
      setModulationChain(descriptor);
    }
  }, [sourceMaqamStack, octaveShiftEnabled, modulationModes, modulationChain, setModulationChain]);

  useEffect(() => {
    if (selectedMaqam) {
      const maqam = maqamat.find((m) => m.getId() === selectedMaqam.maqamId);
      if (maqam) {
        setSelectedMaqamData(maqam);
        setSelectedJinsData(null);
      }
      setSelectedPitchClasses([]); // Clear first
      setSelectedPitchClasses(selectedMaqam.ascendingPitchClasses);
    } else if (selectedJins) {
      const jins = ajnas.find((j) => j.getId() === selectedJins.jinsId);
      if (jins) {
        setSelectedJinsData(jins);
        setSelectedMaqamData(null);
      }
      setSelectedPitchClasses([]); // Clear first
      setSelectedPitchClasses(selectedJins.jinsPitchClasses);
    }
  }, [selectedMaqam, selectedJins]);

  useEffect(() => {
    function handleMaqamTranspositionChange() {
      if (!selectedMaqam) return;
      setSourceMaqamStack((prev) => {
        if (prev.length === 0) return [selectedMaqam];
        if (prev[0].ascendingPitchClasses[0].noteName === selectedMaqam.ascendingPitchClasses[0].noteName && prev[0].maqamId === selectedMaqam.maqamId) {
          return prev; // No change
        }
        return [selectedMaqam];
      });
      setModulationsStack(() => {
        const first = getBothModulations(selectedMaqam, 0);
        return [first];
      });
      setModulationModes([false]);
      setActiveHopIndex(0);
      setOctaveShiftEnabled([false]);
    }
    window.addEventListener("maqamTranspositionChange", handleMaqamTranspositionChange as EventListener);
    return () => window.removeEventListener("maqamTranspositionChange", handleMaqamTranspositionChange as EventListener);
  }, [selectedMaqam]);

  // Handles clicking the source maqam name (propagates tonic and details)
  function handleSourceMaqamClick(sourceMaqam: Maqam) {
    // Defensive: ensure ascendingPitchClasses exists and has at least one element
    const maqamId = sourceMaqam.maqamId;
    const tonic =
      Array.isArray(sourceMaqam.ascendingPitchClasses) && sourceMaqam.ascendingPitchClasses.length > 0
        ? sourceMaqam.ascendingPitchClasses[0].noteName
        : undefined;
    if (maqamId && tonic) {
      handleClickMaqam({ maqamId, tonic } as any);
      clearHangingNotes();
    }
  }

  const addHopsWrapper = (maqamTransposition: Maqam, stackIdx: number) => {
    const newStackIdx = stackIdx + 1;
    const newModulations = getBothModulations(maqamTransposition, newStackIdx);
    setSourceMaqamStack((prev) => {
      const newStack = [...prev.slice(0, stackIdx + 1), maqamTransposition];
      return newStack;
    });
    setModulationsStack((prev) => {
      const newStack = [...prev.slice(0, stackIdx + 1), newModulations];
      return newStack;
    });
    setModulationModes((prev) => {
      // When adding a hop, keep previous modes, default new hop to maqamat (false)
      const newModes = [...prev.slice(0, stackIdx + 1), false];
      return newModes;
    });
    setOctaveShiftEnabled((prev) => {
      // When adding a hop, keep previous octave shift states, default new hop to disabled
      const newEnabled = [...prev.slice(0, stackIdx + 1), false];
      return newEnabled;
    });
    // The new hop becomes the active one, so its columns open in place of the
    // hop we branched from.
    setActiveHopIndex(newStackIdx);
  };

  const removeLastHopsWrapper = () => {
    setSourceMaqamStack((prev) => {
      const newStack = prev.length > 1 ? prev.slice(0, -1) : prev;
      return newStack;
    });
    setModulationsStack((prev) => {
      const newStack = prev.length > 1 ? prev.slice(0, -1) : prev;
      return newStack;
    });
    setModulationModes((prev) => {
      const newModes = prev.length > 1 ? prev.slice(0, -1) : prev;
      return newModes;
    });
    setOctaveShiftEnabled((prev) => {
      const newEnabled = prev.length > 1 ? prev.slice(0, -1) : prev;
      return newEnabled;
    });
    // Delete only ever removes the last hop (its button shows only when the
    // active hop is the last), so the now-last hop becomes active.
    setActiveHopIndex((prev) => Math.max(0, prev - 1));
  };

  // Handles toggling octave shift for a specific stack index
  const handleOctaveShiftToggle = (stackIdx: number) => {
    setOctaveShiftEnabled((prev) => {
      const newEnabled = [...prev];
      // Ensure the array is long enough
      while (newEnabled.length <= stackIdx) {
        newEnabled.push(false);
      }
      const newValue = !newEnabled[stackIdx];
      newEnabled[stackIdx] = newValue;

      // Rebuild modulations stack for affected indices using the new state
      setModulationsStack((prevStack) => {
        const newStack = [...prevStack];
        for (let i = stackIdx; i < sourceMaqamStack.length; i++) {
          const octaveShiftForIndex = i === stackIdx ? newValue : newEnabled[i] || false;
          newStack[i] = getBothModulations(sourceMaqamStack[i], i, octaveShiftForIndex);
        }
        return newStack;
      });

      return newEnabled;
    });
  };

  // Handles clicking any modulation hop (for all positions: tonic, third, etc)
  function handleModulationClick(hop: any, stackIdx: number) {
    if ("ascendingPitchClasses" in hop) {
      addHopsWrapper(hop, stackIdx);
      setSelectedJins(null);
      // Pass only maqamId and tonic to handleClickMaqam, let main system handle lookup and transposition
      const maqamId = hop.maqamId || (hop.getId && hop.getId());
      const tonic = hop.ascendingPitchClasses?.[0]?.noteName || (hop.getAscendingNoteNames && hop.getAscendingNoteNames()[0]);
      const selectedId = selectedMaqamData?.getId ? selectedMaqamData.getId() : undefined;
      const selectedTonic = selectedMaqamData?.getAscendingNoteNames
        ? selectedMaqamData.getAscendingNoteNames()[0]
        : selectedMaqamData?.ascendingPitchClasses?.[0]?.noteName;

      // TypeScript expects a MaqamData or the new object type; cast for type safety
      if (!selectedMaqamData || maqamId !== selectedId || tonic !== selectedTonic) {
        handleClickMaqam({ maqamId, tonic } as any);
        clearHangingNotes();
      }
    } else {
      setSelectedJins(hop);
      setSelectedMaqam(null);
    }
  }

  return (
    <div className="modulations__container">
      {/* Header band: the same transpositions-header-surface the Ajnās/
          Maqāmāt taḥlīl and Suyūr headers use ($secondary fill, $grey border) —
          a run-in furniture-eyebrow + entity-name row, so Intiqālāt reads as
          one more analysis surface on the selected maqām, not a page of its own. */}
      <header className="modulations__page-header">
        <div className="modulations__title-row" dir={language === "ar" ? "rtl" : "ltr"}>
          <span className="modulations__section-furniture">{t("tabs.intiqalat")}</span>
          {sourceMaqamStack[0]?.name && (
            <span className="modulations__entity-name">{getDisplayName(sourceMaqamStack[0].name, "maqam")}</span>
          )}
        </div>
      </header>

      {/* The modulation chain as a breadcrumb trail: the root maqām and every hop
          branched from it read left-to-right as carousel-style chips. The active
          chip's modulation columns show below; clicking any chip opens that hop,
          so the whole path stays visible without collapse/expand. */}
      {sourceMaqamStack.length > 0 && (
        <nav className="modulations__breadcrumb" aria-label={t("tabs.intiqalat")}>
          {sourceMaqamStack.map((hopMaqam, idx) => {
            const hopTonic = hopMaqam.ascendingPitchClasses?.[0]?.noteName ?? "";
            const isActive = idx === activeHopIndex;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <span className="modulations__breadcrumb-sep" aria-hidden="true">
                    ›
                  </span>
                )}
                <button
                  type="button"
                  className={"modulations__breadcrumb-item" + (isActive ? " modulations__breadcrumb-item_active" : "")}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => {
                    setActiveHopIndex(idx);
                    handleSourceMaqamClick(hopMaqam);
                  }}
                >
                  <span className="modulations__breadcrumb-name">{hopMaqam.name ? getDisplayName(hopMaqam.name, "maqam") : "—"}</span>
                  {hopTonic && (
                    <span className="modulations__breadcrumb-tonic">
                      {getDisplayName(hopTonic, "note")} / {getEnglishNoteName(hopTonic)}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* The active hop's modulation surface: the mode toggle + octave shift,
          then the eight degree columns. Only the active hop renders — the rest of
          the chain lives in the breadcrumb above. */}
      {(() => {
        const stackIdx = activeHopIndex;
        const sourceMaqam = sourceMaqamStack[stackIdx];
        if (!sourceMaqam || !modulationsStack[stackIdx]) return null;

        const ascendingNoteNames = sourceMaqam.ascendingPitchClasses.map((pitchClass) => pitchClass.noteName);
        const descendingNoteNames = [...sourceMaqam.descendingPitchClasses.map((pitchClass) => pitchClass.noteName)].reverse();
        const totalAjnasModulations = calculateNumberOfModulations(modulationsStack[stackIdx].ajnas, "ajnas");
        const totalMaqamatModulations = calculateNumberOfModulations(modulationsStack[stackIdx].maqamat, "maqamat");

        const isAjnasMode = modulationModes[stackIdx];
        const modulations = isAjnasMode ? modulationsStack[stackIdx].ajnas : modulationsStack[stackIdx].maqamat;
        const { noteName2pBelowThird: noteName2p } = modulations;

        // Display note names, shifted down an octave when octave-shift is on.
        let displayAscendingNoteNames = ascendingNoteNames;
        let displayDescendingNoteNames = descendingNoteNames;
        let displayNoteName2p = noteName2p;

        if (octaveShiftEnabled[stackIdx]) {
          const getShiftedNoteName = (pitchClass: any): string => {
            const shifted = shiftPitchClassByOctave(allPitchClasses, pitchClass, -1);
            return shifted.noteName === "" ? "Octave Shift is beyond tuning system range" : shifted.noteName;
          };
          displayAscendingNoteNames = sourceMaqam.ascendingPitchClasses.map(getShiftedNoteName);
          displayDescendingNoteNames = sourceMaqam.descendingPitchClasses.map(getShiftedNoteName).reverse();
          const noteName2pPitchClass = allPitchClasses.find((pc) => pc.noteName === noteName2p);
          if (noteName2pPitchClass) {
            const shiftedNoteName2p = shiftPitchClassByOctave(allPitchClasses, noteName2pPitchClass, -1);
            displayNoteName2p = shiftedNoteName2p.noteName === "" ? "Octave Shift is beyond tuning system range" : shiftedNoteName2p.noteName;
          }
        }

        // The eight degree columns, data-driven so their markup can't drift the
        // way eight hand-copied blocks did.
        const degreeColumns: { labelKey: string; note: string; list: any[] }[] = [
          { labelKey: "modulations.tonic", note: displayAscendingNoteNames[0], list: modulations.modulationsOnFirstDegree },
          { labelKey: "modulations.third", note: displayAscendingNoteNames[2], list: modulations.modulationsOnThirdDegree },
          { labelKey: "modulations.thirdAlternative", note: displayNoteName2p, list: modulations.modulationsOnAltThirdDegree },
          { labelKey: "modulations.fourth", note: displayAscendingNoteNames[3], list: modulations.modulationsOnFourthDegree },
          { labelKey: "modulations.fifth", note: displayAscendingNoteNames[4], list: modulations.modulationsOnFifthDegree },
          { labelKey: "modulations.sixthIfNoThird", note: displayAscendingNoteNames[5], list: modulations.modulationsOnSixthDegreeIfNoThird },
          { labelKey: "modulations.sixthAscending", note: displayAscendingNoteNames[5], list: modulations.modulationsOnSixthDegreeAsc },
          { labelKey: "modulations.sixthDescending", note: displayDescendingNoteNames[5], list: modulations.modulationsOnSixthDegreeDesc },
        ];

        return (
          <div className="modulations__hop-body">
            <div className="modulations__controls-row">
              <div className="modulations__mode-segments" role="group">
                <button
                  className={"modulations__mode-segment" + (isAjnasMode ? " modulations__mode-segment_active" : "")}
                  aria-pressed={isAjnasMode}
                  onClick={() =>
                    setModulationModes((prev) => {
                      const newModes = [...prev];
                      newModes[stackIdx] = true;
                      return newModes;
                    })
                  }
                >
                  {totalAjnasModulations} {t("modulations.ajnasModulations")}
                </button>
                <button
                  className={"modulations__mode-segment" + (!isAjnasMode ? " modulations__mode-segment_active" : "")}
                  aria-pressed={!isAjnasMode}
                  onClick={() =>
                    setModulationModes((prev) => {
                      const newModes = [...prev];
                      newModes[stackIdx] = false;
                      return newModes;
                    })
                  }
                >
                  {totalMaqamatModulations} {t("modulations.maqamatModulations")}
                </button>
              </div>
              <button
                className={`modulations__octave-shift ${octaveShiftEnabled[stackIdx] ? "modulations__octave-shift_active" : ""}`}
                aria-pressed={octaveShiftEnabled[stackIdx]}
                onClick={() => handleOctaveShiftToggle(stackIdx)}
              >
                {octaveShiftEnabled[stackIdx] ? "✓ " : ""}
                {t("modulations.octaveShift")}
              </button>
              {stackIdx === sourceMaqamStack.length - 1 && sourceMaqamStack.length > 1 && (
                <button className="modulations__delete-hop-btn" onClick={removeLastHopsWrapper}>
                  {t("modulations.deleteHop")}
                </button>
              )}
            </div>

            <div className="modulations__degrees">
              {degreeColumns.map((col, colIdx) => (
                <div className="modulations__modulations-list" key={colIdx}>
                  <div className="modulations__header">
                    <span className="modulations__header-text">{t(col.labelKey)}</span>
                    <span className="modulations__header-degree">
                      {getDisplayName(col.note, "note")}
                      <span className="modulations__header-count">({col.list ? col.list.length : 0})</span>
                    </span>
                  </div>
                  <div className="modulations__column-scroll">
                    {[...(col.list ?? [])]
                      .sort((a: any, b: any) => a.name.localeCompare(b.name))
                      .map((hop, index) => (
                        <button
                          type="button"
                          className="modulations__modulation-item"
                          key={index}
                          onClick={() => handleModulationClick(hop, stackIdx)}
                        >
                          {getDisplayName(hop.name, isAjnasMode ? "jins" : "maqam")}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
