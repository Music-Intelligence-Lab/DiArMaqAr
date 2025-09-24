"use client";

import useAppContext from "@/contexts/app-context";
import useSoundContext from "@/contexts/sound-context";
import useLanguageContext from "@/contexts/language-context";
import React, { useState, useEffect, useRef } from "react";
import { MaqamatModulations, Maqam, shiftMaqamByOctaves } from "@/models/Maqam";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import calculateNumberOfModulations from "@/functions/calculateNumberOfModulations";
import { AjnasModulations, shiftJinsByOctaves } from "@/models/Jins";
import modulate from "@/functions/modulate";
type ModulationsPair = { ajnas: AjnasModulations; maqamat: MaqamatModulations };

export default function Modulations() {
  const { t, getDisplayName } = useLanguageContext();
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
  } = useAppContext();

  const [modulationModes, setModulationModes] = useState<boolean[]>([false]);
  const [octaveShiftEnabled, setOctaveShiftEnabled] = useState<boolean[]>([false]);

  const [collapsedHops, setCollapsedHops] = useState<boolean[]>([]);
  const { clearHangingNotes } = useSoundContext();

  const [sourceMaqamStack, setSourceMaqamStack] = useState<Maqam[]>([]);
  const [modulationsStack, setModulationsStack] = useState<ModulationsPair[]>([]);

  const hopsRefs = useRef<Array<HTMLDivElement | null>>([]);

  function getBothModulations(transposition: Maqam, stackIdx: number = 0, overrideOctaveShift?: boolean): ModulationsPair {
    const ajnasMods = modulate(allPitchClasses, ajnas, maqamat, transposition, true) as AjnasModulations;
    const maqamatMods = modulate(allPitchClasses, ajnas, maqamat, transposition, false) as MaqamatModulations;
    
    // Apply octave shift if enabled for this stack index
    const shouldShift = overrideOctaveShift ?? (octaveShiftEnabled[stackIdx] || false);
    if (shouldShift) {
      // Shift all ajnas modulations down by one octave
      const shiftedAjnasMods = {
        ...ajnasMods,
        modulationsOnOne: ajnasMods.modulationsOnOne.map(jins => shiftJinsByOctaves(allPitchClasses, jins, -1)),
        modulationsOnThree: ajnasMods.modulationsOnThree.map(jins => shiftJinsByOctaves(allPitchClasses, jins, -1)),
        modulationsOnThree2p: ajnasMods.modulationsOnThree2p.map(jins => shiftJinsByOctaves(allPitchClasses, jins, -1)),
        modulationsOnFour: ajnasMods.modulationsOnFour.map(jins => shiftJinsByOctaves(allPitchClasses, jins, -1)),
        modulationsOnFive: ajnasMods.modulationsOnFive.map(jins => shiftJinsByOctaves(allPitchClasses, jins, -1)),
        modulationsOnSixAscending: ajnasMods.modulationsOnSixAscending.map(jins => shiftJinsByOctaves(allPitchClasses, jins, -1)),
        modulationsOnSixDescending: ajnasMods.modulationsOnSixDescending.map(jins => shiftJinsByOctaves(allPitchClasses, jins, -1)),
        modulationsOnSixNoThird: ajnasMods.modulationsOnSixNoThird.map(jins => shiftJinsByOctaves(allPitchClasses, jins, -1)),
      };
      
      // Shift all maqamat modulations down by one octave
      const shiftedMaqamatMods = {
        ...maqamatMods,
        modulationsOnOne: maqamatMods.modulationsOnOne.map(maqam => shiftMaqamByOctaves(allPitchClasses, maqam, -1)),
        modulationsOnThree: maqamatMods.modulationsOnThree.map(maqam => shiftMaqamByOctaves(allPitchClasses, maqam, -1)),
        modulationsOnThree2p: maqamatMods.modulationsOnThree2p.map(maqam => shiftMaqamByOctaves(allPitchClasses, maqam, -1)),
        modulationsOnFour: maqamatMods.modulationsOnFour.map(maqam => shiftMaqamByOctaves(allPitchClasses, maqam, -1)),
        modulationsOnFive: maqamatMods.modulationsOnFive.map(maqam => shiftMaqamByOctaves(allPitchClasses, maqam, -1)),
        modulationsOnSixAscending: maqamatMods.modulationsOnSixAscending.map(maqam => shiftMaqamByOctaves(allPitchClasses, maqam, -1)),
        modulationsOnSixDescending: maqamatMods.modulationsOnSixDescending.map(maqam => shiftMaqamByOctaves(allPitchClasses, maqam, -1)),
        modulationsOnSixNoThird: maqamatMods.modulationsOnSixNoThird.map(maqam => shiftMaqamByOctaves(allPitchClasses, maqam, -1)),
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

  useEffect(() => {
    if (sourceMaqamStack.length === 0 && selectedMaqamData) {
      let transposition: Maqam;
      if (selectedMaqam) transposition = selectedMaqam;
      else transposition = selectedMaqamData.getTahlil(allPitchClasses);
      setSourceMaqamStack([transposition]);
      setModulationsStack([getBothModulations(transposition, 0)]);
      setModulationModes([false]); // default to maqamat for first hop
      setCollapsedHops([false]); // not collapsed by default
      setOctaveShiftEnabled([false]); // default to no octave shift
    }
  }, []);

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
      setCollapsedHops([false]);
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
    setCollapsedHops((prev) => {
      // When adding a hop, keep previous collapsed states, default new hop to not collapsed
      const newCollapsed = [...prev.slice(0, stackIdx + 1), false];
      return newCollapsed;
    });
    setOctaveShiftEnabled((prev) => {
      // When adding a hop, keep previous octave shift states, default new hop to disabled
      const newEnabled = [...prev.slice(0, stackIdx + 1), false];
      return newEnabled;
    });
    // Scroll to the new hop after a short delay to ensure DOM update
    setTimeout(() => {
      const nextIdx = stackIdx + 1;
      if (hopsRefs.current[nextIdx]) {
        hopsRefs.current[nextIdx]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
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
    setCollapsedHops((prev) => {
      const newCollapsed = prev.length > 1 ? prev.slice(0, -1) : prev;
      return newCollapsed;
    });
    setOctaveShiftEnabled((prev) => {
      const newEnabled = prev.length > 1 ? prev.slice(0, -1) : prev;
      return newEnabled;
    });
    // Scroll to the previous hop or first hop after a short delay
    setTimeout(() => {
      // Find the last non-null ref (should be the last hop in DOM)
      const validRefs = hopsRefs.current.filter(Boolean);
      if (validRefs.length > 0) {
        validRefs[validRefs.length - 1]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
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
      {sourceMaqamStack.map((sourceMaqam, stackIdx) => {
        const ascendingNoteNames = sourceMaqam.ascendingPitchClasses.map((pitchClass) => pitchClass.noteName);
        const descendingNoteNames = [...sourceMaqam.descendingPitchClasses.map((pitchClass) => pitchClass.noteName)].reverse();
        // Always calculate both counts independently, regardless of mode
        const totalAjnasModulations = modulationsStack[stackIdx] ? calculateNumberOfModulations(modulationsStack[stackIdx].ajnas, "ajnas") : 0;
        const totalMaqamatModulations = modulationsStack[stackIdx] ? calculateNumberOfModulations(modulationsStack[stackIdx].maqamat, "maqamat") : 0;
        return (
          <div
            className="modulations__hops-wrapper"
            key={stackIdx}
            ref={(el) => {
              hopsRefs.current[stackIdx] = el;
            }}
          >
            {/* Maqam name/details at the top of each wrapper */}
            <div className="modulations__wrapper-modulations-header">
              <div className="modulations__source-maqam-name" onClick={() => handleSourceMaqamClick(sourceMaqam)} style={{ cursor: "pointer" }}>
                {sourceMaqam.name ? getDisplayName(sourceMaqam.name, 'maqam') : "Unknown"} ({ascendingNoteNames ? getDisplayName(ascendingNoteNames[0], 'note') : "N/A"}/
                {getEnglishNoteName(ascendingNoteNames ? ascendingNoteNames[0]! : "")})
              </div>
              <button
                className="modulations__collapse-arrow"
                aria-label={collapsedHops[stackIdx] ? t('modulations.expand') : t('modulations.collapse')}
                onClick={() =>
                  setCollapsedHops((prev) => {
                    const updated = [...prev];
                    updated[stackIdx] = !updated[stackIdx];
                    return updated;
                  })
                }
              >
                <span className="modulations__collapse-arrow-icon" style={{ transform: collapsedHops[stackIdx] ? "rotate(0deg)" : "rotate(90deg)" }}>
                  ▶
                </span>
              </button>
            </div>

            {/* Only render modulations if not collapsed */}
            {modulationsStack[stackIdx] &&
              !collapsedHops[stackIdx] &&
              (() => {
                const modulations = modulationModes[stackIdx] ? modulationsStack[stackIdx].ajnas : modulationsStack[stackIdx].maqamat;
                const { noteName2p } = modulations;
                return (
                  <>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "12px", alignItems: "center", justifyContent: "center" }}>
                      <button
                        className={"modulations__ajnas-count" + (modulationModes[stackIdx] ? " modulations__ajnas-count_active" : "")}
                        style={{
                          cursor: "pointer",
                          textDecoration: modulationModes[stackIdx] ? "underline" : "none",
                          marginRight: 12,
                          color: modulationModes[stackIdx] ? "#0070f3" : undefined,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setModulationModes((prev) => {
                            const newModes = [...prev];
                            newModes[stackIdx] = true;
                            return newModes;
                          });
                        }}
                      >
                        {totalAjnasModulations} {t('modulations.ajnasModulations')}
                      </button>
                      <button
                        className={"modulations__maqamat-count" + (!modulationModes[stackIdx] ? " modulations__maqamat-count_active" : "")}
                        style={{
                          cursor: "pointer",
                          textDecoration: !modulationModes[stackIdx] ? "underline" : "none",
                          color: !modulationModes[stackIdx] ? "#0070f3" : undefined,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setModulationModes((prev) => {
                            const newModes = [...prev];
                            newModes[stackIdx] = false;
                            return newModes;
                          });
                        }}
                      >
                        {totalMaqamatModulations} {t('modulations.maqamatModulations')}
                      </button>
                      <button
                        className={`modulations__octave-shift ${octaveShiftEnabled[stackIdx] ? "modulations__octave-shift_active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOctaveShiftToggle(stackIdx);
                        }}
                      >
                        {octaveShiftEnabled[stackIdx] ? "✓ " : ""}{t('modulations.octaveShift')}
                      </button>
                      {/* Move delete button here, only on last hop and if more than one exists */}
                      {stackIdx === sourceMaqamStack.length - 1 && sourceMaqamStack.length > 1 && (
                        <button
                          className="modulations__delete-hop-btn"
                          style={{
                            marginLeft: 8,
                            padding: "2px 8px",
                            fontSize: 14,
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            // Load previous hop's source maqam before removing
                            const prevIdx = sourceMaqamStack.length - 2;
                            const prevSourceMaqam = sourceMaqamStack[prevIdx];
                            if (prevSourceMaqam) {
                              handleSourceMaqamClick(prevSourceMaqam);
                              setCollapsedHops((prev) => {
                                const updated = [...prev];
                                updated[prevIdx] = false; // Uncollapse previous hop
                                return updated;
                              });
                            }
                            removeLastHopsWrapper();
                          }}
                        >
                          {t('modulations.deleteHop')}
                        </button>
                      )}
                    </div>
                    <div className="modulations__modulations-list">
                      <span className="modulations__header">
                        <span className="modulations__header-text">
                          {t('modulations.tonic')}:
                          <br />{" "}
                        </span>
                        {getDisplayName(ascendingNoteNames[0], 'note')} ({modulations?.modulationsOnOne ? modulations.modulationsOnOne.length : 0})
                      </span>
                      {[...modulations.modulationsOnOne]
                        .sort((a: any, b: any) => a.name.localeCompare(b.name))
                        .map((hop, index) => (
                          <span
                            className="modulations__modulation-item"
                            key={index}
                            onClick={() => {
                              if (!modulationModes[stackIdx]) {
                                // Only collapse if not in ajnas mode
                                setCollapsedHops((prev) => {
                                  const updated = [...prev];
                                  updated[stackIdx] = true;
                                  return updated;
                                });
                              }
                              handleModulationClick(hop, stackIdx);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {getDisplayName(hop.name, modulationModes[stackIdx] ? 'jins' : 'maqam')}
                          </span>
                        ))}
                    </div>
                    <div className="modulations__modulations-list">
                      <span className="modulations__header">
                        <span className="modulations__header-text">
                          {t('modulations.third')}:
                          <br />{" "}
                        </span>
                        {getDisplayName(ascendingNoteNames[2], 'note')} ({modulations?.modulationsOnThree ? modulations.modulationsOnThree.length : 0})
                      </span>
                      {[...modulations.modulationsOnThree]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((hop, index) => (
                          <span
                            className="modulations__modulation-item"
                            key={index}
                            onClick={() => {
                              if (!modulationModes[stackIdx]) {
                                setCollapsedHops((prev) => {
                                  const updated = [...prev];
                                  updated[stackIdx] = true;
                                  return updated;
                                });
                              }
                              handleModulationClick(hop, stackIdx);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {getDisplayName(hop.name, modulationModes[stackIdx] ? 'jins' : 'maqam')}
                          </span>
                        ))}
                    </div>
                    <div className="modulations__modulations-list">
                      <span className="modulations__header">
                        <span className="modulations__header-text">
                          {t('modulations.thirdAlternative')}:
                          <br />{" "}
                        </span>
                        {getDisplayName(noteName2p, 'note')} ({modulations?.modulationsOnThree2p ? modulations.modulationsOnThree2p.length : 0})
                      </span>
                      {[...modulations.modulationsOnThree2p]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((hop, index) => (
                          <span
                            className="modulations__modulation-item"
                            key={index}
                            onClick={() => {
                              if (!modulationModes[stackIdx]) {
                                setCollapsedHops((prev) => {
                                  const updated = [...prev];
                                  updated[stackIdx] = true;
                                  return updated;
                                });
                              }
                              handleModulationClick(hop, stackIdx);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {getDisplayName(hop.name, modulationModes[stackIdx] ? 'jins' : 'maqam')}
                          </span>
                        ))}
                    </div>
                    <div className="modulations__modulations-list">
                      <span className="modulations__header">
                        <span className="modulations__header-text">
                          {t('modulations.fourth')}:
                          <br />{" "}
                        </span>
                        {getDisplayName(ascendingNoteNames[3], 'note')} ({modulations?.modulationsOnFour ? modulations.modulationsOnFour.length : 0})
                      </span>
                      {[...modulations.modulationsOnFour]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((hop, index) => (
                          <span
                            className="modulations__modulation-item"
                            key={index}
                            onClick={() => {
                              if (!modulationModes[stackIdx]) {
                                setCollapsedHops((prev) => {
                                  const updated = [...prev];
                                  updated[stackIdx] = true;
                                  return updated;
                                });
                              }
                              handleModulationClick(hop, stackIdx);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {getDisplayName(hop.name, modulationModes[stackIdx] ? 'jins' : 'maqam')}
                          </span>
                        ))}
                    </div>
                    <div className="modulations__modulations-list">
                      <span className="modulations__header">
                        <span className="modulations__header-text">
                          {t('modulations.fifth')}:
                          <br />{" "}
                        </span>
                        {getDisplayName(ascendingNoteNames[4], 'note')} ({modulations?.modulationsOnFive ? modulations.modulationsOnFive.length : 0})
                      </span>
                      {[...modulations.modulationsOnFive]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((hop, index) => (
                          <span
                            className="modulations__modulation-item"
                            key={index}
                            onClick={() => {
                              if (!modulationModes[stackIdx]) {
                                setCollapsedHops((prev) => {
                                  const updated = [...prev];
                                  updated[stackIdx] = true;
                                  return updated;
                                });
                              }
                              handleModulationClick(hop, stackIdx);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {getDisplayName(hop.name, modulationModes[stackIdx] ? 'jins' : 'maqam')}
                          </span>
                        ))}
                    </div>
                    <div className="modulations__modulations-list">
                      <span className="modulations__header">
                        <span className="modulations__header-text">
                          {t('modulations.sixthIfNoThird')}:
                          <br />{" "}
                        </span>
                        {getDisplayName(ascendingNoteNames[5], 'note')} ({modulations?.modulationsOnSixNoThird ? modulations.modulationsOnSixNoThird.length : 0})
                      </span>
                      {[...modulations.modulationsOnSixNoThird]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((hop, index) => (
                          <span
                            className="modulations__modulation-item"
                            key={index}
                            onClick={() => {
                              if (!modulationModes[stackIdx]) {
                                setCollapsedHops((prev) => {
                                  const updated = [...prev];
                                  updated[stackIdx] = true;
                                  return updated;
                                });
                              }
                              handleModulationClick(hop, stackIdx);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {getDisplayName(hop.name, modulationModes[stackIdx] ? 'jins' : 'maqam')}
                          </span>
                        ))}
                    </div>
                    <div className="modulations__modulations-list">
                      <span className="modulations__header">
                        <span className="modulations__header-text">
                          {t('modulations.sixthAscending')}:
                          <br />{" "}
                        </span>
                        {getDisplayName(ascendingNoteNames[5], 'note')} ({modulations?.modulationsOnSixAscending ? modulations.modulationsOnSixAscending.length : 0})
                      </span>
                      {[...modulations.modulationsOnSixAscending]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((hop, index) => (
                          <span
                            className="modulations__modulation-item"
                            key={index}
                            onClick={() => {
                              if (!modulationModes[stackIdx]) {
                                setCollapsedHops((prev) => {
                                  const updated = [...prev];
                                  updated[stackIdx] = true;
                                  return updated;
                                });
                              }
                              handleModulationClick(hop, stackIdx);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {getDisplayName(hop.name, modulationModes[stackIdx] ? 'jins' : 'maqam')}
                          </span>
                        ))}
                    </div>
                    {/* Only show descending if different from ascending */}
                    {ascendingNoteNames[5] !== descendingNoteNames[5] && (
                      <div className="modulations__modulations-list">
                        <span className="modulations__header">
                          <span className="modulations__header-text">
                            {t('modulations.sixthDescending')}: <br />{" "}
                          </span>
                          {getDisplayName(descendingNoteNames[5], 'note')} ({modulations?.modulationsOnSixDescending ? modulations.modulationsOnSixDescending.length : 0})
                        </span>
                        {[...modulations.modulationsOnSixDescending]
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((hop, index) => (
                            <span
                              className="modulations__modulation-item"
                              key={index}
                              onClick={() => {
                                if (!modulationModes[stackIdx]) {
                                  setCollapsedHops((prev) => {
                                    const updated = [...prev];
                                    updated[stackIdx] = true;
                                    return updated;
                                  });
                                }
                                handleModulationClick(hop, stackIdx);
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              {getDisplayName(hop.name, modulationModes[stackIdx] ? 'jins' : 'maqam')}
                            </span>
                          ))}
                      </div>
                    )}
                  </>
                );
              })()}
          </div>
        );
      })}
    </div>
  );
}
