import { NextResponse } from "next/server";
import { getAjnas, getTuningSystems } from "@/functions/import";
import { standardizeText } from "@/functions/export";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { calculateJinsTranspositions } from "@/functions/transpose";
import { handleCorsPreflightRequest, addCorsHeaders } from "@/app/api/cors";
import { calculateIpnReferenceMidiNote } from "@/functions/calculateIpnReferenceMidiNote";
import { parseInArabic, getJinsNameDisplayAr, getNoteNameDisplayAr, getTuningSystemDisplayNameAr } from "@/app/api/arabic-helpers";
import {
  buildEntityNamespace,
  buildIdentifierNamespace,
  buildLinksNamespace,
  buildListResponse,
  buildStringArrayNamespace
} from "@/app/api/response-shapes";

export const OPTIONS = handleCorsPreflightRequest;

// Roman numerals for scale degrees
const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII"];

/**
 * Format pitch data according to requested format
 * @param inArabic - Whether to return Arabic names
 */
function formatPitchData(pitchClasses: any[], format: string, inArabic: boolean = false) {
  switch (format) {
    case "all":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: romanNumerals[index] || `${index + 1}`,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        englishName: pc.englishName,
        solfege: pc.solfege,
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
        scaleDegree: romanNumerals[index] || `${index + 1}`,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        cents: parseFloat(pc.cents)
      }));
    case "fraction":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: romanNumerals[index] || `${index + 1}`,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        fraction: pc.fraction
      }));
    case "decimalRatio":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: romanNumerals[index] || `${index + 1}`,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        decimalRatio: parseFloat(pc.decimalRatio)
      }));
    case "frequency":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: romanNumerals[index] || `${index + 1}`,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        frequency: parseFloat(pc.frequency)
      }));
    default:
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: romanNumerals[index] || `${index + 1}`,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        ...(format === "englishName" && { englishName: pc.englishName }),
        ...(format === "solfege" && { solfege: pc.solfege }),
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
 * GET /api/ajnas/[id]/compare
 * 
 * Compare jins data across multiple tuning systems.
 * 
 * Query parameters:
 * - tuningSystems (required): Comma-separated tuning system IDs
 *   Format: "ibnsina_1037,alfarabi_950g"
 * - startingNote (required): Starting note name (URL-safe, diacritics-insensitive) - applies to all tuning systems
 * - pitchClassDataType (required): Output format (all, cents, fraction, etc.)
 * - intervals (optional): Include interval data ("true" or "false", default: "false")
 * - transposeTo (optional): Transpose to specific tonic note (applies to all tuning systems)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jinsId } = await params;
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
            hint: 'Format: ?tuningSystems=ibnsina_1037,alfarabi_950g',
            example: '/api/ajnas/jins_kurd/compare?tuningSystems=ibnsina_1037,alfarabi_950g&startingNote=yegah&pitchClassDataType=cents'
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
            hint: 'Format: ?tuningSystems=ibnsina_1037,alfarabi_950g'
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

    const ajnasData = getAjnas();
    const tuningSystems = getTuningSystems();
    
    // Find the jins
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

    // Process each comparison
    const comparisonResults = [];
    
    for (const comparison of comparisons) {
      const { tuningSystem: tuningSystemId, startingNote: startingNoteParam, transposeTo: transposeToNote } = comparison;

      // Find tuning system
      const tuningSystem = tuningSystems.find((ts) => standardizeText(ts.getId()) === standardizeText(tuningSystemId));
      if (!tuningSystem) {
        const fallbackTuningSystem = buildEntityNamespace(
          {
            id: tuningSystemId,
            idName: standardizeText(tuningSystemId),
            displayName: tuningSystemId,
          }
        );

        const startingNoteNamespace = buildIdentifierNamespace(
          {
            idName: standardizeText(startingNoteParam),
            displayName: startingNoteParam,
          }
        );

        comparisonResults.push({
          tuningSystem: fallbackTuningSystem,
          startingNote: startingNoteNamespace,
          error: `Tuning system '${tuningSystemId}' not found`,
        });
        continue;
      }

      // Validate and find starting note
      const noteNameSets = tuningSystem.getNoteNameSets();
      const matchingSet = noteNameSets.find(
        (set) => standardizeText(set[0]) === standardizeText(startingNoteParam)
      );
      
      if (!matchingSet) {
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

        const requestedStartingNote = buildIdentifierNamespace(
          {
            idName: standardizeText(startingNoteParam),
            displayName: startingNoteParam,
          },
          {
            inArabic,
            displayAr: inArabic ? getNoteNameDisplayAr(startingNoteParam) : undefined,
          }
        );

        const validDisplayNames = noteNameSets.map((set) => set[0]);
        const validIdNames = validDisplayNames.map((name) => standardizeText(name));

        const validOptionsNamespace = buildStringArrayNamespace(validIdNames, {
          inArabic,
          displayNames: validDisplayNames,
          displayNamesAr: inArabic ? validDisplayNames.map((name) => getNoteNameDisplayAr(name)) : undefined,
        });

        comparisonResults.push({
          tuningSystem: tuningSystemNamespace,
          startingNote: requestedStartingNote,
          error: `Invalid starting note '${startingNoteParam}' for tuning system '${tuningSystemId}'`,
          validStartingNotes: validOptionsNamespace,
        });
        continue;
      }

      const selectedStartingNote = matchingSet[0];

      // Get pitch classes
      const pitchClasses = getTuningSystemPitchClasses(tuningSystem, selectedStartingNote);
      
      // Count pitch classes in a single octave (from tuning system's original pitch class values)
      const pitchClassesInSingleOctave = tuningSystem.getOriginalPitchClassValues().length;

      // Check if jins is possible
      if (!jins.isJinsPossible(pitchClasses.map((pc) => pc.noteName))) {
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

        const startingNoteNamespace = buildIdentifierNamespace(
          {
            idName: standardizeText(selectedStartingNote),
            displayName: selectedStartingNote,
          },
          {
            inArabic,
            displayAr: inArabic ? getNoteNameDisplayAr(selectedStartingNote) : undefined,
          }
        );

        comparisonResults.push({
          tuningSystem: tuningSystemNamespace,
          startingNote: startingNoteNamespace,
          error: `Jins '${jins.getName()}' cannot be realized in this tuning system configuration`,
        });
        continue;
      }

      // Calculate transpositions
      const transpositions = calculateJinsTranspositions(pitchClasses, jins, true, 5);

      // Find specific transposition if requested
      let selectedTransposition = transpositions[0]; // Default to tahlil
      if (transposeToNote) {
        const found = transpositions.find(
          (t) => standardizeText(t.jinsPitchClasses[0].noteName) === standardizeText(transposeToNote)
        );
        if (!found) {
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

          const startingNoteNamespace = buildIdentifierNamespace(
            {
              idName: standardizeText(selectedStartingNote),
              displayName: selectedStartingNote,
            },
            {
              inArabic,
              displayAr: inArabic ? getNoteNameDisplayAr(selectedStartingNote) : undefined,
            }
          );

          const availableTranspositionsData = transpositions.map((t) => {
            const tonicNoteName = t.jinsPitchClasses[0].noteName;
            const fullJinsName = t.name;
            return {
              idName: standardizeText(fullJinsName),
              displayName: fullJinsName,
              ...(inArabic && { displayNameAr: getJinsNameDisplayAr(fullJinsName) }),
              tonic: {
                idName: standardizeText(tonicNoteName),
                displayName: tonicNoteName,
                ...(inArabic && { displayNameAr: getNoteNameDisplayAr(tonicNoteName) }),
              },
            };
          });

          comparisonResults.push({
            tuningSystem: tuningSystemNamespace,
            startingNote: startingNoteNamespace,
            transposeTo: transposeToNote,
            error: `Cannot transpose to '${transposeToNote}' in this tuning system`,
            availableTranspositions: availableTranspositionsData,
          });
          continue;
        }
        selectedTransposition = found;
      }

      // Determine if transposed
      const originalTonic = jins.getNoteNames()[0];
      const transposedTonic = selectedTransposition.jinsPitchClasses[0].noteName;
      const isTransposed = standardizeText(originalTonic) !== standardizeText(transposedTonic);

      const referenceFrequency = tuningSystem.getReferenceFrequencies()[selectedStartingNote] ?? tuningSystem.getDefaultReferenceFrequency();

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

      const startingNoteNamespace = buildIdentifierNamespace(
        {
          idName: standardizeText(selectedStartingNote),
          displayName: selectedStartingNote,
        },
        {
          inArabic,
          displayAr: inArabic ? getNoteNameDisplayAr(selectedStartingNote) : undefined,
        }
      );

      const comparisonJinsNamespace = buildEntityNamespace(
        {
          id: jins.getId(),
          idName: isTransposed ? standardizeText(selectedTransposition.name) : jins.getIdName(),
          displayName: isTransposed ? selectedTransposition.name : jins.getName(),
        },
        {
          version: jins.getVersion(),
          inArabic,
          displayNameAr: inArabic
            ? getJinsNameDisplayAr(isTransposed ? selectedTransposition.name : jins.getName())
            : undefined,
        }
      );

      const tonicNamespace = buildIdentifierNamespace(
        {
          idName: standardizeText(transposedTonic),
          displayName: transposedTonic,
        },
        {
          inArabic,
          displayAr: inArabic ? getNoteNameDisplayAr(transposedTonic) : undefined,
        }
      );

      const transpositionDetails = isTransposed
        ? {
            original: buildIdentifierNamespace(
              {
                idName: standardizeText(originalTonic),
                displayName: originalTonic,
              },
              {
                inArabic,
                displayAr: inArabic ? getNoteNameDisplayAr(originalTonic) : undefined,
              }
            ),
            resolved: tonicNamespace,
          }
        : undefined;

      // Build availableTranspositions with full jins names
      const availableTranspositionsData = transpositions.map((t) => {
        const tonicNoteName = t.jinsPitchClasses[0].noteName;
        const fullJinsName = t.name;
        return {
          idName: standardizeText(fullJinsName),
          displayName: fullJinsName,
          ...(inArabic && { displayNameAr: getJinsNameDisplayAr(fullJinsName) }),
          tonic: {
            idName: standardizeText(tonicNoteName),
            displayName: tonicNoteName,
            ...(inArabic && { displayNameAr: getNoteNameDisplayAr(tonicNoteName) }),
          },
        };
      });

      const comparisonItem: any = {
        tuningSystem: tuningSystemNamespace,
        startingNote: startingNoteNamespace,
        jins: comparisonJinsNamespace,
        tonic: tonicNamespace,
        transposition: transpositionDetails,
        stats: {
          tuningSystem: {
            numberOfPitchClassesSingleOctave: pitchClassesInSingleOctave,
            referenceFrequency,
          },
          jins: {
            numberOfPitchClasses: selectedTransposition.jinsPitchClasses.length,
          },
        },
        availableTranspositions: availableTranspositionsData,
        pitchData: formatPitchData(selectedTransposition.jinsPitchClasses, pitchClassDataType, inArabic),
        parameters: {
          pitchClassDataType,
          includeIntervals,
          transposeTo: transposeToNote || null,
        },
        links: buildLinksNamespace({
          detail: `/api/ajnas/${jins.getIdName()}?tuningSystem=${encodeURIComponent(tuningSystem.getId())}&startingNote=${encodeURIComponent(selectedStartingNote)}&pitchClassDataType=${encodeURIComponent(pitchClassDataType)}${includeIntervals ? "&intervals=true" : ""}${transposeToNote ? `&transposeTo=${encodeURIComponent(transposeToNote)}` : ""}`,
          availability: `/api/ajnas/${jins.getIdName()}/availability`,
        }),
      };

      if (includeIntervals) {
        comparisonItem.intervals = formatIntervalData(selectedTransposition.jinsPitchClassIntervals, pitchClassDataType);
      }

      comparisonResults.push(comparisonItem);
    }

    const successfulComparisons = comparisonResults.filter((r) => !r.error).length;
    const failedComparisons = comparisonResults.length - successfulComparisons;

    const comparisonsPayload = buildListResponse(comparisonResults, {
      meta: {
        totalComparisons: comparisonResults.length,
        successfulComparisons,
        failedComparisons,
      },
    });

    const jinsSummary = buildEntityNamespace(
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

    const tuningSystemsParamNamespace = buildStringArrayNamespace(
      tuningSystemIds.map((id) => standardizeText(id)),
      {
        displayNames: tuningSystemIds,
      }
    );

    const startingNoteParamNamespace = buildIdentifierNamespace(
      {
        idName: standardizeText(startingNoteParam),
        displayName: startingNoteParam,
      },
      {
        inArabic,
        displayAr: inArabic ? getNoteNameDisplayAr(startingNoteParam) : undefined,
      }
    );

    const response = NextResponse.json({
      jins: jinsSummary,
      comparisons: comparisonsPayload,
      parameters: {
        tuningSystems: tuningSystemsParamNamespace,
        startingNote: startingNoteParamNamespace,
        pitchClassDataType,
        includeIntervals,
        transposeTo: transposeToNote || null,
      },
      links: buildLinksNamespace({
        self: request.url,
        detail: `/api/ajnas/${jins.getIdName()}`,
        availability: `/api/ajnas/${jins.getIdName()}/availability`,
      }),
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error in GET /api/ajnas/[id]/compare:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to retrieve comparison data" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

