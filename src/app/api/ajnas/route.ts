import { NextResponse } from "next/server";
import { getAjnas } from "@/functions/import";
import { addCorsHeaders, handleCorsPreflightRequest } from "@/app/api/cors";
import { safeWriteFile } from "@/app/api/backup-utils";
import path from "path";

export const OPTIONS = handleCorsPreflightRequest;

/**
 * GET /api/ajnas
 * 
 * Returns all ajnas (jins data).
 */
export async function GET() {
  try {
    const ajnas = getAjnas();
    
    const ajnasData = ajnas.map((jins) => {
      return {
        id: jins.getId(),
        idName: jins.getIdName(),
        displayName: jins.getName(),
        noteNames: jins.getNoteNames(),
        version: jins.getVersion(),
      };
    });

    const response = NextResponse.json({
      ajnas: ajnasData,
      meta: {
        total: ajnasData.length,
      },
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error fetching ajnas:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to fetch ajnas" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

/**
 * PUT /api/ajnas
 * 
 * Updates the ajnas database.
 * Accepts an array of ajnas objects and writes them to data/ajnas.json.
 * 
 * Request Body: Array of ajnas objects
 */
export async function PUT(request: Request) {
  try {
    const ajnas = await request.json();
    
    if (!Array.isArray(ajnas)) {
      const errorResponse = NextResponse.json(
        { error: "Invalid request: body must be an array of ajnas" },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse);
    }

    // CRITICAL: Prevent data loss - reject empty arrays
    if (ajnas.length === 0) {
      const errorResponse = NextResponse.json(
        { 
          error: "Cannot save empty array",
          message: "Refusing to save empty array to prevent data loss. If you want to clear all data, use a delete endpoint or explicitly confirm.",
          hint: "This endpoint requires at least one ajnas object"
        },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse);
    }

    // Get the path to data/ajnas.json
    const dataPath = path.join(process.cwd(), "data", "ajnas.json");

    // Write with backup
    const writeResult = safeWriteFile(dataPath, ajnas, true);

    if (!writeResult.success) {
      throw new Error(writeResult.error || "Failed to write file");
    }

    const response = NextResponse.json({
      message: "Ajnas updated successfully",
      count: ajnas.length,
      backupCreated: writeResult.backupPath !== null,
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error updating ajnas:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to update ajnas" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

