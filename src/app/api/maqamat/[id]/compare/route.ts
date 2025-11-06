import { NextResponse } from "next/server";
import { getMaqamat, getAjnas, getTuningSystems } from "@/functions/import";
import { standardizeText } from "@/functions/export";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { calculateMaqamTranspositions } from "@/functions/transpose";
import { handleCorsPreflightRequest, addCorsHeaders } from "@/app/api/cors";
import { classifyMaqamFamily } from "@/functions/classifyMaqamFamily";
import { calculateIpnReferenceMidiNote } from "@/functions/calculateIpnReferenceMidiNote";
import { parseInArabic, getMaqamNameDisplayAr, getJinsNameDisplayAr, getNoteNameDisplayAr, getTuningSystemDisplayNameAr } from "@/app/api/arabic-helpers";

export const OPTIONS = handleCorsPreflightRequest;

// Roman numerals for scale degrees
const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII"];

/**
 * Format pitch data according to requested format
 * @param inArabic - Whether to return Arabic names
 */
function formatPitchData(pitchClasses: any[], format: string, isDescending: boolean = false, inArabic: boolean = false) {
  const length = pitchClasses.length;
  
  switch (format) {
    case "all":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        englishName: pc.englishName,
        abjadName: pc.abjadName,
        fraction: pc.fraction,
        cents: parseFloat(pc.cents),
        decimalRatio: parseFloat(pc.decimalRatio),
        stringLength: parseFloat(pc.stringLength),
        frequency: parseFloat(pc.frequency),
        fretDivision: pc.fretDivision,
        midiNoteDecimal: pc.midiNoteDecimal,
        midiNotePlusCentsDeviation: `${calculateIpnReferenceMidiNote(pc)} ${pc.centsDeviation >= 0 ? '+' : ''}${pc.centsDeviation.toFixed(1)}`,
        centsDeviation: pc.centsDeviation,
        ipnReferenceNoteName: pc.referenceNoteName
      }));
    case "cents":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        cents: parseFloat(pc.cents)
      }));
    case "fraction":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        fraction: pc.fraction
      }));
    case "decimalRatio":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        decimalRatio: parseFloat(pc.decimalRatio)
      }));
    case "frequency":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        frequency: parseFloat(pc.frequency)
      }));
    default:
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        ...(format === "englishName" && { englishName: pc.englishName }),
        ...(format === "abjadName" && { abjadName: pc.abjadName }),
        ...(format === "stringLength" && { stringLength: parseFloat(pc.stringLength) }),
        ...(format === "fretDivision" && { fretDivision: pc.fretDivision }),
        ...(format === "midiNoteNumber" && { midiNoteDecimal: pc.midiNoteDecimal }),
        ...(format === "midiNoteDeviation" && { midiNotePlusCentsDeviation: `${calculateIpnReferenceMidiNote(pc)} ${pc.centsDeviation >= 0 ? '+' : ''}${pc.centsDeviation}` }),
        ...(format === "centsDeviation" && { centsDeviation: pc.centsDeviation }),
        ...(format === "referenceNoteName" && { ipnReferenceNoteName: pc.referenceNoteName })
      }));
  }
}

/**
 * Format interval data according to requested format
 */
function formatIntervalData(intervals: any[], format: string) {
  switch (format) {
    case "all":
      return intervals.map((interval) => ({
        fraction: interval.fraction,
        cents: interval.cents,
        decimalRatio: interval.decimalRatio,
        stringLength: interval.stringLength,
        fretDivision: interval.fretDivision,
        pitchClassIndex: interval.pitchClassIndex
      }));
    case "cents":
      return intervals.map((interval) => ({
        cents: interval.cents
      }));
    case "fraction":
      return intervals.map((interval) => ({
        fraction: interval.fraction
      }));
    case "decimalRatio":
      return intervals.map((interval) => ({
        decimalRatio: interval.decimalRatio
      }));
    default:
      return intervals.map((interval) => ({
        cents: interval.cents,
        ...(format === "stringLength" && { stringLength: interval.stringLength }),
        ...(format === "fretDivision" && { fretDivision: interval.fretDivision })
      }));
  }
}

