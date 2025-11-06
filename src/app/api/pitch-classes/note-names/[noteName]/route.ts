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
    case "englishName":
      return {
        pitchClassIndex: pitchClass.pitchClassIndex,
        octave: pitchClass.octave,
        noteName: standardizeText(pitchClass.noteName),
        noteNameDisplay: pitchClass.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pitchClass.noteName) }),
        englishName: pitchClass.englishName
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
    case "cents":
      return {
        pitchClassIndex: pitchClass.pitchClassIndex,
        octave: pitchClass.octave,
        noteName: standardizeText(pitchClass.noteName),
        noteNameDisplay: pitchClass.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pitchClass.noteName) }),
        cents: parseFloat(pitchClass.cents)
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
    case "stringLength":
      return {
        pitchClassIndex: pitchClass.pitchClassIndex,
        octave: pitchClass.octave,
        noteName: standardizeText(pitchClass.noteName),
        noteNameDisplay: pitchClass.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pitchClass.noteName) }),
        stringLength: parseFloat(pitchClass.stringLength)
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
    case "abjadName":
      return {
        pitchClassIndex: pitchClass.pitchClassIndex,
        octave: pitchClass.octave,
        noteName: standardizeText(pitchClass.noteName),
        noteNameDisplay: pitchClass.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pitchClass.noteName) }),
        abjadName: pitchClass.abjadName
      };
    case "fretDivision":
      return {
        pitchClassIndex: pitchClass.pitchClassIndex,
        octave: pitchClass.octave,
        noteName: standardizeText(pitchClass.noteName),
        noteNameDisplay: pitchClass.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pitchClass.noteName) }),
        fretDivision: pitchClass.fretDivision
      };
    case "midiNoteNumber":
      return {
        pitchClassIndex: pitchClass.pitchClassIndex,
        octave: pitchClass.octave,
        noteName: standardizeText(pitchClass.noteName),
        noteNameDisplay: pitchClass.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pitchClass.noteName) }),
        midiNoteDecimal: pitchClass.midiNoteDecimal
      };
    case "midiNoteDeviation":
      return {
        pitchClassIndex: pitchClass.pitchClassIndex,
        octave: pitchClass.octave,
        noteName: standardizeText(pitchClass.noteName),
        noteNameDisplay: pitchClass.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pitchClass.noteName) }),
        midiNotePlusCentsDeviation: `${calculateIpnReferenceMidiNote(pitchClass)} ${pitchClass.centsDeviation >= 0 ? '+' : ''}${pitchClass.centsDeviation.toFixed(1)}`
      };
    case "centsDeviation":
      return {
        pitchClassIndex: pitchClass.pitchClassIndex,
        octave: pitchClass.octave,
        noteName: standardizeText(pitchClass.noteName),
        noteNameDisplay: pitchClass.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pitchClass.noteName) }),
        centsDeviation: pitchClass.centsDeviation
      };
    case "referenceNoteName":
      return {
        pitchClassIndex: pitchClass.pitchClassIndex,
        octave: pitchClass.octave,
        noteName: standardizeText(pitchClass.noteName),
        noteNameDisplay: pitchClass.noteName,
        ...(inArabic && { noteNameDisplayAr: getNoteNameDisplayAr(pitchClass.noteName) }),
        ipnReferenceNoteName: pitchClass.referenceNoteName
      };
    default:
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
  }
}

