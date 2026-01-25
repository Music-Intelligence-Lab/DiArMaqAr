import { NextResponse } from "next/server";
import { getTuningSystems } from "@/functions/import";
import { standardizeText } from "@/functions/export";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { handleCorsPreflightRequest, addCorsHeaders } from "@/app/api/cors";
import { calculateInterval } from "@/models/PitchClass";
import PitchClass from "@/models/PitchClass";
import { parseInArabic, getNoteNameDisplayAr, getTuningSystemDisplayNameAr } from "@/app/api/arabic-helpers";
import detectPitchClassValueType from "@/functions/detectPitchClassType";
import {
  octaveZeroNoteNames,
  octaveOneNoteNames,
  octaveTwoNoteNames,
  octaveThreeNoteNames,
  octaveFourNoteNames
} from "@/models/NoteName";
import {
  buildEntityNamespace,
  buildIdentifierNamespace,
  buildLinksNamespace
} from "@/app/api/response-shapes";

export const OPTIONS = handleCorsPreflightRequest;

/**
 * Detect the type of a single value (not an array)
 * Uses similar logic to detectPitchClassValueType but for a single value
 */
function detectSingleValueType(value: string): "fraction" | "cents" | "decimalRatio" | "stringLength" | "fretDivision" | "unknown" {
  const trimmed = value.trim();
  if (!trimmed) return "unknown";

  // Check for fraction pattern (e.g., "3/2", "4:3")
  const fractionRegex = /^[1-9]\d*[/:][1-9]\d*$/;
  if (fractionRegex.test(trimmed)) {
    return "fraction";
  }

  // Parse as number
  const num = parseFloat(trimmed);
  if (isNaN(num)) return "unknown";

  // Check for decimal ratio range (1.0-2.0) - must check before cents
  if (num >= 1.0 && num < 2.0) {
    return "decimalRatio";
  }

  // Check for fret division (>= 1000 or > 1200) - must check before cents
  if (num >= 1000 || num > 1200) {
    return "fretDivision";
  }

  // Check for cents range (0-1200, excluding decimal ratio and fret division ranges)
  if (num >= 0 && num < 1200) {
    return "cents";
  }

  // Check for string length (typically large descending values, but we can't determine direction from single value)
  // For single values, we'll default to stringLength if it's a large number
  if (num > 100) {
    return "stringLength";
  }

  return "unknown";
}

/**
 * Normalize fraction format (handle both "/" and ":")
 */
function normalizeFraction(fraction: string): string {
  return fraction.replace(":", "/");
}

/**
 * Find pitch class by value in tuning system
 * Returns null if not found
 */
function findPitchClassByValue(
  pitchClasses: PitchClass[],
  value: string,
  valueType: "fraction" | "cents" | "decimalRatio" | "stringLength" | "fretDivision"
): PitchClass | null {
  for (const pc of pitchClasses) {
    let matches = false;

    switch (valueType) {
      case "fraction":
        const normalizedInput = normalizeFraction(value);
        const normalizedPc = normalizeFraction(pc.fraction);
        matches = normalizedInput === normalizedPc;
        break;
      case "cents":
        matches = Math.abs(parseFloat(pc.cents) - parseFloat(value)) < 0.0001; // Small tolerance for floating point
        break;
      case "decimalRatio":
        matches = Math.abs(parseFloat(pc.decimalRatio) - parseFloat(value)) < 0.0001;
        break;
      case "stringLength":
        matches = Math.abs(parseFloat(pc.stringLength) - parseFloat(value)) < 0.0001;
        break;
      case "fretDivision":
        matches = Math.abs(parseFloat(pc.fretDivision) - parseFloat(value)) < 0.0001;
        break;
    }

    if (matches) {
      return pc;
    }
  }

  return null;
}

/**
 * Find pitch class by note name or value
 * Returns the pitch class and the identifier used to find it
 */
function findPitchClass(
  pitchClasses: PitchClass[],
  identifier: string,
  valueType?: "fraction" | "cents" | "decimalRatio" | "stringLength" | "fretDivision"
): { pitchClass: PitchClass; identifierType: "noteName" | "value"; valueType?: string } | null {
  // First, try to find by note name
  const allNoteNames = [
    ...octaveZeroNoteNames,
    ...octaveOneNoteNames,
    ...octaveTwoNoteNames,
    ...octaveThreeNoteNames,
    ...octaveFourNoteNames
  ];

  const matchingNoteName = allNoteNames.find(
    name => standardizeText(name) === standardizeText(identifier)
  );

  if (matchingNoteName) {
    const pitchClass = pitchClasses.find(
      pc => standardizeText(pc.noteName) === standardizeText(matchingNoteName)
    );
    if (pitchClass) {
      return { pitchClass, identifierType: "noteName" };
    }
  }

  // If not found by note name, try to find by value
  const detectedType = valueType || detectSingleValueType(identifier);
  if (detectedType === "unknown") {
    return null;
  }

  const pitchClass = findPitchClassByValue(pitchClasses, identifier, detectedType);
  if (pitchClass) {
    return { pitchClass, identifierType: "value", valueType: detectedType };
  }

  return null;
}

