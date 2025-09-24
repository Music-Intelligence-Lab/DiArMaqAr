import { getTuningSystems, getAjnas, getMaqamat } from "@/functions/import";
import detectPitchClassValueType from "@/functions/detectPitchClassType";
import { NextResponse } from "next/server";
import PitchClass from "@/models/PitchClass";
import { getJinsTranspositions, getMaqamTranspositions } from "@/functions/transpose";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { englishify } from "@/functions/export";

/**
 * @swagger
 * /api/transpose:
 *   post:
 *     summary: Generate transpositions for maqamat and ajnas
 *     description: Calculates all possible transpositions of a maqam or jins within a specified tuning system. This sophisticated algorithm finds optimal pitch class mappings and generates complete transposed sequences with cents tolerance for microtonal accuracy.
 *     tags:
 *       - Transposition
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tuningSystemID:
 *                 type: string
 *                 description: Unique identifier for the target tuning system
 *                 example: "Al-Kindi-(874)"
 *               maqamID:
 *                 type: string
 *                 description: Unique identifier for the maqam to transpose (mutually exclusive with jinsID and maqamName)
 *                 example: "1"
 *               maqamName:
 *                 type: string
 *                 description: Name of the maqam to transpose (mutually exclusive with jinsID and maqamID)
 *                 example: "maqam bayātī"
 *               jinsID:
 *                 type: string
 *                 description: Unique identifier for the jins to transpose (mutually exclusive with maqamID)
 *                 example: "1"
 *               tuningSystemStartingNoteName:
 *                 type: string
 *                 description: Starting note name for tuning system note naming convention (must match first element in tuning system). If not provided, defaults to the first available note naming convention in the tuning system core data. This parameter affects the theoretical framework used for transposition analysis.
 *                 example: "ʿushayrān"
 *               centsTolerance:
 *                 type: number
 *                 description: Tolerance value used as (+/-) for calculating possible transpositions within tuning systems that aren't based on frequency ratio fractions (e.g. 9/8, 4/3, 3/2) in their core data (0-50, default: 5)
 *                 example: 5
 *                 minimum: 0
 *                 maximum: 50
 *             required:
 *               - tuningSystemID
 *               - tuningSystemStartingNoteName
 *               - centsTolerance
 *             oneOf:
 *               - required: [maqamID]
 *               - required: [maqamName]
 *               - required: [jinsID]
 *     responses:
 *       200:
 *         description: Transpositions calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transpositions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       startingPitchClass:
 *                         type: object
 *                         description: The pitch class used as transposition root
 *                       transposedSequence:
 *                         type: array
 *                         items:
 *                           type: object
 *                         description: Complete transposed note sequence
 *                       intervalPattern:
 *                         type: array
 *                         items:
 *                           type: number
 *                         description: Interval pattern in cents
 *                   description: Array of all valid transpositions
 *                 tuningSystem:
 *                   type: object
 *                   description: Target tuning system details
 *                 originalSequence:
 *                   type: object
 *                   description: Original maqam or jins data
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
 *                     - "Either maqamID, maqamName, or jinsID must be provided"
 *                     - "Cannot provide multiple identifiers simultaneously"
 *                     - "tuningSystemStartingNoteName object is required"
 *                     - "centsTolerance must be a positive number"
 *       404:
 *         description: Requested resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   examples:
 *                     - "Tuning system not found"
 *                     - "Maqam not found"
 *                     - "Jins not found"
 *       500:
 *         description: Server error during transposition calculation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to calculate transpositions"
 */
export async function POST(request: Request) {
  try {
    const { tuningSystemID, maqamID, maqamName, jinsID, tuningSystemStartingNoteName, centsTolerance } = await request.json();
    const tuningSystems = getTuningSystems();
    const maqamat = getMaqamat();
    const ajnas = getAjnas();

    if (typeof tuningSystemID !== "string") {
      return NextResponse.json({ error: "tuningSystemID (string) is required" }, { status: 400 });
    }

    // Validate that exactly one identifier is provided
    const hasMaqamID = maqamID !== undefined && maqamID !== null && maqamID !== "";
    const hasMaqamName = maqamName !== undefined && maqamName !== null && maqamName !== "";
    const hasJinsID = jinsID !== undefined && jinsID !== null && jinsID !== "";

    const identifierCount = [hasMaqamID, hasMaqamName, hasJinsID].filter(Boolean).length;
    
    if (identifierCount === 0) {
      return NextResponse.json({ error: "Either maqamID, maqamName, or jinsID must be provided" }, { status: 400 });
    }

    if (identifierCount > 1) {
      return NextResponse.json({ error: "Cannot provide multiple identifiers simultaneously" }, { status: 400 });
    }

    const selectedTuningSystem = tuningSystems.find((ts) => ts.getId() === tuningSystemID);

    if (!selectedTuningSystem) {
      return NextResponse.json({ error: "Invalid tuningSystemID" }, { status: 400 });
    }

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
      if (selectedTuningSystem.getNoteNameSets().length > 0) noteNames = selectedTuningSystem.getNoteNameSets()[0];
      else {
        return NextResponse.json({ error: "No note names available" }, { status: 400 });
      }
    }

    const pitchClassType = detectPitchClassValueType(selectedTuningSystem.getOriginalPitchClassValues());

    if (pitchClassType === "unknown") {
      return NextResponse.json({ error: "Invalid pitch class type" }, { status: 400 });
    }

    const allPitchClasses: PitchClass[] = getTuningSystemPitchClasses(selectedTuningSystem, tuningSystemStartingNoteName);

    if (hasMaqamID) {
      const selectedMaqamData = maqamat.find((maqam) => maqam.getId() === maqamID);
      if (!selectedMaqamData) {
        return NextResponse.json({ error: "Maqam not found" }, { status: 400 });
      }

      const maqamTranspositions = getMaqamTranspositions(allPitchClasses, ajnas, selectedMaqamData, true, centsTolerance ?? 5);

      return NextResponse.json(maqamTranspositions);
    } else if (hasMaqamName) {
      const selectedMaqamData = maqamat.find((maqam) => englishify(maqam.getName()) === englishify(maqamName));
      if (!selectedMaqamData) {
        return NextResponse.json({ error: "Maqam not found" }, { status: 400 });
      }

      const maqamTranspositions = getMaqamTranspositions(allPitchClasses, ajnas, selectedMaqamData, true, centsTolerance ?? 5);

      return NextResponse.json(maqamTranspositions);
    } else if (hasJinsID) {
      const selectedJinsData = ajnas.find((jins) => jins.getId() === jinsID);
      if (!selectedJinsData) {
        return NextResponse.json({ error: "Jins not found" }, { status: 400 });
      }

      const jinsTranspositions = getJinsTranspositions(allPitchClasses, selectedJinsData, true, centsTolerance ?? 5);

      return NextResponse.json(jinsTranspositions);
    }

    return NextResponse.json({
      message: "POST payload received",
      tuningSystemID,
      maqamID: maqamID ?? null,
      maqamName: maqamName ?? null,
      jinsID: jinsID ?? null,
    });
  } catch (error) {
    console.error("Error in POST /api/tuningSystems:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
