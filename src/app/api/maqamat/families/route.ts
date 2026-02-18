import { NextResponse } from "next/server";
import { getMaqamat, getTuningSystems, getAjnas } from "@/functions/import";
import { standardizeText } from "@/functions/export";
import { addCorsHeaders, handleCorsPreflightRequest } from "@/app/api/cors";
import { calculateMaqamTranspositions } from "@/functions/transpose";
import { classifyMaqamFamily } from "@/functions/classifyMaqamFamily";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { parseInArabic, getMaqamNameDisplayAr } from "@/app/api/arabic-helpers";
import {
  buildIdentifierNamespace,
  buildLinksNamespace,
  buildListResponse,
} from "@/app/api/response-shapes";

export const OPTIONS = handleCorsPreflightRequest;

export const dynamic = "force-dynamic";

/**
 * GET /api/maqamat/families
 *
 * Returns maqām families for maqāmāt available in the specified tuning system.
 * Families are classified by the first jins at scale degree 1. Use filterByFamily
 * on GET /api/maqamat to filter maqāmāt by family.
 *
 * Query Parameters:
 * - tuningSystem (required): Tuning system ID (e.g., ibnsina_1037, alsabbagh_1954)
 * - startingNote (required): Starting note (e.g., yegah, rast, ushayran)
 * - includeArabic: Include Arabic display names (default: "false")
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const tuningSystemParam = searchParams.get("tuningSystem");
    const startingNoteParam = searchParams.get("startingNote");

    if (!tuningSystemParam || tuningSystemParam.trim() === "") {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "Missing required parameter: tuningSystem",
            message: "The tuningSystem parameter is required.",
            hint: "Use ?tuningSystem=ibnsina_1037&startingNote=yegah",
          },
          { status: 400 }
        )
      );
    }

    if (!startingNoteParam || startingNoteParam.trim() === "") {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "Missing required parameter: startingNote",
            message: "The startingNote parameter is required.",
            hint: "Use ?tuningSystem=ibnsina_1037&startingNote=yegah",
          },
          { status: 400 }
        )
      );
    }

    let inArabic = false;
    try {
      inArabic = parseInArabic(searchParams);
    } catch (error) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: error instanceof Error ? error.message : "Invalid includeArabic parameter",
            hint: "Use ?includeArabic=true or ?includeArabic=false",
          },
          { status: 400 }
        )
      );
    }

    const maqamat = getMaqamat();
    const tuningSystems = getTuningSystems();
    const ajnas = getAjnas();

    const tuningSystem = tuningSystems.find(
      (ts) => standardizeText(ts.getId()) === standardizeText(tuningSystemParam)
    );

    if (!tuningSystem) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: `Tuning system '${tuningSystemParam}' not found`,
            message: "Use GET /api/tuning-systems for valid tuning system IDs.",
          },
          { status: 404 }
        )
      );
    }

    const noteNameSets = tuningSystem.getNoteNameSets();
    const shiftedNoteNameSets = tuningSystem.getNoteNameSetsWithAdjacentOctaves();

    const startingNoteIndex = noteNameSets.findIndex(
      (set) => set[0] && standardizeText(set[0]) === standardizeText(startingNoteParam)
    );

    if (startingNoteIndex === -1) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: `Starting note '${startingNoteParam}' not found in tuning system`,
            message: "Use GET /api/tuning-systems/{id}/{startingNote}/pitch-classes to discover valid starting notes.",
          },
          { status: 404 }
        )
      );
    }

    const startingNote = noteNameSets[startingNoteIndex]?.[0];
    if (!startingNote) {
      return addCorsHeaders(
        NextResponse.json(
          { error: "Could not resolve starting note" },
          { status: 500 }
        )
      );
    }

    const pitchClasses = getTuningSystemPitchClasses(
      tuningSystem,
      startingNote as any
    );

    const availableMaqamat = maqamat.filter((maqam) =>
      shiftedNoteNameSets.some((noteNameSet) => maqam.isMaqamPossible(noteNameSet))
    );

    const familyMap = new Map<
      string,
      { idName: string; displayName: string }
    >();

    for (const maqam of availableMaqamat) {
      try {
        const transpositions = calculateMaqamTranspositions(
          pitchClasses,
          ajnas,
          maqam,
          true,
          5
        );
        const tahlil = transpositions.find((t) => !t.transposition);
        if (!tahlil) continue;

        const classification = classifyMaqamFamily(tahlil);
        const idName = standardizeText(classification.familyName);
        if (!familyMap.has(idName)) {
          familyMap.set(idName, {
            idName,
            displayName: classification.familyName,
          });
        }
      } catch {
        // Skip maqamat that fail classification
      }
    }

    const families = Array.from(familyMap.values()).sort((a, b) =>
      a.displayName.localeCompare(b.displayName)
    );

    const data = families.map(({ idName, displayName }) => {
      const familyNamespace = buildIdentifierNamespace(
        { idName, displayName },
        {
          inArabic:
            inArabic && displayName !== "unknown" && displayName !== "no jins",
          displayAr:
            inArabic && displayName !== "unknown" && displayName !== "no jins"
              ? getMaqamNameDisplayAr(displayName)
              : undefined,
        }
      );
      return {
        family: familyNamespace,
        links: buildLinksNamespace({
          maqamat: `/api/maqamat?filterByFamily=${encodeURIComponent(idName)}`,
        }),
      };
    });

    const response = NextResponse.json(buildListResponse(data));
    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error in GET /api/maqamat/families:", error);
    return addCorsHeaders(
      NextResponse.json(
        { error: "Failed to retrieve maqām families" },
        { status: 500 }
      )
    );
  }
}
