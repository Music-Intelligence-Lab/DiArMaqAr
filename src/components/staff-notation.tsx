"use client";

import React, { useRef, useEffect } from "react";
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, TextNote } from "vexflow";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import { renderPitchClassSpellings } from "@/functions/renderPitchClassIpnSpellings";
import { calculateIpnReferenceMidiNote } from "@/functions/calculateIpnReferenceMidiNote";
import { getIpnReferenceNoteNameWithOctave } from "@/functions/getIpnReferenceNoteName";
import useAppContext from "@/contexts/app-context";
import PitchClass from "@/models/PitchClass";
import useLanguageContext from "@/contexts/language-context";

interface StaffNotationProps {
  pitchClasses: PitchClass[];
}

export default function StaffNotation({ pitchClasses }: StaffNotationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const clef = "treble"; // Always use treble clef
  const { language, getDisplayName } = useLanguageContext();
  const { selectedMaqam, selectedJins, selectedPitchClasses: appSelectedPitchClasses } = useAppContext();

  useEffect(() => {
    if (!containerRef.current || !pitchClasses.length) return;

    containerRef.current.innerHTML = "";

    try {
      renderStaff();
    } catch (error) {
      console.error("Error rendering staff notation:", error);
      if (containerRef.current) {
        containerRef.current.innerHTML =
          '<div style="text-align: center; font-size: 14px; color: #666; padding: 20px;">Unable to display staff notation</div>';
      }
    }
  }, [pitchClasses, language]); // Add language as dependency

  const parseNote = (englishName: string) => {
    if (!englishName || englishName === "--") return null;

    const cleanName = englishName.trim();

    const noteLetter = cleanName.charAt(0).toLowerCase();
    if (!"cdefgba".includes(noteLetter)) {
      return null;
    }

    // Extract everything after the note letter
    const remainder = cleanName.slice(1);
    
    // Find where the octave number starts (last digit(s) in the string)
    const octaveMatch = remainder.match(/(\d+)$/);
    
    let accidental = "";
    if (octaveMatch) {
      // Remove the octave number to get just the accidental
      accidental = remainder.slice(0, remainder.length - octaveMatch[0].length);
    } else {
      // No octave number found, everything after the letter is accidental
      accidental = remainder;
    }

    return {
      letter: noteLetter,
      accidental: accidental,
    };
  };

  const mapAccidentalToVexFlow = (accidental: string) => {
    switch (accidental) {
      case "--":
        return "b";
      case "-":
        return "b";
      case "+":
        return "n";
      case "++":
        return "n";
      case "b--":
        return "b";
      case "-b":
        return "bs";
      case "-#":
        return "+"; // fallback, or custom if needed
      case "b":
        return "b";
      case "#":
        return "#";
      case "bb":
        return "b";
      case "n":
        return "n";
      case "b+":
        return "b";
      case "#-":
        return "#";
      case "#+":
        return "++";
      default:
        return "n";
    }
  };

  const renderStaff = () => {
    if (!containerRef.current) return;

    // Precompute context-aware english names for the pitchClasses array
    const computedEnglishNames: string[] = (() => {
      const preferredMap: Record<string, string> = {};
      const contextSeq = 
        (selectedMaqam && selectedMaqam.ascendingPitchClasses) ||
        (selectedJins && selectedJins.jinsPitchClasses) ||
        (appSelectedPitchClasses && appSelectedPitchClasses.length >= 2 ? appSelectedPitchClasses : undefined);

      if (contextSeq) {
        // Apply sequential naming for melodic sequences
        const renderedSeq = renderPitchClassSpellings(contextSeq);
        renderedSeq.forEach((pc) => {
          preferredMap[pc.noteName] = pc.englishName;
        });
      }

      // Map pitchClasses to their English names, using the preferred map where available
      return pitchClasses.map((pc) => {
        return preferredMap[pc.noteName] || getEnglishNoteName(pc.noteName);
      });
    })();

    const notesCount = computedEnglishNames.filter((en) => en && en !== "--").length;

    const noteWidth = 100;
    const staveMargin = 300;
    const rightMargin = 20;
    const calculatedWidth =  staveMargin + (notesCount * noteWidth) + rightMargin;
    const calculatedHeight = 240; // Increased total height for high notes and text below

    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
    renderer.resize(calculatedWidth, calculatedHeight);
    const context = renderer.getContext();

    const staveX = 0;
    const staveY = 35; // Moved staff down to create space for high ledger lines
    const staveWidth = calculatedWidth - rightMargin;
    const stave = new Stave(staveX, staveY, staveWidth);
    stave.addClef(clef);
    stave.setContext(context).draw();

    // Add "8vb" marking below the treble clef to indicate octave transposition
    context.setFont("Readex Pro", 10, "bold");
    context.fillText("8", 16, staveY + 106); // Position "8" below the clef (further down)

    const vexFlowNotes: StaveNote[] = [];

  pitchClasses.forEach((pitchClass, idx) => {
      try {
    const englishName = computedEnglishNames[idx];

    if (!englishName || englishName === "--") return;

    const parsed = parseNote(englishName);

        if (!parsed) return;

        // Use the IPN reference MIDI note instead of the microtonal MIDI note
        const referenceMidiNote = calculateIpnReferenceMidiNote(pitchClass);

        // Use the parsed note letter from the English name instead of MIDI conversion
        const noteLetter = parsed.letter;
        
        // Calculate the correct octave for the parsed note letter using the reference MIDI note
        // MIDI note 60 = C4, so we can calculate from there
        const baseOctave = Math.floor(referenceMidiNote / 12) - 1;
        const semitoneInOctave = referenceMidiNote % 12;
        
        // Map note letters to their position in the chromatic scale (C=0, D=2, E=4, F=5, G=7, A=9, B=11)
        const notePositions: { [key: string]: number } = {
          'c': 0, 'd': 2, 'e': 4, 'f': 5, 'g': 7, 'a': 9, 'b': 11
        };
        
        const expectedSemitone = notePositions[noteLetter];
        
        // Adjust octave if the note letter doesn't match the expected position
        let adjustedOctave = baseOctave;
        if (semitoneInOctave < expectedSemitone && (expectedSemitone - semitoneInOctave) > 6) {
          // Note is in the next octave (e.g., B# in a higher octave)
          adjustedOctave += 1;
        } else if (semitoneInOctave > expectedSemitone && (semitoneInOctave - expectedSemitone) > 6) {
          // Note is in the previous octave (e.g., Cb in a lower octave)
          adjustedOctave += 1;
        }

        // For 8vb clef display: transpose up one octave for visual display
        // (notes shown higher but sound lower)
        const displayOctave = adjustedOctave + 1;

        const noteSpec = `${noteLetter}/${displayOctave}`;

        const staveNote = new StaveNote({
          clef: clef,
          keys: [noteSpec],
          duration: "q",
          autoStem: true,
        });

        if (parsed.accidental && parsed.accidental !== "") {
          const vexFlowAccidental = mapAccidentalToVexFlow(parsed.accidental);

          if (vexFlowAccidental) {
            staveNote.addModifier(new Accidental(vexFlowAccidental), 0);
          }
        }
        vexFlowNotes.push(staveNote);
      } catch (error) {
        console.warn(`[StaffNotation] Could not create note for ${pitchClass.noteName}:`, error);
      }
    });

    if (vexFlowNotes.length === 0) {
      if (containerRef.current) {
        containerRef.current.innerHTML =
          '<div style="text-align: center; font-size: 14px; color: #666; padding: 20px;">No valid notes to display</div>';
      }
      return;
    }

    // Create text notes for note names and combined English name with cents
    const arabicTextNotes: TextNote[] = [];
    const combinedTextNotes: TextNote[] = [];

  pitchClasses.forEach((pitchClass, idx) => {
      try {
    const englishName = computedEnglishNames[idx];

        if (!englishName || englishName === "--") return;

        const parsed = parseNote(englishName);

        if (!parsed) return;

        // Create a text note for note name (Arabic or localized based on language)
        const noteName = getDisplayName(pitchClass.noteName, 'note');
        const noteNameTextNote = new TextNote({
          text: noteName,
          duration: "q",
        });
        noteNameTextNote.setLine(15); // Position above combined text
        noteNameTextNote.setJustification(TextNote.Justification.CENTER);
        noteNameTextNote.setFont("Readex Pro", 12); // Set smaller font size
        arabicTextNotes.push(noteNameTextNote);

        // Create a combined text note for IPN reference note name with octave and cents deviation
        const referenceNoteWithOctave = getIpnReferenceNoteNameWithOctave(pitchClass);
        const combinedText = `${referenceNoteWithOctave} ${pitchClass.centsDeviation > 0 ? '+' : ''}${pitchClass.centsDeviation.toFixed(1)}¢`;
        const combinedTextNote = new TextNote({
          text: combinedText,
          duration: "q",
        });
        combinedTextNote.setLine(17); // Position below Arabic note name
        combinedTextNote.setJustification(TextNote.Justification.CENTER);
        combinedTextNote.setFont("Readex Pro", 10); // Set smaller font size
        combinedTextNotes.push(combinedTextNote);
      } catch (error) {
        console.warn(`[StaffNotation] Could not create text note for ${pitchClass.noteName}:`, error);
      }
    });

    // Create voice for staff notes
    const voice = new Voice({
      numBeats: vexFlowNotes.length,
      beatValue: 4,
    });
    voice.addTickables(vexFlowNotes);

    // Create voice for note names (Arabic/localized based on language)
    const noteNameTextVoice = new Voice({
      numBeats: arabicTextNotes.length,
      beatValue: 4,
    });
    noteNameTextVoice.addTickables(arabicTextNotes);

    // Create voice for combined English note names and cents deviation
    const combinedTextVoice = new Voice({
      numBeats: combinedTextNotes.length,
      beatValue: 4,
    });
    combinedTextVoice.addTickables(combinedTextNotes);

    const formatter = new Formatter();
    formatter.joinVoices([voice, noteNameTextVoice, combinedTextVoice]).format([voice, noteNameTextVoice, combinedTextVoice], staveWidth - 20);
    
    voice.draw(context, stave);
    noteNameTextVoice.draw(context, stave);
    combinedTextVoice.draw(context, stave);
  };

  return (
    <div className="staff-notation" style={{ direction: 'ltr' }}>
      <div ref={containerRef} className="staff-notation__container" />
    </div>
  );
}
