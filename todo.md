
 # 21 Apr 2025

 - Jins and Maqam transpositions tables: if the original tuning system value is not fractions, always use original value to calculate the intervals. Also, always add an extra row of cents (values and calculated intervals).

 - Maqam manager: Change functionality of saving ascending and descending. Currently I have to select the boxes twice, once for ascending and again for descending. Let's go back to having two buttons: "save ascending" and "save descending", and add a function that when ascending is saved, automaticaly inverts the sequence and saves it as descending. This relieves additional input that is duplicated if a maqam is the same both ascending and descending, plus makes sure that the descending values in the json are never empty. If there is a need to save a different descending sequence, I can just select the maqam and change the few values that are different for the descent, then click "save descending" to update the values already stored. 

 - Playback: extend keyboard playback to allow descending maqam to be played on "qwertyuiop[]" row. Leftmost key (q) should be the lowest note

//future steps
-open the api endpoint to receive all tuning systems, maqamat and ajnas
-show transpositions in api endpoint
-more waveforms
-work on styling (colors and layout)
-

# 13 May 2025
- When loading tuning system, automatically load with 'ushayran as starting note name. If ushayran doesn't exist, use yegāh, and if yegāh doesn't exist, use the first one
- Check starting note name URL parameter, might be better to have a number instead of extra characters
- Allow keyboard playback regardless of window/frame focus
- Check volume slider distortion/value scaling
- Default synth waveform to triangle
- Add Midi Output Calibration for Pitch Bend Range (https://isartum.net/leimma/68/refpitch/G3-55/tuningsystem/1r1_1r1~256r243~18r17~162r149~54r49~9r8~32r27~81r68~27r22~81r64~4r3s4r3_1r1~256r243~18r17~162r149~54r49~9r8~32r27~81r68~27r22~81r64~4r3s16r9_1r1~256r243~18r17~162r149~54r49~9r8~32r27~81r68s64r27_1r1s256r81_1r1s1024r243_1r1/scale/138/solfege/0~10~0~1s0~0~10~1s0~5~13~1s0~8~16~1s1~5~3~ts1~10~7~1s1~8~6~1s0~7~15~2)
- If possible, add MIDI input
- MIDI INput Mapping: MMap according to English note names and MIDI keyboard (A4 = midi note 69), for flats and sharps, anything not "full flat" i.e. E-b, A-b, B-b map to natural, map all sharps to the sharp (C-#)
- Make all output sounds go through audio card
- API: add which ajnas and maqamat work within each tuning system + add transpositions (which will need a maqam or a jins ID input) + think about all REQUEST options (cents tolerance)
- Clean the code plus add README and documentation
- Extend Arabic to English note name mappings according to the following:

  "qarār yegāh",
  "qarār qarār nīm ḥiṣār",
  "qarār shūrī",
  "qarār qarār ḥiṣār",
  "qarār qarār tīk ḥiṣār/shūrī",
  "qarār nīm ʿushayrān",
  "qarār ʿushayrān",
  "qarār nīm ʿajam ʿushayrān",
  "qarār ʿajam ʿushayrān",
  "qarār nairūz",
  "qarār tīk ʿajam ʿushayrān",
  "qarār ʿirāq",
  "qarār rahāwī",
  "qarār nīm kawasht/rahāwī",
  "qarār kawasht",
  "qarār tīk kawasht",
  "qarār rāst",
  "qarār nīm zirguleh",
  "qarār zirguleh",
  "qarār tīk zirguleh",
  "qarār dūgāh",
  "qarār nīm kurdī/nahāwand",
  "qarār nahāwand",
  "qarār kurdī",
  "qarār tīk kūrdī",
  "qarār segāh",
  "qarār nīm buselīk",
  "qarār buselīk/ʿushshāq",
  "qarār tīk buselīk",
  "qarār chahargāh",
  "qarār tīk chahargāh",
  "qarār nīm ḥijāz",
  "qarār ṣabā",
  "qarār ḥijāz",
  "qarār tīk ḥijāz/ṣabā",
  "nīm yegāh",	


These are the octave note names for octave 0,

export const arabicToEnglishNoteMapping: Record<string, string> = {
  
  
  yegāh: "G",
  "qarār nīm ḥiṣār": "Ab-",
  "qarār ḥiṣār": "Ab",
  "qarār tīk ḥiṣār/shūrī": "Ab+",
  "nīm ʿushayrān": "A-",
  ʿushayrān: "A",
  "nīm ʿajam ʿushayrān": "Bb-",
  "ʿajam ʿushayrān": "Bb",
  "tīk ʿajam ʿushayrān": "Bb+",
  ʿirāq: "B-b",
  "nīm kawasht": "B-",
  kawasht: "B",
  "tīk kawasht": "B+",
  rāst: "C",
  "tīk rāst": "C+",
  "nīm zirguleh": "C-#",
  zirguleh: "C#",
  "tīk zirguleh": "C#+",
  dūgāh: "D",
  "nīm kurdī/nahāwand": "D+",
  kurdī: "Eb",
  "tīk kūrdī": "Eb+",
  segāh: "E-b",
  "nīm buselīk": "E-",
  "buselīk/ʿushshāq": "E",
  "tīk buselīk": "E+",
  chahargāh: "F",
  "tīk chahargāh": "F+",
  "nīm ḥijāz": "F-#",
  ḥijāz: "F#",
  "tīk ḥijāz/ṣabā": "F#+",
  "nīm nawā": "g-",
  nawā: "g",
  "nīm ḥiṣār": "ab-",
  ḥiṣār: "ab",
  "tīk ḥiṣār": "ab+",
  "nīm ḥuseinī": "a-",
  ḥuseinī: "a",
  "nīm ʿajam": "bb-",
  ʿajam: "bb",
  "tīk ʿajam": "bb+",
  awj: "b-b",
  "nīm māhūr": "b-",
  māhūr: "b",
  "tīk māhūr": "b+",
  kurdān: "c",
  "tīk kurdān": "c+",
  "nīm shahnāz": "c-#",
  shahnāz: "c#",
  "jawāb tīk zirguleh": "c#+",
  muḥayyar: "d",
  "nīm sunbuleh": "d+",
  "sunbuleh/zawāl": "eb",
  "jawāb tīk kūrdī": "eb+",
  buzurk: "e-b",
  "jawāb nīm buselīk": "e-",
  "jawāb buselīk": "e",
  "jawāb tīk buselīk": "e+",
  mahurān: "f",
  "tīk mahurān": "f+",
  "jawāb nīm ḥijāz": "f-#",
  "jawāb ḥijāz": "f#",
  "jawāb tīk ḥijāz": "f#+",
  "nīm saham/ramal tūtī": "g-",
}
