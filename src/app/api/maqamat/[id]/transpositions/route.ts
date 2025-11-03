import { NextResponse } from "next/server";
import { getMaqamat, getAjnas, getTuningSystems } from "@/functions/import";
import { standardizeText } from "@/functions/export";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { calculateMaqamTranspositions } from "@/functions/transpose";
import { handleCorsPreflightRequest, addCorsHeaders } from "@/app/api/cors";

export const OPTIONS = handleCorsPreflightRequest;

/**
 * GET /api/maqamat/[id]/transpositions
 * 
 * Lists all available transposition options for a specific maqām
 * within a given tuning system and starting note.
 * 
 * Query parameters:
 * - tuningSystem (required): The tuning system ID
 * - startingNote (required): The starting note
 * - octave (optional): Filter to single octave only (default: false, shows all octaves)
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const tuningSystemId = searchParams.get("tuningSystem");
    const startingNote = searchParams.get("startingNote");
    const octaveOnly = searchParams.get("octave") === "true";

    // Validate tuningSystem parameter
    if (tuningSystemId === null) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "tuningSystem parameter is required",
            hint: "Add ?tuningSystem=IbnSina-(1037) to your request. Use /api/maqamat/{id}/availability to see available tuning systems"
          },
          { status: 400 }
        )
      );
    }

    if (tuningSystemId.trim() === "") {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "Invalid parameter: tuningSystem",
            message: "The 'tuningSystem' parameter cannot be empty. Provide a valid tuning system ID.",
            hint: "Specify a tuning system like ?tuningSystem=IbnSina-(1037)"
          },
          { status: 400 }
        )
      );
    }

    // Validate startingNote parameter
    if (startingNote === null) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "startingNote parameter is required",
            hint: "Add &startingNote=yegah to your request. Use /api/maqamat/{id}/availability to see available starting notes"
          },
          { status: 400 }
        )
      );
    }

    if (startingNote.trim() === "") {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "Invalid parameter: startingNote",
            message: "The 'startingNote' parameter cannot be empty. Provide a valid note name.",
            hint: "Specify a starting note like ?startingNote=yegah"
          },
          { status: 400 }
        )
      );
    }

    const maqamatData = getMaqamat();
    const tuningSystems = getTuningSystems();
    const ajnas = getAjnas();

    // Find the maqām
    const maqamId = params.id;
    const maqam = maqamatData.find(
      (m) => m.getId() === maqamId || standardizeText(m.getName()) === standardizeText(maqamId)
    );

    if (!maqam) {
      return addCorsHeaders(
        NextResponse.json(
          { 
            error: `Maqām '${maqamId}' not found`,
            hint: "Use /api/maqamat to see all available maqāmāt"
          },
          { status: 404 }
        )
      );
    }

    // Find the tuning system
    const tuningSystem = tuningSystems.find((ts) => ts.getId() === tuningSystemId);
    if (!tuningSystem) {
      return addCorsHeaders(
        NextResponse.json(
          { 
            error: `Tuning system '${tuningSystemId}' not found`,
            hint: "Use /api/tuning-systems to see all available tuning systems"
          },
          { status: 404 }
        )
      );
    }

    // Verify the starting note is valid for this tuning system
    // Support both with and without diacritics (e.g., "yegāh" or "yegah")
    const noteNameSets = tuningSystem.getNoteNameSets();
    const validNoteSet = noteNameSets.find(
      (set) => standardizeText(set[0]) === standardizeText(startingNote)
    );
    
    if (!validNoteSet) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: `Starting note '${startingNote}' is not valid for tuning system '${tuningSystemId}'`,
            validOptions: noteNameSets.map((set) => set[0])
          },
          { status: 400 }
        )
      );
    }
    
    // Use the actual note name from the tuning system (with diacritics)
    const actualStartingNote = validNoteSet[0];

    // Check if maqām is possible in this context
    if (!maqam.isMaqamPossible(validNoteSet)) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: `Maqām '${maqam.getName()}' is not possible in tuning system '${tuningSystemId}' with starting note '${actualStartingNote}'`,
            hint: "Use /api/maqamat/{id}/availability to find compatible combinations"
          },
          { status: 400 }
        )
      );
    }

    // Get pitch classes and calculate transpositions
    const pitchClasses = getTuningSystemPitchClasses(tuningSystem, actualStartingNote);
    const transpositions = calculateMaqamTranspositions(
      pitchClasses,
      ajnas,
      maqam,
      true,
      5 // default tolerance
    );

    // Group by tonic note for single-octave view
    let transpositionsList;
    
    if (octaveOnly) {
      // Group by tonic pitch class and take first occurrence
      const seenTonicIndices = new Set();
      transpositionsList = transpositions
        .filter((t) => {
          const tonicIndex = t.ascendingPitchClasses[0].pitchClassIndex % pitchClasses.length;
          if (seenTonicIndices.has(tonicIndex)) {
            return false;
          }
          seenTonicIndices.add(tonicIndex);
          return true;
        })
        .map((t) => ({
          tonic: t.ascendingPitchClasses[0].noteName,
          tonicFrequency: parseFloat(t.ascendingPitchClasses[0].frequency),
          tonicCents: parseFloat(t.ascendingPitchClasses[0].cents),
          pitchClassIndex: t.ascendingPitchClasses[0].pitchClassIndex,
          octave: t.ascendingPitchClasses[0].octave,
          dataHref: `/api/maqamat/${maqamId}?tuningSystem=${tuningSystemId}&startingNote=${actualStartingNote}&transpose=${t.ascendingPitchClasses[0].noteName}`
        }));
    } else {
      // All transpositions across all octaves
      transpositionsList = transpositions.map((t) => ({
        tonic: t.ascendingPitchClasses[0].noteName,
        tonicFrequency: parseFloat(t.ascendingPitchClasses[0].frequency),
        tonicCents: parseFloat(t.ascendingPitchClasses[0].cents),
        pitchClassIndex: t.ascendingPitchClasses[0].pitchClassIndex,
        octave: t.ascendingPitchClasses[0].octave,
        dataHref: `/api/maqamat/${maqamId}?tuningSystem=${tuningSystemId}&startingNote=${actualStartingNote}&transpose=${t.ascendingPitchClasses[0].noteName}`
      }));
    }

    const response = NextResponse.json({
      maqam: {
        id: maqam.getId(),
        name: maqam.getName(),
        version: maqam.getVersion()
      },
      context: {
        tuningSystem: {
          id: tuningSystemId,
          name: tuningSystem.getTitleEnglish(),
          version: tuningSystem.getVersion()
        },
        startingNote: actualStartingNote,
        pitchClassesInOctave: pitchClasses.length
      },
      transpositions: {
        total: transpositionsList.length,
        octaveOnly: octaveOnly,
        list: transpositionsList
      },
      links: {
        self: `/api/maqamat/${maqamId}/transpositions?tuningSystem=${tuningSystemId}&startingNote=${actualStartingNote}${octaveOnly ? '&octave=true' : ''}`,
        availability: `/api/maqamat/${maqamId}/availability`,
        maqam: `/api/maqamat/${maqamId}`
      }
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error in GET /api/maqamat/[id]/transpositions:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to retrieve transpositions" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}
