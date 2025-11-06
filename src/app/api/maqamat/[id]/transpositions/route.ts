import { NextResponse } from "next/server";
import { getMaqamat, getAjnas, getTuningSystems } from "@/functions/import";
import { standardizeText } from "@/functions/export";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { calculateMaqamTranspositions } from "@/functions/transpose";
import { handleCorsPreflightRequest, addCorsHeaders } from "@/app/api/cors";
import { parseInArabic, getMaqamNameDisplayAr, getNoteNameDisplayAr, getTuningSystemDisplayNameAr } from "@/app/api/arabic-helpers";
import {
  buildEntityNamespace,
  buildIdentifierNamespace,
  buildLinksNamespace,
  buildStringArrayNamespace
} from "@/app/api/response-shapes";

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
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const tuningSystemId = searchParams.get("tuningSystem");
    const startingNote = searchParams.get("startingNote");
    
    // Parse inArabic parameter
    let inArabic = false;
    try {
      inArabic = parseInArabic(searchParams);
    } catch (error) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: error instanceof Error ? error.message : "Invalid inArabic parameter",
            hint: "Use ?inArabic=true or ?inArabic=false"
          },
          { status: 400 }
        )
      );
    }

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

    // Build transpositions list with tonicId (URL-safe) and tonicName (with diacritics or Arabic)
    const transpositionItems = transpositions.map((t) => {
      const tonicNoteName = t.ascendingPitchClasses[0].noteName;
      const tonicNamespace = buildIdentifierNamespace(
        {
          idName: standardizeText(tonicNoteName),
          displayName: tonicNoteName,
        },
        {
          inArabic,
          displayAr: inArabic ? getNoteNameDisplayAr(tonicNoteName) : undefined,
        }
      );

      const pitchClassNamespace = {
        pitchClassIndex: t.ascendingPitchClasses[0].pitchClassIndex,
        octave: t.ascendingPitchClasses[0].octave,
      };

      return {
        tonic: tonicNamespace,
        pitchClass: pitchClassNamespace,
        links: buildLinksNamespace({
          detail: `/api/maqamat/${maqam.getIdName()}?tuningSystem=${encodeURIComponent(tuningSystemId)}&startingNote=${encodeURIComponent(actualStartingNote)}&transposeTo=${standardizeText(tonicNoteName)}`
        })
      };
    });

    // Get single octave pitch class count (from original pitch class values, not note name sets which may include multiple octaves)
    const pitchClassesInSingleOctave = tuningSystem.getOriginalPitchClassValues().length;

    const maqamNamespace = buildEntityNamespace(
      {
        id: maqam.getId(),
        idName: maqam.getIdName(),
        displayName: maqam.getName(),
      },
      {
        version: maqam.getVersion(),
        inArabic,
        displayNameAr: inArabic ? getMaqamNameDisplayAr(maqam.getName()) : undefined,
      }
    );

    const tuningSystemNamespace = buildEntityNamespace(
      {
        id: tuningSystem.getId(),
        idName: standardizeText(tuningSystem.getId()),
        displayName: tuningSystem.stringify(),
      },
      {
        version: tuningSystem.getVersion(),
        extras: {
          numberOfPitchClassesSingleOctave: pitchClassesInSingleOctave,
        },
        inArabic,
        displayNameAr: inArabic
          ? getTuningSystemDisplayNameAr(
              tuningSystem.getCreatorArabic() || "",
              tuningSystem.getCreatorEnglish() || "",
              tuningSystem.getYear(),
              tuningSystem.getTitleArabic() || "",
              tuningSystem.getTitleEnglish() || ""
            )
          : undefined,
      }
    );

    const startingNoteNamespace = buildIdentifierNamespace(
      {
        idName: standardizeText(actualStartingNote),
        displayName: actualStartingNote,
      },
      {
        inArabic,
        displayAr: inArabic ? getNoteNameDisplayAr(actualStartingNote) : undefined,
      }
    );

    const transpositionSummary = buildStringArrayNamespace(
      transpositions.map((t) => standardizeText(t.ascendingPitchClasses[0].noteName)),
      {
        inArabic,
        displayNames: transpositions.map((t) => t.ascendingPitchClasses[0].noteName),
        displayNamesAr: inArabic
          ? transpositions.map((t) => getNoteNameDisplayAr(t.ascendingPitchClasses[0].noteName))
          : undefined,
      }
    );

    const response = NextResponse.json({
      maqam: maqamNamespace,
      tuningSystem: tuningSystemNamespace,
      startingNote: startingNoteNamespace,
      transpositions: {
        total: transpositionItems.length,
        options: transpositionSummary,
        detailed: transpositionItems,
      },
      links: buildLinksNamespace({
        self: `/api/maqamat/${maqam.getIdName()}/transpositions?tuningSystem=${encodeURIComponent(tuningSystemId)}&startingNote=${encodeURIComponent(actualStartingNote)}`,
        availability: `/api/maqamat/${maqam.getIdName()}/availability`,
        detail: `/api/maqamat/${maqam.getIdName()}`,
      }),
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
