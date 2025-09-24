import { NextResponse } from "next/server";
import { getTuningSystems, getAjnas } from "@/functions/import";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { getJinsTranspositions } from "@/functions/transpose";
import { englishify } from "@/functions/export";

/**
 * @swagger
 * /api/jins:
 *   post:
 *     summary: Analyze a specific jins
 *     description: Analyze a specific jins within tuning systems, including transpositions and pitch class analysis.
 *     tags:
 *       - Jins
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jinsID:
 *                 type: string
 *                 description: Unique identifier for the jins (mutually exclusive with jinsName)
 *                 example: "1"
 *               jinsName:
 *                 type: string
 *                 description: Name of the jins (mutually exclusive with jinsID)
 *                 example: "jins bayyāt"
 *               includeTranspositions:
 *                 type: boolean
 *                 description: Whether to include all transpositions (ignored if newTonicForTransposition is specified). Defaults to false.
 *                 example: true
 *               newTonicForTransposition:
 *                 type: string
 *                 description: If specified, returns only the transposition to this tonic note (overrides includeTranspositions)
 *                 example: "dūgāh"
 *               centsTolerance:
 *                 type: number
 *                 description: Tolerance value used as (+/-) for calculating possible transpositions within tuning systems that aren't based on frequency ratio fractions (e.g. 9/8, 4/3, 3/2) in their core data (0-50, default: 5)
 *                 example: 5
 *               tuningSystemID:
 *                 type: string
 *                 description: Specific tuning system to analyze
 *                 example: "Ronzevalle-(1904)"
 *               tuningSystemStartingNoteName:
 *                 type: string
 *                 description: Starting note name for tuning system note naming convention (must match first element in tuning system). If not provided, defaults to the first available note naming convention in the tuning system core data. This parameter affects the theoretical framework used for jins analysis.
 *                 example: "ʿushayrān"
 *             required:
 *               - includeTranspositions
 *             oneOf:
 *               - required: [jinsID]
 *               - required: [jinsName]
 *     responses:
 *       200:
 *         description: Jins analysis completed successfully
 *       400:
 *         description: Invalid request parameters
 *       404:
 *         description: Jins or tuning system not found
 */
export async function POST(request: Request) {
  const { jinsID, jinsName, includeTranspositions, newTonicForTransposition, centsTolerance, tuningSystemID, tuningSystemStartingNoteName } = await request.json();

  const inputCentsTolerance = typeof centsTolerance === "number" ? centsTolerance : 5;

  // Set default value for includeTranspositions if not provided
  const inputIncludeTranspositions = includeTranspositions === undefined ? false : includeTranspositions;
  
  if (inputIncludeTranspositions !== true && inputIncludeTranspositions !== false) {
    return new NextResponse("Invalid includeTranspositions value.", { status: 400 });
  }

  const inputNewTonicForTransposition = typeof newTonicForTransposition === "string" ? newTonicForTransposition : null;

  // Validate jins identification - user must provide exactly one of jinsID or jinsName
  const hasJinsID = jinsID !== undefined && jinsID !== null && jinsID !== "";
  const hasJinsName = jinsName !== undefined && jinsName !== null && jinsName !== "";

  if (!hasJinsID && !hasJinsName) {
    return new NextResponse("Either jinsID or jinsName must be provided.", { status: 400 });
  }

  if (hasJinsID && hasJinsName) {
    return new NextResponse("Cannot provide both jinsID and jinsName. Please provide only one.", { status: 400 });
  }

  const tuningSystems = getTuningSystems();
  const ajnas = getAjnas();

  // Filter tuning systems if tuningSystemID is provided
  const filteredTuningSystems = tuningSystemID ? tuningSystems.filter((ts) => ts.getId() === tuningSystemID) : tuningSystems;

  // Check if specific tuning system was requested but not found
  if (tuningSystemID && filteredTuningSystems.length === 0) {
    return new NextResponse("Tuning system not found.", { status: 404 });
  }

  // Validate tuningSystemStartingNoteName if provided
  if (tuningSystemStartingNoteName && tuningSystemID) {
    const selectedTuningSystem = filteredTuningSystems[0];
    const availableStartingNotes = selectedTuningSystem.getNoteNameSets().map((list) => list[0]);

    if (!availableStartingNotes.some((noteName) => englishify(noteName) === englishify(tuningSystemStartingNoteName))) {
      return new NextResponse(
        `Starting note name '${tuningSystemStartingNoteName}' not available for tuning system '${tuningSystemID}'. Available starting notes: ${availableStartingNotes.join(", ")}.`,
        { status: 400 }
      );
    }
  } else if (tuningSystemStartingNoteName && !tuningSystemID) {
    return new NextResponse("tuningSystemStartingNoteName requires tuningSystemID to be specified.", { status: 400 });
  }

  // Find jins by ID or name
  let jins;
  if (hasJinsID) {
    jins = ajnas.find((j) => j.getId() === jinsID);
    if (!jins) {
      return new NextResponse("Jins not found.", { status: 404 });
    }
  } else if (hasJinsName) {
    jins = ajnas.find((j) => englishify(j.getName()) === englishify(jinsName));
    if (!jins) {
      return new NextResponse("Jins not found.", { status: 404 });
    }
  }

  if (!jins) {
    return new NextResponse("Jins not found.", { status: 404 });
  }

  try {
    const result: { [key: string]: any } = {};

    result["jins"] = jins;

    const resultTuningSystems: { [key: string]: any } = {};

    result["tuningSystems"] = resultTuningSystems;

    for (const tuningSystem of filteredTuningSystems) {
      const startingNoteNames = tuningSystem.getNoteNameSets().map((list) => list[0]);

      // Filter starting note names if tuningSystemStartingNoteName is provided
      const filteredStartingNoteNames = tuningSystemStartingNoteName ? startingNoteNames.filter((noteName) => englishify(noteName) === englishify(tuningSystemStartingNoteName)) : startingNoteNames;

      for (const noteName of filteredStartingNoteNames) {
        const tuningSystemPitchClasses = getTuningSystemPitchClasses(tuningSystem, noteName);
        const isJinsPossible = jins.isJinsPossible(tuningSystemPitchClasses.map((pc) => pc.noteName));

        const key = `${tuningSystem.getId()}_${noteName}`;

        if (isJinsPossible) {
          if (inputNewTonicForTransposition) {
            if (tuningSystemPitchClasses.find((pc) => englishify(pc.noteName) === englishify(inputNewTonicForTransposition))) {
              const transpositions = getJinsTranspositions(tuningSystemPitchClasses, jins, true, inputCentsTolerance);
              const transposition = transpositions.find((t) => englishify(t.jinsPitchClasses[0].noteName) === englishify(inputNewTonicForTransposition));

              if (transposition) {
                // When specific tonic is requested, return only that transposition
                resultTuningSystems[key] = transposition;
              }
            }
          } else {
            // When no specific tonic is requested, use includeTranspositions flag
            if (inputIncludeTranspositions) {
              const transpositions = getJinsTranspositions(tuningSystemPitchClasses, jins, true, inputCentsTolerance);
              resultTuningSystems[key] = transpositions;
            } else {
              const jinsAnalysis = jins.getTahlil(tuningSystemPitchClasses);
              resultTuningSystems[key] = jinsAnalysis;
            }
          }
        }
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error loading Jins:", error);
    return new NextResponse("Failed to load Jins.", { status: 500 });
  }
}