/**
 * GET /api/pitch-classes/note-names/[noteName]
 * 
 * Get pitch class details for a note name, across all tuning systems or a specific one.
 * 
 * Query Parameters:
 * - tuningSystem: Optional - If provided, returns data for that tuning system only. If omitted, returns data for all tuning systems.
 * - startingNote: Required if tuningSystem is provided - Starting note for the tuning system, or "all" to include all available starting notes for that tuning system
 * - pitchClassDataType: Optional - Format (all, cents, fraction, etc.) - defaults to "all"
 * - octave: Optional - Octave number (0-4). Note: Since note names are unique per octave, the note name itself already identifies the octave. This parameter can be used for validation.
 * - inArabic: true/false - Include Arabic display names
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ noteName: string }> }
) {
  try {
    const { noteName: noteNameParam } = await context.params;
    const { searchParams } = new URL(request.url);
    const tuningSystemId = searchParams.get("tuningSystem");
    const startingNoteParam = searchParams.get("startingNote");
    const pitchClassDataType = searchParams.get("pitchClassDataType") || "all";
    
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

    const tuningSystems = getTuningSystems();

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
          const matchingPitchClass = pitchClasses.find(
            pc => standardizeText(pc.noteName) === standardizeText(matchingNoteName)
          );

          if (matchingPitchClass) {
            results.push({
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
                referenceFrequency: (typeof matchingPitchClass.frequency === 'number' ? matchingPitchClass.frequency : parseFloat(String(matchingPitchClass.frequency || '0'))) / (parseFloat(String(matchingPitchClass.decimalRatio || '1'))),
                pitchClassDataType: pitchClassDataType
              },
              pitchClassData: formatPitchData(matchingPitchClass, pitchClassDataType || "all", inArabic)
            });
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
            pitchClasses: results,
            links: buildLinksNamespace({
              self: request.url,
              availability: `/api/pitch-classes/note-names/${standardizeText(matchingNoteName)}/availability`,
              compare: `/api/pitch-classes/note-names/${standardizeText(matchingNoteName)}/compare`
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
      const matchingPitchClass = pitchClasses.find(
        pc => standardizeText(pc.noteName) === standardizeText(matchingNoteName)
      );

      if (!matchingPitchClass) {
        return addCorsHeaders(
          NextResponse.json(
            {
              error: `Note name '${decodedNoteName}' not found in tuning system '${tuningSystemId}' with starting note '${startingNoteParam}'`,
              hint: `Use /api/pitch-classes/note-names/${standardizeText(matchingNoteName)}/availability to see where this note name is available`
            },
            { status: 404 }
          )
        );
      }

      return addCorsHeaders(
        NextResponse.json({
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
                idName: standardizeText(selectedStartingNote),
                displayName: selectedStartingNote
              },
              {
                inArabic,
                displayAr: inArabic ? getNoteNameDisplayAr(selectedStartingNote) : undefined
              }
            ),
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
            referenceFrequency: (typeof matchingPitchClass.frequency === 'number' ? matchingPitchClass.frequency : parseFloat(String(matchingPitchClass.frequency || '0'))) / (parseFloat(String(matchingPitchClass.decimalRatio || '1'))),
            pitchClassDataType: pitchClassDataType
          },
          pitchClass: formatPitchData(matchingPitchClass, pitchClassDataType || "all", inArabic),
          links: buildLinksNamespace({
            self: request.url,
            availability: `/api/pitch-classes/note-names/${standardizeText(matchingNoteName)}/availability`,
            compare: `/api/pitch-classes/note-names/${standardizeText(matchingNoteName)}/compare`
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
        const matchingPitchClass = pitchClasses.find(
          pc => standardizeText(pc.noteName) === standardizeText(matchingNoteName)
        );

        if (matchingPitchClass) {
          results.push({
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
              referenceFrequency: (typeof matchingPitchClass.frequency === 'number' ? matchingPitchClass.frequency : parseFloat(String(matchingPitchClass.frequency || '0'))) / (parseFloat(String(matchingPitchClass.decimalRatio || '1'))),
              pitchClassDataType: pitchClassDataType
            },
            pitchClassData: formatPitchData(matchingPitchClass, pitchClassDataType || "all", inArabic)
          });
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
        pitchClasses: results,
        links: buildLinksNamespace({
          self: request.url,
          availability: `/api/pitch-classes/note-names/${standardizeText(matchingNoteName)}/availability`,
          compare: `/api/pitch-classes/note-names/${standardizeText(matchingNoteName)}/compare`
        })
      })
    );
  } catch (error) {
    console.error("Error in GET /api/pitch-classes/note-names/[noteName]:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to retrieve pitch class data" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}

