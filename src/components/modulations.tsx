"use client";

import useAppContext from "@/contexts/app-context";
import useSoundContext from "@/contexts/sound-context";
import React, { useState, useEffect } from "react";
import { MaqamatModulations, Maqam } from "@/models/Maqam";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import calculateNumberOfModulations from "@/functions/calculateNumberOfModulations";
import { AjnasModulations } from "@/models/Jins";
import modulate from "@/functions/modulate";

type ModulationsPair = { ajnas: AjnasModulations; maqamat: MaqamatModulations };

export default function Modulations() {
  const {
    maqamat,
    ajnas,
    selectedMaqamDetails,
    setSelectedMaqamDetails,
    selectedMaqam,
    setSelectedMaqam,
    selectedJins,
    setSelectedJins,
    setSelectedJinsDetails,
    allPitchClasses,
    setSelectedPitchClasses,
    ajnasModulationsMode,
    setAjnasModulationsMode,
    handleClickMaqam,
  } = useAppContext();
  const { clearHangingNotes } = useSoundContext();

  const [sourceMaqamStack, setSourceMaqamStack] = useState<Maqam[]>([]);
  const [modulationsStack, setModulationsStack] = useState<ModulationsPair[]>(
    []
  );

  // Only initialize the stack once, when the component mounts, using the initial selectedMaqamDetails
  React.useEffect(() => {
    if (sourceMaqamStack.length === 0 && selectedMaqamDetails) {
      function getBothModulations(transposition: Maqam): ModulationsPair {
        const ajnasMods = modulate(
          allPitchClasses,
          ajnas,
          maqamat,
          transposition,
          true
        ) as AjnasModulations;
        const maqamatMods = modulate(
          allPitchClasses,
          ajnas,
          maqamat,
          transposition,
          false
        ) as MaqamatModulations;
        return {
          ajnas: ajnasMods,
          maqamat: maqamatMods,
        };
      }
      const transposition = selectedMaqamDetails.getTahlil(allPitchClasses);
      setSourceMaqamStack([transposition]);
      setModulationsStack([getBothModulations(transposition)]);
    }
    // Do not update the stack on subsequent prop/context changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedMaqam) {
      const maqam = maqamat.find((m) => m.getId() === selectedMaqam.maqamId);
      if (maqam) {
        setSelectedMaqamDetails(maqam);
        setSelectedJinsDetails(null);
      }
      setSelectedPitchClasses(selectedMaqam.ascendingPitchClasses);
    } else if (selectedJins) {
      const jins = ajnas.find((j) => j.getId() === selectedJins.jinsId);
      if (jins) {
        setSelectedJinsDetails(jins);
        setSelectedMaqamDetails(null);
      }
      setSelectedPitchClasses(selectedJins.jinsPitchClasses);
    }
  }, [selectedMaqam, selectedJins]);

  const addHopsWrapper = (maqamTransposition: Maqam, stackIdx: number) => {
    const ajnasMods = modulate(
      allPitchClasses,
      ajnas,
      maqamat,
      maqamTransposition,
      true
    ) as AjnasModulations;
    const maqamatMods = modulate(
      allPitchClasses,
      ajnas,
      maqamat,
      maqamTransposition,
      false
    ) as MaqamatModulations;
    const newModulations = {
      ajnas: ajnasMods,
      maqamat: maqamatMods,
    };
    setSourceMaqamStack((prev) => {
      const newStack = [...prev.slice(0, stackIdx + 1), maqamTransposition];
      return newStack;
    });
    setModulationsStack((prev) => {
      const newStack = [...prev.slice(0, stackIdx + 1), newModulations];
      return newStack;
    });
  };

  const removeLastHopsWrapper = () => {
    setSourceMaqamStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    setModulationsStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  return (
    <div className="modulations__container">
      {sourceMaqamStack.map((sourceMaqam, stackIdx) => {
        const ascendingNoteNames = sourceMaqam.ascendingPitchClasses.map(
          (pitchClass) => pitchClass.noteName
        );
        const descendingNoteNames = [
          ...sourceMaqam.descendingPitchClasses.map(
            (pitchClass) => pitchClass.noteName
          ),
        ].reverse();
        // Always calculate both counts independently, regardless of mode
        const totalAjnasModulations = modulationsStack[stackIdx]
          ? calculateNumberOfModulations(
              modulationsStack[stackIdx].ajnas,
              "ajnas"
            )
          : 0;
        const totalMaqamatModulations = modulationsStack[stackIdx]
          ? calculateNumberOfModulations(
              modulationsStack[stackIdx].maqamat,
              "maqamat"
            )
          : 0;
        return (

          <div className="modulations__hops-wrapper" key={stackIdx}>
            {/* Maqam name/details at the top of each wrapper */}
            <div className="modulations__wrapper-modulations-header">
              <div
                className="modulations__source-maqam-name"
                onClick={() => setSelectedMaqam(sourceMaqam)}
                style={{ cursor: "pointer" }}
              >
                {sourceMaqam.name ? sourceMaqam.name : "Unknown"} (
                {ascendingNoteNames ? ascendingNoteNames[0] : "N/A"}/
                {getEnglishNoteName(
                  ascendingNoteNames ? ascendingNoteNames[0]! : ""
                )}
                )
              </div>
              {modulationsStack[stackIdx] && (
                <>
                  <button
                    className={
                      "modulations__ajnas-count" +
                      (ajnasModulationsMode
                        ? " modulations__ajnas-count_active"
                        : "")
                    }
                    style={{
                      cursor: "pointer",
                      textDecoration: ajnasModulationsMode
                        ? "underline"
                        : "none",
                      marginRight: 12,
                      color: ajnasModulationsMode ? "#0070f3" : undefined,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setAjnasModulationsMode(true);
                    }}
                  >
                    {totalAjnasModulations} ajnās modulations
                  </button>
                  <button
                    className={
                      "modulations__maqamat-count" +
                      (!ajnasModulationsMode
                        ? " modulations__maqamat-count_active"
                        : "")
                    }
                    style={{
                      cursor: "pointer",
                      textDecoration: !ajnasModulationsMode
                        ? "underline"
                        : "none",
                      color: !ajnasModulationsMode ? "#0070f3" : undefined,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setAjnasModulationsMode(false);
                    }}
                  >
                    {totalMaqamatModulations} maqāmāt modulations
                  </button>
                </>
              )}

              {/* Show delete button only on the last hops-wrapper and only if more than one exists */}
              {stackIdx === sourceMaqamStack.length - 1 &&
                sourceMaqamStack.length > 1 && (
                  <button
                    className="modulations__delete-hop-btn"
                    style={{
                      marginLeft: 8,
                      padding: "2px 8px",
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                    onClick={removeLastHopsWrapper}
                  >
                    Delete Hop
                  </button>
                )}
            </div>

            {modulationsStack[stackIdx] &&
              (() => {
                const modulations = ajnasModulationsMode
                  ? modulationsStack[stackIdx].ajnas
                  : modulationsStack[stackIdx].maqamat;
                const { noteName2p } = modulations;
                return (
                  <>
                    <div className="modulations__modulations-list">
                      <span className="modulations__header">
                        <span className="modulations__header-text">
                          Tonic:
                          <br />{" "}
                        </span>
                        {ascendingNoteNames[0]} (
                        {modulations?.modulationsOnOne
                          ? modulations.modulationsOnOne.length
                          : 0}
                        )
                      </span>
                      {[...modulations.modulationsOnOne]
                        .sort((a: any, b: any) => a.name.localeCompare(b.name))
                        .map((hop, index) => (
                          <span
                            className="modulations__modulation-item"
                            key={index}
                            onClick={() => {
                              if ("ascendingPitchClasses" in hop) {
                                addHopsWrapper(hop, stackIdx);
                                setSelectedJins(null);
                                // Only call handleClickMaqam/clearHangingNotes if not already selected
                                const maqamDetails = maqamat.find((m) => m.getId() === hop.maqamId);
                                if (
                                  maqamDetails &&
                                  (!selectedMaqamDetails || maqamDetails.getId() !== selectedMaqamDetails.getId())
                                ) {
                                  handleClickMaqam(maqamDetails);
                                  clearHangingNotes();
                                }
                              } else {
                                setSelectedJins(hop);
                                setSelectedMaqam(null);
                              }
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {hop.name}
                          </span>
                        ))}
                    </div>
                    <div className="modulations__modulations-list">
                      <span className="modulations__header">
                        <span className="modulations__header-text">
                          Third:
                          <br />{" "}
                        </span>
                        {ascendingNoteNames[2]} (
                        {modulations?.modulationsOnThree
                          ? modulations.modulationsOnThree.length
                          : 0}
                        )
                      </span>
                      {[...modulations.modulationsOnThree]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((hop, index) => (
                          <span
                            className="modulations__modulation-item"
                            key={index}
                            onClick={() => {
                              if ("ascendingPitchClasses" in hop) {
                                addHopsWrapper(hop, stackIdx);
                                setSelectedJins(null);
                                // Only call handleClickMaqam/clearHangingNotes if not already selected
                                const maqamDetails = maqamat.find((m) => m.getId() === hop.maqamId);
                                if (
                                  maqamDetails &&
                                  (!selectedMaqamDetails || maqamDetails.getId() !== selectedMaqamDetails.getId())
                                ) {
                                  handleClickMaqam(maqamDetails);
                                  clearHangingNotes();
                                }
                              } else {
                                setSelectedJins(hop);
                                setSelectedMaqam(null);
                              }
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {hop.name}
                          </span>
                        ))}
                    </div>
                    <div className="modulations__modulations-list">
                      <span className="modulations__header">
                        <span className="modulations__header-text">
                          Third (alternative):
                          <br />{" "}
                        </span>
                        {noteName2p} (
                        {modulations?.modulationsOnThree2p
                          ? modulations.modulationsOnThree2p.length
                          : 0}
                        )
                      </span>
                      {[...modulations.modulationsOnThree2p]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((hop, index) => (
                          <span
                            className="modulations__modulation-item"
                            key={index}
                            onClick={() => {
                              if ("ascendingPitchClasses" in hop) {
                                addHopsWrapper(hop, stackIdx);
                                setSelectedJins(null);
                                // Only call handleClickMaqam/clearHangingNotes if not already selected
                                const maqamDetails = maqamat.find((m) => m.getId() === hop.maqamId);
                                if (
                                  maqamDetails &&
                                  (!selectedMaqamDetails || maqamDetails.getId() !== selectedMaqamDetails.getId())
                                ) {
                                  handleClickMaqam(maqamDetails);
                                  clearHangingNotes();
                                }
                              } else {
                                setSelectedJins(hop);
                                setSelectedMaqam(null);
                              }
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {hop.name}
                          </span>
                        ))}
                    </div>
                    <div className="modulations__modulations-list">
                      <span className="modulations__header">
                        <span className="modulations__header-text">
                          Fourth:
                          <br />{" "}
                        </span>
                        {ascendingNoteNames[3]} (
                        {modulations?.modulationsOnFour
                          ? modulations.modulationsOnFour.length
                          : 0}
                        )
                      </span>
                      {[...modulations.modulationsOnFour]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((hop, index) => (
                          <span
                            className="modulations__modulation-item"
                            key={index}
                            onClick={() => {
                              if ("ascendingPitchClasses" in hop) {
                                addHopsWrapper(hop, stackIdx);
                                setSelectedJins(null);
                                // Only call handleClickMaqam/clearHangingNotes if not already selected
                                const maqamDetails = maqamat.find((m) => m.getId() === hop.maqamId);
                                if (
                                  maqamDetails &&
                                  (!selectedMaqamDetails || maqamDetails.getId() !== selectedMaqamDetails.getId())
                                ) {
                                  handleClickMaqam(maqamDetails);
                                  clearHangingNotes();
                                }
                              } else {
                                setSelectedJins(hop);
                                setSelectedMaqam(null);
                              }
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {hop.name}
                          </span>
                        ))}
                    </div>
                    <div className="modulations__modulations-list">
                      <span className="modulations__header">
                        <span className="modulations__header-text">
                          Fifth:
                          <br />{" "}
                        </span>
                        {ascendingNoteNames[4]} (
                        {modulations?.modulationsOnFive
                          ? modulations.modulationsOnFive.length
                          : 0}
                        )
                      </span>
                      {[...modulations.modulationsOnFive]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((hop, index) => (
                          <span
                            className="modulations__modulation-item"
                            key={index}
                            onClick={() => {
                              if ("ascendingPitchClasses" in hop) {
                                addHopsWrapper(hop, stackIdx);
                                setSelectedJins(null);
                                // Only call handleClickMaqam/clearHangingNotes if not already selected
                                const maqamDetails = maqamat.find((m) => m.getId() === hop.maqamId);
                                if (
                                  maqamDetails &&
                                  (!selectedMaqamDetails || maqamDetails.getId() !== selectedMaqamDetails.getId())
                                ) {
                                  handleClickMaqam(maqamDetails);
                                  clearHangingNotes();
                                }
                              } else {
                                setSelectedJins(hop);
                                setSelectedMaqam(null);
                              }
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {hop.name}
                          </span>
                        ))}
                    </div>
                    <div className="modulations__modulations-list">
                      <span className="modulations__header">
                        <span className="modulations__header-text">
                          Sixth (if no Third):
                          <br />{" "}
                        </span>
                        {ascendingNoteNames[5]} (
                        {modulations?.modulationsOnSixNoThird
                          ? modulations.modulationsOnSixNoThird.length
                          : 0}
                        )
                      </span>
                      {[...modulations.modulationsOnSixNoThird]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((hop, index) => (
                          <span
                            className="modulations__modulation-item"
                            key={index}
                            onClick={() => {
                              if ("ascendingPitchClasses" in hop) {
                                addHopsWrapper(hop, stackIdx);
                                setSelectedJins(null);
                                // Only call handleClickMaqam/clearHangingNotes if not already selected
                                const maqamDetails = maqamat.find((m) => m.getId() === hop.maqamId);
                                if (
                                  maqamDetails &&
                                  (!selectedMaqamDetails || maqamDetails.getId() !== selectedMaqamDetails.getId())
                                ) {
                                  handleClickMaqam(maqamDetails);
                                  clearHangingNotes();
                                }
                              } else {
                                setSelectedJins(hop);
                                setSelectedMaqam(null);
                              }
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {hop.name}
                          </span>
                        ))}
                    </div>
                    <div className="modulations__modulations-list">
                      <span className="modulations__header">
                        <span className="modulations__header-text">
                          Sixth (ascending):
                          <br />{" "}
                        </span>
                        {ascendingNoteNames[5]} (
                        {modulations?.modulationsOnSixAscending
                          ? modulations.modulationsOnSixAscending.length
                          : 0}
                        )
                      </span>
                      {[...modulations.modulationsOnSixAscending]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((hop, index) => (
                          <span
                            className="modulations__modulation-item"
                            key={index}
                            onClick={() => {
                              if ("ascendingPitchClasses" in hop) {
                                addHopsWrapper(hop, stackIdx);
                                setSelectedJins(null);
                                // Only call handleClickMaqam/clearHangingNotes if not already selected
                                const maqamDetails = maqamat.find((m) => m.getId() === hop.maqamId);
                                if (
                                  maqamDetails &&
                                  (!selectedMaqamDetails || maqamDetails.getId() !== selectedMaqamDetails.getId())
                                ) {
                                  handleClickMaqam(maqamDetails);
                                  clearHangingNotes();
                                }
                              } else {
                                setSelectedJins(hop);
                                setSelectedMaqam(null);
                              }
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {hop.name}
                          </span>
                        ))}
                    </div>
                    {/* Only show descending if different from ascending */}
                    <div className="modulations__modulations-list">
                      <span className="modulations__header">
                        <span className="modulations__header-text">
                          Sixth (descending): <br />{" "}
                        </span>
                        {descendingNoteNames[5]} (
                        {modulations?.modulationsOnSixDescending
                          ? modulations.modulationsOnSixDescending.length
                          : 0}
                        )
                      </span>
                      {JSON.stringify(
                        modulations.modulationsOnSixDescending
                      ) !==
                        JSON.stringify(
                          modulations.modulationsOnSixAscending
                        ) &&
                        [...modulations.modulationsOnSixDescending]
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((hop, index) => (
                          <span
                            className="modulations__modulation-item"
                            key={index}
                            onClick={() => {
                              if ("ascendingPitchClasses" in hop) {
                                addHopsWrapper(hop, stackIdx);
                                setSelectedJins(null);
                                // Only call handleClickMaqam/clearHangingNotes if not already selected
                                const maqamDetails = maqamat.find((m) => m.getId() === hop.maqamId);
                                if (
                                  maqamDetails &&
                                  (!selectedMaqamDetails || maqamDetails.getId() !== selectedMaqamDetails.getId())
                                ) {
                                  handleClickMaqam(maqamDetails);
                                  clearHangingNotes();
                                }
                              } else {
                                setSelectedJins(hop);
                                setSelectedMaqam(null);
                              }
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {hop.name}
                          </span>
                          ))}
                    </div>
                  </>
                );
              })()}
          </div>
        );
      })}
    </div>
  );
}
