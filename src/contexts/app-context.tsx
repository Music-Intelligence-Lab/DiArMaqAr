"use client";

import React, { createContext, useState, useEffect, useMemo, useContext, useCallback } from "react";
import TuningSystem from "@/models/TuningSystem";
import JinsDetails, { Jins } from "@/models/Jins";
import NoteName, { TransliteratedNoteNameOctaveOne, TransliteratedNoteNameOctaveTwo } from "@/models/NoteName";
import { octaveOneNoteNames, octaveTwoNoteNames } from "@/models/NoteName";
import MaqamDetails, { Maqam, MaqamModulations } from "@/models/Maqam";
import { Source } from "@/models/bibliography/Source";
import Pattern from "@/models/Pattern";
import getFirstNoteName from "@/functions/getFirstNoteName";
import { getMaqamTranspositions } from "@/functions/transpose";
import shawwaMapping from "@/functions/shawwaMapping";
import PitchClass from "@/models/PitchClass";
import { getTuningSystems, getMaqamat, getAjnas, getSources, getPatterns } from "@/functions/import";
import getTuningSystemCells from "@/functions/getTuningSystemCells";

interface MiniCell {
  octave: number;
  index: number;
}

interface AppContextInterface {
  tuningSystems: TuningSystem[];
  setTuningSystems: React.Dispatch<React.SetStateAction<TuningSystem[]>>;
  selectedTuningSystem: TuningSystem | null;
  setSelectedTuningSystem: (tuningSystem: TuningSystem | null) => void;
  tuningSystemPitchClasses: string;
  setTuningSystemPitchClasses: React.Dispatch<React.SetStateAction<string>>;
  handleStartNoteNameChange: (startingNoteName: string, givenNoteNames?: NoteName[][], givenNumberOfPitchClasses?: number) => void;
  selectedPitchClasses: PitchClass[];
  setSelectedPitchClasses: React.Dispatch<React.SetStateAction<PitchClass[]>>;
  allPitchClasses: PitchClass[];
  selectedIndices: number[];
  setSelectedIndices: React.Dispatch<React.SetStateAction<number[]>>;
  originalIndices: number[];
  setOriginalIndices: React.Dispatch<React.SetStateAction<number[]>>;
  mapIndices: (notesToMap: NoteName[], givenNumberOfPitchClasses: number, setOriginal: boolean) => void;
  initialMappingDone: boolean;
  referenceFrequencies: { [noteName: string]: number };
  setReferenceFrequencies: React.Dispatch<React.SetStateAction<{ [noteName: string]: number }>>;
  ajnas: JinsDetails[];
  setAjnas: React.Dispatch<React.SetStateAction<JinsDetails[]>>;
  selectedJins: JinsDetails | null;
  setSelectedJins: React.Dispatch<React.SetStateAction<JinsDetails | null>>;
  checkIfJinsIsSelectable: (jins: JinsDetails) => boolean;
  handleClickJins: (jins: JinsDetails) => void;
  selectedJinsTransposition: Jins | null;
  setSelectedJinsTransposition: React.Dispatch<React.SetStateAction<Jins | null>>;
  maqamat: MaqamDetails[];
  setMaqamat: React.Dispatch<React.SetStateAction<MaqamDetails[]>>;
  selectedMaqam: MaqamDetails | null;
  setSelectedMaqam: React.Dispatch<React.SetStateAction<MaqamDetails | null>>;
  checkIfMaqamIsSelectable: (maqam: MaqamDetails) => boolean;
  handleClickMaqam: (maqam: MaqamDetails) => void;
  selectedMaqamTransposition: Maqam | null;
  setSelectedMaqamTransposition: React.Dispatch<React.SetStateAction<Maqam | null>>;
  maqamSayrId: string;
  setMaqamSayrId: React.Dispatch<React.SetStateAction<string>>;
  centsTolerance: number;
  setCentsTolerance: React.Dispatch<React.SetStateAction<number>>;
  clearSelections: () => void;
  handleUrlParams: (params: { tuningSystemId?: string; jinsId?: string; maqamId?: string; sayrId?: string; firstNote?: string }) => void;
  sources: Source[];
  setSources: React.Dispatch<React.SetStateAction<Source[]>>;
  patterns: Pattern[];
  setPatterns: React.Dispatch<React.SetStateAction<Pattern[]>>;
  getModulations: (maqamTransposition: Maqam) => MaqamModulations;
}

