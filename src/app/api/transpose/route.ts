import { getTuningSystems, getAjnas, getMaqamat } from "@/functions/import";
import detectPitchClassType from "@/functions/detectPitchClassType";
import { NextResponse } from "next/server";
import PitchClass from "@/models/PitchClass";
import { getJinsTranspositions, getMaqamTranspositions } from "@/functions/transpose";
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
      for (const setOfNotes of selectedTuningSystem.getNoteNames()) {
        if (setOfNotes[0] === firstNote) {
          noteNames = setOfNotes;
          break;
        }
      }

      if (noteNames.length === 0) {
        return NextResponse.json({ error: "Invalid firstNote" }, { status: 400 });
      }
    } else {
      if (selectedTuningSystem.getNoteNames().length > 0) noteNames = selectedTuningSystem.getNoteNames()[0];
      else {
        return NextResponse.json({ error: "No note names available" }, { status: 400 });
      }
    }

    const pitchClassType = detectPitchClassType(selectedTuningSystem.getPitchClasses());

    if (pitchClassType === "unknown") {
      return NextResponse.json({ error: "Invalid pitch class type" }, { status: 400 });
    }

    const allPitchClasses: PitchClass[] = getTuningSystemCells(selectedTuningSystem, firstNote);

    if (maqamID) {
      const selectedMaqam = maqamat.find((maqam) => maqam.getId() === maqamID);
      if (!selectedMaqam) {
        return NextResponse.json({ error: "Invalid maqamID" }, { status: 400 });
      }

      const maqamTranspositions = getMaqamTranspositions(allPitchClasses, ajnas, selectedMaqam, true, centsTolerance ?? 5);

      return NextResponse.json(maqamTranspositions);
    } else if (jinsID) {
      const selectedJins = ajnas.find((jins) => jins.getId() === jinsID);
      if (!selectedJins) {
        return NextResponse.json({ error: "Invalid jinsID" }, { status: 400 });
      }

      const jinsTranspositions = getJinsTranspositions(allPitchClasses, selectedJins, true, centsTolerance ?? 5);

      return NextResponse.json(jinsTranspositions);
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
