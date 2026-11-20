# Change Log

Major changes and additions to the Digital Arabic Maqām Archive, both new features and new data entered from the sources. The newest entry comes first.

<!--
This file is the single source of the change log. GitHub shows it as it is,
and the app's /changelog page is built from it, so edit it here only.

It follows Keep a Changelog (https://keepachangelog.com/en/1.1.0/), dated
rather than versioned since the archive has no version numbers:

  ## YYYY-MM-DD — Title         one entry per release, newest first
  One summary paragraph (optional).
  ### Added                     then any of: Added, Changed, Deprecated,
  - **Name.** Explanation.        Removed, Fixed, Security, in that order

Each item opens with its name in bold, ending in a full stop, and is explained
in the plain register of the source-comment style guide: short sentences, Arabic
terms glossed in brackets on first use, no colons or semicolons, and one worked
example with real note names, ratios and cents where an example helps. Links use
[text](url). Record features and new data ingested from the sources; leave out
small fixes and revisions. The build stops on any heading outside this shape.
-->

## 2026-11-20 — The strings view

A tanghīm (tuning system) can now be shown as divisions on the strings of an instrument as well as in its original tables. The documentation explains the strings view in [Viewing a Tanghīm](https://diarmaqar.net/docs/guide/tuning-systems#viewing-a-tanghim-jadawel-and-awtar). A brief overview follows below.

### Added

- **Strings view.** Choosing Awtār (strings) under View in the archive draws every pitch class of the tanghīm as a division on each string, at the point where the string is stopped to sound that pitch class. For example, see [Ibn Sīnā (1037) in the strings view](https://diarmaqar.net/en/app?tuningSystem=ibnsina_1037&startingNoteName=ushayran&refFreq=110&centsTolerance=5&view=strings&duzan=source).
- **Dūzān presets.** The dūzān (the tuning of the open strings) is chosen from a list of presets. Generic presets give two strings a fourth apart, two strings a fifth apart, and four strings tuned in fourths. ʿŪd presets give five-string and six-string ʿūds, each named by its lowest and highest open strings. Instrument presets give the violin with Anglo-European open strings (yegāh, dūgāh, ḥusaynī, jawāb būselīk), the violin with Arabic open strings (yegāh, dūgāh, nawā, muḥayyar) and the cello (qarār rāst, yegāh, dūgāh, ḥusaynī). A custom dūzān sets the open note of each string one by one.
- **The source's own ʿūd.** Ibn Sīnā (1037) describes his own ʿūd, so his two tanāghīm open on that ʿūd, with its strings and dasātīn (frets) named as Ibn Sīnā names them.
- **Dasātīn across the neck.** A dastān (fret) is tied across the whole neck, so the dastān that gives a pitch class on one string also crosses every other string. Where that dastān gives no pitch class of the tanghīm on another string, the dastān is drawn there as a dotted line. For example, in [al-Ṣabbāgh (1954) with the Four strings (fourths) dūzān](https://diarmaqar.net/en/app?tuningSystem=alsabbagh_1954&startingNoteName=rast&refFreq=130.37&centsTolerance=5&view=strings&duzan=four-strings), the dastān that gives sunbuleh/zawāl (12/5, 1515.64 cents) on the kurdān string (2/1, 1200.00 cents) also crosses the ʿushayrān string (27/32, −294.13 cents). On the ʿushayrān string that dastān sounds 81/80 (21.51 cents), which lies 21.51 cents above rāst (1/1, 0.00 cents) and is not a pitch class of al-Ṣabbāgh (1954). So the dastān is drawn as a dotted line on the ʿushayrān string, and hovering the dotted line shows "rāst +21.5¢".
- **Cents tolerance in the strings view.** A dastān that lands within the cents tolerance of a pitch class of the string counts as that pitch class, so the dastān is not drawn as a dotted line. The cents tolerance is set beside the labels and is the same value the jins and maqām tables use.
- **Gaps on hover.** Hovering a division that is a pitch class shows how many cents that division lies above the division before it on the same string.
- **The next string's open note.** On each string, the label of the next string's open note is boxed, which marks where the player can move across to the next string.
- **Stored dawāwīn.** A tanghīm can now store its own pitch classes for dīwān (octave) 0, 2 and 3 where its source gives them, instead of doubling dīwān 1. Ibn Sīnā's two tanāghīm are the first to do so, since the dawāwīn (octaves) of his ʿūd are not exact doubles (octave equivalents) of one another. For example, in Ibn Sīnā (1037) with ʿushayrān as its starting note name, shahnāz (91/36, 1605.44 cents) would be 81/32 (1607.82 cents) if it were an exact double of zīrgūleh (81/64, 407.82 cents), so shahnāz lies 2.38 cents below that position. The documentation explains this in [Tanāghīm Whose Octaves Are Not Exact](https://diarmaqar.net/docs/guide/tuning-systems#tanaghim-whose-octaves-are-not-exact).
- **The view in the page address.** The chosen view and dūzān are kept in the page address, so a shared link opens the same view with the same dūzān. The dūzān also stays chosen when another tanghīm is selected.

## 2026-11-10 — Archive statistics

### Added

- **Statistics page.** The [Statistics page](https://diarmaqar.net/en/statistics), linked from the menu, counts what the archive holds, namely the tanāghīm (tuning systems) and their starting note names, the maqāmāt, ajnās, suyūr, sources and patterns. A table below the counts gives, for each tanghīm and starting note name, how many ajnās and maqāmāt are possible, how many transpositions they have, how many suyūr apply, and how many modulations to maqāmāt and to ajnās are possible. The table can be sorted by any column, and a row can be selected.
- **Always current.** The statistics are computed again before each build of the archive, so they always describe the data being served.
- **Statistics in the API.** The same statistics are served as JSON at [/api/statistics](https://diarmaqar.net/api/statistics).

## 2026-08-11 — Search by name

### Added

- **Search by name.** The lists of tanāghīm (tuning systems), ajnās and maqāmāt in the archive can now be searched by name. A search matches the start of any word in a name, so "kurd" finds maqām kurd, maqām athar kurd and maqām ḥijāz kār kurd.
- **What a search ignores.** A search ignores diacritics, the ʿayn and hamza marks, Arabic vowel marks, the words maqām and jins, and the article al-. So "sabbagh" finds maqām ḥijāz kār kurd (al-Ṣabbāgh).
- **Both scripts.** A search matches both the transliterated name and the Arabic name, so the same search works in any interface language.

## 2026-08-03 — Online launch

The Digital Arabic Maqām Archive was launched online in a session held on Zoom on 3 August 2026, from 6 to 8 pm Beirut time (5 to 7 pm CET). The session was announced in [AUB's announcement of the launch](https://www.aub.edu.lb/msfea/news/Pages/Music-Intelligence-Lab-Launches-the-Digital-Arabic-Maq%C4%81m-Archive.aspx).

## 2026-07-21 — Launch at the American University of Beirut

The Music Intelligence Lab launched the Digital Arabic Maqām Archive at the American University of Beirut (AUB) on 21 July 2026. AUB published [an announcement of the launch](https://www.aub.edu.lb/msfea/news/Pages/Music-Intelligence-Lab-Launches-the-Digital-Arabic-Maq%C4%81m-Archive.aspx).