const AppContext = createContext<AppContextInterface | null>(null);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [tuningSystems, setTuningSystems] = useState<TuningSystem[]>([]);
  const [selectedTuningSystem, setSelectedTuningSystem] = useState<TuningSystem | null>(null);
  const [tuningSystemPitchClasses, setTuningSystemPitchClasses] = useState("");

  const [centsTolerance, setCentsTolerance] = useState(5);

  const [selectedPitchClasses, setSelectedPitchClasses] = useState<PitchClass[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [originalIndices, setOriginalIndices] = useState<number[]>([]);
  const [initialMappingDone, setInitialMappingDone] = useState(false);

  const [referenceFrequencies, setReferenceFrequencies] = useState<{
    [noteName: string]: number;
  }>({});

  const [ajnas, setAjnas] = useState<JinsDetails[]>([]);
  const [selectedJins, setSelectedJins] = useState<JinsDetails | null>(null);
  const [selectedJinsTransposition, setSelectedJinsTransposition] = useState<Jins | null>(null);

  const [maqamat, setMaqamat] = useState<MaqamDetails[]>([]);
  const [selectedMaqam, setSelectedMaqam] = useState<MaqamDetails | null>(null);
  const [selectedMaqamTransposition, setSelectedMaqamTransposition] = useState<Maqam | null>(null);
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

  useEffect(() => {
    setTuningSystems(getTuningSystems());
    setAjnas(getAjnas());
    setMaqamat(getMaqamat());
    setSources(getSources());
    setPatterns(getPatterns());
    setInitialMappingDone(true);
  }, []);

  useEffect(() => {
    if (!selectedTuningSystem) return;

    if (selectedJins) {
      if (checkIfJinsIsSelectable(selectedJins)) {
        handleClickJins(selectedJins);
      } else {
        setSelectedJins(null);
      }
    }

    if (selectedMaqam) {
      if (checkIfMaqamIsSelectable(selectedMaqam)) {
        handleClickMaqam(selectedMaqam);
      } else {
        setSelectedMaqam(null);
      }
    }
  }, [selectedIndices]);

  useEffect(() => {
    if (selectedTuningSystem) {
      if (!selectedTuningSystem.isSaved()) return;
      if (selectedJins) {
        if (checkIfJinsIsSelectable(selectedJins)) handleClickJins(selectedJins);
        else clearSelections();
      } else if (selectedMaqam) {
        if (checkIfMaqamIsSelectable(selectedMaqam)) handleClickMaqam(selectedMaqam);
        else clearSelections();
      }
    } else clearSelections();
  }, [selectedTuningSystem]);

  const allPitchClasses = useMemo(() => {
    if (!selectedTuningSystem) return [];
    const miniCells: MiniCell[] = [];

    for (let octave = 0; octave < 4; octave++) {
      for (let index = 0; index < tuningSystemPitchClassesArray.length; index++) {
        miniCells.push({ octave, index });
      }
    }

    const firstNote = getFirstNoteName(selectedIndices);

    return getTuningSystemCells(selectedTuningSystem, firstNote, tuningSystemPitchClassesArray, referenceFrequencies);
  }, [selectedTuningSystem, selectedIndices, referenceFrequencies, tuningSystemPitchClasses, tuningSystemPitchClassesArray]);

  const clearSelections = () => {
    setSelectedPitchClasses([]);
    setSelectedJins(null);
    setSelectedMaqam(null);
    setMaqamSayrId("");
    setSelectedJinsTransposition(null);
    setSelectedMaqamTransposition(null);
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

  const handleStartNoteNameChange = (
    startingNoteName: string,
    givenNoteNames: NoteName[][] = [],
    givenNumberOfPitchClasses: number = 0
  ) => {
    const noteNamesToSearch = givenNoteNames.length ? givenNoteNames : selectedTuningSystem?.getSetsOfNoteNames() || [[]];
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

  const checkIfJinsIsSelectable = (jins: JinsDetails, givenCells: PitchClass[] = []) => {
    const usedNoteNames = givenCells.length ? givenCells.map((pitchClass) => pitchClass.noteName) : allPitchClasses.map((pitchClass) => pitchClass.noteName);
    return jins.getNoteNames().every((noteName) => usedNoteNames.includes(noteName));
  };

  const handleClickJins = (jins: JinsDetails, givenCells: PitchClass[] = []) => {
    const usedCells = givenCells.length ? givenCells : allPitchClasses;

    setSelectedJins(jins);
    setSelectedMaqam(null);
    setMaqamSayrId("");

    const jinsNoteNames = jins.getNoteNames();

    const newSelectedCells: PitchClass[] = [];

    for (const pitchClass of usedCells) {
      if (jinsNoteNames.includes(pitchClass.noteName)) newSelectedCells.push(pitchClass);
    }

    setSelectedPitchClasses(newSelectedCells);
  };

  const checkIfMaqamIsSelectable = (maqam: MaqamDetails, givenCells: PitchClass[] = []) => {
    const usedNoteNames = givenCells.length ? givenCells.map((pitchClass) => pitchClass.noteName) : allPitchClasses.map((pitchClass) => pitchClass.noteName);

    return (
      maqam.getAscendingNoteNames().every((noteName) => usedNoteNames.includes(noteName)) &&
      maqam.getDescendingNoteNames().every((noteName) => usedNoteNames.includes(noteName))
    );
  };

  const handleClickMaqam = (maqam: MaqamDetails, given: PitchClass[] = []) => {
    const usedCells = given.length ? given : allPitchClasses;

    setSelectedMaqam(maqam);
    setSelectedJins(null);
    setMaqamSayrId("");
    setSelectedMaqamTransposition(null);

    const maqamNoteNames = maqam.getAscendingNoteNames();

    const newSelectedCells: PitchClass[] = [];

    for (const pitchClass of usedCells) {
      if (maqamNoteNames.includes(pitchClass.noteName)) newSelectedCells.push(pitchClass);
    }

    setSelectedPitchClasses(newSelectedCells);
  };

  const getModulations = useCallback(
    (sourceMaqamTransposition: Maqam): MaqamModulations => {
      const hopsFromOne: Maqam[] = [];
      const hopsFromThree: Maqam[] = [];
      const hopsFromThree2p: Maqam[] = [];
      const hopsFromFour: Maqam[] = [];
      const hopsFromFive: Maqam[] = [];
      const hopsFromSix: Maqam[] = [];

      const sourceAscendingNotes = sourceMaqamTransposition.ascendingPitchClasses.map((pitchClass) => pitchClass.noteName);

      let check2p = false;
      let checkSixth = false;

      const shawwaList = [...octaveOneNoteNames, ...octaveTwoNoteNames].filter((noteName) => shawwaMapping(noteName) !== "/");

      const firstDegreeNoteName = sourceAscendingNotes[0];
      const firstDegreeShawwaIndex = shawwaList.findIndex((noteName) => noteName === firstDegreeNoteName);

      const secondDegreeNoteName = sourceAscendingNotes[1];
      const secondDegreeShawwaIndex = shawwaList.findIndex((noteName) => noteName === secondDegreeNoteName);

      const thirdDegreeNoteName = sourceAscendingNotes[2];
      const thirdDegreeCellSIndex = allPitchClasses.findIndex((cd) => cd.noteName === thirdDegreeNoteName);

      let noteName2p = "";

      const numberOfPitchClasses = selectedTuningSystem?.getPitchClasses().length || 0;

      const slice = allPitchClasses.slice(numberOfPitchClasses, thirdDegreeCellSIndex + 1).reverse();

      for (const pitchClasses of slice) {
        if (shawwaMapping(pitchClasses.noteName) === "2p") {
          noteName2p = pitchClasses.noteName;
          const first2pBeforeShawwaIndex = shawwaList.findIndex((noteName) => noteName === noteName2p);

          if (first2pBeforeShawwaIndex - firstDegreeShawwaIndex === 6 && first2pBeforeShawwaIndex - secondDegreeShawwaIndex === 2) check2p = true;
          break;
        }
      }

      const sixthDegreeNoteName = sourceAscendingNotes[5];
      const sixthDegreeCellSIndex = shawwaList.findIndex((noteName) => noteName === sixthDegreeNoteName);

      if (
        (sixthDegreeCellSIndex - firstDegreeShawwaIndex === 16 || sixthDegreeCellSIndex - firstDegreeShawwaIndex === 17) &&
        shawwaMapping(sixthDegreeNoteName) === "n"
      )
        checkSixth = true;

      for (const maqam of maqamat) {
        if (!checkIfMaqamIsSelectable(maqam)) continue;

        const currentAscendingNotes = maqam.getAscendingNoteNames();

        const transpositions: Maqam[] =
          JSON.stringify(currentAscendingNotes) !== JSON.stringify(sourceAscendingNotes) ? [maqam.getTahlil(allPitchClasses)] : [];

        getMaqamTranspositions(allPitchClasses, ajnas, maqam, true, centsTolerance).forEach((maqamTransposition) => {
          if (JSON.stringify(currentAscendingNotes) === JSON.stringify(maqamTransposition.ascendingPitchClasses.map((pitchClass) => pitchClass.noteName))) return;
          transpositions.push(maqamTransposition);
        });

        for (const transposition of transpositions) {
          const currentAscendingNotes = transposition.ascendingPitchClasses.map(pitchClass => pitchClass.noteName);
          if (currentAscendingNotes[0] === sourceAscendingNotes[0]) hopsFromOne.push(transposition);
          if (
            currentAscendingNotes[0] === sourceAscendingNotes[3] &&
            shawwaMapping(sourceAscendingNotes[3]) !== "/"
          )
            hopsFromFour.push(transposition);
          if (
            currentAscendingNotes[0] === sourceAscendingNotes[4] &&
            shawwaMapping(sourceAscendingNotes[4]) !== "/"
          )
            hopsFromFive.push(transposition);
          if (
            currentAscendingNotes[0] === sourceAscendingNotes[2] &&
            shawwaMapping(sourceAscendingNotes[2]) !== "/"
          )
            hopsFromThree.push(transposition);
          if (check2p && currentAscendingNotes[0] === noteName2p) hopsFromThree2p.push(transposition);
          if (checkSixth && currentAscendingNotes[0] === sourceAscendingNotes[5]) hopsFromSix.push(transposition);
        }
      }

      return {
        hopsFromOne,
        hopsFromThree,
        hopsFromThree2p,
        hopsFromFour,
        hopsFromFive,
        hopsFromSix,
        noteName2p, // add this line
      };
    },
    [allPitchClasses, maqamat, shawwaMapping, selectedTuningSystem, getMaqamTranspositions]
  );

  const handleUrlParams = ({
    tuningSystemId,
    jinsId,
    maqamId,
    sayrId,
    firstNote,
  }: {
    tuningSystemId?: string;
    jinsId?: string;
    maqamId?: string;
    sayrId?: string;
    firstNote?: string;
  }) => {
    if (!tuningSystems.length || !ajnas.length || !maqamat.length) return;

    if (tuningSystemId) {
      if (!selectedTuningSystem || selectedTuningSystem.getId() !== tuningSystemId) {
        const found = tuningSystems.find((ts) => ts.getId() === tuningSystemId);
        if (found) {
          setSelectedTuningSystem(found);
          handleStartNoteNameChange(firstNote ?? "", found.getSetsOfNoteNames(), found.getPitchClasses().length);
          const allPitchClasses = getTuningSystemCells(found, firstNote || "");

          if (jinsId) {
            const foundJins = ajnas.find((j) => j.getId() === jinsId);
            if (foundJins && checkIfJinsIsSelectable(foundJins, allPitchClasses)) {
              handleClickJins(foundJins, allPitchClasses);
            }
          } else if (maqamId) {
            const foundMaqam = maqamat.find((m) => m.getId() === maqamId);
            if (foundMaqam && checkIfMaqamIsSelectable(foundMaqam, allPitchClasses)) {
              handleClickMaqam(foundMaqam, allPitchClasses);
              if (sayrId) {
                setMaqamSayrId(sayrId);
              }
            }
          }
        }
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        tuningSystems,
        setTuningSystems,
        selectedTuningSystem,
        setSelectedTuningSystem,
        tuningSystemPitchClasses,
        setTuningSystemPitchClasses,
        handleStartNoteNameChange,
        selectedPitchClasses,
        setSelectedPitchClasses,
        allPitchClasses,
        selectedIndices,
        setSelectedIndices,
        originalIndices,
        setOriginalIndices,
        mapIndices,
        initialMappingDone,
        referenceFrequencies,
        setReferenceFrequencies,
        ajnas,
        setAjnas,
        selectedJins,
        setSelectedJins,
        checkIfJinsIsSelectable,
        handleClickJins,
        selectedJinsTransposition,
        setSelectedJinsTransposition,
        maqamat,
        setMaqamat,
        selectedMaqam,
        setSelectedMaqam,
        checkIfMaqamIsSelectable,
        handleClickMaqam,
        selectedMaqamTransposition,
        setSelectedMaqamTransposition,
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
