"use client";

import React, { createContext, useState, useEffect, useMemo, useContext, useCallback } from "react";
import tuningSystemsData from "@/../data/tuningSystems.json";
import ajnasData from "@/../data/ajnas.json";
import maqamatData from "@/../data/maqamat.json";
import sourcesData from "@/../data/sources.json";
import patternsData from "@/../data/patterns.json";
import TuningSystem from "@/models/TuningSystem";
import Jins, { JinsTransposition } from "@/models/Jins";
import TransliteratedNoteName, { TransliteratedNoteNameOctaveOne, TransliteratedNoteNameOctaveTwo } from "@/models/NoteName";
import detectPitchClassType from "@/functions/detectPitchClassType";
import convertPitchClass, { shiftPitchClass } from "@/functions/convertPitchClass";
import { octaveZeroNoteNames, octaveOneNoteNames, octaveTwoNoteNames, octaveThreeNoteNames, octaveFourNoteNames } from "@/models/NoteName";
import Maqam, { MaqamTransposition, Sayr, MaqamModulations } from "@/models/Maqam";
import getNoteNamesUsedInTuningSystem from "@/functions/getNoteNamesUsedInTuningSystem";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import { Source, SourcePageReference } from "@/models/bibliography/Source";
import Book from "@/models/bibliography/Book";
import Article from "@/models/bibliography/Article";
import Pattern, { NoteDuration } from "@/models/Pattern";
import getFirstNoteName from "@/functions/getFirstNoteName";
import { getMaqamTranspositions } from "@/functions/transpose";
import shawwaMapping from "@/functions/shawwaMapping";
import { Cell, CellDetails } from "@/models/Cell";

interface AppContextInterface {
  tuningSystems: TuningSystem[];
  setTuningSystems: React.Dispatch<React.SetStateAction<TuningSystem[]>>;
  selectedTuningSystem: TuningSystem | null;
  setSelectedTuningSystem: (tuningSystem: TuningSystem | null) => void;
  pitchClasses: string;
  setPitchClasses: React.Dispatch<React.SetStateAction<string>>;
  noteNames: TransliteratedNoteName[][];
  setNoteNames: (noteNames: TransliteratedNoteName[][]) => void;
  handleStartNoteNameChange: (startingNoteName: string, givenNoteNames?: TransliteratedNoteName[][], givenNumberOfPitchClasses?: number) => void;
  selectedCells: Cell[];
  setSelectedCells: React.Dispatch<React.SetStateAction<Cell[]>>;
  selectedCellDetails: CellDetails[];
  allCellDetails: CellDetails[];
  selectedIndices: number[];
  setSelectedIndices: React.Dispatch<React.SetStateAction<number[]>>;
  originalIndices: number[];
  setOriginalIndices: React.Dispatch<React.SetStateAction<number[]>>;
  mapIndices: (notesToMap: TransliteratedNoteName[], givenNumberOfPitchClasses: number, setOriginal: boolean) => void;
  initialMappingDone: boolean;
  referenceFrequencies: { [noteName: string]: number };
  setReferenceFrequencies: React.Dispatch<React.SetStateAction<{ [noteName: string]: number }>>;
  ajnas: Jins[];
  setAjnas: React.Dispatch<React.SetStateAction<Jins[]>>;
  selectedJins: Jins | null;
  setSelectedJins: React.Dispatch<React.SetStateAction<Jins | null>>;
  checkIfJinsIsSelectable: (jins: Jins) => boolean;
  handleClickJins: (jins: Jins) => void;
  selectedJinsTransposition: JinsTransposition | null;
  setSelectedJinsTransposition: React.Dispatch<React.SetStateAction<JinsTransposition | null>>;
  maqamat: Maqam[];
  setMaqamat: React.Dispatch<React.SetStateAction<Maqam[]>>;
  selectedMaqam: Maqam | null;
  setSelectedMaqam: React.Dispatch<React.SetStateAction<Maqam | null>>;
  checkIfMaqamIsSelectable: (maqam: Maqam) => boolean;
  handleClickMaqam: (maqam: Maqam) => void;
  selectedMaqamTransposition: MaqamTransposition | null;
  setSelectedMaqamTransposition: React.Dispatch<React.SetStateAction<MaqamTransposition | null>>;
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
  getModulations: (maqamTransposition: MaqamTransposition) => MaqamModulations;
}

