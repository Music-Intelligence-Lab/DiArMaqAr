import { NextResponse } from "next/server";
import { getTuningSystems, getMaqamat, getAjnas } from "@/functions/import";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { getMaqamTranspositions } from "@/functions/transpose";
import { standardizeText } from "@/functions/export";
import modulate from "@/functions/modulate";

/**
 * @swagger
 * /api/maqam:
 *   post:
 *     summary: Analyze a specific maqam
 *     description: Analyze a specific maqam within tuning systems, including transpositions, modulations, and pitch class analysis.
 *     tags:
 *       - Maqam
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maqamID:
 *                 type: string
 *                 description: Unique identifier for the maqam (mutually exclusive with maqamName)
 *                 example: "1"
 *               maqamName:
 *                 type: string
 *                 description: Name of the maqam (mutually exclusive with maqamID)
 *                 example: "maqam segah"
 *               includeTranspositions:
 *                 type: boolean
 *                 description: Whether to include all transpositions (ignored if newTonicForTransposition is specified). Defaults to false.
 *                 example: false
 *               newTonicForTransposition:
 *                 type: string
 *                 description: If specified, returns only the transposition to this tonic note (overrides includeTranspositions)
 *                 example: "rāst"
 *                 example: false
 *               newTonicForTransposition:
 *                 type: string
 *                 description: New tonic note name for transposing the maqam structure
 *                 example: "rāst"
 *               centsTolerance:
 *                 type: number
 *                 description: Tolerance value used as (+/-) for calculating possible transpositions within tuning systems that aren't based on frequency ratio fractions (e.g. 9/8, 4/3, 3/2) in their core data. This affects the modulation possibilities: more transpositions allow for more modulations (0-50, default: 5)
 *                 example: 5
 *               tuningSystemID:
 *                 type: string
 *                 description: Specific tuning system to analyze
 *                 example: "Ronzevalle-(1904)"
 *               tuningSystemStartingNoteName:
 *                 type: string
 *                 description: Starting note name for tuning system note naming convention (must match first element in tuning system). If not provided, defaults to the first available note naming convention in the tuning system core data. This parameter affects the theoretical framework used for maqam analysis.
 *                 example: "ʿushayrān"
 *               includeMaqamatModulations:
 *                 type: boolean
 *                 description: Include maqam-to-maqam modulations
 *                 example: true
 *               includeAjnasModulations:
 *                 type: boolean
 *                 description: Include ajnas-based modulations
 *                 example: false
 *             required:
 *               - includeTranspositions
 *             oneOf:
 *               - required: [maqamID]
 *               - required: [maqamName]
 *     responses:
 *       200:
 *         description: Maqam analysis completed successfully
 *       400:
 *         description: Invalid request parameters
 *       404:
 *         description: Maqam or tuning system not found
 */
