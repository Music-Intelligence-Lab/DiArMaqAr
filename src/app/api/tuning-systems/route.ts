import { NextResponse } from "next/server";
import { getTuningSystems } from "@/functions/import";
import { addCorsHeaders, handleCorsPreflightRequest } from "@/app/api/cors";
import { safeWriteFile } from "@/app/api/backup-utils";
import path from "path";

export const OPTIONS = handleCorsPreflightRequest;

export const dynamic = "force-static";

/**
 * GET /api/tuning-systems
 * List all available tuning systems
 */
export async function GET() {
  try {
    const tuningSystems = getTuningSystems();
    
    const systems = tuningSystems.map((ts) => {
      // Extract starting note names from each note name set
      const noteNameSets = ts.getNoteNameSets();
      const tuningSystemStartingNoteNames = noteNameSets.map(set => set[0]).filter(Boolean);
      
      return {
        id: ts.getId(),
        displayName: ts.stringify(), // Using stringify() which formats as "Creator (Year) Title"
        version: ts.getVersion(),
        year: ts.getYear(),
        numberOfPitchClassesSingleOctave: ts.getOriginalPitchClassValues().length,
        tuningSystemStartingNoteNames: tuningSystemStartingNoteNames,
        numberOfTuningSystemStartingNoteNames: tuningSystemStartingNoteNames.length
      };
    });

    const response = NextResponse.json({
      tuningSystems: systems,
      meta: {
        total: systems.length,
      },
    });

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
