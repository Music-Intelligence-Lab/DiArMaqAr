import { getTuningSystems, getAjnas, getMaqamat } from "@/functions/import";
import detectPitchClassValueType from "@/functions/detectPitchClassType";
import { NextResponse } from "next/server";
import PitchClass from "@/models/PitchClass";
import { getJinsTranspositions, getMaqamTranspositions } from "@/functions/transpose";
import getTuningSystemCells from "@/functions/getTuningSystemCells";

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
 *                 example: "24TET_tuning"
 *               maqamID:
 *                 type: string
 *                 description: Unique identifier for the maqam to transpose (mutually exclusive with jinsID)
 *                 example: "maqam_bayati"
 *               jinsID:
 *                 type: string
 *                 description: Unique identifier for the jins to transpose (mutually exclusive with maqamID)
 *                 example: "jins_bayati"
 *               firstNote:
 *                 type: object
 *                 properties:
 *                   numerator:
 *                     type: number
 *                     description: Frequency ratio numerator for starting pitch
 *                   denominator:
 *                     type: number
 *                     description: Frequency ratio denominator for starting pitch
 *                   cents:
 *                     type: number
 *                     description: Cents value of starting pitch
 *                 description: The starting pitch class for transposition calculations
 *                 example: {"numerator": 1, "denominator": 1, "cents": 0}
 *               centsTolerance:
 *                 type: number
 *                 description: Acceptable deviation in cents for pitch matching (microtonal precision)
 *                 example: 10
 *                 minimum: 0
 *                 maximum: 50
 *             required:
 *               - tuningSystemID
 *               - firstNote
 *               - centsTolerance
 *             oneOf:
 *               - required: [maqamID]
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
 *                     - "Either maqamID or jinsID must be provided"
 *                     - "Both maqamID and jinsID cannot be provided simultaneously"
 *                     - "firstNote object is required"
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
      if (selectedTuningSystem.getNoteNameSets().length > 0) noteNames = selectedTuningSystem.getNoteNameSets()[0];
      else {
        return NextResponse.json({ error: "No note names available" }, { status: 400 });
      }
    }

    const pitchClassType = detectPitchClassValueType(selectedTuningSystem.getOriginalPitchClassValues());

    if (pitchClassType === "unknown") {
      return NextResponse.json({ error: "Invalid pitch class type" }, { status: 400 });
    }

    const allPitchClasses: PitchClass[] = getTuningSystemCells(selectedTuningSystem, firstNote);

    if (maqamID) {
      const selectedMaqamData = maqamat.find((maqam) => maqam.getId() === maqamID);
      if (!selectedMaqamData) {
        return NextResponse.json({ error: "Invalid maqamID" }, { status: 400 });
      }

      const maqamTranspositions = getMaqamTranspositions(allPitchClasses, ajnas, selectedMaqamData, true, centsTolerance ?? 5);

      return NextResponse.json(maqamTranspositions);
    } else if (jinsID) {
      const selectedJinsData = ajnas.find((jins) => jins.getId() === jinsID);
      if (!selectedJinsData) {
        return NextResponse.json({ error: "Invalid jinsID" }, { status: 400 });
      }

      const jinsTranspositions = getJinsTranspositions(allPitchClasses, selectedJinsData, true, centsTolerance ?? 5);

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
