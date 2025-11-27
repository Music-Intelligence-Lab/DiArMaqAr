import { NextResponse } from "next/server";
import { getTuningSystems } from "@/functions/import";
import { standardizeText } from "@/functions/export";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { handleCorsPreflightRequest, addCorsHeaders } from "@/app/api/cors";
import PitchClass from "@/models/PitchClass";
import { calculateIpnReferenceMidiNote } from "@/functions/calculateIpnReferenceMidiNote";
import { parseInArabic, getNoteNameDisplayAr, getTuningSystemDisplayNameAr } from "@/app/api/arabic-helpers";
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
  buildLinksNamespace
} from "@/app/api/response-shapes";

export const OPTIONS = handleCorsPreflightRequest;

/**
 * Format pitch data according to requested format
 * @param pitchClass - Pitch class to format
 * @param format - Output format type
 * @param inArabic - Whether to return Arabic names
 */
function formatPitchData(pitchClass: PitchClass, format: string, inArabic: boolean = false) {
  switch (format) {
    case "all":
      return {
        pitchClassIndex: pitchClass.pitchClassIndex,
        octave: pitchClass.octave,
        noteName: standardizeText(pitchClass.noteName),
        noteNameDisplay: pitchClass.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pitchClass.noteName) }),
        englishName: pitchClass.englishName,
        abjadName: pitchClass.abjadName,
        fraction: pitchClass.fraction,
        cents: parseFloat(pitchClass.cents),
        decimalRatio: parseFloat(pitchClass.decimalRatio),
        stringLength: parseFloat(pitchClass.stringLength),
        frequency: parseFloat(pitchClass.frequency),
        fretDivision: pitchClass.fretDivision,
        midiNoteDecimal: pitchClass.midiNoteDecimal,
        midiNotePlusCentsDeviation: `${calculateIpnReferenceMidiNote(pitchClass)} ${pitchClass.centsDeviation >= 0 ? '+' : ''}${pitchClass.centsDeviation.toFixed(1)}`,
        centsDeviation: pitchClass.centsDeviation,
        ipnReferenceNoteName: pitchClass.referenceNoteName
      };
    case "cents":
      return {
        pitchClassIndex: pitchClass.pitchClassIndex,
        octave: pitchClass.octave,
        noteName: standardizeText(pitchClass.noteName),
        noteNameDisplay: pitchClass.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pitchClass.noteName) }),
        cents: parseFloat(pitchClass.cents)
      };
    case "fraction":
      return {
        pitchClassIndex: pitchClass.pitchClassIndex,
        octave: pitchClass.octave,
        noteName: standardizeText(pitchClass.noteName),
        noteNameDisplay: pitchClass.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pitchClass.noteName) }),
        fraction: pitchClass.fraction
      };
    case "decimalRatio":
      return {
        pitchClassIndex: pitchClass.pitchClassIndex,
        octave: pitchClass.octave,
        noteName: standardizeText(pitchClass.noteName),
        noteNameDisplay: pitchClass.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pitchClass.noteName) }),
        decimalRatio: parseFloat(pitchClass.decimalRatio)
      };
    case "frequency":
      return {
        pitchClassIndex: pitchClass.pitchClassIndex,
        octave: pitchClass.octave,
        noteName: standardizeText(pitchClass.noteName),
        noteNameDisplay: pitchClass.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pitchClass.noteName) }),
        frequency: parseFloat(pitchClass.frequency)
      };
    default:
      return {
        pitchClassIndex: pitchClass.pitchClassIndex,
        octave: pitchClass.octave,
        noteName: standardizeText(pitchClass.noteName),
        noteNameDisplay: pitchClass.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pitchClass.noteName) }),
        ...(format === "englishName" && { englishName: pitchClass.englishName }),
        ...(format === "abjadName" && { abjadName: pitchClass.abjadName }),
        ...(format === "stringLength" && { stringLength: parseFloat(pitchClass.stringLength) }),
        ...(format === "fretDivision" && { fretDivision: pitchClass.fretDivision }),
        ...(format === "midiNoteNumber" && { midiNoteDecimal: pitchClass.midiNoteDecimal }),
        ...(format === "midiNoteDeviation" && { midiNotePlusCentsDeviation: `${calculateIpnReferenceMidiNote(pitchClass)} ${pitchClass.centsDeviation >= 0 ? '+' : ''}${pitchClass.centsDeviation.toFixed(1)}` }),
        ...(format === "centsDeviation" && { centsDeviation: pitchClass.centsDeviation }),
        ...(format === "referenceNoteName" && { ipnReferenceNoteName: pitchClass.referenceNoteName })
      };
  }
}

