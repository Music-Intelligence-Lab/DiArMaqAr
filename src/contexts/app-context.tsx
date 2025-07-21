"use client";

import React, { createContext, useState, useEffect, useMemo, useContext, useCallback } from "react";
import TuningSystem from "@/models/TuningSystem";
import JinsTemplate, { Jins, AjnasModulations } from "@/models/Jins";
import NoteName, { TransliteratedNoteNameOctaveOne, TransliteratedNoteNameOctaveTwo, Cell } from "@/models/NoteName";
import { octaveOneNoteNames, octaveTwoNoteNames } from "@/models/NoteName";
import MaqamTemplate, { Maqam, MaqamatModulations } from "@/models/Maqam";
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
  ajnas: JinsTemplate[];
  setAjnas: React.Dispatch<React.SetStateAction<JinsTemplate[]>>;
  selectedJinsTemplate: JinsTemplate | null;
  setSelectedJinsTemplate: React.Dispatch<React.SetStateAction<JinsTemplate | null>>;
  handleClickJins: (jins: JinsTemplate) => void;
  selectedJins: Jins | null;
  setSelectedJins: React.Dispatch<React.SetStateAction<Jins | null>>;
  maqamat: MaqamTemplate[];
  setMaqamat: React.Dispatch<React.SetStateAction<MaqamTemplate[]>>;
  selectedMaqamTemplate: MaqamTemplate | null;
  setSelectedMaqamTemplate: React.Dispatch<React.SetStateAction<MaqamTemplate | null>>;
  handleClickMaqam: (maqam: MaqamTemplate) => void;
  selectedMaqam: Maqam | null;
  setSelectedMaqam: React.Dispatch<React.SetStateAction<Maqam | null>>;
  maqamSayrId: string;
  setMaqamSayrId: React.Dispatch<React.SetStateAction<string>>;
  centsTolerance: number;
  setCentsTolerance: React.Dispatch<React.SetStateAction<number>>;
  clearSelections: () => void;
  handleUrlParams: (params: { tuningSystemId?: string; jinsTemplateId?: string; maqamTemplateId?: string; sayrId?: string; firstNote?: string; maqamFirstNote?: string; jinsFirstNote?: string }) => void;
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

  const [ajnas, setAjnas] = useState<JinsTemplate[]>([]);
  const [selectedJinsTemplate, setSelectedJinsTemplate] = useState<JinsTemplate | null>(null);
  const [selectedJins, setSelectedJins] = useState<Jins | null>(null);

  const [maqamat, setMaqamat] = useState<MaqamTemplate[]>([]);
  const [selectedMaqamTemplate, setSelectedMaqamTemplate] = useState<MaqamTemplate | null>(null);
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
      if (selectedJinsTemplate) {
        if (selectedJinsTemplate.isJinsSelectable(usedNoteNames)) {
          let foundJins: Jins | null = null;

          if (selectedJins) {
            const jinsTranspositions = getJinsTranspositions(allThePitchClasses, selectedJinsTemplate, true, centsTolerance);
            foundJins = jinsTranspositions.find((j) => j.jinsPitchClasses[0].noteName === selectedJins.jinsPitchClasses[0].noteName) || null;
          }

          handleClickJins(selectedJinsTemplate, allThePitchClasses, foundJins);
        } else clearSelections();
      } else if (selectedMaqamTemplate) {
        if (selectedMaqamTemplate.isMaqamSelectable(usedNoteNames)) {
          let foundMaqam: Maqam | null = null;

          if (selectedMaqam) {
            const maqamTranspositions = getMaqamTranspositions(allThePitchClasses, ajnas, selectedMaqamTemplate, true, centsTolerance);
            foundMaqam = maqamTranspositions.find((m) => m.ascendingPitchClasses[0].noteName === selectedMaqam.ascendingPitchClasses[0].noteName) || null;
          }

          handleClickMaqam(selectedMaqamTemplate, allThePitchClasses, foundMaqam);
        } else clearSelections();
      }
    } else clearSelections();
  }, [selectedIndices]);

  const clearSelections = () => {
    setSelectedPitchClasses([]);
    setSelectedJinsTemplate(null);
    setSelectedMaqamTemplate(null);
    setMaqamSayrId("");
    setSelectedJins(null);
    setSelectedMaqam(null);
  };

  function mapIndices(notesToMap: NoteName[], givenNumberOfPitchClasses: number = 0, setOriginal: boolean = true) {
    const numberOfPitchClasses = givenNumberOfPitchClasses || tuningSystemPitchClassesArray.length || selectedTuningSystem?.getPitchClasses().length || 0;

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
    const numberOfPitchClasses = givenNumberOfPitchClasses || tuningSystemPitchClassesArray.length || selectedTuningSystem?.getPitchClasses().length || 0;

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

  const handleClickJins = (jinsTemplate: JinsTemplate, givenPitchClasses: PitchClass[] = [], jins: Jins | null = null) => {
    const usedCells = givenPitchClasses.length ? givenPitchClasses : allPitchClasses;

    setSelectedJinsTemplate(jinsTemplate);
    setSelectedMaqamTemplate(null);
    setMaqamSayrId("");
    setSelectedJins(jins);
    setSelectedMaqam(null);

    if (jins) {
      setSelectedPitchClasses(jins.jinsPitchClasses);
      return;
    }

    const jinsNoteNames = jinsTemplate.getNoteNames();

    const newSelectedCells: PitchClass[] = [];

    for (const pitchClass of usedCells) {
      if (jinsNoteNames.includes(pitchClass.noteName)) newSelectedCells.push(pitchClass);
    }

    setSelectedPitchClasses(newSelectedCells);
  };

  // Accepts either a MaqamTemplate object (legacy) or an object { maqamId, tonic }
  const handleClickMaqam = (maqamOrParams: MaqamTemplate | { maqamId: string; tonic: string }, givenPitchClasses: PitchClass[] = [], maqam: Maqam | null = null) => {
    // If called with { maqamId, tonic }, look up MaqamTemplate and perform transposition
    if (typeof maqamOrParams === "object" && "maqamId" in maqamOrParams && "tonic" in maqamOrParams) {
      const { maqamId, tonic } = maqamOrParams;
      const maqamTemplate = maqamat.find((m) => m.getId() === maqamId);
      if (!maqamTemplate) return;
      // Find the correct transposition for the tonic
      const maqamTranspositions = getMaqamTranspositions(allPitchClasses, ajnas, maqamTemplate, true, centsTolerance);
      const foundMaqam = maqamTranspositions.find((m) => m.ascendingPitchClasses[0].noteName === tonic);
      // Call the original logic with the looked-up MaqamTemplate and transposed Maqam
      handleClickMaqam(maqamTemplate, allPitchClasses, foundMaqam || null);
      return;
    }

    // Legacy: called with MaqamTemplate
    const maqamTemplate = maqamOrParams as MaqamTemplate;
    const usedCells = givenPitchClasses.length ? givenPitchClasses : allPitchClasses;

    setSelectedMaqamTemplate(maqamTemplate);
    setSelectedJinsTemplate(null);
    setSelectedJins(null);
    setMaqamSayrId("");
    setSelectedMaqam(maqam);

    if (maqam) {
      setSelectedPitchClasses(maqam.ascendingPitchClasses);
      return;
    }

    const maqamNoteNames = maqamTemplate.getAscendingNoteNames();

    const newSelectedCells: PitchClass[] = [];

    for (const pitchClass of usedCells) {
      if (maqamNoteNames.includes(pitchClass.noteName)) newSelectedCells.push(pitchClass);
    }

    setSelectedPitchClasses(newSelectedCells);
  };

  const getModulations = useCallback(
    (sourceMaqamTransposition: Maqam): MaqamatModulations | AjnasModulations => {
      return modulate(allPitchClasses, ajnas, maqamat, sourceMaqamTransposition, ajnasModulationsMode, centsTolerance);
    },
    [allPitchClasses, maqamat, ajnas, selectedTuningSystem, ajnasModulationsMode, getMaqamTranspositions]
  );

  const handleUrlParams = useCallback(
    ({
      tuningSystemId,
      jinsTemplateId,
      maqamTemplateId,
      sayrId,
      firstNote,
      maqamFirstNote,
      jinsFirstNote,
    }: {
      tuningSystemId?: string;
      jinsTemplateId?: string;
      maqamTemplateId?: string;
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

            if (jinsTemplateId) {
              const foundJinsTemplate = ajnas.find((j) => j.getId() === jinsTemplateId);
              if (foundJinsTemplate && foundJinsTemplate.isJinsSelectable(allPitchClasses.map((pc) => pc.noteName))) {
                const JinsTranspositions = getJinsTranspositions(allPitchClasses, foundJinsTemplate, true, 10);
                let foundJins: Jins | null = null;
                if (jinsFirstNote) {
                  foundJins = JinsTranspositions.find((j) => j.jinsPitchClasses[0].noteName === jinsFirstNote) || null;
                }

                handleClickJins(foundJinsTemplate, allPitchClasses, foundJins);
              }
            } else if (maqamTemplateId) {
              const foundMaqamTemplate = maqamat.find((m) => m.getId() === maqamTemplateId);
              if (foundMaqamTemplate && foundMaqamTemplate.isMaqamSelectable(allPitchClasses.map((pc) => pc.noteName))) {
                const maqamTranspositions = getMaqamTranspositions(allPitchClasses, ajnas, foundMaqamTemplate, true, 10);
                let foundMaqam: Maqam | null = null;
                if (maqamFirstNote) {
                  foundMaqam = maqamTranspositions.find((m) => m.ascendingPitchClasses[0].noteName === maqamFirstNote) || null;
                }

                handleClickMaqam(foundMaqamTemplate, allPitchClasses, foundMaqam);

                if (sayrId) {
                  setMaqamSayrId(sayrId);
                }
              }
            }
          }
        }
      }
    },
    [tuningSystems, ajnas, maqamat, selectedTuningSystem, setSelectedTuningSystem, handleStartNoteNameChange, getJinsTranspositions, handleClickJins, getMaqamTranspositions, handleClickMaqam]
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
        selectedJinsTemplate,
        setSelectedJinsTemplate,
        handleClickJins,
        selectedJins,
        setSelectedJins,
        maqamat,
        setMaqamat,
        selectedMaqamTemplate,
        setSelectedMaqamTemplate,
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
