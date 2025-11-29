import { NextRequest, NextResponse } from "next/server";
import { getTuningSystems } from "@/functions/import";
import { standardizeText } from "@/functions/export";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { handleCorsPreflightRequest, addCorsHeaders } from "@/app/api/cors";
import PitchClass from "@/models/PitchClass";
import { calculateIpnReferenceMidiNote } from "@/functions/calculateIpnReferenceMidiNote";
import { parseInArabic, getNoteNameDisplayAr, getTuningSystemDisplayNameAr } from "@/app/api/arabic-helpers";
import {
  buildEntityNamespace,
  buildIdentifierNamespace,
  buildLinksNamespace,
  buildStringArrayNamespace
} from "@/app/api/response-shapes";

export const OPTIONS = handleCorsPreflightRequest;

/**
 * Format pitch data according to requested format
 * @param pitchClasses - Array of pitch classes to format
 * @param format - Output format type
 * @param inArabic - Whether to return Arabic names
 */
function formatPitchData(pitchClasses: PitchClass[], format: string, inArabic: boolean = false) {
  switch (format) {
    case "all":
      return pitchClasses.map((pc) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
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
    case "englishName":
      return pitchClasses.map((pc) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        englishName: pc.englishName
      }));
    case "solfege":
      return pitchClasses.map((pc) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        solfege: pc.solfege
      }));
    case "fraction":
      return pitchClasses.map((pc) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        fraction: pc.fraction
      }));
    case "cents":
      return pitchClasses.map((pc) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        cents: parseFloat(pc.cents)
      }));
    case "decimalRatio":
      return pitchClasses.map((pc) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        decimalRatio: parseFloat(pc.decimalRatio)
      }));
    case "stringLength":
      return pitchClasses.map((pc) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        stringLength: parseFloat(pc.stringLength)
      }));
    case "frequency":
      return pitchClasses.map((pc) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        frequency: parseFloat(pc.frequency)
      }));
    case "abjadName":
      return pitchClasses.map((pc) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        abjadName: pc.abjadName
      }));
    case "fretDivision":
      return pitchClasses.map((pc) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        fretDivision: pc.fretDivision
      }));
    case "midiNoteNumber":
      return pitchClasses.map((pc) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        midiNoteDecimal: pc.midiNoteDecimal
      }));
    case "midiNoteDeviation":
      return pitchClasses.map((pc) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        midiNotePlusCentsDeviation: `${calculateIpnReferenceMidiNote(pc)} ${pc.centsDeviation >= 0 ? '+' : ''}${pc.centsDeviation.toFixed(1)}`
      }));
    case "centsDeviation":
      return pitchClasses.map((pc) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        centsDeviation: pc.centsDeviation
      }));
    case "referenceNoteName":
      return pitchClasses.map((pc) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        ipnReferenceNoteName: pc.referenceNoteName
      }));
    default:
      return pitchClasses.map((pc) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
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
  }
}

