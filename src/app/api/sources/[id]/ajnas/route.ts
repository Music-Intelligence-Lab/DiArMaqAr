import { NextResponse } from "next/server";
import { getAjnas, getSources } from "@/functions/import";
import { standardizeText } from "@/functions/export";
import { addCorsHeaders, handleCorsPreflightRequest } from "@/app/api/cors";
import { parseInArabic, getJinsNameDisplayAr } from "@/app/api/arabic-helpers";
import {
  buildEntityNamespace,
  buildLinksNamespace,
  buildListResponse
} from "@/app/api/response-shapes";

export const OPTIONS = handleCorsPreflightRequest;

/**
 * GET /api/sources/[id]/ajnas
 * 
 * Returns all ajnas that reference the specified source.
 * 
 * A jins is included if any of its SourcePageReferences match the source ID.
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
    // Case-insensitive matching
    const source = sources.find(s => standardizeText(s.getId()) === standardizeText(id));

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

    const ajnas = getAjnas();
    
    // Filter ajnas that reference this source
    const matchingAjnas = ajnas.filter(jins => {
      const sourcePageReferences = jins.getSourcePageReferences();
      return sourcePageReferences.some(ref => ref.sourceId === id);
    });

    // Build response data
    const ajnasData = matchingAjnas.map(jins => {
      const sourcePageReferences = jins.getSourcePageReferences();
      const relevantRefs = sourcePageReferences.filter(ref => ref.sourceId === id);

      return {
        jins: buildEntityNamespace(
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
        ),
        sourceReferences: relevantRefs.map(ref => ({
          page: ref.page
        })),
        links: buildLinksNamespace({
          detail: `/api/ajnas/${jins.getIdName()}`,
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
      ...buildListResponse(ajnasData)
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error fetching ajnas by source:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to fetch ajnas" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

