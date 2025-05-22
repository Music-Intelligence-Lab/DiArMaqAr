import convertPitchClass, { shiftPitchClass } from "@/functions/convertPitchClass";
import detectPitchClassType from "@/functions/detectPitchClassType";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { CellDetails } from "@/contexts/app-context";
import { octaveZeroNoteNames, octaveOneNoteNames, octaveTwoNoteNames, octaveThreeNoteNames, octaveFourNoteNames } from "@/models/NoteName";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import { getIntervalPattern, getTranspositions, mergeTranspositions, Interval } from "@/functions/transpose";

const dataFilePath = path.join(process.cwd(), "data", "tuningSystems.json");
const maqamatPath = path.join(process.cwd(), "data", "maqamat.json");
const ajnasPath = path.join(process.cwd(), "data", "ajnas.json");

export async function POST(request: Request) {
  try {
    const { tuningSystemID, maqamID, jinsID, firstNote, centsTolerance } = await request.json();

    if (typeof tuningSystemID !== "string") {
      return NextResponse.json({ error: "tuningSystemID (string) is required" }, { status: 400 });
    }

    if (!maqamID && !jinsID) {
      return NextResponse.json({ error: "Either maqamID or jinsID must be provided" }, { status: 400 });
    }

    const [tsRaw, maqRaw, ajnRaw] = await Promise.all([
      fs.readFile(dataFilePath, "utf-8"),
      fs.readFile(maqamatPath, "utf-8"),
      fs.readFile(ajnasPath, "utf-8"),
    ]);

    const tuningSystems: {
      id: string;
      titleEnlish: string;
      titleArabic: string;
      year: string;
      sourceEnglish: string;
      sourceArabic: string;
      commentsEnglish: string;
      commentsArabic: string;
      pitchClasses: string[];
      noteNames: string[][];
      abjadNames: string[];
      stringLength: number;
      referenceFrequency: number;
    }[] = JSON.parse(tsRaw);

    const maqamatData: {
      id: string;
      name: string;
      ascendingNoteNames: string[];
      descendingNoteNames: string[];
    }[] = JSON.parse(maqRaw);

    const ajnasData: {
      id: string;
      name: string;
      noteNames: string[];
    }[] = JSON.parse(ajnRaw);

    const selectedTuningSystem = tuningSystems.find((ts) => ts.id === tuningSystemID);

    if (!selectedTuningSystem) {
      return NextResponse.json({ error: "Invalid tuningSystemID" }, { status: 400 });
    }

    let noteNames: string[] = [];

    if (firstNote) {
      for (const setOfNotes of selectedTuningSystem.noteNames) {
        if (setOfNotes[0] === firstNote) {
          noteNames = setOfNotes;
          break;
        }
      }

      if (noteNames.length === 0) {
        return NextResponse.json({ error: "Invalid firstNote" }, { status: 400 });
      }
    } else {
      if (selectedTuningSystem.noteNames.length > 0) noteNames = selectedTuningSystem.noteNames[0];
      else {
        return NextResponse.json({ error: "No note names available" }, { status: 400 });
      }
    }

    const pitchClassType = detectPitchClassType(selectedTuningSystem.pitchClasses);

    if (pitchClassType === "unknown") {
      return NextResponse.json({ error: "Invalid pitch class type" }, { status: 400 });
    }

    const allCellDetails: CellDetails[] = [];

    for (let octave = 0; octave < 4; octave++) {
      for (let index = 0; index < selectedTuningSystem.pitchClasses.length; index++) {
        const pitchClass = selectedTuningSystem.pitchClasses[index];
        const baseNoteName = noteNames[index];
        const conversions = convertPitchClass(pitchClass, pitchClassType, selectedTuningSystem.stringLength, selectedTuningSystem.referenceFrequency);

        if (!conversions) {
          return NextResponse.json({ error: "Invalid pitch class conversion" }, { status: 400 });
        }

        const fraction = shiftPitchClass(conversions.fraction, "fraction", octave as 0 | 1 | 2 | 3);
        const stringLength = shiftPitchClass(conversions.stringLength, "stringLength", octave as 0 | 1 | 2 | 3);
        const cents = shiftPitchClass(conversions.cents, "cents", octave as 0 | 1 | 2 | 3);
        const decimal = shiftPitchClass(conversions.decimal, "decimal", octave as 0 | 1 | 2 | 3);
        const frequency = convertPitchClass(cents, "cents", selectedTuningSystem.stringLength, selectedTuningSystem.referenceFrequency)?.frequency;

        if (!frequency) {
          return NextResponse.json({ error: "Invalid frequency conversion" }, { status: 400 });
        }

        let noteNameIndex = -1;
        let firstOctave = true;
        let noteName = "";

        if (octaveOneNoteNames.includes(baseNoteName)) {
          noteNameIndex = octaveOneNoteNames.indexOf(baseNoteName);
        } else if (octaveTwoNoteNames.includes(baseNoteName)) {
          noteNameIndex = octaveTwoNoteNames.indexOf(baseNoteName);
          firstOctave = false;
        } else {
          return NextResponse.json({ error: "Invalid base note name" }, { status: 400 });
        }

        if (firstOctave) {
          if (octave === 0) {
            noteName = octaveZeroNoteNames[noteNameIndex];
          } else if (octave === 1) {
            noteName = octaveOneNoteNames[noteNameIndex];
          } else if (octave === 2) {
            noteName = octaveTwoNoteNames[noteNameIndex];
          } else if (octave === 3) {
            noteName = octaveThreeNoteNames[noteNameIndex];
          }
        } else {
          if (octave === 0) {
            noteName = octaveOneNoteNames[noteNameIndex];
          } else if (octave === 1) {
            noteName = octaveTwoNoteNames[noteNameIndex];
          } else if (octave === 2) {
            noteName = octaveThreeNoteNames[noteNameIndex];
          } else if (octave === 3) {
            noteName = octaveFourNoteNames[noteNameIndex];
          }
        }

        const cellDetails: CellDetails = {
          originalValue: shiftPitchClass(pitchClass, pitchClassType, octave as 0 | 1 | 2 | 3),
          originalValueType: pitchClassType,
          stringLength,
          frequency,
          cents,
          ratios: decimal,
          fraction,
          noteName,
          octave,
          englishName: getEnglishNoteName(noteName),
        };

        allCellDetails.push(cellDetails);
      }
    }

    const valueType = allCellDetails[0].originalValueType;

    const useRatio = valueType === "fraction" || valueType === "ratios";

    if (!useRatio) {
      if (centsTolerance === undefined) return NextResponse.json({ error: "centsTolerance is required for non-ratio values" }, { status: 400 });
      else if (isNaN(parseInt(centsTolerance))) return NextResponse.json({ error: "centsTolerance must be a number" }, { status: 400 });
      else if (parseInt(centsTolerance) < 0) return NextResponse.json({ error: "centsTolerance must be a positive number" }, { status: 400 });
    }

    if (maqamID) {
      const selectedMaqam = maqamatData.find((maq) => maq.id === maqamID);
      if (!selectedMaqam) {
        return NextResponse.json({ error: "Invalid maqamID" }, { status: 400 });
      }

      const ascendingMaqamCellDetails: CellDetails[] = [];
      const descendingMaqamCellDetails: CellDetails[] = [];

      for (const cellDetail of allCellDetails) {
        const noteName = cellDetail.noteName;

        if (selectedMaqam.ascendingNoteNames.includes(noteName)) {
          ascendingMaqamCellDetails.push(cellDetail);
        }

        if (selectedMaqam.descendingNoteNames.includes(noteName)) {
          descendingMaqamCellDetails.push(cellDetail);
        }
      }

      descendingMaqamCellDetails.reverse();

      if (ascendingMaqamCellDetails.length !== selectedMaqam.ascendingNoteNames.length) {
        return NextResponse.json({ error: "This maqam is not compatible with this tuning system" }, { status: 400 });
      }

      if (descendingMaqamCellDetails.length !== selectedMaqam.descendingNoteNames.length) {
        return NextResponse.json({ error: "This maqam is not compatible with this tuning system" }, { status: 400 });
      }

      const ascendingIntervalPattern: Interval[] = getIntervalPattern(ascendingMaqamCellDetails, useRatio);

      const descendingIntervalPattern: Interval[] = getIntervalPattern(descendingMaqamCellDetails, useRatio);

      const ascendingSequences: CellDetails[][] = getTranspositions(allCellDetails, ascendingIntervalPattern, true, useRatio, centsTolerance);
      const descendingSequences: CellDetails[][] = getTranspositions(allCellDetails, descendingIntervalPattern, false, useRatio, centsTolerance);

      const filteredSequences: { ascendingSequence: CellDetails[]; descendingSequence: CellDetails[] }[] = mergeTranspositions(
        ascendingSequences,
        descendingSequences
      );

      const data: {
        ascendingInterval: string[];
        descendingInterval: string[];
        transpositions: { name: string; ascendingSequence: CellDetails[]; descendingSequence: CellDetails[] }[];
      } = {
        ascendingInterval: [],
        descendingInterval: [],
        transpositions: [],
      };

      data.ascendingInterval = ascendingIntervalPattern.map((pat) => {
        if (useRatio) {
          return pat.ratio ?? "1/1";
        } else {
          return pat.diff?.toString() ?? "0";
        }
      });

      data.descendingInterval = descendingIntervalPattern.map((pat) => {
        if (useRatio) {
          return pat.ratio ?? "1/1";
        } else {
          return pat.diff?.toString() ?? "0";
        }
      });

      data.transpositions = filteredSequences.map((seq) => {
        const name = selectedMaqam.name + " al-" + seq.ascendingSequence[0].noteName;
        return { name, ascendingSequence: seq.ascendingSequence, descendingSequence: seq.descendingSequence };
      });

      return NextResponse.json(data);
    } else if (jinsID) {
      const selectedJins = ajnasData.find((jins) => jins.id === jinsID);
      if (!selectedJins) {
        return NextResponse.json({ error: "Invalid jinsID" }, { status: 400 });
      }

      const jinsCellDetails: CellDetails[] = [];

      for (const cellDetail of allCellDetails) {
        const noteName = cellDetail.noteName;

        if (selectedJins.noteNames.includes(noteName)) {
          jinsCellDetails.push(cellDetail);
        }
      }

      if (jinsCellDetails.length !== selectedJins.noteNames.length) {
        return NextResponse.json({ error: "This jins is not compatible with this tuning system" }, { status: 400 });
      }

      const intervalPattern: Interval[] = getIntervalPattern(jinsCellDetails, useRatio);

      const sequences: CellDetails[][] = getTranspositions(allCellDetails, intervalPattern, true, useRatio, centsTolerance);

      const data: {
        interval: string[];
        transpositions: { name: string; sequence: CellDetails[] }[];
      } = {
        interval: [],
        transpositions: [],
      };

      data.interval = intervalPattern.map((pat) => {
        if (useRatio) {
          return pat.ratio ?? "1/1";
        } else {
          return pat.diff?.toString() ?? "0";
        }
      });

      data.transpositions = sequences.map((seq) => {
        const name = selectedJins.name + " al-" + seq[0].noteName;
        return { name, sequence: seq };
      });

      return NextResponse.json(data);
    }

    return NextResponse.json({
      message: "POST payload received",
      tuningSystemID,
      maqamID: maqamID ?? null,
      jinsID: jinsID ?? null,
    });
  } catch (error) {
    console.error("Error in POST /api/tuningSystems:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