/**
 * GET /api/tuning-systems/{id}/{startingNote}/pitch-classes
 * 
 * Get Tuning System Details - Returns all pitch classes for a specific tuning system and starting note.
 * 
 * This endpoint is essential for tuning system operations, providing comprehensive pitch class data
 * across all octaves with full formatting options.
 * 
 * Query Parameters:
 * - pitchClassDataType: Pitch class data format (optional, defaults to "all")
 *   - all, englishName, fraction, cents, decimalRatio, stringLength, frequency,
 *     abjadName, fretDivision, midiNoteNumber, midiNoteDeviation, centsDeviation, referenceNoteName
 * - octave: Filter by octave number - "all" (default) returns all octaves, or specific octave (0, 1, 2, 3)
 * - includeSources: Include bibliographic source references (sourceId and page) for the tuning system (optional, defaults to true)
 * - includeArabic: Include Arabic display names (optional, defaults to true)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; startingNote: string }> }
) {
  try {
    const { id: tuningSystemId, startingNote: startingNoteParam } = await context.params;
    const { searchParams } = new URL(request.url);
    
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

    // Validate that path parameters are not empty
    if (!tuningSystemId || tuningSystemId.trim() === "") {
      const response = NextResponse.json(
        {
          error: "Invalid path parameter: id",
          message: "The tuning system ID cannot be empty.",
          hint: "Provide a valid tuning system ID in the URL path, e.g., /api/tuning-systems/ibnsina_1037/yegah/pitch-classes"
        },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    if (!startingNoteParam || startingNoteParam.trim() === "") {
      const response = NextResponse.json(
        {
          error: "Invalid path parameter: startingNote",
          message: "The starting note cannot be empty.",
          hint: "Provide a valid starting note in the URL path, e.g., /api/tuning-systems/ibnsina_1037/yegah/pitch-classes"
        },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    const pitchClassDataType = searchParams.get("pitchClassDataType") || "all";
    const octaveFilter = searchParams.get("octave") || "all";
    const includeSources = searchParams.get("includeSources") !== "false";

    // Define valid pitch class data types
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
      "referenceNoteName"
    ];

    // Validate pitchClassDataType if provided
    if (pitchClassDataType && !validPitchClassDataTypes.includes(pitchClassDataType)) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: `Invalid pitchClassDataType '${pitchClassDataType}'`,
            validOptions: validPitchClassDataTypes,
            hint: "Use one of the valid pitch class data types"
          },
          { status: 400 }
        )
      );
    }

    // Validate octave filter
    if (octaveFilter !== "all" && !["0", "1", "2", "3"].includes(octaveFilter)) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: `Invalid octave '${octaveFilter}'`,
            message: "Octave must be 'all' or a number between 0 and 3",
            validOptions: ["all", "0", "1", "2", "3"]
          },
          { status: 400 }
        )
      );
    }

    // Get data
    const tuningSystems = getTuningSystems();

    // Find the tuning system (case-insensitive matching)
    const tuningSystem = tuningSystems.find(
      (ts: any) => standardizeText(ts.getId()) === standardizeText(tuningSystemId)
    );

    if (!tuningSystem) {
      const response = NextResponse.json(
        {
          error: "Tuning system not found",
          tuningSystemId,
          hint: "Use GET /api/tuning-systems to see available tuning systems",
        },
        { status: 404 }
      );
      return addCorsHeaders(response);
    }

    // Validate that the startingNote is valid for this tuning system
    const noteNameSets = tuningSystem.getNoteNameSets();
    const availableTuningSystemStartingNotes = noteNameSets
      .map((set: string[]) => ({
        id: standardizeText(set[0]),
        display: set[0]
      }));
    
    const normalizedParam = standardizeText(startingNoteParam);
    const matchingSet = noteNameSets.find(
      (set: string[]) => standardizeText(set[0]) === normalizedParam
    );

    if (!matchingSet) {
      const response = NextResponse.json(
        {
          error: "Invalid starting note",
          message: `The starting note "${startingNoteParam}" is not valid for tuning system ${tuningSystemId}`,
          availableTuningSystemStartingNotes: availableTuningSystemStartingNotes.map((n: any) => n.display),
          hint: `Valid starting notes for this tuning system: ${availableTuningSystemStartingNotes.map((n: any) => n.display).join(", ")}`,
        },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    const selectedStartingNote = matchingSet[0];

    // Get pitch classes
    const allPitchClasses = getTuningSystemPitchClasses(tuningSystem, selectedStartingNote as any);

    // Get unique pitch class indices (for single octave)
    const uniquePitchClassIndices = Array.from(
      new Set(allPitchClasses.map(pc => pc.pitchClassIndex))
    ).sort((a, b) => a - b);

    // Get pitch classes for formatting
    let pitchClassesForFormatting: PitchClass[];
    if (octaveFilter === "all") {
      // Return all octaves, sorted by octave then by pitch class index
      pitchClassesForFormatting = allPitchClasses
        .sort((a, b) => {
          if (a.octave !== b.octave) return a.octave - b.octave;
          return a.pitchClassIndex - b.pitchClassIndex;
        });
    } else {
      // Filter to specific octave
      const targetOctave = parseInt(octaveFilter, 10);
      pitchClassesForFormatting = allPitchClasses
        .filter(pc => pc.octave === targetOctave)
        .sort((a, b) => a.pitchClassIndex - b.pitchClassIndex);
    }

    // Format pitch classes
    const formattedPitchClasses = formatPitchData(pitchClassesForFormatting, pitchClassDataType, inArabic);

    // Build response
    const tuningSystemStartingNoteNames = Array.from(
      new Set(noteNameSets.map((set: string[]) => set[0]).filter((name): name is string => Boolean(name)))
    );

    const tuningSystemNamespace = buildEntityNamespace(
      {
        id: tuningSystemId,
        idName: standardizeText(tuningSystemId),
        displayName: tuningSystem.stringify(),
      },
      {
        version: tuningSystem.getVersion(),
        extras: {
          year: tuningSystem.getYear(),
          numberOfPitchClassesSingleOctave: tuningSystem.getOriginalPitchClassValues().length,
        },
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
      tuningSystemStartingNoteNames.map((name) => standardizeText(name)),
      {
        inArabic,
        displayNames: tuningSystemStartingNoteNames,
        displayNamesAr: inArabic
          ? tuningSystemStartingNoteNames.map((name) => getNoteNameDisplayAr(name))
          : undefined,
      }
    );

    const selectedStartingNoteNamespace = buildIdentifierNamespace(
      {
        idName: normalizedParam,
        displayName: selectedStartingNote,
      },
      {
        inArabic,
        displayAr: inArabic ? getNoteNameDisplayAr(selectedStartingNote) : undefined,
      }
    );

    // Get reference frequency
    const referenceFrequencies = tuningSystem.getReferenceFrequencies();
    const referenceFrequency = referenceFrequencies[selectedStartingNote] || tuningSystem.getDefaultReferenceFrequency();

    const stats = {
      totalPitchClasses: uniquePitchClassIndices.length,
      numberOfPitchClassesSingleOctave: tuningSystem.getOriginalPitchClassValues().length,
      referenceFrequency,
      octaves: octaveFilter === "all" ? [0, 1, 2, 3] : [parseInt(octaveFilter, 10)]
    };

    const responseData: any = {
      tuningSystem: tuningSystemNamespace,
      startingNotes: startingNotesNamespace,
      selectedStartingNote: selectedStartingNoteNamespace,
      stats,
      pitchClasses: formattedPitchClasses,
      context: {
        pitchClassDataType: pitchClassDataType,
        octave: octaveFilter
      },
      links: buildLinksNamespace({
        self: `/api/tuning-systems/${tuningSystemId}/${startingNoteParam}/pitch-classes`,
        tuningSystem: `/api/tuning-systems/${tuningSystemId}`,
      }),
    };

    if (includeSources) {
      const sourcePageReferences = tuningSystem.getSourcePageReferences();
      const sourceReferences = sourcePageReferences.map((src) => ({
        sourceId: src.sourceId,
        page: src.page,
      }));
      responseData.sources = sourceReferences;
    }

    const response = NextResponse.json(responseData);

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error in tuning systems pitch-classes endpoint:", error);
    const response = NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

