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
  octaveFourNoteNames,
  getNoteNameIndexAndOctave
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
 * GET /api/intervals
 * 
 * Get interval calculations for 2 or more pitch classes by listing their note names.
 * 
 * Query Parameters:
 * - noteNames: Required - Comma-separated note names (e.g., "rast,dugah,segah"). Note names can come from any octave.
 * - tuningSystem: Optional - If provided, calculates in that tuning system only. If omitted, calculates in all tuning systems.
 * - startingNote: Required if tuningSystem is provided - Starting note, or "all" to include all available starting notes for that tuning system
 * - inArabic: true/false - Include Arabic display names
 * 
 * Note: Since note names are unique per octave, each note name already identifies its octave. No octave parameter is needed.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const noteNamesParam = searchParams.get("noteNames");
    const tuningSystemId = searchParams.get("tuningSystem");
    const startingNoteParam = searchParams.get("startingNote");
    
    // Parse inArabic parameter
    let inArabic = false;
    try {
      inArabic = parseInArabic(searchParams);
    } catch (error) {
      return addCorsHeaders(
        NextResponse.json(
          {
            error: error instanceof Error ? error.message : "Invalid inArabic parameter",
            hint: "Use ?inArabic=true or ?inArabic=false"
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

    // If tuningSystem is provided, handle single tuning system case
    if (tuningSystemId) {
      if (tuningSystemId.trim() === "") {
        return addCorsHeaders(
          NextResponse.json(
            {
              error: "Invalid parameter: tuningSystem",
              message: "The 'tuningSystem' parameter cannot be empty.",
              hint: "Remove '?tuningSystem=' from your URL or specify a tuning system like '?tuningSystem=IbnSina-(1037)'"
            },
            { status: 400 }
          )
        );
      }

      const selectedTuningSystem = tuningSystems.find(
        ts => standardizeText(ts.getId()) === standardizeText(tuningSystemId)
      );

      if (!selectedTuningSystem) {
        return addCorsHeaders(
          NextResponse.json(
            {
              error: `Tuning system '${tuningSystemId}' not found`,
              hint: "Use /api/tuning-systems to see all available tuning systems"
            },
            { status: 404 }
          )
        );
      }

      // Require startingNote when tuningSystem is provided
      if (!startingNoteParam) {
        const noteNameSets = selectedTuningSystem.getNoteNameSets();
        const validOptions = noteNameSets.map((set) => set[0]);
        return addCorsHeaders(
          NextResponse.json(
            {
              error: "startingNote parameter is required when tuningSystem is provided",
              message: "A tuning system starting note must be specified.",
              validOptions: validOptions,
              hint: `Add &startingNote=${validOptions[0]} to your request, or use &startingNote=all to include all starting notes`
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

      // Handle startingNote="all"
      if (startingNoteParam === "all") {
        const noteNameSets = selectedTuningSystem.getNoteNameSets();
        const results: any[] = [];

        for (const noteNameSet of noteNameSets) {
          const startingNote = noteNameSet[0];
          if (!startingNote) continue;

          const pitchClasses = getTuningSystemPitchClasses(selectedTuningSystem, startingNote as any);
          
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

            if (intervals.length > 0) {
              results.push({
                intervals,
                context: {
                  tuningSystem: buildEntityNamespace(
                    {
                      id: selectedTuningSystem.getId(),
                      idName: standardizeText(selectedTuningSystem.getId()),
                      displayName: selectedTuningSystem.stringify(),
                    },
                    {
                      version: selectedTuningSystem.getVersion(),
                      inArabic,
                      displayNameAr: inArabic
                        ? getTuningSystemDisplayNameAr(
                            selectedTuningSystem.getCreatorArabic() || "",
                            selectedTuningSystem.getCreatorEnglish() || "",
                            selectedTuningSystem.getYear(),
                            selectedTuningSystem.getTitleArabic() || "",
                            selectedTuningSystem.getTitleEnglish() || ""
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
                  referenceFrequency: foundPitchClasses[0].frequency / parseFloat(foundPitchClasses[0].decimalRatio)
                }
              });
            }
          }
        }

        return addCorsHeaders(
          NextResponse.json({
            context: {
              noteNames: noteNameArray
            },
            intervals: results,
            links: buildLinksNamespace({
              self: request.url,
              compare: `/api/intervals/compare?noteNames=${encodeURIComponent(noteNamesParam)}`
            })
          })
        );
      }

      // Handle specific starting note
      const noteNameSets = selectedTuningSystem.getNoteNameSets();
      const matchingSet = noteNameSets.find(
        (set) => standardizeText(set[0] || "") === standardizeText(startingNoteParam)
      );

      if (!matchingSet || !matchingSet[0]) {
        const validStartingNotes = noteNameSets.map((set) => set[0]).filter(Boolean);
        return addCorsHeaders(
          NextResponse.json(
            {
              error: `Invalid startingNote '${startingNoteParam}'`,
              validOptions: validStartingNotes,
              hint: `Valid starting notes for this tuning system: ${validStartingNotes.join(", ")}`
            },
            { status: 400 }
          )
        );
      }

      const selectedStartingNote = matchingSet[0];
      const pitchClasses = getTuningSystemPitchClasses(selectedTuningSystem, selectedStartingNote as any);
      
      // Find pitch classes for each note name
      const foundPitchClasses: typeof pitchClasses = [];
      for (const noteName of matchingNoteNames) {
        const pitchClass = pitchClasses.find(
          pc => standardizeText(pc.noteName) === standardizeText(noteName)
        );
        if (!pitchClass) {
          return addCorsHeaders(
            NextResponse.json(
              {
                error: `Note name '${noteName}' not found in tuning system '${tuningSystemId}' with starting note '${startingNoteParam}'`,
                hint: "Use /api/pitch-classes/note-names to see all valid note names"
              },
              { status: 404 }
            )
          );
        }
        foundPitchClasses.push(pitchClass);
      }

      // Calculate intervals
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

      return addCorsHeaders(
        NextResponse.json({
          context: {
            noteNames: noteNameArray,
            tuningSystem: buildEntityNamespace(
              {
                id: selectedTuningSystem.getId(),
                idName: standardizeText(selectedTuningSystem.getId()),
                displayName: selectedTuningSystem.stringify(),
              },
              {
                version: selectedTuningSystem.getVersion(),
                inArabic,
                displayNameAr: inArabic
                  ? getTuningSystemDisplayNameAr(
                      selectedTuningSystem.getCreatorArabic() || "",
                      selectedTuningSystem.getCreatorEnglish() || "",
                      selectedTuningSystem.getYear(),
                      selectedTuningSystem.getTitleArabic() || "",
                      selectedTuningSystem.getTitleEnglish() || ""
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
            referenceFrequency: foundPitchClasses[0].frequency / parseFloat(foundPitchClasses[0].decimalRatio)
          },
          intervals,
          links: buildLinksNamespace({
            self: request.url,
            compare: `/api/intervals/compare?noteNames=${encodeURIComponent(noteNamesParam)}`
          })
        })
      );
    }

    // No tuningSystem provided - return data for all tuning systems
    const results: any[] = [];

    for (const tuningSystem of tuningSystems) {
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

          if (intervals.length > 0) {
            results.push({
              intervals,
              context: {
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
                referenceFrequency: foundPitchClasses[0].frequency / parseFloat(foundPitchClasses[0].decimalRatio)
              }
            });
          }
        }
      }
    }

    return addCorsHeaders(
      NextResponse.json({
        context: {
          noteNames: noteNameArray
        },
        intervals: results,
        links: buildLinksNamespace({
          self: request.url,
          compare: `/api/intervals/compare?noteNames=${encodeURIComponent(noteNamesParam)}`
        })
      })
    );
  } catch (error) {
    console.error("Error in GET /api/intervals:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to calculate intervals" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

