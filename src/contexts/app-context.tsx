"use client";

import React, { createContext, useState, useEffect, useRef, useContext } from "react";
import tuningSystemsData from "@/../data/tuningSystems.json";
import ajnasData from "@/../data/ajnas.json";
import TuningSystem from "@/models/TuningSystem";
import Jins from "@/models/Jins";
import TransliteratedNoteName from "@/models/NoteName";
import detectPitchClassType from "@/functions/detectPitchClassType";
import convertPitchClass, { shiftPitchClass } from "@/functions/convertPitchClass";
import { octaveZeroNoteNames, octaveOneNoteNames, octaveTwoNoteNames, octaveThreeNoteNames, octaveFourNoteNames } from "@/models/NoteName";

interface EnvelopeParams {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export interface SelectedCell {
  octave: number;
  index: number;
}

export interface CellDetails {
  noteName: string;
  fraction: string;
  cents: string;
  ratios: string;
  stringLength: string;
  originalValueType: string;
}

interface AppContextInterface {
  isPageLoading: boolean;
  tuningSystems: TuningSystem[];
  updateAllTuningSystems: (newSystems: TuningSystem[]) => Promise<void>;
  selectedTuningSystem: TuningSystem | null;
  setSelectedTuningSystem: (tuningSystem: TuningSystem | null) => void;
  playNoteFrequency: (frequency: number, duration?: number) => void;
  envelopeParams: EnvelopeParams;
  setEnvelopeParams: React.Dispatch<React.SetStateAction<EnvelopeParams>>;
  selectedCells: SelectedCell[];
  setSelectedCells: React.Dispatch<React.SetStateAction<SelectedCell[]>>;
  selectedIndices: number[];
  setSelectedIndices: React.Dispatch<React.SetStateAction<number[]>>;
  getSelectedCellDetails: (cell: SelectedCell) => CellDetails;
  // New state for ajnas and selected jins:
  ajnas: Jins[];
  setAjnas: React.Dispatch<React.SetStateAction<Jins[]>>;
  updateAllAjnas: (newAjnas: Jins[]) => Promise<void>;
  selectedJins: Jins | null;
  setSelectedJins: React.Dispatch<React.SetStateAction<Jins | null>>;
  getNoteNamesUsedInTuningSystem: () => TransliteratedNoteName[];
}

const AppContext = createContext<AppContextInterface | null>(null);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [tuningSystems, setTuningSystems] = useState<TuningSystem[]>([]);
  const [selectedTuningSystem, setSelectedTuningSystem] = useState<TuningSystem | null>(null);

  const [envelopeParams, setEnvelopeParams] = useState<EnvelopeParams>({
    attack: 0.01,
    decay: 0.01,
    sustain: 0.7,
    release: 0.3,
  });

