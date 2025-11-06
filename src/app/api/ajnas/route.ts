import { NextResponse } from "next/server";
import { getAjnas, getTuningSystems } from "@/functions/import";
import { standardizeText } from "@/functions/export";
import { addCorsHeaders, handleCorsPreflightRequest } from "@/app/api/cors";
import { safeWriteFile } from "@/app/api/backup-utils";
import path from "path";
import {
  octaveZeroNoteNames,
  octaveOneNoteNames,
  octaveTwoNoteNames,
  octaveThreeNoteNames,
  octaveFourNoteNames
} from "@/models/NoteName";
import {
  parseInArabic,
  getJinsNameDisplayAr,
  getNoteNameDisplayAr,
  getTuningSystemDisplayNameAr
} from "@/app/api/arabic-helpers";
import {
  buildEntityNamespace,
  buildIdentifierNamespace,
  buildLinksNamespace,
  buildListResponse,
  buildStringArrayNamespace
} from "@/app/api/response-shapes";

export const OPTIONS = handleCorsPreflightRequest;

// Force dynamic rendering to process query parameters at runtime
export const dynamic = "force-dynamic";

/**
 * GET /api/ajnas
 * 
 * Returns all ajnās with availability summary statistics.
 * Supports filtering by tonic (first note) and sorting options.
 * 
 * Query Parameters:
 * - filterByTonic: Filter by jins tonic/first note (e.g., "rast", "dugah", "segah")
 * - sortBy: Sort order - "tonic" (by tonic note priority, NoteName.ts order) or "alphabetical" (default, by display name)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tonicFilter = searchParams.get("filterByTonic");
    const sortBy = searchParams.get("sortBy") || "alphabetical";
    const includeSources = searchParams.get("includeSources") !== "false";
    
    // Parse includeArabic parameter
    let inArabic = false;
    try {
      inArabic = parseInArabic(searchParams);
    } catch (error) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: error instanceof Error ? error.message : "Invalid includeArabic parameter",
            hint: "Use ?includeArabic=true or ?inArabic=false"
          },
          { status: 400 }
        )
      );
    }

    // Validate that filter parameters are not empty strings
    if (tonicFilter !== null && tonicFilter.trim() === "") {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "Invalid parameter: filterByTonic",
            message: "The 'filterByTonic' parameter cannot be empty. Either omit it or provide a valid tonic note name.",
            hint: "Remove '?filterByTonic=' from your URL or specify a tonic like '?filterByTonic=rast'"
          },
          { status: 400 }
        )
      );
    }

    const ajnas = getAjnas();
    const tuningSystems = getTuningSystems();

    // Create NoteName order lookup for sorting (all octaves)
    // Use standardized text for note names to handle diacritics (ʿ, ʾ) consistently
    const noteNameOrder = [
      ...octaveZeroNoteNames,
      ...octaveOneNoteNames, 
      ...octaveTwoNoteNames,
      ...octaveThreeNoteNames,
      ...octaveFourNoteNames
    ].map(name => standardizeText(name));
    
    const getNotePriority = (noteName: string) => {
      const index = noteNameOrder.indexOf(noteName);
      return index === -1 ? 999 : index; // Unknown notes go to the end
    };

    // Calculate availability for each jins
    const ajnasWithAvailability = ajnas.map((jins) => {
      type AvailabilityAccumulator = {
        tuningSystem: any;
        startingNoteNames: string[];
      };

      let availableInTuningSystems = 0;
      const availabilityEntries: AvailabilityAccumulator[] = [];

      for (const tuningSystem of tuningSystems) {
        const noteNameSets = tuningSystem.getNoteNameSets();
        const shiftedNoteNameSets = tuningSystem.getNoteNameSetsWithAdjacentOctaves();

        const validTuningSystemStartingNoteNames: string[] = [];

        for (let i = 0; i < shiftedNoteNameSets.length; i++) {
          if (jins.isJinsPossible(shiftedNoteNameSets[i])) {
            const tuningSystemStartingNoteName = noteNameSets[i]?.[0];
            if (tuningSystemStartingNoteName) {
              validTuningSystemStartingNoteNames.push(tuningSystemStartingNoteName);
            }
          }
        }

        if (validTuningSystemStartingNoteNames.length > 0) {
          availableInTuningSystems++;
          availabilityEntries.push({
            tuningSystem,
            startingNoteNames: validTuningSystemStartingNoteNames,
          });
        }
      }

      const noteNames = jins.getNoteNames();
      const tonicDisplayRaw = noteNames[0] || "unknown";
      const tonicIdName = standardizeText(tonicDisplayRaw);
      const numberOfPitchClasses = noteNames.length;
      const idName = jins.getIdName();

      const jinsNamespace = buildEntityNamespace(
        {
          id: jins.getId(),
          idName,
          displayName: jins.getName(),
        },
        {
          version: jins.getVersion(),
          inArabic,
          displayNameAr: inArabic ? getJinsNameDisplayAr(jins.getName()) : undefined,
        }
      );

      const tonicNamespace = buildIdentifierNamespace(
        {
          idName: tonicIdName,
          displayName: tonicDisplayRaw,
        },
        {
          inArabic,
          displayAr: inArabic ? getNoteNameDisplayAr(tonicDisplayRaw) : undefined,
        }
      );

      const availability = availabilityEntries.map(({ tuningSystem, startingNoteNames }) => {
        const startingNoteIdNames = startingNoteNames.map((name) => standardizeText(name));
        const startingNoteDisplayNames = startingNoteNames;
        const startingNoteDisplayNamesAr = inArabic
          ? startingNoteNames.map((name) => getNoteNameDisplayAr(name))
          : undefined;

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

        const startingNotesNamespace = buildStringArrayNamespace(startingNoteIdNames, {
          inArabic,
          displayNames: startingNoteDisplayNames,
          displayNamesAr: startingNoteDisplayNamesAr,
        });

        return {
          tuningSystem: tuningSystemNamespace,
          startingNotes: startingNotesNamespace,
        };
      });

      const result: any = {
        jins: jinsNamespace,
        tonic: tonicNamespace,
        stats: {
          numberOfPitchClasses,
          availableInTuningSystems,
        },
        availability: {
          tuningSystems: availability,
        },
        links: buildLinksNamespace({
          detail: `/api/ajnas/${idName}`,
        }),
      };

      if (includeSources) {
        const sourcePageReferences = jins.getSourcePageReferences();
        const sourceReferences = sourcePageReferences.map((src) => ({
          sourceId: src.sourceId,
          page: src.page,
        }));
        result.sources = sourceReferences;
      }

      return result;
    });

    // Apply filters if provided
    let filteredAjnas = ajnasWithAvailability;
    if (tonicFilter) {
      const normalizedFilter = standardizeText(tonicFilter);
      filteredAjnas = filteredAjnas.filter(
        (j) => j.tonic.idName === normalizedFilter
      );
    }

    // Apply sorting
    if (sortBy === "tonic") {
      // Sort by tonic note priority (NoteName.ts order)
      // Use standardized text for note name comparison to handle diacritics consistently
      filteredAjnas.sort((a, b) => {
        const priorityA = getNotePriority(a.tonic.idName);
        const priorityB = getNotePriority(b.tonic.idName);
        return priorityA - priorityB;
      });
    } else {
      // Default: Sort alphabetically by display name (using standardized text for consistency)
      filteredAjnas.sort((a, b) =>
        standardizeText(a.jins.displayName).localeCompare(standardizeText(b.jins.displayName))
      );
    }

    const response = NextResponse.json(
      buildListResponse(filteredAjnas)
    );

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error in GET /api/ajnas:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to retrieve ajnās" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

/**
 * PUT /api/ajnas
 * 
 * Updates the ajnas database.
 * Accepts an array of ajnas objects and writes them to data/ajnas.json.
 * 
 * Request Body: Array of ajnas objects
 */
export async function PUT(request: Request) {
  try {
    const ajnas = await request.json();
    
    if (!Array.isArray(ajnas)) {
      const errorResponse = NextResponse.json(
        { error: "Invalid request: body must be an array of ajnas" },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse);
    }

    // CRITICAL: Prevent data loss - reject empty arrays
    if (ajnas.length === 0) {
      const errorResponse = NextResponse.json(
        { 
          error: "Cannot save empty array",
          message: "Refusing to save empty array to prevent data loss. If you want to clear all data, use a delete endpoint or explicitly confirm.",
          hint: "This endpoint requires at least one ajnas object"
        },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse);
    }

    // Get the path to data/ajnas.json
    const dataPath = path.join(process.cwd(), "data", "ajnas.json");

    // Write with backup
    const writeResult = safeWriteFile(dataPath, ajnas, true);

    if (!writeResult.success) {
      throw new Error(writeResult.error || "Failed to write file");
    }

    const response = NextResponse.json({
      message: "Ajnas updated successfully",
      count: ajnas.length,
      backupCreated: writeResult.backupPath !== null,
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error updating ajnas:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to update ajnas" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

