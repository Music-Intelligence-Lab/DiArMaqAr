import { NextResponse } from "next/server";
import { getAjnas, getTuningSystems } from "@/functions/import";
import { standardizeText } from "@/functions/export";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { calculateJinsTranspositions } from "@/functions/transpose";
import { handleCorsPreflightRequest, addCorsHeaders } from "@/app/api/cors";
import PitchClass from "@/models/PitchClass";
import { calculateIpnReferenceMidiNote } from "@/functions/calculateIpnReferenceMidiNote";
import { parseInArabic, getJinsNameDisplayAr, getNoteNameDisplayAr, getComments, getCommentsAr, getTuningSystemDisplayNameAr } from "@/app/api/arabic-helpers";
import {
  buildEntityNamespace,
  buildIdentifierNamespace,
  buildLinksNamespace,
  buildStringArrayNamespace
} from "@/app/api/response-shapes";

export const OPTIONS = handleCorsPreflightRequest;

/**
 * Roman numeral conversion for scale degrees
 */
const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV"];

/**
 * Format pitch data according to requested format
 * @param pitchClasses - Array of pitch classes to format
 * @param format - Output format type
 * @param inArabic - Whether to return Arabic names
 */
function formatPitchData(pitchClasses: PitchClass[], format: string, inArabic: boolean = false) {
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
    case "englishName":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: romanNumerals[index] || `${index + 1}`,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        englishName: pc.englishName
      }));
    case "solfege":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: romanNumerals[index] || `${index + 1}`,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        solfege: pc.solfege
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
    case "stringLength":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: romanNumerals[index] || `${index + 1}`,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        stringLength: parseFloat(pc.stringLength)
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
    case "abjadName":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: romanNumerals[index] || `${index + 1}`,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        abjadName: pc.abjadName
      }));
    case "fretDivision":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: romanNumerals[index] || `${index + 1}`,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        fretDivision: pc.fretDivision
      }));
    case "midiNoteNumber":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: romanNumerals[index] || `${index + 1}`,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        midiNoteDecimal: pc.midiNoteDecimal
      }));
    case "midiNoteDeviation":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: romanNumerals[index] || `${index + 1}`,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        midiNotePlusCentsDeviation: `${calculateIpnReferenceMidiNote(pc)} ${pc.centsDeviation >= 0 ? '+' : ''}${pc.centsDeviation.toFixed(1)}`
      }));
    case "centsDeviation":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: romanNumerals[index] || `${index + 1}`,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        centsDeviation: pc.centsDeviation
      }));
    case "referenceNoteName":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: romanNumerals[index] || `${index + 1}`,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        ipnReferenceNoteName: pc.referenceNoteName
      }));
    default:
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: romanNumerals[index] || `${index + 1}`,
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        cents: parseFloat(pc.cents)
      }));
  }
}

/**
 * Format interval data according to requested format
 */
function formatIntervalData(intervals: any[], format: string) {
  switch (format) {
    case "cents":
      return intervals.map((interval) => ({
        cents: parseFloat(interval.cents)
      }));
    case "fraction":
      return intervals.map((interval) => ({
        fraction: interval.fraction
      }));
    case "decimalRatio":
      return intervals.map((interval) => ({
        decimalRatio: parseFloat(interval.decimalRatio)
      }));
    case "stringLength":
      return intervals.map((interval) => ({
        stringLength: parseFloat(interval.stringLength)
      }));
    case "frequency":
      return intervals.map((interval) => ({
        frequency: parseFloat(interval.frequency)
      }));
    default:
      return intervals; // Return full objects
  }
}