  const [selectedCells, setSelectedCells] = useState<SelectedCell[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const [ajnas, setAjnas] = useState<Jins[]>([]);
  const [selectedJins, setSelectedJins] = useState<Jins | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    const formattedTuningSystems = tuningSystemsData.map((data) => {
      return new TuningSystem(
        data.id,
        data.titleEnglish,
        data.titleArabic || "",
        data.year,
        data.sourceEnglish,
        data.sourceArabic,
        data.creatorEnglish,
        data.creatorArabic,
        data.commentsEnglish,
        data.commentsArabic,
        data.pitchClasses, // an array of pitch class strings
        data.noteNames as TransliteratedNoteName[][], // note names configuration
        data.abjadNames,
        Number(data.stringLength),
        Number(data.referenceFrequency)
      );
    });

    setTuningSystems(formattedTuningSystems);

    const loadedAjnas = ajnasData.map((data) => new Jins(data.name, data.noteNames));
    setAjnas(loadedAjnas);

    setIsPageLoading(false);
  }, []);

  useEffect(() => {
    const AudioContext = window.AudioContext;
    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;

    const masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(audioCtx.destination);
    masterGainRef.current = masterGain;
  }, []);

  useEffect(() => {
    if (selectedJins) {
      const selectedNoteNames = selectedCells.map((cell: SelectedCell) => {
        const details = getSelectedCellDetails(cell);
        return details.noteName;
      });

      setSelectedJins(new Jins(selectedJins.getName(), selectedNoteNames));
    }
  }, [selectedCells]);

  const playNoteFrequency = (frequency: number, duration: number = 1) => {
    if (!audioCtxRef.current || !masterGainRef.current) return;
    if (isNaN(frequency) || frequency <= 0) return;

    const audioCtx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    const startTime = audioCtx.currentTime;
    const { attack, decay, sustain, release } = envelopeParams;

    const attackEnd = startTime + attack;
    const decayEnd = attackEnd + decay;
    const noteOffTime = startTime + duration;
    const releaseStart = Math.max(noteOffTime - release, decayEnd);
    const releaseEnd = releaseStart + release;

    const oscillator = audioCtx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, startTime);

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(1, attackEnd);
    gainNode.gain.linearRampToValueAtTime(sustain, decayEnd);
    gainNode.gain.setValueAtTime(sustain, releaseStart);
    gainNode.gain.linearRampToValueAtTime(0, releaseEnd);

    oscillator.connect(gainNode).connect(masterGain);
    oscillator.start(startTime);
    oscillator.stop(releaseEnd);
  };

  const updateAllTuningSystems = async (newSystems: TuningSystem[]) => {
    setTuningSystems(newSystems);
    if (selectedTuningSystem) {
      const existsInNew = newSystems.find((sys) => sys.getId() === selectedTuningSystem.getId());
      if (!existsInNew) {
        setSelectedTuningSystem(null);
      }
    }
    try {
      const response = await fetch("/api/tuningSystems", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          newSystems.map((ts) => ({
            id: ts.getId(),
            titleEnglish: ts.getTitleEnglish(),
            titleArabic: ts.getTitleArabic(),
            year: ts.getYear(),
            sourceEnglish: ts.getSourceEnglish(),
            sourceArabic: ts.getSourceArabic(),
            creatorEnglish: ts.getCreatorEnglish(),
            creatorArabic: ts.getCreatorArabic(),
            commentsEnglish: ts.getCommentsEnglish(),
            commentsArabic: ts.getCommentsArabic(),
            pitchClasses: ts.getNotes(),
            noteNames: ts.getSetsOfNoteNames(),
            abjadNames: ts.getAbjadNames(),
            stringLength: ts.getStringLength(),
            referenceFrequency: ts.getReferenceFrequency(),
          }))
        ),
      });
      if (!response.ok) {
        throw new Error("Failed to save updated TuningSystems on the server.");
      }
    } catch (error) {
      console.error("Error updating all TuningSystems:", error);
    }
  };

  const updateAllAjnas = async (newAjnas: Jins[]) => {
    console.log(newAjnas);
    setAjnas(newAjnas);
    setSelectedJins(null);

    try {
      const response = await fetch("/api/ajnas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          newAjnas.map((j) => ({
            name: j.getName(),
            noteNames: j.getNoteNames(),
          }))
        ),
      });
      if (!response.ok) {
        throw new Error("Failed to save updated Ajnas on the server.");
      }
    } catch (error) {
      console.error("Error updating all Ajnas:", error);
    }
  };

  const getNoteNamesUsedInTuningSystem = (): TransliteratedNoteName[] => {
    if (!selectedTuningSystem) return [];

    const noteNames = [];
    const baseLength = 34;

    for (let octave = 0; octave < 4; octave++) {
      for (const index of selectedIndices) {
        if (index < baseLength) {
          switch (octave) {
            case 0:
              noteNames.push(octaveZeroNoteNames[index] || "none");
              break;
            case 1:
              noteNames.push(octaveOneNoteNames[index] || "none");
              break;
            case 2:
              noteNames.push(octaveTwoNoteNames[index] || "none");
              break;
            case 3:
              noteNames.push(octaveThreeNoteNames[index] || "none");
              break;
          }
        } else {
          const localIndex = index - baseLength;
          switch (octave) {
            case 0:
              noteNames.push(octaveOneNoteNames[localIndex] || "none");
              break;
            case 1:
              noteNames.push(octaveTwoNoteNames[localIndex] || "none");
              break;
            case 2:
              noteNames.push(octaveThreeNoteNames[localIndex] || "none");
              break;
            case 3:
              noteNames.push(octaveFourNoteNames[localIndex] || "none");
              break;
          }
        }
      }
    }

    return noteNames;
  };

  const getSelectedCellDetails = (cell: SelectedCell): CellDetails => {
    const emptyDetails: CellDetails = {
      noteName: "",
      fraction: "",
      cents: "",
      ratios: "",
      stringLength: "",
      originalValueType: "",
    };

    if (!selectedTuningSystem) return emptyDetails;

    const pitchArr = selectedTuningSystem.getNotes();
    if (cell.index < 0 || cell.index >= pitchArr.length) return emptyDetails;
    const basePc = pitchArr[cell.index];

    const pitchType = detectPitchClassType(pitchArr);
    if (pitchType === "unknown") return emptyDetails;

    const shiftedPc = shiftPitchClass(basePc, pitchType, cell.octave as 0 | 1 | 2 | 3);
    const conv = convertPitchClass(shiftedPc, pitchType, selectedTuningSystem.getStringLength(), selectedTuningSystem.getReferenceFrequency());

    if (cell.index < 0 || cell.index >= selectedIndices.length) return emptyDetails;
    const combinedIndex = selectedIndices[cell.index];
    if (combinedIndex < 0) return { ...emptyDetails, noteName: "none" };

    const baseLength = octaveOneNoteNames.length;
    let noteName = "none";

    if (combinedIndex < baseLength) {
      switch (cell.octave) {
        case 0:
          noteName = octaveZeroNoteNames[combinedIndex] || "none";
          break;
        case 1:
          noteName = octaveOneNoteNames[combinedIndex] || "none";
          break;
        case 2:
          noteName = octaveTwoNoteNames[combinedIndex] || "none";
          break;
        case 3:
          noteName = octaveThreeNoteNames[combinedIndex] || "none";
          break;
        default:
          noteName = "none";
      }
    } else {
      const localIndex = combinedIndex - baseLength;
      switch (cell.octave) {
        case 0:
          noteName = octaveOneNoteNames[localIndex] || "none";
          break;
        case 1:
          noteName = octaveTwoNoteNames[localIndex] || "none";
          break;
        case 2:
          noteName = octaveThreeNoteNames[localIndex] || "none";
          break;
        case 3:
          noteName = octaveFourNoteNames[localIndex] || "none";
          break;
        default:
          noteName = "none";
      }
    }

    return {
      noteName,
      fraction: conv ? conv.fraction : "-",
      cents: conv ? conv.cents : "-",
      ratios: conv ? conv.decimal : "-",
      stringLength: conv ? conv.stringLength : "-",
      originalValueType: pitchType,
    };
  };

  return (
    <AppContext.Provider
      value={{
        isPageLoading,
        tuningSystems,
        updateAllTuningSystems,
        selectedTuningSystem,
        setSelectedTuningSystem,
        playNoteFrequency,
        envelopeParams,
        setEnvelopeParams,
        selectedCells,
        setSelectedCells,
        selectedIndices,
        setSelectedIndices,
        getSelectedCellDetails,
        ajnas,
        setAjnas,
        updateAllAjnas,
        selectedJins,
        setSelectedJins,
        getNoteNamesUsedInTuningSystem,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}
