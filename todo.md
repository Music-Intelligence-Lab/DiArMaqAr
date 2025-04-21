17 Apr 2025
- Add ID and URL parameters for ajnas and maqamat
- Add URL parameter for starting note name yegāh or 'ushayran. Currently if a jins is selected and then the starting note name is changed, everything resets. By adding this to the URL parameters it should work better
- Add play selected checkboxes sequence button (for now ascending and descending including the highest note repeated)
- Data of analysis and transpositions table should include following rows: AR note names, EN note names, pitch class input type values and intervals, cents values and intervals.


 # 21 Apr 2025
 - Jins and Maqam transpositions table: change the format of the table so that each value is in its own cell (name, value, interval):

 | jins ʿajam al-rāst | rāst  |         | dūgāh |       | buselīk/ʿushshāq |           | chahargāh |
 |                    | 32/27 | (9:8)   | 4/3   | (9:8) | 3/2              | (256:243) | 128/81    |

 - Jins and Maqam transpositions tables: add english note name next to arabic note name in brackets. i.e. rast (C), iraq (B-b)
 - Jins and Maqam transpositions tables: if the original tuning system value is not fractions, always use original value to calculate the intervals, but add an extra row which is all only cents (values and calculated intervals)

 - Tuning system manager: make collapsable like octaves
 - Tuning system octave tables: if a checkbox is selected, change colour of entire column 
 - Tuning system octave tables: add a new row for MIDI note numbers and display the values to 2 decimal places (but make sure calculation isn't clipped to two decimal places)

 function frequencyToMidiNoteNumber(frequency: number): number {
  const midi = 69 + 12 * Math.log2(freq / 440);
  return midiNoteNumber;
}

 - Tuning system octave tables: change order of rows so that values are: fraction, cents, string length, decimal, midi note number frequency


 - Maqam manager: Change functionality of saving ascending and descending. Currently I have to select the boxes twice, once for ascending and again for descending. Let's go back to having two buttons: "save ascending" and "save descending", and add a function that when ascending is saved, automaticaly inverts the sequence and saves it as descending. This relieves additional input that is duplicated if a maqam is the same both ascending and descending, plus makes sure that the descending values in the json are never empty. If there is a need to save a different descending sequence, I can just select the maqam and change the few values that are different for the descent, then click "save descending" to update the values already stored. 

 - Playback: add volume slider
 - Playback: extend playable keyboard keys to remainder of "asdf" row (semicolon, apostraphe, backslash)
 - Playback: extend keyboard playback to allow descending maqam to be played on "qwertyuiop[]" row. Leftmost key (q) should be the lowest note
 - Playback: note length should be determind by holding keyboard key down, not fixed note length