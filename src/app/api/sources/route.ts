import { NextResponse } from "next/server";
import { getSources } from "@/functions/import";
import { addCorsHeaders, handleCorsPreflightRequest } from "@/app/api/cors";
import { safeWriteFile } from "@/app/api/backup-utils";
import path from "path";

export const OPTIONS = handleCorsPreflightRequest;

/**
 * GET /api/sources
 * 
 * Returns all bibliographic sources (books, articles, theses).
 * 
 * Response includes all source metadata with bilingual support (English/Arabic).
 */
export async function GET() {
  try {
    const sources = getSources();
    
    const sourcesData = sources.map((source) => {
      return {
        id: source.getId(),
        displayName: source.stringify(),
        sourceType: source.getSourceType(),
        titleEnglish: source.getTitleEnglish(),
        titleArabic: source.getTitleArabic(),
        contributors: source.getContributors(),
        version: source.getVersion(),
      };
    });

    const response = NextResponse.json({
      sources: sourcesData,
      meta: {
        total: sourcesData.length,
      },
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error fetching sources:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to fetch sources" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

/**
 * PUT /api/sources
 * 
 * Updates the bibliographic sources database.
 * Accepts an array of source objects and writes them to data/sources.json.
 * 
 * Request Body: Array of source objects (from convertToJSON())
 */
export async function PUT(request: Request) {
  try {
    const sources = await request.json();
    
    if (!Array.isArray(sources)) {
      const errorResponse = NextResponse.json(
        { error: "Invalid request: body must be an array of sources" },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse);
    }

    // CRITICAL: Prevent data loss - reject empty arrays
    if (sources.length === 0) {
      const errorResponse = NextResponse.json(
        { 
          error: "Cannot save empty array",
          message: "Refusing to save empty array to prevent data loss. If you want to clear all data, use a delete endpoint or explicitly confirm.",
          hint: "This endpoint requires at least one source object"
        },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse);
    }

    // Get the path to data/sources.json
    const dataPath = path.join(process.cwd(), "data", "sources.json");

    // Write with backup
    const writeResult = safeWriteFile(dataPath, sources, true);

    if (!writeResult.success) {
      throw new Error(writeResult.error || "Failed to write file");
    }

    const response = NextResponse.json({
      message: "Sources updated successfully",
      count: sources.length,
      backupCreated: writeResult.backupPath !== null,
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error updating sources:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to update sources" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

