import { NextResponse } from "next/server";
import { getPatterns } from "@/functions/import";
import { standardizeText } from "@/functions/export";
import { addCorsHeaders, handleCorsPreflightRequest } from "@/app/api/cors";
import { safeWriteFile } from "@/app/api/backup-utils";
import path from "path";
import { buildEntityNamespace, buildListResponse } from "@/app/api/response-shapes";

export const OPTIONS = handleCorsPreflightRequest;

/**
 * GET /api/patterns
 * 
 * Returns all patterns.
 */
export async function GET() {
  try {
    const patterns = getPatterns();
    
    const patternItems = patterns.map((pattern) => ({
      pattern: buildEntityNamespace(
        {
          id: pattern.getId(),
          idName: standardizeText(pattern.getName()).toLowerCase(),
          displayName: pattern.getName(),
        },
        {
          version: pattern.getVersion(),
        }
      ),
    }));

    const response = NextResponse.json(
      buildListResponse(patternItems)
    );

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error fetching patterns:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to fetch patterns" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

/**
 * PUT /api/patterns
 * 
 * Updates the patterns database.
 * Accepts an array of pattern objects and writes them to data/patterns.json.
 * 
 * Request Body: Array of pattern objects
 */
export async function PUT(request: Request) {
  try {
    const patterns = await request.json();
    
    if (!Array.isArray(patterns)) {
      const errorResponse = NextResponse.json(
        { error: "Invalid request: body must be an array of patterns" },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse);
    }

    // CRITICAL: Prevent data loss - reject empty arrays
    if (patterns.length === 0) {
      const errorResponse = NextResponse.json(
        { 
          error: "Cannot save empty array",
          message: "Refusing to save empty array to prevent data loss. If you want to clear all data, use a delete endpoint or explicitly confirm.",
          hint: "This endpoint requires at least one pattern object"
        },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse);
    }

    // Get the path to data/patterns.json
    const dataPath = path.join(process.cwd(), "data", "patterns.json");

    // Write with backup
    const writeResult = safeWriteFile(dataPath, patterns, true);

    if (!writeResult.success) {
      throw new Error(writeResult.error || "Failed to write file");
    }

    const response = NextResponse.json({
      message: "Patterns updated successfully",
      count: patterns.length,
      backupCreated: writeResult.backupPath !== null,
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error updating patterns:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to update patterns" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

