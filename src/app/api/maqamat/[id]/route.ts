import { NextResponse } from "next/server";
import { getMaqamat, getTuningSystems, getAjnas } from "@/functions/import";
import { standardizeText } from "@/functions/export";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { calculateMaqamTranspositions } from "@/functions/transpose";
import modulate from "@/functions/modulate";
import { handleCorsPreflightRequest, addCorsHeaders } from "@/app/api/cors";
import PitchClass from "@/models/PitchClass";
import { calculateIpnReferenceMidiNote } from "@/functions/calculateIpnReferenceMidiNote";
import { classifyMaqamFamily } from "@/functions/classifyMaqamFamily";
import { MaqamatModulations, shiftMaqamByOctaves } from "@/models/Maqam";
import { AjnasModulations, shiftJinsByOctaves } from "@/models/Jins";
import { parseInArabic, getMaqamNameDisplayAr, getJinsNameDisplayAr, getNoteNameDisplayAr, getComments, getCommentsAr, getTuningSystemDisplayNameAr } from "@/app/api/arabic-helpers";
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
 * @param isDescending - Whether this is descending data (reverses scale degrees)
 * @param inArabic - Whether to return Arabic script for note names
 */
function formatPitchData(pitchClasses: PitchClass[], format: string | null | undefined, isDescending: boolean = false, inArabic: boolean = false) {
  const length = pitchClasses.length;
  
  // Return minimal fields when pitchClassDataType is not provided
  if (!format || format === "") {
    return pitchClasses.map((pc, index) => ({
      pitchClassIndex: pc.pitchClassIndex,
      octave: pc.octave,
      scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
      noteName: standardizeText(pc.noteName),
      noteNameDisplay: pc.noteName,
      ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) })
    }));
  }
  
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
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        englishName: pc.englishName
      }));
    case "solfege":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        solfege: pc.solfege
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
    case "stringLength":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        stringLength: parseFloat(pc.stringLength)
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
    case "abjadName":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        abjadName: pc.abjadName
      }));
    case "fretDivision":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        fretDivision: pc.fretDivision
      }));
    case "midiNoteNumber":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        midiNoteDecimal: pc.midiNoteDecimal
      }));
    case "midiNoteDeviation":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        midiNotePlusCentsDeviation: `${calculateIpnReferenceMidiNote(pc)} ${pc.centsDeviation >= 0 ? '+' : ''}${pc.centsDeviation}`
      }));
    case "centsDeviation":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        centsDeviation: pc.centsDeviation
      }));
    case "referenceNoteName":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pc.noteName) }),
        ipnReferenceNoteName: pc.referenceNoteName
      }));
    case "pitchClassIndex":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName
      }));
    case "scaleDegree":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        octave: pc.octave,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName
      }));
    default:
      return pitchClasses; // Return full objects
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
    case "fraction":
      return intervals.map((interval) => ({
        fraction: interval.fraction
      }));
    case "cents":
      return intervals.map((interval) => ({
        cents: interval.cents
      }));
    case "decimalRatio":
      return intervals.map((interval) => ({
        decimalRatio: interval.decimalRatio
      }));
    case "stringLength":
      return intervals.map((interval) => ({
        stringLength: interval.stringLength
      }));
    case "fretDivision":
      return intervals.map((interval) => ({
        fretDivision: interval.fretDivision
      }));
    // Formats that don't apply to intervals
    case "englishName":
    case "abjadName":
    case "frequency":
    case "midiNoteNumber":
    case "midiNoteDeviation":
    case "centsDeviation":
    case "referenceNoteName":
      // For formats that don't make sense for intervals, return minimal info
      return intervals.map((interval) => ({
        cents: interval.cents
      }));
    default:
      return intervals; // Return full objects
  }
}

