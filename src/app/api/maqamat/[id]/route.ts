import { NextResponse } from "next/server";
import { mergePathTonic } from "@/app/api/path-tonic";
import { getMaqamat, getTuningSystems, getAjnas } from "@/functions/import";
import { entityToken, resolveEntityId, standardizeText } from "@/functions/export";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { calculateMaqamTranspositions } from "@/functions/transpose";
import { handleCorsPreflightRequest, addCorsHeaders } from "@/app/api/cors";
import { readBooleanFlags } from "@/app/api/boolean-flags";
import PitchClass from "@/models/PitchClass";
import { Maqam } from "@/models/Maqam";
import TuningSystem from "@/models/TuningSystem";
import { parseInArabic, getNoteNameDisplayAr, getTuningSystemDisplayNameAr } from "@/app/api/arabic-helpers";
import { buildMaqamDetail, MaqamDetailContext, MAQAM_DETAIL_FIELDS, validPitchClassDataTypes } from "@/app/api/maqamat/maqam-detail";
import {
  buildEntityNamespace,
  buildIdentifierNamespace,
  buildLinksNamespace,
  buildStringArrayNamespace,
  getCanonicalSelfUrl,
  getCanonicalApiUrl
} from "@/app/api/response-shapes";

export const OPTIONS = handleCorsPreflightRequest;

/** The values of `forms` on GET /maqamat/all */
const BULK_FORMS = ["base", "transpositions", "all"] as const;
type BulkForms = (typeof BULK_FORMS)[number];

/**
 * The most bytes of items one /maqamat/all page holds. A serverless function
 * can return at most 6 MB buffered (Netlify), so a page stops before this and
 * names the next one in `next`. A page always holds at least one form.
 */
const BULK_PAGE_BYTES = 5_000_000;

/**
 * `context.tuningSystem`: the tuning system and the starting note every maqām
 * form in the response is calculated from. One shape for the single and the
 * bulk route.
 */