const AppContext = createContext<AppContextInterface | null>(null);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [tuningSystems, setTuningSystems] = useState<TuningSystem[]>([]);
  const [selectedTuningSystem, setSelectedTuningSystem] = useState<TuningSystem | null>(null);
  const [pitchClasses, setPitchClasses] = useState("");
  const [noteNames, setNoteNames] = useState<TransliteratedNoteName[][]>([]);

  const [centsTolerance, setCentsTolerance] = useState(5);

  const [selectedCells, setSelectedCells] = useState<Cell[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [originalIndices, setOriginalIndices] = useState<number[]>([]);
  const [initialMappingDone, setInitialMappingDone] = useState(false);

  const [referenceFrequencies, setReferenceFrequencies] = useState<{
    [noteName: string]: number;
  }>({});

  const [ajnas, setAjnas] = useState<Jins[]>([]);
  const [selectedJins, setSelectedJins] = useState<Jins | null>(null);
  const [selectedJinsTransposition, setSelectedJinsTransposition] = useState<JinsTransposition | null>(null);

  const [maqamat, setMaqamat] = useState<Maqam[]>([]);
  const [selectedMaqam, setSelectedMaqam] = useState<Maqam | null>(null);
  const [selectedMaqamTransposition, setSelectedMaqamTransposition] = useState<MaqamTransposition | null>(null);
  const [maqamSayrId, setMaqamSayrId] = useState<string>("");

  const [patterns, setPatterns] = useState<Pattern[]>([]);

  const [sources, setSources] = useState<Source[]>([]);

  const pitchClassesArr = pitchClasses
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  useEffect(() => {
    const formattedTuningSystems = tuningSystemsData.map((data) => {
      return new TuningSystem(
        data.titleEnglish,
        data.titleArabic || "",
        data.year,
        data.sourceEnglish,
        data.sourceArabic,
        data.sourcePageReferences as SourcePageReference[],
        data.creatorEnglish,
        data.creatorArabic,
        data.commentsEnglish,
        data.commentsArabic,
        data.pitchClasses,
        data.noteNames as TransliteratedNoteName[][],
        data.abjadNames,
        Number(data.stringLength),
        data.referenceFrequencies as unknown as { [noteName: string]: number },
        Number(data.defaultReferenceFrequency)
      );
    });

    setTuningSystems(formattedTuningSystems);

    const loadedAjnas = ajnasData.map(
      (data) => new Jins(data.id, data.name, data.noteNames, data.commentsEnglish, data.commentsArabic, data.sourcePageReferences)
    );
    setAjnas(loadedAjnas);

    const loadedMaqamat = maqamatData.map(
      (data) =>
        new Maqam(
          data.id,
          data.name,
          data.ascendingNoteNames,
          data.descendingNoteNames,
          data.suyūr as Sayr[],
          data.commentsEnglish,
          data.commentsArabic,
          data.sourcePageReferences
        )
    );
    setMaqamat(loadedMaqamat);

    const loadedSources = sourcesData.map((data) => {
      if (data.sourceType === "Book") {
        return Book.fromJSON(data);
      } else if (data.sourceType === "Article") {
        return Article.fromJSON(data);
      } else {
        throw new Error(`Unknown sourceType "${data.sourceType}"`);
      }
    });
    setSources(loadedSources);

    const loadedPatterns = patternsData.map(
      (data) =>
        new Pattern(
          data.id,
          data.name,
          data.notes.map((note) => ({
            scaleDegree: note.scaleDegree as string,
            noteDuration: note.noteDuration as NoteDuration,
            isTarget: note.isTarget || false,
          }))
        )
    );
    setPatterns(loadedPatterns);

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
      if (selectedJins) {
        if (checkIfJinsIsSelectable(selectedJins)) handleClickJins(selectedJins);
        else clearSelections();
      } else if (selectedMaqam) {
        if (checkIfMaqamIsSelectable(selectedMaqam)) handleClickMaqam(selectedMaqam);
        else clearSelections();
      }
    } else clearSelections();
  }, [selectedTuningSystem]);

  const getCellDetails = (cell: Cell): CellDetails => {
    const emptyDetails: CellDetails = {
      noteName: "",
      fraction: "",
      cents: "",
      ratios: "",
      stringLength: "",
      frequency: "",
      englishName: "",
      originalValue: "",
      originalValueType: "",
      index: cell.index,
      octave: cell.octave,
    };

    if (!selectedTuningSystem) return emptyDetails;

    const pitchArr = selectedTuningSystem.getPitchClasses();
    if (cell.index < 0 || cell.index >= pitchArr.length) return emptyDetails;

    const basePc = pitchArr[cell.index];

    const pitchType = detectPitchClassType(pitchArr);
    if (pitchType === "unknown") return emptyDetails;

    const actualReferenceFrequency = referenceFrequencies[getFirstNoteName(selectedIndices)] || selectedTuningSystem.getDefaultReferenceFrequency();

    const shiftedPc = shiftPitchClass(basePc, pitchType, cell.octave as 0 | 1 | 2 | 3);
    const conv = convertPitchClass(shiftedPc, pitchType, selectedTuningSystem.getStringLength(), actualReferenceFrequency);

    if (cell.index < 0 || cell.index >= selectedIndices.length) return emptyDetails;

    const combinedIndex = selectedIndices[cell.index];

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
      englishName: getEnglishNoteName(noteName),
      fraction: conv ? conv.fraction : "-",
      cents: conv ? conv.cents : "-",
      ratios: conv ? conv.decimal : "-",
      stringLength: conv ? conv.stringLength : "-",
      frequency: conv ? conv.frequency : "-",
      originalValue: shiftedPc,
      originalValueType: pitchType,
      index: cell.index,
      octave: cell.octave,
    };
  };

  const getAllCells = (): Cell[] => {
    if (!selectedTuningSystem) return [];
    const pitchArr = selectedTuningSystem.getPitchClasses();
    const cells: Cell[] = [];

    for (let octave = 0; octave < 4; octave++) {
      for (let index = 0; index < pitchArr.length; index++) {
        cells.push({ octave, index });
      }
    }
    return cells;
  };

  const selectedCellDetails = useMemo(
    () => selectedCells.map(getCellDetails),
    [selectedCells, selectedTuningSystem, selectedIndices, referenceFrequencies, pitchClasses, noteNames]
  );

  const allCellDetails = useMemo(
    () => getAllCells().map(getCellDetails),
    [selectedTuningSystem, selectedIndices, referenceFrequencies, pitchClasses, noteNames]
  );

  const clearSelections = () => {
    setSelectedCells([]);
    setSelectedJins(null);
    setSelectedMaqam(null);
    setMaqamSayrId("");
    setSelectedJinsTransposition(null);
    setSelectedMaqamTransposition(null);
  };

  function mapIndices(notesToMap: TransliteratedNoteName[], givenNumberOfPitchClasses: number = 0, setOriginal: boolean = true) {
    const numberOfPitchClasses = givenNumberOfPitchClasses || pitchClassesArr.length || selectedTuningSystem?.getPitchClasses().length || 0;

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
    givenNoteNames: TransliteratedNoteName[][] = [],
    givenNumberOfPitchClasses: number = 0
  ) => {
    const noteNamesToSearch = givenNoteNames.length ? givenNoteNames : noteNames;
    const numberOfPitchClasses = givenNumberOfPitchClasses || pitchClassesArr.length || selectedTuningSystem?.getPitchClasses().length || 0;

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

  const checkIfJinsIsSelectable = (jins: Jins, givenIndices: number[] = []) => {
    const usedNoteNames = getNoteNamesUsedInTuningSystem(givenIndices.length ? givenIndices : selectedIndices);
    return jins.getNoteNames().every((noteName) => usedNoteNames.includes(noteName));
  };

  const handleClickJins = (jins: Jins, givenIndices: number[] = []) => {
    const usedNoteNames = getNoteNamesUsedInTuningSystem(givenIndices.length ? givenIndices : selectedIndices);

    setSelectedJins(jins);
    setSelectedMaqam(null);
    setMaqamSayrId("");

    const noteNames = jins.getNoteNames();

    const newSelectedCells: Cell[] = [];

    const lengthOfUsedNoteNames = usedNoteNames.length;

    for (let i = 0; i < lengthOfUsedNoteNames; i++) {
      const usedNoteName = usedNoteNames[i];

      if (noteNames.includes(usedNoteName)) {
        let octave = 0;
        let index = i;

        while (index >= lengthOfUsedNoteNames / 4) {
          octave++;
          index -= lengthOfUsedNoteNames / 4;
        }

        newSelectedCells.push({
          octave,
          index,
        });
      }
    }

    setSelectedCells(newSelectedCells);
  };

  const checkIfMaqamIsSelectable = (maqam: Maqam, givenIndices: number[] = []) => {
    const usedNoteNames = getNoteNamesUsedInTuningSystem(givenIndices.length ? givenIndices : selectedIndices);

    return (
      maqam.getAscendingNoteNames().every((noteName) => usedNoteNames.includes(noteName)) &&
      maqam.getDescendingNoteNames().every((noteName) => usedNoteNames.includes(noteName))
    );
  };

  const handleClickMaqam = (maqam: Maqam, givenIndices: number[] = []) => {
    const usedNoteNames = getNoteNamesUsedInTuningSystem(givenIndices.length ? givenIndices : selectedIndices);

    // when selecting, populate cells for asc or desc based on stored noteNames
    setSelectedMaqam(maqam);
    setSelectedJins(null);
    setMaqamSayrId("");
    setSelectedMaqamTransposition(null);
    const namesToSelect = maqam.getAscendingNoteNames();

    // translate names back into SelectedCell[] by matching against usedNoteNames
    const newCells: Cell[] = [];
    usedNoteNames.forEach((name, idx) => {
      if (namesToSelect.includes(name)) {
        let octave = 0;
        let index = idx;
        // assume 4 octaves evenly divided
        const perOct = usedNoteNames.length / 4;
        while (index >= perOct) {
          octave++;
          index -= perOct;
        }
        newCells.push({ octave, index });
      }
    });
    setSelectedCells(newCells);
  };

  const getModulations = useCallback(
    (maqamTransposition: MaqamTransposition): MaqamModulations => {
      const hopsFromOne: MaqamTransposition[] = [];
      const hopsFromThree: MaqamTransposition[] = [];
      const hopsFromThree2p: MaqamTransposition[] = [];
      const hopsFromFour: MaqamTransposition[] = [];
      const hopsFromFive: MaqamTransposition[] = [];
      const hopsFromSix: MaqamTransposition[] = [];

      let check2p = false;
      let checkSixth = false;

      const shawwaList = [...octaveOneNoteNames, ...octaveTwoNoteNames].filter((noteName) => shawwaMapping(noteName) !== "/");

      const firstDegreeNoteName = maqamTransposition.ascendingNoteNames[0];
      const firstDegreeShawwaIndex = shawwaList.findIndex((noteName) => noteName === firstDegreeNoteName);

      const secondDegreeNoteName = maqamTransposition.ascendingNoteNames[1];
      const secondDegreeShawwaIndex = shawwaList.findIndex((noteName) => noteName === secondDegreeNoteName);

      const thirdDegreeNoteName = maqamTransposition.ascendingNoteNames[2];
      const thirdDegreeCellDetailsIndex = allCellDetails.findIndex((cd) => cd.noteName === thirdDegreeNoteName);

      let noteName2p = "";

      const numberOfPitchClasses = selectedTuningSystem?.getPitchClasses().length || 0;

      const slice = allCellDetails.slice(numberOfPitchClasses, thirdDegreeCellDetailsIndex + 1).reverse();

      for (const cellDetails of slice) {
        if (shawwaMapping(cellDetails.noteName) === "2p") {
          noteName2p = cellDetails.noteName;
          const first2pBeforeShawwaIndex = shawwaList.findIndex((noteName) => noteName === noteName2p);

          if (first2pBeforeShawwaIndex - firstDegreeShawwaIndex === 6 && first2pBeforeShawwaIndex - secondDegreeShawwaIndex === 2) check2p = true;
          break;
        }
      }

      const sixthDegreeNoteName = maqamTransposition.ascendingNoteNames[5];
      const sixthDegreeCellDetailsIndex = shawwaList.findIndex((noteName) => noteName === sixthDegreeNoteName);

      if (
        (sixthDegreeCellDetailsIndex - firstDegreeShawwaIndex === 16 || sixthDegreeCellDetailsIndex - firstDegreeShawwaIndex === 17) &&
        shawwaMapping(sixthDegreeNoteName) === "n"
      )
        checkSixth = true;

      for (const maqam of maqamat) {
        if (!checkIfMaqamIsSelectable(maqam)) continue;

        const transpositions: MaqamTransposition[] =
          JSON.stringify(maqam.getAscendingNoteNames()) !== JSON.stringify(maqamTransposition.ascendingNoteNames)
            ? [maqam.convertToMaqamTransposition()]
            : [];

        getMaqamTranspositions(allCellDetails, maqam).forEach((sequence) => {
          if (JSON.stringify(maqam.getAscendingNoteNames()) === JSON.stringify(sequence.ascendingSequence.map((cellDetails) => cellDetails.noteName)))
            return;
          transpositions.push({
            name: maqam.getName() + " al-" + sequence.ascendingSequence[0].noteName,
            ascendingNoteNames: sequence.ascendingSequence.map((cellDetails) => cellDetails.noteName),
            descendingNoteNames: sequence.descendingSequence.map((cellDetails) => cellDetails.noteName),
          });
        });

        for (const transposition of transpositions) {
          if (transposition.ascendingNoteNames[0] === maqamTransposition.ascendingNoteNames[0]) hopsFromOne.push(transposition);
          if (
            transposition.ascendingNoteNames[0] === maqamTransposition.ascendingNoteNames[3] &&
            shawwaMapping(maqamTransposition.ascendingNoteNames[3]) !== "/"
          )
            hopsFromFour.push(transposition);
          if (
            transposition.ascendingNoteNames[0] === maqamTransposition.ascendingNoteNames[4] &&
            shawwaMapping(maqamTransposition.ascendingNoteNames[4]) !== "/"
          )
            hopsFromFive.push(transposition);
          if (
            transposition.ascendingNoteNames[0] === maqamTransposition.ascendingNoteNames[2] &&
            shawwaMapping(maqamTransposition.ascendingNoteNames[2]) !== "/"
          )
            hopsFromThree.push(transposition);
          if (check2p && transposition.ascendingNoteNames[0] === noteName2p) hopsFromThree2p.push(transposition);
          if (checkSixth && transposition.ascendingNoteNames[0] === maqamTransposition.ascendingNoteNames[5]) hopsFromSix.push(transposition);
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
    [allCellDetails, maqamat, shawwaMapping, selectedTuningSystem, getMaqamTranspositions]
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
          const givenIndices = handleStartNoteNameChange(firstNote ?? "", found.getSetsOfNoteNames(), found.getPitchClasses().length);

          if (jinsId) {
            const foundJins = ajnas.find((j) => j.getId() === jinsId);
            if (foundJins && checkIfJinsIsSelectable(foundJins, givenIndices)) {
              handleClickJins(foundJins, givenIndices);
            }
          } else if (maqamId) {
            const foundMaqam = maqamat.find((m) => m.getId() === maqamId);
            if (foundMaqam && checkIfMaqamIsSelectable(foundMaqam, givenIndices)) {
              handleClickMaqam(foundMaqam, givenIndices);
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
        pitchClasses,
        setPitchClasses,
        noteNames,
        setNoteNames,
        handleStartNoteNameChange,
        selectedCells,
        setSelectedCells,
        selectedCellDetails,
        allCellDetails,
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
