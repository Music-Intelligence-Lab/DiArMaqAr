import { NextRequest, NextResponse } from "next/server";
import { getTuningSystems, getAjnas } from "@/functions/import";
import { standardizeText } from "@/functions/export";
import { calculateJinsTranspositions } from "@/functions/transpose";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { handleCorsPreflightRequest, addCorsHeaders } from "@/app/api/cors";
import { parseInArabic, getJinsNameDisplayAr, getNoteNameDisplayAr, getTuningSystemDisplayNameAr } from "@/app/api/arabic-helpers";
import {
  buildEntityNamespace,
  buildIdentifierNamespace,
  buildLinksNamespace,
  buildStringArrayNamespace,
  getCanonicalApiUrl
} from "@/app/api/response-shapes";
import { parseSortBy, compareByDisplayName, compareByTonicThenName, buildInvalidSortByResponseBody, InvalidSortByError } from "@/app/api/sort-helpers";

export const OPTIONS = handleCorsPreflightRequest;

/**
 * Lists every jins that can be realised in a given tuning system on a given
 * starting note. The ajnās counterpart of
 * /tuning-systems/{id}/{startingNote}/maqamat, and shaped the same way.
 *
 * A jins is a single ascending set of note names, so unlike a maqām it has no
 * descending counterpart, no sayr and no family classification — `jinsDegrees`
 * is therefore one array rather than an ascending/descending pair.
 */
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
    const includeTranspositions = searchParams.get("includeTranspositions") === "true";
    const includeJinsDegrees = searchParams.get("includeJinsDegrees") === "true";
    const includeDegreeDetails = searchParams.get("includeDegreeDetails") === "true";
    const shouldIncludeDegreeDetails = includeJinsDegrees && includeDegreeDetails;

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
          hint: "Provide a valid tuning system ID in the URL path, e.g., /api/tuning-systems/ibnsina_1037/yegah/ajnas"
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
          hint: "Provide a valid starting note in the URL path, e.g., /api/tuning-systems/ibnsina_1037/yegah/ajnas"
        },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // Get data
    const tuningSystems = getTuningSystems();
    const ajnasData = getAjnas();

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

    // Get all note name sets with adjacent octaves for proper jins checking
    const shiftedSets = tuningSystem.getNoteNameSetsWithAdjacentOctaves();

    // The starting note requested in the path, in its display form (with
    // diacritics) — getTuningSystemPitchClasses matches note-name sets on the
    // exact string. A jins tonic must never be passed here: the starting note
    // selects which note-name set the tuning system uses, so it is a property
    // of the tuning system, not of the individual jins.
    const requestedStartingNoteDisplay = tuningSystem.getNoteNameSets()
      .find((set: string[]) => standardizeText(set[0]) === normalizedParam)![0];

    // Pitch classes depend only on (tuningSystem, startingNote), so compute them
    // once for the whole request rather than per jins.
    const pitchClasses = getTuningSystemPitchClasses(tuningSystem, requestedStartingNoteDisplay);

    // Sequential spelling logic for degree detail objects (englishName + solfege).
    // We import lazily to keep the default list endpoint fast.
    const degreeSpellingsModule = shouldIncludeDegreeDetails
      ? await import("@/functions/renderPitchClassIpnSpellings")
      : null;
    const renderPitchClassSpellings = degreeSpellingsModule?.renderPitchClassSpellings;

    // Find all ajnas that are possible in this tuning system
    const availableAjnas: any[] = [];

    for (const jins of ajnasData) {
      // Check which tuning system starting notes this jins is possible under
      const availableStartingNotes: string[] = [];

      for (const noteNameSet of shiftedSets) {
        if (jins.isJinsPossible(noteNameSet)) {
          // Get the tuning system starting note (first note of middle octave)
          const tuningSystemStartingNote = noteNameSet[noteNameSet.length / 3];
          const standardizedNote = standardizeText(tuningSystemStartingNote);
          if (!availableStartingNotes.includes(standardizedNote)) {
            availableStartingNotes.push(standardizedNote);
          }
        }
      }

      // Filter by the required startingNote parameter (from URL path)
      if (!availableStartingNotes.includes(normalizedParam)) continue;

      // Calculate transpositions and get tahlil
      const transpositions = calculateJinsTranspositions(
        pitchClasses,
        jins,
        true,
        centsTolerance
      );
      const tahlil = transpositions.find((t: any) => !t.transposition);

      // Skip if no tahlil found (shouldn't happen but TypeScript safety)
      if (!tahlil) {
        continue;
      }

      // A jins names its own tonic: the first note of its ascending set
      const jinsTonic = jins.getNoteNames()[0];

      const jinsNamespace = buildEntityNamespace(
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

      const tonicNamespace = buildIdentifierNamespace(
        {
          idName: standardizeText(jinsTonic),
          displayName: jinsTonic,
        },
        {
          inArabic,
          displayAr: inArabic ? getNoteNameDisplayAr(jinsTonic) : undefined,
        }
      );

      const item: Record<string, unknown> = {
        jins: jinsNamespace,
        tonic: tonicNamespace,
        stats: {
          numberOfPitchClasses: jins.getNoteNames().length,
        },
        links: buildLinksNamespace({
          detail: `/api/ajnas/${jins.getIdName()}`,
        }),
      };

      if (includeJinsDegrees) {
        if (shouldIncludeDegreeDetails && renderPitchClassSpellings) {
          // A jins is a single ascending run, so there is no descending
          // counterpart to cross-check for diatonic-slot collisions.
          const rendered = renderPitchClassSpellings(tahlil.jinsPitchClasses, true);
          item.jinsDegrees = rendered.map((pc: any) => ({
            noteName: standardizeText(pc.noteName),
            englishName: pc.englishName,
            solfege: pc.solfege!,
          }));
        } else {
          item.jinsDegrees = jins.getNoteNames().map((n: string) => standardizeText(n));
        }
      }

      if (includeTranspositions) {
        const otherTranspositions = transpositions.filter((t: { transposition: boolean }) => t.transposition);
        item.transpositions = otherTranspositions.map((t: any) => {
          const tonicNoteName = t.jinsPitchClasses[0].noteName;

          const entry: Record<string, unknown> = {
            tonic: buildIdentifierNamespace(
              {
                idName: standardizeText(tonicNoteName),
                displayName: tonicNoteName,
              },
              {
                inArabic,
                displayAr: inArabic ? getNoteNameDisplayAr(tonicNoteName) : undefined,
              }
            ),
          };

          if (shouldIncludeDegreeDetails && renderPitchClassSpellings) {
            const rendered = renderPitchClassSpellings(t.jinsPitchClasses, true);
            entry.jinsDegrees = rendered.map((pc: any) => ({
              noteName: standardizeText(pc.noteName),
              englishName: pc.englishName,
              solfege: pc.solfege!,
            }));
          } else {
            entry.jinsDegrees = t.jinsPitchClasses.map((pc: any) => standardizeText(pc.noteName));
          }

          return entry;
        });
      }

      availableAjnas.push(item);
    }

    if (sortBy === "tonic") {
      availableAjnas.sort((a: any, b: any) =>
        compareByTonicThenName(a.tonic.idName, a.jins.displayName, b.tonic.idName, b.jins.displayName)
      );
    } else {
      availableAjnas.sort((a: any, b: any) => compareByDisplayName(a.jins.displayName, b.jins.displayName));
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
    const referenceFrequency = tuningSystem.getReferenceFrequencies()[requestedStartingNoteDisplay] ?? tuningSystem.getDefaultReferenceFrequency();

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
        displayName: requestedStartingNoteDisplay,
      },
      {
        inArabic,
        displayAr: inArabic ? getNoteNameDisplayAr(requestedStartingNoteDisplay) : undefined,
      }
    );

    const stats = {
      totalAjnasForStartingNote: availableAjnas.length,
      totalAjnasInLibrary: ajnasData.length,
      uniqueTonicCount: new Set(availableAjnas.map((j: any) => j.tonic.idName)).size,
      referenceFrequency,
    };

    const response = NextResponse.json({
      tuningSystem: tuningSystemNamespace,
      startingNotes: startingNotesNamespace,
      selectedStartingNote: selectedStartingNoteNamespace,
      stats,
      data: availableAjnas,
      links: buildLinksNamespace({
        self: getCanonicalApiUrl(`/api/tuning-systems/${tuningSystemId}/${startingNoteParam}/ajnas`),
        tuningSystem: `/api/tuning-systems/${tuningSystemId}`,
        collection: `/api/ajnas`,
      }),
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error in tuning systems ajnas endpoint:", error);
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