/**
 * Format interval value based on requested unit
 */
function formatIntervalByUnit(
  interval: ReturnType<typeof calculateInterval>,
  unit: "fraction" | "cents" | "centsFromZero" | "decimalRatio" | "stringLength" | "fretDivision"
): string | number {
  switch (unit) {
    case "fraction":
      return interval.fraction;
    case "cents":
      return parseFloat(interval.cents.toFixed(3));
    case "centsFromZero":
      // For intervals, centsFromZero is the same as cents (intervals are already relative)
      return parseFloat(interval.cents.toFixed(3));
    case "decimalRatio":
      return parseFloat(interval.decimalRatio.toFixed(3));
    case "stringLength":
      return parseFloat(interval.stringLength.toFixed(3));
    case "fretDivision":
      return parseFloat(interval.fretDivision.toFixed(3));
    default:
      return parseFloat(interval.cents.toFixed(3));
  }
}

/**
 * Build tuning system context object
 */
function buildTuningSystemContext(
  tuningSystem: ReturnType<typeof getTuningSystems>[0],
  startingNote: string,
  referenceFrequency: number,
  inArabic: boolean
) {
  return {
    tuningSystem: buildEntityNamespace(
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
    ),
    startingNote: buildIdentifierNamespace(
      {
        idName: standardizeText(startingNote),
        displayName: startingNote
      },
      {
        inArabic,
        displayAr: inArabic ? getNoteNameDisplayAr(startingNote) : undefined
      }
    ),
    referenceFrequency
  };
}

