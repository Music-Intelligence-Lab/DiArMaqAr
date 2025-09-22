import { NextResponse } from "next/server";
import { getTuningSystems, getMaqamat, getAjnas } from "@/functions/import";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { getMaqamTranspositions } from "@/functions/transpose";
import { englishify } from "@/functions/export";
import modulate from "@/functions/modulate";

export async function POST(request: Request) {
  const { maqamID, maqamName, includeTranspositions, qararNoteName, centsTolerance, tuningSystemId, tuningSystemStartingNoteName, includeMaqamatModulations, includeAjnasModulations } =
    await request.json();

  const inputCentsTolerance = typeof centsTolerance === "number" ? centsTolerance : 5;

  if (includeTranspositions !== true && includeTranspositions !== false) {
    return new NextResponse("Invalid includeTranspositions value.", { status: 400 });
  }

  const inputQararNoteName = typeof qararNoteName === "string" ? qararNoteName : null;

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

  // Filter tuning systems if tuningSystemId is provided
  const filteredTuningSystems = tuningSystemId ? tuningSystems.filter((ts) => ts.getId() === tuningSystemId) : tuningSystems;

  // Check if specific tuning system was requested but not found
  if (tuningSystemId && filteredTuningSystems.length === 0) {
    return new NextResponse("Tuning system not found.", { status: 404 });
  }

  // Validate tuningSystemStartingNoteName if provided
  if (tuningSystemStartingNoteName && tuningSystemId) {
    const selectedTuningSystem = filteredTuningSystems[0];
    const availableStartingNotes = selectedTuningSystem.getNoteNameSets().map((list) => list[0]);

    if (!availableStartingNotes.some((noteName) => englishify(noteName) === englishify(tuningSystemStartingNoteName))) {
      return new NextResponse(
        `Starting note name '${tuningSystemStartingNoteName}' not available for tuning system '${tuningSystemId}'. Available starting notes: ${availableStartingNotes.join(", ")}.`,
        { status: 400 }
      );
    }
  } else if (tuningSystemStartingNoteName && !tuningSystemId) {
    return new NextResponse("tuningSystemStartingNoteName requires tuningSystemId to be specified.", { status: 400 });
  }

  // Find maqam by ID or name
  let maqam;
  if (hasMaqamID) {
    maqam = maqamat.find((m) => m.getId() === maqamID);
    if (!maqam) {
      return new NextResponse("Maqam not found.", { status: 404 });
    }
  } else if (hasMaqamName) {
    maqam = maqamat.find((m) => englishify(m.getName()) === englishify(maqamName));
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
      const filteredStartingNoteNames = tuningSystemStartingNoteName ? startingNoteNames.filter((noteName) => englishify(noteName) === englishify(tuningSystemStartingNoteName)) : startingNoteNames;

      for (const noteName of filteredStartingNoteNames) {
        const tuningSystemPitchClasses = getTuningSystemPitchClasses(tuningSystem, noteName);
        const isMaqamPossible = maqam.isMaqamPossible(tuningSystemPitchClasses.map((pc) => pc.noteName));

        const key = `${tuningSystem.getId()}_${noteName}`;

        if (isMaqamPossible) {
          if (inputQararNoteName) {
            if (tuningSystemPitchClasses.find((pc) => englishify(pc.noteName) === englishify(inputQararNoteName))) {
              const transpositions = getMaqamTranspositions(tuningSystemPitchClasses, ajnas, maqam, true, inputCentsTolerance);
              const transposition = transpositions.find((t) => englishify(t.ascendingPitchClasses[0].noteName) === englishify(inputQararNoteName));

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

                if (includeTranspositions) {
                  resultTuningSystems[key] = transpositions;
                } else {
                  resultTuningSystems[key] = transposition;
                }
              }
            }
          } else {
            if (includeTranspositions) {
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
