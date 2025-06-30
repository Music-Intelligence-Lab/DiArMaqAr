"use client";

import React, { createContext, useState, useEffect, useMemo, useContext, useCallback } from "react";
import TuningSystem from "@/models/TuningSystem";
import JinsDetails, { Jins } from "@/models/Jins";
import NoteName, { TransliteratedNoteNameOctaveOne, TransliteratedNoteNameOctaveTwo, Cell } from "@/models/NoteName";
import { octaveOneNoteNames, octaveTwoNoteNames } from "@/models/NoteName";
import MaqamDetails, { Maqam, MaqamModulations } from "@/models/Maqam";
import { Source } from "@/models/bibliography/Source";
import Pattern from "@/models/Pattern";
import getFirstNoteName from "@/functions/getFirstNoteName";
import { getJinsTranspositions, getMaqamTranspositions } from "@/functions/transpose";
import PitchClass from "@/models/PitchClass";
import { getTuningSystems, getMaqamat, getAjnas, getSources, getPatterns } from "@/functions/import";
import getTuningSystemCells from "@/functions/getTuningSystemCells";
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
  ajnas: JinsDetails[];
  setAjnas: React.Dispatch<React.SetStateAction<JinsDetails[]>>;
  selectedJinsDetails: JinsDetails | null;
  setSelectedJinsDetails: React.Dispatch<React.SetStateAction<JinsDetails | null>>;
  handleClickJins: (jins: JinsDetails) => void;
  selectedJins: Jins | null;
  setSelectedJins: React.Dispatch<React.SetStateAction<Jins | null>>;
  maqamat: MaqamDetails[];
  setMaqamat: React.Dispatch<React.SetStateAction<MaqamDetails[]>>;
  selectedMaqamDetails: MaqamDetails | null;
  setSelectedMaqamDetails: React.Dispatch<React.SetStateAction<MaqamDetails | null>>;
  handleClickMaqam: (maqam: MaqamDetails) => void;
  selectedMaqam: Maqam | null;
  setSelectedMaqam: React.Dispatch<React.SetStateAction<Maqam | null>>;
  maqamSayrId: string;
  setMaqamSayrId: React.Dispatch<React.SetStateAction<string>>;
  centsTolerance: number;
  setCentsTolerance: React.Dispatch<React.SetStateAction<number>>;
  clearSelections: () => void;
  handleUrlParams: (params: {
    tuningSystemId?: string;
    jinsDetailsId?: string;
    maqamDetailsId?: string;
    sayrId?: string;
    firstNote?: string;
    maqamFirstNote?: string;
    jinsFirstNote?: string;
  }) => void;
  sources: Source[];
  setSources: React.Dispatch<React.SetStateAction<Source[]>>;
  patterns: Pattern[];
  setPatterns: React.Dispatch<React.SetStateAction<Pattern[]>>;
  getModulations: (sourceMaqamTransposition: Maqam) => MaqamModulations;
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

  const [ajnas, setAjnas] = useState<JinsDetails[]>([]);
  const [selectedJinsDetails, setSelectedJinsDetails] = useState<JinsDetails | null>(null);
  const [selectedJins, setSelectedJins] = useState<Jins | null>(null);

  const [maqamat, setMaqamat] = useState<MaqamDetails[]>([]);
  const [selectedMaqamDetails, setSelectedMaqamDetails] = useState<MaqamDetails | null>(null);
  const [selectedMaqam, setSelectedMaqam] = useState<Maqam | null>(null);
  const [maqamSayrId, setMaqamSayrId] = useState<string>("");

  const [patterns, setPatterns] = useState<Pattern[]>([]);

  const [sources, setSources] = useState<Source[]>([]);

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
      for (let index = 0; index < Math.max(selectedTuningSystem.getPitchClasses().length, tuningSystemPitchClassesArray.length); index++) {
        miniCells.push({ octave, index });
      }
    }

    const firstNote = getFirstNoteName(selectedIndices);

    return getTuningSystemCells(selectedTuningSystem, firstNote, tuningSystemPitchClassesArray, tuningSystemStringLength, referenceFrequencies);
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
      const allThePitchClasses = getTuningSystemCells(selectedTuningSystem, getFirstNoteName(selectedIndices));
      const usedNoteNames = allThePitchClasses.map((pitchClass) => pitchClass.noteName);
      if (!selectedTuningSystem.isSaved()) return;
      if (selectedJinsDetails) {
        if (selectedJinsDetails.isJinsSelectable(usedNoteNames)) {
          let foundJins: Jins | null = null;

          if (selectedJins) {
            const jinsTranspositions = getJinsTranspositions(allThePitchClasses, selectedJinsDetails, true, centsTolerance);
            foundJins = jinsTranspositions.find((j) => j.jinsPitchClasses[0].noteName === selectedJins.jinsPitchClasses[0].noteName) || null;
          }

          handleClickJins(selectedJinsDetails, allThePitchClasses, foundJins);
        } else clearSelections();
      } else if (selectedMaqamDetails) {
        if (selectedMaqamDetails.isMaqamSelectable(usedNoteNames)) {
          let foundMaqam: Maqam | null = null;

          if (selectedMaqam) {
            const maqamTranspositions = getMaqamTranspositions(allThePitchClasses, ajnas, selectedMaqamDetails, true, centsTolerance);
            foundMaqam =
              maqamTranspositions.find((m) => m.ascendingPitchClasses[0].noteName === selectedMaqam.ascendingPitchClasses[0].noteName) || null;
          }

          handleClickMaqam(selectedMaqamDetails, allThePitchClasses, foundMaqam);
        } else clearSelections();
      }
    } else clearSelections();
  }, [selectedIndices]);

  const clearSelections = () => {
    setSelectedPitchClasses([]);
    setSelectedJinsDetails(null);
    setSelectedMaqamDetails(null);
    setMaqamSayrId("");
    setSelectedJins(null);
    setSelectedMaqam(null);
  };

  function mapIndices(notesToMap: NoteName[], givenNumberOfPitchClasses: number = 0, setOriginal: boolean = true) {
    const numberOfPitchClasses =
      givenNumberOfPitchClasses || tuningSystemPitchClassesArray.length || selectedTuningSystem?.getPitchClasses().length || 0;

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
  }

  const handleStartNoteNameChange = (startingNoteName: string, givenNoteNames: NoteName[][] = [], givenNumberOfPitchClasses: number = 0) => {
    const noteNamesToSearch = givenNoteNames.length ? givenNoteNames : selectedTuningSystem?.getNoteNames() || [[]];
    const numberOfPitchClasses =
      givenNumberOfPitchClasses || tuningSystemPitchClassesArray.length || selectedTuningSystem?.getPitchClasses().length || 0;

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
  };

  const handleClickJins = (jinsDetails: JinsDetails, givenPitchClasses: PitchClass[] = [], jins: Jins | null = null) => {
    const usedCells = givenPitchClasses.length ? givenPitchClasses : allPitchClasses;

    setSelectedJinsDetails(jinsDetails);
    setSelectedMaqamDetails(null);
    setMaqamSayrId("");
    setSelectedJins(jins);
    setSelectedMaqam(null);

    if (jins) {
      setSelectedPitchClasses(jins.jinsPitchClasses);
      return;
    }

    const jinsNoteNames = jinsDetails.getNoteNames();

    const newSelectedCells: PitchClass[] = [];

    for (const pitchClass of usedCells) {
      if (jinsNoteNames.includes(pitchClass.noteName)) newSelectedCells.push(pitchClass);
    }

    setSelectedPitchClasses(newSelectedCells);
  };

  const handleClickMaqam = (maqamDetails: MaqamDetails, givenPitchClasses: PitchClass[] = [], maqam: Maqam | null = null) => {
    const usedCells = givenPitchClasses.length ? givenPitchClasses : allPitchClasses;

    setSelectedMaqamDetails(maqamDetails);
    setSelectedJinsDetails(null);
    setSelectedJins(null);
    setMaqamSayrId("");
    setSelectedMaqam(maqam);

    if (maqam) {
      setSelectedPitchClasses(maqam.ascendingPitchClasses);
      return;
    }

    const maqamNoteNames = maqamDetails.getAscendingNoteNames();

    const newSelectedCells: PitchClass[] = [];

    for (const pitchClass of usedCells) {
      if (maqamNoteNames.includes(pitchClass.noteName)) newSelectedCells.push(pitchClass);
    }

    setSelectedPitchClasses(newSelectedCells);
  };

  const getModulations = useCallback(
    (sourceMaqamTransposition: Maqam): MaqamModulations => {
      return modulate(allPitchClasses, ajnas, maqamat, sourceMaqamTransposition, centsTolerance);
    },
    [allPitchClasses, maqamat, ajnas, selectedTuningSystem, getMaqamTranspositions]
  );

  const handleUrlParams = useCallback(
    ({
      tuningSystemId,
      jinsDetailsId,
      maqamDetailsId,
      sayrId,
      firstNote,
      maqamFirstNote,
      jinsFirstNote,
    }: {
      tuningSystemId?: string;
      jinsDetailsId?: string;
      maqamDetailsId?: string;
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
            handleStartNoteNameChange(firstNote ?? "", found.getNoteNames(), found.getPitchClasses().length);
            const allPitchClasses = getTuningSystemCells(found, firstNote || "");

            if (jinsDetailsId) {
              const foundJinsDetails = ajnas.find((j) => j.getId() === jinsDetailsId);
              if (foundJinsDetails && foundJinsDetails.isJinsSelectable(allPitchClasses.map((pc) => pc.noteName))) {
                const JinsTranspositions = getJinsTranspositions(allPitchClasses, foundJinsDetails, true, 10);
                let foundJins: Jins | null = null;
                if (jinsFirstNote) {
                  foundJins = JinsTranspositions.find((j) => j.jinsPitchClasses[0].noteName === jinsFirstNote) || null;
                }

                handleClickJins(foundJinsDetails, allPitchClasses, foundJins);
              }
            } else if (maqamDetailsId) {
              const foundMaqamDetails = maqamat.find((m) => m.getId() === maqamDetailsId);
              if (foundMaqamDetails && foundMaqamDetails.isMaqamSelectable(allPitchClasses.map((pc) => pc.noteName))) {
                const maqamTranspositions = getMaqamTranspositions(allPitchClasses, ajnas, foundMaqamDetails, true, 10);
                let foundMaqam: Maqam | null = null;
                if (maqamFirstNote) {
                  foundMaqam = maqamTranspositions.find((m) => m.ascendingPitchClasses[0].noteName === maqamFirstNote) || null;
                }

                handleClickMaqam(foundMaqamDetails, allPitchClasses, foundMaqam);

                if (sayrId) {
                  setMaqamSayrId(sayrId);
                }
              }
            }
          }
        }
      }
    },
    [
      tuningSystems,
      ajnas,
      maqamat,
      selectedTuningSystem,
      setSelectedTuningSystem,
      handleStartNoteNameChange,
      getJinsTranspositions,
      handleClickJins,
      getMaqamTranspositions,
      handleClickMaqam,
    ]
  );

  return (
    <AppContext.Provider
      value={{
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
        ajnas,
        setAjnas,
        selectedJinsDetails,
        setSelectedJinsDetails,
        handleClickJins,
        selectedJins,
        setSelectedJins,
        maqamat,
        setMaqamat,
        selectedMaqamDetails,
        setSelectedMaqamDetails,
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export default function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}