function buildTuningSystemContext(tuningSystem: TuningSystem, selectedStartingNote: string, pitchClasses: PitchClass[], inArabic: boolean) {
  const noteNameSets = tuningSystem.getNoteNameSets();
  const tuningSystemStartingNoteNames = Array.from(
    new Set(noteNameSets.map((set) => set[0]).filter((name): name is string => Boolean(name)))
  );
  const tuningSystemStartingNoteNamesIds = tuningSystemStartingNoteNames.map((name) => standardizeText(name));

  return {
    ...buildEntityNamespace(
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
    startingNotes: buildStringArrayNamespace(tuningSystemStartingNoteNamesIds, {
      inArabic,
      displayNames: tuningSystemStartingNoteNames,
      displayNamesAr: inArabic ? tuningSystemStartingNoteNames.map((name) => getNoteNameDisplayAr(name)) : undefined,
    }),
    selectedStartingNote: buildIdentifierNamespace(
      { idName: standardizeText(selectedStartingNote), displayName: selectedStartingNote },
      { inArabic, displayAr: inArabic ? getNoteNameDisplayAr(selectedStartingNote) : undefined }
    ),
    pitchClassCounts: {
      singleOctave: tuningSystem.getOriginalPitchClassValues().length,
      allOctaves: pitchClasses.length,
    },
    originalValueType: pitchClasses[0]?.originalValueType || "unknown",
    referenceFrequency: tuningSystem.getReferenceFrequencies()[selectedStartingNote] ?? tuningSystem.getDefaultReferenceFrequency(),
  };
}

/**
 * GET /api/maqamat/[id]
 *
 * One maqām form in a tuning system from a starting note, or with [id]="all"
 * every maqām the tuning system can build. Both describe each form with
 * buildMaqamDetail (maqam-detail.ts), so a bulk item is exactly the single
 * route's body without its envelope (parameters, context, links).
 *
 * Query parameters (both routes):
 * - tuningSystem, startingNote: required
 * - pitchClassDataType: optional; minimal note-name fields when omitted
 * - includeIntervals, includeModulations, includeModulations8vb (needs
 *   includeModulations), includeSuyur, includeArabic: true|false, default false
 * - centsTolerance: non-negative number, default 5
 *
 * Single form only:
 * - transposeTo: the tonic of a taṣwīr or octave rendering; a transposed idName
 *   in the path (maqam_rast_al_nawa) names it too
 * - options=true: parameter discovery instead of data
 *
 * [id]="all" only:
 * - forms: base (default) | transpositions | all — the taḥlīl, its taṣwīr, or both
 * - includeOctaveRenderings: true adds the octave-register renderings (maqām rāst
 *   on qarār rāst), which are neither
 * - fields: comma-separated top-level fields to keep in each item; `maqam`
 *   always stays
 *
 * Each form carries maqam {id, idName, displayName, isBaseForm}, family, tonic,
 * transposition (only for a taṣwīr), stats (counts describe the taḥlīl),
 * characteristics, availableTranspositions, comments, sources, pitchData,
 * ajnas (keyed by each degree's URL-safe noteName), primaryJins, secondaryJins,
 * tertiaryJins, ghammaz, and the optional intervals, suyur, modulations and
 * lowerOctaveModulations.
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
    const booleanFlags = readBooleanFlags(searchParams, ["includeIntervals", "includeModulations", "includeModulations8vb", "includeSuyur", "options", "includeOctaveRenderings"]);
    if ("error" in booleanFlags) return addCorsHeaders(booleanFlags.error);
    const { includeIntervals, includeModulations, includeModulations8vb: includeModulations8vbEnabled, includeSuyur, options: showOptions, includeOctaveRenderings } = booleanFlags.values;
    let transposeToNote = searchParams.get("transposeTo");
    if (searchParams.has("includeLowerOctaveModulations")) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "Invalid parameter: includeLowerOctaveModulations",
            message:
              "That query name is not supported. Use includeModulations8vb=true for lower-octave modulations.",
            hint: "Replace includeLowerOctaveModulations with includeModulations8vb",
          },
          { status: 400 }
        )
      );
    }

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
            hint: "Use ?includeArabic=true or ?inArabic=false"
          },
          { status: 400 }
        )
      );
    }

    const maqamatData = getMaqamat();
    const tuningSystems = getTuningSystems();
    const ajnas = getAjnas();

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

      // Which forms of each maqām to describe: the taḥlīl, its taṣwīr, or both
      const formsParam = searchParams.get("forms") ?? "base";
      if (!BULK_FORMS.includes(formsParam as BulkForms)) {
        return addCorsHeaders(
          NextResponse.json(
            {
              error: `Invalid parameter: forms`,
              message: `forms must be one of ${BULK_FORMS.join(", ")}, got '${formsParam}'`,
              validOptions: BULK_FORMS,
              hint: "Use ?forms=base (default), ?forms=transpositions or ?forms=all"
            },
            { status: 400 }
          )
        );
      }
      const forms = formsParam as BulkForms;

      // Top-level fields to keep in each item; `maqam` always stays, so every
      // item says which form it is
      const fieldsParam = searchParams.get("fields");
      let fields: string[] | null = null;
      if (fieldsParam !== null) {
        fields = fieldsParam.split(",").map((field) => field.trim()).filter(Boolean);
        const unknown = fields.filter((field) => !MAQAM_DETAIL_FIELDS.includes(field));
        if (fields.length === 0 || unknown.length > 0) {
          return addCorsHeaders(
            NextResponse.json(
              {
                error: "Invalid parameter: fields",
                message: fields.length === 0
                  ? "fields cannot be empty. Leave it out to return every field."
                  : `Unknown field(s): ${unknown.join(", ")}`,
                validOptions: MAQAM_DETAIL_FIELDS,
                hint: "Use ?fields=ajnas,modulations (comma-separated); maqam is always returned"
              },
              { status: 400 }
            )
          );
        }
      }

      // Where this page starts in the full list of selected forms
      const offsetParam = searchParams.get("offset");
      const offset = offsetParam === null ? 0 : Number(offsetParam);
      if (offsetParam !== null && (offsetParam.trim() === "" || !Number.isInteger(offset) || offset < 0)) {
        return addCorsHeaders(
          NextResponse.json(
            {
              error: "Invalid parameter: offset",
              message: `offset must be a non-negative integer, got '${offsetParam}'`,
              hint: "Leave offset out for the first page, then follow `next`"
            },
            { status: 400 }
          )
        );
      }

      const pitchClasses = getTuningSystemPitchClasses(tuningSystem, selectedStartingNote);
      const ctx = new MaqamDetailContext(pitchClasses, ajnas, maqamatData, {
        pitchClassDataType,
        includeIntervals,
        includeModulations,
        includeModulations8vb: includeModulations8vbEnabled,
        includeSuyur,
        inArabic,
        centsTolerance,
      });

      const noteNames = pitchClasses.map((pc) => pc.noteName);
      const availableMaqamat = maqamatData
        .filter((maqam) => maqam.isMaqamPossible(noteNames))
        .sort((a, b) => a.getName().localeCompare(b.getName()));

      // Each maqām's forms in the order calculateMaqamTranspositions lists them.
      // A taṣwīr has transposition=true; an octave-register rendering (rāst on
      // qarār rāst) is neither the taḥlīl nor a taṣwīr.
      const isSelected = (form: Maqam) =>
        (form.isBaseForm && forms !== "transpositions") ||
        (form.transposition && forms !== "base") ||
        (includeOctaveRenderings && !form.isBaseForm && !form.transposition);

      const selectedForms = availableMaqamat.flatMap((maqam) => {
        const transpositions = ctx.transpositionsOf(maqam);
        return transpositions.filter(isSelected).map((form) => ({ maqam, transpositions, form }));
      });
      const total = selectedForms.length;
      if (offset > 0 && offset >= total) {
        return addCorsHeaders(
          NextResponse.json(
            {
              error: "Invalid parameter: offset",
              message: `offset ${offset} is past the last of the ${total} selected forms`,
              hint: "Leave offset out for the first page, then follow `next`"
            },
            { status: 400 }
          )
        );
      }

      // Fill the page form by form until the next one would pass the byte budget
      const fieldSet = fields ? new Set(fields) : undefined;
      const items: Record<string, any>[] = [];
      let pageBytes = 0;
      let index = offset;
      for (; index < total; index++) {
        const { maqam, transpositions, form } = selectedForms[index];
        const item = buildMaqamDetail(ctx, maqam, transpositions, form, {}, fieldSet);
        const itemBytes = Buffer.byteLength(JSON.stringify(item));
        if (items.length > 0 && pageBytes + itemBytes > BULK_PAGE_BYTES) break;
        items.push(item);
        pageBytes += itemBytes;
      }

      let next: string | null = null;
      if (index < total) {
        const nextUrl = new URL(getCanonicalSelfUrl(request));
        nextUrl.searchParams.set("offset", String(index));
        next = nextUrl.toString();
      }

      return addCorsHeaders(
        NextResponse.json({
          context: { tuningSystem: buildTuningSystemContext(tuningSystem, selectedStartingNote, pitchClasses, inArabic) },
          parameters: {
            pitchClassDataType,
            includeIntervals,
            includeModulations,
            includeModulations8vb: includeModulations8vbEnabled,
            includeSuyur,
            centsTolerance,
            forms,
            includeOctaveRenderings,
            fields,
            offset,
          },
          total,
          count: items.length,
          next,
          maqamat: items
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
            example: getCanonicalApiUrl(`/api/maqamat/maqam_rast?tuningSystem=ibnsina_1037`) 
          },
          { status: 400 }
        )
      );
    }
    
    const resolvedId = resolveEntityId(maqamId, maqamatData);
    const maqam = resolvedId?.entity;

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

    // A transposed idName in the path names the tonic too (maqam_rast_al_nawa)
    const pathTonic = mergePathTonic(maqamId, resolvedId?.tonicIdName, "transposeTo", transposeToNote);
    if (pathTonic.error) return addCorsHeaders(pathTonic.error);
    transposeToNote = pathTonic.tonic;

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
      if (includeModulations8vbEnabled) conflictingParams.push("includeModulations8vb");
      if (includeSuyur) conflictingParams.push("includeSuyur");
      if (pitchClassDataType && pitchClassDataType !== "cents") conflictingParams.push("pitchClassDataType");
      if (includeIntervals) conflictingParams.push("includeIntervals");

      // Return 400 error if conflicting parameters are present (REST API best practice)
      if (conflictingParams.length > 0) {
        return addCorsHeaders(
          NextResponse.json(
            {
              error: "Conflicting parameters with options=true",
              message: `The following data-returning parameters cannot be used with options=true (parameter discovery mode): ${conflictingParams.join(", ")}`,
              hint: "Remove all data-returning parameters to use discovery mode, or remove options=true to retrieve maqām data.",
            conflictingParameters: conflictingParams,
            contextualParametersAllowed: ["tuningSystem", "startingNote", "pitchClassDataType", "centsTolerance"]
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
              hint: `Add &tuningSystem=ibnsina_1037 to your request. Use /api/maqamat/${maqam.getIdName()}/availability to see available tuning systems`,
              availabilityUrl: getCanonicalApiUrl(`/api/maqamat/${maqam.getIdName()}/availability`)
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

      // startingNote is optional in discovery mode: when omitted, the response
      // still lists starting-note options but transpositions cannot be computed.
      const noteNameSets = selectedTuningSystem.getNoteNameSets();
      let selectedStartingNote: string | null = null;

      if (startingNote !== null) {
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
        selectedStartingNote = matchingSet[0];
      }

      // Available starting notes for this tuning system (URL-ready idNames)
      const startingNoteOptions = noteNameSets.map((set) => standardizeText(set[0]));

      // Transpositions require a starting note; null = not computed
      const transposeOptions =
        selectedStartingNote !== null
          ? calculateMaqamTranspositions(
              getTuningSystemPitchClasses(selectedTuningSystem, selectedStartingNote),
              ajnas,
              maqam,
              true,
              centsTolerance
            ).map((t) => standardizeText(t.ascendingPitchClasses[0].noteName))
          : null;

      const exampleStartingNote =
        selectedStartingNote !== null ? standardizeText(selectedStartingNote) : startingNoteOptions[0];

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
              description: "Theoretical framework for note naming. Required for data retrieval. Optional for discovery mode (options=true). Needed to calculate transposition options."
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
              required: false,
              description: "Output format for pitch data. Optional — when omitted, pitch classes contain only minimal note-name fields. Use 'cents' for tuning analysis or 'all' for complete pitch class information."
            },
            includeIntervals: {
              type: "boolean",
              default: false,
              description: "Include interval data between pitch classes (?includeIntervals=true)"
            },
            transposeTo: {
              options: transposeOptions,
              description: "Transpose to specific tonic (taṣwīr) - only valid transpositions shown. Calculated based on the provided tuningSystem and startingNote; null until a startingNote is provided."
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
            },
            centsTolerance: {
              type: "number",
              default: 5,
              description: "Tolerance in cents for pitch matching in transposition and modulation calculations (non-negative number)"
            }
          },
          notes: {
            ajnasData: "Ajnās (constituent melodic structures) are always included in the response for maqām analysis",
            formatOptions: "The 'pitchClassDataType' parameter controls which pitch class properties are returned. Use 'all' for comprehensive data or specific formats like 'cents', 'fraction', etc. for targeted data."
          },
          examples: [
            getCanonicalApiUrl(`/api/maqamat/${maqam.getIdName()}?tuningSystem=${tuningSystemId}&startingNote=${exampleStartingNote}&pitchClassDataType=cents&includeIntervals=true`),
            ...(transposeOptions !== null && transposeOptions.length > 1
              ? [getCanonicalApiUrl(`/api/maqamat/${maqam.getIdName()}?tuningSystem=${tuningSystemId}&startingNote=${exampleStartingNote}&pitchClassDataType=cents&transposeTo=${transposeOptions[1]}&includeModulations=true`)]
              : []),
            `/api/maqamat/${maqam.getIdName()}?tuningSystem=${tuningSystemId}&startingNote=${exampleStartingNote}&pitchClassDataType=all&includeSuyur=true`
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
            hint: `Use /api/maqamat/${maqam.getIdName()}/availability to see available tuning systems`,
            availabilityUrl: getCanonicalApiUrl(`/api/maqamat/${maqam.getIdName()}/availability`)
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
            hint: `Add &startingNote=${validOptions[0]} to your request, or add &options=true to discover valid values`
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
            hint: `Use /api/maqamat/${maqam.getIdName()}/availability to see compatible tuning systems`
          },
          { status: 422 }
        )
      );
    }

    const ctx = new MaqamDetailContext(pitchClasses, ajnas, maqamatData, {
      pitchClassDataType,
      includeIntervals,
      includeModulations,
      includeModulations8vb: includeModulations8vbEnabled,
      includeSuyur,
      inArabic,
      centsTolerance,
    });
    const transpositions = ctx.transpositionsOf(maqam);

    // Find specific transposition if requested; the taḥlīl otherwise
    let selectedTransposition = transpositions.find((t) => t.isBaseForm)!;
    if (transposeToNote) {
      const found = transpositions.find(
        (t) => standardizeText(t.ascendingPitchClasses[0].noteName) === standardizeText(transposeToNote)
      );
      if (!found) {
        return addCorsHeaders(
          NextResponse.json(
            {
              error: `Cannot transpose to '${transposeToNote}' in this tuning system`,
              availableTranspositions: transpositions.filter((t) => t.transposition).map((t) => ({
                idName: entityToken(t),
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

    const parameters = {
      pitchClassDataType,
      includeIntervals,
      includeModulations,
      includeModulations8vb: includeModulations8vbEnabled,
      includeSuyur,
      transposeTo: transposeToNote || null,
      centsTolerance,
    };

    const responseData = buildMaqamDetail(ctx, maqam, transpositions, selectedTransposition, {
      parameters,
      context: { tuningSystem: buildTuningSystemContext(tuningSystem, selectedStartingNote, pitchClasses, inArabic) },
      links: buildLinksNamespace({
        self: getCanonicalSelfUrl(request),
        detail: `/api/maqamat/${maqam.getIdName()}`,
        availability: `/api/maqamat/${maqam.getIdName()}/availability`,
        compare: `/api/maqamat/${maqam.getIdName()}/compare`,
      }),
    });

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
