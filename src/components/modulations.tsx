"use client";

import { Cell, useAppContext } from "@/contexts/app-context";
import React, { useState, useEffect, use } from "react";
import { MaqamModulations, MaqamTransposition } from "@/models/Maqam";

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

  useEffect((
  ) => {
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


  return (
    <div className="modulations">
      {modulations && <div className="modulations__hops">
        <h2>Modulations From Tonic: {modulatedMaqamTransposition?.ascendingNoteNames[0]}</h2>
        <ul>
            {[...modulations.hopsFromOne]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((hop, index) => (
              <li
              key={index}
              onClick={() => {
                setModulatedMaqamTransposition(hop);
                setSelectedMaqamTransposition(hop);
              }}
              style={{ cursor: "pointer" }}
              >
              {hop.name}
              </li>
            ))}
        </ul>
        <h2>Modulations From Third: {modulatedMaqamTransposition?.ascendingNoteNames[2]}</h2>
        <ul>
          {[...modulations.hopsFromThree]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((hop, index) => (
              <li
          key={index}
          onClick={() => {
            setModulatedMaqamTransposition(hop);
            setSelectedMaqamTransposition(hop);
          }}
          style={{ cursor: "pointer" }}
              >
          {hop.name}
              </li>
            ))}
        </ul>
        <h2>Modulations From Third </h2>
        <ul>
          {[...modulations.hopsFromThree2p]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((hop, index) => (
              <li
          key={index}
          onClick={() => {
            setModulatedMaqamTransposition(hop);
            setSelectedMaqamTransposition(hop);
          }}
          style={{ cursor: "pointer" }}
              >
          {hop.name}
              </li>
            ))}
        </ul>
        <h2>Modulations From Fourth</h2>
        <ul>
          {[...modulations.hopsFromFour]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((hop, index) => (
              <li
          key={index}
          onClick={() => {
            setModulatedMaqamTransposition(hop);
            setSelectedMaqamTransposition(hop);
          }}
          style={{ cursor: "pointer" }}
              >
          {hop.name}
              </li>
            ))}
        </ul>
        <h2>Modulations From Fifth</h2>
        <ul>
          {[...modulations.hopsFromFive]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((hop, index) => (
              <li
          key={index}
          onClick={() => {
            setModulatedMaqamTransposition(hop);
            setSelectedMaqamTransposition(hop);
          }}
          style={{ cursor: "pointer" }}
              >
          {hop.name}
              </li>
            ))}
        </ul>
        <h2>Modulations From Sixth</h2>
        <ul>
          {[...modulations.hopsFromSix]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((hop, index) => (
              <li
          key={index}
          onClick={() => {
            setModulatedMaqamTransposition(hop);
            setSelectedMaqamTransposition(hop);
          }}
          style={{ cursor: "pointer" }}
              >
          {hop.name}
              </li>
            ))}
        </ul>
      </div>}
    </div>
  );
}
