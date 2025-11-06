import { NextResponse } from "next/server";
import { getTuningSystems } from "@/functions/import";
import { standardizeText } from "@/functions/export";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { handleCorsPreflightRequest, addCorsHeaders } from "@/app/api/cors";
import { parseInArabic, getNoteNameDisplayAr } from "@/app/api/arabic-helpers";
import {
  octaveZeroNoteNames,
  octaveOneNoteNames,
  octaveTwoNoteNames,
  octaveThreeNoteNames,
  octaveFourNoteNames
} from "@/models/NoteName";
import {
  buildEntityNamespace,
  buildIdentifierNamespace,
  buildLinksNamespace,
  buildListResponse
} from "@/app/api/response-shapes";
import { getTuningSystemDisplayNameAr } from "@/app/api/arabic-helpers";

export const OPTIONS = handleCorsPreflightRequest;

/**
 * GET /api/pitch-classes/note-names/[noteName]/availability
 * 
 * Check which tuning systems support a specific note name and what pitch class index it has in each tuning system.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ noteName: string }> }
) {
  try {
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
            hint: "Use ?includeArabic=true or ?includeArabic=false"
          },
          { status: 400 }
        )
      );
    }

    const tuningSystems = getTuningSystems();

    // Await params in Next.js 15
    const { noteName: noteNameParam } = await Promise.resolve(context.params);
    
    // Decode URL-encoded note name
    const decodedNoteName = decodeURIComponent(noteNameParam);

    // Validate note name exists in any octave array
    const allNoteNames = [
      ...octaveZeroNoteNames,
      ...octaveOneNoteNames,
      ...octaveTwoNoteNames,
      ...octaveThreeNoteNames,
      ...octaveFourNoteNames
    ];

    // Find matching note name (case and diacritics insensitive)
    const matchingNoteName = allNoteNames.find(
      name => standardizeText(name) === standardizeText(decodedNoteName)
    );

    if (!matchingNoteName) {
      // Provide helpful error with valid options
      const validNoteNames = Array.from(new Set(allNoteNames))
        .map(name => standardizeText(name))
        .slice(0, 20); // Limit to first 20 for error message

      return addCorsHeaders(
        NextResponse.json(
          {
            error: `Note name '${decodedNoteName}' not found`,
            message: "The note name must exist in one of the octave arrays in NoteName.ts",
            hint: `Valid note names include: ${validNoteNames.join(", ")}... (use /api/pitch-classes/note-names to see all)`
          },
          { status: 404 }
        )
      );
    }

    // Calculate availability - which tuning systems support this note name
    const availableTuningSystems: any[] = [];
    
    for (const tuningSystem of tuningSystems) {
      const noteNameSets = tuningSystem.getNoteNameSets();
      
      // Track which starting notes work for this note name in this tuning system
      const startingNoteEntries: any[] = [];
      
      for (const noteNameSet of noteNameSets) {
        const startingNote = noteNameSet[0];
        if (!startingNote) continue;

        // Get pitch classes for this tuning system and starting note
        const pitchClasses = getTuningSystemPitchClasses(tuningSystem, startingNote as any);
        
        // Find pitch class with matching note name
        const matchingPitchClass = pitchClasses.find(
          pc => standardizeText(pc.noteName) === standardizeText(matchingNoteName)
        );
        
        if (matchingPitchClass) {
          startingNoteEntries.push({
            startingNote: buildIdentifierNamespace(
              {
                idName: standardizeText(startingNote),
                displayName: startingNote
              },
              {
                inArabic,
                displayAr: inArabic ? getNoteNameDisplayAr(startingNote) : undefined
              }
            ),
            pitchClassIndex: matchingPitchClass.pitchClassIndex,
            octave: matchingPitchClass.octave
          });
        }
      }
      
      if (startingNoteEntries.length > 0) {
        const tuningSystemNamespace = buildEntityNamespace(
          {
            id: tuningSystem.getId(),
            idName: standardizeText(tuningSystem.getId()),
            displayName: tuningSystem.stringify(),
          },
          {
            version: tuningSystem.getVersion(),
            inArabic,
            displayNameAr: inArabic
              ? getTuningSystemDisplayNameAr(
                  tuningSystem.getCreatorArabic() || "",
                  tuningSystem.getCreatorEnglish() || "",
                  tuningSystem.getYear(),
                  tuningSystem.getTitleArabic() || "",
                  tuningSystem.getTitleEnglish() || ""
                )
              : undefined,
          }
        );

        availableTuningSystems.push({
          tuningSystem: tuningSystemNamespace,
          startingNotes: startingNoteEntries
        });
      }
    }

    const response = NextResponse.json({
      noteName: buildIdentifierNamespace(
        {
          idName: standardizeText(matchingNoteName),
          displayName: matchingNoteName
        },
        {
          inArabic,
          displayAr: inArabic ? getNoteNameDisplayAr(matchingNoteName) : undefined
        }
      ),
      availability: buildListResponse(availableTuningSystems),
      links: buildLinksNamespace({
        self: request.url,
        detail: `/api/pitch-classes/note-names/${standardizeText(matchingNoteName)}`,
        compare: `/api/pitch-classes/note-names/${standardizeText(matchingNoteName)}/compare`,
      }),
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error in GET /api/pitch-classes/note-names/[noteName]/availability:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to retrieve availability" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

