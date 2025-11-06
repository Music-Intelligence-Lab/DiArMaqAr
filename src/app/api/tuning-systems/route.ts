import { NextResponse } from "next/server";
import { getTuningSystems } from "@/functions/import";
import { addCorsHeaders, handleCorsPreflightRequest } from "@/app/api/cors";
import { safeWriteFile } from "@/app/api/backup-utils";
import { standardizeText } from "@/functions/export";
import path from "path";
import { parseInArabic, getNoteNameDisplayAr, getTuningSystemDisplayNameAr } from "@/app/api/arabic-helpers";
import {
  buildEntityNamespace,
  buildListResponse,
  buildStringArrayNamespace
} from "@/app/api/response-shapes";

export const OPTIONS = handleCorsPreflightRequest;

// Force dynamic rendering to process query parameters at runtime
export const dynamic = "force-dynamic";

/**
 * GET /api/tuning-systems
 * List all available tuning systems
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeSources = searchParams.get("includeSources") !== "false";
    
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
    
    const tuningSystems = getTuningSystems();
    
    const systems = tuningSystems.map((ts) => {
      const noteNameSets = ts.getNoteNameSets();
      const startingNoteDisplayNames = noteNameSets.map((set) => set[0]).filter((name): name is string => Boolean(name));
      const startingNoteIdNames = startingNoteDisplayNames.map((name) => standardizeText(name));
      const startingNoteDisplayNamesAr = inArabic
        ? startingNoteDisplayNames.map((name) => getNoteNameDisplayAr(name))
        : undefined;

      const tuningSystemNamespace = buildEntityNamespace(
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
      );

      const startingNotesNamespace = buildStringArrayNamespace(startingNoteIdNames, {
        inArabic,
        displayNames: startingNoteDisplayNames,
        displayNamesAr: startingNoteDisplayNamesAr,
      });

      const result: any = {
        tuningSystem: tuningSystemNamespace,
        startingNotes: startingNotesNamespace,
        stats: {
          numberOfPitchClassesSingleOctave: ts.getOriginalPitchClassValues().length,
        },
      };

      if (includeSources) {
        const sourcePageReferences = ts.getSourcePageReferences();
        const sourceReferences = sourcePageReferences.map((src) => ({
          sourceId: src.sourceId,
          page: src.page,
        }));
        result.sources = sourceReferences;
      }

      return result;
    });

    const response = NextResponse.json(
      buildListResponse(systems)
    );

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error fetching tuning systems:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to fetch tuning systems" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

/**
 * PUT /api/tuning-systems
 * 
 * Updates the tuning systems database.
 * Accepts an array of tuning system objects and writes them to data/tuningSystems.json.
 * 
 * Request Body: Array of tuning system objects
 */
export async function PUT(request: Request) {
  try {
    const tuningSystems = await request.json();
    
    if (!Array.isArray(tuningSystems)) {
      const errorResponse = NextResponse.json(
        { error: "Invalid request: body must be an array of tuning systems" },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse);
    }

    // CRITICAL: Prevent data loss - reject empty arrays
    if (tuningSystems.length === 0) {
      const errorResponse = NextResponse.json(
        { 
          error: "Cannot save empty array",
          message: "Refusing to save empty array to prevent data loss. If you want to clear all data, use a delete endpoint or explicitly confirm.",
          hint: "This endpoint requires at least one tuning system object"
        },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse);
    }

    // Get the path to data/tuningSystems.json
    const dataPath = path.join(process.cwd(), "data", "tuningSystems.json");

    // Write with backup
    const writeResult = safeWriteFile(dataPath, tuningSystems, true);

    if (!writeResult.success) {
      throw new Error(writeResult.error || "Failed to write file");
    }

    const response = NextResponse.json({
      message: "Tuning systems updated successfully",
      count: tuningSystems.length,
      backupCreated: writeResult.backupPath !== null,
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error updating tuning systems:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to update tuning systems" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}
