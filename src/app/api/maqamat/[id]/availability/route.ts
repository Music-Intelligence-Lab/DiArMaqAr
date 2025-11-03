import { NextResponse } from "next/server";
import { getMaqamat, getTuningSystems } from "@/functions/import";
import { standardizeText } from "@/functions/export";
import { handleCorsPreflightRequest, addCorsHeaders } from "@/app/api/cors";

export const OPTIONS = handleCorsPreflightRequest;

/**
 * GET /api/maqamat/[id]/availability
 * 
 * Check Maqam Availability in Tuning Systems
 * 
 * Returns which tuning systems support a specific maqām in its canonical position (tahlil).
 * This is the first level of progressive disclosure - fast and essential information only.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const maqamatData = getMaqamat();
    const tuningSystems = getTuningSystems();

    // Await params in Next.js 15
    const { id: maqamId } = await Promise.resolve(params);
    
    // Find the maqām by ID or name
    const maqam = maqamatData.find(
      (m) => m.getId() === maqamId || standardizeText(m.getName()) === standardizeText(maqamId)
    );

    if (!maqam) {
      return addCorsHeaders(
        NextResponse.json(
          { 
            error: `Maqām '${maqamId}' not found`,
            hint: "Use /api/maqamat to see all available maqāmāt"
          },
          { status: 404 }
        )
      );
    }

    // Calculate availability - which tuning systems support this maqām
    // A tuning system is available if ANY of its note name sets can realize the maqām
    // Use shifted note name sets (3 octaves) to handle non-octave-repeating maqāmāt
    interface TuningSystemAvailability {
      tuningSystemId: string;
      tuningSystemStartingNoteNames: string[];
    }
    
    const availableTuningSystems: TuningSystemAvailability[] = [];
    
    for (const tuningSystem of tuningSystems) {
      // Get both the original note name sets and their 3-octave expansions
      const noteNameSets = tuningSystem.getNoteNameSets();
      const shiftedNoteNameSets = tuningSystem.getNoteNameSetsWithAdjacentOctaves();
      
      // Track which tuning system starting note names work for this maqām
      const validTuningSystemStartingNoteNames: string[] = [];
      
      for (let i = 0; i < shiftedNoteNameSets.length; i++) {
        if (maqam.isMaqamPossible(shiftedNoteNameSets[i])) {
          // The first note in the original (non-shifted) set is the tuning system starting note name
          const tuningSystemStartingNoteName = noteNameSets[i]?.[0];
          if (tuningSystemStartingNoteName) {
            validTuningSystemStartingNoteNames.push(tuningSystemStartingNoteName);
          }
        }
      }
      
      if (validTuningSystemStartingNoteNames.length > 0) {
        availableTuningSystems.push({
          tuningSystemId: tuningSystem.getId(),
          tuningSystemStartingNoteNames: validTuningSystemStartingNoteNames
        });
      }
    }

    const response = NextResponse.json({
      maqam: {
        id: maqam.getId(),
        idName: maqam.getIdName(),
        name: maqam.getName(),
        version: maqam.getVersion()
      },
      availability: {
        count: availableTuningSystems.length,
        tuningSystems: availableTuningSystems
      }
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error in GET /api/maqamat/[id]/availability:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to retrieve availability" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}
