import { NextRequest, NextResponse } from "next/server";
import { getTuningSystems, getMaqamat, getAjnas } from "@/functions/import";
import { standardizeText } from "@/functions/export";
import { calculateMaqamTranspositions } from "@/functions/transpose";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { classifyMaqamFamily } from "@/functions/classifyMaqamFamily";
import { handleCorsPreflightRequest, addCorsHeaders } from "@/app/api/cors";
import { parseInArabic, getMaqamNameDisplayAr, getNoteNameDisplayAr, getTuningSystemDisplayNameAr } from "@/app/api/arabic-helpers";
import {
  buildEntityNamespace,
  buildIdentifierNamespace,
  buildLinksNamespace,
  buildStringArrayNamespace
} from "@/app/api/response-shapes";

export const OPTIONS = handleCorsPreflightRequest;

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
          hint: "Provide a valid tuning system ID in the URL path, e.g., /api/tuning-systems/IbnSina-(1037)/yegah/maqamat"
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
          hint: "Provide a valid starting note in the URL path, e.g., /api/tuning-systems/IbnSina-(1037)/yegah/maqamat"
        },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // Get data
    const tuningSystems = getTuningSystems();
    const maqamatData = getMaqamat();
    const ajnas = getAjnas();

    // Find the tuning system
    const tuningSystem = tuningSystems.find(
      (ts: any) => ts.getId() === tuningSystemId
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

    // Get all note name sets with adjacent octaves for proper maqam checking
    const shiftedSets = tuningSystem.getNoteNameSetsWithAdjacentOctaves();

    // Find all maqamat that are possible in this tuning system
    const availableMaqamat: any[] = [];

    for (const maqam of maqamatData) {
      // Check if maqam is possible in any of the starting notes
      let isPossible = false;
      const availableStartingNotes: string[] = [];

      for (const noteNameSet of shiftedSets) {
        if (maqam.isMaqamPossible(noteNameSet)) {
          isPossible = true;
          // Get the tuning system starting note (first note of middle octave)
          const tuningSystemStartingNote = noteNameSet[noteNameSet.length / 3];
          const standardizedNote = standardizeText(tuningSystemStartingNote);
          if (!availableStartingNotes.includes(standardizedNote)) {
            availableStartingNotes.push(standardizedNote);
          }
        }
      }

      // Filter by the required startingNote parameter (from URL path)
      isPossible = availableStartingNotes.includes(normalizedParam);

      if (isPossible) {
        // Get canonical starting note for classification
        const canonicalStartingNote = maqam.getAscendingNoteNames()[0];
        
        // Get pitch classes for this maqam in this tuning system
        const pitchClasses = getTuningSystemPitchClasses(
          tuningSystem,
          canonicalStartingNote
        );

        // Calculate transpositions and get tahlil
        const transpositions = calculateMaqamTranspositions(
          pitchClasses,
          ajnas,
          maqam,
          true,
          5
        );
        const tahlil = transpositions.find((t: any) => !t.transposition);

        // Skip if no tahlil found (shouldn't happen but TypeScript safety)
        if (!tahlil) {
          continue;
        }

        // Get classification
        const classification = classifyMaqamFamily(tahlil);

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

        availableMaqamat.push({
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
        });
      }
    }

    // Sort by tonic (NoteName.ts order) then alphabetically
    availableMaqamat.sort((a: any, b: any) => {
      // First sort by tonic
      const noteOrder = ["yegah", "asiran", "iraq", "rast", "dugah", "sikah", "jaharkah"];
      const aIndex = noteOrder.indexOf(a.tonic.idName);
      const bIndex = noteOrder.indexOf(b.tonic.idName);
      
      if (aIndex !== -1 && bIndex !== -1 && aIndex !== bIndex) {
        return aIndex - bIndex;
      }
      
      // Then sort alphabetically by display name
      return a.maqam.displayName.localeCompare(b.maqam.displayName, "ar");
    });

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
        self: `/api/tuning-systems/${tuningSystemId}/${startingNoteParam}/maqamat`,
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
