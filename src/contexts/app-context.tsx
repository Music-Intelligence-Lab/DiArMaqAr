"use client";

import React, { createContext, useState, useEffect, useMemo, useContext, useCallback } from "react";
import TuningSystem from "@/models/TuningSystem";
import JinsData, { Jins, AjnasModulations } from "@/models/Jins";
import NoteName, { TransliteratedNoteNameOctaveOne, TransliteratedNoteNameOctaveTwo, Cell } from "@/models/NoteName";
import { octaveOneNoteNames, octaveTwoNoteNames } from "@/models/NoteName";
import MaqamData, { Maqam, MaqamatModulations } from "@/models/Maqam";
import { Source } from "@/models/bibliography/Source";
import Pattern from "@/models/Pattern";
import getFirstNoteName from "@/functions/getFirstNoteName";
import { getJinsTranspositions, getMaqamTranspositions } from "@/functions/transpose";
import PitchClass from "@/models/PitchClass";
import { getTuningSystems, getMaqamat, getAjnas, getSources, getPatterns } from "@/functions/import";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import modulate from "@/functions/modulate";

interface AppContextInterface {
  tuningSystems: TuningSystem[];
  setTuningSystems: React.Dispatch<React.SetStateAction<TuningSystem[]>>;
  selectedTuningSystem: TuningSystem | null;
  setSelectedTuningSystem: (tuningSystem: TuningSystem | null) => void;
  tuningSystemPitchClasses: string;
  setTuningSystemPitchClasses: React.Dispatch<React.SetStateAction<string>>;
  selectedAbjadNames: string[];
  setSelectedAbjadNames: React.Dispatch<React.SetStateAction<string[]>>;
  handleStartNoteNameChange: (startingNoteName: string, givenNoteNames?: NoteName[][], givenNumberOfPitchClasses?: number) => void;
  selectedPitchClasses: PitchClass[];
  setSelectedPitchClasses: React.Dispatch<React.SetStateAction<PitchClass[]>>;
  allPitchClasses: PitchClass[];
  selectedIndices: number[];
  setSelectedIndices: React.Dispatch<React.SetStateAction<number[]>>;
  originalIndices: number[];
  setOriginalIndices: React.Dispatch<React.SetStateAction<number[]>>;
  mapIndices: (notesToMap: NoteName[], givenNumberOfPitchClasses: number, setOriginal: boolean) => void;
  tuningSystemStringLength: number;
  setTuningSystemStringLength: React.Dispatch<React.SetStateAction<number>>;
  referenceFrequencies: { [noteName: string]: number };
  setReferenceFrequencies: React.Dispatch<React.SetStateAction<{ [noteName: string]: number }>>;
  originalReferenceFrequencies: { [noteName: string]: number };
  setOriginalReferenceFrequencies: React.Dispatch<React.SetStateAction<{ [noteName: string]: number }>>;
  ajnas: JinsData[];
  setAjnas: React.Dispatch<React.SetStateAction<JinsData[]>>;
  selectedJinsData: JinsData | null;
  setSelectedJinsData: React.Dispatch<React.SetStateAction<JinsData | null>>;
  handleClickJins: (jins: JinsData) => void;
  selectedJins: Jins | null;
  setSelectedJins: React.Dispatch<React.SetStateAction<Jins | null>>;
  maqamat: MaqamData[];
  setMaqamat: React.Dispatch<React.SetStateAction<MaqamData[]>>;
  selectedMaqamData: MaqamData | null;
  setSelectedMaqamData: React.Dispatch<React.SetStateAction<MaqamData | null>>;
  handleClickMaqam: (maqam: MaqamData) => void;
  selectedMaqam: Maqam | null;
  setSelectedMaqam: React.Dispatch<React.SetStateAction<Maqam | null>>;
  maqamSayrId: string;
  setMaqamSayrId: React.Dispatch<React.SetStateAction<string>>;
  centsTolerance: number;
  setCentsTolerance: React.Dispatch<React.SetStateAction<number>>;
  clearSelections: () => void;
  handleUrlParams: (params: { tuningSystemId?: string; jinsDataId?: string; maqamDataId?: string; sayrId?: string; firstNote?: string; maqamFirstNote?: string; jinsFirstNote?: string }) => void;
  sources: Source[];
  setSources: React.Dispatch<React.SetStateAction<Source[]>>;
  patterns: Pattern[];
  setPatterns: React.Dispatch<React.SetStateAction<Pattern[]>>;
  getModulations: (sourceMaqamTransposition: Maqam) => MaqamatModulations | AjnasModulations;
  ajnasModulationsMode: boolean;
  setAjnasModulationsMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextInterface | null>(null);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [tuningSystems, setTuningSystems] = useState<TuningSystem[]>([]);
  const [selectedTuningSystem, setSelectedTuningSystem] = useState<TuningSystem | null>(null);
  const [tuningSystemPitchClasses, setTuningSystemPitchClasses] = useState("");
  const [selectedAbjadNames, setSelectedAbjadNames] = useState<string[]>([]);