/**
 * GET /api/maqamat/[id]/compare
 * 
 * Compare maqām data across multiple tuning systems.
 * 
 * Query parameters:
 * - tuningSystems (required): Comma-separated tuning system IDs
 *   Format: "IbnSina-(1037),al-Farabi-(950g)"
 * - startingNote (required): Starting note name (URL-safe, diacritics-insensitive) - applies to all tuning systems
 * - pitchClassDataType (required): Output format (all, cents, fraction, etc.)
 * - intervals (optional): Include interval data ("true" or "false", default: "false")
 * - transposeTo (optional): Transpose to specific tonic note (applies to all tuning systems)
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const tuningSystemsParam = searchParams.get("tuningSystems");
    const startingNoteParam = searchParams.get("startingNote");
    const pitchClassDataType = searchParams.get("pitchClassDataType") || "all";
    const intervalsParam = searchParams.get("includeIntervals");
    const transposeToNote = searchParams.get("transposeTo");
    
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

    // Validate intervals parameter (3-step validation: null -> empty string -> invalid value)
    let includeIntervals = true; // Default to true
    if (intervalsParam !== null) {
      if (intervalsParam === "") {
        return addCorsHeaders(
          NextResponse.json(
            {
              error: "Invalid parameter: includeIntervals",
              message: "The 'includeIntervals' parameter cannot be empty. Use 'true' or 'false'.",
              hint: "Use ?includeIntervals=true or ?includeIntervals=false"
            },
            { status: 400 }
          )
        );
      }
      if (intervalsParam !== "true" && intervalsParam !== "false") {
        return addCorsHeaders(
          NextResponse.json(
            {
              error: "Invalid parameter: includeIntervals",
              message: "The 'includeIntervals' parameter must be 'true' or 'false'.",
              validOptions: ["true", "false"],
              hint: "Use ?includeIntervals=true or ?includeIntervals=false"
            },
            { status: 400 }
          )
        );
      }
      includeIntervals = intervalsParam !== "false";
    }

    // Validate tuningSystems parameter
    if (!tuningSystemsParam) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "tuningSystems parameter is required",
            message: "Provide comma-separated tuning system IDs",
            hint: 'Format: ?tuningSystems=IbnSina-(1037),al-Farabi-(950g)',
            example: '/api/maqamat/maqam_rast/compare?tuningSystems=IbnSina-(1037),al-Farabi-(950g)&startingNote=yegah&pitchClassDataType=cents'
          },
          { status: 400 }
        )
      );
    }

    // Validate startingNote parameter
    if (!startingNoteParam) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "startingNote parameter is required",
            message: "A starting note must be specified for all tuning systems",
            hint: "Add &startingNote=yegah to your request"
          },
          { status: 400 }
        )
      );
    }

    // Parse comma-separated tuning system IDs
    const tuningSystemIds = tuningSystemsParam.split(",").map(id => id.trim()).filter(id => id.length > 0);
    
    if (tuningSystemIds.length === 0) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "Invalid tuningSystems parameter",
            message: "At least one tuning system ID must be provided",
            hint: 'Format: ?tuningSystems=IbnSina-(1037),al-Farabi-(950g)'
          },
          { status: 400 }
        )
      );
    }

    // Build comparisons array from tuning system IDs
    const comparisons: Array<{ tuningSystem: string; startingNote: string; transposeTo?: string }> = 
      tuningSystemIds.map(tuningSystemId => ({
        tuningSystem: tuningSystemId,
        startingNote: startingNoteParam,
        ...(transposeToNote && { transposeTo: transposeToNote })
      }));

    const maqamatData = getMaqamat();
    const tuningSystems = getTuningSystems();
    const ajnas = getAjnas();

    // Await params in Next.js 15
    const { id: maqamId } = await Promise.resolve(params);
    
    // Find the maqām
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

    // Process each comparison
    const comparisonResults = [];
    
    for (const comparison of comparisons) {
      const { tuningSystem: tuningSystemId, startingNote: startingNoteParam, transposeTo: transposeToNote } = comparison;

      // Find tuning system
      const tuningSystem = tuningSystems.find((ts) => ts.getId() === tuningSystemId);
      if (!tuningSystem) {
        comparisonResults.push({
          tuningSystem: tuningSystemId,
          startingNote: startingNoteParam,
          error: `Tuning system '${tuningSystemId}' not found`
        });
        continue;
      }

      // Validate and find starting note
      const noteNameSets = tuningSystem.getNoteNameSets();
      const matchingSet = noteNameSets.find(
        (set) => standardizeText(set[0]) === standardizeText(startingNoteParam)
      );
      
      if (!matchingSet) {
        comparisonResults.push({
          tuningSystem: tuningSystemId,
          startingNote: startingNoteParam,
          error: `Invalid starting note '${startingNoteParam}' for tuning system '${tuningSystemId}'`,
          validOptions: noteNameSets.map((set) => set[0])
        });
        continue;
      }

      const selectedStartingNote = matchingSet[0];

      // Get pitch classes
      const pitchClasses = getTuningSystemPitchClasses(tuningSystem, selectedStartingNote);
      
      // Count pitch classes in a single octave (from tuning system's original pitch class values)
      const pitchClassesInSingleOctave = tuningSystem.getOriginalPitchClassValues().length;

      // Check if maqām is possible
      if (!maqam.isMaqamPossible(pitchClasses.map((pc) => pc.noteName))) {
        comparisonResults.push({
          tuningSystem: tuningSystemId,
          startingNote: selectedStartingNote,
          error: `Maqām '${maqam.getName()}' cannot be realized in this tuning system configuration`
        });
        continue;
      }

      // Calculate transpositions
      const transpositions = calculateMaqamTranspositions(pitchClasses, ajnas, maqam, true, 5);

      // Find specific transposition if requested
      let selectedTransposition = transpositions[0]; // Default to tahlil
      if (transposeToNote) {
        const found = transpositions.find(
          (t) => standardizeText(t.ascendingPitchClasses[0].noteName) === standardizeText(transposeToNote)
        );
        if (!found) {
          comparisonResults.push({
            tuningSystem: tuningSystemId,
            startingNote: selectedStartingNote,
            transposeTo: transposeToNote,
            error: `Cannot transpose to '${transposeToNote}' in this tuning system`,
            availableTranspositions: transpositions.map((t) => t.ascendingPitchClasses[0].noteName)
          });
          continue;
        }
        selectedTransposition = found;
      }

      // Get family classification from tahlil
      const tahlil = transpositions[0];
      const familyClassification = classifyMaqamFamily(tahlil);

      // Build ajnas objects
      const ascendingAjnasObject: any = {};
      const descendingAjnasObject: any = {};

      if (selectedTransposition.ascendingMaqamAjnas) {
        for (let i = 0; i < selectedTransposition.ascendingPitchClasses.length; i++) {
          const noteName = selectedTransposition.ascendingPitchClasses[i].noteName;
          const jinsAtThisNote = selectedTransposition.ascendingMaqamAjnas[i];
          if (jinsAtThisNote === null) {
            ascendingAjnasObject[noteName] = null;
          } else {
            const jinsObj: any = {
              id: jinsAtThisNote.jinsId,
              idName: standardizeText(jinsAtThisNote.name || ''),
              displayName: jinsAtThisNote.name || ''
            };
            if (inArabic) {
              jinsObj.displayNameAr = getJinsNameDisplayAr(jinsAtThisNote.name || '');
            }
            ascendingAjnasObject[noteName] = jinsObj;
          }
        }
      }

      if (selectedTransposition.descendingMaqamAjnas) {
        for (let i = 0; i < selectedTransposition.descendingPitchClasses.length; i++) {
          const noteName = selectedTransposition.descendingPitchClasses[i].noteName;
          const jinsAtThisNote = selectedTransposition.descendingMaqamAjnas[i];
          if (jinsAtThisNote === null) {
            descendingAjnasObject[noteName] = null;
          } else {
            const jinsObj: any = {
              id: jinsAtThisNote.jinsId,
              idName: standardizeText(jinsAtThisNote.name || ''),
              displayName: jinsAtThisNote.name || ''
            };
            if (inArabic) {
              jinsObj.displayNameAr = getJinsNameDisplayAr(jinsAtThisNote.name || '');
            }
            descendingAjnasObject[noteName] = jinsObj;
          }
        }
      }

      // Determine if transposed
      const originalTonic = maqam.getAscendingNoteNames()[0];
      const transposedTonic = selectedTransposition.ascendingPitchClasses[0].noteName;
      const isTransposed = standardizeText(originalTonic) !== standardizeText(transposedTonic);

      // Build comparison result
      const result: any = {
        maqam: {
          id: maqam.getId(),
          idName: isTransposed ? standardizeText(selectedTransposition.name) : maqam.getIdName(),
          displayName: isTransposed ? selectedTransposition.name : maqam.getName(),
          version: maqam.getVersion(),
          tonicId: standardizeText(transposedTonic),
          tonicName: transposedTonic,
          transposition: isTransposed,
          ...(isTransposed && {
            originalTonicId: standardizeText(originalTonic),
            originalTonicName: originalTonic
          }),
          maqamFamilyId: standardizeText(familyClassification.familyName),
          maqamFamilyDisplayName: familyClassification.familyName,
          ...(inArabic && {
            displayNameAr: getMaqamNameDisplayAr(isTransposed ? selectedTransposition.name : maqam.getName()),
            tonicNameAr: getNoteNameDisplayAr(transposedTonic),
            ...(isTransposed && {
              originalTonicNameAr: getNoteNameDisplayAr(originalTonic)
            }),
            maqamFamilyDisplayNameAr: getMaqamNameDisplayAr(familyClassification.familyName)
          }),
          numberOfPitchClasses: selectedTransposition.ascendingPitchClasses.length,
          isOctaveRepeating: selectedTransposition.ascendingPitchClasses.length <= 7,
          pitchClassDataType: pitchClassDataType,
          includeIntervals: includeIntervals
        },
        context: {
          tuningSystem: {
            id: tuningSystemId,
            displayName: tuningSystem.stringify(),
            version: tuningSystem.getVersion(),
            numberOfPitchClassesSingleOctave: pitchClassesInSingleOctave,
            startingNoteName: selectedStartingNote,
            ...(inArabic && {
              displayNameAr: getTuningSystemDisplayNameAr(
                tuningSystem.getCreatorArabic() || "",
                tuningSystem.getCreatorEnglish() || "",
                tuningSystem.getYear(),
                tuningSystem.getTitleArabic() || "",
                tuningSystem.getTitleEnglish() || ""
              ),
              startingNoteNameAr: getNoteNameDisplayAr(selectedStartingNote)
            }),
            referenceFrequency: tuningSystem.getReferenceFrequencies()[selectedStartingNote] ?? tuningSystem.getDefaultReferenceFrequency()
          }
        },
        pitchData: {
          ascending: formatPitchData(selectedTransposition.ascendingPitchClasses, pitchClassDataType, false, inArabic),
          descending: formatPitchData(selectedTransposition.descendingPitchClasses, pitchClassDataType, true, inArabic)
        },
        ajnas: {
          ascending: ascendingAjnasObject,
          descending: descendingAjnasObject
        }
      };

      if (includeIntervals) {
        result.intervals = {
          ascending: formatIntervalData(selectedTransposition.ascendingPitchClassIntervals, pitchClassDataType),
          descending: formatIntervalData(selectedTransposition.descendingPitchClassIntervals, pitchClassDataType)
        };
      }

      comparisonResults.push(result);
    }

    const response = NextResponse.json({
      maqam: {
        id: maqam.getId(),
        idName: maqam.getIdName(),
        displayName: maqam.getName(),
        version: maqam.getVersion(),
        ...(inArabic && { displayNameAr: getMaqamNameDisplayAr(maqam.getName()) })
      },
      comparisons: comparisonResults,
      meta: {
        totalComparisons: comparisons.length,
        successfulComparisons: comparisonResults.filter(r => !r.error).length,
        failedComparisons: comparisonResults.filter(r => r.error).length
      }
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error in GET /api/maqamat/[id]/compare:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to retrieve comparison data" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

