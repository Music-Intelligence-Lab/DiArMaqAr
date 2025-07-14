"use client";

import React, { useRef, useEffect } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from 'vexflow';
import { getEnglishNoteName } from '@/functions/noteNameMappings';
import PitchClass from '@/models/PitchClass';

interface StaffNotationProps {
  pitchClasses: PitchClass[];
  clef?: 'treble' | 'bass' | 'alto' | 'tenor';
}

export default function StaffNotation({
  pitchClasses,
  clef = 'treble'
}: StaffNotationProps) {
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
    
    const accidental = cleanName.slice(1);
    
    return {
      letter: noteLetter,
      accidental: accidental
    };
  };

  const mapAccidentalToVexFlow = (accidental: string) => {
    switch (accidental) {
      case '#': return '#';
      case '##': return '##';
      case 'b': return 'b';
      case 'bb': return 'bb';
      case 'n': return 'n';
      default: return '';
    }
  };

  const renderStaff = () => {
    if (!containerRef.current) return;

    const notesCount = pitchClasses.filter(pc => {
      const englishName = pc.englishName || getEnglishNoteName(pc.noteName);
      return englishName && englishName !== '--';
    }).length;
    
    const noteWidth = 60;
    const staveMargin = 40;
    const rightMargin = 40;
    const calculatedWidth = Math.max(200, staveMargin + (notesCount * noteWidth) + rightMargin);
    
    const calculatedHeight = 220;

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
          return;
        }
        
        const parsed = parseNote(englishName);
        if (!parsed) {
          return;
        }

        const octave = pitchClass.octave || 4;
        
        const noteSpec = `${parsed.letter.toLowerCase()}/${octave}`;
        
        const staveNote = new StaveNote({
          clef: clef,
          keys: [noteSpec],
          duration: 'q'
        });

        if (parsed.accidental && parsed.accidental !== '') {
          const vexFlowAccidental = mapAccidentalToVexFlow(parsed.accidental);
          if (vexFlowAccidental) {
            staveNote.addModifier(new Accidental(vexFlowAccidental), 0);
          }
        }

        vexFlowNotes.push(staveNote);
      } catch (error) {
        console.warn(`Could not create note for ${pitchClass.noteName}:`, error);
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
