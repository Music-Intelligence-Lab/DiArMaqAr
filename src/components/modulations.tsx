"use client";

import { Cell, useAppContext } from "@/contexts/app-context";
import React, { useState, useEffect, use } from "react";
import { MaqamModulations, MaqamTransposition } from "@/models/Maqam";
import { getEnglishNoteName } from "@/functions/noteNameMappings";


export default function Modulations() {
  const {
    selectedMaqam,
    getModulations,
    setSelectedMaqamTransposition,
    allCellDetails,
    setSelectedCells
  } = useAppContext();

  const [modulatedMaqamTransposition, setModulatedMaqamTransposition] = useState<MaqamTransposition | null>(null);
  const [modulations, setModulations] = useState<MaqamModulations | null>(null);

  useEffect(() => {
    if (selectedMaqam) {
      const transposition = selectedMaqam.convertToMaqamTransposition();
      setModulatedMaqamTransposition(transposition);
      const modulationsData = getModulations(transposition);
      setModulations(modulationsData);
    } else {
      setModulatedMaqamTransposition(null);
      setModulations(null);
    }
  }, []);

  useEffect(() => {
    if (modulatedMaqamTransposition) {
      const modulationsData = getModulations(modulatedMaqamTransposition);
      const newSelectedCells: Cell[] = [];

      for (const cellDetails of allCellDetails) {
        if (modulatedMaqamTransposition.ascendingNoteNames.includes(cellDetails.noteName)) {
          newSelectedCells.push({ index: cellDetails.index, octave: cellDetails.octave });
        }
      }
      setSelectedCells(newSelectedCells);

    }
  }, [modulatedMaqamTransposition]);

  const totalModulations =
    (modulations?.hopsFromOne?.length || 0) +
    (modulations?.hopsFromThree?.length || 0) +
    (modulations?.hopsFromThree2p?.length || 0) +
    (modulations?.hopsFromFour?.length || 0) +
    (modulations?.hopsFromFive?.length || 0) +
    (modulations?.hopsFromSix?.length || 0);

  return (
    <div className="modulations__container">
      <div className="modulations__source-maqam-name">
        {selectedMaqam?.getName()} ({selectedMaqam?.getAscendingNoteNames()[0]}/{getEnglishNoteName(selectedMaqam?.getAscendingNoteNames()[0]!)}) - {totalModulations} modulation options
      </div>

      {modulations &&
        (() => {
          const { noteName2p } = modulations;
          return (
            <>
              <div className="modulations__hops">

                <span className="modulations__header">
                  Modulations From Tonic: <br/>
                  {modulatedMaqamTransposition?.ascendingNoteNames[0]} ({modulations?.hopsFromOne ? modulations.hopsFromOne.length : 0})
                </span>

                {[...modulations.hopsFromOne]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((hop, index) => (
                    <span
                      key={index}
                      onClick={() => {
                        setModulatedMaqamTransposition(hop);
                        setSelectedMaqamTransposition(hop);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {hop.name}
                    </span>
                  ))}

              </div>

              <div className="modulations__hops">

                <span className="modulations__header"> 
                  Modulations From Third <br/>
                  {modulatedMaqamTransposition?.ascendingNoteNames[2]} ({modulations?.hopsFromThree ? modulations.hopsFromThree.length : 0})
                </span>
                {[...modulations.hopsFromThree]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((hop, index) => (
                    <span
                      key={index}
                      onClick={() => {
                        setModulatedMaqamTransposition(hop);
                        setSelectedMaqamTransposition(hop);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {hop.name}
                    </span>
                  ))}

              </div>

              <div className="modulations__hops">
                <span className="modulations__header">              
                  Modulations From Alternative Third <br/>
                  {noteName2p} ({modulations?.hopsFromThree2p ? modulations.hopsFromThree2p.length : 0})
                </span>
                {[...modulations.hopsFromThree2p]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((hop, index) => (
                    <span
                      key={index}
                      onClick={() => {
                        setModulatedMaqamTransposition(hop);
                        setSelectedMaqamTransposition(hop);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {hop.name}
                    </span>
                  ))}

              </div>

              <div className="modulations__hops">
                <span className="modulations__header">              
                  Modulations From Fourth <br/>
                  {modulatedMaqamTransposition?.ascendingNoteNames[3]} ({modulations?.hopsFromFour ? modulations.hopsFromFour.length : 0})
                </span>
                {[...modulations.hopsFromFour]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((hop, index) => (
                    <span
                      key={index}
                      onClick={() => {
                        setModulatedMaqamTransposition(hop);
                        setSelectedMaqamTransposition(hop);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {hop.name}
                    </span>
                  ))}

              </div>

              <div className="modulations__hops">
                <span className="modulations__header">
                  Modulations From Fifth <br/>
                  {modulatedMaqamTransposition?.ascendingNoteNames[4]} ({modulations?.hopsFromFive ? modulations.hopsFromFive.length : 0})
                </span>

                {[...modulations.hopsFromFive]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((hop, index) => (
                    <span
                      key={index}
                      onClick={() => {
                        setModulatedMaqamTransposition(hop);
                        setSelectedMaqamTransposition(hop);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {hop.name}
                    </span>
                  ))}

              </div>

              <div className="modulations__hops">
<span className="modulations__header">
                  Modulations From Sixth: <br/>
                  {modulatedMaqamTransposition?.ascendingNoteNames[5]} ({modulations?.hopsFromSix ? modulations.hopsFromSix.length : 0})
</span>

                {[...modulations.hopsFromSix]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((hop, index) => (
                    <span
                      key={index}
                      onClick={() => {
                        setModulatedMaqamTransposition(hop);
                        setSelectedMaqamTransposition(hop);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {hop.name}
                    </span>
                  ))}

              </div>
            </>
          );
        })()
      }
    </div>
  );
}
