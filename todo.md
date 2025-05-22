# 13 May 2025
- Clean the code plus add README and documentation

# 15 May 2025

- Saving Starting Note Name, should also save or updated the Tuning System

# 17 May 2025
- We need to be able to define a unique reference frequency for each tuning system starting note name. Currently we are using yegāh, 'ushayrān and rāst, but we should be able to define the reference freuqency for any starthing note name. 

This is for comparitive purpouses, for example: to hear the exact difference in tuning between a jins rast rendered from yegāh as a starting note name, versus 'ushayrān as a starting note name, yegāh and 'ushayrān need to have different yet relative frequency values. 

- I want to add sources for each jins and each maqam in the database. Each jins and each maqam will likely have multiple sources, therefore each will need to be able to accept multiple sources. With this in mind (and my previous request for adding Source Auto-Input to the Sayr Manager which is commented out below) maybe it's better that we crea  graphy List Dropdown menu, and only manually input the relevant page number(s) plus Comments English and Comments Arabic.


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

- Add row in tuning system table for "Fret Division" which calculates where a fret should be according to the string length: full string length minus string length of the pitch class. First cell (Fret Division 0) would always be 0 because its open string, second cell (Fret Division 1) would be full string length minus string length of that pitch class, etc...

- Add check boxes in Octave 1 header to show/hide rows in tuning system table. One check box per row name. For now include all rows. The check boxes selection should apply to all octaves, but only show it on Octave 1.

- When Octave is collapsed force showing pitch class and note name rows

- Default note naming convention should be based on Al-Kindi 12 tone system and naming convention

- Check why yegah starting note name always saves with tuning system even if the starting note name is changed before initial first time save 

- Maqam Analysis and Transpositions: Add row of which ajnas exist within teh currently selected maqam. Add a second row underneath with a play jins button and a highlight jins button which highlights the relevant cells in the table.

- Find a way to separate the accidental in the English Note Name so it can be used for other purposes. i.e. C# or Bb or B-- or G+

- Add staff notation to ajnas and maqamat based on English Note Names or Midi Note Numbers (without decimal) including transpositions using VexFLow: https://github.com/0xfe/vexflow which already includes "microtonal" accidentals using saggital (see "const accidentals" here: https://github.com/0xfe/vexflow/blob/master/src/tables.ts). For this we will need to be able to separate the accidental in the English note name so we can use it to access the correct accidental in vexflow. 

# 21 May 2025
- New IDs are too long and complicated, unnecessary. Will be annoying for API usage. Keep it simple numbers (like maqam ID).
- Bibliography: in my original note there was info about different fields needed for Type: Article, but those aren't implemented :(
  - Change names and 
    "Release Date" to "Publication Date"
    "Original Release Date" to "Original Publication Date"
    "Location" to "Place" 
    "Digitized" Book URL to URL

  - If Type: Article is selected 
  show input fields:
    Journal (EN/AR)
    Volume (EN/AR)
    Issue (EN/AR)
    Page Range (EN/AR)
    DOI (EN only - this is similar to ISBN)

  hide input fields:
    Publisher (EN/AR)
    Place (EN/AR)
    Publication Date (AR/EN) - Keep Original Publication Date
    ISBN
    
- Spelling: Sayr/Suyūr

- Transpositions table: we need a way to differentiate which transpositions are from which octave. Ideally with colour/styling. Please add something to code and then we can play with some ideas.

- Add these synth types to our "waveform" select. All data is opensource we will just need to credit:
https://github.com/xenharmonic-devs/scale-workshop/blob/main/src/synth.ts


# ROADMAP FEATURES
- Compare Ajnas/Maqamat from different tuning systems: How to implement?

- Compare multiple suyur for each maqam: How to implement?