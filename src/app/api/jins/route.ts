import { NextResponse } from "next/server";
import { getTuningSystems, getAjnas } from "@/functions/import";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { getJinsTranspositions } from "@/functions/transpose";
import { englishify } from "@/functions/export";

export async function POST(request: Request) {
  const { jinsID, jinsName, includeTranspositions, qararNoteName, centsTolerance, tuningSystemId, tuningSystemStartingNoteName } = await request.json();

  const inputCentsTolerance = typeof centsTolerance === "number" ? centsTolerance : 5;

  if (includeTranspositions !== true && includeTranspositions !== false) {
    return new NextResponse("Invalid includeTranspositions value.", { status: 400 });
  }

  const inputQararNoteName = typeof qararNoteName === "string" ? qararNoteName : null;

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
          if (inputQararNoteName) {
            if (tuningSystemPitchClasses.find((pc) => englishify(pc.noteName) === englishify(inputQararNoteName))) {
              const transpositions = getJinsTranspositions(tuningSystemPitchClasses, jins, true, inputCentsTolerance);
              const transposition = transpositions.find((t) => englishify(t.jinsPitchClasses[0].noteName) === englishify(inputQararNoteName));

              if (transposition) {
                if (includeTranspositions) {
                  resultTuningSystems[key] = transpositions;
                } else {
                  resultTuningSystems[key] = transposition;
                }
              }
            }
          } else {
            if (includeTranspositions) {
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
