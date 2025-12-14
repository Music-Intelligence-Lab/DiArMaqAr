import { NextResponse } from "next/server";
import { getMaqamat, getTuningSystems, getAjnas } from "@/functions/import";
import { addCorsHeaders, handleCorsPreflightRequest } from "@/app/api/cors";
import {
  classifyMaqamat,
  ClassificationResult
} from "@/functions/classifyMaqamat12PitchClassSets";
import { buildEntityNamespace, buildIdentifierNamespace } from "@/app/api/response-shapes";
import { parseInArabic } from "@/app/api/arabic-helpers";
import { standardizeText } from "@/functions/export";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";

export const OPTIONS = handleCorsPreflightRequest;

// Force dynamic rendering
export const dynamic = "force-dynamic";

/**
 * Format pitch class data according to requested pitchClassDataType
 * @param pitchClass - The pitch class object with all data
 * @param format - Output format type (null or "" returns minimal fields)
 * @param inArabic - Whether to include Arabic display names
 */
function formatPitchClassData(pitchClass: any, format: string | null | undefined, inArabic: boolean = false): any {
  const baseFields: any = {
    ipnReferenceNoteName: pitchClass.ipnReferenceNoteName,
    noteName: pitchClass.noteName,
  };

  // Return minimal fields when pitchClassDataType is not provided
  if (!format || format === "") {
    return {
      ...baseFields,
      relativeCents: pitchClass.relativeCents,
      octave: pitchClass.octave
    };
  }

  // Helper to add Arabic if needed
  const addArabic = (fields: any) => {
    if (inArabic && pitchClass.noteNameDisplayAr) {
      return { ...fields, noteNameDisplayAr: pitchClass.noteNameDisplayAr };
    }
    return fields;
  };

  switch (format) {
    case "all":
      return addArabic({
        ...baseFields,
        cents: pitchClass.cents,
        relativeCents: pitchClass.relativeCents,
        fraction: pitchClass.fraction,
        decimalRatio: pitchClass.decimalRatio,
        frequency: pitchClass.frequency,
        octave: pitchClass.octave,
        ...(pitchClass.englishName && { englishName: pitchClass.englishName }),
        ...(pitchClass.abjadName && { abjadName: pitchClass.abjadName }),
        ...(pitchClass.stringLength !== undefined && { stringLength: pitchClass.stringLength }),
        ...(pitchClass.fretDivision !== undefined && { fretDivision: pitchClass.fretDivision }),
        ...(pitchClass.midiNoteDecimal !== undefined && { midiNoteDecimal: pitchClass.midiNoteDecimal }),
        ...(pitchClass.midiNoteDeviation !== undefined && { midiNoteDeviation: pitchClass.midiNoteDeviation }),
        ...(pitchClass.centsDeviation !== undefined && { centsDeviation: pitchClass.centsDeviation }),
        ...(pitchClass.referenceNoteName !== undefined && { referenceNoteName: pitchClass.referenceNoteName })
      });
    case "englishName":
      return addArabic({ ...baseFields, englishName: pitchClass.englishName || null });
    case "fraction":
      return addArabic({ ...baseFields, fraction: pitchClass.fraction });
    case "cents":
      return addArabic({ ...baseFields, cents: pitchClass.cents });
    case "decimalRatio":
      return addArabic({ ...baseFields, decimalRatio: pitchClass.decimalRatio });
    case "stringLength":
      return addArabic({ ...baseFields, stringLength: pitchClass.stringLength || null });
    case "frequency":
      return addArabic({ ...baseFields, frequency: pitchClass.frequency });
    case "abjadName":
      return addArabic({ ...baseFields, abjadName: pitchClass.abjadName || null });
    case "fretDivision":
      return addArabic({ ...baseFields, fretDivision: pitchClass.fretDivision || null });
    case "midiNoteNumber":
      return addArabic({ ...baseFields, midiNoteDecimal: pitchClass.midiNoteDecimal || null });
    case "midiNoteDeviation":
      return addArabic({ ...baseFields, midiNoteDeviation: pitchClass.midiNoteDeviation || null });
    case "centsDeviation":
      return addArabic({ ...baseFields, centsDeviation: pitchClass.centsDeviation || null });
    case "referenceNoteName":
      return addArabic({ ...baseFields, referenceNoteName: pitchClass.referenceNoteName || null });
    case "relativeCents":
      return addArabic({ ...baseFields, relativeCents: pitchClass.relativeCents });
    default:
      return pitchClass; // Return full object
  }
}

