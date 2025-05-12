
 # 21 Apr 2025

 - Jins and Maqam transpositions tables: if the original tuning system value is not fractions, always use original value to calculate the intervals, but add an extra row which is all only cents (values and calculated intervals)

 - Maqam manager: Change functionality of saving ascending and descending. Currently I have to select the boxes twice, once for ascending and again for descending. Let's go back to having two buttons: "save ascending" and "save descending", and add a function that when ascending is saved, automaticaly inverts the sequence and saves it as descending. This relieves additional input that is duplicated if a maqam is the same both ascending and descending, plus makes sure that the descending values in the json are never empty. If there is a need to save a different descending sequence, I can just select the maqam and change the few values that are different for the descent, then click "save descending" to update the values already stored. 

 - Playback: extend keyboard playback to allow descending maqam to be played on "qwertyuiop[]" row. Leftmost key (q) should be the lowest note

//future steps
-open the api endpoint to receive all tuning systems, maqamat and ajnas
-show transpositions in api endpoint
-more waveforms
-work on styling (colors and layout)
-