"use client";

import React, { useRef, useEffect } from "react";
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, TextNote } from "vexflow";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
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

    const cleanName = englishName.trim().toLowerCase();

    const noteLetter = cleanName.charAt(0);
    if (!"cdefgba".includes(noteLetter)) {
      return null;
    }

    const accidental = cleanName.slice(1);

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
      let prevEnglish: string | undefined = undefined;
      const contextSeq: { noteName: string }[] | undefined =
        (selectedMaqam && selectedMaqam.ascendingPitchClasses) ||
        (selectedJins && selectedJins.jinsPitchClasses) ||
        (appSelectedPitchClasses && appSelectedPitchClasses.length >= 2 ? appSelectedPitchClasses : undefined);

      if (contextSeq) {
        prevEnglish = undefined;
        for (const pc of contextSeq) {
          if (!pc || !pc.noteName) continue;
          const en = getEnglishNoteName(pc.noteName, { prevEnglish });
          preferredMap[pc.noteName] = en;
          prevEnglish = en;
        }
      }

      prevEnglish = undefined;
      return pitchClasses.map((pc) => {
        const noteName = pc.noteName;
        if (preferredMap[noteName]) {
          prevEnglish = preferredMap[noteName];
          return preferredMap[noteName];
        }
        const en = getEnglishNoteName(noteName, { prevEnglish });
        prevEnglish = en;
        return en;
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

    const vexFlowNotes: StaveNote[] = [];

  pitchClasses.forEach((pitchClass, idx) => {
      try {
    const englishName = computedEnglishNames[idx];

    if (!englishName || englishName === "--") return;

    const parsed = parseNote(englishName);

        if (!parsed) return;

        const midiNoteNumber = Math.round(pitchClass.midiNoteNumber);

        // Use the parsed note letter from the English name instead of MIDI conversion
        const noteLetter = parsed.letter;
        
        // Calculate the correct octave for the parsed note letter
        // MIDI note 60 = C4, so we can calculate from there
        const baseOctave = Math.floor(midiNoteNumber / 12) - 1;
        const semitoneInOctave = midiNoteNumber % 12;
        
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

        const noteSpec = `${noteLetter}/${adjustedOctave}`;

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

    // Create text notes for cents deviation and note names
    const centsTextNotes: TextNote[] = [];
    const arabicTextNotes: TextNote[] = [];
    const englishTextNotes: TextNote[] = [];

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
        noteNameTextNote.setLine(15); // Position above English note name
        noteNameTextNote.setJustification(TextNote.Justification.CENTER);
        noteNameTextNote.setFont("Readex Pro", 10); // Set smaller font size
        arabicTextNotes.push(noteNameTextNote);

        // Create a text note for English note name
        const englishNoteName = englishName;
        const englishNoteNameTextNote = new TextNote({
          text: englishNoteName,
          duration: "q",
        });
        englishNoteNameTextNote.setLine(16.5); // Position between Arabic name and cents
        englishNoteNameTextNote.setJustification(TextNote.Justification.CENTER);
        englishNoteNameTextNote.setFont("Readex Pro", 9); // Slightly smaller font for English
        englishTextNotes.push(englishNoteNameTextNote);

        // Create a text note for cents deviation
        const centsText = pitchClass.referenceNoteName 
          ? `${pitchClass.referenceNoteName} ${pitchClass.centsDeviation > 0 ? '+' : ''}${pitchClass.centsDeviation.toFixed(1)}`
          : `${pitchClass.centsDeviation > 0 ? '+' : ''}${pitchClass.centsDeviation.toFixed(1)}`;
        const centsTextNote = new TextNote({
          text: centsText,
          duration: "q",
        });
        centsTextNote.setLine(18); // Position below English note name
        centsTextNote.setJustification(TextNote.Justification.CENTER);
        centsTextNote.setFont("Readex Pro", 10); // Set smaller font size
        centsTextNotes.push(centsTextNote);
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

    // Create voice for English note names
    const englishNameTextVoice = new Voice({
      numBeats: englishTextNotes.length,
      beatValue: 4,
    });
    englishNameTextVoice.addTickables(englishTextNotes);

    // Create voice for cents deviation text
    const centsTextVoice = new Voice({
      numBeats: centsTextNotes.length,
      beatValue: 4,
    });
    centsTextVoice.addTickables(centsTextNotes);

    const formatter = new Formatter();
    formatter.joinVoices([voice, noteNameTextVoice, englishNameTextVoice, centsTextVoice]).format([voice, noteNameTextVoice, englishNameTextVoice, centsTextVoice], staveWidth - 20);
    
    voice.draw(context, stave);
    noteNameTextVoice.draw(context, stave);
    englishNameTextVoice.draw(context, stave);
    centsTextVoice.draw(context, stave);
  };

  return (
    <div className="staff-notation" style={{ direction: 'ltr' }}>
      <div ref={containerRef} className="staff-notation__container" />
    </div>
  );
}
