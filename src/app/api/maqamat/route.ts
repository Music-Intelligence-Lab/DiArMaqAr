import { NextResponse } from "next/server";
import { getMaqamat, getTuningSystems, getAjnas } from "@/functions/import";
import { standardizeText } from "@/functions/export";
import { addCorsHeaders, handleCorsPreflightRequest } from "@/app/api/cors";
import { safeWriteFile } from "@/app/api/backup-utils";
import path from "path";
import { calculateMaqamTranspositions } from "@/functions/transpose";
import { classifyMaqamFamily } from "@/functions/classifyMaqamFamily";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { 
  octaveZeroNoteNames, 
  octaveOneNoteNames, 
  octaveTwoNoteNames, 
  octaveThreeNoteNames,
  octaveFourNoteNames 
} from "@/models/NoteName";
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
 * GET /api/maqamat
 * 
 * Returns all maqāmāt with availability summary statistics.
 * Supports filtering by family or starting note, and sorting options.
 * 
 * Query Parameters:
 * - filterByFamily: Filter by maqām family (e.g., "rast", "hijaz", "bayat")
 * - filterByTonic: Filter by maqām tonic/first note (e.g., "rast", "dūgāh", "segāh")
 * - sortBy: Sort order - "tonic" (by tonic note priority, NoteName.ts order) or "alphabetical" (default, by display name)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const familyFilter = searchParams.get("filterByFamily");
    const tonicFilter = searchParams.get("filterByTonic");
    const sortBy = searchParams.get("sortBy") || "alphabetical";
    
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

    // Validate that filter parameters are not empty strings
    if (familyFilter !== null && familyFilter.trim() === "") {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "Invalid parameter: filterByFamily",
            message: "The 'filterByFamily' parameter cannot be empty. Either omit it or provide a valid maqām family name.",
            hint: "Remove '?filterByFamily=' from your URL or specify a family like '?filterByFamily=rast'"
          },
          { status: 400 }
        )
      );
    }

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

    const maqamat = getMaqamat();
    const tuningSystems = getTuningSystems();
    const ajnas = getAjnas();

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

    // Calculate availability for each maqām
    const maqamatWithAvailability = maqamat.map((maqam) => {
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
          if (maqam.isMaqamPossible(shiftedNoteNameSets[i])) {
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

      // Classify maqām family using proper jins analysis
      // Use canonical reference tuning system (al-Ṣabbāgh 1954) with maqām's canonical starting note
      let familyDisplay = "unknown";
      let familyId = "unknown";
      
      try {
        // Get canonical reference tuning system
        const referenceTuningSystem = tuningSystems.find(ts => ts.getId() === "al-Sabbagh-(1954)");
        
        if (referenceTuningSystem) {
          // Use the maqām's canonical starting note (first note of ascending scale)
          const ascNotes = maqam.getAscendingNoteNames();
          const canonicalStartingNote = ascNotes[0];
          
          if (canonicalStartingNote) {
            // Get pitch classes starting from the maqām's canonical position
            const pitchClasses = getTuningSystemPitchClasses(
              referenceTuningSystem, 
              canonicalStartingNote as any  // NoteName type
            );
            
            // Calculate transpositions to get ajnas analysis
            const transpositions = calculateMaqamTranspositions(
              pitchClasses,
              ajnas,
              maqam,
              true, // withTahlil
              5    // centsTolerance
            );
            
            // Get the tahlil (original form, not transposed)
            const tahlil = transpositions.find(t => !t.transposition);
            
            if (tahlil) {
              // Use proper classification function
              const classification = classifyMaqamFamily(tahlil);
              familyDisplay = classification.familyName;
              familyId = standardizeText(familyDisplay);
            }
          }
        }
      } catch (error) {
        console.warn(`Could not classify family for maqām ${maqam.getName()}:`, error);
        // Fallback to "unknown" if classification fails
      }

      // Check if has asymmetric descending (different from ascending)
      const ascNotes = maqam.getAscendingNoteNames();
      const descNotes = maqam.getDescendingNoteNames();
      const hasAsymmetricDescending = JSON.stringify(ascNotes) !== JSON.stringify([...descNotes].reverse());

      // Check if has suyūr
      const hasSuyur = maqam.getSuyur().length > 0;
      
      // Get tonic (first note of ascending scale)
      const tonicDisplayRaw = ascNotes[0] || "unknown";
      
      // URL-safe version of tonic (always use transliterated for IDs)
      const tonicId = standardizeText(tonicDisplayRaw);
      
      // Display version of tonic (always transliterated)
      // Count pitch classes (number of unique notes in ascending scale)
      const numberOfPitchClasses = ascNotes.length;
      
      // Determine if octave repeating (follows rule: numberOfPitchClasses <= 7)
      const isOctaveRepeating = numberOfPitchClasses <= 7;

      // Generate idName (standardized URL-safe version - always transliterated)
      const idName = standardizeText(maqam.getName());
      
      // Display name (always transliterated)
      const displayName = maqam.getName();
      
      // Family display (always transliterated)
      const familyDisplayFinal = familyDisplay;
      const maqamNamespace = buildEntityNamespace(
        {
          id: maqam.getId(),
          idName,
          displayName,
        },
        {
          version: maqam.getVersion(),
          inArabic,
          displayNameAr: inArabic ? getMaqamNameDisplayAr(displayName) : undefined,
        }
      );

      const familyNamespace = buildIdentifierNamespace(
        {
          idName: familyId,
          displayName: familyDisplayFinal,
        },
        {
          inArabic,
          displayAr:
            inArabic && familyDisplayFinal !== "unknown"
              ? getMaqamNameDisplayAr(familyDisplayFinal)
              : undefined,
        }
      );

      const tonicNamespace = buildIdentifierNamespace(
        {
          idName: tonicId,
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

      return {
        maqam: maqamNamespace,
        family: familyNamespace,
        tonic: tonicNamespace,
        stats: {
          numberOfPitchClasses,
          availableInTuningSystems,
        },
        characteristics: {
          isOctaveRepeating,
          hasAsymmetricDescending,
          hasSuyur,
        },
        availability: {
          tuningSystems: availability,
        },
        links: buildLinksNamespace({
          detail: `/api/maqamat/${idName}`,
        }),
      };
    });

    // Apply filters if provided
    let filteredMaqamat = maqamatWithAvailability;
    if (familyFilter) {
      filteredMaqamat = filteredMaqamat.filter(
        (m) => m.family.idName === standardizeText(familyFilter)
      );
    }
    if (tonicFilter) {
      filteredMaqamat = filteredMaqamat.filter(
        (m) => m.tonic.idName === standardizeText(tonicFilter)
      );
    }

    // Apply sorting
    if (sortBy === "tonic") {
      // Sort by tonic note priority (NoteName.ts order)
      // Use standardized text for note name comparison to handle diacritics consistently
      filteredMaqamat.sort((a, b) => {
        const priorityA = getNotePriority(a.tonic.idName);
        const priorityB = getNotePriority(b.tonic.idName);
        return priorityA - priorityB;
      });
    } else {
      // Default: Sort alphabetically by display name (using standardized text for consistency)
      filteredMaqamat.sort((a, b) => 
        standardizeText(a.maqam.displayName).localeCompare(standardizeText(b.maqam.displayName))
      );
    }

    const response = NextResponse.json(
      buildListResponse(filteredMaqamat)
    );

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error in GET /api/maqamat:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to retrieve maqāmāt" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

/**
 * PUT /api/maqamat
 * 
 * Updates the maqamat database.
 * Accepts an array of maqam objects and writes them to data/maqamat.json.
 * 
 * Request Body: Array of maqam objects
 */
export async function PUT(request: Request) {
  try {
    const maqamat = await request.json();
    
    if (!Array.isArray(maqamat)) {
      const errorResponse = NextResponse.json(
        { error: "Invalid request: body must be an array of maqamat" },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse);
    }

    // CRITICAL: Prevent data loss - reject empty arrays
    if (maqamat.length === 0) {
      const errorResponse = NextResponse.json(
        { 
          error: "Cannot save empty array",
          message: "Refusing to save empty array to prevent data loss. If you want to clear all data, use a delete endpoint or explicitly confirm.",
          hint: "This endpoint requires at least one maqam object"
        },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse);
    }

    // Get the path to data/maqamat.json
    const dataPath = path.join(process.cwd(), "data", "maqamat.json");

    // Write with backup
    const writeResult = safeWriteFile(dataPath, maqamat, true);

    if (!writeResult.success) {
      throw new Error(writeResult.error || "Failed to write file");
    }

    const response = NextResponse.json({
      message: "Maqamat updated successfully",
      count: maqamat.length,
      backupCreated: writeResult.backupPath !== null,
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error updating maqamat:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to update maqamat" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}
