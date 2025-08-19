import { getTuningSystems, getAjnas, getMaqamat } from "@/functions/import";
import detectPitchClassValueType from "@/functions/detectPitchClassType";
import { NextResponse } from "next/server";
import PitchClass from "@/models/PitchClass";
import { getMaqamTranspositions } from "@/functions/transpose";
import getTuningSystemCells from "@/functions/getTuningSystemCells";
import modulate from "@/functions/modulate";
import { MaqamatModulations } from "@/models/Maqam";
import { AjnasModulations } from "@/models/Jins";

/**
 * @swagger
 * /api/modulations:
 *   post:
 *     summary: Calculate modulation patterns for maqamat
 *     description: Performs comprehensive modulation analysis for a given maqam within a specific tuning system. Calculates both maqamat-to-maqamat modulations and ajnas-based modulations, providing detailed analysis of melodic transitions, common tones, and theoretical relationships.
 *     tags:
 *       - Modulations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tuningSystemID:
 *                 type: string
 *                 description: Unique identifier for the tuning system context
 *                 example: "24TET_tuning"
 *               maqamID:
 *                 type: string
 *                 description: Unique identifier for the source maqam
 *                 example: "maqam_bayati"
 *               firstNote:
 *                 type: string
 *                 description: Starting note name for modulation analysis
 *                 example: "rāst"
 *               tonic:
 *                 type: string
 *                 description: Tonic note for the modulation context
 *                 example: "dūgāh"
 *               ajnasModulationsMode:
 *                 type: boolean
 *                 description: Enable ajnas-based modulation analysis
 *                 example: true
 *               centsTolerance:
 *                 type: number
 *                 description: Acceptable deviation in cents for pitch matching
 *                 example: 10
 *                 minimum: 0
 *                 maximum: 50
 *             required:
 *               - tuningSystemID
 *               - maqamID
 *               - tonic
 *     responses:
 *       200:
 *         description: Modulation analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 maqamatModulations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       targetMaqamID:
 *                         type: string
 *                         description: ID of destination maqam
 *                       modulationType:
 *                         type: string
 *                         description: Type of modulation (direct, pivot, etc.)
 *                       commonTones:
 *                         type: array
 *                         items:
 *                           type: object
 *                         description: Shared pitch classes
 *                       transitionPath:
 *                         type: array
 *                         items:
 *                           type: object
 *                         description: Step-by-step modulation pathway
 *                   description: Possible maqam-to-maqam modulations
 *                 ajnasModulations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       jinsID:
 *                         type: string
 *                         description: ID of target jins
 *                       modulationDegree:
 *                         type: number
 *                         description: Scale degree for modulation
 *                       intervalPattern:
 *                         type: array
 *                         items:
 *                           type: number
 *                         description: Interval sequence in cents
 *                   description: Possible ajnas-based modulations
 *                 analysisContext:
 *                   type: object
 *                   properties:
 *                     sourceMaqam:
 *                       type: object
 *                       description: Source maqam details
 *                     tuningSystem:
 *                       type: object
 *                       description: Tuning system context
 *                     tonic:
 *                       type: string
 *                       description: Reference tonic note
 *                   description: Context information for the analysis
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   examples:
 *                     - "tuningSystemID (string) is required"
 *                     - "maqamID (string) is required"
 *                     - "tonic (string) is required"
 *                     - "Invalid tuningSystemID"
 *                     - "Invalid maqamID"
 *                     - "Invalid firstNote"
 *       500:
 *         description: Server error during modulation calculation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to calculate modulations"
 */
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
      for (const setOfNotes of selectedTuningSystem.getNoteNameSets()) {
        if (setOfNotes[0] === firstNote) {
          noteNames = setOfNotes;
          break;
        }
      }
      if (noteNames.length === 0) {
        return NextResponse.json({ error: "Invalid firstNote" }, { status: 400 });
      }
    } else {
      if (selectedTuningSystem.getNoteNameSets().length > 0) {
        noteNames = selectedTuningSystem.getNoteNameSets()[0];
      } else {
        return NextResponse.json({ error: "No note names available" }, { status: 400 });
      }
    }

    // Validate pitch class type
    const pitchClassType = detectPitchClassValueType(selectedTuningSystem.getOriginalPitchClassValues());
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
