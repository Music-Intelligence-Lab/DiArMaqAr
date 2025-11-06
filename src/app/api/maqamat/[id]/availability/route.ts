import { NextResponse } from "next/server";
import { getMaqamat, getTuningSystems, getAjnas } from "@/functions/import";
import { standardizeText } from "@/functions/export";
import { handleCorsPreflightRequest, addCorsHeaders } from "@/app/api/cors";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { calculateMaqamTranspositions } from "@/functions/transpose";
import { parseInArabic, getMaqamNameDisplayAr, getNoteNameDisplayAr, getTuningSystemDisplayNameAr } from "@/app/api/arabic-helpers";
import {
  buildEntityNamespace,
  buildIdentifierNamespace,
  buildLinksNamespace,
  buildListResponse,
  buildStringArrayNamespace
} from "@/app/api/response-shapes";

export const OPTIONS = handleCorsPreflightRequest;

/**
 * GET /api/maqamat/[id]/availability
 * 
 * Check Maqam Availability in Tuning Systems
 * 
 * Returns which tuning systems support a specific maqām. If transpositionNoteName is provided,
 * filters results to show only tuning systems where the maqām can be transposed to that specific note.
 * 
 * Availability checking spans 3 octaves to correctly handle maqāmāt with more than 7 pitch classes.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const transpositionNoteName = searchParams.get("transpositionNoteName");
    
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

    const maqamatData = getMaqamat();
    const tuningSystems = getTuningSystems();

    // Await params in Next.js 15
    const { id: maqamId } = await Promise.resolve(params);
    
    // Find the maqām by ID or name
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

    // Validate transpositionNoteName if provided
    if (transpositionNoteName !== null && transpositionNoteName.trim() === "") {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "Invalid parameter: transpositionNoteName",
            message: "The 'transpositionNoteName' parameter cannot be empty.",
            hint: "Provide a valid note name like ?transpositionNoteName=nawa or remove the parameter"
          },
          { status: 400 }
        )
      );
    }

    // Calculate availability - which tuning systems support this maqām
    // A tuning system is available if ANY of its note name sets can realize the maqām
    // Use shifted note name sets (3 octaves) to handle non-octave-repeating maqāmāt
    const ajnas = getAjnas();
    const availableTuningSystems: any[] = [];
    
    for (const tuningSystem of tuningSystems) {
      // Get both the original note name sets and their 3-octave expansions
      const noteNameSets = tuningSystem.getNoteNameSets();
      const shiftedNoteNameSets = tuningSystem.getNoteNameSetsWithAdjacentOctaves();
      
      // Track which tuning system starting note names work for this maqām
      const validTuningSystemStartingNoteNames: string[] = [];
      
      for (let i = 0; i < shiftedNoteNameSets.length; i++) {
        if (maqam.isMaqamPossible(shiftedNoteNameSets[i])) {
          // The first note in the original (non-shifted) set is the tuning system starting note name
          const tuningSystemStartingNoteName = noteNameSets[i]?.[0];
          if (tuningSystemStartingNoteName && !validTuningSystemStartingNoteNames.includes(tuningSystemStartingNoteName)) {
            // If transpositionNoteName is specified, check if this transposition is valid
            if (transpositionNoteName) {
              const pitchClasses = getTuningSystemPitchClasses(tuningSystem, tuningSystemStartingNoteName);
              const transpositions = calculateMaqamTranspositions(
                pitchClasses,
                ajnas,
                maqam,
                true,
                5 // default tolerance
              );
              
              // Check if any transposition starts on the requested note (case/diacritics insensitive)
              const hasTransposition = transpositions.some(t => 
                standardizeText(t.ascendingPitchClasses[0].noteName) === standardizeText(transpositionNoteName)
              );
              
              if (hasTransposition) {
                validTuningSystemStartingNoteNames.push(tuningSystemStartingNoteName);
              }
            } else {
              // No transposition filter - just check availability
              validTuningSystemStartingNoteNames.push(tuningSystemStartingNoteName);
            }
          }
        }
      }
      
      if (validTuningSystemStartingNoteNames.length > 0) {
        const tuningSystemNamespace = buildEntityNamespace(
          {
            id: tuningSystem.getId(),
            idName: standardizeText(tuningSystem.getId()),
            displayName: tuningSystem.stringify(),
          },
          {
            version: tuningSystem.getVersion(),
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

        const startingNotesNamespace = buildStringArrayNamespace(
          validTuningSystemStartingNoteNames.map((name) => standardizeText(name)),
          {
            inArabic,
            displayNames: validTuningSystemStartingNoteNames,
            displayNamesAr: inArabic
              ? validTuningSystemStartingNoteNames.map((name) => getNoteNameDisplayAr(name))
              : undefined,
          }
        );

        availableTuningSystems.push({
          tuningSystem: tuningSystemNamespace,
          startingNotes: startingNotesNamespace,
        });
      }
    }

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

    const transpositionNamespace = transpositionNoteName
      ? buildIdentifierNamespace(
          {
            idName: standardizeText(transpositionNoteName),
            displayName: transpositionNoteName,
          },
          {
            inArabic,
            displayAr: inArabic ? getNoteNameDisplayAr(transpositionNoteName) : undefined,
          }
        )
      : null;

    const availabilityList = buildListResponse(availableTuningSystems, {
      meta: {
        filteredByTransposition: Boolean(transpositionNoteName),
      },
    });

    const response = NextResponse.json({
      maqam: maqamNamespace,
      ...(transpositionNamespace && { filters: { transpositionNote: transpositionNamespace } }),
      availability: availabilityList,
      links: buildLinksNamespace({
        self: request.url,
        detail: `/api/maqamat/${maqam.getIdName()}`,
        compare: `/api/maqamat/${maqam.getIdName()}/compare`,
      }),
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error in GET /api/maqamat/[id]/availability:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to retrieve availability" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}
