import { NextResponse } from "next/server";
import { getMaqamat, getTuningSystems, getAjnas } from "@/functions/import";
import { addCorsHeaders, handleCorsPreflightRequest } from "@/app/api/cors";
import {
  classifyMaqamatByMaqamPitchClassSets,
  ClassificationResult
} from "@/functions/classifyMaqamatByMaqamPitchClassSets";
import { buildEntityNamespace, buildIdentifierNamespace } from "@/app/api/response-shapes";
import { parseInArabic, getNoteNameDisplayAr } from "@/app/api/arabic-helpers";
import { standardizeText } from "@/functions/export";
import { getIpnReferenceNoteName } from "@/functions/getIpnReferenceNoteName";

export const OPTIONS = handleCorsPreflightRequest;

// Force dynamic rendering
export const dynamic = "force-dynamic";

/**
 * GET /api/maqamat/classification/maqam-pitch-class-sets
 *
 * Groups maqamat according to maqam-based pitch class sets. Each set contains
 * all pitch classes from a single source maqam, and identifies which other maqamat
 * can be performed using only those pitch classes.
 *
 * Key Differences from 12-Pitch-Class-Sets:
 * - No chromatic base merging (no al-Kindi filler pitch classes)
 * - Variable set sizes (not fixed at 12 pitch classes)
 * - Uses octave-equivalent IPN matching (C in any octave = "C")
 * - Single tuning system only (simpler than 12-pitch-class-sets)
 *
 * Musicological Purpose:
 * Answers the question: "Which maqamat can be performed using only the pitch
 * classes of maqam X?" For example, maqam rast on rāst includes pitch classes
 * that can perform maqam bayyāt on dūgāh and maqam segāh on segāh.
 *
 * Critical Design Principles:
 * - Octave Equivalence: Pitch classes in different octaves are treated as equivalent
 * - Union of Melodic Paths: Both ascending and descending pitch classes are included
 * - Exact Matching: Compatible maqamat must use subset of source maqam's pitch classes
 * - Direct Values: All cent values come directly from tuning system without calculation
 *
 * Query Parameters:
 * - tuningSystem: string (default: "cairocongresstuningcommittee_1929") - tuning system ID
 * - startingNote: string (default: "yegah") - starting note for tuning system
 * - includeIncompatible: boolean (default: false) - include maqamat that can't form sets
 * - includeArabic: boolean (default: false) - include Arabic display names
 * - setId: string (optional) - filter by specific set ID (e.g., "maqam_rast_set")
 * - maqamId: string (optional) - filter by maqam ID to find sets containing it
 * - centsTolerance: number (default: 5) - tolerance for cents comparison
 *
 * Output Format:
 * - Sets ordered by number of compatible maqamat (descending)
 * - Each set includes: source maqam, pitch classes, compatible maqamat, pitch class count
 * - Statistics: total sets, total compatible maqamat, incompatible count
 * - Parameters: tuning system, starting note, tolerance used
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeIncompatible = searchParams.get("includeIncompatible") === "true";
    const includePitchClassData = searchParams.get("includePitchClassData") === "true"; // Default false
    const setIdParam = searchParams.get("setId");
    const maqamIdParam = searchParams.get("maqamId");

    // Get tuning system and starting note parameters
    const tuningSystemId = searchParams.get("tuningSystem") || "cairocongresstuningcommittee_1929";
    const startingNoteParam = searchParams.get("startingNote") || "yegah";

    // Get cents tolerance parameter
    let centsTolerance = 5; // Default tolerance
    const centsToleranceParam = searchParams.get("centsTolerance");
    if (centsToleranceParam) {
      const parsed = parseFloat(centsToleranceParam);
      if (isNaN(parsed) || parsed < 0) {
        return addCorsHeaders(
          NextResponse.json(
            {
              error: "Invalid centsTolerance parameter",
              message: "centsTolerance must be a non-negative number",
              hint: "Use ?centsTolerance=<number> (e.g., ?centsTolerance=5)"
            },
            { status: 400 }
          )
        );
      }
      centsTolerance = parsed;
    }

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

    // Get data
    const maqamat = getMaqamat();
    const tuningSystems = getTuningSystems();
    const ajnas = getAjnas();

    // Find required tuning system (case-insensitive matching)
    const tuningSystem = tuningSystems.find(
      (ts) => standardizeText(ts.getId()) === standardizeText(tuningSystemId)
    );

    if (!tuningSystem) {
      const availableTuningSystems = tuningSystems.map(ts => ({
        id: ts.getId(),
        idName: standardizeText(ts.getId()),
        displayName: ts.stringify()
      }));

      return addCorsHeaders(
        NextResponse.json(
          {
            error: `Tuning system '${tuningSystemId}' not found`,
            hint: "Use ?tuningSystem=<tuning-system-id> to specify a valid tuning system",
            availableTuningSystems: availableTuningSystems,
            validOptions: availableTuningSystems.map(ts => ts.id)
          },
          { status: 400 }
        )
      );
    }

    // Validate starting note
    const noteNameSets = tuningSystem.getNoteNameSets();
    const validNoteSet = noteNameSets.find(
      (set) => standardizeText(set[0]) === standardizeText(startingNoteParam)
    );

    if (!validNoteSet) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: `Starting note '${startingNoteParam}' is not valid for tuning system '${tuningSystemId}'`,
            validOptions: noteNameSets.map((set) => set[0])
          },
          { status: 400 }
        )
      );
    }

    // Use the actual note name from the tuning system (with diacritics)
    const startingNote = validNoteSet[0];

    // Perform classification
    const result: ClassificationResult = classifyMaqamatByMaqamPitchClassSets(
      maqamat,
      tuningSystem,
      startingNote,
      ajnas,
      centsTolerance
    );

    // Format response
    const formattedSets = result.sets.map((set) => {
      const sourceMaqamNamespace = buildEntityNamespace(
        {
          id: set.sourceMaqam.id,
          idName: set.sourceMaqam.idName,
          displayName: set.sourceMaqam.name
        },
        {
          inArabic
        }
      );

      // Format pitch classes in ascending cents order
      const pitchClassSetArray = Array.from(set.pitchClassSet.pitchClasses.entries())
        .sort((a, b) => {
          // Sort by ascending cents values
          return parseFloat(a[1].cents) - parseFloat(b[1].cents);
        })
        .map(([, pitchClass]) => {
          const completePitchClassData: any = {
            englishName: pitchClass.englishName,
            noteName: pitchClass.noteName,
            cents: parseFloat(pitchClass.cents),
            fraction: pitchClass.fraction,
            decimalRatio: parseFloat(pitchClass.decimalRatio),
            frequency: parseFloat(pitchClass.frequency),
            octave: pitchClass.octave
          };

          // Add Arabic if requested
          if (inArabic) {
            completePitchClassData.noteNameDisplayAr = getNoteNameDisplayAr(pitchClass.noteName);
          }

          return completePitchClassData;
        });

      // Format compatible maqamat
      const compatibleMaqamatFormatted = set.compatibleMaqamat.map((info) => {
        const transpositionNamespace = buildIdentifierNamespace(
          {
            idName: standardizeText(info.maqam.name),
            displayName: info.maqam.name
          },
          {
            inArabic
          }
        );

        // Store base maqam ID for filtering
        const baseMaqamIdName = info.maqamData.getIdName();

        // Get the tonic for this specific maqam from its ascending pitch classes
        const maqamTonicPitchClass = info.maqam.ascendingPitchClasses?.[0];
        const maqamTonicNoteName = maqamTonicPitchClass?.noteName || '';

        // Get the IPN reference note name for the tonic (e.g., "D", "C#")
        const tonicIpnRef = maqamTonicPitchClass
          ? getIpnReferenceNoteName(maqamTonicPitchClass)
          : '';

        // Build tonic namespace for this maqam
        const tonicNamespace = maqamTonicNoteName ? buildIdentifierNamespace(
          {
            idName: standardizeText(maqamTonicNoteName),
            displayName: maqamTonicNoteName
          },
          {
            inArabic
          }
        ) : null;

        return {
          maqamIdName: transpositionNamespace.idName,
          maqamDisplayName: transpositionNamespace.displayName,
          baseMaqamIdName: baseMaqamIdName, // Used for filtering, removed before response
          isTransposed: info.maqam.transposition,
          tonic: tonicNamespace ? {
            ipnReferenceNoteName: tonicIpnRef,
            noteNameIdName: tonicNamespace.idName,
            noteNameDisplayName: tonicNamespace.displayName
          } : null
        };
      });

      // Deduplicate compatible maqamat before counting
      // Use base maqam ID + tonic IPN as key to remove octave equivalents
      // (e.g., maqam rast on rast and maqam rast on muhayyar rast are octave equivalents)
      const seenMaqamatByTonic = new Set<string>();
      const deduplicatedMaqamat = compatibleMaqamatFormatted
        .filter((maqam) => {
          const tonicIpn = maqam.tonic?.ipnReferenceNoteName || 'Unknown';
          const key = `${maqam.baseMaqamIdName}:${tonicIpn}`;
          if (seenMaqamatByTonic.has(key)) {
            return false; // Duplicate (octave equivalent), filter it out
          }
          seenMaqamatByTonic.add(key);
          return true; // Keep this entry
        });

      // Sort compatible maqamat: tahlil (non-transposed) versions first, then by base maqam name
      const sortedMaqamat = deduplicatedMaqamat.sort((a, b) => {
        // PRIORITY 1: Tahlil (non-transposed) versions come first
        if (a.isTransposed !== b.isTransposed) {
          return a.isTransposed ? 1 : -1; // Non-transposed (false) comes before transposed (true)
        }

        // PRIORITY 2: Sort alphabetically by maqam display name
        return a.maqamDisplayName.localeCompare(b.maqamDisplayName);
      });

      const setNameStandardized = standardizeText(set.name);

      // Build response object with conditional pitch class data
      const responseObj: any = {
        setIdName: setNameStandardized,
        setDisplayName: set.name,
        compatibleMaqamatCount: sortedMaqamat.length,
        sourceMaqam: sourceMaqamNamespace,
      };

      // Conditionally include pitch class data
      if (includePitchClassData) {
        responseObj.pitchClassSet = pitchClassSetArray;
        responseObj.pitchClassCount = set.pitchClassCount;
      }

      // Add compatible maqamat list (baseMaqamIdName kept for filtering, removed later)
      responseObj.compatibleMaqamat = sortedMaqamat;

      return responseObj;
    });

    // Filter out sets with only 1 maqam (source only, no compatible maqamat)
    // A valid set must have at least 2 maqamat (source + at least one compatible)
    const validSets = formattedSets.filter(set => set.compatibleMaqamatCount >= 2);

    // Filter sets based on query parameters
    let filteredSets = validSets;

    if (setIdParam) {
      // Filter by specific set ID
      const setIdStandardized = standardizeText(setIdParam);
      filteredSets = validSets.filter(set =>
        set.setIdName === setIdStandardized
      );

      if (filteredSets.length === 0) {
        // Try to extract maqam ID from the set ID (e.g., "maqam_kurd_set" -> "maqam_kurd")
        const extractedMaqamId = setIdParam.replace(/_set$/, '');
        const extractedMaqamIdStandardized = standardizeText(extractedMaqamId);

        // Check if this maqam exists in any other sets
        const setsContainingMaqam = validSets.filter(set =>
          set.compatibleMaqamat.some((maqam: any) => {
            const baseMatch = maqam.baseMaqamIdName === extractedMaqamIdStandardized ||
                             maqam.baseMaqamIdName === extractedMaqamId;
            const transpositionMatch = maqam.maqamIdName === extractedMaqamIdStandardized ||
                                      maqam.maqamIdName === extractedMaqamId ||
                                      maqam.maqamIdName.startsWith(extractedMaqamIdStandardized + "_");
            return baseMatch || transpositionMatch;
          })
        );

        if (setsContainingMaqam.length > 0) {
          // The maqam exists but not as a source maqam for a set
          const maqamInfo = setsContainingMaqam.map(set => ({
            setIdName: set.setIdName,
            setDisplayName: set.setDisplayName,
            sourceMaqam: set.sourceMaqam.displayName,
            maqamPositionInSet: (() => {
              const maqamEntry = set.compatibleMaqamat.find((m: any) => {
                const baseMatch = m.baseMaqamIdName === extractedMaqamIdStandardized ||
                                 m.baseMaqamIdName === extractedMaqamId;
                const transpositionMatch = m.maqamIdName === extractedMaqamIdStandardized ||
                                          m.maqamIdName === extractedMaqamId;
                return baseMatch || transpositionMatch;
              });
              return maqamEntry ? {
                maqamDisplayName: maqamEntry.maqamDisplayName,
                tonicIpn: maqamEntry.tonic?.ipnReferenceNoteName,
                tonicNoteName: maqamEntry.tonic?.noteNameDisplayName,
                isTransposed: maqamEntry.isTransposed
              } : null;
            })()
          }));

          return addCorsHeaders(
            NextResponse.json(
              {
                error: `Set '${setIdParam}' not found`,
                message: `The set '${setIdParam}' does not exist. However, the maqām '${extractedMaqamId}' is available in other sets.`,
                maqamId: extractedMaqamId,
                availableInSets: maqamInfo,
                hint: `The maqām '${extractedMaqamId}' appears in ${setsContainingMaqam.length} set(s). Use ?maqamId=${extractedMaqamId} to see all sets containing this maqām, or use one of the setIds listed above.`,
                suggestion: `Try: ?setId=${maqamInfo[0].setIdName} or ?maqamId=${extractedMaqamId}`
              },
              { status: 404 }
            )
          );
        }

        // Neither the set nor the maqam exists
        const availableSetIds = validSets.slice(0, 5).map(s => s.setIdName);
        return addCorsHeaders(
          NextResponse.json(
            {
              error: `Set '${setIdParam}' not found`,
              message: `The set '${setIdParam}' does not exist, and no maqām with ID '${extractedMaqamId}' was found.`,
              hint: "Use ?setId=<set-id> to filter by a specific set (e.g., ?setId=maqam_rast_set)",
              availableSetIds: availableSetIds,
              totalAvailableSets: validSets.length,
              suggestion: `Try: ?setId=${availableSetIds[0]} or view all sets without the setId parameter`
            },
            { status: 404 }
          )
        );
      }
    } else if (maqamIdParam) {
      // Filter by maqam ID - find sets containing this maqam
      const maqamIdStandardized = standardizeText(maqamIdParam);
      filteredSets = validSets.filter(set =>
        set.compatibleMaqamat.some((maqam: any) => {
          // Match by base maqam ID name (for base maqam) or transposition ID name (for transpositions)
          const baseMatch = maqam.baseMaqamIdName === maqamIdStandardized ||
                           maqam.baseMaqamIdName === maqamIdParam;
          const transpositionMatch = maqam.maqamIdName === maqamIdStandardized ||
                                    maqam.maqamIdName === maqamIdParam ||
                                    maqam.maqamIdName.startsWith(maqamIdStandardized + "_");
          return baseMatch || transpositionMatch;
        })
      );

      if (filteredSets.length === 0) {
        return addCorsHeaders(
          NextResponse.json(
            {
              error: `No sets found containing maqam '${maqamIdParam}'`,
              hint: "Use ?maqamId=<maqam-id> to find sets containing a specific maqam (e.g., ?maqamId=maqam_rast)"
            },
            { status: 404 }
          )
        );
      }
    }

    // Sort sets by compatibleMaqamatCount in descending order (most to least)
    filteredSets.sort((a, b) => b.compatibleMaqamatCount - a.compatibleMaqamatCount);

    // Remove baseMaqamIdName from all maqam objects before returning response
    const finalSets = filteredSets.map(set => ({
      ...set,
      compatibleMaqamat: set.compatibleMaqamat.map((maqam: any) => 
        Object.fromEntries(
          Object.entries(maqam).filter(([key]) => key !== 'baseMaqamIdName')
        )
      )
    }));

    // Calculate statistics
    const totalCompatibleMaqamat = filteredSets.reduce(
      (sum, set) => sum + set.compatibleMaqamatCount,
      0
    );

    const response: any = {
      statistics: {
        totalSets: finalSets.length,
        totalCompatibleMaqamat: totalCompatibleMaqamat,
        incompatibleMaqamatCount: result.incompatibleMaqamat.length,
        totalProcessed: totalCompatibleMaqamat + result.incompatibleMaqamat.length
      },
      sets: finalSets,
      parameters: {
        tuningSystem: {
          id: tuningSystem.getId(),
          idName: standardizeText(tuningSystem.getId()),
          displayName: tuningSystem.stringify()
        },
        startingNote: {
          idName: standardizeText(startingNote),
          displayName: startingNote
        },
        centsTolerance: centsTolerance,
        ...(setIdParam && { setId: setIdParam }),
        ...(maqamIdParam && { maqamId: maqamIdParam })
      }
    };

    if (includeIncompatible) {
      const incompatibleFormatted = result.incompatibleMaqamat.map((incompatible) => {
        const maqamNamespace = buildEntityNamespace(
          {
            id: incompatible.maqam.getId(),
            idName: incompatible.maqam.getIdName(),
            displayName: incompatible.maqam.getName()
          },
          {
            inArabic
          }
        );

        const transpositionNamespace = incompatible.transposition
          ? buildIdentifierNamespace(
              {
                idName: standardizeText(incompatible.transposition.name),
                displayName: incompatible.transposition.name
              },
              {
                inArabic
              }
            )
          : null;

        return {
          maqam: maqamNamespace,
          transposition: transpositionNamespace && incompatible.transposition
            ? {
                ...transpositionNamespace,
                isTransposed: incompatible.transposition.transposition
              }
            : null,
          reason: incompatible.reason
        };
      });

      response.incompatibleMaqamat = incompatibleFormatted;
      response.incompatibleMaqamatCount = incompatibleFormatted.length;
    }

    return addCorsHeaders(NextResponse.json(response));
  } catch (error) {
    console.error("Error classifying maqamat:", error);
    return addCorsHeaders(
      NextResponse.json(
        {
          error: "Internal server error",
          message: error instanceof Error ? error.message : "Unknown error"
        },
        { status: 500 }
      )
    );
  }
}
