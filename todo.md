# 13 May 2025
- Clean the code plus add README and documentation

# 15 May 2025
- Add Sayr ID to URL Parameters

- In each Jins and Maqam Button, display number of possible transpositions. If not fractions, use default cents tolerance which should be 5 cents

- Deploy Playback Patterns input and functionality based on Cells and SCALE DEGREES (which are different from pitch classes) in a manner similar to Sayr input. Don't forget to include RESTS and durations 32n, 32t, 32d, 16n, 16t, 16d, 8n, 8t, 8d, 4n, 4t, 4d, 2n, 2t, 2d, 1n, 1t, 1d

function dottedQuarterDuration(bpm) {
  return  (60 / bpm) * 1.5;
}

- Saving Starting Note Name, should also save or updated the Tuning System

- Add Play Selected Pitch Classes Button under Octave 3 but not in its collapsable <div>

# 17 May 2025
- We need to be able to define a unique reference frequency for each tuning system starting note name. Currently we are using yegāh, 'ushayrān and rāst, but we should be able to define the reference freuqency for any starthing note name. 

This is for comparitive purpouses, for example: to hear the exact difference in tuning between a jins rast rendered from yegāh as a starting note name, versus 'ushayrān as a starting note name, yegāh and 'ushayrān need to have different yet relative frequency values. 

- add control to collapsable octave tabs so that we can automate them. For example if user selects a jins or maqam transposition that's in an octave which is closed, it would be forced open

- I want to add sources for each jins and each maqam in the database. Each jins and each maqam will likely have multiple sources, therefore each will need to be able to accept multiple sources. With this in mind (and my previous request for adding Source Auto-Input to the Sayr Manager which is commented out below) maybe it's better that we crea  graphy List Dropdown menu, and only manually input the relevant page number(s) plus Comments English and Comments Arabic.

Let's discuss this so we can figure out the best way to implement it. 

I added a bibliography.html to the khyam folder, this is the format of the form for a book entry.
For an article we would need to add:

Title of article
Journal
Date
Volume number
Issue number
Page range
DOI
Article URL


<!-- 
- Add Source Auto-Input Button to Sayr Manager:

Creator (English): Al-Shawwā, Sāmī
Creator (Arabic): الشوّا، سامي
Source (English): Al-Qawa’id Al-Faniyya Fi Al-musica Al-Sharqiyyah Wal Gharbiyyah. Cairo: Jibra’īl Jabrā.
Source (Arabic): القواعد الفنية في الموسيقى الشرقيّة والغربيّة
Year: 1946

- Add Suyur Select Buttons to Sayr Manager
 -->

# 20 May 2025
- MIDI INPUT BUG: When setting MIDI Input playback to "Selection" the notes and mappings only work for the first selection and then stick to it, they don't update when I select a different jins or maqam. NOTE: This doesn't apply to QWERTY keyboard playback, only MIDI.

- Create new tuning system IDs for each tuning system and unify their number format so that tuning systems inputted in the future will auto number according to same number format

- Disable QWERTY playback when cursor is in a text field or text area

- Disable QWERTY playback when keys are used in combination with Shift, Option, Control (not sure what this is called on PC), or Command (control on PC)

- Add Scale Degrees Row to Maqam Analysis and 
- Add row in tuning system table for "Fret Division" which calculates where a fret should be according to the string length: full string length minus string length of the pitch class. First cell (Fret Division 0) would always be 0 because its open string, second cell (Fret Division 1) would be full string length minus string length of that pitch class, etc...

- Add check boxes in Octave 1 header to show/hide rows in tuning system table. One check box per row name. For now include all rows. The check boxes selection should apply to all octaves, but only show it on Octave 1.

- When Octave is collapsed force showing pitch class and note name rows

- Default note naming convention should be based on Al-Kindi 12 tone system and naming convention

- Check why yegah starting note name always saves with tuning system even if the starting note name is changed before initial first time save 

- // only sequences starting in octave 1 or 2
  const filteredAscendingSequences = ascendingSequences.filter((seq) => {
    const oct = seq[0].octave;
    return oct !== 3;
  });
  // TODO: DO THIS FOR API ALSO

- Maqam Analysis and Transpositions: Add row of which ajnas exist within teh currently selected maqam. Add a second row underneath with a play jins button and a highlight jins button which highlights the relevant cells in the table.

- In maqam analysis and transpositions, highlight the notes that are different between ascending and descending

- Create New Jins and Create New Maqām functions are producing an error:
Unhandled Runtime Error

TypeError: Cannot read properties of undefined (reading 'noteName')

Source
src/components/jins-transpositions.tsx (130:69) @ noteName

  128 |                 }}
  129 |               >
> 130 |                 {`${selectedJins.getName()} al-${jinsCellDetails[0].noteName}`}
      |                                                                     ^
  131 |               </button>
  132 |             </th>
  133 |             <th className="jins-transpositions__header">

  Source
src/components/maqam-transpositions.tsx (211:151) @ noteName

  209 |                 }}
  210 |               >
> 211 |                  <PlayCircleIcon className="maqam-transpositions__play-circle-icon" /> {`${selectedMaqam.getName()} al-${ascendingMaqamCellDetails[0].noteName}`}
      |                                                                                                                                                       ^
  212 |               </button>
  213 |               <button
  214 |                 className="maqam-transpositions__button"

- Find a way to separate the accidental in the English Note Name so it can be used for other purposes. i.e. C# or Bb or B-- or G+

- Add staff notation to ajnas and maqamat based on English Note Names or Midi Note Numbers (without decimal) including transpositions using VexFLow: https://github.com/0xfe/vexflow which already includes "microtonal" accidentals using saggital (see "const accidentals" here: https://github.com/0xfe/vexflow/blob/master/src/tables.ts)


# ROADMAP FEATURES
- Compare Ajnas/Maqamat from different tuning systems: How to implement?

- Compare multiple suyur for each maqam: How to implement?