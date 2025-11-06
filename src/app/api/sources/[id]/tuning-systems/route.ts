import { NextResponse } from "next/server";
import { getTuningSystems, getSources } from "@/functions/import";
import { standardizeText } from "@/functions/export";
import { addCorsHeaders, handleCorsPreflightRequest } from "@/app/api/cors";
import { parseInArabic, getTuningSystemDisplayNameAr } from "@/app/api/arabic-helpers";
import {
  buildEntityNamespace,
  buildLinksNamespace,
  buildListResponse
} from "@/app/api/response-shapes";

export const OPTIONS = handleCorsPreflightRequest;

/**
 * GET /api/sources/[id]/tuning-systems
 * 
 * Returns all tuning systems that reference the specified source.
 * 
 * A tuning system is included if any of its sourcePageReferences match the source ID.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
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

    const sources = getSources();
    const source = sources.find(s => s.getId() === id);

    if (!source) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: `Source '${id}' not found`,
            hint: "Use /api/sources to see all available sources"
          },
          { status: 404 }
        )
      );
    }

    const tuningSystems = getTuningSystems();
    
    // Filter tuning systems that reference this source
    const matchingTuningSystems = tuningSystems.filter(ts => {
      const sourcePageReferences = ts.getSourcePageReferences();
      return sourcePageReferences.some(ref => ref.sourceId === id);
    });

    // Build response data
    const tuningSystemsData = matchingTuningSystems.map(ts => {
      const sourcePageReferences = ts.getSourcePageReferences();
      const relevantRefs = sourcePageReferences.filter(ref => ref.sourceId === id);

      const noteNameSets = ts.getNoteNameSets();
      const startingNoteDisplayNames = noteNameSets.map((set) => set[0]).filter((name): name is string => Boolean(name));
      const startingNoteIdNames = startingNoteDisplayNames.map((name) => standardizeText(name));

      return {
        tuningSystem: buildEntityNamespace(
          {
            id: ts.getId(),
            idName: standardizeText(ts.getId()),
            displayName: ts.stringify(),
          },
          {
            version: ts.getVersion(),
            extras: {
              year: ts.getYear(),
            },
            inArabic,
            displayNameAr: inArabic
              ? getTuningSystemDisplayNameAr(
                  ts.getCreatorArabic() || "",
                  ts.getCreatorEnglish() || "",
                  ts.getYear(),
                  ts.getTitleArabic() || "",
                  ts.getTitleEnglish() || ""
                )
              : undefined,
          }
        ),
        sourceReferences: relevantRefs.map(ref => ({
          page: ref.page
        })),
        startingNotes: startingNoteIdNames,
        links: buildLinksNamespace({
          detail: `/api/tuning-systems/${standardizeText(ts.getId())}`,
          source: `/api/sources/${id}`
        })
      };
    });

    // Build source reference for context
    const sourceNamespace = buildEntityNamespace(
      {
        id: source.getId(),
        idName: standardizeText(source.getId()),
        displayName: source.getTitleEnglish(),
      },
      {
        inArabic,
        displayNameAr: inArabic ? source.getTitleArabic() : undefined,
      }
    );

    const response = NextResponse.json({
      context: {
        source: sourceNamespace
      },
      ...buildListResponse(tuningSystemsData)
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error fetching tuning systems by source:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to fetch tuning systems" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

