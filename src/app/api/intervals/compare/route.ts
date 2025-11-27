import { NextResponse } from "next/server";
import { getTuningSystems } from "@/functions/import";
import { standardizeText } from "@/functions/export";
import getTuningSystemPitchClasses from "@/functions/getTuningSystemPitchClasses";
import { handleCorsPreflightRequest, addCorsHeaders } from "@/app/api/cors";
import { calculateInterval } from "@/models/PitchClass";
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
 * Format interval data for API responses (excludes pitchClassIndex when querying by note names)
 */
function formatIntervalData(interval: ReturnType<typeof calculateInterval>) {
  return {
    fraction: interval.fraction,
    cents: interval.cents,
    decimalRatio: interval.decimalRatio,
    stringLength: interval.stringLength,
    fretDivision: interval.fretDivision,
    originalValue: interval.originalValue,
    originalValueType: interval.originalValueType
  };
}

/**
 * GET /api/intervals/compare
 * 
 * Compare interval calculations for 2+ pitch classes across different tuning systems.
 * 
 * Query Parameters:
 * - noteNames: Required - Comma-separated note names. Note names can come from any octave.
 * - tuningSystems: Required - Comma-separated tuning system IDs
 * - startingNote: Required - Starting note (applies to all tuning systems), or "all" to include all available starting notes for each tuning system.
 *   When "all" is used, the endpoint returns results for all valid starting notes in each tuning system, allowing comprehensive comparison across all theoretical frameworks.
 * - includeArabic: true/false - Include Arabic display names (default: true)
 * 
 * Note: Since note names are unique per octave, each note name already identifies its octave. No octave parameter is needed.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const noteNamesParam = searchParams.get("noteNames");
    const tuningSystemsParam = searchParams.get("tuningSystems");
    const startingNoteParam = searchParams.get("startingNote");
    
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

    // Validate noteNames parameter
    if (!noteNamesParam) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "noteNames parameter is required",
            message: "A comma-separated list of note names must be provided.",
            hint: "Add &noteNames=rast,dugah,segah to your request"
          },
          { status: 400 }
        )
      );
    }

    if (noteNamesParam.trim() === "") {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "Invalid parameter: noteNames",
            message: "The 'noteNames' parameter cannot be empty.",
            hint: "Specify note names like '?noteNames=rast,dugah,segah'"
          },
          { status: 400 }
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

    // Parse note names
    const noteNameStrings = noteNamesParam.split(",").map(name => name.trim()).filter(Boolean);
    
    if (noteNameStrings.length < 2) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: "At least 2 note names are required",
            message: "Interval calculations require at least 2 note names.",
            hint: "Provide at least 2 note names like '?noteNames=rast,dugah'"
          },
          { status: 400 }
        )
      );
    }

    // Validate all note names exist
    const allNoteNames = [
      ...octaveZeroNoteNames,
      ...octaveOneNoteNames,
      ...octaveTwoNoteNames,
      ...octaveThreeNoteNames,
      ...octaveFourNoteNames
    ];

    const matchingNoteNames: string[] = [];
    const invalidNoteNames: string[] = [];

    for (const noteNameStr of noteNameStrings) {
      const matching = allNoteNames.find(
        name => standardizeText(name) === standardizeText(noteNameStr)
      );
      if (matching) {
        matchingNoteNames.push(matching);
      } else {
        invalidNoteNames.push(noteNameStr);
      }
    }

    if (invalidNoteNames.length > 0) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: `Invalid note name(s): ${invalidNoteNames.join(", ")}`,
            message: "All note names must exist in one of the octave arrays in NoteName.ts",
            hint: "Use /api/pitch-classes/note-names to see all valid note names"
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

    // Build note name array for response
    const noteNameArray = matchingNoteNames.map(noteName =>
      buildIdentifierNamespace(
        {
          idName: standardizeText(noteName),
          displayName: noteName
        },
        {
          inArabic,
          displayAr: inArabic ? getNoteNameDisplayAr(noteName) : undefined
        }
      )
    );

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
          
          // Find pitch classes for each note name
          const foundPitchClasses: typeof pitchClasses = [];
          for (const noteName of matchingNoteNames) {
            const pitchClass = pitchClasses.find(
              pc => standardizeText(pc.noteName) === standardizeText(noteName)
            );
            if (pitchClass) {
              foundPitchClasses.push(pitchClass);
            }
          }

          // If we found all note names, calculate intervals
          if (foundPitchClasses.length === matchingNoteNames.length) {
            successfulComparisons++;
            const intervals = [];
            for (let i = 0; i < foundPitchClasses.length - 1; i++) {
              const interval = calculateInterval(foundPitchClasses[i], foundPitchClasses[i + 1]);
              intervals.push({
                from: buildIdentifierNamespace(
                  {
                    idName: standardizeText(foundPitchClasses[i].noteName),
                    displayName: foundPitchClasses[i].noteName
                  },
                  {
                    inArabic,
                    displayAr: inArabic ? getNoteNameDisplayAr(foundPitchClasses[i].noteName) : undefined
                  }
                ),
                to: buildIdentifierNamespace(
                  {
                    idName: standardizeText(foundPitchClasses[i + 1].noteName),
                    displayName: foundPitchClasses[i + 1].noteName
                  },
                  {
                    inArabic,
                    displayAr: inArabic ? getNoteNameDisplayAr(foundPitchClasses[i + 1].noteName) : undefined
                  }
                ),
                interval: formatIntervalData(interval)
              });
            }

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
              intervals,
              context: {
                referenceFrequency: (typeof foundPitchClasses[0].frequency === 'number' ? foundPitchClasses[0].frequency : parseFloat(String(foundPitchClasses[0].frequency || '0'))) / (parseFloat(String(foundPitchClasses[0].decimalRatio || '1')))
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
        
        // Find pitch classes for each note name
        const foundPitchClasses: typeof pitchClasses = [];
        for (const noteName of matchingNoteNames) {
          const pitchClass = pitchClasses.find(
            pc => standardizeText(pc.noteName) === standardizeText(noteName)
          );
          if (pitchClass) {
            foundPitchClasses.push(pitchClass);
          }
        }

        // If we found all note names, calculate intervals
        if (foundPitchClasses.length === matchingNoteNames.length) {
          successfulComparisons++;
          const intervals = [];
          for (let i = 0; i < foundPitchClasses.length - 1; i++) {
            const interval = calculateInterval(foundPitchClasses[i], foundPitchClasses[i + 1]);
            intervals.push({
              from: buildIdentifierNamespace(
                {
                  idName: standardizeText(foundPitchClasses[i].noteName),
                  displayName: foundPitchClasses[i].noteName
                },
                {
                  inArabic,
                  displayAr: inArabic ? getNoteNameDisplayAr(foundPitchClasses[i].noteName) : undefined
                }
              ),
              to: buildIdentifierNamespace(
                {
                  idName: standardizeText(foundPitchClasses[i + 1].noteName),
                  displayName: foundPitchClasses[i + 1].noteName
                },
                {
                  inArabic,
                  displayAr: inArabic ? getNoteNameDisplayAr(foundPitchClasses[i + 1].noteName) : undefined
                }
              ),
              interval: formatIntervalData(interval)
            });
          }

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
            intervals,
            context: {
              referenceFrequency: (typeof foundPitchClasses[0].frequency === 'number' ? foundPitchClasses[0].frequency : parseFloat(String(foundPitchClasses[0].frequency || '0'))) / (parseFloat(String(foundPitchClasses[0].decimalRatio || '1')))
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
          noteNames: noteNameArray
        },
        comparisons,
        meta: {
          totalComparisons: successfulComparisons + failedComparisons,
          successfulComparisons,
          failedComparisons
        },
        links: buildLinksNamespace({
          self: request.url,
          intervals: `/api/intervals?noteNames=${encodeURIComponent(noteNamesParam)}`
        })
      })
    );
  } catch (error) {
    console.error("Error in GET /api/intervals/compare:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to compare intervals" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

