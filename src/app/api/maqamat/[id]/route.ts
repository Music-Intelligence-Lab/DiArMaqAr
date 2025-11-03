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

export const OPTIONS = handleCorsPreflightRequest;

/**
 * Roman numeral conversion for scale degrees
 */
const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV"];

/**
 * Helper function to create modulation degree note names mapping
 */
function createModulationDegreesNoteNames(
  ascendingPitchClasses: PitchClass[],
  descendingPitchClasses: PitchClass[]
) {
  return {
    maqamModulationsOnFirstDegreeNoteName: standardizeText(ascendingPitchClasses[0]?.noteName || ''),
    maqamModulationsOnThirdDegreeNoteName: standardizeText(ascendingPitchClasses[2]?.noteName || ''),
    maqamModulationsOnAltThirdDegreeNoteName: standardizeText(ascendingPitchClasses[2]?.noteName || ''),
    maqamModulationsOnFourthDegreeNoteName: standardizeText(ascendingPitchClasses[3]?.noteName || ''),
    maqamModulationsOnFifthDegreeNoteName: standardizeText(ascendingPitchClasses[4]?.noteName || ''),
    maqamModulationsOnSixthDegreeAscNoteName: standardizeText(ascendingPitchClasses[5]?.noteName || ''),
    maqamModulationsOnSixthDegreeDescNoteName: standardizeText(descendingPitchClasses[1]?.noteName || ''),
    maqamModulationsOnSixthDegreeIfNoThirdNoteName: standardizeText(ascendingPitchClasses[5]?.noteName || '')
  };
}

/**
 * Helper function to create jins modulation degree note names mapping
 */
function createJinsModulationDegreesNoteNames(
  ascendingPitchClasses: PitchClass[],
  descendingPitchClasses: PitchClass[]
) {
  return {
    maqamToJinsModulationsOnFirstDegreeNoteName: standardizeText(ascendingPitchClasses[0]?.noteName || ''),
    maqamToJinsModulationsOnThirdDegreeNoteName: standardizeText(ascendingPitchClasses[2]?.noteName || ''),
    maqamToJinsModulationsOnAltThirdDegreeNoteName: standardizeText(ascendingPitchClasses[2]?.noteName || ''),
    maqamToJinsModulationsOnFourthDegreeNoteName: standardizeText(ascendingPitchClasses[3]?.noteName || ''),
    maqamToJinsModulationsOnFifthDegreeNoteName: standardizeText(ascendingPitchClasses[4]?.noteName || ''),
    maqamToJinsModulationsOnSixthDegreeAscNoteName: standardizeText(ascendingPitchClasses[5]?.noteName || ''),
    maqamToJinsModulationsOnSixthDegreeDescNoteName: standardizeText(descendingPitchClasses[1]?.noteName || ''),
    maqamToJinsModulationsOnSixthDegreeIfNoThirdNoteName: standardizeText(ascendingPitchClasses[5]?.noteName || '')
  };
}

/**
 * Helper function to create lower octave degree note names mapping
 */
function createLowerOctaveDegreesNoteNames(
  ascendingPitchClasses: PitchClass[],
  descendingPitchClasses: PitchClass[],
  allPitchClasses: PitchClass[]
) {
  // Find pitch classes one octave below
  const findLowerOctave = (noteName: string) => {
    const currentPc = allPitchClasses.find(pc => pc.noteName === noteName);
    if (!currentPc) return noteName;

    // Find the pitch class with the same note name but 12 semitones (1200 cents) lower
    const targetCents = parseFloat(currentPc.cents) - 1200;
    const lowerPc = allPitchClasses.find(pc =>
      Math.abs(parseFloat(pc.cents) - targetCents) < 10
    );

    return lowerPc ? lowerPc.noteName : noteName;
  };

  return {
    maqamModulationsOnFirstDegree8vbNoteName: standardizeText(findLowerOctave(ascendingPitchClasses[0]?.noteName || '')),
    maqamModulationsOnThirdDegree8vbNoteName: standardizeText(findLowerOctave(ascendingPitchClasses[2]?.noteName || '')),
    maqamModulationsOnAltThirdDegree8vbNoteName: standardizeText(findLowerOctave(ascendingPitchClasses[2]?.noteName || '')),
    maqamModulationsOnFourthDegree8vbNoteName: standardizeText(findLowerOctave(ascendingPitchClasses[3]?.noteName || '')),
    maqamModulationsOnFifthDegree8vbNoteName: standardizeText(findLowerOctave(ascendingPitchClasses[4]?.noteName || '')),
    maqamModulationsOnSixthDegreeAsc8vbNoteName: standardizeText(findLowerOctave(ascendingPitchClasses[5]?.noteName || '')),
    maqamModulationsOnSixthDegreeDesc8vbNoteName: standardizeText(findLowerOctave(descendingPitchClasses[1]?.noteName || '')),
    maqamModulationsOnSixthDegreeIfNoThird8vbNoteName: standardizeText(findLowerOctave(ascendingPitchClasses[5]?.noteName || ''))
  };
}

