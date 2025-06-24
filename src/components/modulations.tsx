"use client";

import useAppContext from "@/contexts/app-context";
import React, { useState, useEffect } from "react";
import { MaqamModulations, Maqam } from "@/models/Maqam";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import calculateNumberOfHops from "@/functions/calculateNumberOfHops";

export default function Modulations() {
  const {
    maqamat,
    selectedMaqamDetails,
    setSelectedMaqamDetails,
    getModulations,
    selectedMaqam,
    setSelectedMaqam,
    allPitchClasses,
    setSelectedPitchClasses,
  } = useAppContext();

  const [sourceMaqamStack, setSourceMaqamStack] = useState<Maqam[]>([]);
  const [modulationsStack, setModulationsStack] = useState<MaqamModulations[]>([]);

  useEffect(() => {
    if (selectedMaqamDetails) {
      const transposition = selectedMaqamDetails.getTahlil(allPitchClasses);
      setSourceMaqamStack([transposition]);
      const modulationsData = getModulations(transposition);
      setModulationsStack([modulationsData]);
    } else {
      setSourceMaqamStack([]);
      setModulationsStack([]);
    }
  }, []);

  useEffect(() => {
    if (selectedMaqam) {
      const maqam = maqamat.find((m) => m.getId() === selectedMaqam.maqamId);
      if (maqam) {
        setSelectedMaqamDetails(maqam);
      }
      setSelectedPitchClasses(selectedMaqam.ascendingPitchClasses);
    }
  }, [selectedMaqam]);

  const addHopsWrapper = (maqamTransposition: Maqam, stackIdx: number) => {
    const newModulations = getModulations(maqamTransposition);
    setSourceMaqamStack((prev) => [...prev.slice(0, stackIdx + 1), maqamTransposition]);
    setModulationsStack((prev) => [...prev.slice(0, stackIdx + 1), newModulations]);
  };

  const removeLastHopsWrapper = () => {
    setSourceMaqamStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    setModulationsStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  return (
    <div className="modulations__container">
      {sourceMaqamStack.map((sourceMaqam, stackIdx) => {
        const ascendingNoteNames = sourceMaqam.ascendingPitchClasses.map((pitchClass) => pitchClass.noteName);
        const totalModulations = calculateNumberOfHops(modulationsStack[stackIdx]);
        return (
          <div
            className="modulations__hops-wrapper"
            key={stackIdx}
            style={{ marginTop: stackIdx === 0 ? 0 : 32, borderTop: stackIdx === 0 ? undefined : "1px solid #444" }}
          >
            {/* Maqam name/details at the top of each wrapper */}
            <div className="modulations__wrapper-maqam-name">
              <span onClick={() => setSelectedMaqam(sourceMaqam)} style={{ cursor: "pointer" }}>
                {sourceMaqam.name ? sourceMaqam.name : "Unknown"} ({ascendingNoteNames ? ascendingNoteNames[0] : "N/A"}/
                {getEnglishNoteName(ascendingNoteNames ? ascendingNoteNames[0]! : "")})
                {modulationsStack[stackIdx] && <> - {totalModulations} modulation options</>}
              </span>
              {/* Show delete button only on the last hops-wrapper and only if more than one exists */}
              {stackIdx === sourceMaqamStack.length - 1 && sourceMaqamStack.length > 1 && (
                <button
                  className="modulations__delete-hop-btn"
                  style={{ marginLeft: 8, padding: "2px 8px", fontSize: 14, cursor: "pointer" }}
                  onClick={removeLastHopsWrapper}
                >
                  Delete Hop
                </button>
              )}
            </div>

            {modulationsStack[stackIdx] &&
              (() => {
                const modulations = modulationsStack[stackIdx];
                const { noteName2p } = modulations;
                return (
                  <>
                    <div className="modulations__hops">
                      <span className="modulations__header">
                        Modulations from Tonic: <br />
                        {ascendingNoteNames[0]} ({modulations?.hopsFromOne ? modulations.hopsFromOne.length : 0})
                      </span>
                      {[...modulations.hopsFromOne]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((hop, index) => (
                          <span
                            key={index}
                            onClick={() => {
                              addHopsWrapper(hop, stackIdx);
                              setSelectedMaqam(hop);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {hop.name}
                          </span>
                        ))}
                    </div>
                    <div className="modulations__hops">
                      <span className="modulations__header">
                        Modulations from Third: <br />
                        {ascendingNoteNames[2]} ({modulations?.hopsFromThree ? modulations.hopsFromThree.length : 0})
                      </span>
                      {[...modulations.hopsFromThree]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((hop, index) => (
                          <span
                            key={index}
                            onClick={() => {
                              addHopsWrapper(hop, stackIdx);
                              setSelectedMaqam(hop);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {hop.name}
                          </span>
                        ))}
                    </div>
                    <div className="modulations__hops">
                      <span className="modulations__header">
                        Modulations from Alternative Third: <br />
                        {noteName2p} ({modulations?.hopsFromThree2p ? modulations.hopsFromThree2p.length : 0})
                      </span>
                      {[...modulations.hopsFromThree2p]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((hop, index) => (
                          <span
                            key={index}
                            onClick={() => {
                              addHopsWrapper(hop, stackIdx);
                              setSelectedMaqam(hop);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {hop.name}
                          </span>
                        ))}
                    </div>
                    <div className="modulations__hops">
                      <span className="modulations__header">
                        Modulations from Fourth: <br />
                        {ascendingNoteNames[3]} ({modulations?.hopsFromFour ? modulations.hopsFromFour.length : 0})
                      </span>
                      {[...modulations.hopsFromFour]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((hop, index) => (
                          <span
                            key={index}
                            onClick={() => {
                              addHopsWrapper(hop, stackIdx);
                              setSelectedMaqam(hop);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {hop.name}
                          </span>
                        ))}
                    </div>
                    <div className="modulations__hops">
                      <span className="modulations__header">
                        Modulations from Fifth: <br />
                        {ascendingNoteNames[4]} ({modulations?.hopsFromFive ? modulations.hopsFromFive.length : 0})
                      </span>
                      {[...modulations.hopsFromFive]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((hop, index) => (
                          <span
                            key={index}
                            onClick={() => {
                              addHopsWrapper(hop, stackIdx);
                              setSelectedMaqam(hop);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {hop.name}
                          </span>
                        ))}
                    </div>
                    <div className="modulations__hops">
                      <span className="modulations__header">
                        Modulations from Sixth: <br />
                        {ascendingNoteNames[5]} ({modulations?.hopsFromSix ? modulations.hopsFromSix.length : 0})
                      </span>
                      {[...modulations.hopsFromSix]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((hop, index) => (
                          <span
                            key={index}
                            onClick={() => {
                              addHopsWrapper(hop, stackIdx);
                              setSelectedMaqam(hop);
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