  const [centsTolerance, setCentsTolerance] = useState(5);

  const [selectedPitchClasses, setSelectedPitchClasses] = useState<PitchClass[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [originalIndices, setOriginalIndices] = useState<number[]>([]);

  const [tuningSystemStringLength, setTuningSystemStringLength] = useState(0);
  const [referenceFrequencies, setReferenceFrequencies] = useState<{
    [noteName: string]: number;
  }>({});
  const [originalReferenceFrequencies, setOriginalReferenceFrequencies] = useState<{
    [noteName: string]: number;
  }>({});

  const [ajnas, setAjnas] = useState<JinsData[]>([]);
  const [selectedJinsData, setSelectedJinsData] = useState<JinsData | null>(null);
  const [selectedJins, setSelectedJins] = useState<Jins | null>(null);

  const [maqamat, setMaqamat] = useState<MaqamData[]>([]);
  const [selectedMaqamData, setSelectedMaqamData] = useState<MaqamData | null>(null);
  const [selectedMaqam, setSelectedMaqam] = useState<Maqam | null>(null);
  const [maqamSayrId, setMaqamSayrId] = useState<string>("");

  const [patterns, setPatterns] = useState<Pattern[]>([]);

  const [sources, setSources] = useState<Source[]>([]);

  const [ajnasModulationsMode, setAjnasModulationsMode] = useState(false);

  const tuningSystemPitchClassesArray = useMemo(
    () =>
      tuningSystemPitchClasses
        .split("\n")
        .map((p) => p.trim())
        .filter((p) => p.length > 0),
    [tuningSystemPitchClasses]
  );

  const allPitchClasses = useMemo(() => {
    if (!selectedTuningSystem) return [];
    const miniCells: Cell[] = [];

    for (let octave = 0; octave < 4; octave++) {
      for (let index = 0; index < Math.max(selectedTuningSystem.getOriginalPitchClassValues().length, tuningSystemPitchClassesArray.length); index++) {
        miniCells.push({ octave, index });
      }
    }

    const firstNote = getFirstNoteName(selectedIndices);

    return getTuningSystemPitchClasses(selectedTuningSystem, firstNote, tuningSystemPitchClassesArray, tuningSystemStringLength, referenceFrequencies);
  }, [selectedTuningSystem, selectedIndices, referenceFrequencies, tuningSystemPitchClassesArray, tuningSystemStringLength]);

  useEffect(() => {
    setTuningSystems(getTuningSystems());
    setAjnas(getAjnas());
    setMaqamat(getMaqamat());
    setSources(getSources());
    setPatterns(getPatterns());
  }, []);

  useEffect(() => {
    if (selectedTuningSystem) {
      const allThePitchClasses = getTuningSystemPitchClasses(selectedTuningSystem, getFirstNoteName(selectedIndices));
      const usedNoteNames = allThePitchClasses.map((pitchClass) => pitchClass.noteName);
      if (!selectedTuningSystem.isSaved()) return;
      if (selectedJinsData) {
        if (selectedJinsData.isJinsSelectable(usedNoteNames)) {
          let foundJins: Jins | null = null;

          if (selectedJins) {
            const jinsTranspositions = getJinsTranspositions(allThePitchClasses, selectedJinsData, true, centsTolerance);
            foundJins = jinsTranspositions.find((j) => j.jinsPitchClasses[0].noteName === selectedJins.jinsPitchClasses[0].noteName) || null;
          }

          handleClickJins(selectedJinsData, allThePitchClasses, foundJins);
        } else clearSelections();
      } else if (selectedMaqamData) {
        if (selectedMaqamData.isMaqamSelectable(usedNoteNames)) {
          let foundMaqam: Maqam | null = null;

          if (selectedMaqam) {
            const maqamTranspositions = getMaqamTranspositions(allThePitchClasses, ajnas, selectedMaqamData, true, centsTolerance);
            foundMaqam = maqamTranspositions.find((m) => m.ascendingPitchClasses[0].noteName === selectedMaqam.ascendingPitchClasses[0].noteName) || null;
          }

          handleClickMaqam(selectedMaqamData, allThePitchClasses, foundMaqam);
        } else clearSelections();
      }
    } else clearSelections();
  }, [selectedIndices]);

  const clearSelections = useCallback(() => {
    setSelectedPitchClasses([]);
    setSelectedJinsData(null);
    setSelectedMaqamData(null);
    setMaqamSayrId("");
    setSelectedJins(null);
    setSelectedMaqam(null);
  }, []);

  const mapIndices = useCallback(
    function mapIndices(notesToMap: NoteName[], givenNumberOfPitchClasses: number = 0, setOriginal: boolean = true) {
      const numberOfPitchClasses = givenNumberOfPitchClasses || tuningSystemPitchClassesArray.length || selectedTuningSystem?.getOriginalPitchClassValues().length || 0;

      const O1_LEN = octaveOneNoteNames.length;
      const mappedIndices = notesToMap.map((arabicName) => {
        const i1 = octaveOneNoteNames.indexOf(arabicName as TransliteratedNoteNameOctaveOne);
        if (i1 >= 0) return i1;

        const i2 = octaveTwoNoteNames.indexOf(arabicName as TransliteratedNoteNameOctaveTwo);
        if (i2 >= 0) return O1_LEN + i2;

        return -1;
      });

      while (mappedIndices.length < numberOfPitchClasses) {
        mappedIndices.push(-1);
      }

      if (mappedIndices.length > numberOfPitchClasses) {
        mappedIndices.length = numberOfPitchClasses;
      }

      setSelectedIndices(mappedIndices);
      if (setOriginal) setOriginalIndices([...mappedIndices]);
      return mappedIndices;
    },
    [tuningSystemPitchClassesArray, selectedTuningSystem?.getId()]
  );

  const handleStartNoteNameChange = useCallback(
    (startingNoteName: string, givenNoteNames: NoteName[][] = [], givenNumberOfPitchClasses: number = 0) => {
      const noteNamesToSearch = givenNoteNames.length ? givenNoteNames : selectedTuningSystem?.getNoteNameSets() || [[]];
      const numberOfPitchClasses = givenNumberOfPitchClasses || tuningSystemPitchClassesArray.length || selectedTuningSystem?.getOriginalPitchClassValues().length || 0;

      if (startingNoteName === "" && noteNamesToSearch.length > 0) {
        for (const setOfNotes of noteNamesToSearch) {
          if (setOfNotes[0] === "ʿushayrān") {
            return mapIndices(setOfNotes, givenNumberOfPitchClasses);
          }
        }

        for (const setOfNotes of noteNamesToSearch) {
          if (setOfNotes[0] === "yegāh") {
            return mapIndices(setOfNotes, givenNumberOfPitchClasses);
          }
        }

        return mapIndices(noteNamesToSearch[0], givenNumberOfPitchClasses);
      } else {
        for (const setOfNotes of noteNamesToSearch) {
          if (setOfNotes[0] === startingNoteName) {
            return mapIndices(setOfNotes, givenNumberOfPitchClasses);
          }
        }
      }

      // If no config found, fallback:
      setSelectedIndices(Array(numberOfPitchClasses).fill(-1));
      return [];
    },
    [mapIndices, selectedTuningSystem, tuningSystemPitchClassesArray]
  );

  const handleClickJins = useCallback(
    (jinsData: JinsData, givenPitchClasses: PitchClass[] = [], jins: Jins | null = null) => {
      const usedCells = givenPitchClasses.length ? givenPitchClasses : allPitchClasses;

      setSelectedJinsData(jinsData);
      setSelectedMaqamData(null);
      if (maqamSayrId) setMaqamSayrId("");
      setSelectedJins(jins);
      setSelectedMaqam(null);

      if (jins) {
        setSelectedPitchClasses(jins.jinsPitchClasses);
        return;
      }

      const jinsNoteNames = jinsData.getNoteNames();

      const newSelectedCells: PitchClass[] = [];

      for (const pitchClass of usedCells) {
        if (jinsNoteNames.includes(pitchClass.noteName)) newSelectedCells.push(pitchClass);
      }

      setSelectedPitchClasses(newSelectedCells);
    },
    [allPitchClasses]
  );

  // Accepts either a MaqamData object (legacy) or an object { maqamId, tonic }
  const handleClickMaqam = useCallback(
    (maqamOrParams: MaqamData | { maqamId: string; tonic: string }, givenPitchClasses: PitchClass[] = [], maqam: Maqam | null = null) => {
      // If called with { maqamId, tonic }, look up MaqamData and perform transposition
      if (typeof maqamOrParams === "object" && "maqamId" in maqamOrParams && "tonic" in maqamOrParams) {
        const { maqamId, tonic } = maqamOrParams;
        const maqamData = maqamat.find((m) => m.getId() === maqamId);
        if (!maqamData) return;
        // Find the correct transposition for the tonic
        const maqamTranspositions = getMaqamTranspositions(allPitchClasses, ajnas, maqamData, true, centsTolerance);
        const foundMaqam = maqamTranspositions.find((m) => m.ascendingPitchClasses[0].noteName === tonic);
        // Call the original logic with the looked-up MaqamData and transposed Maqam
        handleClickMaqam(maqamData, allPitchClasses, foundMaqam || null);
        return;
      }

      // Legacy: called with MaqamData
      const maqamData = maqamOrParams as MaqamData;
      const usedCells = givenPitchClasses.length ? givenPitchClasses : allPitchClasses;

      setSelectedMaqamData(maqamData);
      setSelectedJinsData(null);
      setSelectedJins(null);

      if (maqamSayrId) {
        let found = false;
        for (const sayrId of maqamData.getSuyūr().map((sayr) => sayr.id)) {
          if (sayrId === maqamSayrId) {
            found = true;
            break;
          }
        }

        if (!found) setMaqamSayrId("");
      }

      setSelectedMaqam(maqam);

      if (maqam) {
        setSelectedPitchClasses(maqam.ascendingPitchClasses);
        return;
      }

      const maqamNoteNames = maqamData.getAscendingNoteNames();

      const newSelectedCells: PitchClass[] = [];

      for (const pitchClass of usedCells) {
        if (maqamNoteNames.includes(pitchClass.noteName)) newSelectedCells.push(pitchClass);
      }

      setSelectedPitchClasses(newSelectedCells);
    },
    [ajnas, allPitchClasses, centsTolerance, maqamat]
  );

  const getModulations = useCallback(
    (sourceMaqamTransposition: Maqam): MaqamatModulations | AjnasModulations => modulate(allPitchClasses, ajnas, maqamat, sourceMaqamTransposition, ajnasModulationsMode, centsTolerance),
    [allPitchClasses, ajnas, maqamat, ajnasModulationsMode, centsTolerance]
  );

  const handleUrlParams = useCallback(
    ({
      tuningSystemId,
      jinsDataId,
      maqamDataId,
      sayrId,
      firstNote,
      maqamFirstNote,
      jinsFirstNote,
    }: {
      tuningSystemId?: string;
      jinsDataId?: string;
      maqamDataId?: string;
      sayrId?: string;
      firstNote?: string;
      maqamFirstNote?: string;
      jinsFirstNote?: string;
    }) => {
      if (!tuningSystems.length || !ajnas.length || !maqamat.length) return;

      if (tuningSystemId) {
        if (!selectedTuningSystem || selectedTuningSystem.getId() !== tuningSystemId) {
          const found = tuningSystems.find((ts) => ts.getId() === tuningSystemId);

          if (found) {
            setSelectedTuningSystem(found);
            handleStartNoteNameChange(firstNote ?? "", found.getNoteNameSets(), found.getOriginalPitchClassValues().length);
            const allPitchClasses = getTuningSystemPitchClasses(found, firstNote || "");

            if (jinsDataId) {
              const foundJinsData = ajnas.find((j) => j.getId() === jinsDataId);
              if (foundJinsData && foundJinsData.isJinsSelectable(allPitchClasses.map((pc) => pc.noteName))) {
                const JinsTranspositions = getJinsTranspositions(allPitchClasses, foundJinsData, true, 10);
                let foundJins: Jins | null = null;
                if (jinsFirstNote) {
                  foundJins = JinsTranspositions.find((j) => j.jinsPitchClasses[0].noteName === jinsFirstNote) || null;
                }

                handleClickJins(foundJinsData, allPitchClasses, foundJins);
              }
            } else if (maqamDataId) {
              const foundMaqamData = maqamat.find((m) => m.getId() === maqamDataId);
              if (foundMaqamData && foundMaqamData.isMaqamSelectable(allPitchClasses.map((pc) => pc.noteName))) {
                const maqamTranspositions = getMaqamTranspositions(allPitchClasses, ajnas, foundMaqamData, true, 10);
                let foundMaqam: Maqam | null = null;
                if (maqamFirstNote) {
                  foundMaqam = maqamTranspositions.find((m) => m.ascendingPitchClasses[0].noteName === maqamFirstNote) || null;
                }

                handleClickMaqam(foundMaqamData, allPitchClasses, foundMaqam);
                if (sayrId) {
                  setMaqamSayrId(sayrId);
                }
              }
            }
          }
        }
      }
    },
    [tuningSystems, ajnas, maqamat, selectedTuningSystem, handleStartNoteNameChange, handleClickJins, handleClickMaqam]
  );

  // Memoize context value to avoid re-renders of all consumers when no referenced pieces change
  const contextValue = useMemo(
    () => ({
      tuningSystems,
      setTuningSystems,
      selectedTuningSystem,
      setSelectedTuningSystem,
      tuningSystemPitchClasses,
      setTuningSystemPitchClasses,
      selectedAbjadNames,
      setSelectedAbjadNames,
      handleStartNoteNameChange,
      selectedPitchClasses,
      setSelectedPitchClasses,
      allPitchClasses,
      selectedIndices,
      setSelectedIndices,
      originalIndices,
      setOriginalIndices,
      mapIndices,
      tuningSystemStringLength,
      setTuningSystemStringLength,
      referenceFrequencies,
      setReferenceFrequencies,
      originalReferenceFrequencies,
      setOriginalReferenceFrequencies,
      ajnas,
      setAjnas,
      selectedJinsData,
      setSelectedJinsData,
      handleClickJins,
      selectedJins,
      setSelectedJins,
      maqamat,
      setMaqamat,
      selectedMaqamData,
      setSelectedMaqamData,
      handleClickMaqam,
      selectedMaqam,
      setSelectedMaqam,
      maqamSayrId,
      setMaqamSayrId,
      centsTolerance,
      setCentsTolerance,
      clearSelections,
      handleUrlParams,
      sources,
      setSources,
      patterns,
      setPatterns,
      getModulations,
      ajnasModulationsMode,
      setAjnasModulationsMode,
    }),
    [
      tuningSystems,
      selectedTuningSystem,
      tuningSystemPitchClasses,
      selectedAbjadNames,
      handleStartNoteNameChange,
      selectedPitchClasses,
      allPitchClasses,
      selectedIndices,
      originalIndices,
      mapIndices,
      tuningSystemStringLength,
      referenceFrequencies,
      originalReferenceFrequencies,
      ajnas,
      selectedJinsData,
      handleClickJins,
      selectedJins,
      maqamat,
      selectedMaqamData,
      handleClickMaqam,
      selectedMaqam,
      maqamSayrId,
      centsTolerance,
      clearSelections,
      handleUrlParams,
      sources,
      patterns,
      getModulations,
      ajnasModulationsMode,
    ]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export default function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}
