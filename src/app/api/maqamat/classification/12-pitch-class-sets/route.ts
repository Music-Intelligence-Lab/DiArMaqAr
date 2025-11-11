import { NextResponse } from "next/server";
import { getMaqamat, getTuningSystems, getAjnas } from "@/functions/import";
import { addCorsHeaders, handleCorsPreflightRequest } from "@/app/api/cors";
import {
  classifyMaqamat,
  ClassificationResult
} from "@/functions/classifyMaqamat12PitchClassSets";
import { buildEntityNamespace, buildIdentifierNamespace } from "@/app/api/response-shapes";
import { parseInArabic } from "@/app/api/arabic-helpers";
import { standardizeText } from "@/functions/export";

export const OPTIONS = handleCorsPreflightRequest;

// Force dynamic rendering
export const dynamic = "force-dynamic";

/**
 * GET /api/maqamat/classification/12-pitch-class-sets
 * 
 * Classifies maqamat into groups based on 12-pitch-class sets.
 * Each set is created by replacing pitch classes in al-Kindi-(874) on ushayran
 * with pitch classes from maqamat in the specified tuning system,
 * based on matching IPN reference note names.
 * 
 * Query Parameters:
 * - tuningSystem: string (default: "CairoCongressTuningCommittee-(1929)") - tuning system ID for maqamat
 * - startingNote: string (default: "yegah") - starting note for maqamat tuning system
 * - includeIncompatible: boolean (default: true) - include maqamat that can't form sets
 * - includeArabic: boolean (default: false) - include Arabic display names
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeIncompatible = searchParams.get("includeIncompatible") !== "false";
    
    // Get tuning system and starting note parameters
    const tuningSystemId = searchParams.get("tuningSystem") || "CairoCongressTuningCommittee-(1929)";
    const startingNoteParam = searchParams.get("startingNote") || "yegah";
    
    // Get cents tolerance parameter
    let centsTolerance = 5; // Default tolerance
    const centsToleranceParam = searchParams.get("centsTolerance");
    if (centsToleranceParam) {
      const parsed = parseFloat(centsToleranceParam);
      if (isNaN(parsed) || parsed < 0) {
        return addCorsHeaders(
          NextResponse.json(
            {
              error: "Invalid centsTolerance parameter",
              message: "centsTolerance must be a non-negative number",
              hint: "Use ?centsTolerance=<number> (e.g., ?centsTolerance=5)"
            },
            { status: 400 }
          )
        );
      }
      centsTolerance = parsed;
    }
    
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

    // Get data
    const maqamat = getMaqamat();
    const tuningSystems = getTuningSystems();
    const ajnas = getAjnas();

    // Find required tuning systems
    const cairoTuningSystem = tuningSystems.find(
      (ts) => ts.getId() === tuningSystemId
    );

    const alKindiTuningSystem = tuningSystems.find(
      (ts) => ts.getId() === "al-Kindi-(874)"
    );

    if (!cairoTuningSystem) {
      const availableTuningSystems = tuningSystems.map(ts => ({
        id: ts.getId(),
        idName: standardizeText(ts.getId()),
        displayName: ts.stringify()
      }));
      
      return addCorsHeaders(
        NextResponse.json(
          {
            error: `Tuning system '${tuningSystemId}' not found`,
            hint: "Use ?tuningSystem=<tuning-system-id> to specify a valid tuning system",
            availableTuningSystems: availableTuningSystems,
            validOptions: availableTuningSystems.map(ts => ts.id)
          },
          { status: 400 }
        )
      );
    }

    if (!alKindiTuningSystem) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "al-Kindi-(874) tuning system not found"
          },
          { status: 500 }
        )
      );
    }

    // Validate starting note
    const noteNameSets = cairoTuningSystem.getNoteNameSets();
    const validNoteSet = noteNameSets.find(
      (set) => standardizeText(set[0]) === standardizeText(startingNoteParam)
    );
    
    if (!validNoteSet) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: `Starting note '${startingNoteParam}' is not valid for tuning system '${tuningSystemId}'`,
            validOptions: noteNameSets.map((set) => set[0])
          },
          { status: 400 }
        )
      );
    }
    
    // Use the actual note name from the tuning system (with diacritics)
    const cairoStartingNote = validNoteSet[0];
    const alKindiStartingNote = "ʿushayrān";

    // Perform classification
    const result: ClassificationResult = classifyMaqamat(
      maqamat,
      cairoTuningSystem,
      cairoStartingNote,
      alKindiTuningSystem,
      alKindiStartingNote,
      ajnas,
      centsTolerance
    );

    // Create summary section
    const summary = result.sets.map((set) => {
      const compatibleMaqamatNames = set.compatibleMaqamat.map((info) => {
        const transpositionNamespace = buildIdentifierNamespace(
          {
            idName: standardizeText(info.maqam.name),
            displayName: info.maqam.name
          },
          {
            inArabic
          }
        );

        return {
          maqamName: info.maqamData.getName(),
          transposition: transpositionNamespace,
          isTransposed: info.maqam.transposition
        };
      });

      return {
        setName: set.name,
        compatibleMaqamat: compatibleMaqamatNames
      };
    });

    // Create statistics
    const statistics = {
      totalSets: result.sets.length,
      sets: result.sets.map((set) => ({
        setName: set.name,
        compatibleMaqamatCount: set.compatibleMaqamat.length
      })),
      totalCompatibleMaqamat: result.sets.reduce(
        (sum, set) => sum + set.compatibleMaqamat.length,
        0
      ),
      incompatibleMaqamatCount: result.incompatibleMaqamat.length
    };

    // Format response
    const formattedSets = result.sets.map((set) => {
      const sourceMaqamNamespace = buildEntityNamespace(
        {
          id: set.sourceMaqam.id,
          idName: set.sourceMaqam.idName,
          displayName: set.sourceMaqam.name
        },
        {
          inArabic
        }
      );

      // Format pitch class set
      const pitchClassSetArray = set.pitchClassSet.ipnReferenceNames.map((ipnRef) => {
        const pitchClass = set.pitchClassSet.pitchClasses.get(ipnRef);
        if (!pitchClass) return null;
        
        return {
          ipnReferenceNoteName: ipnRef,
          noteName: pitchClass.noteName,
          cents: parseFloat(pitchClass.cents),
          fraction: pitchClass.fraction,
          decimalRatio: parseFloat(pitchClass.decimalRatio),
          frequency: parseFloat(pitchClass.frequency),
          octave: pitchClass.octave
        };
      }).filter(Boolean);

      // Format compatible maqamat
      const compatibleMaqamatFormatted = set.compatibleMaqamat.map((info) => {
        const maqamNamespace = buildEntityNamespace(
          {
            id: info.maqamData.getId(),
            idName: info.maqamData.getIdName(),
            displayName: info.maqamData.getName()
          },
          {
            inArabic
          }
        );

        const transpositionNamespace = buildIdentifierNamespace(
          {
            idName: standardizeText(info.maqam.name),
            displayName: info.maqam.name
          },
          {
            inArabic
          }
        );

        return {
          maqam: maqamNamespace,
          transposition: {
            ...transpositionNamespace,
            isTransposed: info.maqam.transposition
          },
          isCompatible: info.isCompatible
        };
      });

      return {
        id: set.id,
        name: set.name,
        sourceMaqam: sourceMaqamNamespace,
        sourceTransposition: buildIdentifierNamespace(
          {
            idName: standardizeText(set.sourceTransposition.name),
            displayName: set.sourceTransposition.name
          },
          {
            inArabic
          }
        ),
        pitchClassSet: pitchClassSetArray,
        compatibleMaqamat: compatibleMaqamatFormatted,
        compatibleMaqamatCount: compatibleMaqamatFormatted.length
      };
    });

    const response: any = {
      statistics: statistics,
      summary: summary,
      sets: formattedSets,
      totalSets: formattedSets.length,
      totalCompatibleMaqamat: formattedSets.reduce(
        (sum, set) => sum + set.compatibleMaqamatCount,
        0
      ),
      parameters: {
        tuningSystem: {
          id: cairoTuningSystem.getId(),
          idName: standardizeText(cairoTuningSystem.getId()),
          displayName: cairoTuningSystem.stringify()
        },
        startingNote: {
          idName: standardizeText(cairoStartingNote),
          displayName: cairoStartingNote
        },
        alKindiTuningSystem: {
          id: alKindiTuningSystem.getId(),
          idName: standardizeText(alKindiTuningSystem.getId()),
          displayName: alKindiTuningSystem.stringify()
        },
        alKindiStartingNote: {
          idName: standardizeText(alKindiStartingNote),
          displayName: alKindiStartingNote
        },
        centsTolerance: centsTolerance
      }
    };

    if (includeIncompatible) {
      const incompatibleFormatted = result.incompatibleMaqamat.map((incompatible) => {
        const maqamNamespace = buildEntityNamespace(
          {
            id: incompatible.maqam.getId(),
            idName: incompatible.maqam.getIdName(),
            displayName: incompatible.maqam.getName()
          },
          {
            inArabic
          }
        );

        const transpositionNamespace = incompatible.transposition
          ? buildIdentifierNamespace(
              {
                idName: standardizeText(incompatible.transposition.name),
                displayName: incompatible.transposition.name
              },
              {
                inArabic
              }
            )
          : null;

        return {
          maqam: maqamNamespace,
          transposition: transpositionNamespace
            ? {
                ...transpositionNamespace,
                isTransposed: incompatible.transposition.transposition
              }
            : null,
          reason: incompatible.reason
        };
      });

      response.incompatibleMaqamat = incompatibleFormatted;
      response.incompatibleMaqamatCount = incompatibleFormatted.length;
    }

    return addCorsHeaders(NextResponse.json(response));
  } catch (error) {
    console.error("Error classifying maqamat:", error);
    return addCorsHeaders(
      NextResponse.json(
        {
          error: "Internal server error",
          message: error instanceof Error ? error.message : "Unknown error"
        },
        { status: 500 }
      )
    );
  }
}