/**
 * Helper function to create lower octave jins degree note names mapping
 */
function createLowerOctaveJinsDegreesNoteNames(
  ascendingPitchClasses: PitchClass[],
  descendingPitchClasses: PitchClass[],
  allPitchClasses: PitchClass[]
) {
  // Find pitch classes one octave below
  const findLowerOctave = (noteName: string) => {
    const currentPc = allPitchClasses.find(pc => pc.noteName === noteName);
    if (!currentPc) return noteName;

    const targetCents = parseFloat(currentPc.cents) - 1200;
    const lowerPc = allPitchClasses.find(pc =>
      Math.abs(parseFloat(pc.cents) - targetCents) < 10
    );

    return lowerPc ? lowerPc.noteName : noteName;
  };

  return {
    maqamToJinsModulationsOnFirstDegree8vbNoteName: standardizeText(findLowerOctave(ascendingPitchClasses[0]?.noteName || '')),
    maqamToJinsModulationsOnThirdDegree8vbNoteName: standardizeText(findLowerOctave(ascendingPitchClasses[2]?.noteName || '')),
    maqamToJinsModulationsOnAltThirdDegree8vbNoteName: standardizeText(findLowerOctave(ascendingPitchClasses[2]?.noteName || '')),
    maqamToJinsModulationsOnFourthDegree8vbNoteName: standardizeText(findLowerOctave(ascendingPitchClasses[3]?.noteName || '')),
    maqamToJinsModulationsOnFifthDegree8vbNoteName: standardizeText(findLowerOctave(ascendingPitchClasses[4]?.noteName || '')),
    maqamToJinsModulationsOnSixthDegreeAsc8vbNoteName: standardizeText(findLowerOctave(ascendingPitchClasses[5]?.noteName || '')),
    maqamToJinsModulationsOnSixthDegreeDesc8vbNoteName: standardizeText(findLowerOctave(descendingPitchClasses[1]?.noteName || '')),
    maqamToJinsModulationsOnSixthDegreeIfNoThird8vbNoteName: standardizeText(findLowerOctave(ascendingPitchClasses[5]?.noteName || ''))
  };
}

/**
 * Format pitch data according to requested format
 * @param pitchClasses - Array of pitch classes to format
 * @param format - Output format type
 * @param isDescending - Whether this is descending data (reverses scale degrees)
 */
