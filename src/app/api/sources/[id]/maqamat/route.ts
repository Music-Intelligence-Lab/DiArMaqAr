import { NextResponse } from "next/server";
import { getMaqamat, getSources } from "@/functions/import";
import { standardizeText } from "@/functions/export";
import { addCorsHeaders, handleCorsPreflightRequest } from "@/app/api/cors";
import { parseInArabic, getMaqamNameDisplayAr } from "@/app/api/arabic-helpers";
import {
  buildEntityNamespace,
  buildIdentifierNamespace,
  buildLinksNamespace,
  buildListResponse
} from "@/app/api/response-shapes";

export const OPTIONS = handleCorsPreflightRequest;

/**
 * GET /api/sources/[id]/maqamat
 * 
 * Returns all maqamat that reference the specified source.
 * 
 * A maqam is included if any of its sourcePageReferences match the source ID.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    
    // Parse inArabic parameter
    let inArabic = false;
    try {
      inArabic = parseInArabic(searchParams);
    } catch (error) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: error instanceof Error ? error.message : "Invalid inArabic parameter",
            hint: "Use ?inArabic=true or ?inArabic=false"
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

    const maqamat = getMaqamat();
    
    // Filter maqamat that reference this source
    const matchingMaqamat = maqamat.filter(maqam => {
      const sourcePageReferences = maqam.getSourcePageReferences();
      return sourcePageReferences.some(ref => ref.sourceId === id);
    });

    // Build response data
    const maqamatData = matchingMaqamat.map(maqam => {
      const sourcePageReferences = maqam.getSourcePageReferences();
      const relevantRefs = sourcePageReferences.filter(ref => ref.sourceId === id);

      return {
        maqam: buildEntityNamespace(
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
        ),
        sourceReferences: relevantRefs.map(ref => ({
          page: ref.page
        })),
        links: buildLinksNamespace({
          detail: `/api/maqamat/${maqam.getIdName()}`,
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
      ...buildListResponse(maqamatData)
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error fetching maqamat by source:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to fetch maqamat" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