/**
 * GET /api/maqamat/classification/12-pitch-class-sets
 *
 * Groups maqamat according to sets of 12 pitch classes suitable for MIDI keyboard tuning
 * and Scala file export. Each set is created by merging pitch classes from the specified
 * tuning system with alkindi_874 filler pitch classes.
 *
 * Critical Design Principles:
 * - Octave Alignment: Both tuning systems use the same startingNote for octave alignment
 * - Chromatic Order: Each set contains 12 pitch classes ordered chromatically
 * - Arabic Musicological Logic: IPN references respect maqam theory (variant OF, not proximity)
 * - Direct Values: All cent values come directly from tuning systems without calculation
 * - Maqam Priority: Maqam pitch classes are prioritized over al-Kindi fillers when both satisfy
 *   the ascending order requirement (ensures maqam characteristics are preserved)
 *
 * Query Parameters:
 * - tuningSystem: string (default: "cairocongresstuningcommittee_1929") - tuning system ID for maqamat
 * - startingNote: string (default: "yegah") - starting note for BOTH tuning systems (critical for octave alignment)
 * - includeIncompatible: boolean (default: false) - include maqamat that can't form sets
 * - includeArabic: boolean (default: false) - include Arabic display names
 * - startSetFromC: boolean (default: false) - start pitch class set from IPN "C" (for Scala .scl export)
 * - setId: string (optional) - filter by specific set ID (e.g., "maqam_rast_set")
 * - maqamId: string (optional) - filter by maqam ID to find sets containing it (e.g., "maqam_rast")
 *
 * Scala Export Mode (startSetFromC=true):
 * When enabled, the pitch class set is reordered to start from IPN "C" at degree 0, making it
 * directly compatible with Scala (.scl) file format which maps degree 0 to middle C by default.
 *
 * How it works:
 * 1. Octave shifting: Pitch classes in octave 2 that come BEFORE the tonic in chromatic order
 *    are shifted to their octave 1 equivalents (e.g., C and C# when tonic is D)
 * 2. Rotates the pitch class array to start from C (instead of tonic)
 * 3. Recalculates relative cents from C (0.00 cents) instead of from tonic
 * 4. Handles octave wrap-around: negative relative cents are adjusted by adding 1200 cents
 * 5. Example: For maqam bayyāt shūrī (tonic D), C shifts from octave 2 (kurdān: 1494.13¢)
 *    to octave 1 (rāst: 294.13¢), then becomes position 0 with 0.00¢ relative
 * 6. The maqamTonic field tracks the original tonic position (e.g., position 2 for D)
 * 7. All absolute cents values remain unchanged from the tuning system
 *
 * Output Format:
 * - Pitch classes ordered chromatically (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
 * - Starting from the maqam's tonic (default) OR from IPN "C" (if startSetFromC=true)
 * - Relative cents from 0 (reference note) to ~1050-1200 (octave)
 * - maqamTonic field indicates the actual maqam tonic with:
 *   - ipnReferenceNoteName: IPN letter (e.g., "D")
 *   - noteNameIdName: standardized note name (e.g., "dugah")
 *   - noteNameDisplayName: display name with diacritics (e.g., "dūgāh")
 *   - positionInSet: index 0-11 (0 in default mode, varies in Scala mode)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeIncompatible = searchParams.get("includeIncompatible") === "true";
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

    // Parse startSetFromC parameter (for Scala .scl export compatibility)
    const startSetFromC = searchParams.get("startSetFromC") === "true";

    // Parse pitchClassDataType parameter
    const pitchClassDataType = searchParams.get("pitchClassDataType");
    const validPitchClassDataTypes = [
      "all",
      "englishName",
      "solfege",
      "fraction",
      "cents",
      "decimalRatio",
      "stringLength",
      "frequency",
      "abjadName",
      "fretDivision",
      "midiNoteNumber",
      "midiNoteDeviation",
      "centsDeviation",
      "referenceNoteName",
      "relativeCents"
    ];

    // Validate pitchClassDataType if provided
    if (pitchClassDataType !== null) {
      // Validate pitchClassDataType is not empty string
      if (pitchClassDataType.trim() === "") {
        return addCorsHeaders(
          NextResponse.json(
            {
              error: "Invalid parameter: pitchClassDataType",
              message: "The 'pitchClassDataType' parameter cannot be empty. Provide a valid data type.",
              validOptions: validPitchClassDataTypes,
              hint: `Specify a valid pitch class data type like '?pitchClassDataType=cents' or '?pitchClassDataType=all'`
            },
            { status: 400 }
          )
        );
      }

      // Validate pitchClassDataType is a valid option
      if (!validPitchClassDataTypes.includes(pitchClassDataType)) {
        return addCorsHeaders(
          NextResponse.json(
            {
              error: `Invalid pitchClassDataType '${pitchClassDataType}'`,
              validOptions: validPitchClassDataTypes,
              hint: `Valid options: ${validPitchClassDataTypes.join(", ")}`
            },
            { status: 400 }
          )
        );
      }
    }

    // Get data
    const maqamat = getMaqamat();
    const tuningSystems = getTuningSystems();
    const ajnas = getAjnas();

    // Find required tuning systems
    const cairoTuningSystem = tuningSystems.find(
      (ts) => ts.getId() === tuningSystemId
    );

    const alKindiTuningSystem = tuningSystems.find(
      (ts) => ts.getId() === "alkindi_874"
    );

    if (!cairoTuningSystem) {
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

    if (!alKindiTuningSystem) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "alkindi_874 tuning system not found"
          },
          { status: 500 }
        )
      );
    }

    // Validate starting note
    const noteNameSets = cairoTuningSystem.getNoteNameSets();
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
    const cairoStartingNote = validNoteSet[0];

    // Use the same starting note for al-Kindi to ensure octaves align
    // Validate that al-Kindi has this starting note
    const alKindiNoteNameSets = alKindiTuningSystem.getNoteNameSets();
    const alKindiValidNoteSet = alKindiNoteNameSets.find(
      (set) => standardizeText(set[0]) === standardizeText(startingNoteParam)
    );

    if (!alKindiValidNoteSet) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: `Starting note '${startingNoteParam}' is not valid for alkindi_874 tuning system`,
            hint: "The starting note must be valid for both the selected tuning system and alkindi_874",
            validAlKindiNotes: alKindiNoteNameSets.map((set) => set[0])
          },
          { status: 400 }
        )
      );
    }

    const alKindiStartingNote = alKindiValidNoteSet[0];

    // Perform classification
    const result: ClassificationResult = classifyMaqamat(
      maqamat,
      cairoTuningSystem,
      cairoStartingNote,
      alKindiTuningSystem,
      alKindiStartingNote,
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

      // Get all pitch classes from all octaves for octave shifting when needed
      const allTuningSystemPitchClasses = startSetFromC ? getTuningSystemPitchClasses(
        cairoTuningSystem,
        cairoStartingNote as any
      ) : null;

      // Get all 12 pitch classes from the original set
      // CRITICAL: Pitch classes are already in chromatic ascending order from create12PitchClassSet
      // with correct octave selection. Do NOT re-sort them or the octave selection will break.
      const allPitchClasses: Array<{ ipnRef: string; pitchClass: any }> = [];

      // Get the maqam tonic IPN reference
      const maqamTonicIpnRef = set.pitchClassSet.pitchClasses.entries().next().value?.[0] || 'C';

      // Define chromatic order for comparison
      const chromaticOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const tonicIndex = chromaticOrder.indexOf(maqamTonicIpnRef);

      for (const [ipnRef, pc] of set.pitchClassSet.pitchClasses.entries()) {
        let pitchClassToUse = pc;

        // For Scala mode: shift octave 2 notes that come BEFORE the tonic to octave 1
        // This handles cases where the maqam starts mid-octave (e.g., D)
        // and we need C and C# from octave 1 instead of octave 2
        if (startSetFromC && pc.octave === 2 && allTuningSystemPitchClasses) {
          const currentIndex = chromaticOrder.indexOf(ipnRef);
          // If this note comes before the tonic in chromatic order, get octave 1 equivalent
          if (currentIndex < tonicIndex) {
            const octave1Equivalent = allTuningSystemPitchClasses.find(
              tpc => tpc.referenceNoteName === ipnRef && tpc.octave === 1
            );

            if (octave1Equivalent) {
              pitchClassToUse = octave1Equivalent;
            }
          }
        }

        allPitchClasses.push({ ipnRef, pitchClass: pitchClassToUse });
      }

      // For Scala mode: rotate array to start from C
      let orderedPitchClasses = allPitchClasses;
      if (startSetFromC) {
        const cIndex = allPitchClasses.findIndex(item => item.ipnRef === 'C');
        if (cIndex !== -1 && cIndex > 0) {
          orderedPitchClasses = [
            ...allPitchClasses.slice(cIndex),
            ...allPitchClasses.slice(0, cIndex)
          ];
        }
      }

      // Get reference cents from the FIRST pitch class in the ordered array
      // This will be the maqam tonic (default) or C (if startSetFromC=true)
      const referenceCents = orderedPitchClasses.length > 0
        ? parseFloat(orderedPitchClasses[0].pitchClass.cents)
        : 0;

      // Format the response - pitch classes in final order
      const pitchClassSetArray = orderedPitchClasses.map((item) => {
        const pitchClass = item.pitchClass;
        const cents = parseFloat(pitchClass.cents);

        // Calculate cents relative to reference
        // The rebuild function (when startSetFromC=true) already ensures chromatic ascending order
        // so relativeCents should naturally be positive and ascending
        let relativeCents = cents - referenceCents;

        // Handle octave wrap-around for Scala mode
        // When pitch classes from lower octaves are rotated to come after C,
        // add 1200 cents to make the relative cents positive
        if (startSetFromC && relativeCents < 0) {
          relativeCents += 1200;
        }

        // Build complete pitch class data object
        const completePitchClassData = {
          ipnReferenceNoteName: item.ipnRef,
          noteName: pitchClass.noteName,
          cents: cents,
          relativeCents: relativeCents,
          fraction: pitchClass.fraction,
          decimalRatio: parseFloat(pitchClass.decimalRatio),
          frequency: parseFloat(pitchClass.frequency),
          octave: pitchClass.octave,
          // Additional fields for "all" format
          englishName: pitchClass.englishName,
          abjadName: pitchClass.abjadName,
          stringLength: pitchClass.stringLength,
          fretDivision: pitchClass.fretDivision,
          midiNoteDecimal: pitchClass.midiNoteDecimal,
          midiNoteDeviation: pitchClass.midiNoteDeviation,
          centsDeviation: pitchClass.centsDeviation,
          referenceNoteName: pitchClass.referenceNoteName
        };

        // Apply formatting based on pitchClassDataType parameter
        return formatPitchClassData(completePitchClassData, pitchClassDataType, inArabic);
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
        // This works even if the tonic is in a different octave (e.g., qarār dūgāh -> "D")
        const tonicIpnRef = maqamTonicPitchClass?.referenceNoteName || '';

        // Find the matching IPN in the 12-pitch-class set
        // This finds the octave equivalent within the set
        const maqamTonicPitchClassMatch = tonicIpnRef
          ? orderedPitchClasses.find(item => item.ipnRef === tonicIpnRef)
          : null;

        const maqamTonicIpnRef = maqamTonicPitchClassMatch?.ipnRef || tonicIpnRef;
        const maqamTonicPositionInSet = maqamTonicPitchClassMatch
          ? orderedPitchClasses.findIndex(item => item.ipnRef === tonicIpnRef)
          : -1;

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
          baseMaqamIdName: baseMaqamIdName, // Store for filtering
          isTransposed: info.maqam.transposition,
          tonic: tonicNamespace ? {
            ipnReferenceNoteName: maqamTonicIpnRef,
            noteNameIdName: tonicNamespace.idName,
            noteNameDisplayName: tonicNamespace.displayName,
            positionInSet: maqamTonicPositionInSet
          } : null
        };
      });

      // Deduplicate compatible maqamat before counting
      // Use maqam name + tonic IPN as key to identify duplicates
      const seenMaqamatByTonic = new Set<string>();
      const deduplicatedMaqamat = compatibleMaqamatFormatted.filter((maqam) => {
        const tonicIpn = maqam.tonic?.ipnReferenceNoteName || 'Unknown';
        const key = `${maqam.maqamDisplayName}:${tonicIpn}`;
        if (seenMaqamatByTonic.has(key)) {
          return false; // Duplicate, filter it out
        }
        seenMaqamatByTonic.add(key);
        return true; // Keep this entry
      });

      // Sort compatible maqamat: tahlil (non-transposed) versions first, then by position in set
      const sortedMaqamat = deduplicatedMaqamat.sort((a, b) => {
        // PRIORITY 1: Tahlil (non-transposed) versions come first
        if (a.isTransposed !== b.isTransposed) {
          return a.isTransposed ? 1 : -1; // Non-transposed (false) comes before transposed (true)
        }

        // PRIORITY 2: Sort by position in set
        const aPosition = a.tonic?.positionInSet ?? 999;
        const bPosition = b.tonic?.positionInSet ?? 999;
        return aPosition - bPosition;
      });

      const setNameStandardized = standardizeText(set.name);
      return {
        setIdName: setNameStandardized,
        setDisplayName: set.name,
        sourceMaqam: sourceMaqamNamespace,
        pitchClassSet: pitchClassSetArray,
        compatibleMaqamat: sortedMaqamat,
        compatibleMaqamatCount: deduplicatedMaqamat.length
      };
    });

    // Filter sets based on query parameters
    let filteredSets = formattedSets;

    if (setIdParam) {
      // Filter by specific set ID
      const setIdStandardized = standardizeText(setIdParam);
      filteredSets = formattedSets.filter(set =>
        set.setIdName === setIdStandardized
      );

      if (filteredSets.length === 0) {
        // Try to extract maqam ID from the set ID (e.g., "maqam_kurd_set" -> "maqam_kurd")
        const extractedMaqamId = setIdParam.replace(/_set$/, '');
        const extractedMaqamIdStandardized = standardizeText(extractedMaqamId);

        // Check if this maqam exists in any other sets
        const setsContainingMaqam = formattedSets.filter(set =>
          set.compatibleMaqamat.some(maqam => {
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
              const maqamEntry = set.compatibleMaqamat.find(m => {
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
        const availableSetIds = formattedSets.slice(0, 5).map(s => s.setIdName);
        return addCorsHeaders(
          NextResponse.json(
            {
              error: `Set '${setIdParam}' not found`,
              message: `The set '${setIdParam}' does not exist, and no maqām with ID '${extractedMaqamId}' was found.`,
              hint: "Use ?setId=<set-id> to filter by a specific set (e.g., ?setId=maqam_rast_set)",
              availableSetIds: availableSetIds,
              totalAvailableSets: formattedSets.length,
              suggestion: `Try: ?setId=${availableSetIds[0]} or view all sets without the setId parameter`
            },
            { status: 404 }
          )
        );
      }
    } else if (maqamIdParam) {
      // Filter by maqam ID - find sets containing this maqam
      const maqamIdStandardized = standardizeText(maqamIdParam);
      filteredSets = formattedSets.filter(set =>
        set.compatibleMaqamat.some(maqam => {
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

    // Calculate statistics
    const filteredCompatibleCount = filteredSets.reduce(
      (sum, set) => sum + set.compatibleMaqamatCount,
      0
    );
    const globalCompatibleCount = formattedSets.reduce(
      (sum, set) => sum + set.compatibleMaqamatCount,
      0
    );

    const response: any = {
      statistics: {
        totalSets: filteredSets.length,
        totalCompatibleMaqamat: filteredCompatibleCount,
        incompatibleMaqamatCount: result.incompatibleMaqamat.length,
        // Global statistics (always shown for context)
        global: {
          totalSets: formattedSets.length,
          totalCompatibleMaqamat: globalCompatibleCount,
          totalProcessed: globalCompatibleCount + result.incompatibleMaqamat.length
        }
      },
      sets: filteredSets,
      parameters: {
        tuningSystem: {
          id: cairoTuningSystem.getId(),
          idName: standardizeText(cairoTuningSystem.getId()),
          displayName: cairoTuningSystem.stringify()
        },
        startingNote: {
          idName: standardizeText(cairoStartingNote),
          displayName: cairoStartingNote
        },
        alKindiTuningSystem: {
          id: alKindiTuningSystem.getId(),
          idName: standardizeText(alKindiTuningSystem.getId()),
          displayName: alKindiTuningSystem.stringify()
        },
        alKindiStartingNote: {
          idName: standardizeText(alKindiStartingNote),
          displayName: alKindiStartingNote
        },
        centsTolerance: centsTolerance,
        startSetFromC: startSetFromC,
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