/**
 * GET /api/maqamat/[id]
 * 
 * Returns maqām data with flexible formatting options.
 * Use [id]="all" to get all available maqāmāt in alphabetical order.
 * 
 * REQUIRED Query Parameters:
 * - tuningSystem: ID of tuning system (required for all requests)
 * - startingNote: Starting note (URL-friendly) - MANDATORY for all pitch class calculations (required for all requests)
 * - pitchClassDataType: Pitch class data format - REQUIRED for data retrieval, optional for discovery mode (options=true)
 *   - all: All data types
 *   - englishName, fraction, cents, decimalRatio, stringLength, frequency,
 *     abjadName, fretDivision, midiNoteNumber, midiNoteDeviation, centsDeviation, referenceNoteName
 * - view: Output structure
 *   - simple: Pitch Class Data only (default)
 *   - intervals: Pitch Class and Intervals Data (filtered by format parameter)
 *   - Legacy: pitchClasses|full
 * - transpose: Transpose to specific tonic note (URL-friendly)
 * - includeIntervals: true|false (include interval data, default: true)
 * - includeModulations: true|false (returns URL-safe maqām/jins names, default: true)
 * - includeAjnas: true|false (returns URL-safe jins names, default: false)
 * - includeSuyur: true|false (default: true)
 * - includeArabic: true|false (include Arabic display names, default: true)
 * - options: true returns available parameters instead of data
 * 
 * Response includes:
 * - maqam.tonicId / tonicDisplay: URL-safe tonic identifier and display name
 * - maqam.transposition: true/false indicating if this is a transposition
 * - maqam.familyId / familyDisplay: Family classification based on first jins
 * - maqam.commentsEnglish / commentsArabic: Commentary strings (null if none)
 * - maqam.sources: Array of {sourceId, page} references
 * - context.tuningSystem.startingNoteName: URL-safe starting note name
 * - context.tuningSystem.tuningSystemStartingNoteNames: All available starting notes (display values)
 * - context.tuningSystem.referenceFrequency: Reference frequency in Hz for the selected starting note
 * - context.pitchClassDataType: The format parameter value
 * - context.includeIntervals: Boolean indicating if intervals are included
 * 
 * Pitch Class Data Type formats:
 * - midiNoteDecimal: MIDI note as decimal (e.g., 51.366)
 * - midiNotePlusCentsDeviation: "MIDI Note + Cents Deviation" format (e.g., "52 -63.4")
 * - ipnReferenceNoteName: IPN reference note name (e.g., "E-b")
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maqamId } = await params;
    const { searchParams } = new URL(request.url);
    const tuningSystemId = searchParams.get("tuningSystem");
    const startingNote = searchParams.get("startingNote");
    const pitchClassDataType = searchParams.get("pitchClassDataType");
    const includeIntervals = searchParams.get("includeIntervals") === "true";
    const transposeToNote = searchParams.get("transposeTo");
    const includeModulations = searchParams.get("includeModulations") === "true";
    // Handle both parameter names for backward compatibility
    const mod8vb = searchParams.get("includeModulations8vb");
    const modLower = searchParams.get("includeLowerOctaveModulations");
    const includeLowerOctaveModulations = mod8vb === "true" || modLower === "true";
    const includeSuyur = searchParams.get("includeSuyur") === "true";
    const showOptions = searchParams.get("options") === "true";
    
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

    const maqamatData = getMaqamat();
    const tuningSystems = getTuningSystems();
    const ajnas = getAjnas();

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

    // Validate pitchClassDataType if provided (it's optional for discovery mode, required for data retrieval)
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

    // Find the maqām(s)
    
    // Handle "all" maqamat request
    if (maqamId === "all") {
      // Require tuning system for actual data
      if (!tuningSystemId) {
        return addCorsHeaders(
          NextResponse.json(
            {
              error: "tuningSystem parameter is required",
              hint: "Add ?tuningSystem=<id> to your request"
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

      // Require starting note for actual data (paramount importance for all calculations)
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

      // Process all maqamat
      const allMaqamatData = maqamatData
        .filter((maqam) => maqam.isMaqamPossible(pitchClasses.map((pc) => pc.noteName)))
        .sort((a, b) => a.getName().localeCompare(b.getName()))
        .map((maqam) => {
          const transpositions = calculateMaqamTranspositions(pitchClasses, ajnas, maqam, true, 5);
          const tahlil = transpositions[0];
          const familyClassification = classifyMaqamFamily(tahlil);
          const sources = maqam.getSourcePageReferences();

          // Calculate modulations for counts
          const maqamatModulations = modulate(pitchClasses, ajnas, maqamatData, tahlil, false, 5) as MaqamatModulations;
          const ajnasModulations = modulate(pitchClasses, ajnas, maqamatData, tahlil, true, 5) as AjnasModulations;
          
          const totalMaqamModulations = Object.values(maqamatModulations)
            .filter(val => Array.isArray(val))
            .reduce((sum, arr) => sum + arr.length, 0);
          
          const totalAjnasModulations = Object.values(ajnasModulations)
            .filter(val => Array.isArray(val))
            .reduce((sum, arr) => sum + arr.length, 0);

          const maqamCommentsEnglish = getComments(maqam.getCommentsEnglish());
          const maqamCommentsArabic = getCommentsAr(maqam.getCommentsArabic());
          const optionFamilyId = standardizeText(familyClassification.familyName);
          const optionFamilyDisplay = familyClassification.familyName;

          const maqamData: any = {
            id: maqam.getId(),
            idName: maqam.getIdName(),
            displayName: maqam.getName(),
            version: maqam.getVersion(),
            tonicId: standardizeText(tahlil.ascendingPitchClasses[0].noteName),
            tonicDisplay: tahlil.ascendingPitchClasses[0].noteName,
            transposition: false,
            familyId: optionFamilyId,
            familyDisplay: optionFamilyDisplay,
            numberOfTranspositions: transpositions.length,
            numberOfMaqamModulations: totalMaqamModulations,
            numberOfAjnasModulations: totalAjnasModulations,
            commentsEnglish: maqamCommentsEnglish,
            commentsArabic: maqamCommentsArabic,
            ...(inArabic && {
              displayNameAr: getMaqamNameDisplayAr(maqam.getName()),
              tonicDisplayAr: getNoteNameDisplayAr(tahlil.ascendingPitchClasses[0].noteName),
              familyDisplayAr: getMaqamNameDisplayAr(familyClassification.familyName)
            }),
            sources: sources.map((src) => ({
              sourceId: src.sourceId,
              page: src.page
            }))
          };

          // Add pitch data according to pitchClassDataType
          maqamData.pitchData = {
            ascending: formatPitchData(tahlil.ascendingPitchClasses, pitchClassDataType, false, inArabic),
            descending: formatPitchData(tahlil.descendingPitchClasses, pitchClassDataType, true, inArabic)
          };

          // Add intervals if requested
          if (includeIntervals) {
            maqamData.intervals = {
              ascending: formatIntervalData(tahlil.ascendingPitchClassIntervals, pitchClassDataType || "all"),
              descending: formatIntervalData(tahlil.descendingPitchClassIntervals, pitchClassDataType || "all")
            };
          }

          return maqamData;
        });

      // Get tuning system info for context
      const tuningSystemPitchClassCountAllOctaves = pitchClasses.length;
      const tuningSystemPitchClassCountSingleOctave = tuningSystem.getOriginalPitchClassValues().length;
      const originalValueType = pitchClasses[0]?.originalValueType || "unknown";
      const allNoteNameSets = tuningSystem.getNoteNameSets();
      const tuningSystemStartingNoteNames = Array.from(
        new Set(allNoteNameSets.map((set) => set[0]).filter((name): name is string => Boolean(name)))
      );
      const tuningSystemStartingNoteNamesIds = tuningSystemStartingNoteNames.map((name) => standardizeText(name));
      const referenceFrequency = tuningSystem.getReferenceFrequencies()[selectedStartingNote] ?? tuningSystem.getDefaultReferenceFrequency();

      return addCorsHeaders(
        NextResponse.json({
          context: {
            tuningSystem: {
              id: tuningSystemId,
              displayName: tuningSystem.stringify(),
              ...(inArabic && {
                displayNameAr: getTuningSystemDisplayNameAr(
                  tuningSystem.getCreatorArabic() || "",
                  tuningSystem.getCreatorEnglish() || "",
                  tuningSystem.getYear(),
                  tuningSystem.getTitleArabic() || "",
                  tuningSystem.getTitleEnglish() || ""
                ),
                tuningSystemStartingNoteNamesAr: tuningSystemStartingNoteNames.map((name) => getNoteNameDisplayAr(name)),
                startingNoteNameAr: getNoteNameDisplayAr(selectedStartingNote)
              }),
              version: tuningSystem.getVersion(),
              originalValueType: originalValueType,
              numberOfPitchClassesSingleOctave: tuningSystemPitchClassCountSingleOctave,
              numberOfPitchClassesAllOctaves: tuningSystemPitchClassCountAllOctaves,
              tuningSystemStartingNoteNames,
              tuningSystemStartingNoteNamesIds,
              startingNoteName: standardizeText(selectedStartingNote),
              referenceFrequency
            },
            pitchClassDataType: pitchClassDataType,
            includeIntervals: includeIntervals
          },
          count: allMaqamatData.length,
          maqamat: allMaqamatData
        })
      );
    }
    
    // Check if maqamId is empty or invalid
    if (!maqamId || maqamId.trim() === "") {
      return addCorsHeaders(
        NextResponse.json(
          { 
            error: "No maqām selected",
            hint: "Please specify a maqām ID or use 'all' to get all available maqāmāt",
            example: `/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037` 
          },
          { status: 400 }
        )
      );
    }
    
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

    // Validate that required parameters are not empty strings (after maqām is validated)
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
            error: "Invalid parameter: transpose",
            message: "The 'transpose' parameter cannot be empty. Either omit it or provide a valid note name.",
            hint: "Remove '?transpose=' from your URL or specify a note like '?transpose=rast'"
          },
          { status: 400 }
        )
      );
    }

    // If options=true, return available parameters (mutually exclusive with data-returning parameters)
    if (showOptions) {
      // Check for conflicting data-returning parameters
      const conflictingParams: string[] = [];
      if (transposeToNote) conflictingParams.push("transposeTo");
      if (includeModulations) conflictingParams.push("includeModulations");
      if (includeLowerOctaveModulations) conflictingParams.push("includeModulations8vb");
      if (includeSuyur) conflictingParams.push("includeSuyur");
      if (pitchClassDataType && pitchClassDataType !== "cents") conflictingParams.push("pitchClassDataType");
      if (includeIntervals) conflictingParams.push("intervals");

      // Return 400 error if conflicting parameters are present (REST API best practice)
      if (conflictingParams.length > 0) {
        return addCorsHeaders(
          NextResponse.json(
            {
              error: "Conflicting parameters with options=true",
              message: `The following data-returning parameters cannot be used with options=true (parameter discovery mode): ${conflictingParams.join(", ")}`,
              hint: "Remove all data-returning parameters to use discovery mode, or remove options=true to retrieve maqām data.",
            conflictingParameters: conflictingParams,
            contextualParametersAllowed: ["tuningSystem", "startingNote", "pitchClassDataType"]
            },
            { status: 400 }
          )
        );
      }

      // Require tuningSystem (required in ALL cases, not just for options)
      if (!tuningSystemId) {
        return addCorsHeaders(
          NextResponse.json(
            {
              error: "tuningSystem parameter is required",
              message: "Tuning system is required for all requests (both data retrieval and discovery mode).",
              hint: `Add &tuningSystem=ibnsina_1037 to your request. Use /api/maqamat/${maqamId}/availability to see available tuning systems`,
              availabilityUrl: `/api/maqamat/${maqamId}/availability`
            },
            { status: 400 }
          )
        );
      }

      // Validate tuningSystem is not empty string
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

      // Find tuning system
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

      // Require startingNote for discovery mode (required in all cases)
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

      // Validate startingNote is not empty string
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

      // Find matching starting note (with or without diacritics)
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
      
      // Get available starting notes for this tuning system
      const startingNoteOptions = selectedTuningSystem.getNoteNameSets().map((set) => set[0]);
      
      // Get pitch classes and calculate valid transpositions
      const pitchClasses = getTuningSystemPitchClasses(selectedTuningSystem, selectedStartingNote);
      const transpositions = calculateMaqamTranspositions(pitchClasses, ajnas, maqam, true, 5);
      const transposeOptions = transpositions.map((t) => t.ascendingPitchClasses[0].noteName);

      return addCorsHeaders(
        NextResponse.json({
          maqam: maqam.getName(),
          tuningSystem: tuningSystemId,
          availableParameters: {
            tuningSystem: {
              required: true,
              description: "ID of tuning system (see /availability for options)"
            },
            startingNote: {
              options: startingNoteOptions,
              required: true,
              description: "Theoretical framework for note naming. Required for all requests (data retrieval and discovery). Needed to calculate transposition options."
            },
            pitchClassDataType: {
              options: [
                "all",
                "englishName",
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
              ],
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
            },
            includeModulations: {
              type: "boolean",
              default: false,
              description: "Include modulation analysis (maqāmāt and ajnās)"
            },
            includeModulations8vb: {
              type: "boolean",
              default: false,
              description: "Include available modulations an octave below"
            },
            includeSuyur: {
              type: "boolean",
              default: false,
              description: "Include documented performance practices (suyūr)"
            }
          },
          notes: {
            ajnasData: "Ajnās (constituent melodic structures) are always included in the response for maqām analysis",
            formatOptions: "The 'pitchClassDataType' parameter controls which pitch class properties are returned. Use 'all' for comprehensive data or specific formats like 'cents', 'fraction', etc. for targeted data."
          },
          examples: [
            `/api/maqamat/${maqamId}?tuningSystem=ibnsina_1037&startingNote=ushayran&pitchClassDataType=cents&intervals=true`,
            `/api/maqamat/${maqamId}?tuningSystem=ibnsina_1037&startingNote=ushayran&pitchClassDataType=cents&transposeTo=nawa&includeModulations=true`,
            `/api/maqamat/${maqamId}?tuningSystem=ibnsina_1037&startingNote=ushayran&pitchClassDataType=all&includeSuyur=true`
          ]
        })
      );
    }

    // pitchClassDataType is optional - when omitted, returns only minimal fields

    // Require tuning system for actual data
    if (!tuningSystemId) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "tuningSystem parameter is required",
            hint: `Use /api/maqamat/${maqamId}/availability to see available tuning systems`,
            availabilityUrl: `/api/maqamat/${maqamId}/availability`
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

    // Require starting note for actual data (paramount importance for all calculations)
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

    // Determine starting note (support both with and without diacritics)
    const noteNameSets = tuningSystem.getNoteNameSets();
    const tuningSystemStartingNoteNames = Array.from(
      new Set(noteNameSets.map((set) => set[0]).filter((name): name is string => Boolean(name)))
    );
    const tuningSystemStartingNoteNamesIds = tuningSystemStartingNoteNames.map((name) => standardizeText(name));
    let selectedStartingNote: string;
    
    // Find matching note (with or without diacritics)
    const matchingSet = noteNameSets.find(
      (set) => standardizeText(set[0]) === standardizeText(startingNote)
    );
    if (matchingSet) {
      selectedStartingNote = matchingSet[0]; // Use actual note name with diacritics
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

    // Check if maqām is possible in this tuning
    const isPossible = maqam.isMaqamPossible(pitchClasses.map((pc) => pc.noteName));
    if (!isPossible) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: `Maqām '${maqam.getName()}' cannot be realized in tuning system '${tuningSystemId}' with starting note '${selectedStartingNote}'`,
            hint: `Use /api/maqamat/${maqamId}/availability to see compatible tuning systems`
          },
          { status: 422 }
        )
      );
    }

    // Calculate transpositions
    const transpositions = calculateMaqamTranspositions(pitchClasses, ajnas, maqam, true, 5);

    // Find specific transposition if requested
    let selectedTransposition = transpositions[0]; // Default to first (tahlil)
    if (transposeToNote) {
      const found = transpositions.find(
        (t) => standardizeText(t.ascendingPitchClasses[0].noteName) === standardizeText(transposeToNote)
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
                  idName: standardizeText(t.ascendingPitchClasses[0].noteName),
                  displayName: t.ascendingPitchClasses[0].noteName,
                },
              }))
            },
            { status: 400 }
          )
        );
      }
      selectedTransposition = found;
    }

    // Get maqam family classification from tahlil (first transposition)
    const tahlil = transpositions[0];
    const familyClassification = classifyMaqamFamily(tahlil);

    // Calculate modulations for the tahlil
    const maqamatModulations = modulate(pitchClasses, ajnas, maqamatData, tahlil, false, 5) as MaqamatModulations;
    const ajnasModulations = modulate(pitchClasses, ajnas, maqamatData, tahlil, true, 5) as AjnasModulations;

    // Count total modulations
    const totalMaqamModulations = Object.values(maqamatModulations)
      .filter(val => Array.isArray(val))
      .reduce((sum, arr) => sum + arr.length, 0);
    
    const totalAjnasModulations = Object.values(ajnasModulations)
      .filter(val => Array.isArray(val))
      .reduce((sum, arr) => sum + arr.length, 0);

    // Get sources
    const sources = maqam.getSourcePageReferences();

    // Get tuning system pitch class counts and original value type
    const tuningSystemPitchClassCountAllOctaves = pitchClasses.length;
    const tuningSystemPitchClassCountSingleOctave = tuningSystem.getOriginalPitchClassValues().length;
    const originalValueType = pitchClasses[0]?.originalValueType || "unknown";

    // Determine if this is a transposition (taṣwīr)
    const originalMaqamTonic = maqam.getAscendingNoteNames()[0];
    const transposedMaqamTonic = selectedTransposition.ascendingPitchClasses[0].noteName;
    const isTransposed = standardizeText(originalMaqamTonic) !== standardizeText(transposedMaqamTonic);

    const commentsEnglish = getComments(maqam.getCommentsEnglish());
    const commentsArabic = getCommentsAr(maqam.getCommentsArabic());
    const familyId = standardizeText(familyClassification.familyName);
    const familyDisplay = familyClassification.familyName;

    // Build response based on view
    const referenceFrequency = tuningSystem.getReferenceFrequencies()[selectedStartingNote] ?? tuningSystem.getDefaultReferenceFrequency();

    const maqamNamespace = buildEntityNamespace(
      {
        id: maqam.getId(),
        idName: isTransposed ? standardizeText(selectedTransposition.name) : maqam.getIdName(),
        displayName: isTransposed ? selectedTransposition.name : maqam.getName(),
      },
      {
        version: maqam.getVersion(),
        inArabic,
        displayNameAr: inArabic ? getMaqamNameDisplayAr(isTransposed ? selectedTransposition.name : maqam.getName()) : undefined,
      }
    );

    const tonicNamespace = buildIdentifierNamespace(
      {
        idName: standardizeText(transposedMaqamTonic),
        displayName: transposedMaqamTonic,
      },
      {
        inArabic,
        displayAr: inArabic ? getNoteNameDisplayAr(transposedMaqamTonic) : undefined,
      }
    );

    const transpositionDetails = isTransposed
      ? {
          original: buildIdentifierNamespace(
            {
              idName: standardizeText(originalMaqamTonic),
              displayName: originalMaqamTonic,
            },
            {
              inArabic,
              displayAr: inArabic ? getNoteNameDisplayAr(originalMaqamTonic) : undefined,
            }
          ),
          resolved: tonicNamespace,
        }
      : undefined;

    const familyNamespace = buildIdentifierNamespace(
      {
        idName: familyId,
        displayName: familyDisplay,
      },
      {
        inArabic,
        displayAr: inArabic && familyDisplay !== "unknown" ? getMaqamNameDisplayAr(familyDisplay) : undefined,
      }
    );

    const ascendingNoteNames = selectedTransposition.ascendingPitchClasses.map((pc) => pc.noteName);
    const descendingNoteNames = selectedTransposition.descendingPitchClasses.map((pc) => pc.noteName);
    const numberOfPitchClasses = ascendingNoteNames.length;
    const isOctaveRepeating = numberOfPitchClasses <= 7;
    const hasAsymmetricDescending = JSON.stringify(ascendingNoteNames) !== JSON.stringify([...descendingNoteNames].reverse());

    const stats = {
      numberOfTranspositions: transpositions.length,
      numberOfPitchClasses,
      numberOfMaqamModulations: totalMaqamModulations,
      numberOfAjnasModulations: totalAjnasModulations,
    };

    const hasSuyur = maqam.getSuyur().length > 0;

    const characteristics = {
      isOctaveRepeating,
      hasAsymmetricDescending,
      hasSuyur,
    };

    const comments = {
      english: commentsEnglish,
      arabic: commentsArabic,
    };

    const sourcesPayload = sources.map((src) => ({
      sourceId: src.sourceId,
      page: src.page,
    }));

    const parameters = {
      pitchClassDataType,
      includeIntervals,
      includeModulations,
      includeModulations8vb: includeLowerOctaveModulations,
      includeSuyur,
      transposeTo: transposeToNote || null,
    };

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

    // Build availableTranspositions with full maqam names
    const availableTranspositionsData = transpositions.map((t) => {
      const tonicNoteName = t.ascendingPitchClasses[0].noteName;
      const fullMaqamName = t.name; // e.g., "maqām rāst al-chahārgāh" or "maqām rāst" for tahlil
      return {
        idName: standardizeText(fullMaqamName),
        displayName: fullMaqamName,
        ...(inArabic && { displayNameAr: getMaqamNameDisplayAr(fullMaqamName) }),
        tonic: {
          idName: standardizeText(tonicNoteName),
          displayName: tonicNoteName,
          ...(inArabic && { displayNameAr: getNoteNameDisplayAr(tonicNoteName) }),
        },
      };
    });
    const availableTranspositionsNamespace = availableTranspositionsData;

    const responseData: any = {
      maqam: maqamNamespace,
      family: familyNamespace,
      tonic: tonicNamespace,
      transposition: transpositionDetails,
      stats,
      characteristics,
      availableTranspositions: availableTranspositionsNamespace,
      comments,
      sources: sourcesPayload,
      parameters,
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
        detail: `/api/maqamat/${maqam.getIdName()}`,
        availability: `/api/maqamat/${maqam.getIdName()}/availability`,
        compare: `/api/maqamat/${maqam.getIdName()}/compare`,
      }),
    };

    // Apply sequential reference note logic to maqam pitch classes
    const { renderPitchClassSpellings } = await import("@/functions/renderPitchClassIpnSpellings");
    
    // For symmetrical maqamat, pass all pitch classes to ensure consistent reference note assignments
    // For asymmetrical maqamat, process each sequence independently
    const allMaqamPitchClasses = !hasAsymmetricDescending
      ? [...selectedTransposition.ascendingPitchClasses, ...selectedTransposition.descendingPitchClasses]
      : undefined;
    
    const ascendingPitchClassesWithSequentialRefs = renderPitchClassSpellings(
      selectedTransposition.ascendingPitchClasses,
      true,
      allMaqamPitchClasses
    );
    const descendingPitchClassesWithSequentialRefs = renderPitchClassSpellings(
      selectedTransposition.descendingPitchClasses,
      false,
      allMaqamPitchClasses
    );

    // Always include pitch data
    responseData.pitchData = {
      ascending: formatPitchData(ascendingPitchClassesWithSequentialRefs, pitchClassDataType, false, inArabic),
      descending: formatPitchData(descendingPitchClassesWithSequentialRefs, pitchClassDataType, true, inArabic)
    };

    // Add intervals if requested
    if (includeIntervals) {
      responseData.intervals = {
        ascending: formatIntervalData(selectedTransposition.ascendingPitchClassIntervals, pitchClassDataType || "all"),
        descending: formatIntervalData(selectedTransposition.descendingPitchClassIntervals, pitchClassDataType || "all")
      };
    }

    // Always include ajnās data for maqām analysis
    // Return as object with note-to-jins mapping, values are ENTITY OBJECTS { id, idName, displayName } | null
    // Keeps positional context while conforming to Entity Object Pattern
    const ascendingAjnasObject: any = {};
    const descendingAjnasObject: any = {};

    // Build ascending ajnas object
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

    // Build descending ajnas object
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

    responseData.ajnas = {
      ascending: ascendingAjnasObject,
      descending: descendingAjnasObject
    };

    // Add optional includes
    if (includeSuyur) {
      responseData.suyur = maqam.getSuyur();
    }

    if (includeModulations) {
      const maqamatModulations = modulate(pitchClasses, ajnas, maqamatData, selectedTransposition, false, 5);
      const ajnasModulations = modulate(pitchClasses, ajnas, maqamatData, selectedTransposition, true, 5);
      
      // Create lookup maps from numeric IDs to full entity data
      const maqamIdToEntity = new Map<string, any>();
      for (const maqamData of maqamatData) {
        const maqamEntity: any = {
          id: maqamData.getId(),
          idName: maqamData.getIdName(),
          displayName: maqamData.getName()
        };
        if (inArabic) {
          maqamEntity.displayNameAr = getMaqamNameDisplayAr(maqamData.getName());
        }
        maqamIdToEntity.set(maqamData.getId(), maqamEntity);
      }
      
      const jinsIdToEntity = new Map<string, any>();
      for (const jins of ajnas) {
        const jinsEntity: any = {
          id: jins.getId(),
          idName: jins.getIdName(),
          displayName: jins.getName()
        };
        if (inArabic) {
          jinsEntity.displayNameAr = getJinsNameDisplayAr(jins.getName());
        }
        jinsIdToEntity.set(jins.getId(), jinsEntity);
      }
      
      // Helper function to serialize modulation arrays (simplified structure)
      const serializeModulationArray = (
        mods: any[],
        entityMap: Map<string, any>,
        isAjnas: boolean = false
      ) => {
        return mods.map((m: any) => {
          const entity = entityMap.get(m.maqamId || m.jinsId);
          if (!entity) return null;

          const modObj: any = {
            id: entity.id,
            idName: standardizeText(m.name),
            displayName: m.name,
            tonicIdName: standardizeText(m.ascendingPitchClasses?.[0]?.noteName || m.jinsPitchClasses?.[0]?.noteName || ''),
            tonicDisplayName: m.ascendingPitchClasses?.[0]?.noteName || m.jinsPitchClasses?.[0]?.noteName || ''
          };

          if (!isAjnas) {
            modObj.isTransposition = m.transposition || false;
          }

          if (inArabic) {
            modObj.displayNameAr = isAjnas
              ? getJinsNameDisplayAr(m.name)
              : getMaqamNameDisplayAr(m.name);
            modObj.tonicDisplayNameAr = getNoteNameDisplayAr(modObj.tonicDisplayName);
          }

          return modObj;
        }).filter(Boolean);
      };

      // Create simplified property-based modulation structure
      responseData.modulations = {
        maqamat: {
          firstDegree: serializeModulationArray(maqamatModulations.modulationsOnFirstDegree, maqamIdToEntity, false),
          thirdDegree: serializeModulationArray(maqamatModulations.modulationsOnThirdDegree, maqamIdToEntity, false),
          altThirdDegree: serializeModulationArray(maqamatModulations.modulationsOnAltThirdDegree, maqamIdToEntity, false),
          fourthDegree: serializeModulationArray(maqamatModulations.modulationsOnFourthDegree, maqamIdToEntity, false),
          fifthDegree: serializeModulationArray(maqamatModulations.modulationsOnFifthDegree, maqamIdToEntity, false),
          sixthDegreeAsc: serializeModulationArray(maqamatModulations.modulationsOnSixthDegreeAsc, maqamIdToEntity, false),
          sixthDegreeDesc: serializeModulationArray(maqamatModulations.modulationsOnSixthDegreeDesc, maqamIdToEntity, false),
          sixthDegreeIfNoThird: serializeModulationArray(maqamatModulations.modulationsOnSixthDegreeIfNoThird, maqamIdToEntity, false),
          noteName2pBelowThird: maqamatModulations.noteName2pBelowThird
        },
        ajnas: {
          firstDegree: serializeModulationArray(ajnasModulations.modulationsOnFirstDegree, jinsIdToEntity, true),
          thirdDegree: serializeModulationArray(ajnasModulations.modulationsOnThirdDegree, jinsIdToEntity, true),
          altThirdDegree: serializeModulationArray(ajnasModulations.modulationsOnAltThirdDegree, jinsIdToEntity, true),
          fourthDegree: serializeModulationArray(ajnasModulations.modulationsOnFourthDegree, jinsIdToEntity, true),
          fifthDegree: serializeModulationArray(ajnasModulations.modulationsOnFifthDegree, jinsIdToEntity, true),
          sixthDegreeAsc: serializeModulationArray(ajnasModulations.modulationsOnSixthDegreeAsc, jinsIdToEntity, true),
          sixthDegreeDesc: serializeModulationArray(ajnasModulations.modulationsOnSixthDegreeDesc, jinsIdToEntity, true),
          sixthDegreeIfNoThird: serializeModulationArray(ajnasModulations.modulationsOnSixthDegreeIfNoThird, jinsIdToEntity, true),
          noteName2pBelowThird: ajnasModulations.noteName2pBelowThird
        }
      };
      
      // Add lower octave modulations if requested
      if (includeLowerOctaveModulations) {
        // Lower octave modulations - simplified property-based structure
        responseData.lowerOctaveModulations = {
          maqamat: {
            firstDegree: serializeModulationArray(
              maqamatModulations.modulationsOnFirstDegree.map((m: any) => shiftMaqamByOctaves(pitchClasses, m, -1)).filter(Boolean),
              maqamIdToEntity,
              false
            ),
            thirdDegree: serializeModulationArray(
              maqamatModulations.modulationsOnThirdDegree.map((m: any) => shiftMaqamByOctaves(pitchClasses, m, -1)).filter(Boolean),
              maqamIdToEntity,
              false
            ),
            altThirdDegree: serializeModulationArray(
              maqamatModulations.modulationsOnAltThirdDegree.map((m: any) => shiftMaqamByOctaves(pitchClasses, m, -1)).filter(Boolean),
              maqamIdToEntity,
              false
            ),
            fourthDegree: serializeModulationArray(
              maqamatModulations.modulationsOnFourthDegree.map((m: any) => shiftMaqamByOctaves(pitchClasses, m, -1)).filter(Boolean),
              maqamIdToEntity,
              false
            ),
            fifthDegree: serializeModulationArray(
              maqamatModulations.modulationsOnFifthDegree.map((m: any) => shiftMaqamByOctaves(pitchClasses, m, -1)).filter(Boolean),
              maqamIdToEntity,
              false
            ),
            sixthDegreeAsc: serializeModulationArray(
              maqamatModulations.modulationsOnSixthDegreeAsc.map((m: any) => shiftMaqamByOctaves(pitchClasses, m, -1)).filter(Boolean),
              maqamIdToEntity,
              false
            ),
            sixthDegreeDesc: serializeModulationArray(
              maqamatModulations.modulationsOnSixthDegreeDesc.map((m: any) => shiftMaqamByOctaves(pitchClasses, m, -1)).filter(Boolean),
              maqamIdToEntity,
              false
            ),
            sixthDegreeIfNoThird: serializeModulationArray(
              maqamatModulations.modulationsOnSixthDegreeIfNoThird.map((m: any) => shiftMaqamByOctaves(pitchClasses, m, -1)).filter(Boolean),
              maqamIdToEntity,
              false
            )
          },
          ajnas: {
            firstDegree: serializeModulationArray(
              ajnasModulations.modulationsOnFirstDegree.map((j: any) => shiftJinsByOctaves(pitchClasses, j, -1)).filter(Boolean),
              jinsIdToEntity,
              true
            ),
            thirdDegree: serializeModulationArray(
              ajnasModulations.modulationsOnThirdDegree.map((j: any) => shiftJinsByOctaves(pitchClasses, j, -1)).filter(Boolean),
              jinsIdToEntity,
              true
            ),
            altThirdDegree: serializeModulationArray(
              ajnasModulations.modulationsOnAltThirdDegree.map((j: any) => shiftJinsByOctaves(pitchClasses, j, -1)).filter(Boolean),
              jinsIdToEntity,
              true
            ),
            fourthDegree: serializeModulationArray(
              ajnasModulations.modulationsOnFourthDegree.map((j: any) => shiftJinsByOctaves(pitchClasses, j, -1)).filter(Boolean),
              jinsIdToEntity,
              true
            ),
            fifthDegree: serializeModulationArray(
              ajnasModulations.modulationsOnFifthDegree.map((j: any) => shiftJinsByOctaves(pitchClasses, j, -1)).filter(Boolean),
              jinsIdToEntity,
              true
            ),
            sixthDegreeAsc: serializeModulationArray(
              ajnasModulations.modulationsOnSixthDegreeAsc.map((j: any) => shiftJinsByOctaves(pitchClasses, j, -1)).filter(Boolean),
              jinsIdToEntity,
              true
            ),
            sixthDegreeDesc: serializeModulationArray(
              ajnasModulations.modulationsOnSixthDegreeDesc.map((j: any) => shiftJinsByOctaves(pitchClasses, j, -1)).filter(Boolean),
              jinsIdToEntity,
              true
            ),
            sixthDegreeIfNoThird: serializeModulationArray(
              ajnasModulations.modulationsOnSixthDegreeIfNoThird.map((j: any) => shiftJinsByOctaves(pitchClasses, j, -1)).filter(Boolean),
              jinsIdToEntity,
              true
            )
          }
        };
      }
    }

    return addCorsHeaders(NextResponse.json(responseData));
  } catch (error) {
    console.error("Error in GET /api/maqamat/[id]:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to retrieve maqām data", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}