/**
 * GET /api/ajnas/[id]
 * 
 * Returns jins data with flexible formatting options.
 * 
 * REQUIRED Query Parameters:
 * - tuningSystem: ID of tuning system (required for all requests)
 * - startingNote: Starting note (URL-friendly) - MANDATORY for all pitch class calculations (required for all requests)
 * - pitchClassDataType: Pitch class data format - REQUIRED for data retrieval, optional for discovery mode (options=true)
 *   - all: All data types
 *   - englishName, fraction, cents, decimalRatio, stringLength, frequency,
 *     abjadName, fretDivision, midiNoteNumber, midiNoteDeviation, centsDeviation, referenceNoteName
 * - includeIntervals: true|false (include interval data, default: true)
 * - transposeTo: Transpose to specific tonic note (URL-friendly)
 * - includeArabic: true|false (include Arabic display names, default: true)
 * - options: true returns available parameters instead of data
 * 
 * Response includes:
 * - jins.tonic: URL-friendly tonic note name
 * - jins.transposition: true/false indicating if this is a transposition
 * - jins.commentsEnglish: English commentary (null if none)
 * - jins.commentsArabic: Arabic commentary (null if none)
 * - jins.sources: Array of {sourceId, page} references
 * - context.startingNote: URL-friendly starting note
 * - context.referenceFrequency: Reference frequency in Hz
 * - context.pitchClassDataType: The format parameter value
 * - context.includeIntervals: Boolean indicating if intervals are included
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jinsId } = await params;
    const { searchParams } = new URL(request.url);
    const tuningSystemId = searchParams.get("tuningSystem");
    const startingNote = searchParams.get("startingNote");
    const pitchClassDataType = searchParams.get("pitchClassDataType");
    const includeIntervals = searchParams.get("includeIntervals") !== "false";
    const transposeToNote = searchParams.get("transposeTo");
    const showOptions = searchParams.get("options") === "true";

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

    const ajnasData = getAjnas();
    const tuningSystems = getTuningSystems();

    // Define valid pitch class data types (used for validation)
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
    if (pitchClassDataType !== null) {
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

    // Check if jinsId is empty or invalid
    if (!jinsId || jinsId.trim() === "") {
      return addCorsHeaders(
        NextResponse.json(
          { 
            error: "No jins selected",
            hint: "Please specify a jins ID",
            example: `/api/ajnas/jins_kurd?tuningSystem=ibnsina_1037&startingNote=yegah` 
          },
          { status: 400 }
        )
      );
    }
    
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

    // Validate that required parameters are not empty strings
    if (tuningSystemId !== null && tuningSystemId.trim() === "") {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "Invalid parameter: tuningSystem",
            message: "The 'tuningSystem' parameter cannot be empty. Provide a valid tuning system ID.",
            hint: "Specify a tuning system like '?tuningSystem=ibnsina_1037'"
          },
          { status: 400 }
        )
      );
    }

    if (startingNote !== null && startingNote.trim() === "") {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "Invalid parameter: startingNote",
            message: "The 'startingNote' parameter cannot be empty. Provide a valid note name.",
            hint: "Specify a starting note like '?startingNote=yegah'"
          },
          { status: 400 }
        )
      );
    }

    if (transposeToNote !== null && transposeToNote.trim() === "") {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "Invalid parameter: transposeTo",
            message: "The 'transposeTo' parameter cannot be empty. Either omit it or provide a valid note name.",
            hint: "Remove '?transposeTo=' from your URL or specify a note like '?transposeTo=rast'"
          },
          { status: 400 }
        )
      );
    }

    // If options=true, return available parameters
    if (showOptions) {
      // Check for conflicting data-returning parameters
      const conflictingParams: string[] = [];
      if (transposeToNote) conflictingParams.push("transposeTo");
      if (pitchClassDataType && pitchClassDataType !== "cents") conflictingParams.push("pitchClassDataType");
      if (includeIntervals) conflictingParams.push("intervals");

      if (conflictingParams.length > 0) {
        return addCorsHeaders(
          NextResponse.json(
            {
              error: "Conflicting parameters with options=true",
              message: `The following data-returning parameters cannot be used with options=true (parameter discovery mode): ${conflictingParams.join(", ")}`,
              hint: "Remove all data-returning parameters to use discovery mode, or remove options=true to retrieve jins data.",
              conflictingParameters: conflictingParams,
              contextualParametersAllowed: ["tuningSystem", "startingNote", "pitchClassDataType"]
            },
            { status: 400 }
          )
        );
      }

      // Require tuningSystem
      if (!tuningSystemId) {
        return addCorsHeaders(
          NextResponse.json(
            {
              error: "tuningSystem parameter is required",
              message: "Tuning system is required for all requests (both data retrieval and discovery mode).",
              hint: `Add &tuningSystem=ibnsina_1037 to your request. Use /api/ajnas/${jinsId}/availability to see available tuning systems`,
              availabilityUrl: `/api/ajnas/${jinsId}/availability`
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
              message: "The 'tuningSystem' parameter cannot be empty. Provide a valid tuning system ID.",
              hint: "Specify a tuning system like '?tuningSystem=ibnsina_1037'"
            },
            { status: 400 }
          )
        );
      }

      const selectedTuningSystem = tuningSystems.find((ts) => standardizeText(ts.getId()) === standardizeText(tuningSystemId));
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

      // Require startingNote
      if (!startingNote) {
        const noteNameSets = selectedTuningSystem.getNoteNameSets();
        const validOptions = noteNameSets.map((set) => set[0]);
        return addCorsHeaders(
          NextResponse.json(
            {
              error: "startingNote parameter is required",
              message: "A tuning system starting note must be specified. This is mandatory for all requests.",
              validOptions: validOptions,
              hint: `Add &startingNote=${validOptions[0]} to your request`
            },
            { status: 400 }
          )
        );
      }

      if (startingNote.trim() === "") {
        return addCorsHeaders(
          NextResponse.json(
            {
              error: "Invalid parameter: startingNote",
              message: "The 'startingNote' parameter cannot be empty. Provide a valid note name.",
              hint: "Specify a starting note like '?startingNote=yegah'"
            },
            { status: 400 }
          )
        );
      }
      
      // Get available starting notes for this tuning system
      const noteNameSets = selectedTuningSystem.getNoteNameSets();
      const matchingSet = noteNameSets.find(
        (set) => standardizeText(set[0]) === standardizeText(startingNote)
      );
      if (!matchingSet) {
        const validStartingNotes = noteNameSets.map((set) => set[0]);
        return addCorsHeaders(
          NextResponse.json(
            {
              error: `Invalid startingNote '${startingNote}'`,
              validOptions: validStartingNotes,
              hint: `Valid starting notes for this tuning system: ${validStartingNotes.join(", ")}`
            },
            { status: 400 }
          )
        );
      }
      
      const selectedStartingNote = matchingSet[0];
      
      // Get pitch classes and calculate valid transpositions
      const pitchClasses = getTuningSystemPitchClasses(selectedTuningSystem, selectedStartingNote);
      const transpositions = calculateJinsTranspositions(pitchClasses, jins, true, 5);
      const transposeOptions = transpositions.map((t) => t.jinsPitchClasses[0].noteName);

      return addCorsHeaders(
        NextResponse.json({
          jins: jins.getName(),
          tuningSystem: tuningSystemId,
          availableParameters: {
            tuningSystem: {
              required: true,
              description: "ID of tuning system (see /availability for options)"
            },
            startingNote: {
              options: noteNameSets.map((set) => set[0]),
              required: true,
              description: "Theoretical framework for note naming. Required for all requests (data retrieval and discovery). Needed to calculate transposition options."
            },
            pitchClassDataType: {
              options: validPitchClassDataTypes,
              required: true,
              description: "Output format for pitch data. Required for data retrieval (when not using options=true). Optional for discovery mode (options=true). Use 'all' for complete pitch class information."
            },
            intervals: {
              type: "boolean",
              default: false,
              description: "Include interval data between pitch classes"
            },
            transposeTo: {
              options: transposeOptions.length > 0 ? transposeOptions.map(note => standardizeText(note)) : [],
              description: "Transpose to specific tonic (taṣwīr) - only valid transpositions shown. Calculated based on the provided tuningSystem and startingNote."
            }
          },
          notes: {
            formatOptions: "The 'pitchClassDataType' parameter controls which pitch class properties are returned. Use 'all' for comprehensive data or specific formats like 'cents', 'fraction', etc. for targeted data."
          },
          examples: [
            `/api/ajnas/${jinsId}?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents&intervals=true`,
            `/api/ajnas/${jinsId}?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=cents&transposeTo=nawa`,
            `/api/ajnas/${jinsId}?tuningSystem=ibnsina_1037&startingNote=yegah&pitchClassDataType=all`
          ]
        })
      );
    }

    // Require pitchClassDataType for data retrieval
    if (!showOptions && !pitchClassDataType) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "pitchClassDataType parameter is required",
            message: "Pitch class data type must be specified for data retrieval. This determines which pitch class properties are returned.",
            validOptions: validPitchClassDataTypes,
            hint: `Add &pitchClassDataType=cents to your request. Use 'all' for complete pitch class information. For parameter discovery, use &options=true (pitchClassDataType is optional in discovery mode).`
          },
          { status: 400 }
        )
      );
    }

    // Require tuning system for actual data
    if (!tuningSystemId) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "tuningSystem parameter is required",
            hint: `Use /api/ajnas/${jinsId}/availability to see available tuning systems`,
            availabilityUrl: `/api/ajnas/${jinsId}/availability`
          },
          { status: 400 }
        )
      );
    }

    // Find tuning system
    const tuningSystem = tuningSystems.find((ts) => standardizeText(ts.getId()) === standardizeText(tuningSystemId));
    if (!tuningSystem) {
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

    // Require starting note
    if (!startingNote) {
      const noteNameSets = tuningSystem.getNoteNameSets();
      const validOptions = noteNameSets.map((set) => set[0]);
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "startingNote parameter is required",
            message: "A tuning system starting note must be specified. This is mandatory for all pitch class calculations.",
            validOptions: validOptions,
            hint: `Add &startingNote=${validOptions[0]} to your request`
          },
          { status: 400 }
        )
      );
    }

    // Determine starting note
    const noteNameSets = tuningSystem.getNoteNameSets();
    const tuningSystemStartingNoteNames = Array.from(
      new Set(noteNameSets.map((set) => set[0]).filter((name): name is string => Boolean(name)))
    );
    const tuningSystemStartingNoteNamesIds = tuningSystemStartingNoteNames.map((name) => standardizeText(name));
    let selectedStartingNote: string;
    
    const matchingSet = noteNameSets.find(
      (set) => standardizeText(set[0]) === standardizeText(startingNote)
    );
    if (matchingSet) {
      selectedStartingNote = matchingSet[0];
    } else {
      const validStartingNotes = noteNameSets.map((set) => set[0]);
      return addCorsHeaders(
        NextResponse.json(
          {
            error: `Invalid startingNote '${startingNote}'`,
            validOptions: validStartingNotes,
            hint: `Valid starting notes for this tuning system: ${validStartingNotes.join(", ")}`
          },
          { status: 400 }
        )
      );
    }

    // Get pitch classes
    const pitchClasses = getTuningSystemPitchClasses(tuningSystem, selectedStartingNote);

    // Check if jins is possible in this tuning
    const noteNameSetsExpanded = tuningSystem.getNoteNameSetsWithAdjacentOctaves();
    const isPossible = noteNameSetsExpanded.some(set => jins.isJinsPossible(set));
    if (!isPossible) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: `Jins '${jins.getName()}' cannot be realized in tuning system '${tuningSystemId}' with starting note '${selectedStartingNote}'`,
            hint: `Use /api/ajnas/${jinsId}/availability to see compatible tuning systems`
          },
          { status: 422 }
        )
      );
    }

    // Calculate transpositions
    const transpositions = calculateJinsTranspositions(pitchClasses, jins, true, 5);

    // Find specific transposition if requested
    let selectedTransposition = transpositions[0]; // Default to first (tahlil)
    if (transposeToNote) {
      const found = transpositions.find(
        (t) => standardizeText(t.jinsPitchClasses[0].noteName) === standardizeText(transposeToNote)
      );
      if (!found) {
        return addCorsHeaders(
          NextResponse.json(
            {
              error: `Cannot transpose to '${transposeToNote}' in this tuning system`,
              availableTranspositions: transpositions.map((t) => ({
                idName: standardizeText(t.name),
                displayName: t.name,
                tonic: {
                  idName: standardizeText(t.jinsPitchClasses[0].noteName),
                  displayName: t.jinsPitchClasses[0].noteName,
                },
              }))
            },
            { status: 400 }
          )
        );
      }
      selectedTransposition = found;
    }

    // Get sources
    const sources = jins.getSourcePageReferences();

    // Get tuning system pitch class counts and original value type
    const tuningSystemPitchClassCountAllOctaves = pitchClasses.length;
    const tuningSystemPitchClassCountSingleOctave = tuningSystem.getOriginalPitchClassValues().length;
    const originalValueType = pitchClasses[0]?.originalValueType || "unknown";

    // Determine if this is a transposition (taṣwīr)
    const originalJinsTonic = jins.getNoteNames()[0];
    const transposedJinsTonic = selectedTransposition.jinsPitchClasses[0].noteName;
    const isTransposed = standardizeText(originalJinsTonic) !== standardizeText(transposedJinsTonic);

    const commentsEnglish = getComments(jins.getCommentsEnglish());
    const commentsArabic = getCommentsAr(jins.getCommentsArabic());

    const referenceFrequency = tuningSystem.getReferenceFrequencies()[selectedStartingNote] ?? tuningSystem.getDefaultReferenceFrequency();

    const jinsNamespace = buildEntityNamespace(
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
        idName: standardizeText(transposedJinsTonic),
        displayName: transposedJinsTonic,
      },
      {
        inArabic,
        displayAr: inArabic ? getNoteNameDisplayAr(transposedJinsTonic) : undefined,
      }
    );

    const transpositionDetails = isTransposed
      ? {
          original: buildIdentifierNamespace(
            {
              idName: standardizeText(originalJinsTonic),
              displayName: originalJinsTonic,
            },
            {
              inArabic,
              displayAr: inArabic ? getNoteNameDisplayAr(originalJinsTonic) : undefined,
            }
          ),
          resolved: tonicNamespace,
        }
      : undefined;

    const stats = {
      numberOfTranspositions: transpositions.length,
      numberOfPitchClasses: selectedTransposition.jinsPitchClasses.length,
    };

    const comments = {
      english: commentsEnglish,
      arabic: commentsArabic,
    };

    const sourceReferences = sources.map((src) => ({
      sourceId: src.sourceId,
      page: src.page,
    }));

    const tuningSystemNamespace = buildEntityNamespace(
      {
        id: tuningSystemId,
        idName: standardizeText(tuningSystemId),
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

    const startingNotesNamespace = buildStringArrayNamespace(tuningSystemStartingNoteNamesIds, {
      inArabic,
      displayNames: tuningSystemStartingNoteNames,
      displayNamesAr: inArabic
        ? tuningSystemStartingNoteNames.map((name) => getNoteNameDisplayAr(name))
        : undefined,
    });

    const selectedStartingNoteNamespace = buildIdentifierNamespace(
      {
        idName: standardizeText(selectedStartingNote),
        displayName: selectedStartingNote,
      },
      {
        inArabic,
        displayAr: inArabic ? getNoteNameDisplayAr(selectedStartingNote) : undefined,
      }
    );

    const responseData: any = {
      jins: jinsNamespace,
      tonic: tonicNamespace,
      transposition: transpositionDetails,
      stats,
      comments,
      sources: sourceReferences,
      parameters: {
        pitchClassDataType,
        includeIntervals,
      },
      context: {
        tuningSystem: {
          ...tuningSystemNamespace,
          startingNotes: startingNotesNamespace,
          selectedStartingNote: selectedStartingNoteNamespace,
          pitchClassCounts: {
            singleOctave: tuningSystemPitchClassCountSingleOctave,
            allOctaves: tuningSystemPitchClassCountAllOctaves,
          },
          originalValueType,
          referenceFrequency,
        },
      },
      links: buildLinksNamespace({
        self: request.url,
        detail: `/api/ajnas/${jins.getIdName()}`,
        availability: `/api/ajnas/${jins.getIdName()}/availability`,
      }),
    };

    // Always include pitch data (ajnās are unidirectional)
    responseData.pitchData = formatPitchData(selectedTransposition.jinsPitchClasses, pitchClassDataType || "all", inArabic);

    // Add intervals if requested
    if (includeIntervals) {
      responseData.intervals = formatIntervalData(selectedTransposition.jinsPitchClassIntervals, pitchClassDataType || "all");
    }

    return addCorsHeaders(NextResponse.json(responseData));
  } catch (error) {
    console.error("Error in GET /api/ajnas/[id]:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to retrieve jins data", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

