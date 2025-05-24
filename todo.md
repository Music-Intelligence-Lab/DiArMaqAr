# 13 May 2025
- Clean the code plus add README and documentation


# 17 May 2025

# 20 May 2025

- When Octave is collapsed force showing pitch class and note name rows

- Default note naming convention should be based on Al-Kindi 12 tone system and naming convention

- Check why yegah starting note name always saves with tuning system even if the starting note name is changed before initial first time save 

- Maqam Analysis and Transpositions: Add row of which ajnas exist within the currently selected maqam. Add a second row underneath with a play jins button and a highlight jins button which highlights the relevant cells in the table.

- Find a way to separate the accidental in the English Note Name so it can be used for other purposes. i.e. C# or Bb or B-- or G+

- Add staff notation to ajnas and maqamat based on English Note Names or Midi Note Numbers (without decimal) including transpositions using VexFLow: https://github.com/0xfe/vexflow which already includes "microtonal" accidentals using saggital (see "const accidentals" here: https://github.com/0xfe/vexflow/blob/master/src/tables.ts). For this we will need to be able to separate the accidental in the English note name so we can use it to access the correct accidental in vexflow. 

# 21 May 2025
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
    
- Transpositions table: we need a way to differentiate which transpositions are from which octave. Ideally with colour/styling. Please add something to code and then we can play with some ideas.

- Add these synth types to our "waveform" select. All data is opensource we will just need to credit them somewhere:
https://github.com/xenharmonic-devs/scale-workshop/blob/main/src/synth.ts

# 22 May 2025
- Patterns Input: add roman numerals with minus sign for lower octave and with plus sign for upper octaves i.e. VII-, I+

- Patterns Playback: There is currently a problem with the playback when it reaches the octave and starts descending. Before fixing it, we need to think in more detail about the logic of different patters and how they deal with the Root note and the Octave.

Currently the pattern playback only continues ascending until the last note of the pattern is the octave. Instead it should continue until the first note of the pattern is the octave (VIII), and then start its descent. When descending, it should end when the first note of the pattern reaches the Root (I). BUT this only works for patterns that START from the Root (I). This means we need to detect certain info about the pattern and then implement the behaviour of how to deal with reaching the octave accordingly.

- Please check Ajnas and Maqamat transposition row numbers, the sequence gets chopped i.e. 1, 2, 4, 5, 6

- For all the buttons that play a pattern, on click change the play symbol to a stop symbol and make the button stop the playback if clicked a second time

- Add extra weights to the fonts used in the site

- MIDI Inputs and Outputs not working 

# 24 May 2025
- Cascading for Note Names has stopped working, and with that the default note names selection when inputting a new tuning system. When fixing remember we have a previous feature request: "Default note naming convention should be based on Al-Kindi 12 tone system and naming convention".

- Problem with Transpositions: if a tuning system doesn't use fractions as Input Type, always use cents to calculate the intervals, transpositions etc... I inputed a new tuning system: Meshshāqa, Mikhā'īl (1899). Choose it and click maqām rāst and then play the transpositions so you can hear the problem: by using string length to calculate the intervals, the results are incorrect (because string length is exponential).

- Fret divisions calculations for first divisions in octaves 2 and 3 not correct, they should include the 2/1 and 4/1 string length plus the division value

- Tuning System Table: Add option to filter Abjad Name

- ⁠Hide the checkbox that controls the "input type" so that we don't have functionality that doesn't do anything (i.e uncheck the box, the row is supposed to disappear but it doesn't)

- Can we put the tuning system table rows filters next to the cascade enable/disable button so that they're easier to access. We want to try to avoid "hidden" settings unless they're "set and forget". 
- Also, make sure Cascade button and Filter checkboxes are hidden when the Octave panel is closed

- remove styling from filter checkboxes

- Bibliography Page: Print saved bibliography under the form. Two columns, one row per source, Arabic in right column, English in left. 

- Saving new maqām does not give it an ID. check maqām soznāk which I saved today.

- Fix Play Jins Buttons in Ajnas Transpositions table: Apologies but I made a mistake whilst formatting and styling the Ajnas transpositions. The Play Jins buttons now only play the original (Taḥlīl) jins notes, not the transposed sequence.

# ROADMAP FEATURES
- Compare Ajnas/Maqamat from different tuning systems: How to implement?

- Compare multiple suyūr for each maqam: How to implement?