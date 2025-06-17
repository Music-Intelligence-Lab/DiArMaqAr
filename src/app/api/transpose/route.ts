import { getTuningSystems, getAjnas, getMaqamat } from "@/functions/import";
import detectPitchClassType from "@/functions/detectPitchClassType";
import { NextResponse } from "next/server";
import Cell from "@/models/Cell";
import { getIntervalPattern, getTranspositions, mergeTranspositions, Interval } from "@/functions/transpose";
import getTuningSystemCells from "@/functions/getTuningSystemCells";

export async function POST(request: Request) {
  try {
    const { tuningSystemID, maqamID, jinsID, firstNote, centsTolerance } = await request.json();
    const tuningSystems = getTuningSystems();
    const maqamat = getMaqamat();
    const ajnas = getAjnas();

    if (typeof tuningSystemID !== "string") {
      return NextResponse.json({ error: "tuningSystemID (string) is required" }, { status: 400 });
    }

    if (!maqamID && !jinsID) {
      return NextResponse.json({ error: "Either maqamID or jinsID must be provided" }, { status: 400 });
    }

    const selectedTuningSystem = tuningSystems.find((ts) => ts.getId() === tuningSystemID);

    if (!selectedTuningSystem) {
      return NextResponse.json({ error: "Invalid tuningSystemID" }, { status: 400 });
    }

    let noteNames: string[] = [];

    if (firstNote) {
      for (const setOfNotes of selectedTuningSystem.getSetsOfNoteNames()) {
        if (setOfNotes[0] === firstNote) {
          noteNames = setOfNotes;
          break;
        }
      }

      if (noteNames.length === 0) {
        return NextResponse.json({ error: "Invalid firstNote" }, { status: 400 });
      }
    } else {
      if (selectedTuningSystem.getSetsOfNoteNames().length > 0) noteNames = selectedTuningSystem.getSetsOfNoteNames()[0];
      else {
        return NextResponse.json({ error: "No note names available" }, { status: 400 });
      }
    }

    const pitchClassType = detectPitchClassType(selectedTuningSystem.getPitchClasses());

    if (pitchClassType === "unknown") {
      return NextResponse.json({ error: "Invalid pitch class type" }, { status: 400 });
    }

    const allCells: Cell[] = getTuningSystemCells(selectedTuningSystem, firstNote);

    const valueType = allCells[0].originalValueType;

    const useRatio = valueType === "fraction" || valueType === "ratios";

    if (!useRatio) {
      if (centsTolerance === undefined) return NextResponse.json({ error: "centsTolerance is required for non-ratio values" }, { status: 400 });
      else if (isNaN(parseInt(centsTolerance))) return NextResponse.json({ error: "centsTolerance must be a number" }, { status: 400 });
      else if (parseInt(centsTolerance) < 0) return NextResponse.json({ error: "centsTolerance must be a positive number" }, { status: 400 });
    }

    if (maqamID) {
      const selectedMaqam = maqamat.find((maqam) => maqam.getId() === maqamID);
      if (!selectedMaqam) {
        return NextResponse.json({ error: "Invalid maqamID" }, { status: 400 });
      }

      const ascendingMaqamCells: Cell[] = [];
      const descendingMaqamCells: Cell[] = [];

      for (const cellDetail of allCells) {
        const noteName = cellDetail.noteName;

        if (selectedMaqam.getAscendingNoteNames().includes(noteName)) {
          ascendingMaqamCells.push(cellDetail);
        }

        if (selectedMaqam.getDescendingNoteNames().includes(noteName)) {
          descendingMaqamCells.push(cellDetail);
        }
      }

      descendingMaqamCells.reverse();

      if (ascendingMaqamCells.length !== selectedMaqam.getAscendingNoteNames().length) {
        return NextResponse.json({ error: "This maqam is not compatible with this tuning system" }, { status: 400 });
      }

      if (descendingMaqamCells.length !== selectedMaqam.getDescendingNoteNames().length) {
        return NextResponse.json({ error: "This maqam is not compatible with this tuning system" }, { status: 400 });
      }

      const ascendingIntervalPattern: Interval[] = getIntervalPattern(ascendingMaqamCells, useRatio);

      const descendingIntervalPattern: Interval[] = getIntervalPattern(descendingMaqamCells, useRatio);

      const ascendingSequences: Cell[][] = getTranspositions(allCells, ascendingIntervalPattern, true, useRatio, centsTolerance);
      const descendingSequences: Cell[][] = getTranspositions(allCells, descendingIntervalPattern, false, useRatio, centsTolerance);

      const filteredSequences: { ascendingSequence: Cell[]; descendingSequence: Cell[] }[] = mergeTranspositions(
        ascendingSequences,
        descendingSequences
      );

      const data: {
        ascendingInterval: string[];
        descendingInterval: string[];
        transpositions: { name: string; ascendingSequence: Cell[]; descendingSequence: Cell[] }[];
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
        const name = selectedMaqam.getName() + " al-" + seq.ascendingSequence[0].noteName;
        return { name, ascendingSequence: seq.ascendingSequence, descendingSequence: seq.descendingSequence };
      });

      return NextResponse.json(data);
    } else if (jinsID) {
      const selectedJins = ajnas.find((jins) => jins.getId() === jinsID);
      if (!selectedJins) {
        return NextResponse.json({ error: "Invalid jinsID" }, { status: 400 });
      }

      const jinsCellS: Cell[] = [];

      for (const cellDetail of allCells) {
        const noteName = cellDetail.noteName;

        if (selectedJins.getNoteNames().includes(noteName)) {
          jinsCellS.push(cellDetail);
        }
      }

      if (jinsCellS.length !== selectedJins.getNoteNames().length) {
        return NextResponse.json({ error: "This jins is not compatible with this tuning system" }, { status: 400 });
      }

      const intervalPattern: Interval[] = getIntervalPattern(jinsCellS, useRatio);

      const sequences: Cell[][] = getTranspositions(allCells, intervalPattern, true, useRatio, centsTolerance);

      const data: {
        interval: string[];
        transpositions: { name: string; sequence: Cell[] }[];
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
        const name = selectedJins.getName() + " al-" + seq[0].noteName;
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
