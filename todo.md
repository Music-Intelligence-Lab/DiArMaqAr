
 # 21 Apr 2025

 - Playback: extend keyboard playback to allow descending maqam to be played on "qwertyuiop[]" row. Leftmost key (q) should be the lowest note


# 13 May 2025
- Check volume slider distortion/value scaling
- Add Midi Output Calibration for Pitch Bend Range (https://isartum.net/leimma/68/refpitch/G3-55/tuningsystem/1r1_1r1~256r243~18r17~162r149~54r49~9r8~32r27~81r68~27r22~81r64~4r3s4r3_1r1~256r243~18r17~162r149~54r49~9r8~32r27~81r68~27r22~81r64~4r3s16r9_1r1~256r243~18r17~162r149~54r49~9r8~32r27~81r68s64r27_1r1s256r81_1r1s1024r243_1r1/scale/138/solfege/0~10~0~1s0~0~10~1s0~5~13~1s0~8~16~1s1~5~3~ts1~10~7~1s1~8~6~1s0~7~15~2)
- If possible, add MIDI input
- MIDI INput Mapping: MMap according to English note names and MIDI keyboard (A4 = midi note 69), for flats and sharps, anything not "full flat" i.e. E-b, A-b, B-b map to natural, map all sharps to the sharp (C-#)
- API: add which ajnas and maqamat work within each tuning system + add transpositions (which will need a maqam or a jins ID input) + think about all REQUEST options (cents tolerance)
- Clean the code plus add README and documentation