export async function POST(request: Request) {
  const { maqamID, maqamName, includeTranspositions, newTonicForTransposition, centsTolerance, tuningSystemID, tuningSystemStartingNoteName, includeMaqamatModulations, includeAjnasModulations } =
    await request.json();

  const inputCentsTolerance = typeof centsTolerance === "number" ? centsTolerance : 5;

  // Set default value for includeTranspositions if not provided
  const inputIncludeTranspositions = includeTranspositions === undefined ? false : includeTranspositions;
  
  if (inputIncludeTranspositions !== true && inputIncludeTranspositions !== false) {
    return new NextResponse("Invalid includeTranspositions value.", { status: 400 });
  }

  const inputNewTonicForTransposition = typeof newTonicForTransposition === "string" ? newTonicForTransposition : null;

  // Validate maqam identification - user must provide exactly one of maqamID or maqamName
  const hasMaqamID = maqamID !== undefined && maqamID !== null && maqamID !== "";
  const hasMaqamName = maqamName !== undefined && maqamName !== null && maqamName !== "";

  if (!hasMaqamID && !hasMaqamName) {
    return new NextResponse("Either maqamID or maqamName must be provided.", { status: 400 });
  }

  if (hasMaqamID && hasMaqamName) {
    return new NextResponse("Cannot provide both maqamID and maqamName. Please provide only one.", { status: 400 });
  }

  //add a check to make srue the note name exists

  const tuningSystems = getTuningSystems();
  const maqamat = getMaqamat();
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

    if (!availableStartingNotes.some((noteName) => standardizeText(noteName) === standardizeText(tuningSystemStartingNoteName))) {
      return new NextResponse(
        `Starting note name '${tuningSystemStartingNoteName}' not available for tuning system '${tuningSystemID}'. Available starting notes: ${availableStartingNotes.join(", ")}.`,
        { status: 400 }
      );
    }
  } else if (tuningSystemStartingNoteName && !tuningSystemID) {
    return new NextResponse("tuningSystemStartingNoteName requires tuningSystemID to be specified.", { status: 400 });
  }

  // Find maqam by ID or name
  let maqam;
  if (hasMaqamID) {
    maqam = maqamat.find((m) => m.getId() === maqamID);
    if (!maqam) {
      return new NextResponse("Maqam not found.", { status: 404 });
    }
  } else if (hasMaqamName) {
    maqam = maqamat.find((m) => standardizeText(m.getName()) === standardizeText(maqamName));
    if (!maqam) {
      return new NextResponse("Maqam not found.", { status: 404 });
    }
  }

  if (!maqam) {
    return new NextResponse("Maqam not found.", { status: 404 });
  }
  try {
    const result: { [key: string]: any } = {};

    result["maqam"] = maqam;

    const resultTuningSystems: { [key: string]: any } = {};

    result["tuningSystems"] = resultTuningSystems;

    for (const tuningSystem of filteredTuningSystems) {
      const startingNoteNames = tuningSystem.getNoteNameSets().map((list) => list[0]);

      // Filter starting note names if tuningSystemStartingNoteName is provided
      const filteredStartingNoteNames = tuningSystemStartingNoteName ? startingNoteNames.filter((noteName) => standardizeText(noteName) === standardizeText(tuningSystemStartingNoteName)) : startingNoteNames;

      for (const noteName of filteredStartingNoteNames) {
        const tuningSystemPitchClasses = getTuningSystemPitchClasses(tuningSystem, noteName);
        const isMaqamPossible = maqam.isMaqamPossible(tuningSystemPitchClasses.map((pc) => pc.noteName));

        const key = `${tuningSystem.getId()}_${noteName}`;

        if (isMaqamPossible) {
          if (inputNewTonicForTransposition) {
            if (tuningSystemPitchClasses.find((pc) => standardizeText(pc.noteName) === standardizeText(inputNewTonicForTransposition))) {
              const transpositions = getMaqamTranspositions(tuningSystemPitchClasses, ajnas, maqam, true, inputCentsTolerance);
              const transposition = transpositions.find((t) => standardizeText(t.ascendingPitchClasses[0].noteName) === standardizeText(inputNewTonicForTransposition));

              if (transposition) {
                // Add modulations if requested
                if (includeMaqamatModulations || includeAjnasModulations) {
                  if (includeMaqamatModulations) {
                    const maqamatModulations = modulate(tuningSystemPitchClasses, ajnas, maqamat, transposition, false, inputCentsTolerance);
                    (transposition as any).maqamatModulations = {
                      modulationsOnOne: maqamatModulations.modulationsOnOne.map((m: any) => m.name),
                      modulationsOnThree: maqamatModulations.modulationsOnThree.map((m: any) => m.name),
                      modulationsOnThree2p: maqamatModulations.modulationsOnThree2p.map((m: any) => m.name),
                      modulationsOnFour: maqamatModulations.modulationsOnFour.map((m: any) => m.name),
                      modulationsOnFive: maqamatModulations.modulationsOnFive.map((m: any) => m.name),
                      modulationsOnSixAscending: maqamatModulations.modulationsOnSixAscending.map((m: any) => m.name),
                      modulationsOnSixDescending: maqamatModulations.modulationsOnSixDescending.map((m: any) => m.name),
                      modulationsOnSixNoThird: maqamatModulations.modulationsOnSixNoThird.map((m: any) => m.name),
                      noteName2p: maqamatModulations.noteName2p,
                    };
                  }

                  if (includeAjnasModulations) {
                    const ajnasModulations = modulate(tuningSystemPitchClasses, ajnas, maqamat, transposition, true, inputCentsTolerance);
                    (transposition as any).ajnasModulations = {
                      modulationsOnOne: ajnasModulations.modulationsOnOne.map((j: any) => j.name),
                      modulationsOnThree: ajnasModulations.modulationsOnThree.map((j: any) => j.name),
                      modulationsOnThree2p: ajnasModulations.modulationsOnThree2p.map((j: any) => j.name),
                      modulationsOnFour: ajnasModulations.modulationsOnFour.map((j: any) => j.name),
                      modulationsOnFive: ajnasModulations.modulationsOnFive.map((j: any) => j.name),
                      modulationsOnSixAscending: ajnasModulations.modulationsOnSixAscending.map((j: any) => j.name),
                      modulationsOnSixDescending: ajnasModulations.modulationsOnSixDescending.map((j: any) => j.name),
                      modulationsOnSixNoThird: ajnasModulations.modulationsOnSixNoThird.map((j: any) => j.name),
                      noteName2p: ajnasModulations.noteName2p,
                    };
                  }
                }

                // When specific tonic is requested, return only that transposition
                resultTuningSystems[key] = transposition;
              }
            }
          } else {
            // When no specific tonic is requested, use includeTranspositions flag
            if (inputIncludeTranspositions) {
              const transpositions = getMaqamTranspositions(tuningSystemPitchClasses, ajnas, maqam, true, inputCentsTolerance);

              // Add modulations to each transposition if requested
              if (includeMaqamatModulations || includeAjnasModulations) {
                for (const transposition of transpositions) {
                  if (includeMaqamatModulations) {
                    const maqamatModulations = modulate(tuningSystemPitchClasses, ajnas, maqamat, transposition, false, inputCentsTolerance);
                    (transposition as any).maqamatModulations = {
                      modulationsOnOne: maqamatModulations.modulationsOnOne.map((m: any) => m.name),
                      modulationsOnThree: maqamatModulations.modulationsOnThree.map((m: any) => m.name),
                      modulationsOnThree2p: maqamatModulations.modulationsOnThree2p.map((m: any) => m.name),
                      modulationsOnFour: maqamatModulations.modulationsOnFour.map((m: any) => m.name),
                      modulationsOnFive: maqamatModulations.modulationsOnFive.map((m: any) => m.name),
                      modulationsOnSixAscending: maqamatModulations.modulationsOnSixAscending.map((m: any) => m.name),
                      modulationsOnSixDescending: maqamatModulations.modulationsOnSixDescending.map((m: any) => m.name),
                      modulationsOnSixNoThird: maqamatModulations.modulationsOnSixNoThird.map((m: any) => m.name),
                      noteName2p: maqamatModulations.noteName2p,
                    };
                  }

                  if (includeAjnasModulations) {
                    const ajnasModulations = modulate(tuningSystemPitchClasses, ajnas, maqamat, transposition, true, inputCentsTolerance);
                    (transposition as any).ajnasModulations = {
                      modulationsOnOne: ajnasModulations.modulationsOnOne.map((j: any) => j.name),
                      modulationsOnThree: ajnasModulations.modulationsOnThree.map((j: any) => j.name),
                      modulationsOnThree2p: ajnasModulations.modulationsOnThree2p.map((j: any) => j.name),
                      modulationsOnFour: ajnasModulations.modulationsOnFour.map((j: any) => j.name),
                      modulationsOnFive: ajnasModulations.modulationsOnFive.map((j: any) => j.name),
                      modulationsOnSixAscending: ajnasModulations.modulationsOnSixAscending.map((j: any) => j.name),
                      modulationsOnSixDescending: ajnasModulations.modulationsOnSixDescending.map((j: any) => j.name),
                      modulationsOnSixNoThird: ajnasModulations.modulationsOnSixNoThird.map((j: any) => j.name),
                      noteName2p: ajnasModulations.noteName2p,
                    };
                  }
                }
              }

              resultTuningSystems[key] = transpositions;
            } else {
              const tahlil = maqam.getTahlil(tuningSystemPitchClasses);
              resultTuningSystems[key] = tahlil;
            }
          }
        }
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error loading Maqam:", error);
    return new NextResponse("Failed to load Maqam.", { status: 500 });
  }
}