function formatPitchData(pitchClasses: PitchClass[], format: string, isDescending: boolean = false) {
  const length = pitchClasses.length;
  
  switch (format) {
    case "all":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
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
    case "englishName":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        englishName: pc.englishName
      }));
    case "fraction":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        fraction: pc.fraction
      }));
    case "cents":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        cents: parseFloat(pc.cents)
      }));
    case "decimalRatio":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        decimalRatio: parseFloat(pc.decimalRatio)
      }));
    case "stringLength":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        stringLength: parseFloat(pc.stringLength)
      }));
    case "frequency":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        frequency: parseFloat(pc.frequency)
      }));
    case "abjadName":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        abjadName: pc.abjadName
      }));
    case "fretDivision":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        fretDivision: pc.fretDivision
      }));
    case "midiNoteNumber":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        midiNoteDecimal: pc.midiNoteDecimal
      }));
    case "midiNoteDeviation":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        midiNotePlusCentsDeviation: `${calculateIpnReferenceMidiNote(pc)} ${pc.centsDeviation >= 0 ? '+' : ''}${pc.centsDeviation}`
      }));
    case "centsDeviation":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        centsDeviation: pc.centsDeviation
      }));
    case "referenceNoteName":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName,
        ipnReferenceNoteName: pc.referenceNoteName
      }));
    case "pitchClassIndex":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
        scaleDegree: isDescending ? (romanNumerals[length - 1 - index] || `${length - index}`) : (romanNumerals[index] || `${index + 1}`),
        noteName: standardizeText(pc.noteName),
        noteNameDisplay: pc.noteName
      }));
    case "scaleDegree":
      return pitchClasses.map((pc, index) => ({
        pitchClassIndex: pc.pitchClassIndex,
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
 * - tuningSystem: ID of tuning system
 * - startingNote: Starting note (URL-friendly) - MANDATORY for all pitch class calculations
 * 
 * OPTIONAL Query Parameters:
 * - pitchClassDataType: Pitch class data format (defaults to "frequency")
 *   - all: All data types
 *   - englishName, fraction, cents, decimalRatio, stringLength, frequency,
 *     abjadName, fretDivision, midiNoteNumber, midiNoteDeviation, centsDeviation, referenceNoteName
 * - view: Output structure
 *   - simple: Pitch Class Data only (default)
 *   - intervals: Pitch Class and Intervals Data (filtered by format parameter)
 *   - Legacy: pitchClasses|full
 * - transpose: Transpose to specific tonic note (URL-friendly)
 * - includeModulations: true|false (returns URL-safe maqām/jins names, default: false)
 * - includeAjnas: true|false (returns URL-safe jins names, default: false)
 * - includeSuyur: true|false (default: false)
 * - options: true returns available parameters instead of data
 * 
 * Response includes:
 * - maqam.tonic: URL-friendly tonic note name
 * - maqam.transposition: true/false indicating if this is a transposition
 * - maqam.maqamFamily: Family classification based on first jins
 * - maqam.commentsEnglish: English commentary (null if none)
 * - maqam.commentsArabic: Arabic commentary (null if none)
 * - maqam.sources: Array of {sourceId, page} references
 * - context.startingNote: URL-friendly starting note
 * - context.referenceFrequency: Reference frequency in Hz
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maqamId } = await context.params;
    const { searchParams } = new URL(request.url);
    const tuningSystemId = searchParams.get("tuningSystem");
    const startingNote = searchParams.get("startingNote");
    const pitchClassDataType = searchParams.get("pitchClassDataType") || "frequency";
    const includeIntervals = searchParams.get("intervals") === "true";
    const transposeToNote = searchParams.get("transpose");
    const includeModulations = searchParams.get("includeModulations") === "true";
    const includeLowerOctaveModulations = searchParams.get("includeLowerOctaveModulations") === "true";
    const includeSuyur = searchParams.get("includeSuyur") === "true";
    const showOptions = searchParams.get("options") === "true";

    const maqamatData = getMaqamat();
    const tuningSystems = getTuningSystems();
    const ajnas = getAjnas();

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
      const tuningSystem = tuningSystems.find((ts) => ts.getId() === tuningSystemId);
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

          const maqamData: any = {
            id: maqam.getId(),
            idName: maqam.getIdName(),
            displayName: maqam.getName(),
            version: maqam.getVersion(),
            tonicName: standardizeText(tahlil.ascendingPitchClasses[0].noteName),
            tonicDisplayName: tahlil.ascendingPitchClasses[0].noteName,
            transposition: false,
            maqamFamilyName: standardizeText(familyClassification.familyName),
            maqamFamilyDisplayName: familyClassification.familyName,
            numberOfTranspositions: transpositions.length,
            numberOfMaqamModulations: totalMaqamModulations,
            numberOfAjnasModulations: totalAjnasModulations,
            commentsEnglish: maqam.getCommentsEnglish() || null,
            commentsArabic: maqam.getCommentsArabic() || null,
            sources: sources.map((src) => ({
              sourceId: src.sourceId,
              page: src.page
            }))
          };

          // Add pitch data according to pitchClassDataType
          maqamData.pitchData = {
            ascending: formatPitchData(tahlil.ascendingPitchClasses, pitchClassDataType, false),
            descending: formatPitchData(tahlil.descendingPitchClasses, pitchClassDataType, true)
          };

          // Add intervals if requested
          if (includeIntervals) {
            maqamData.intervals = {
              ascending: formatIntervalData(tahlil.ascendingPitchClassIntervals, pitchClassDataType),
              descending: formatIntervalData(tahlil.descendingPitchClassIntervals, pitchClassDataType)
            };
          }

          return maqamData;
        });

      // Get tuning system info for context
      const tuningSystemPitchClassCountAllOctaves = pitchClasses.length;
      const tuningSystemPitchClassCountSingleOctave = tuningSystem.getOriginalPitchClassValues().length;
      const originalValueType = pitchClasses[0]?.originalValueType || "unknown";

      return addCorsHeaders(
        NextResponse.json({
          context: {
            tuningSystem: {
              id: tuningSystemId,
              displayName: tuningSystem.stringify(),
              version: tuningSystem.getVersion(),
              originalValueType: originalValueType,
              numberOfPitchClassesSingleOctave: tuningSystemPitchClassCountSingleOctave,
              numberOfPitchClassesAllOctaves: tuningSystemPitchClassCountAllOctaves
            },
            startingNote: standardizeText(selectedStartingNote),
            referenceFrequency: tuningSystem.getDefaultReferenceFrequency(),
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
            example: `/api/maqamat/maqam_rast?tuningSystem=IbnSina-(1037)` 
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
            hint: "Specify a tuning system like '?tuningSystem=IbnSina-(1037)'"
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

    // If options=true, return available parameters
    if (showOptions) {
      // Find tuning system if specified
      let selectedTuningSystem = null;
      if (tuningSystemId) {
        selectedTuningSystem = tuningSystems.find((ts) => ts.getId() === tuningSystemId);
      }

      // Get available starting notes and transposition options
      const startingNoteOptions = selectedTuningSystem
        ? selectedTuningSystem.getNoteNameSets().map((set) => set[0])
        : [];

      let transposeOptions: string[] = [];
      if (selectedTuningSystem) {
        const firstStartingNote = startingNoteOptions[0];
        const pitchClasses = getTuningSystemPitchClasses(selectedTuningSystem, firstStartingNote);
        transposeOptions = pitchClasses.map((pc) => pc.noteName);
      }

      return addCorsHeaders(
        NextResponse.json({
          maqam: maqam.getName(),
          tuningSystem: tuningSystemId || null,
          availableParameters: {
            tuningSystem: {
              required: true,
              description: "ID of tuning system (see /availability for options)"
            },
            startingNote: {
              options: startingNoteOptions,
              default: startingNoteOptions[0] || null,
              description: "Theoretical framework for note naming"
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
              default: "frequency",
              description: "Output format for pitch data. Use 'all' for complete pitch class information."
            },
            intervals: {
              type: "boolean",
              default: false,
              description: "Include interval data between pitch classes"
            },
            transpose: {
              options: transposeOptions.length > 0 ? transposeOptions : ["Requires tuningSystem to be set"],
              default: null,
              description: "Transpose to specific tonic (optional)"
            },
            includeModulations: {
              type: "boolean",
              default: false,
              description: "Include modulation analysis (maqāmāt and ajnās)"
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
            `/api/maqamat/${maqamId}?tuningSystem=${tuningSystemId || "IbnSina-(1037)"}&pitchClassDataType=cents&intervals=true`,
            `/api/maqamat/${maqamId}?tuningSystem=${tuningSystemId || "IbnSina-(1037)"}&transpose=dugah&includeModulations=true`,
            `/api/maqamat/${maqamId}?tuningSystem=${tuningSystemId || "IbnSina-(1037)"}&pitchClassDataType=all&includeSuyur=true`
          ]
        })
      );
    }

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
    const tuningSystem = tuningSystems.find((ts) => ts.getId() === tuningSystemId);
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
              availableTranspositions: transpositions.map((t) => t.ascendingPitchClasses[0].noteName)
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

    // Build response based on view
    const responseData: any = {
      maqam: {
        id: maqam.getId(),
        idName: maqam.getIdName(),
        displayName: maqam.getName(),
        version: maqam.getVersion(),
        tonicName: standardizeText(selectedTransposition.ascendingPitchClasses[0].noteName),
        tonicDisplayName: selectedTransposition.ascendingPitchClasses[0].noteName,
        transposition: selectedTransposition.transposition || false,
        maqamFamilyName: standardizeText(familyClassification.familyName),
        maqamFamilyDisplayName: familyClassification.familyName,
        numberOfTranspositions: transpositions.length,
        numberOfMaqamModulations: totalMaqamModulations,
        numberOfAjnasModulations: totalAjnasModulations,
        commentsEnglish: maqam.getCommentsEnglish() || null,
        commentsArabic: maqam.getCommentsArabic() || null,
        sources: sources.map((src) => ({
          sourceId: src.sourceId,
          page: src.page
        }))
      },
      context: {
        tuningSystem: {
          id: tuningSystemId,
          displayName: tuningSystem.stringify(),
          version: tuningSystem.getVersion(),
          originalValueType: originalValueType,
          numberOfPitchClassesSingleOctave: tuningSystemPitchClassCountSingleOctave,
          numberOfPitchClassesAllOctaves: tuningSystemPitchClassCountAllOctaves,
          startingNoteName: standardizeText(selectedStartingNote),
          referenceFrequency: tuningSystem.getDefaultReferenceFrequency()
        },
        pitchClassDataType: pitchClassDataType,
        includeIntervals: includeIntervals
      }
    };

    // Always include pitch data
    responseData.pitchData = {
      ascending: formatPitchData(selectedTransposition.ascendingPitchClasses, pitchClassDataType, false),
      descending: formatPitchData(selectedTransposition.descendingPitchClasses, pitchClassDataType, true)
    };

    // Add intervals if requested
    if (includeIntervals) {
      responseData.intervals = {
        ascending: formatIntervalData(selectedTransposition.ascendingPitchClassIntervals, pitchClassDataType),
        descending: formatIntervalData(selectedTransposition.descendingPitchClassIntervals, pitchClassDataType)
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
          ascendingAjnasObject[noteName] = {
            id: jinsAtThisNote.jinsId,
            idName: standardizeText(jinsAtThisNote.name || ''),
            displayName: jinsAtThisNote.name || ''
          };
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
          descendingAjnasObject[noteName] = {
            id: jinsAtThisNote.jinsId,
            idName: standardizeText(jinsAtThisNote.name || ''),
            displayName: jinsAtThisNote.name || ''
          };
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
        maqamIdToEntity.set(maqamData.getId(), {
          id: maqamData.getId(),
          idName: maqamData.getIdName(),
          displayName: maqamData.getName()
        });
      }
      
      const jinsIdToEntity = new Map<string, any>();
      for (const jins of ajnas) {
        jinsIdToEntity.set(jins.getId(), {
          id: jins.getId(),
          idName: jins.getIdName(),
          displayName: jins.getName()
        });
      }
      
      // Add degree note name mappings
      const maqamDegreesNoteNames = createModulationDegreesNoteNames(
        selectedTransposition.ascendingPitchClasses,
        selectedTransposition.descendingPitchClasses
      );

      const jinsDegreesNoteNames = createJinsModulationDegreesNoteNames(
        selectedTransposition.ascendingPitchClasses,
        selectedTransposition.descendingPitchClasses
      );

      // Return full entity objects with id, idName (URL-safe), and displayName (with transposition suffix)
      // Use the transposed name (m.name) which includes position info like "_al-dugah"
      // Include ALL modulation degrees
      responseData.modulations = {
        degreesNoteNames: {
          maqamat: maqamDegreesNoteNames,
          ajnas: jinsDegreesNoteNames
        },
        maqamat: {
          onFirstDegree: maqamatModulations.modulationsOnFirstDegree.map((m: any) => {
            const entity = maqamIdToEntity.get(m.maqamId);
            return entity ? { id: entity.id, idName: standardizeText(m.name), displayName: m.name } : null;
          }).filter(Boolean),
          onThirdDegree: maqamatModulations.modulationsOnThirdDegree.map((m: any) => {
            const entity = maqamIdToEntity.get(m.maqamId);
            return entity ? { id: entity.id, idName: standardizeText(m.name), displayName: m.name } : null;
          }).filter(Boolean),
          onAltThirdDegree: maqamatModulations.modulationsOnAltThirdDegree.map((m: any) => {
            const entity = maqamIdToEntity.get(m.maqamId);
            return entity ? { id: entity.id, idName: standardizeText(m.name), displayName: m.name } : null;
          }).filter(Boolean),
          onFourthDegree: maqamatModulations.modulationsOnFourthDegree.map((m: any) => {
            const entity = maqamIdToEntity.get(m.maqamId);
            return entity ? { id: entity.id, idName: standardizeText(m.name), displayName: m.name } : null;
          }).filter(Boolean),
          onFifthDegree: maqamatModulations.modulationsOnFifthDegree.map((m: any) => {
            const entity = maqamIdToEntity.get(m.maqamId);
            return entity ? { id: entity.id, idName: standardizeText(m.name), displayName: m.name } : null;
          }).filter(Boolean),
          onSixthDegreeAsc: maqamatModulations.modulationsOnSixthDegreeAsc.map((m: any) => {
            const entity = maqamIdToEntity.get(m.maqamId);
            return entity ? { id: entity.id, idName: standardizeText(m.name), displayName: m.name } : null;
          }).filter(Boolean),
          onSixthDegreeDesc: maqamatModulations.modulationsOnSixthDegreeDesc.map((m: any) => {
            const entity = maqamIdToEntity.get(m.maqamId);
            return entity ? { id: entity.id, idName: standardizeText(m.name), displayName: m.name } : null;
          }).filter(Boolean),
          onSixthDegreeIfNoThird: maqamatModulations.modulationsOnSixthDegreeIfNoThird.map((m: any) => {
            const entity = maqamIdToEntity.get(m.maqamId);
            return entity ? { id: entity.id, idName: standardizeText(m.name), displayName: m.name } : null;
          }).filter(Boolean)
        },
        ajnas: {
          onFirstDegree: ajnasModulations.modulationsOnFirstDegree.map((j: any) => {
            const entity = jinsIdToEntity.get(j.jinsId);
            return entity ? { id: entity.id, idName: standardizeText(j.name), displayName: j.name } : null;
          }).filter(Boolean),
          onThirdDegree: ajnasModulations.modulationsOnThirdDegree.map((j: any) => {
            const entity = jinsIdToEntity.get(j.jinsId);
            return entity ? { id: entity.id, idName: standardizeText(j.name), displayName: j.name } : null;
          }).filter(Boolean),
          onAltThirdDegree: ajnasModulations.modulationsOnAltThirdDegree.map((j: any) => {
            const entity = jinsIdToEntity.get(j.jinsId);
            return entity ? { id: entity.id, idName: standardizeText(j.name), displayName: j.name } : null;
          }).filter(Boolean),
          onFourthDegree: ajnasModulations.modulationsOnFourthDegree.map((j: any) => {
            const entity = jinsIdToEntity.get(j.jinsId);
            return entity ? { id: entity.id, idName: standardizeText(j.name), displayName: j.name } : null;
          }).filter(Boolean),
          onFifthDegree: ajnasModulations.modulationsOnFifthDegree.map((j: any) => {
            const entity = jinsIdToEntity.get(j.jinsId);
            return entity ? { id: entity.id, idName: standardizeText(j.name), displayName: j.name } : null;
          }).filter(Boolean),
          onSixthDegreeAsc: ajnasModulations.modulationsOnSixthDegreeAsc.map((j: any) => {
            const entity = jinsIdToEntity.get(j.jinsId);
            return entity ? { id: entity.id, idName: standardizeText(j.name), displayName: j.name } : null;
          }).filter(Boolean),
          onSixthDegreeDesc: ajnasModulations.modulationsOnSixthDegreeDesc.map((j: any) => {
            const entity = jinsIdToEntity.get(j.jinsId);
            return entity ? { id: entity.id, idName: standardizeText(j.name), displayName: j.name } : null;
          }).filter(Boolean),
          onSixthDegreeIfNoThird: ajnasModulations.modulationsOnSixthDegreeIfNoThird.map((j: any) => {
            const entity = jinsIdToEntity.get(j.jinsId);
            return entity ? { id: entity.id, idName: standardizeText(j.name), displayName: j.name } : null;
          }).filter(Boolean)
        }
      };
      
      // Add lower octave modulations if requested
      if (includeLowerOctaveModulations) {
        // Add lower octave degree note name mappings
        const lowerOctaveMaqamDegreesNoteNames = createLowerOctaveDegreesNoteNames(
          selectedTransposition.ascendingPitchClasses,
          selectedTransposition.descendingPitchClasses,
          pitchClasses
        );

        const lowerOctaveJinsDegreesNoteNames = createLowerOctaveJinsDegreesNoteNames(
          selectedTransposition.ascendingPitchClasses,
          selectedTransposition.descendingPitchClasses,
          pitchClasses
        );

        // Lower octave modulations shift each existing modulation result down by one octave
        // Uses shiftMaqamByOctaves with -1 to transpose each maqām to start one octave below
        // The shifted maqam has different name/displayName reflecting the transposed pitch classes
        responseData.lowerOctaveModulations = {
          degreesNoteNames: {
            maqamat: lowerOctaveMaqamDegreesNoteNames,
            ajnas: lowerOctaveJinsDegreesNoteNames
          },
          maqamat: {
            onFirstDegree: maqamatModulations.modulationsOnFirstDegree
              .map((m: any) => {
                const shifted = shiftMaqamByOctaves(pitchClasses, m, -1);
                const entity = maqamIdToEntity.get(m.maqamId);
                return shifted && entity ? { id: entity.id, idName: standardizeText(shifted.name), displayName: shifted.name } : null;
              })
              .filter((m: any) => m !== null),
            onThirdDegree: maqamatModulations.modulationsOnThirdDegree
              .map((m: any) => {
                const shifted = shiftMaqamByOctaves(pitchClasses, m, -1);
                const entity = maqamIdToEntity.get(m.maqamId);
                return shifted && entity ? { id: entity.id, idName: standardizeText(shifted.name), displayName: shifted.name } : null;
              })
              .filter((m: any) => m !== null),
            onAltThirdDegree: maqamatModulations.modulationsOnAltThirdDegree
              .map((m: any) => {
                const shifted = shiftMaqamByOctaves(pitchClasses, m, -1);
                const entity = maqamIdToEntity.get(m.maqamId);
                return shifted && entity ? { id: entity.id, idName: standardizeText(shifted.name), displayName: shifted.name } : null;
              })
              .filter((m: any) => m !== null),
            onFourthDegree: maqamatModulations.modulationsOnFourthDegree
              .map((m: any) => {
                const shifted = shiftMaqamByOctaves(pitchClasses, m, -1);
                const entity = maqamIdToEntity.get(m.maqamId);
                return shifted && entity ? { id: entity.id, idName: standardizeText(shifted.name), displayName: shifted.name } : null;
              })
              .filter((m: any) => m !== null),
            onFifthDegree: maqamatModulations.modulationsOnFifthDegree
              .map((m: any) => {
                const shifted = shiftMaqamByOctaves(pitchClasses, m, -1);
                const entity = maqamIdToEntity.get(m.maqamId);
                return shifted && entity ? { id: entity.id, idName: standardizeText(shifted.name), displayName: shifted.name } : null;
              })
              .filter((m: any) => m !== null),
            onSixthDegreeAsc: maqamatModulations.modulationsOnSixthDegreeAsc
              .map((m: any) => {
                const shifted = shiftMaqamByOctaves(pitchClasses, m, -1);
                const entity = maqamIdToEntity.get(m.maqamId);
                return shifted && entity ? { id: entity.id, idName: standardizeText(shifted.name), displayName: shifted.name } : null;
              })
              .filter((m: any) => m !== null),
            onSixthDegreeDesc: maqamatModulations.modulationsOnSixthDegreeDesc
              .map((m: any) => {
                const shifted = shiftMaqamByOctaves(pitchClasses, m, -1);
                const entity = maqamIdToEntity.get(m.maqamId);
                return shifted && entity ? { id: entity.id, idName: standardizeText(shifted.name), displayName: shifted.name } : null;
              })
              .filter((m: any) => m !== null),
            onSixthDegreeIfNoThird: maqamatModulations.modulationsOnSixthDegreeIfNoThird
              .map((m: any) => {
                const shifted = shiftMaqamByOctaves(pitchClasses, m, -1);
                const entity = maqamIdToEntity.get(m.maqamId);
                return shifted && entity ? { id: entity.id, idName: standardizeText(shifted.name), displayName: shifted.name } : null;
              })
              .filter((m: any) => m !== null)
          },
          ajnas: {
            // Lower octave ajnas modulations - shift each jins down by one octave
            onFirstDegree: ajnasModulations.modulationsOnFirstDegree
              .map((j: any) => {
                const shifted = shiftJinsByOctaves(pitchClasses, j, -1);
                const entity = jinsIdToEntity.get(j.jinsId);
                return shifted && entity ? { id: entity.id, idName: standardizeText(shifted.name), displayName: shifted.name } : null;
              })
              .filter((j: any) => j !== null),
            onThirdDegree: ajnasModulations.modulationsOnThirdDegree
              .map((j: any) => {
                const shifted = shiftJinsByOctaves(pitchClasses, j, -1);
                const entity = jinsIdToEntity.get(j.jinsId);
                return shifted && entity ? { id: entity.id, idName: standardizeText(shifted.name), displayName: shifted.name } : null;
              })
              .filter((j: any) => j !== null),
            onAltThirdDegree: ajnasModulations.modulationsOnAltThirdDegree
              .map((j: any) => {
                const shifted = shiftJinsByOctaves(pitchClasses, j, -1);
                const entity = jinsIdToEntity.get(j.jinsId);
                return shifted && entity ? { id: entity.id, idName: standardizeText(shifted.name), displayName: shifted.name } : null;
              })
              .filter((j: any) => j !== null),
            onFourthDegree: ajnasModulations.modulationsOnFourthDegree
              .map((j: any) => {
                const shifted = shiftJinsByOctaves(pitchClasses, j, -1);
                const entity = jinsIdToEntity.get(j.jinsId);
                return shifted && entity ? { id: entity.id, idName: standardizeText(shifted.name), displayName: shifted.name } : null;
              })
              .filter((j: any) => j !== null),
            onFifthDegree: ajnasModulations.modulationsOnFifthDegree
              .map((j: any) => {
                const shifted = shiftJinsByOctaves(pitchClasses, j, -1);
                const entity = jinsIdToEntity.get(j.jinsId);
                return shifted && entity ? { id: entity.id, idName: standardizeText(shifted.name), displayName: shifted.name } : null;
              })
              .filter((j: any) => j !== null),
            onSixthDegreeAsc: ajnasModulations.modulationsOnSixthDegreeAsc
              .map((j: any) => {
                const shifted = shiftJinsByOctaves(pitchClasses, j, -1);
                const entity = jinsIdToEntity.get(j.jinsId);
                return shifted && entity ? { id: entity.id, idName: standardizeText(shifted.name), displayName: shifted.name } : null;
              })
              .filter((j: any) => j !== null),
            onSixthDegreeDesc: ajnasModulations.modulationsOnSixthDegreeDesc
              .map((j: any) => {
                const shifted = shiftJinsByOctaves(pitchClasses, j, -1);
                const entity = jinsIdToEntity.get(j.jinsId);
                return shifted && entity ? { id: entity.id, idName: standardizeText(shifted.name), displayName: shifted.name } : null;
              })
              .filter((j: any) => j !== null),
            onSixthDegreeIfNoThird: ajnasModulations.modulationsOnSixthDegreeIfNoThird
              .map((j: any) => {
                const shifted = shiftJinsByOctaves(pitchClasses, j, -1);
                const entity = jinsIdToEntity.get(j.jinsId);
                return shifted && entity ? { id: entity.id, idName: standardizeText(shifted.name), displayName: shifted.name } : null;
              })
              .filter((j: any) => j !== null)
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
