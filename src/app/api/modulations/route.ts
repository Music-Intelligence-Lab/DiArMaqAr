import { getTuningSystems, getAjnas, getMaqamat } from "@/functions/import";
import detectPitchClassType from "@/functions/detectPitchClassType";
import { NextResponse } from "next/server";
import PitchClass from "@/models/PitchClass";
import { getMaqamTranspositions } from "@/functions/transpose";
import getTuningSystemCells from "@/functions/getTuningSystemCells";
import modulate from "@/functions/modulate";
import { MaqamatModulations } from "@/models/Maqam";
import { AjnasModulations } from "@/models/Jins";

export async function POST(request: Request) {
  try {
    const { 
      tuningSystemID, 
      maqamID, 
      firstNote, 
      tonic, 
      ajnasModulationsMode, 
      centsTolerance 
    } = await request.json();

    const tuningSystems = getTuningSystems();
    const maqamat = getMaqamat();
    const ajnas = getAjnas();

    // Validate required parameters
    if (typeof tuningSystemID !== "string") {
      return NextResponse.json({ error: "tuningSystemID (string) is required" }, { status: 400 });
    }

    if (typeof maqamID !== "string") {
      return NextResponse.json({ error: "maqamID (string) is required" }, { status: 400 });
    }

    if (typeof tonic !== "string") {
      return NextResponse.json({ error: "tonic (string) is required" }, { status: 400 });
    }

    // Find the tuning system
    const selectedTuningSystem = tuningSystems.find((ts) => ts.getId() === tuningSystemID);
    if (!selectedTuningSystem) {
      return NextResponse.json({ error: "Invalid tuningSystemID" }, { status: 400 });
    }

    // Find the maqam
    const selectedMaqamData = maqamat.find((maqam) => maqam.getId() === maqamID);
    if (!selectedMaqamData) {
      return NextResponse.json({ error: "Invalid maqamID" }, { status: 400 });
    }

    // Determine note names to use
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
      if (selectedTuningSystem.getNoteNames().length > 0) {
        noteNames = selectedTuningSystem.getNoteNames()[0];
      } else {
        return NextResponse.json({ error: "No note names available" }, { status: 400 });
      }
    }

    // Validate pitch class type
    const pitchClassType = detectPitchClassType(selectedTuningSystem.getPitchClasses());
    if (pitchClassType === "unknown") {
      return NextResponse.json({ error: "Invalid pitch class type" }, { status: 400 });
    }

    // Get all pitch classes
    const allPitchClasses: PitchClass[] = getTuningSystemCells(selectedTuningSystem, firstNote);

    // Get the maqam transpositions to find the specific transposition with the requested tonic
    const maqamTranspositions = getMaqamTranspositions(
      allPitchClasses, 
      ajnas, 
      selectedMaqamData, 
      true, 
      centsTolerance ?? 5
    );

    // Find the specific transposition that starts with the requested tonic
    const sourceMaqamTransposition = maqamTranspositions.find(
      (maqam) => maqam.ascendingPitchClasses[0]?.noteName === tonic
    );

    if (!sourceMaqamTransposition) {
      return NextResponse.json({ 
        error: `No transposition found for maqam ${maqamID} with tonic ${tonic}` 
      }, { status: 400 });
    }

    // Calculate modulations
    const modulations = modulate(
      allPitchClasses,
      ajnas,
      maqamat,
      sourceMaqamTransposition,
      ajnasModulationsMode ?? false,
      centsTolerance ?? 5
    );

    // Return both ajnas and maqamat modulations for completeness
    if (ajnasModulationsMode) {
      const ajnasModulations = modulations as AjnasModulations;
      const maqamatModulations = modulate(
        allPitchClasses,
        ajnas,
        maqamat,
        sourceMaqamTransposition,
        false,
        centsTolerance ?? 5
      ) as MaqamatModulations;

      return NextResponse.json({
        ajnas: ajnasModulations,
        maqamat: maqamatModulations,
        sourceMaqam: {
          maqamId: sourceMaqamTransposition.maqamId,
          name: sourceMaqamTransposition.name,
          tonic: sourceMaqamTransposition.ascendingPitchClasses[0]?.noteName,
          ascendingNoteNames: sourceMaqamTransposition.ascendingPitchClasses.map(pc => pc.noteName),
          descendingNoteNames: sourceMaqamTransposition.descendingPitchClasses.map(pc => pc.noteName)
        }
      });
    } else {
      const maqamatModulations = modulations as MaqamatModulations;
      const ajnasModulations = modulate(
        allPitchClasses,
        ajnas,
        maqamat,
        sourceMaqamTransposition,
        true,
        centsTolerance ?? 5
      ) as AjnasModulations;

      return NextResponse.json({
        ajnas: ajnasModulations,
        maqamat: maqamatModulations,
        sourceMaqam: {
          maqamId: sourceMaqamTransposition.maqamId,
          name: sourceMaqamTransposition.name,
          tonic: sourceMaqamTransposition.ascendingPitchClasses[0]?.noteName,
          ascendingNoteNames: sourceMaqamTransposition.ascendingPitchClasses.map(pc => pc.noteName),
          descendingNoteNames: sourceMaqamTransposition.descendingPitchClasses.map(pc => pc.noteName)
        }
      });
    }

  } catch (error) {
    console.error("Error in POST /api/modulations:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
