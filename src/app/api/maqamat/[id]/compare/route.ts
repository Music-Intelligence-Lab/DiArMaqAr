import { NextResponse } from "next/server";
import { getMaqamat, getAjnas, getTuningSystems } from "@/functions/import";
import { standardizeText } from "@/functions/export";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { calculateMaqamTranspositions } from "@/functions/transpose";
import { handleCorsPreflightRequest, addCorsHeaders } from "@/app/api/cors";
import { classifyMaqamFamily } from "@/functions/classifyMaqamFamily";
import { calculateIpnReferenceMidiNote } from "@/functions/calculateIpnReferenceMidiNote";
import { parseInArabic, getMaqamNameDisplayAr, getJinsNameDisplayAr, getNoteNameDisplayAr, getTuningSystemDisplayNameAr } from "@/app/api/arabic-helpers";
import NoteName, { getNoteNameIndexAndOctave } from "@/models/NoteName";
import {
  buildEntityNamespace,
  buildIdentifierNamespace,
  buildLinksNamespace,
  buildListResponse,
  buildStringArrayNamespace,
  getCanonicalSelfUrl,
} from "@/app/api/response-shapes";

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
 * GET /api/maqamat/[id]/compare
 *
 * Compare maqām data across multiple tuning systems and starting notes.
 * Returns the Cartesian product of tuningSystems × startingNotes in
 * user-supplied TS-major order (outer loop = tuningSystems, inner loop
 * = startingNotes), so N tuning systems × M starting notes → N*M cells.
 *
 * Query parameters:
 * - tuningSystems (required): Comma-separated tuning system IDs
 *   Format: "ibnsina_1037,alfarabi_950g"
 * - startingNotes (required): Comma-separated starting note names
 *   (URL-safe, diacritics-insensitive). Format: "rast,yegah,ushayran".
 *   Either this or the deprecated singular `startingNote` must be
 *   provided; if both are sent, `startingNotes` wins.
 * - startingNote (deprecated alias): Single starting note, kept for
 *   backwards compatibility. Silently ignored if `startingNotes` is set.
 * - pitchClassDataType (optional): Output format (all, cents, fraction,
 *   etc.). Default: "all".
 * - includeIntervals (optional): Include interval data ("true" or
 *   "false"; default true when omitted).
 * - transposeTo (optional): Transpose to specific tonic note (applies
 *   to every cell).
 *
 * Per-cell outcomes (all HTTP 200):
 * - Success: cell has `pitchData.ascending` / `pitchData.descending`
 *   and related fields
 * - `note`: starting note is not available in that tuning system
 *   (informational, distinct from error); cell has a `note` string and
 *   `validStartingNotes` namespace
 * - `error`: hard failure (tuning system not found, maqām not
 *   realizable, transposeTo unreachable)
 *
 * The invariant `successfulComparisons + unavailableStartingNotes +
 * failedComparisons === totalComparisons` always holds.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: maqamId } = await params;
    const { searchParams } = new URL(request.url);
    const tuningSystemsParam = searchParams.get("tuningSystems");
    const startingNotesParam = searchParams.get("startingNotes");
    const legacyStartingNoteParam = searchParams.get("startingNote");
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
            example: '/api/maqamat/maqam_rast/compare?tuningSystems=ibnsina_1037,alfarabi_950g&startingNotes=yegah&pitchClassDataType=cents'
          },
          { status: 400 }
        )
      );
    }

    // Validate startingNotes parameter (accepts legacy `startingNote` as alias).
    // If both are supplied, `startingNotes` wins and `startingNote` is ignored.
    const effectiveStartingNotesRaw =
      startingNotesParam !== null ? startingNotesParam : legacyStartingNoteParam;

    if (effectiveStartingNotesRaw === null) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "startingNotes parameter is required",
            message: "At least one starting note must be specified",
            hint: "Add &startingNotes=yegah,rast to your request (comma-separated list)",
          },
          { status: 400 }
        )
      );
    }

    const startingNoteInputs = effectiveStartingNotesRaw
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (startingNoteInputs.length === 0) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "Invalid parameter: startingNotes",
            message: "The 'startingNotes' parameter must contain at least one starting note name.",
            hint: "Use ?startingNotes=yegah or ?startingNotes=yegah,rast,ushayran",
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

    // Build Cartesian product of tuningSystems × startingNotes in user-supplied order.
    // Outer loop = tuningSystems, inner loop = startingNotes, so the result list is:
    //   TS1×SN1, TS1×SN2, …, TS1×SNm, TS2×SN1, …, TSn×SNm
    const comparisons: Array<{
      tuningSystem: string;
      startingNote: string;
      transposeTo?: string;
    }> = [];
    for (const tuningSystemId of tuningSystemIds) {
      for (const startingNoteInput of startingNoteInputs) {
        comparisons.push({
          tuningSystem: tuningSystemId,
          startingNote: startingNoteInput,
          ...(transposeToNote && { transposeTo: transposeToNote }),
        });
      }
    }

    const maqamatData = getMaqamat();
    const tuningSystems = getTuningSystems();
    const ajnas = getAjnas();
    
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
      const { tuningSystem: tuningSystemId, startingNote: cellStartingNote, transposeTo: transposeToNote } = comparison;

      // Find tuning system
      const tuningSystem = tuningSystems.find((ts) => standardizeText(ts.getId()) === standardizeText(tuningSystemId));
      if (!tuningSystem) {
        const fallbackTuningSystem = buildEntityNamespace({
          id: tuningSystemId,
          idName: standardizeText(tuningSystemId),
          displayName: tuningSystemId,
        });

        const startingNoteNamespace = buildIdentifierNamespace({
          idName: standardizeText(cellStartingNote),
          displayName: cellStartingNote,
        });

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
        (set) => standardizeText(set[0]) === standardizeText(cellStartingNote)
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
            idName: standardizeText(cellStartingNote),
            displayName: cellStartingNote,
          },
          {
            inArabic,
            displayAr: inArabic ? getNoteNameDisplayAr(cellStartingNote) : undefined,
          }
        );

        const validDisplayNames = noteNameSets.map((set) => set[0]);
        const validIdNames = validDisplayNames.map((name) => standardizeText(name));

        const validOptionsNamespace = buildStringArrayNamespace(validIdNames, {
          inArabic,
          displayNames: validDisplayNames,
          displayNamesAr: inArabic
            ? validDisplayNames.map((name) => getNoteNameDisplayAr(name))
            : undefined,
        });

        comparisonResults.push({
          tuningSystem: tuningSystemNamespace,
          startingNote: requestedStartingNote,
          note: `Starting note '${cellStartingNote}' is not available in tuning system '${tuningSystem.stringify()}'`,
          validStartingNotes: validOptionsNamespace,
        });
        continue;
      }

      const selectedStartingNote = matchingSet[0];

      // Get pitch classes
      const pitchClasses = getTuningSystemPitchClasses(tuningSystem, selectedStartingNote);

      // Check if maqām is possible
      if (!maqam.isMaqamPossible(pitchClasses.map((pc) => pc.noteName))) {
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
          error: `Maqām '${maqam.getName()}' cannot be realized in this tuning system configuration`,
        });
        continue;
      }

      // Calculate transpositions
      const transpositions = calculateMaqamTranspositions(pitchClasses, ajnas, maqam, true, 5);

      // Prefer the tahlil whose tonic exactly matches the canonical tonic note
      // name (same note, same octave). `calculateMaqamTranspositions` picks its
      // tahlil by modal slot, which can land on `qarār dūgāh` when `dūgāh` also
      // exists in the tuning system — but the caller asked for the canonical
      // maqām, so we surface the canonical-octave form when it's available.
      const canonicalTonic = maqam.getAscendingNoteNames()[0];
      const canonicalTahlil = transpositions.find(
        (t) => t.ascendingPitchClasses[0].noteName === canonicalTonic
      );

      // Find specific transposition if requested
      let selectedTransposition = canonicalTahlil ?? transpositions[0];
      if (transposeToNote) {
        const found = transpositions.find(
          (t) => standardizeText(t.ascendingPitchClasses[0].noteName) === standardizeText(transposeToNote)
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

          const availableTranspositionsData = transpositions
            .filter((t) => t.transposition)
            .map((t) => {
              const tonicNoteName = t.ascendingPitchClasses[0].noteName;
              const fullMaqamName = t.name;
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

      // Get family classification from tahlil (first transposition)
      const tahlil = transpositions[0];
      const familyClassification = classifyMaqamFamily(tahlil);

      // Determine if transposed
      const originalTonic = maqam.getAscendingNoteNames()[0];
      const transposedTonic = selectedTransposition.ascendingPitchClasses[0].noteName;
      const isTransposed =
        getNoteNameIndexAndOctave(originalTonic as NoteName).index !==
        getNoteNameIndexAndOctave(transposedTonic as NoteName).index;

      const referenceFrequency =
        tuningSystem.getReferenceFrequencies()[selectedStartingNote] ??
        tuningSystem.getDefaultReferenceFrequency();

      // Build ajnas objects (keyed by note name) for this cell
      const ascendingAjnasObject: Record<string, unknown> = {};
      const descendingAjnasObject: Record<string, unknown> = {};

      if (selectedTransposition.ascendingMaqamAjnas) {
        for (let i = 0; i < selectedTransposition.ascendingPitchClasses.length; i++) {
          const noteName = selectedTransposition.ascendingPitchClasses[i].noteName;
          const jinsAtThisNote = selectedTransposition.ascendingMaqamAjnas[i];
          if (jinsAtThisNote === null) {
            ascendingAjnasObject[noteName] = null;
          } else {
            const jinsObj: Record<string, unknown> = {
              id: jinsAtThisNote.jinsId,
              idName: standardizeText(jinsAtThisNote.name || ""),
              displayName: jinsAtThisNote.name || "",
            };
            if (inArabic) {
              jinsObj.displayNameAr = getJinsNameDisplayAr(jinsAtThisNote.name || "");
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
            const jinsObj: Record<string, unknown> = {
              id: jinsAtThisNote.jinsId,
              idName: standardizeText(jinsAtThisNote.name || ""),
              displayName: jinsAtThisNote.name || "",
            };
            if (inArabic) {
              jinsObj.displayNameAr = getJinsNameDisplayAr(jinsAtThisNote.name || "");
            }
            descendingAjnasObject[noteName] = jinsObj;
          }
        }
      }

      // Per-cell entity namespaces
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

      const comparisonMaqamNamespace = buildEntityNamespace(
        {
          id: maqam.getId(),
          idName: isTransposed ? standardizeText(selectedTransposition.name) : maqam.getIdName(),
          displayName: isTransposed ? selectedTransposition.name : maqam.getName(),
        },
        {
          version: maqam.getVersion(),
          inArabic,
          displayNameAr: inArabic
            ? getMaqamNameDisplayAr(isTransposed ? selectedTransposition.name : maqam.getName())
            : undefined,
          extras: {
            maqamFamilyId: standardizeText(familyClassification.familyName),
            maqamFamilyDisplayName: familyClassification.familyName,
            ...(inArabic && {
              maqamFamilyDisplayNameAr: getMaqamNameDisplayAr(familyClassification.familyName),
            }),
          },
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

      // Build availableTranspositions (taswīr only)
      const availableTranspositionsData = transpositions
        .filter((t) => t.transposition)
        .map((t) => {
          const tonicNoteName = t.ascendingPitchClasses[0].noteName;
          const fullMaqamName = t.name;
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

      const pitchClassesInSingleOctave = tuningSystem.getOriginalPitchClassValues().length;

      const comparisonItem: Record<string, unknown> = {
        tuningSystem: tuningSystemNamespace,
        startingNote: startingNoteNamespace,
        maqam: comparisonMaqamNamespace,
        tonic: tonicNamespace,
        transposition: transpositionDetails,
        stats: {
          tuningSystem: {
            numberOfPitchClassesSingleOctave: pitchClassesInSingleOctave,
            referenceFrequency,
          },
          maqam: {
            numberOfPitchClasses: selectedTransposition.ascendingPitchClasses.length,
            isOctaveRepeating: selectedTransposition.ascendingPitchClasses.length <= 7,
          },
        },
        availableTranspositions: availableTranspositionsData,
        pitchData: {
          ascending: formatPitchData(
            selectedTransposition.ascendingPitchClasses,
            pitchClassDataType,
            false,
            inArabic
          ),
          descending: formatPitchData(
            selectedTransposition.descendingPitchClasses,
            pitchClassDataType,
            true,
            inArabic
          ),
        },
        ajnas: {
          ascending: ascendingAjnasObject,
          descending: descendingAjnasObject,
        },
        parameters: {
          pitchClassDataType,
          includeIntervals,
          transposeTo: transposeToNote || null,
        },
        links: buildLinksNamespace({
          detail: `/api/maqamat/${maqam.getIdName()}?tuningSystem=${encodeURIComponent(tuningSystem.getId())}&startingNote=${encodeURIComponent(selectedStartingNote)}&pitchClassDataType=${encodeURIComponent(pitchClassDataType)}&includeIntervals=${includeIntervals ? "true" : "false"}${transposeToNote ? `&transposeTo=${encodeURIComponent(transposeToNote)}` : ""}`,
          availability: `/api/maqamat/${maqam.getIdName()}/availability`,
        }),
      };

      if (includeIntervals) {
        comparisonItem.intervals = {
          ascending: formatIntervalData(
            selectedTransposition.ascendingPitchClassIntervals,
            pitchClassDataType
          ),
          descending: formatIntervalData(
            selectedTransposition.descendingPitchClassIntervals,
            pitchClassDataType
          ),
        };
      }

      comparisonResults.push(comparisonItem);
    }

    const successfulComparisons = comparisonResults.filter(
      (r) => !r.error && !r.note
    ).length;
    const unavailableStartingNotes = comparisonResults.filter(
      (r) => r.note !== undefined
    ).length;
    const failedComparisons = comparisonResults.filter(
      (r) => r.error !== undefined
    ).length;

    const comparisonsPayload = buildListResponse(comparisonResults, {
      meta: {
        totalComparisons: comparisonResults.length,
        successfulComparisons,
        unavailableStartingNotes,
        failedComparisons,
      },
    });

    const maqamSummary = buildEntityNamespace(
      {
        id: maqam.getId(),
        idName: maqam.getIdName(),
        displayName: maqam.getName(),
      },
      {
        version: maqam.getVersion(),
        inArabic,
        displayNameAr: inArabic ? getMaqamNameDisplayAr(maqam.getName()) : undefined,
      }
    );

    const tuningSystemsParamNamespace = buildStringArrayNamespace(
      tuningSystemIds.map((id) => standardizeText(id)),
      {
        displayNames: tuningSystemIds,
      }
    );

    const startingNotesParamNamespace = buildStringArrayNamespace(
      startingNoteInputs.map((n) => standardizeText(n)),
      {
        displayNames: startingNoteInputs,
        inArabic,
        displayNamesAr: inArabic
          ? startingNoteInputs.map((n) => getNoteNameDisplayAr(n))
          : undefined,
      }
    );

    const response = NextResponse.json({
      maqam: maqamSummary,
      comparisons: comparisonsPayload,
      parameters: {
        tuningSystems: tuningSystemsParamNamespace,
        startingNotes: startingNotesParamNamespace,
        pitchClassDataType,
        includeIntervals,
        transposeTo: transposeToNote || null,
      },
      links: buildLinksNamespace({
        self: getCanonicalSelfUrl(request),
        detail: `/api/maqamat/${maqam.getIdName()}`,
        availability: `/api/maqamat/${maqam.getIdName()}/availability`,
      }),
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

