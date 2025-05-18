# 13 May 2025
- Clean the code plus add README and documentation

# 15 May 2025
- Sayr: Control Input Error
- Add Source Auto-Input Button to Sayr Manager:

Creator (English): Al-Shawwā, Sāmī
Creator (Arabic): الشوّا، سامي
Source (English): Al-Qawa’id Al-Faniyya Fi Al-musica Al-Sharqiyyah Wal Gharbiyyah. Cairo: Jibra’īl Jabrā.
Source (Arabic): القواعد الفنية في الموسيقى الشرقيّة والغربيّة
Year: 1946

- Add Sayr ID to URL Parameters
- Display how many possible maqamat and ajnas in each tuning system as x/y
- In each Jins and Maqam Button, display number of possible transpositions. If not fractions, use default cents tolerance which should be 5 cents
- Add Suyur Select Buttons to Sayr Manager
- Deploy Playback Patterns input and functionality based on Cells and SCALE DEGREES (which are different from pitch classes) in a manner similar to Sayr input. Don't forget to include RESTS and durations 32n, 32t, 32d, 16n, 16t, 16d, 8n, 8t, 8d, 4n, 4t, 4d, 2n, 2t, 2d, 1n, 1t, 1d

function dottedQuarterDuration(bpm) {
  return  (60 / bpm) * 1.5;
}

- Saving Starting Note Name, should also save or updated the Tuning System
- Add Play Selected Sequence Button 

# 17 May 2025
- We need to be able to define a unique reference frequency for each tuning system starting note name. Currently we are using yegāh, 'ushayrān and rāst, but we should be able to define the reference freuqency for any starthing note name. 

This is for comparitive purpouses, for example: to hear the exact difference in tuning between a jins rast rendered from yegāh as a starting note name, versus 'ushayrān as a starting note name, yegāh and 'ushayrān need to have different yet relative frequency values. 


# ROADMAP FEATURES