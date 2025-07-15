"use client";

import React, { useRef, useEffect } from 'react';
import { octaveOneNoteNames } from '@/models/NoteName';
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from 'vexflow';
import { getEnglishNoteName } from '@/functions/noteNameMappings';
import PitchClass from '@/models/PitchClass';
  // Import selectedTuningSystem from context
  import useAppContext from '@/contexts/app-context';


interface StaffNotationProps {
  pitchClasses: PitchClass[];
  clef?: 'treble' | 'bass' | 'alto' | 'tenor';
}

export default function StaffNotation({
  pitchClasses,
  clef = 'treble'
}: StaffNotationProps) {
  const { selectedTuningSystem, selectedIndices } = useAppContext();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !pitchClasses.length) return;

    containerRef.current.innerHTML = '';

    try {
      renderStaff();
    } catch (error) {
      console.error('Error rendering staff notation:', error);
      if (containerRef.current) {
        containerRef.current.innerHTML = '<div style="text-align: center; font-size: 14px; color: #666; padding: 20px;">Unable to display staff notation</div>';
      }
    }
  }, [pitchClasses, clef]);

  const parseNote = (englishName: string) => {
    if (!englishName || englishName === '--') return null;
    
    const cleanName = englishName.trim().toUpperCase();
    
    const noteLetter = cleanName.charAt(0);
    if (!'CDEFGAB'.includes(noteLetter)) {
      return null;
    }
    
    const accidental = cleanName.slice(1).toLowerCase();
    
    return {
      letter: noteLetter,
      accidental: accidental
    };
  };

  const mapAccidentalToVexFlow = (accidental: string) => {
    switch (accidental) {
    case "--": return "b";
      case "-": return "b";
      case "+": return "n";
      case "++": return "n";
      case "b--": return "b";
      case "-b": return "bs";
      case "-#": return "+"; // fallback, or custom if needed
      case "b": return "b";
      case "#": return "#";
      case "bb": return "b";
      case "n": return "n";
      case "b+": return "b";
      case "#-": return "#";
      case "#+": return "#";
      default: return "";
    }
  };


  const renderStaff = () => {
    if (!containerRef.current) return;

    const notesCount = pitchClasses.filter(pc => {
      const englishName = pc.englishName || getEnglishNoteName(pc.noteName);
      return englishName && englishName !== '--';
    }).length;
    
    const noteWidth = 60;
    const staveMargin = 0;
    const rightMargin = 40;
    const calculatedWidth = Math.max(200, staveMargin + (notesCount * noteWidth) + rightMargin);
    const calculatedHeight = 150;

    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
    renderer.resize(calculatedWidth, calculatedHeight);
    const context = renderer.getContext();

    const staveY = 0;
    const staveWidth = calculatedWidth - staveMargin - 20;
    const stave = new Stave(staveMargin, staveY, staveWidth);
    stave.addClef(clef);
    stave.setContext(context).draw();

    const vexFlowNotes: StaveNote[] = [];
    
    pitchClasses.forEach((pitchClass) => {
      try {
        const englishName = pitchClass.englishName || getEnglishNoteName(pitchClass.noteName);
        if (!englishName || englishName === '--') {
          console.log('[StaffNotation] Skipping invalid pitchClass:', pitchClass);
          return;
        }
        const parsed = parseNote(englishName);
        if (!parsed) {
          console.log('[StaffNotation] parseNote failed for:', englishName, 'pitchClass:', pitchClass);
          return;
        }

        const noteLetters = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        let octave = 3;
        let startingNote = 'C';
        if (
          selectedTuningSystem &&
          typeof selectedTuningSystem.getTitleEnglish === 'function' &&
          Array.isArray(selectedIndices) &&
          selectedIndices.length > 0
        ) {
          startingNote = getEnglishNoteName(octaveOneNoteNames[selectedIndices[0]]).toUpperCase();
        }
        if (typeof pitchClass.octave === 'number') {
          const noteLetter = parsed.letter.toUpperCase();
          // Find all notes from startingNote up to B
          const startIdx = noteLetters.indexOf(startingNote);
          const lowerOctaveNotes = startIdx === -1 ? [] : noteLetters.slice(startIdx);
          // If note is in lowerOctaveNotes, subtract 1 from octave
          octave = 3 + pitchClass.octave;
          if (lowerOctaveNotes.includes(noteLetter)) {
            octave = 4;
          }
        }

        const noteSpec = `${parsed.letter.toLowerCase()}/${octave}`;
        console.log('[StaffNotation] Note debug:', {
          pitchClass,
          englishName,
          parsed,
          octave,
          noteSpec
        });
        const staveNote = new StaveNote({
          clef: clef,
          keys: [noteSpec],
          duration: 'q',
          autoStem: true,

        });
        if (parsed.accidental && parsed.accidental !== '') {
          const vexFlowAccidental = mapAccidentalToVexFlow(parsed.accidental);
          console.log('[StaffNotation] Accidental debug:', {
            pitchClass,
            englishName,
            accidental: parsed.accidental,
            mapped: vexFlowAccidental
          });
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
        containerRef.current.innerHTML = '<div style="text-align: center; font-size: 14px; color: #666; padding: 20px;">No valid notes to display</div>';
      }
      return;
    }

    const voice = new Voice({
      numBeats: vexFlowNotes.length,
      beatValue: 4
    });
    voice.addTickables(vexFlowNotes);

    const formatter = new Formatter();
    formatter.joinVoices([voice]).format([voice], staveWidth - 20);
    voice.draw(context, stave);
  };

  return (
    <div className="staff-notation">
      <div 
        ref={containerRef} 
        className="staff-notation__container"
      />
    </div>
  );
}