/**
 * GET /api/pitch-classes/note-names/[noteName]/compare
 * 
 * Compare a pitch class (by note name) across different tuning systems.
 * 
 * Query Parameters:
 * - tuningSystems: Required - Comma-separated tuning system IDs
 * - startingNote: Required - Starting note (applies to all tuning systems), or "all" to include all available starting notes for each tuning system. 
 *   When "all" is used, the endpoint returns results for all valid starting notes in each tuning system, allowing comprehensive comparison across all theoretical frameworks.
 * - pitchClassDataType: Optional - Format, defaults to "all"
 * - includeArabic: true/false - Include Arabic display names (default: true)
 * 
 * Note: Since note names are unique per octave, the note name itself identifies the octave. No octave parameter is needed.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ noteName: string }> }
) {
  try {
    const { noteName: noteNameParam } = await context.params;
    const { searchParams } = new URL(request.url);
    const tuningSystemsParam = searchParams.get("tuningSystems");
    const startingNoteParam = searchParams.get("startingNote");
    const pitchClassDataType = searchParams.get("pitchClassDataType") || "all";
    
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

    const matchingNoteName = allNoteNames.find(
      name => standardizeText(name) === standardizeText(decodedNoteName)
    );

    if (!matchingNoteName) {
      const validNoteNames = Array.from(new Set(allNoteNames))
        .map(name => standardizeText(name))
        .slice(0, 20);

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


    // Validate required parameters
    if (!tuningSystemsParam) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "tuningSystems parameter is required",
            message: "A comma-separated list of tuning system IDs must be provided.",
            hint: "Add &tuningSystems=ibnsina_1037,alfarabi_950g to your request"
          },
          { status: 400 }
        )
      );
    }

    if (tuningSystemsParam.trim() === "") {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "Invalid parameter: tuningSystems",
            message: "The 'tuningSystems' parameter cannot be empty.",
            hint: "Specify tuning systems like '?tuningSystems=ibnsina_1037,alfarabi_950g'"
          },
          { status: 400 }
        )
      );
    }

    if (!startingNoteParam) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "startingNote parameter is required",
            message: "A starting note must be specified.",
            hint: "Add &startingNote=yegah to your request, or use &startingNote=all to include all starting notes"
          },
          { status: 400 }
        )
      );
    }

    if (startingNoteParam.trim() === "") {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "Invalid parameter: startingNote",
            message: "The 'startingNote' parameter cannot be empty.",
            hint: "Specify a starting note like '?startingNote=yegah' or use '?startingNote=all'"
          },
          { status: 400 }
        )
      );
    }

    const tuningSystems = getTuningSystems();
    const tuningSystemIds = tuningSystemsParam.split(",").map(id => id.trim()).filter(Boolean);

    // Validate all tuning systems exist
    const selectedTuningSystems = tuningSystemIds.map(id => {
      const ts = tuningSystems.find(t => standardizeText(t.getId()) === standardizeText(id));
      if (!ts) {
        return null;
      }
      return ts;
    }).filter(Boolean) as typeof tuningSystems;

    if (selectedTuningSystems.length !== tuningSystemIds.length) {
      const invalidIds = tuningSystemIds.filter(id => 
        !tuningSystems.some(ts => standardizeText(ts.getId()) === standardizeText(id))
      );
      return addCorsHeaders(
        NextResponse.json(
          {
            error: `Invalid tuning system ID(s): ${invalidIds.join(", ")}`,
            hint: "Use /api/tuning-systems to see all available tuning systems"
          },
          { status: 400 }
        )
      );
    }

    const comparisons: any[] = [];
    let successfulComparisons = 0;
    let failedComparisons = 0;

    // Handle startingNote="all"
    if (startingNoteParam === "all") {
      for (const tuningSystem of selectedTuningSystems) {
        const noteNameSets = tuningSystem.getNoteNameSets();
        
        for (const noteNameSet of noteNameSets) {
          const startingNote = noteNameSet[0];
          if (!startingNote) continue;

          const pitchClasses = getTuningSystemPitchClasses(tuningSystem, startingNote as any);
          const matchingPitchClass = pitchClasses.find(
            pc => standardizeText(pc.noteName) === standardizeText(matchingNoteName)
          );

          if (matchingPitchClass) {
            successfulComparisons++;
            comparisons.push({
              tuningSystem: buildEntityNamespace(
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
              ),
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
              pitchClass: formatPitchData(matchingPitchClass, pitchClassDataType || "all", inArabic),
              context: {
                referenceFrequency: (typeof matchingPitchClass.frequency === 'number' ? matchingPitchClass.frequency : parseFloat(String(matchingPitchClass.frequency || '0'))) / (parseFloat(String(matchingPitchClass.decimalRatio || '1'))),
                pitchClassDataType: pitchClassDataType
              }
            });
          } else {
            failedComparisons++;
          }
        }
      }
    } else {
      // Handle specific starting note
      for (const tuningSystem of selectedTuningSystems) {
        const noteNameSets = tuningSystem.getNoteNameSets();
        const matchingSet = noteNameSets.find(
          (set) => standardizeText(set[0] || "") === standardizeText(startingNoteParam)
        );

        if (!matchingSet || !matchingSet[0]) {
          failedComparisons++;
          continue;
        }

        const selectedStartingNote = matchingSet[0];
        const pitchClasses = getTuningSystemPitchClasses(tuningSystem, selectedStartingNote as any);
        const matchingPitchClass = pitchClasses.find(
          pc => standardizeText(pc.noteName) === standardizeText(matchingNoteName)
        );

        if (matchingPitchClass) {
          successfulComparisons++;
          comparisons.push({
            tuningSystem: buildEntityNamespace(
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
            ),
            startingNote: buildIdentifierNamespace(
              {
                idName: standardizeText(selectedStartingNote),
                displayName: selectedStartingNote
              },
              {
                inArabic,
                displayAr: inArabic ? getNoteNameDisplayAr(selectedStartingNote) : undefined
              }
            ),
              pitchClass: formatPitchData(matchingPitchClass, pitchClassDataType || "all", inArabic),
            context: {
              referenceFrequency: (typeof matchingPitchClass.frequency === 'number' ? matchingPitchClass.frequency : parseFloat(String(matchingPitchClass.frequency || '0'))) / (parseFloat(String(matchingPitchClass.decimalRatio || '1'))),
              pitchClassDataType: pitchClassDataType
            }
          });
        } else {
          failedComparisons++;
        }
      }
    }

    return addCorsHeaders(
      NextResponse.json({
        context: {
          noteName: buildIdentifierNamespace(
            {
              idName: standardizeText(matchingNoteName),
              displayName: matchingNoteName
            },
            {
              inArabic,
              displayAr: inArabic ? getNoteNameDisplayAr(matchingNoteName) : undefined
            }
          )
        },
        comparisons,
        meta: {
          totalComparisons: successfulComparisons + failedComparisons,
          successfulComparisons,
          failedComparisons
        },
        links: buildLinksNamespace({
          self: request.url,
          detail: `/api/pitch-classes/note-names/${standardizeText(matchingNoteName)}`,
          availability: `/api/pitch-classes/note-names/${standardizeText(matchingNoteName)}/availability`
        })
      })
    );
  } catch (error) {
    console.error("Error in GET /api/pitch-classes/note-names/[noteName]/compare:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to compare pitch class data" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

