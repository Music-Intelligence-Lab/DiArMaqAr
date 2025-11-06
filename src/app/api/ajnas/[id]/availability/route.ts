import { NextResponse } from "next/server";
import { getAjnas, getTuningSystems } from "@/functions/import";
import { standardizeText } from "@/functions/export";
import { handleCorsPreflightRequest, addCorsHeaders } from "@/app/api/cors";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { calculateJinsTranspositions } from "@/functions/transpose";
import { parseInArabic, getJinsNameDisplayAr, getNoteNameDisplayAr, getTuningSystemDisplayNameAr } from "@/app/api/arabic-helpers";
import {
  buildEntityNamespace,
  buildIdentifierNamespace,
  buildLinksNamespace,
  buildListResponse,
  buildStringArrayNamespace
} from "@/app/api/response-shapes";

export const OPTIONS = handleCorsPreflightRequest;

/**
 * GET /api/ajnas/[id]/availability
 * 
 * Check Jins Availability in Tuning Systems
 * 
 * Returns which tuning systems support a specific jins. If transpositionNoteName is provided,
 * filters results to show only tuning systems where the jins can be transposed to that specific note.
 * 
 * Availability checking spans 3 octaves to correctly handle ajnās that may span multiple octaves.
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

    const ajnasData = getAjnas();
    const tuningSystems = getTuningSystems();

    // Await params in Next.js 15
    const { id: jinsId } = await Promise.resolve(params);
    
    // Find the jins by ID or name
    const jins = ajnasData.find(
      (j) => j.getId() === jinsId || standardizeText(j.getName()) === standardizeText(jinsId)
    );

    if (!jins) {
      return addCorsHeaders(
        NextResponse.json(
          { 
            error: `Jins '${jinsId}' not found`,
            hint: "Use /api/ajnas to see all available ajnās"
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

    // Calculate availability - which tuning systems support this jins
    // A tuning system is available if ANY of its note name sets can realize the jins
    // Use shifted note name sets (3 octaves) to handle ajnās that may span multiple octaves
    const availableTuningSystems: any[] = [];
    
    for (const tuningSystem of tuningSystems) {
      // Get both the original note name sets and their 3-octave expansions
      const noteNameSets = tuningSystem.getNoteNameSets();
      const shiftedNoteNameSets = tuningSystem.getNoteNameSetsWithAdjacentOctaves();
      
      // Track which tuning system starting note names work for this jins
      const validTuningSystemStartingNoteNames: string[] = [];
      
      for (let i = 0; i < shiftedNoteNameSets.length; i++) {
        if (jins.isJinsPossible(shiftedNoteNameSets[i])) {
          // The first note in the original (non-shifted) set is the tuning system starting note name
          const tuningSystemStartingNoteName = noteNameSets[i]?.[0];
          if (tuningSystemStartingNoteName && !validTuningSystemStartingNoteNames.includes(tuningSystemStartingNoteName)) {
            // If transpositionNoteName is specified, check if this transposition is valid
            if (transpositionNoteName) {
              const pitchClasses = getTuningSystemPitchClasses(tuningSystem, tuningSystemStartingNoteName);
              const transpositions = calculateJinsTranspositions(
                pitchClasses,
                jins,
                true,
                5 // default tolerance
              );
              
              // Check if any transposition starts on the requested note (case/diacritics insensitive)
              const hasTransposition = transpositions.some(t => 
                standardizeText(t.jinsPitchClasses[0].noteName) === standardizeText(transpositionNoteName)
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

    const successfulAvailability = buildListResponse(availableTuningSystems, {
      meta: {
        filteredByTransposition: Boolean(transpositionNoteName),
      },
    });

    const jinsNamespace = buildEntityNamespace(
      {
        id: jins.getId(),
        idName: jins.getIdName(),
        displayName: jins.getName(),
      },
      {
        version: jins.getVersion(),
        inArabic,
        displayNameAr: inArabic ? getJinsNameDisplayAr(jins.getName()) : undefined,
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

    const filterPayload = transpositionNamespace
      ? { transpositionNote: transpositionNamespace }
      : undefined;

    const response = NextResponse.json({
      jins: jinsNamespace,
      ...(filterPayload && { filters: filterPayload }),
      availability: successfulAvailability,
      links: buildLinksNamespace({
        self: request.url,
        detail: `/api/ajnas/${jins.getIdName()}`,
        compare: `/api/ajnas/${jins.getIdName()}/compare`,
      }),
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error in GET /api/ajnas/[id]/availability:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to retrieve availability" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

