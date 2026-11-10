import { formTypeOf } from "@/functions/formType";
import { NextRequest, NextResponse } from "next/server";
import { getTuningSystems, getMaqamat, getAjnas } from "@/functions/import";
import { readBooleanFlags } from "@/app/api/boolean-flags";
import { entityToken, standardizeText } from "@/functions/export";
import { calculateMaqamForms } from "@/functions/transpose";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { calculateIpnReferenceMidiNote } from "@/functions/calculateIpnReferenceMidiNote";
import PitchClass from "@/models/PitchClass";
import { classifyMaqamFamily } from "@/functions/classifyMaqamFamily";
import { handleCorsPreflightRequest, addCorsHeaders } from "@/app/api/cors";
import { parseInArabic, getMaqamNameDisplayAr, getNoteNameDisplayAr, getTuningSystemDisplayNameAr } from "@/app/api/arabic-helpers";
import {
  buildEntityNamespace,
  buildIdentifierNamespace,
  buildLinksNamespace,
  buildStringArrayNamespace,
  getCanonicalApiUrl
} from "@/app/api/response-shapes";
import { parseSortBy, compareByDisplayName, compareByTonicThenName, buildInvalidSortByResponseBody, InvalidSortByError } from "@/app/api/sort-helpers";

export const OPTIONS = handleCorsPreflightRequest;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; startingNote: string }> }
) {
  try {
    const { id: tuningSystemId, startingNote: startingNoteParam } = await params;
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

    // Parse optional include flags
    const booleanFlags = readBooleanFlags(searchParams, ["includeTranspositions", "includeOctaveRenderings", "includeMaqamDegrees", "includeDegreeDetails"]);
    if ("error" in booleanFlags) return addCorsHeaders(booleanFlags.error);
    const { includeTranspositions, includeOctaveRenderings, includeMaqamDegrees, includeDegreeDetails } = booleanFlags.values;
    const shouldIncludeDegreeDetails = includeMaqamDegrees && includeDegreeDetails;

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

    let sortBy: "alphabetical" | "tonic";
    try {
      sortBy = parseSortBy(searchParams.get("sortBy"), "tonic");
    } catch (err) {
      if (err instanceof InvalidSortByError) {
        return addCorsHeaders(
          NextResponse.json(buildInvalidSortByResponseBody(err.received), { status: 400 })
        );
      }
      throw err;
    }

    // Validate that path parameters are not empty
    if (!tuningSystemId || tuningSystemId.trim() === "") {
      const response = NextResponse.json(
        {
          error: "Invalid path parameter: id",
          message: "The tuning system ID cannot be empty.",
          hint: "Provide a valid tuning system ID in the URL path, e.g., /api/tuning-systems/ibnsina_1037/yegah/maqamat"
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
          hint: "Provide a valid starting note in the URL path, e.g., /api/tuning-systems/ibnsina_1037/yegah/maqamat"
        },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // Get data
    const tuningSystems = getTuningSystems();
    const maqamatData = getMaqamat();
    const ajnas = getAjnas();

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
    const availableTuningSystemStartingNotes = tuningSystem.getNoteNameSets()
      .map((set: string[]) => ({
        id: standardizeText(set[0]),
        display: set[0]
      }));
    
    const normalizedParam = standardizeText(startingNoteParam);
    const isValidStartingNote = availableTuningSystemStartingNotes.some(
      (note: any) => note.id === normalizedParam
    );

    if (!isValidStartingNote) {
      const response = NextResponse.json(
        {
          error: "Invalid starting note",
          message: `The starting note "${startingNoteParam}" is not valid for tuning system ${tuningSystemId}`,
          availableTuningSystemStartingNotes,
          hint: `Valid starting notes for this tuning system: ${availableTuningSystemStartingNotes.map((n: any) => n.display).join(", ")}`,
        },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // The starting note requested in the path, in its display form (with
    // diacritics) — getTuningSystemPitchClasses matches note-name sets on the
    // exact string. Every maqām below is analysed in THIS set: the starting note
    // selects which note-name set the tuning system uses, so it is a property of
    // the tuning system, not of the individual maqām.
    const requestedStartingNoteDisplay = tuningSystem.getNoteNameSets()
      .find((set: string[]) => standardizeText(set[0]) === normalizedParam)![0];

    // Pitch classes depend only on (tuningSystem, startingNote), so compute them
    // once for the whole request rather than per maqām.
    const pitchClasses = getTuningSystemPitchClasses(tuningSystem, requestedStartingNoteDisplay);
    // The pitch space every maqām is checked against: the same note names the
    // transpositions below are calculated in (see getPitchSpaceNoteNames).
    const pitchSpaceNoteNames = pitchClasses.map((pc) => pc.noteName);

    // Sequential spelling logic for degree detail objects (englishName + solfege).
    // We import lazily to keep the default list endpoint fast.
    const degreeSpellingsModule = shouldIncludeDegreeDetails
      ? await import("@/functions/renderPitchClassIpnSpellings")
      : null;
    const renderPitchClassSpellings = degreeSpellingsModule?.renderPitchClassSpellings;

    // One degree-detail object, shared by the base form and every transposition in
    // both directions. The 12-EDO fields match GET /maqamat/{id}: the reference
    // key the degree is spelled against, the deviation from it, and the two as
    // "<MIDI note> <±cents>", so a client can map degrees to keyboard keys
    // without deriving the key from englishName.
    const toDegreeDetail = (pc: PitchClass) => ({
      noteName: standardizeText(pc.noteName),
      englishName: pc.englishName,
      solfege: pc.solfege!,
      ipnReferenceNoteName: pc.referenceNoteName,
      centsDeviation: pc.centsDeviation,
      midiNotePlusCentsDeviation: `${calculateIpnReferenceMidiNote(pc)} ${pc.centsDeviation >= 0 ? "+" : ""}${pc.centsDeviation.toFixed(1)}`,
    });

    // Find all maqamat that are possible in this tuning system
    const availableMaqamat: any[] = [];

    for (const maqam of maqamatData) {
      if (maqam.isMaqamPossible(pitchSpaceNoteNames)) {
        // The maqām's own tonic, used for the `tonic` namespace below. It must not
        // be passed to getTuningSystemPitchClasses — a maqām tonic is rarely one of
        // a tuning system's starting notes, and doing so previously selected the
        // wrong note-name set, which made includeTranspositions return an empty
        // array for every maqām in systems like ibnsina_1037.
        const canonicalStartingNote = maqam.getAscendingNoteNames()[0];

        // Calculate transpositions and get the base form
        const transpositions = calculateMaqamForms(
          pitchClasses,
          ajnas,
          maqam,
          centsTolerance
        );
        // The base form. Not `!t.transposition` — that is also false
        // for the base form's octave renderings.
        const baseForm = transpositions.find((t: any) => t.isBaseForm);

        // Skip if no base form is found (shouldn't happen but TypeScript safety)
        if (!baseForm) {
          continue;
        }

        // Get classification
        const classification = classifyMaqamFamily(baseForm);

        // Check for asymmetric descending
        const ascendingNotes = maqam.getAscendingNoteNames();
        const descendingNotes = maqam.getDescendingNoteNames();
        const hasAsymmetricDescending =
          JSON.stringify(ascendingNotes) !== JSON.stringify(descendingNotes);

        // Check for suyur
        const suyur = maqam.getSuyur();
        const hasSuyur = suyur && suyur.length > 0;

        const maqamNamespace = buildEntityNamespace(
          {
            id: maqam.getId(),
            idName: maqam.getIdName(),
            displayName: maqam.getName(),
          },
          {
            version: maqam.getVersion(),
            // Every item on this listing is the base form; the taswir are listed
            // separately under `transpositions`. Taken from the resolved base form
            // rather than hard-coded true.
            extras: { isBaseForm: baseForm.isBaseForm, formType: formTypeOf(baseForm) },
            inArabic,
            displayNameAr: inArabic ? getMaqamNameDisplayAr(maqam.getName()) : undefined,
          }
        );

        const familyId = standardizeText(classification.familyName);
        const familyNamespace = buildIdentifierNamespace(
          {
            idName: familyId,
            displayName: classification.familyName,
          },
          {
            inArabic,
            displayAr: inArabic ? getMaqamNameDisplayAr(classification.familyName) : undefined,
          }
        );

        const tonicNamespace = buildIdentifierNamespace(
          {
            idName: standardizeText(canonicalStartingNote),
            displayName: canonicalStartingNote,
          },
          {
            inArabic,
            displayAr: inArabic ? getNoteNameDisplayAr(canonicalStartingNote) : undefined,
          }
        );

        const item: Record<string, unknown> = {
          maqam: maqamNamespace,
          family: familyNamespace,
          tonic: tonicNamespace,
          stats: {
            numberOfPitchClasses: ascendingNotes.length,
          },
          characteristics: {
            isOctaveRepeating: ascendingNotes.length <= 7,
            hasAsymmetricDescending,
            hasSuyur,
          },
          links: buildLinksNamespace({
            detail: `/api/maqamat/${maqam.getIdName()}`,
          }),
        };

        if (includeMaqamDegrees) {
          if (shouldIncludeDegreeDetails && renderPitchClassSpellings) {
            // Spell each direction on its own: ascending and descending are
            // independent outside 12-pitch-class sets.
            const renderedAscending = renderPitchClassSpellings(baseForm.ascendingPitchClasses, true);
            const renderedDescending = renderPitchClassSpellings(baseForm.descendingPitchClasses, false);

            item.maqamDegrees = {
              ascending: renderedAscending.map(toDegreeDetail),
              descending: renderedDescending.map(toDegreeDetail),
            };
          } else {
            item.maqamDegrees = {
              ascending: ascendingNotes.map((n) => standardizeText(n)),
              descending: descendingNotes.map((n) => standardizeText(n)),
            };
          }
        }

        // One entry shape for every rendering listed: the taṣwīr under
        // `transpositions`, the octave renderings under `octaveRenderings`.
        const renderingEntry = (t: any) => {
          const tonicNoteName = t.ascendingPitchClasses[0].noteName;
          // Each direction on its own, as for the base form above.
          const maqamDegrees =
            shouldIncludeDegreeDetails && renderPitchClassSpellings
              ? {
                  ascending: renderPitchClassSpellings(t.ascendingPitchClasses, true).map(toDegreeDetail),
                  descending: renderPitchClassSpellings(t.descendingPitchClasses, false).map(toDegreeDetail),
                }
              : {
                  ascending: t.ascendingPitchClasses.map((pc: any) => standardizeText(pc.noteName)),
                  descending: t.descendingPitchClasses.map((pc: any) => standardizeText(pc.noteName)),
                };
          return {
            idName: entityToken(t),
            displayName: t.name,
            ...(inArabic && { displayNameAr: getMaqamNameDisplayAr(t.name) }),
            tonic: buildIdentifierNamespace(
              { idName: standardizeText(tonicNoteName), displayName: tonicNoteName },
              { inArabic, displayAr: inArabic ? getNoteNameDisplayAr(tonicNoteName) : undefined }
            ),
            isBaseForm: t.isBaseForm,
            formType: formTypeOf(t),
            maqamDegrees,
          };
        };
        if (includeTranspositions) {
          item.transpositions = transpositions.filter((t) => formTypeOf(t) === "transposition").map(renderingEntry);
        }
        if (includeOctaveRenderings) {
          item.octaveRenderings = transpositions.filter((t) => formTypeOf(t) === "octaveRendering").map(renderingEntry);
        }

        availableMaqamat.push(item);
      }
    }

    if (sortBy === "tonic") {
      availableMaqamat.sort((a: any, b: any) =>
        compareByTonicThenName(a.tonic.idName, a.maqam.displayName, b.tonic.idName, b.maqam.displayName)
      );
    } else {
      availableMaqamat.sort((a: any, b: any) => compareByDisplayName(a.maqam.displayName, b.maqam.displayName));
    }

    // Build response
    const tuningSystemNoteNameSets = tuningSystem.getNoteNameSets();
    const tuningSystemStartingNoteNames = Array.from(
      new Set(
        tuningSystemNoteNameSets
          .map((set: string[]) => set[0])
          .filter((name): name is string => Boolean(name))
      )
    );
    const tuningSystemStartingNoteNamesIds = tuningSystemStartingNoteNames.map((name) => standardizeText(name));
    const selectedStartingNoteDisplay = tuningSystemNoteNameSets
      .find((set: string[]) => standardizeText(set[0]) === normalizedParam)?.[0] || startingNoteParam;
    const referenceFrequency = tuningSystem.getReferenceFrequencies()[selectedStartingNoteDisplay] ?? tuningSystem.getDefaultReferenceFrequency();

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

    const startingNotesNamespace = buildStringArrayNamespace(tuningSystemStartingNoteNamesIds, {
      inArabic,
      displayNames: tuningSystemStartingNoteNames,
      displayNamesAr: inArabic
        ? tuningSystemStartingNoteNames.map((name) => getNoteNameDisplayAr(name))
        : undefined,
    });

    const selectedStartingNoteNamespace = buildIdentifierNamespace(
      {
        idName: normalizedParam,
        displayName: selectedStartingNoteDisplay,
      },
      {
        inArabic,
        displayAr: inArabic ? getNoteNameDisplayAr(selectedStartingNoteDisplay) : undefined,
      }
    );

    const stats = {
      totalMaqamatForStartingNote: availableMaqamat.length,
      totalMaqamatInLibrary: maqamatData.length,
      uniqueTonicCount: new Set(availableMaqamat.map((m: any) => m.tonic.idName)).size,
      uniqueFamilyCount: new Set(availableMaqamat.map((m: any) => m.family.idName)).size,
      referenceFrequency,
    };

    const response = NextResponse.json({
      tuningSystem: tuningSystemNamespace,
      startingNotes: startingNotesNamespace,
      selectedStartingNote: selectedStartingNoteNamespace,
      stats,
      data: availableMaqamat,
      links: buildLinksNamespace({
        self: getCanonicalApiUrl(`/api/tuning-systems/${tuningSystemId}/${startingNoteParam}/maqamat`),
        tuningSystem: `/api/tuning-systems/${tuningSystemId}`,
        collection: `/api/maqamat`,
      }),
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error in tuning systems maqamat endpoint:", error);
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