/**
 * GET /api/intervals/calculate
 * 
 * Calculate the interval between two pitch classes in a specific tuning system.
 * 
 * Query Parameters:
 * - from: Required - First pitch class identifier (note name or value)
 * - to: Required - Second pitch class identifier (note name or value)
 * - tuningSystem: Required - Tuning system ID
 * - startingNote: Required - Starting note for the tuning system
 * - unit: Required - Output unit format: fraction, cents, centsFromZero, decimalRatio, stringLength, or fretDivision
 * - fromType: Optional - Type of 'from' value if it's a value: fraction, cents, decimalRatio, stringLength, or fretDivision
 * - toType: Optional - Type of 'to' value if it's a value: fraction, cents, decimalRatio, stringLength, or fretDivision
 * - includeArabic: true/false - Include Arabic display names (default: true)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const tuningSystemId = searchParams.get("tuningSystem");
    const startingNoteParam = searchParams.get("startingNote");
    const unitParam = searchParams.get("unit");
    const fromTypeParam = searchParams.get("fromType");
    const toTypeParam = searchParams.get("toType");

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

    // Validate required parameters
    if (!fromParam) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "from parameter is required",
            message: "The first pitch class identifier must be provided.",
            hint: "Add &from=rast or &from=3/2 to your request"
          },
          { status: 400 }
        )
      );
    }

    if (fromParam.trim() === "") {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "Invalid parameter: from",
            message: "The 'from' parameter cannot be empty.",
            hint: "Specify a note name like '?from=rast' or a value like '?from=3/2&fromType=fraction'"
          },
          { status: 400 }
        )
      );
    }

    if (!toParam) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "to parameter is required",
            message: "The second pitch class identifier must be provided.",
            hint: "Add &to=dugah or &to=5/4 to your request"
          },
          { status: 400 }
        )
      );
    }

    if (toParam.trim() === "") {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "Invalid parameter: to",
            message: "The 'to' parameter cannot be empty.",
            hint: "Specify a note name like '?to=dugah' or a value like '?to=5/4&toType=fraction'"
          },
          { status: 400 }
        )
      );
    }

    if (!tuningSystemId) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "tuningSystem parameter is required",
            message: "A tuning system ID must be provided.",
            hint: "Add &tuningSystem=ibnsina_1037 to your request"
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
            message: "The 'tuningSystem' parameter cannot be empty.",
            hint: "Specify a tuning system like '?tuningSystem=ibnsina_1037'"
          },
          { status: 400 }
        )
      );
    }

    if (!startingNoteParam) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "startingNote parameter is required",
            message: "A starting note must be provided.",
            hint: "Add &startingNote=yegah to your request"
          },
          { status: 400 }
        )
      );
    }

    if (startingNoteParam.trim() === "") {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "Invalid parameter: startingNote",
            message: "The 'startingNote' parameter cannot be empty.",
            hint: "Specify a starting note like '?startingNote=yegah'"
          },
          { status: 400 }
        )
      );
    }

    if (!unitParam) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "unit parameter is required",
            message: "An output unit format must be provided.",
            validOptions: ["fraction", "cents", "centsFromZero", "decimalRatio", "stringLength", "fretDivision"],
            hint: "Add &unit=cents to your request"
          },
          { status: 400 }
        )
      );
    }

    const validUnits = ["fraction", "cents", "centsFromZero", "decimalRatio", "stringLength", "fretDivision"];
    if (!validUnits.includes(unitParam)) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: `Invalid unit '${unitParam}'`,
            message: "The unit must be one of the valid options.",
            validOptions: validUnits,
            hint: `Use one of: ${validUnits.join(", ")}`
          },
          { status: 400 }
        )
      );
    }

    const validValueTypes = ["fraction", "cents", "decimalRatio", "stringLength", "fretDivision"];
    if (fromTypeParam && !validValueTypes.includes(fromTypeParam)) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: `Invalid fromType '${fromTypeParam}'`,
            message: "The fromType must be one of the valid options.",
            validOptions: validValueTypes,
            hint: `Use one of: ${validValueTypes.join(", ")}`
          },
          { status: 400 }
        )
      );
    }

    if (toTypeParam && !validValueTypes.includes(toTypeParam)) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: `Invalid toType '${toTypeParam}'`,
            message: "The toType must be one of the valid options.",
            validOptions: validValueTypes,
            hint: `Use one of: ${validValueTypes.join(", ")}`
          },
          { status: 400 }
        )
      );
    }

    // Get tuning system
    const tuningSystems = getTuningSystems();
    const selectedTuningSystem = tuningSystems.find(
      ts => standardizeText(ts.getId()) === standardizeText(tuningSystemId)
    );

    if (!selectedTuningSystem) {
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

    // Validate starting note
    const noteNameSets = selectedTuningSystem.getNoteNameSets();
    const matchingSet = noteNameSets.find(
      (set) => standardizeText(set[0] || "") === standardizeText(startingNoteParam)
    );

    if (!matchingSet || !matchingSet[0]) {
      const validStartingNotes = noteNameSets.map((set) => set[0]).filter(Boolean);
      return addCorsHeaders(
        NextResponse.json(
          {
            error: `Invalid startingNote '${startingNoteParam}'`,
            validOptions: validStartingNotes,
            hint: `Valid starting notes for this tuning system: ${validStartingNotes.join(", ")}`
          },
          { status: 400 }
        )
      );
    }

    const selectedStartingNote = matchingSet[0];
    const pitchClasses = getTuningSystemPitchClasses(selectedTuningSystem, selectedStartingNote as any);

    // Find pitch classes
    const fromResult = findPitchClass(
      pitchClasses,
      fromParam,
      fromTypeParam as "fraction" | "cents" | "decimalRatio" | "stringLength" | "fretDivision" | undefined
    );

    if (!fromResult) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: `Pitch class '${fromParam}' not found`,
            message: `Could not find a pitch class matching '${fromParam}' in tuning system '${tuningSystemId}' with starting note '${startingNoteParam}'.`,
            hint: "Use /api/pitch-classes/note-names to see all valid note names, or ensure the value matches exactly a pitch class value in the tuning system"
          },
          { status: 404 }
        )
      );
    }

    const toResult = findPitchClass(
      pitchClasses,
      toParam,
      toTypeParam as "fraction" | "cents" | "decimalRatio" | "stringLength" | "fretDivision" | undefined
    );

    if (!toResult) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: `Pitch class '${toParam}' not found`,
            message: `Could not find a pitch class matching '${toParam}' in tuning system '${tuningSystemId}' with starting note '${startingNoteParam}'.`,
            hint: "Use /api/pitch-classes/note-names to see all valid note names, or ensure the value matches exactly a pitch class value in the tuning system"
          },
          { status: 404 }
        )
      );
    }

    // Calculate interval
    const interval = calculateInterval(fromResult.pitchClass, toResult.pitchClass);

    // Format interval value
    const intervalValue = formatIntervalByUnit(interval, unitParam as typeof validUnits[number]);

    // Calculate reference frequency
    const referenceFrequency = (typeof fromResult.pitchClass.frequency === 'number' 
      ? fromResult.pitchClass.frequency 
      : parseFloat(String(fromResult.pitchClass.frequency || '0'))) 
      / (parseFloat(String(fromResult.pitchClass.decimalRatio || '1')));

    // Build response
    const tuningSystemContext = buildTuningSystemContext(
      selectedTuningSystem,
      selectedStartingNote,
      referenceFrequency,
      inArabic
    );

    // Build identifier namespaces for from and to
    const fromIdentifier = fromResult.identifierType === "noteName"
      ? buildIdentifierNamespace(
          {
            idName: standardizeText(fromResult.pitchClass.noteName),
            displayName: fromResult.pitchClass.noteName
          },
          {
            inArabic,
            displayAr: inArabic ? getNoteNameDisplayAr(fromResult.pitchClass.noteName) : undefined
          }
        )
      : buildIdentifierNamespace(
          {
            idName: standardizeText(fromParam),
            displayName: fromParam
          },
          { inArabic }
        );

    const toIdentifier = toResult.identifierType === "noteName"
      ? buildIdentifierNamespace(
          {
            idName: standardizeText(toResult.pitchClass.noteName),
            displayName: toResult.pitchClass.noteName
          },
          {
            inArabic,
            displayAr: inArabic ? getNoteNameDisplayAr(toResult.pitchClass.noteName) : undefined
          }
        )
      : buildIdentifierNamespace(
          {
            idName: standardizeText(toParam),
            displayName: toParam
          },
          { inArabic }
        );

    return addCorsHeaders(
      NextResponse.json({
        context: tuningSystemContext,
        from: {
          pitchClass: {
            pitchClassIndex: fromResult.pitchClass.pitchClassIndex,
            octave: fromResult.pitchClass.octave,
            noteName: standardizeText(fromResult.pitchClass.noteName),
            noteNameDisplay: fromResult.pitchClass.noteName,
            ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(fromResult.pitchClass.noteName) }),
            englishName: fromResult.pitchClass.englishName,
            solfege: fromResult.pitchClass.solfege,
            abjadName: fromResult.pitchClass.abjadName,
            fraction: fromResult.pitchClass.fraction,
            cents: parseFloat(fromResult.pitchClass.cents),
            decimalRatio: parseFloat(fromResult.pitchClass.decimalRatio),
            stringLength: parseFloat(fromResult.pitchClass.stringLength),
            fretDivision: parseFloat(fromResult.pitchClass.fretDivision)
          },
          identifier: fromIdentifier
        },
        to: {
          pitchClass: {
            pitchClassIndex: toResult.pitchClass.pitchClassIndex,
            octave: toResult.pitchClass.octave,
            noteName: standardizeText(toResult.pitchClass.noteName),
            noteNameDisplay: toResult.pitchClass.noteName,
            ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(toResult.pitchClass.noteName) }),
            englishName: toResult.pitchClass.englishName,
            solfege: toResult.pitchClass.solfege,
            abjadName: toResult.pitchClass.abjadName,
            fraction: toResult.pitchClass.fraction,
            cents: parseFloat(toResult.pitchClass.cents),
            decimalRatio: parseFloat(toResult.pitchClass.decimalRatio),
            stringLength: parseFloat(toResult.pitchClass.stringLength),
            fretDivision: parseFloat(toResult.pitchClass.fretDivision)
          },
          identifier: toIdentifier
        },
        interval: {
          value: intervalValue,
          unit: unitParam,
          allUnits: {
            fraction: interval.fraction,
            cents: parseFloat(interval.cents.toFixed(3)),
            decimalRatio: parseFloat(interval.decimalRatio.toFixed(3)),
            stringLength: parseFloat(interval.stringLength.toFixed(3)),
            fretDivision: parseFloat(interval.fretDivision.toFixed(3))
          }
        },
        links: buildLinksNamespace({
          self: request.url,
          tuningSystem: `/api/tuning-systems/${encodeURIComponent(tuningSystemId)}`,
          intervals: `/api/intervals?noteNames=${encodeURIComponent(fromResult.pitchClass.noteName)},${encodeURIComponent(toResult.pitchClass.noteName)}&tuningSystem=${encodeURIComponent(tuningSystemId)}&startingNote=${encodeURIComponent(startingNoteParam)}`
        })
      })
    );
  } catch (error) {
    console.error("Error in GET /api/intervals/calculate:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to calculate interval" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}
