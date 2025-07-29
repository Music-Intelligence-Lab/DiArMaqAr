"use client";

import React, { useRef, useEffect } from "react";
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, TextNote } from "vexflow";
import { getEnglishNoteName } from "@/functions/noteNameMappings";
import PitchClass from "@/models/PitchClass";
import midiNumberToNoteName from "@/functions/midiToNoteNumber";
import useLanguageContext from "@/contexts/language-context";

interface StaffNotationProps {
  pitchClasses: PitchClass[];
}

export default function StaffNotation({ pitchClasses }: StaffNotationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const clef = "treble"; // Always use treble clef
  const { language, getDisplayName } = useLanguageContext();

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
        return "#";
      default:
        return "";
    }
  };

  const renderStaff = () => {
    if (!containerRef.current) return;

    const notesCount = pitchClasses.filter((pc) => {
      const englishName = pc.englishName || getEnglishNoteName(pc.noteName);
      return englishName && englishName !== "--";
    }).length;

    const noteWidth = 60;
    const staveMargin = 300;
    const rightMargin = 10;
    const calculatedWidth =  staveMargin + (notesCount * noteWidth) + rightMargin;
    const calculatedHeight = 220; // Increased height to accommodate text notes below

    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
    renderer.resize(calculatedWidth, calculatedHeight);
    const context = renderer.getContext();

    const staveX = 0;
    const staveY = 15;
    const staveWidth = calculatedWidth - rightMargin;
    const stave = new Stave(staveX, staveY, staveWidth);
    stave.addClef(clef);
    stave.setContext(context).draw();

    const vexFlowNotes: StaveNote[] = [];

    pitchClasses.forEach((pitchClass) => {
      try {
        const englishName = pitchClass.englishName || getEnglishNoteName(pitchClass.noteName);

        if (!englishName || englishName === "--") return;

        const parsed = parseNote(englishName);

        if (!parsed) return;

        const midiNoteNumber = Math.round(pitchClass.midiNoteNumber);

        const translatedMidiNote = midiNumberToNoteName(midiNoteNumber);
        const noteLetter = translatedMidiNote.note[0].toLowerCase()

        const noteSpec = `${noteLetter}/${translatedMidiNote.octave}`;

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

    // Create text notes for cents deviation and Arabic note names
    const centsTextNotes: TextNote[] = [];
    const arabicTextNotes: TextNote[] = [];

    pitchClasses.forEach((pitchClass) => {
      try {
        const englishName = pitchClass.englishName || getEnglishNoteName(pitchClass.noteName);

        if (!englishName || englishName === "--") return;

        const parsed = parseNote(englishName);

        if (!parsed) return;

        // Create a text note for note name (Arabic or English based on language)
        const noteName = getDisplayName(pitchClass.noteName, 'note');
        console.log('Language:', language, 'Note name:', noteName, 'Original:', pitchClass.noteName); // Debug log
        const noteNameTextNote = new TextNote({
          text: noteName,
          duration: "q",
        });
        noteNameTextNote.setLine(13); // Position above cents deviation
        noteNameTextNote.setJustification(TextNote.Justification.CENTER);
        noteNameTextNote.setFont("Readex Pro", 10); // Set smaller font size
        arabicTextNotes.push(noteNameTextNote);

        // Create a text note for cents deviation
        const centsText = pitchClass.centsDeviation.toFixed(1) + "¢";
        const centsTextNote = new TextNote({
          text: centsText,
          duration: "q",
        });
        centsTextNote.setLine(15); // Position below note name
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

    // Create voice for note names (Arabic/English based on language)
    const noteNameTextVoice = new Voice({
      numBeats: arabicTextNotes.length,
      beatValue: 4,
    });
    noteNameTextVoice.addTickables(arabicTextNotes);

    // Create voice for cents deviation text
    const centsTextVoice = new Voice({
      numBeats: centsTextNotes.length,
      beatValue: 4,
    });
    centsTextVoice.addTickables(centsTextNotes);

    const formatter = new Formatter();
    formatter.joinVoices([voice, noteNameTextVoice, centsTextVoice]).format([voice, noteNameTextVoice, centsTextVoice], staveWidth - 20);
    
    voice.draw(context, stave);
    noteNameTextVoice.draw(context, stave);
    centsTextVoice.draw(context, stave);
  };

  return (
    <div className="staff-notation" style={{ direction: 'ltr' }}>
      <div ref={containerRef} className="staff-notation__container" />
    </div>
  );
}
