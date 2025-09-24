import { getTuningSystems, getAjnas, getMaqamat } from "@/functions/import";
import detectPitchClassValueType from "@/functions/detectPitchClassType";
import { NextResponse } from "next/server";
import PitchClass from "@/models/PitchClass";
import { getMaqamTranspositions } from "@/functions/transpose";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import modulate from "@/functions/modulate";
import { MaqamatModulations } from "@/models/Maqam";
import { AjnasModulations } from "@/models/Jins";
import { englishify } from "@/functions/export";

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
 *                 example: "Ronzevalle-(1904)"
 *               maqamID:
 *                 type: string
 *                 description: Unique identifier for the maqam (mutually exclusive with maqamName)
 *                 example: "2"
 *               maqamName:
 *                 type: string
 *                 description: Name of the maqam (mutually exclusive with maqamID)
 *                 example: "maqām ḥijāz"
 *               tuningSystemStartingNoteName:
 *                 type: string
 *                 description: Starting note name for tuning system note naming convention (must match first element in tuning system). If not provided, defaults to the first available note naming convention in the tuning system core data. This parameter affects the theoretical framework used for modulation analysis.
 *                 example: "ʿushayrān"
 *               noteNameToModulateFrom:
 *                 type: string
 *                 description: Which note name within the maqam to find modulations from
 *                 example: "dūgāh"
 *               ajnasModulationsMode:
 *                 type: boolean
 *                 description: Enable ajnas-based modulation analysis
 *                 example: true
 *               centsTolerance:
 *                 type: number
 *                 description: Tolerance value used as (+/-) for calculating possible transpositions within tuning systems that aren't based on frequency ratio fractions (e.g. 9/8, 4/3, 3/2) in their core data. This affects the modulation possibilities: more transpositions allow for more modulations (0-50, default: 5)
 *                 example: 5
 *                 minimum: 0
 *                 maximum: 50
 *             required:
 *               - tuningSystemID
 *               - noteNameToModulateFrom
 *             oneOf:
 *               - required: [maqamID]
 *               - required: [maqamName]
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
 *                     - "Either maqamID or maqamName must be provided"
 *                     - "Cannot provide both maqamID and maqamName. Please provide only one"
 *                     - "noteNameToModulateFrom (string) is required"
 *                     - "Invalid tuningSystemID"
 *                     - "Maqam not found"
 *                     - "Invalid tuningSystemStartingNoteName"
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
      maqamName,
      tuningSystemStartingNoteName, 
      noteNameToModulateFrom, 
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

    // Validate maqam identification - user must provide exactly one of maqamID or maqamName
    const hasMaqamID = maqamID !== undefined && maqamID !== null && maqamID !== "";
    const hasMaqamName = maqamName !== undefined && maqamName !== null && maqamName !== "";

    if (!hasMaqamID && !hasMaqamName) {
      return NextResponse.json({ error: "Either maqamID or maqamName must be provided" }, { status: 400 });
    }

    if (hasMaqamID && hasMaqamName) {
      return NextResponse.json({ error: "Cannot provide both maqamID and maqamName. Please provide only one" }, { status: 400 });
    }

    if (typeof noteNameToModulateFrom !== "string") {
      return NextResponse.json({ error: "noteNameToModulateFrom (string) is required" }, { status: 400 });
    }

    // Find the tuning system
    const selectedTuningSystem = tuningSystems.find((ts) => ts.getId() === tuningSystemID);
    if (!selectedTuningSystem) {
      return NextResponse.json({ error: "Invalid tuningSystemID" }, { status: 400 });
    }

    // Find the maqam
    let selectedMaqamData;
    if (hasMaqamID) {
      selectedMaqamData = maqamat.find((maqam) => maqam.getId() === maqamID);
      if (!selectedMaqamData) {
        return NextResponse.json({ error: "Maqam not found" }, { status: 400 });
      }
    } else if (hasMaqamName) {
      selectedMaqamData = maqamat.find((maqam) => englishify(maqam.getName()) === englishify(maqamName));
      if (!selectedMaqamData) {
        return NextResponse.json({ error: "Maqam not found" }, { status: 400 });
      }
    }

    // Determine note names to use
    let noteNames: string[] = [];
    if (tuningSystemStartingNoteName) {
      for (const setOfNotes of selectedTuningSystem.getNoteNameSets()) {
        if (setOfNotes[0] === tuningSystemStartingNoteName) {
          noteNames = setOfNotes;
          break;
        }
      }
      if (noteNames.length === 0) {
        return NextResponse.json({ error: "Invalid tuningSystemStartingNoteName" }, { status: 400 });
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
    const allPitchClasses: PitchClass[] = getTuningSystemPitchClasses(selectedTuningSystem, tuningSystemStartingNoteName);

    // Get the maqam transpositions to find the specific transposition with the requested tonic
    const maqamTranspositions = getMaqamTranspositions(
      allPitchClasses, 
      ajnas, 
      selectedMaqamData!, 
      true, 
      centsTolerance ?? 5
    );    // Find the specific transposition that starts with the requested tonic
    const sourceMaqamTransposition = maqamTranspositions.find(
      (maqam) => maqam.ascendingPitchClasses[0]?.noteName === noteNameToModulateFrom
    );

    if (!sourceMaqamTransposition) {
      const maqamIdentifier = hasMaqamID ? maqamID : maqamName;
      return NextResponse.json({ 
        error: `No transposition found for maqam ${maqamIdentifier} with tonic ${noteNameToModulateFrom}` 
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
