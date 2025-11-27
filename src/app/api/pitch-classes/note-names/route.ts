import { NextResponse } from "next/server";
import { getTuningSystems } from "@/functions/import";
import { standardizeText } from "@/functions/export";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { handleCorsPreflightRequest, addCorsHeaders } from "@/app/api/cors";
import { parseInArabic, getNoteNameDisplayAr } from "@/app/api/arabic-helpers";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import {
  octaveZeroNoteNames,
  octaveOneNoteNames,
  octaveTwoNoteNames,
  octaveThreeNoteNames,
  octaveFourNoteNames,
  getNoteNameIndexAndOctave
} from "@/models/NoteName";
import {
  buildIdentifierNamespace,
  buildLinksNamespace,
  buildListResponse
} from "@/app/api/response-shapes";

export const OPTIONS = handleCorsPreflightRequest;

// Force dynamic rendering to process query parameters at runtime
export const dynamic = "force-dynamic";

/**
 * GET /api/pitch-classes/note-names
 * 
 * Returns all note names used in the app, bilingually, sortable by note name order or alphabetically.
 * 
 * Query Parameters:
 * - sortBy: "order" (default) or "alphabetical" - Sort order
 * - includeArabic: true/false - Include Arabic display names (default: true)
 * - filterByTuningSystem: Optional tuning system ID to filter note names that exist in that system
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sortBy") || "order";
    const filterByTuningSystem = searchParams.get("filterByTuningSystem");
    
    // Parse includeArabic parameter
    let inArabic = false;
    try {
      inArabic = parseInArabic(searchParams);
    } catch (error) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: error instanceof Error ? error.message : "Invalid includeArabic parameter",
            hint: "Use ?includeArabic=true or ?includeArabic=false"
          },
          { status: 400 }
        )
      );
    }

    // Validate filterByTuningSystem is not empty string
    if (filterByTuningSystem !== null && filterByTuningSystem.trim() === "") {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "Invalid parameter: filterByTuningSystem",
            message: "The 'filterByTuningSystem' parameter cannot be empty. Either omit it or provide a valid tuning system ID.",
            hint: "Remove '?filterByTuningSystem=' from your URL or specify a tuning system like '?filterByTuningSystem=ibnsina_1037'"
          },
          { status: 400 }
        )
      );
    }

    // Get all note names from all octaves
    const allNoteNames = [
      ...octaveZeroNoteNames,
      ...octaveOneNoteNames,
      ...octaveTwoNoteNames,
      ...octaveThreeNoteNames,
      ...octaveFourNoteNames
    ];

    // Get unique note names (note names are unique per octave, but we want unique strings)
    const uniqueNoteNames = Array.from(new Set(allNoteNames));

    // Filter by tuning system if specified
    let filteredNoteNames = uniqueNoteNames;
    if (filterByTuningSystem) {
      const tuningSystems = getTuningSystems();
      const selectedTuningSystem = tuningSystems.find(
        ts => standardizeText(ts.getId()) === standardizeText(filterByTuningSystem)
      );

      if (!selectedTuningSystem) {
        return addCorsHeaders(
          NextResponse.json(
            {
              error: `Tuning system '${filterByTuningSystem}' not found`,
              hint: "Use /api/tuning-systems to see all available tuning systems"
            },
            { status: 404 }
          )
        );
      }

      // Get all note names used in this tuning system across all starting notes and octaves
      const noteNameSets = selectedTuningSystem.getNoteNameSets();
      const tuningSystemNoteNames = new Set<string>();
      
      for (const noteNameSet of noteNameSets) {
        const startingNote = noteNameSet[0];
        if (!startingNote) continue;

        const pitchClasses = getTuningSystemPitchClasses(selectedTuningSystem, startingNote as any);
        for (const pc of pitchClasses) {
          tuningSystemNoteNames.add(pc.noteName);
        }
      }

      filteredNoteNames = uniqueNoteNames.filter(noteName => 
        tuningSystemNoteNames.has(noteName)
      );
    }

    // Build note name data with order (availability is expensive, so it's only in the availability endpoint)
    const noteNamesData = filteredNoteNames.map(noteName => {
      const { octave, index } = getNoteNameIndexAndOctave(noteName);
      const englishName = getEnglishNoteName(noteName);

      return {
        noteName: buildIdentifierNamespace(
          {
            idName: standardizeText(noteName),
            displayName: noteName
          },
          {
            inArabic,
            displayAr: inArabic ? getNoteNameDisplayAr(noteName) : undefined
          }
        ),
        englishName,
        order: index,
        octave,
        links: buildLinksNamespace({
          detail: `/api/pitch-classes/note-names/${standardizeText(noteName)}`,
          availability: `/api/pitch-classes/note-names/${standardizeText(noteName)}/availability`
        })
      };
    });

    // Apply sorting
    if (sortBy === "alphabetical") {
      noteNamesData.sort((a, b) => 
        a.noteName.displayName.localeCompare(b.noteName.displayName)
      );
    } else {
      // Default: sort by order (index), then by octave
      noteNamesData.sort((a, b) => {
        if (a.order !== b.order) {
          return a.order - b.order;
        }
        return a.octave - b.octave;
      });
    }

    const response = NextResponse.json(
      buildListResponse(noteNamesData)
    );

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error in GET /api/pitch-classes/note-names:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to retrieve note names" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

