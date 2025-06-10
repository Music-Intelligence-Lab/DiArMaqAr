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
        <h2>
          Modulations From Tonic: {modulatedMaqamTransposition?.ascendingNoteNames[0]} ({modulations?.hopsFromOne ? modulations.hopsFromOne.length : 0})
        </h2>
        <div className="modulations__carousel">
          <button
            className="carousel-button carousel-button-prev"
            onClick={() => {
              const c = document.querySelector(".modulations__list-tonic");
              if (c) c.scrollBy({ left: -670, behavior: "smooth" });
            }}
          >
            ‹
          </button>
          <div className="modulations__list modulations__list-tonic">
            {[...modulations.hopsFromOne]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((hop, index) => (
          <button
            key={index}
            className="modulations__item"
            onClick={() => {
              setModulatedMaqamTransposition(hop);
              setSelectedMaqamTransposition(hop);
            }}
          >
            {hop.name}
          </button>
              ))}
          </div>
          <button
            className="carousel-button carousel-button-next"
            onClick={() => {
              const c = document.querySelector(".modulations__list-tonic");
              if (c) c.scrollBy({ left: 520, behavior: "smooth" });
            }}
          >
            ›
          </button>
        </div>
        <h2>
          Modulations From Third: {modulatedMaqamTransposition?.ascendingNoteNames[2]} (
          {modulations?.hopsFromThree ? modulations.hopsFromThree.length : 0})
        </h2>
        <div className="modulations__carousel">
          <button
            className="carousel-button carousel-button-prev"
            onClick={() => {
              const c = document.querySelector(".modulations__list-third");
              if (c) c.scrollBy({ left: -670, behavior: "smooth" });
            }}
          >
            ‹
          </button>
          <div className="modulations__list modulations__list-third">
            {[...modulations.hopsFromThree]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((hop, index) => (
          <button
            key={index}
            className="modulations__item"
            onClick={() => {
              setModulatedMaqamTransposition(hop);
              setSelectedMaqamTransposition(hop);
            }}
          >
            {hop.name}
          </button>
              ))}
          </div>
          <button
            className="carousel-button carousel-button-next"
            onClick={() => {
              const c = document.querySelector(".modulations__list-third");
              if (c) c.scrollBy({ left: 520, behavior: "smooth" });
            }}
          >
            ›
          </button>
        </div>
        <h2>
          Modulations From Alternative Third: {modulatedMaqamTransposition?.ascendingNoteNames[2]} (
          {modulations?.hopsFromThree2p ? modulations.hopsFromThree2p.length : 0})
        </h2>
        <div className="modulations__carousel">
          <button
            className="carousel-button carousel-button-prev"
            onClick={() => {
              const c = document.querySelector(".modulations__list-third2p");
              if (c) c.scrollBy({ left: -670, behavior: "smooth" });
            }}
          >
            ‹
          </button>
          <div className="modulations__list modulations__list-third2p">
            {[...modulations.hopsFromThree2p]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((hop, index) => (
          <button
            key={index}
            className="modulations__item"
            onClick={() => {
              setModulatedMaqamTransposition(hop);
              setSelectedMaqamTransposition(hop);
            }}
          >
            {hop.name}
          </button>
              ))}
          </div>
          <button
            className="carousel-button carousel-button-next"
            onClick={() => {
              const c = document.querySelector(".modulations__list-third2p");
              if (c) c.scrollBy({ left: 520, behavior: "smooth" });
            }}
          >
            ›
          </button>
        </div>
        <h2>
          Modulations From Fourth: {modulatedMaqamTransposition?.ascendingNoteNames[3]} (
          {modulations?.hopsFromFour ? modulations.hopsFromFour.length : 0})
        </h2>
        <div className="modulations__carousel">
          <button
            className="carousel-button carousel-button-prev"
            onClick={() => {
              const c = document.querySelector(".modulations__list-four");
              if (c) c.scrollBy({ left: -670, behavior: "smooth" });
            }}
          >
            ‹
          </button>
          <div className="modulations__list modulations__list-four">
            {[...modulations.hopsFromFour]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((hop, index) => (
          <button
            key={index}
            className="modulations__item"
            onClick={() => {
              setModulatedMaqamTransposition(hop);
              setSelectedMaqamTransposition(hop);
            }}
          >
            {hop.name}
          </button>
              ))}
          </div>
          <button
            className="carousel-button carousel-button-next"
            onClick={() => {
              const c = document.querySelector(".modulations__list-four");
              if (c) c.scrollBy({ left: 520, behavior: "smooth" });
            }}
          >
            ›
          </button>
        </div>
        <h2>
          Modulations From Fifth: {modulatedMaqamTransposition?.ascendingNoteNames[4]} (
          {modulations?.hopsFromFive ? modulations.hopsFromFive.length : 0})
        </h2>
        <div className="modulations__carousel">
          <button
            className="carousel-button carousel-button-prev"
            onClick={() => {
              const c = document.querySelector(".modulations__list-five");
              if (c) c.scrollBy({ left: -670, behavior: "smooth" });
            }}
          >
            ‹
          </button>
          <div className="modulations__list modulations__list-five">
            {[...modulations.hopsFromFive]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((hop, index) => (
          <button
            key={index}
            className="modulations__item"
            onClick={() => {
              setModulatedMaqamTransposition(hop);
              setSelectedMaqamTransposition(hop);
            }}
          >
            {hop.name}
          </button>
              ))}
          </div>
          <button
            className="carousel-button carousel-button-next"
            onClick={() => {
              const c = document.querySelector(".modulations__list-five");
              if (c) c.scrollBy({ left: 520, behavior: "smooth" });
            }}
          >
            ›
          </button>
        </div>
        <h2>
          Modulations From Sixth: {modulatedMaqamTransposition?.ascendingNoteNames[5]} (
          {modulations?.hopsFromSix ? modulations.hopsFromSix.length : 0})
        </h2>
        <div className="modulations__carousel">
          <button
            className="carousel-button carousel-button-prev"
            onClick={() => {
              const c = document.querySelector(".modulations__list-six");
              if (c) c.scrollBy({ left: -670, behavior: "smooth" });
            }}
          >
            ‹
          </button>
          <div className="modulations__list modulations__list-six">
            {[...modulations.hopsFromSix]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((hop, index) => (
          <button
            key={index}
            className="modulations__item"
            onClick={() => {
              setModulatedMaqamTransposition(hop);
              setSelectedMaqamTransposition(hop);
            }}
          >
            {hop.name}
          </button>
              ))}
          </div>
          <button
            className="carousel-button carousel-button-next"
            onClick={() => {
              const c = document.querySelector(".modulations__list-six");
              if (c) c.scrollBy({ left: 520, behavior: "smooth" });
            }}
          >
            ›
          </button>
        </div>
      </div>}
    </div>
  );
}
