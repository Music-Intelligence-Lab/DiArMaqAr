import { NextRequest, NextResponse } from "next/server";
import { getTuningSystems, getMaqamat, getAjnas } from "@/functions/import";
import { standardizeText } from "@/functions/export";
import { calculateMaqamTranspositions } from "@/functions/transpose";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { classifyMaqamFamily } from "@/functions/classifyMaqamFamily";
import { handleCorsPreflightRequest, addCorsHeaders } from "@/app/api/cors";

export const OPTIONS = handleCorsPreflightRequest;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; startingNote: string }> }
) {
  try {
    const { id: tuningSystemId, startingNote: startingNoteParam } = await context.params;

    // Validate that path parameters are not empty
    if (!tuningSystemId || tuningSystemId.trim() === "") {
      const response = NextResponse.json(
        {
          error: "Invalid path parameter: id",
          message: "The tuning system ID cannot be empty.",
          hint: "Provide a valid tuning system ID in the URL path, e.g., /api/tuning-systems/IbnSina-(1037)/yegah/maqamat"
        },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    if (!startingNoteParam || startingNoteParam.trim() === "") {
      const response = NextResponse.json(
        {
          error: "Invalid path parameter: startingNote",
          message: "The starting note cannot be empty.",
          hint: "Provide a valid starting note in the URL path, e.g., /api/tuning-systems/IbnSina-(1037)/yegah/maqamat"
        },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // Get data
    const tuningSystems = getTuningSystems();
    const maqamatData = getMaqamat();
    const ajnas = getAjnas();

    // Find the tuning system
    const tuningSystem = tuningSystems.find(
      (ts: any) => ts.getId() === tuningSystemId
    );

    if (!tuningSystem) {
      const response = NextResponse.json(
        {
          error: "Tuning system not found",
          tuningSystemId,
          hint: "Use GET /api/tuning-systems to see available tuning systems",
        },
        { status: 404 }
      );
      return addCorsHeaders(response);
    }

    // Validate that the startingNote is valid for this tuning system
    const availableTuningSystemStartingNotes = tuningSystem.getNoteNameSets()
      .map((set: string[]) => ({
        id: standardizeText(set[0]),
        display: set[0]
      }));
    
    const normalizedParam = standardizeText(startingNoteParam);
    const isValidStartingNote = availableTuningSystemStartingNotes.some(
      (note: any) => note.id === normalizedParam
    );

    if (!isValidStartingNote) {
      const response = NextResponse.json(
        {
          error: "Invalid starting note",
          message: `The starting note "${startingNoteParam}" is not valid for tuning system ${tuningSystemId}`,
          availableTuningSystemStartingNotes,
          hint: `Valid starting notes for this tuning system: ${availableTuningSystemStartingNotes.map((n: any) => n.display).join(", ")}`,
        },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // Get all note name sets with adjacent octaves for proper maqam checking
    const shiftedSets = tuningSystem.getNoteNameSetsWithAdjacentOctaves();

    // Find all maqamat that are possible in this tuning system
    const availableMaqamat: any[] = [];

    for (const maqam of maqamatData) {
      // Check if maqam is possible in any of the starting notes
      let isPossible = false;
      const availableStartingNotes: string[] = [];

      for (const noteNameSet of shiftedSets) {
        if (maqam.isMaqamPossible(noteNameSet)) {
          isPossible = true;
          // Get the tuning system starting note (first note of middle octave)
          const tuningSystemStartingNote = noteNameSet[noteNameSet.length / 3];
          const standardizedNote = standardizeText(tuningSystemStartingNote);
          if (!availableStartingNotes.includes(standardizedNote)) {
            availableStartingNotes.push(standardizedNote);
          }
        }
      }

      // Filter by the required startingNote parameter (from URL path)
      isPossible = availableStartingNotes.includes(normalizedParam);

      if (isPossible) {
        // Get canonical starting note for classification
        const canonicalStartingNote = maqam.getAscendingNoteNames()[0];
        
        // Get pitch classes for this maqam in this tuning system
        const pitchClasses = getTuningSystemPitchClasses(
          tuningSystem,
          canonicalStartingNote
        );

        // Calculate transpositions and get tahlil
        const transpositions = calculateMaqamTranspositions(
          pitchClasses,
          ajnas,
          maqam,
          true,
          5
        );
        const tahlil = transpositions.find((t: any) => !t.transposition);

        // Skip if no tahlil found (shouldn't happen but TypeScript safety)
        if (!tahlil) {
          continue;
        }

        // Get classification
        const classification = classifyMaqamFamily(tahlil);

        // Check for asymmetric descending
        const ascendingNotes = maqam.getAscendingNoteNames();
        const descendingNotes = maqam.getDescendingNoteNames();
        const hasAsymmetricDescending =
          JSON.stringify(ascendingNotes) !== JSON.stringify(descendingNotes);

        // Check for suyur
        const suyur = maqam.getSuyur();
        const hasSuyur = suyur && suyur.length > 0;

        availableMaqamat.push({
          id: maqam.getId(),
          idName: standardizeText(maqam.getName()),
          displayName: maqam.getName(),
          version: maqam.getVersion(),
          familyId: standardizeText(classification.familyName),
          familyDisplayName: classification.familyName,
          tonicIdName: standardizeText(canonicalStartingNote),
          tonicDisplayName: canonicalStartingNote,
          numberOfPitchClasses: ascendingNotes.length,
          isOctaveRepeating: ascendingNotes.length <= 7,
          hasAsymmetricDescending,
          hasSuyur,
          href: `/api/maqamat/${standardizeText(maqam.getName())}`,
        });
      }
    }

    // Sort by tonic (NoteName.ts order) then alphabetically
    availableMaqamat.sort((a: any, b: any) => {
      // First sort by tonic
      const noteOrder = ["yegah", "asiran", "iraq", "rast", "dugah", "sikah", "jaharkah"];
      const aIndex = noteOrder.indexOf(a.tonicIdName);
      const bIndex = noteOrder.indexOf(b.tonicIdName);
      
      if (aIndex !== -1 && bIndex !== -1 && aIndex !== bIndex) {
        return aIndex - bIndex;
      }
      
      // Then sort alphabetically by display name
      return a.displayName.localeCompare(b.displayName, "ar");
    });

    // Build response
    const response = NextResponse.json({
      tuningSystem: {
        id: tuningSystemId,
        displayName: tuningSystem.stringify(),
        version: tuningSystem.getVersion(),
        year: tuningSystem.getYear(),
        numberOfPitchClassesSingleOctave: tuningSystem.getOriginalPitchClassValues().length,
        tuningSystemStartingNoteName: tuningSystem.getNoteNameSets()
          .find((set: string[]) => standardizeText(set[0]) === normalizedParam)?.[0],
        numberOfAvailableMaqamat: availableMaqamat.length,
      },
      data: availableMaqamat,
      meta: {
        totalMaqamat: availableMaqamat.length,
        totalMaqamatInDatabase: maqamatData.length,
        uniqueTonics: [
          ...new Set(
            availableMaqamat.map((m: any) => m.tonicIdName)
          ),
        ].length,
        uniqueFamilies: [
          ...new Set(availableMaqamat.map((m: any) => m.familyId)),
        ].length,
      },
      context: {
        tuningSystemStartingNote: startingNoteParam,
      },
      links: {
        self: `/api/tuning-systems/${tuningSystemId}/${startingNoteParam}/maqamat`,
        tuningSystemData: `/api/tuning-systems/${tuningSystemId}`,
        allMaqamat: "/api/maqamat",
      },
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error in tuning systems maqamat endpoint:", error);
    const response = NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
