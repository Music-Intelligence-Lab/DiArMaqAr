"use client";

import React, { useRef, useEffect } from "react";
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, TextNote } from "vexflow";
import { getEnglishNoteName, getSolfegeFromEnglishName } from "@/functions/noteNameMappings";
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

    // Precompute context-aware english names and solfege for the pitchClasses array.
    // Prefer pitchClasses' own englishName/solfege when already rendered (maqam/jins transpositions).
    const { computedEnglishNames, computedSolfege }: { computedEnglishNames: string[]; computedSolfege: string[] } = (() => {
      const preferredEnglishMap: Record<string, string> = {};
      const preferredSolfegeMap: Record<string, string> = {};
      const contextSeq =
        (selectedMaqam && selectedMaqam.ascendingPitchClasses) ||
        (selectedJins && selectedJins.jinsPitchClasses) ||
        (appSelectedPitchClasses && appSelectedPitchClasses.length >= 2 ? appSelectedPitchClasses : undefined);

      if (contextSeq) {
        const renderedSeq = renderPitchClassSpellings(contextSeq);
        renderedSeq.forEach((pc) => {
          preferredEnglishMap[pc.noteName] = pc.englishName;
          preferredSolfegeMap[pc.noteName] = pc.solfege || getSolfegeFromEnglishName(pc.englishName);
        });
      }

      const englishNames = pitchClasses.map((pc) => {
        if (pc.englishName && /^[A-G][#b]?\d+/.test(pc.englishName)) {
          return pc.englishName;
        }
        return preferredEnglishMap[pc.noteName] || getEnglishNoteName(pc.noteName);
      });

      const solfegeNames = pitchClasses.map((pc, idx) => {
        if (pc.solfege && pc.solfege !== "--") return pc.solfege;
        return preferredSolfegeMap[pc.noteName] || getSolfegeFromEnglishName(englishNames[idx]);
      });

      return { computedEnglishNames: englishNames, computedSolfege: solfegeNames };
    })();

    const notesCount = computedEnglishNames.filter((en) => en && en !== "--").length;

    // Pre-calculate text widths to determine optimal note spacing
    // Create a temporary canvas context for measuring text
    const measureCanvas = document.createElement('canvas');
    const measureCtx = measureCanvas.getContext('2d');
    
    let maxTextWidth = 0;
    
    if (measureCtx) {
      pitchClasses.forEach((pitchClass, idx) => {
        const englishName = computedEnglishNames[idx];
        if (!englishName || englishName === "--") return;

        const pcWithEnglish = { ...pitchClass, englishName };
        const referenceNoteWithOctave = getIpnReferenceNoteNameWithOctave(pcWithEnglish);
        const noteName = getDisplayName(pitchClass.noteName, 'note');
        const centsText = `${referenceNoteWithOctave} ${pitchClass.centsDeviation > 0 ? '+' : ''}${pitchClass.centsDeviation.toFixed(1)}¢`;
        const ipnSolfegeText = `${englishName} / ${computedSolfege[idx]}`;

        measureCtx.font = '10pt "Readex Pro"';
        const noteNameWidth = measureCtx.measureText(noteName).width;
        const centsWidth = measureCtx.measureText(centsText).width;
        const ipnSolfegeWidth = measureCtx.measureText(ipnSolfegeText).width;

        maxTextWidth = Math.max(maxTextWidth, noteNameWidth, centsWidth, ipnSolfegeWidth);
      });
    }
    
    // Use strictly fixed note spacing for visual consistency across all staves
    const fixedNoteSpacing = 120; // Fixed spacing between notes
    
    // Calculate the actual width needed per note based on text
    const textPadding = 40; // Padding around text
    const minWidthNeededForText = maxTextWidth + textPadding;
    
    // Use the larger of fixed spacing or text requirement for the actual rendering width
    const actualNoteWidth = Math.max(fixedNoteSpacing, minWidthNeededForText);
    
    // Calculate staff dimensions first
    const clefAndMarginWidth = 100; // Space needed for clef at the beginning
    const endMargin = - actualNoteWidth + actualNoteWidth / 4; // Minimal margin after the last note
    const notesFormattingWidth = (notesCount - 1) * actualNoteWidth - actualNoteWidth / 4; // Space between notes for formatting
    const staveWidth = clefAndMarginWidth + notesFormattingWidth + endMargin;
    
    // Calculate SVG dimensions to exactly fit the staff (no scaling)
    const leftPadding = 20; // Small padding on left side of SVG
    const rightPadding = 20; // Small padding on right side of SVG
    const calculatedWidth = leftPadding + staveWidth + rightPadding;
    const initialHeight = 500; // Generous initial height

    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
    renderer.resize(calculatedWidth, initialHeight);
    const context = renderer.getContext();

    // Position staff with minimal left padding (no centering needed as SVG is sized to content)
    const staveX = leftPadding;
    const staveY = 50; // Fixed initial position with generous top padding
    const stave = new Stave(staveX, staveY, staveWidth);
    stave.addClef(clef);
    stave.setContext(context).draw();

    // Add "8vb" marking below the treble clef to indicate octave transposition
    context.setFont("Readex Pro", 10, "bold");
    context.fillText("8", staveX + 16, staveY + 105); // Position "8" below the clef, relative to staff position

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
          '<div style="text-align: center; font-size: 12px; color: #666; padding: 20px;">No valid notes to display</div>';
      }
      return;
    }

    // Create voice for staff notes
    const voice = new Voice({
      numBeats: vexFlowNotes.length,
      beatValue: 4,
    });
    voice.addTickables(vexFlowNotes);

    const formatter = new Formatter();
    formatter.joinVoices([voice]).format([voice], staveWidth - 20);
    
    // Draw notes first to get their bounding box
    voice.draw(context, stave);

    // After rendering notes, calculate text positions based on their bounding box
    let textLine1Position = 10;
    let textLine2Position = 15;
    let textLine3Position = 20;

    if (containerRef.current) {
      const svgElement = containerRef.current.querySelector('svg');
      if (svgElement) {
        const notesBBox = svgElement.getBBox();
        const gapBelowNotes = -20;
        const textLineSpacing = 20;

        const notesBottom = notesBBox.y + notesBBox.height;
        const text1Y = notesBottom + gapBelowNotes;
        const text2Y = text1Y + textLineSpacing;
        const text3Y = text2Y + textLineSpacing;

        const staffCenter = staveY + 20;
        textLine1Position = (text1Y - staffCenter) / 10;
        textLine2Position = (text2Y - staffCenter) / 10;
        textLine3Position = (text3Y - staffCenter) / 10;
      }
    }

    // Create text notes: line 1 = Arabic note name, line 2 = cents value, line 3 = IPN / solfege
    const noteNameTextNotes: TextNote[] = [];
    const centsTextNotes: TextNote[] = [];
    const ipnSolfegeTextNotes: TextNote[] = [];

    pitchClasses.forEach((pitchClass, idx) => {
      try {
        const englishName = computedEnglishNames[idx];

        if (!englishName || englishName === "--") return;

        const parsed = parseNote(englishName);

        if (!parsed) return;

        const pcWithEnglish = { ...pitchClass, englishName };
        const referenceNoteWithOctave = getIpnReferenceNoteNameWithOctave(pcWithEnglish);

        // Line 1: Arabic note name (or localized)
        const noteName = getDisplayName(pitchClass.noteName, 'note');
        const noteNameTextNote = new TextNote({
          text: noteName,
          duration: "q",
        });
        noteNameTextNote.setLine(textLine1Position);
        noteNameTextNote.setJustification(TextNote.Justification.CENTER);
        noteNameTextNote.setFont("Readex Pro", 10);
        noteNameTextNotes.push(noteNameTextNote);

        // Line 2: cents value (reference + deviation)
        const centsText = `${referenceNoteWithOctave} ${pitchClass.centsDeviation > 0 ? '+' : ''}${pitchClass.centsDeviation.toFixed(1)}¢`;
        const centsTextNote = new TextNote({
          text: centsText,
          duration: "q",
        });
        centsTextNote.setLine(textLine2Position);
        centsTextNote.setJustification(TextNote.Justification.CENTER);
        centsTextNote.setFont("Readex Pro", 10);
        centsTextNotes.push(centsTextNote);

        // Line 3: IPN / solfege
        const ipnSolfegeText = `${englishName} / ${computedSolfege[idx]}`;
        const ipnSolfegeTextNote = new TextNote({
          text: ipnSolfegeText,
          duration: "q",
        });
        ipnSolfegeTextNote.setLine(textLine3Position);
        ipnSolfegeTextNote.setJustification(TextNote.Justification.CENTER);
        ipnSolfegeTextNote.setFont("Readex Pro", 10);
        ipnSolfegeTextNotes.push(ipnSolfegeTextNote);
      } catch (error) {
        console.warn(`[StaffNotation] Could not create text note for ${pitchClass.noteName}:`, error);
      }
    });

    const noteNameTextVoice = new Voice({
      numBeats: noteNameTextNotes.length,
      beatValue: 4,
    });
    noteNameTextVoice.addTickables(noteNameTextNotes);

    const centsTextVoice = new Voice({
      numBeats: centsTextNotes.length,
      beatValue: 4,
    });
    centsTextVoice.addTickables(centsTextNotes);

    const ipnSolfegeTextVoice = new Voice({
      numBeats: ipnSolfegeTextNotes.length,
      beatValue: 4,
    });
    ipnSolfegeTextVoice.addTickables(ipnSolfegeTextNotes);

    const formatterWidth = notesFormattingWidth;

    formatter.joinVoices([voice, noteNameTextVoice, centsTextVoice, ipnSolfegeTextVoice]).format([voice, noteNameTextVoice, centsTextVoice, ipnSolfegeTextVoice], formatterWidth);

    context.clear();
    stave.setContext(context).draw();
    context.setFont("Readex Pro", 10, "bold");
    context.fillText("8", staveX + 16, staveY + 105);

    voice.draw(context, stave);
    noteNameTextVoice.draw(context, stave);
    centsTextVoice.draw(context, stave);
    ipnSolfegeTextVoice.draw(context, stave);
    
    // Get final bounding box after everything is rendered
    if (containerRef.current) {
      const svgElement = containerRef.current.querySelector('svg');
      if (svgElement) {
        const finalBBox = svgElement.getBBox();
        
        // Add comfortable padding at the bottom
        const bottomPadding = 20;
        
        // Calculate optimal height based on actual rendered content
        const optimalHeight = finalBBox.y + finalBBox.height + bottomPadding;
        
        // Only resize if the new height is significantly different (avoid tiny adjustments)
        if (Math.abs(optimalHeight - initialHeight) > 10) {
          renderer.resize(calculatedWidth, optimalHeight);
        }
      }
    }
  };

  return (
    <div className="staff-notation" style={{ direction: 'ltr' }}>
      <div ref={containerRef} className="staff-notation__container" />
    </div>
  );
}
